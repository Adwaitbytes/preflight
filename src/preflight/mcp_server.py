"""MCP server over stdio: the user's own Claude becomes the Bittensor copilot.

Install: claude mcp add preflight -- uvx --from git+https://github.com/Adwaitbytes/preflight preflight mcp
Every tool returns the same JSON the HTTP API returns, plus a one line summary.
"""

from __future__ import annotations

from typing import Any

from mcp.server.mcpserver import MCPServer
from pydantic import BaseModel

from . import __version__
from .core import validate
from .core.chain.network import ChainUnreachable, Network
from .core.models import SimAction, SimRequest

server = MCPServer(
    "preflight",
    version=__version__,
    instructions=(
        "Preflight reads live Bittensor chain state and explains it. Use diagnose_neuron when someone asks why a "
        "miner or validator earns zero or is failing; explain_incentive_change when its earnings moved; "
        "network_weather for what is failing on chain right now; explain_extrinsic for a failed transaction hash or "
        "block-index; explain_error for pasted error text; simulate before telling anyone to submit a "
        "transaction; subnet_health, launch_plan and find_subnet for subnet questions. Quote the fix commands "
        "exactly as returned. Mainnet is read only: nothing here signs or submits."
    ),
)


def _result(summary: str, model: BaseModel) -> dict[str, Any]:
    return {"summary": summary, "result": model.model_dump(mode="json")}


def _failure(error: Exception) -> dict[str, Any]:
    kind = "chain_unreachable" if isinstance(error, ChainUnreachable) else "invalid_input"
    return {"summary": f"{kind}: {error}", "error": str(error), "kind": kind}


@server.tool()
def diagnose_neuron(hotkey: str, netuid: int | None = None, network: str = "finney") -> dict[str, Any]:
    """Explain why a hotkey earns what it earns on each subnet it is registered on (or one netuid), with
    evidence read from chain and the exact fix command. network: finney, test, local or a ws:// endpoint."""
    from .core.doctor.engine import diagnose

    try:
        report = diagnose(Network.resolve(network), validate.ss58(hotkey), validate.netuid(netuid))
    except (ChainUnreachable, ValueError) as error:
        return _failure(error)
    return _result(f"{report.verdict.value}: {report.headline}", report)


@server.tool()
def explain_extrinsic(ref: str, network: str = "finney") -> dict[str, Any]:
    """Decode a transaction by 0x hash (searched in the last 300 blocks) or block-index like 9376733-28,
    and explain its failure using the chain state it was checked against."""
    from .core.tx.debugger import debug

    try:
        report = debug(Network.resolve(network), ref)
    except (ChainUnreachable, ValueError, LookupError) as error:
        return _failure(error)
    status = "succeeded" if report.success else f"failed with {report.failure.error if report.failure else 'an error'}"
    return _result(f"{report.pallet}.{report.call} at block {report.block} {status}", report)


@server.tool()
def explain_error(text: str) -> dict[str, Any]:
    """Explain pasted btcli or SDK error output, a Python traceback, or a bare error name such as
    SettingWeightsTooFast, including known traps that the official catalog does not cover."""
    from .core.tx.explain import explain_text

    result = explain_text(text)
    return _result(result.title, result)


@server.tool()
def simulate(
    action: SimAction,
    netuid: int | None = None,
    coldkey: str | None = None,
    hotkey: str | None = None,
    amount: float | None = None,
    uids: list[int] | None = None,
    weights: list[float] | None = None,
    ip: str | None = None,
    port: int | None = None,
    balance_override_tao: float | None = None,
    network: str = "finney",
) -> dict[str, Any]:
    """Try an action without paying: burned_register, add_stake, remove_stake, set_weights, serve_axon,
    register_network or start_call. Returns whether it would succeed, the error it would hit, fees and
    effects. Executes on a Chopsticks fork when one is running, otherwise predicts from live state."""
    from .core.sim.engine import simulate as run

    try:
        request = SimRequest(
            action=action, netuid=netuid, coldkey=coldkey, hotkey=hotkey, amount=amount, uids=uids or [],
            weights=weights or [], ip=ip, port=port, balance_override_tao=balance_override_tao,
        )  # fmt: skip
        result = run(Network.resolve(network), request)
    except (ChainUnreachable, ValueError) as error:
        return _failure(error)
    verdict = "would succeed" if result.would_succeed else f"would fail with {result.failure.error if result.failure else 'an error'}"
    return _result(f"{action} {verdict} ({result.mode})", result)


