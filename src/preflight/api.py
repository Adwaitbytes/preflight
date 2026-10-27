"""HTTP API, versioned under /v1. Same engine and models as the CLI and MCP server.

Hosted mode (the default) only talks to the named public networks: no localnet, no
custom endpoints (that would let anyone point the server at an internal address), and
the axon probe refuses private and loopback targets. `preflight serve` sets
PREFLIGHT_LOCAL=1, which allows `local` and custom endpoints for the developer's own machine.
"""

from __future__ import annotations

import ipaddress
import os
import threading
import time
from collections import OrderedDict, deque
from collections.abc import Callable
from typing import Annotated, Any

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from . import __version__
from .core import validate
from .core.ask import ask as ask_router
from .core.chain.network import ChainUnreachable, Network, client_for
from .core.models import (
    AskAnswer,
    AxonInfo,
    DoctorReport,
    ErrorExplanation,
    LaunchPlan,
    ServiceHealth,
    SimRequest,
    SimResult,
    SubnetCard,
    SubnetDetail,
    TxReport,
)

LOCAL_MODE = os.environ.get("PREFLIGHT_LOCAL") == "1"
RATE_PER_MINUTE = int(os.environ.get("PREFLIGHT_RATE_PER_MINUTE", "60"))
CACHE_SECONDS = 12.0  # one finney block
ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get(
        "PREFLIGHT_ORIGINS",
        "https://preflight-bt.vercel.app,http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if o.strip()
]

app = FastAPI(
    title="Preflight API",
    version=__version__,
    description="Explains why a Bittensor neuron earns zero, decodes failed transactions and simulates extrinsics before you pay",
    docs_url="/v1/docs",
    openapi_url="/v1/openapi.json",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://preflight[a-z0-9-]*\.vercel\.app",
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["content-type"],
    max_age=600,
)


@app.middleware("http")
async def private_network_access(request: Request, call_next: Callable[[Request], Any]) -> Any:
    """Chrome's Private Network Access: a public https page may call this API on 127.0.0.1
    only if the preflight response opts in."""
    response = await call_next(request)
    if LOCAL_MODE and request.headers.get("access-control-request-private-network") == "true":
        response.headers["Access-Control-Allow-Private-Network"] = "true"
    return response


class _Limiter:
    def __init__(self, per_minute: int) -> None:
        self.per_minute = per_minute
        self.hits: dict[str, deque[float]] = {}
        self.lock = threading.Lock()

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        with self.lock:
            window = self.hits.setdefault(key, deque())
            while window and now - window[0] > 60:
                window.popleft()
            if len(window) >= self.per_minute:
                return False
            window.append(now)
            if len(self.hits) > 10_000:
                self.hits.clear()
            return True


class _Cache:
    def __init__(self, ttl: float, size: int = 512) -> None:
        self.ttl = ttl
        self.size = size
        self.items: OrderedDict[str, tuple[float, BaseModel]] = OrderedDict()
        self.lock = threading.Lock()

    def get_or(self, key: str, make: Callable[[], BaseModel]) -> BaseModel:
        now = time.monotonic()
        with self.lock:
            hit = self.items.get(key)
            if hit and now - hit[0] < self.ttl:
                return hit[1]
        value = make()
        with self.lock:
            self.items[key] = (now, value)
            self.items.move_to_end(key)
            while len(self.items) > self.size:
                self.items.popitem(last=False)
        return value


limiter = _Limiter(RATE_PER_MINUTE)
cache = _Cache(CACHE_SECONDS)


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    return forwarded.split(",")[0].strip() or (request.client.host if request.client else "unknown")


@app.middleware("http")
async def rate_limit(request: Request, call_next: Callable[[Request], Any]) -> Any:
    if request.url.path.startswith("/v1/") and request.url.path != "/v1/health" and request.method != "OPTIONS" and not limiter.allow(_client_ip(request)):
        return JSONResponse({"detail": "rate limited: try again in a minute"}, status_code=429)
    return await call_next(request)


@app.exception_handler(ChainUnreachable)
async def unreachable(_: Request, error: ChainUnreachable) -> JSONResponse:
    return JSONResponse({"detail": str(error), "kind": "chain_unreachable"}, status_code=503)


@app.exception_handler(validate.InvalidInput)
async def invalid(_: Request, error: validate.InvalidInput) -> JSONResponse:
    return JSONResponse({"detail": str(error), "kind": "invalid_input"}, status_code=400)


@app.exception_handler(LookupError)
async def not_found(_: Request, error: LookupError) -> JSONResponse:
    return JSONResponse({"detail": str(error), "kind": "not_found"}, status_code=404)


def network_for(name: str) -> Network:
    try:
        network = Network.resolve(name)
    except ValueError as error:
        raise HTTPException(400, str(error)) from error
    if not LOCAL_MODE and network.name in ("local", "custom"):
        raise HTTPException(400, "the hosted API serves finney and test; run `preflight serve` for localnet")
    return network


