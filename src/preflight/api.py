"""HTTP API, versioned under /v1. Same engine and models as the CLI and MCP server.

Hosted mode (the default) only talks to the named public networks: no localnet, no
custom endpoints (that would let anyone point the server at an internal address), and
the axon probe refuses private and loopback targets. `preflight serve` sets
PREFLIGHT_LOCAL=1, which allows `local` and custom endpoints for the developer's own machine.
"""

from __future__ import annotations

import hmac
import ipaddress
import os
import threading
import time
from collections import OrderedDict, deque
from collections.abc import Callable
from typing import Annotated, Any, Literal

from fastapi import FastAPI, HTTPException, Path, Query, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from . import __version__
from .core import store, validate
from .core.ask import ask as ask_router
from .core.chain.network import ChainUnreachable, Network, client_for, gather
from .core.models import (
    AskAnswer,
    AxonInfo,
    DoctorReport,
    ErrorExplanation,
    FleetReport,
    Health,
    HealthScores,
    IncentiveChange,
    LaunchPlan,
    LiveFeed,
    MinerEconomics,
    NeuronHistory,
    ServiceHealth,
    SimRequest,
    SimResult,
    SubnetCard,
    SubnetDetail,
    TxReport,
    Weather,
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

class _Lifespan:
    """Starts the background prefetch when the server starts."""

    def __init__(self, _: FastAPI) -> None:
        pass

    async def __aenter__(self) -> None:
        prefetch()

    async def __aexit__(self, *_: object) -> None:
        return None


app = FastAPI(
    lifespan=_Lifespan,
    title="Preflight API",
    version=__version__,
    description="Explains why a Bittensor neuron earns zero, decodes failed transactions and simulates extrinsics before you pay",
    docs_url="/v1/docs",
    openapi_url="/v1/openapi.json",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://preflight[a-z0-9-]*\.vercel\.app|http://(localhost|127\.0\.0\.1)(:\d+)?",
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
    """Stale while revalidate: a fresh entry is served as is; an expired one is still served
    instantly while one background refresh replaces it. Only a cold key waits for the chain."""

    def __init__(self, size: int = 512) -> None:
        self.size = size
        self.items: OrderedDict[str, tuple[float, BaseModel]] = OrderedDict()
        self.refreshing: set[str] = set()
        self.lock = threading.Lock()

    def _store(self, key: str, value: BaseModel) -> None:
        with self.lock:
            self.items[key] = (time.monotonic(), value)
            self.items.move_to_end(key)
            while len(self.items) > self.size:
                self.items.popitem(last=False)

    def _refresh(self, key: str, make: Callable[[], BaseModel]) -> None:
        try:
            self._store(key, make())
        except Exception:  # keep serving the stale value; the next request retries
            pass
        finally:
            with self.lock:
                self.refreshing.discard(key)

    def peek(self, key: str) -> BaseModel | None:
        with self.lock:
            hit = self.items.get(key)
        return hit[1] if hit else None

    def warm(self, key: str, make: Callable[[], BaseModel]) -> None:
        """Compute in the background once; concurrent callers do not start duplicates."""
        with self.lock:
            if key in self.refreshing:
                return
            self.refreshing.add(key)
        threading.Thread(target=self._refresh, args=(key, make), daemon=True).start()

    def get_or(self, key: str, make: Callable[[], BaseModel], ttl: float = CACHE_SECONDS, stale: float = 0.0) -> BaseModel:
        now = time.monotonic()
        with self.lock:
            hit = self.items.get(key)
            if hit and now - hit[0] < ttl:
                return hit[1]
            if hit and now - hit[0] < ttl + stale:
                if key not in self.refreshing:
                    self.refreshing.add(key)
                    threading.Thread(target=self._refresh, args=(key, make), daemon=True).start()
                return hit[1]
        value = make()
        self._store(key, value)
        return value


limiter = _Limiter(RATE_PER_MINUTE)
chat_limiter = _Limiter(12)
TELEGRAM_WEBHOOK = "/v1/telegram/webhook"
cache = _Cache()
HEALTH_TTL = 15.0
DIRECTORY_TTL = 60.0
DIRECTORY_STALE = 3600.0


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    return forwarded.split(",")[0].strip() or (request.client.host if request.client else "unknown")


@app.middleware("http")
async def rate_limit(request: Request, call_next: Callable[[Request], Any]) -> Any:
    # Telegram's few servers carry every chat, so the bot limits per chat instead of per IP.
    exempt = request.url.path in ("/v1/health", TELEGRAM_WEBHOOK) or request.method == "OPTIONS"
    if request.url.path.startswith("/v1/") and not exempt and not limiter.allow(_client_ip(request)):
        return JSONResponse({"detail": "rate limited: try again in a minute"}, status_code=429)
    return await call_next(request)


@app.exception_handler(ChainUnreachable)
async def unreachable(_: Request, error: ChainUnreachable) -> JSONResponse:
    return JSONResponse({"detail": str(error), "kind": "chain_unreachable"}, status_code=503)


@app.exception_handler(validate.InvalidInput)
async def invalid(_: Request, error: validate.InvalidInput) -> JSONResponse:
    return JSONResponse({"detail": str(error), "kind": "invalid_input"}, status_code=400)


@app.exception_handler(RequestValidationError)
async def unprocessable(_: Request, error: RequestValidationError) -> JSONResponse:
    first = error.errors()[0] if error.errors() else {}
    where = ".".join(str(part) for part in first.get("loc", ()) if part not in ("body", "query", "path"))
    message = f"{where}: {first.get('msg', 'invalid input')}" if where else str(first.get("msg", "invalid input"))
    return JSONResponse({"detail": message, "kind": "invalid_input"}, status_code=422)


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


def _health() -> ServiceHealth:
    from .core.sim.fork import get_fork

    names = (["local"] if LOCAL_MODE else []) + ["finney", "test"]

    def reachable(name: str) -> bool:
        try:
            return int(client_for(Network.resolve(name)).block) > 0
        except Exception:  # health reports reachability, it never fails itself
            return False

    networks = gather({name: (lambda name=name: reachable(name)) for name in names})
    fork = any(get_fork(Network.resolve(n)) is not None for n in ("finney", "test"))
    return ServiceHealth(ok=any(networks.values()), version=__version__, networks=networks, fork=fork)


@app.get("/v1/health", response_model=ServiceHealth)
def health() -> ServiceHealth:
    result = cache.get_or("health", _health, HEALTH_TTL, HEALTH_TTL * 4)
    assert isinstance(result, ServiceHealth)
    return result


NO_CDN_QUERY = ("fresh",)
CDN_SECONDS = {"/v1/live": 3, "/v1/weather": 12, "/v1/change": 60, "/v1/economics": 60, "/v1/fleet": 12, "/v1/scores": 600, "/v1/subnets": 60, "/v1/plan": 60, "/v1/find": 300, "/v1/history": 60, "/v1/doctor": 12, "/v1/tx": 3600, "/v1/health": 15}


@app.middleware("http")
async def cdn_cache(request: Request, call_next: Callable[[Request], Any]) -> Any:
    """Let Vercel's edge serve repeat reads without waking the function. Errors never cache."""
    response = await call_next(request)
    if request.method == "GET" and response.status_code == 200 and not any(q in request.query_params for q in NO_CDN_QUERY):
        for prefix, seconds in CDN_SECONDS.items():
            if request.url.path.startswith(prefix):
                # The live feed is only useful fresh: a stale window would replay old blocks.
                stale = seconds if prefix == "/v1/live" else seconds * 60
                response.headers["Cache-Control"] = f"public, max-age=0, s-maxage={seconds}, stale-while-revalidate={stale}"
                break
    return response


def _quiet(action: Callable[[], object]) -> None:
    try:
        action()
    except Exception:  # prefetch is best effort
        return


def prefetch() -> None:
    """Warm the slow, shared answers so the first visitor does not pay for them."""
    from .core.directory.live import subnet_cards
    from .core.plan.launch import launch_plan

    def warm() -> None:
        net = Network.resolve("finney")
        for key, make in (
            ("subnets:" + net.endpoint + ":[]", lambda: _Cards(cards=subnet_cards(net, set()))),
            ("plan:" + net.endpoint, lambda: launch_plan(net)),
            ("scores:" + net.endpoint, lambda: _scores(net)),
        ):
            try:
                cache.get_or(key, make, DIRECTORY_TTL, DIRECTORY_STALE)
            except Exception:  # a warm-up failure only means the first visitor waits
                continue
        if LOCAL_MODE:
            # Locally there is no CDN, so warm every curated subnet's page too, a few at a time.
            from .core.directory.catalog import load
            from .core.directory.live import subnet_detail

            netuids = [entry.netuid for entry in load()]
            for start in range(0, len(netuids), 4):
                batch = netuids[start : start + 4]
                gather(
                    {
                        str(n): (lambda n=n: _quiet(lambda: cache.get_or(f"subnet:{net.endpoint}:{n}", lambda: subnet_detail(net, n), DIRECTORY_TTL, DIRECTORY_STALE)))
                        for n in batch
                    }
                )

    threading.Thread(target=warm, name="preflight-prefetch", daemon=True).start()


@app.get("/v1/doctor/{network}/{hotkey}", response_model=DoctorReport)
def doctor(
    network: str,
    hotkey: str,
    netuid: Annotated[int | None, Query(ge=0, le=validate.MAX_NETUID)] = None,
    probe: bool = False,
    fresh: Annotated[bool, Query(description="Skip the cache, for Run again after a fix")] = False,
) -> DoctorReport:
    from .core.doctor.engine import diagnose

    net = network_for(network)
    key = validate.ss58(hotkey)
    store.count("doctor", net.name)
    # A local chain makes a block every 0.25 s and its state is what the user just changed,
    # so a cached answer there is always wrong: never cache local, and never when asked fresh.
    if probe or fresh or net.name in ("local", "custom"):
        return diagnose(net, key, netuid, probe=probe, probe_allowed=_probe_allowed)
    result = cache.get_or(f"doctor:{net.endpoint}:{key}:{netuid}", lambda: diagnose(net, key, netuid), CACHE_SECONDS, 120.0)
    assert isinstance(result, DoctorReport)
    return result


@app.get("/v1/history/{network}/{hotkey}", response_model=NeuronHistory)
def neuron_history(network: str, hotkey: str, netuid: Annotated[int, Query(ge=0, le=validate.MAX_NETUID)]) -> NeuronHistory:
    from .core.doctor.history import history

    net = network_for(network)
    key = validate.ss58(hotkey)
    result = cache.get_or(f"history:{net.endpoint}:{key}:{netuid}", lambda: history(net, key, netuid), DIRECTORY_TTL, DIRECTORY_STALE)
    assert isinstance(result, NeuronHistory)
    return result


@app.get("/v1/tx/{network}/{ref}", response_model=TxReport)
def tx(network: str, ref: str) -> TxReport:
    from .core.tx.debugger import debug, is_tx_ref

    net = network_for(network)
    if not is_tx_ref(ref):
        raise HTTPException(400, "expected a 0x extrinsic hash or block-index such as 9376733-28; POST error text to /v1/explain-error")
    store.count("tx", net.name)
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
    store.count("explain", "any")
    return explain_text(body.text)


@app.post("/v1/sim/{network}", response_model=SimResult)
def sim(network: str, body: SimRequest) -> SimResult:
    from .core.sim.engine import simulate

    net = network_for(network)
    store.count("sim", net.name)
    return simulate(net, body)


@app.get("/v1/ask", response_model=AskAnswer)
def ask(q: Annotated[str, Query(min_length=1, max_length=2000)], network: str = "finney") -> AskAnswer:
    return ask_router(q, network_for(network).name)


@app.get("/v1/plan/{network}", response_model=LaunchPlan)
def plan(network: str) -> LaunchPlan:
    from .core.plan.launch import launch_plan

    net = network_for(network)
    result = cache.get_or(f"plan:{net.endpoint}", lambda: launch_plan(net), DIRECTORY_TTL, DIRECTORY_STALE)
    assert isinstance(result, LaunchPlan)
    return result


class _Cards(BaseModel):
    cards: list[SubnetCard]


SCORES_TTL = 600.0


def _scores(net: Network) -> HealthScores:
    from .core.chain.network import pin
    from .core.directory.bulk import health_all

    pinned = pin(net)
    return HealthScores(chain=pinned.ref, scores={str(k): v for k, v in health_all(pinned).items()})


@app.get("/v1/scores/{network}", response_model=HealthScores)
def scores(network: str) -> HealthScores:
    """Every subnet's health score. About 40 s cold, so the directory loads cards first and
    fills the rings from this; the CDN and the server cache keep it warm."""
    net = network_for(network)
    result = cache.get_or(f"scores:{net.endpoint}", lambda: _scores(net), SCORES_TTL, DIRECTORY_STALE)
    assert isinstance(result, HealthScores)
    return result


def _cached_scores(net: Network) -> dict[str, Health]:
    """Scores already computed, without waiting; starts a computation if none is cached."""
    key = f"scores:{net.endpoint}"
    hit = cache.peek(key)
    if hit is None:
        cache.warm(key, lambda: _scores(net))
        return {}
    assert isinstance(hit, HealthScores)
    return hit.scores


@app.get("/v1/subnets/{network}", response_model=list[SubnetCard])
def subnets(network: str, health: Annotated[str | None, Query(max_length=400, description="Comma separated netuids to score")] = None) -> list[SubnetCard]:
    from .core.directory.live import subnet_cards

    net = network_for(network)
    wanted = {int(validate.netuid(x) or 0) for x in (health or "").split(",") if x.strip()}
    if len(wanted) > 32:
        raise HTTPException(400, "score at most 32 subnets per request")
    key = f"subnets:{net.endpoint}:{sorted(wanted)}"
    result = cache.get_or(key, lambda: _Cards(cards=subnet_cards(net, wanted)), DIRECTORY_TTL, DIRECTORY_STALE)
    assert isinstance(result, _Cards)
    known = _cached_scores(net)
    return [c if c.health is not None or str(c.netuid) not in known else c.model_copy(update={"health": known[str(c.netuid)]}) for c in result.cards]


@app.get("/v1/subnets/{network}/{netuid}", response_model=SubnetDetail)
def subnet(network: str, netuid: int) -> SubnetDetail:
    from .core.directory.live import subnet_detail

    net = network_for(network)
    number = int(validate.netuid(netuid) or 0)
    result = cache.get_or(f"subnet:{net.endpoint}:{number}", lambda: subnet_detail(net, number), DIRECTORY_TTL, DIRECTORY_STALE)
    assert isinstance(result, SubnetDetail)
    return result


@app.get("/v1/find", response_model=list[SubnetCard])
def find(q: Annotated[str, Query(min_length=1, max_length=200)]) -> list[SubnetCard]:
    from .core.directory.catalog import search

    return [SubnetCard(netuid=e.netuid, catalog=e, live=None, health=None) for e in search(q)]


HOUSE_SINCE = "2026-10-27"


class HouseStats(BaseModel):
    diagnoses: int
    errors: int
    simulations: int
    builders: int
    since: str


class HouseJoin(BaseModel):
    id: Annotated[str, Field(min_length=8, max_length=64, pattern=r"^[A-Za-z0-9_-]+$")]


@app.get("/v1/house", response_model=HouseStats)
def house() -> HouseStats:
    try:
        result = cache.get_or("house", lambda: HouseStats(**store.house_totals(HOUSE_SINCE)), 10.0, 300.0)
        assert isinstance(result, HouseStats)
        return result
    except store.StoreUnavailable as error:
        raise HTTPException(503, f"counters unavailable: {error}") from error


@app.post("/v1/house/join", response_model=HouseStats)
def house_join(body: HouseJoin) -> HouseStats:
    """Opt in from the /house page with a random browser id. Nothing about the person is stored."""
    try:
        store.join_house(body.id)
        return HouseStats(**store.house_totals(HOUSE_SINCE))
    except store.StoreUnavailable as error:
        raise HTTPException(503, f"counters unavailable: {error}") from error


class ShareRequest(BaseModel):
    kind: Literal["doctor", "tx", "sim"]
    payload: dict[str, Any]


class Shared(BaseModel):
    id: str
    kind: str
    network: str
    subject: str
    block: int
    payload: dict[str, Any]
    created_at: str


@app.post("/v1/reports", response_model=Shared)
def share(body: ShareRequest) -> Shared:
    """Store a report the user chose to share; it gets a short id for /d/<id>."""
    model: DoctorReport | TxReport | SimResult
    if body.kind == "doctor":
        model = DoctorReport.model_validate(body.payload)
        subject = model.hotkey
    elif body.kind == "tx":
        model = TxReport.model_validate(body.payload)
        subject = model.ref
    else:
        model = SimResult.model_validate(body.payload)
        subject = model.action
    try:
        report_id = store.save_report(body.kind, model.chain.network, subject, model.chain.block, model.model_dump(mode="json"))
        found = store.load_report(report_id)
    except store.StoreUnavailable as error:
        raise HTTPException(503, f"sharing unavailable: {error}") from error
    assert found is not None
    return _shared(found)


def _shared(row: dict[str, Any]) -> Shared:
    return Shared(
        id=str(row["id"]),
        kind=str(row["kind"]),
        network=str(row["network"]),
        subject=str(row["subject"]),
        block=int(row["block"]),
        payload=dict(row["payload"]),
        created_at=str(row["created_at"]),
    )


@app.get("/v1/reports/{report_id}", response_model=Shared)
def shared_report(report_id: Annotated[str, Path(min_length=4, max_length=32, pattern=r"^[A-Za-z0-9]+$")]) -> Shared:
    try:
        found = store.load_report(report_id)
    except store.StoreUnavailable as error:
        raise HTTPException(503, f"sharing unavailable: {error}") from error
    if found is None:
        raise HTTPException(404, "no shared report with that id")
    return _shared(found)


class WatchRequest(BaseModel):
    network: Literal["finney", "test"]
    hotkey: str
    netuid: Annotated[int, Field(ge=0, le=validate.MAX_NETUID)]


class WatchCreated(BaseModel):
    id: str
    link_code: str
    bot: str | None
    instructions: str


@app.post("/v1/watch", response_model=WatchCreated)
def watch(body: WatchRequest) -> WatchCreated:
    """Create a watch and return a one-time code; sending `/start <code>` to the bot links the chat.
    No sign-in, and the only thing stored is the public hotkey being watched."""
    from .core.watch import telegram

    key = validate.ss58(body.hotkey)
    try:
        created = store.add_watch(body.network, key, body.netuid, None, {})
    except store.StoreUnavailable as error:
        raise HTTPException(503, f"watches unavailable: {error}") from error
    bot = telegram.bot_username()
    code = str(created["link_code"])
    target = f"@{bot}" if bot else "the Preflight Alerts bot"
    return WatchCreated(id=str(created["id"]), link_code=code, bot=bot, instructions=f"Send /start {code} to {target} on Telegram")


@app.get("/v1/fleet/{network}/{coldkey}", response_model=FleetReport)
def fleet(network: str, coldkey: str) -> FleetReport:
    """Every hotkey a coldkey owns, diagnosed on every subnet, worst first."""
    from .core.doctor.fleet import fleet as run

    net = network_for(network)
    key = validate.ss58(coldkey, "coldkey")
    store.count("doctor", net.name)
    result = cache.get_or(f"fleet:{net.endpoint}:{key}", lambda: run(net, key), CACHE_SECONDS, 120.0)
    assert isinstance(result, FleetReport)
    return result


@app.get("/v1/economics/{network}/{netuid}", response_model=MinerEconomics)
def economics(network: str, netuid: int) -> MinerEconomics:
    """What mining this subnet pays today, the emission needed to keep a seat, and payback."""
    from .core.plan.economics import economics as run

    net = network_for(network)
    number = int(validate.netuid(netuid) or 0)
    result = cache.get_or(f"economics:{net.endpoint}:{number}", lambda: run(net, number), DIRECTORY_TTL, DIRECTORY_STALE)
    assert isinstance(result, MinerEconomics)
    return result


@app.get("/v1/live/{network}", response_model=LiveFeed)
def live(
    network: str,
    after: Annotated[int | None, Query(ge=0, description="Return blocks after this one, up to the head")] = None,
    limit: Annotated[int, Query(ge=1, le=12)] = 8,
) -> LiveFeed:
    """Every extrinsic in recent blocks as a plain sentence. Poll with `after` set to the last
    block you have; each block is decoded once and cached."""
    from .core.live.feed import feed

    net = network_for(network)
    key = f"live:{net.endpoint}:{after}:{limit}"
    result = cache.get_or(key, lambda: feed(net, after, limit), 4.0, 0.0)
    assert isinstance(result, LiveFeed)
    return result


@app.get("/v1/weather/{network}", response_model=Weather)
def network_weather(network: str, window: Annotated[int, Query(ge=10, le=120, description="Blocks to look back over")] = 60) -> Weather:
    """What is failing on chain right now: errors grouped with the subnets they hit, explained."""
    from .core.live.weather import weather

    net = network_for(network)
    result = cache.get_or(f"weather:{net.endpoint}:{window}", lambda: weather(net, window), CACHE_SECONDS, 60.0)
    assert isinstance(result, Weather)
    return result


@app.get("/v1/change/{network}/{hotkey}", response_model=IncentiveChange)
def incentive_change(
    network: str,
    hotkey: str,
    netuid: Annotated[int, Query(ge=1, le=validate.MAX_NETUID)],
    epochs: Annotated[int, Query(ge=1, le=48, description="How many epochs back to compare against")] = 1,
) -> IncentiveChange:
    """Why a UID's incentive moved: the validators whose stake weighted support changed most."""
    from .core.doctor.change import explain_change

    net = network_for(network)
    key = validate.ss58(hotkey)
    store.count("doctor", net.name)
    if net.name in ("local", "custom"):
        return explain_change(net, key, netuid, epochs=epochs)
    result = cache.get_or(f"change:{net.endpoint}:{key}:{netuid}:{epochs}", lambda: explain_change(net, key, netuid, epochs=epochs), CACHE_SECONDS * 5, 300.0)
    assert isinstance(result, IncentiveChange)
    return result


@app.post(TELEGRAM_WEBHOOK, include_in_schema=False)
async def telegram_webhook(request: Request) -> dict[str, bool]:
    """Telegram posts every message to the bot here. Only Telegram knows the secret, set with
    `preflight bot webhook`; anything else gets a 404 as if the route did not exist, before the
    body is even read."""
    from starlette.concurrency import run_in_threadpool

    from . import bot
    from .core.watch.telegram import TelegramUnavailable

    expected = os.environ.get("TELEGRAM_WEBHOOK_SECRET", "")
    given = request.headers.get("x-telegram-bot-api-secret-token", "")
    if not expected or not hmac.compare_digest(given.encode(), expected.encode()):
        raise HTTPException(404, "Not Found")
    try:
        update = await request.json()
    except ValueError:
        return {"ok": False}
    if not isinstance(update, dict):
        return {"ok": False}
    try:
        answered = await run_in_threadpool(bot.handle_update, update, chat_limiter.allow)
    except TelegramUnavailable as error:
        # A 200 stops Telegram retrying an answer it could not deliver; the failure is logged.
        bot.log.warning("Telegram reply failed: %s", error)
        return {"ok": False}
    return {"ok": answered}