@server.tool()
def subnet_health(netuid: int, network: str = "finney") -> dict[str, Any]:
    """Health score 0 to 100 with its factors, hyperparameters explained, and the subnet's catalog entry."""
    from .core.directory.live import subnet_detail

    try:
        detail = subnet_detail(Network.resolve(network), int(validate.netuid(netuid) or 0))
    except (ChainUnreachable, ValueError, LookupError) as error:
        return _failure(error)
    score = detail.card.health.score if detail.card.health else "n/a"
    return _result(f"SN{netuid} health {score}/100", detail)


@server.tool()
def diagnose_fleet(coldkey: str, network: str = "finney") -> dict[str, Any]:
    """Diagnose every hotkey a coldkey owns on every subnet it is registered on, worst first, with
    each seat's worst finding and its emission in TAO a day at today's prices."""
    from .core.doctor.fleet import fleet

    try:
        report = fleet(Network.resolve(network), validate.ss58(coldkey, "coldkey"))
    except (ChainUnreachable, ValueError) as error:
        return _failure(error)
    return _result(report.headline, report)


@server.tool()
def mining_economics(netuid: int, network: str = "finney") -> dict[str, Any]:
    """Should someone mine this subnet? What earning miners make a day at today's prices, how many
    earn at all, the emission needed to keep a seat after immunity, seat turnover and payback."""
    from .core.plan.economics import economics

    try:
        result = economics(Network.resolve(network), int(validate.netuid(netuid) or 0))
    except (ChainUnreachable, ValueError, LookupError) as error:
        return _failure(error)
    return _result(f"{result.verdict}: {result.headline}", result)


@server.tool()
def recent_activity(network: str = "finney", blocks: int = 8, netuid: int | None = None, address: str | None = None) -> dict[str, Any]:
    """What just happened on chain: every extrinsic in the last few blocks (up to 12) as a plain
    sentence, with failures and their error names. Filter by subnet or by an address."""
    from .core.live.feed import feed

    try:
        result = feed(Network.resolve(network), None, max(1, min(blocks, 12)))
    except (ChainUnreachable, ValueError) as error:
        return _failure(error)
    activities = [
        a
        for b in result.blocks
        for a in b.activities
        if (netuid is None or a.netuid == netuid) and (not address or address == a.signer or address[:6] in a.summary)
    ]
    failed = sum(1 for a in activities if not a.success)
    return {
        "summary": f"{len(activities)} activities in blocks {result.blocks[0].number} to {result.head}, {failed} failed",
        "result": [a.model_dump(mode="json") for a in activities],
    }


@server.tool()
def explain_incentive_change(hotkey: str, netuid: int, network: str = "finney", epochs: int = 1) -> dict[str, Any]:
    """Why did this hotkey's incentive change? Compares the UID now against `epochs` epochs ago and names
    the validators whose stake weighted support moved it most, and what each did (stopped weighting,
    cut weight, went stale, lost stake)."""
    from .core.doctor.change import explain_change

    try:
        result = explain_change(Network.resolve(network), validate.ss58(hotkey), int(validate.netuid(netuid) or 0), epochs=max(1, min(epochs, 48)))
    except (ChainUnreachable, ValueError, LookupError) as error:
        return _failure(error)
    return _result(result.headline, result)


@server.tool()
def network_weather(network: str = "finney", blocks: int = 60) -> dict[str, Any]:
    """What is failing on chain right now: failed extrinsics over the last `blocks` blocks (up to 120)
    grouped by error, with the subnets each hits, what it means, the fix, and one example to open."""
    from .core.live.weather import weather

    try:
        result = weather(Network.resolve(network), max(10, min(blocks, 120)))
    except (ChainUnreachable, ValueError) as error:
        return _failure(error)
    return _result(result.headline, result)


@server.tool()
def launch_plan(network: str = "finney") -> dict[str, Any]:
    """What launching a subnet costs right now, which subnet would be replaced at the cap, the rate limit,
    and the timeline from registration to first emissions in real block numbers."""
    from .core.plan.launch import launch_plan as plan

    try:
        result = plan(Network.resolve(network))
    except (ChainUnreachable, ValueError) as error:
        return _failure(error)
    return _result(f"Lock cost {result.lock_cost_tao:,.2f} TAO", result)


@server.tool()
def find_subnet(query: str) -> dict[str, Any]:
    """Search the curated subnet directory by capability or name (inference, 3D, voice, data, agents...).
    Every entry cites its sources and says whether a public API exists."""
    from .core.directory.catalog import search

    results = search(query)
    return {
        "summary": f"{len(results)} subnets match {query!r}",
        "result": [entry.model_dump(mode="json") for entry in results],
    }


def run() -> None:
    server.run()