def _probe_allowed(axon: AxonInfo) -> bool:
    """Hosted mode only probes public addresses: never the server's own network."""
    if LOCAL_MODE:
        return True
    try:
        address = ipaddress.ip_address(axon.ip)
    except ValueError:
        return False
    mapped = getattr(address, "ipv4_mapped", None) or address
    return mapped.is_global


@app.get("/v1/health", response_model=ServiceHealth)
def health() -> ServiceHealth:
    from .core.sim.fork import get_fork

    networks: dict[str, bool] = {}
    for name in (["local"] if LOCAL_MODE else []) + ["finney", "test"]:
        try:
            networks[name] = int(client_for(Network.resolve(name)).block) > 0
        except Exception:  # health reports reachability, it never fails itself
            networks[name] = False
    fork = any(get_fork(Network.resolve(n)) is not None for n in ("finney", "test"))
    return ServiceHealth(ok=any(networks.values()), version=__version__, networks=networks, fork=fork)


@app.get("/v1/doctor/{network}/{hotkey}", response_model=DoctorReport)
def doctor(
    network: str,
    hotkey: str,
    netuid: Annotated[int | None, Query(ge=0, le=validate.MAX_NETUID)] = None,
    probe: bool = False,
) -> DoctorReport:
    from .core.doctor.engine import diagnose

    net = network_for(network)
    key = validate.ss58(hotkey)
    if probe:
        return diagnose(net, key, netuid, probe=True, probe_allowed=_probe_allowed)
    result = cache.get_or(f"doctor:{net.endpoint}:{key}:{netuid}", lambda: diagnose(net, key, netuid))
    assert isinstance(result, DoctorReport)
    return result


@app.get("/v1/tx/{network}/{ref}", response_model=TxReport)
def tx(network: str, ref: str) -> TxReport:
    from .core.tx.debugger import debug, is_tx_ref

    net = network_for(network)
    if not is_tx_ref(ref):
        raise HTTPException(400, "expected a 0x extrinsic hash or block-index such as 9376733-28; POST error text to /v1/explain-error")
    result = cache.get_or(f"tx:{net.endpoint}:{ref.lower()}", lambda: debug(net, ref))
    assert isinstance(result, TxReport)
    return result


class ErrorText(BaseModel):
    text: str


@app.post("/v1/explain-error", response_model=ErrorExplanation)
def explain_error(body: ErrorText) -> ErrorExplanation:
    from .core.tx.explain import explain_text

    if not body.text.strip() or len(body.text) > 20_000:
        raise HTTPException(400, "paste between 1 and 20,000 characters of error output")
    return explain_text(body.text)


@app.post("/v1/sim/{network}", response_model=SimResult)
def sim(network: str, body: SimRequest) -> SimResult:
    from .core.sim.engine import simulate

    return simulate(network_for(network), body)


@app.get("/v1/ask", response_model=AskAnswer)
def ask(q: Annotated[str, Query(min_length=1, max_length=2000)], network: str = "finney") -> AskAnswer:
    return ask_router(q, network_for(network).name)


@app.get("/v1/plan/{network}", response_model=LaunchPlan)
def plan(network: str) -> LaunchPlan:
    from .core.plan.launch import launch_plan

    net = network_for(network)
    result = cache.get_or(f"plan:{net.endpoint}", lambda: launch_plan(net))
    assert isinstance(result, LaunchPlan)
    return result


class _Cards(BaseModel):
    cards: list[SubnetCard]


@app.get("/v1/subnets/{network}", response_model=list[SubnetCard])
def subnets(network: str, health: Annotated[str | None, Query(max_length=400, description="Comma separated netuids to score")] = None) -> list[SubnetCard]:
    from .core.directory.live import subnet_cards

    net = network_for(network)
    wanted = {int(validate.netuid(x) or 0) for x in (health or "").split(",") if x.strip()}
    if len(wanted) > 32:
        raise HTTPException(400, "score at most 32 subnets per request")
    key = f"subnets:{net.endpoint}:{sorted(wanted)}"
    result = cache.get_or(key, lambda: _Cards(cards=subnet_cards(net, wanted)))
    assert isinstance(result, _Cards)
    return result.cards


@app.get("/v1/subnets/{network}/{netuid}", response_model=SubnetDetail)
def subnet(network: str, netuid: int) -> SubnetDetail:
    from .core.directory.live import subnet_detail

    net = network_for(network)
    number = int(validate.netuid(netuid) or 0)
    result = cache.get_or(f"subnet:{net.endpoint}:{number}", lambda: subnet_detail(net, number))
    assert isinstance(result, SubnetDetail)
    return result


@app.get("/v1/find", response_model=list[SubnetCard])
def find(q: Annotated[str, Query(min_length=1, max_length=200)]) -> list[SubnetCard]:
    from .core.directory.catalog import search

    return [SubnetCard(netuid=e.netuid, catalog=e, live=None, health=None) for e in search(q)]
