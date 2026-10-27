"""`preflight`: the command line surface. Exit codes: 0 healthy, 1 findings at or above
--fail-on, 2 usage error or bad reference, 3 chain unreachable."""

from __future__ import annotations

import sys
from contextlib import nullcontext
from collections.abc import Callable
from enum import StrEnum
from typing import Annotated

import typer
from pydantic import BaseModel
from rich.console import Console

from . import __version__, render
from .core import validate
from .core.chain.network import ChainUnreachable, Network
from .core.models import SEVERITY_RANK, Severity

app = typer.Typer(
    help="Preflight explains why your Bittensor neuron earns zero and lets you try a transaction before you pay for it",
    no_args_is_help=True,
    add_completion=False,
    rich_markup_mode="rich",
)
console = Console(highlight=False)
err = Console(stderr=True, highlight=False)

NetworkOpt = Annotated[
    str, typer.Option("--network", "-n", help="local, test, finney or a ws:// endpoint", envvar="PREFLIGHT_NETWORK")
]
JsonOpt = Annotated[bool, typer.Option("--json", help="Print machine-readable JSON")]


class FailOn(StrEnum):
    critical = "critical"
    high = "high"
    medium = "medium"
    info = "info"
    never = "never"


def emit(model: BaseModel, as_json: bool, show: Callable[[], None]) -> None:
    if as_json:
        sys.stdout.write(model.model_dump_json(indent=2) + "\n")
    else:
        show()


def run[T](action: Callable[[], T]) -> T:
    """Map failures to exit codes with a one-line reason instead of a traceback."""
    try:
        return action()
    except ChainUnreachable as error:
        err.print(f"[red]Chain unreachable:[/red] {error}")
        raise typer.Exit(3) from error
    except (validate.InvalidInput, ValueError, LookupError) as error:
        err.print(f"[red]{error}[/red]")
        raise typer.Exit(2) from error


@app.command()
def doctor(
    hotkey: Annotated[str, typer.Argument(help="Hotkey ss58 address")],
    netuid: Annotated[int | None, typer.Option("--netuid", help="Only this subnet; default: every subnet the hotkey is on")] = None,
    network: NetworkOpt = "finney",
    probe: Annotated[bool, typer.Option("--probe", help="Open a TCP connection to the hotkey's own advertised axon")] = False,
    block: Annotated[int | None, typer.Option("--block", help="Diagnose at a past block")] = None,
    as_json: JsonOpt = False,
    fail_on: Annotated[FailOn, typer.Option("--fail-on", help="Exit 1 when a finding is at or above this severity")] = FailOn.never,
    brief: Annotated[bool, typer.Option("--brief", help="Hide evidence tables")] = False,
) -> None:
    """Explain why a miner or validator earns what it earns, with the fix"""
    from .core.doctor.engine import diagnose

    def go():
        key = validate.ss58(hotkey)
        net = Network.resolve(network)
        with console.status("Reading the chain", spinner="dots") if not as_json else nullcontext():
            return diagnose(net, key, validate.netuid(netuid), probe=probe, block=block)

    report = run(go)
    emit(report, as_json, lambda: render.doctor(console, report, verbose=not brief))
    if fail_on is not FailOn.never:
        threshold = SEVERITY_RANK[Severity(fail_on.value)]
        worst = max((SEVERITY_RANK[f.severity] for d in report.diagnoses for f in d.findings), default=-1)
        if worst >= threshold:
            raise typer.Exit(1)


@app.command()
def tx(
    ref: Annotated[str, typer.Argument(help="Extrinsic hash, block-index like 9376733-28, or pasted error text")],
    network: NetworkOpt = "finney",
    within: Annotated[int, typer.Option("--within", help="Blocks to search back for a hash")] = 300,
    as_json: JsonOpt = False,
) -> None:
    """Decode a transaction and explain why it failed, or explain pasted error text"""
    from .core.tx.debugger import debug, is_tx_ref
    from .core.tx.explain import explain_text

    if not is_tx_ref(ref):
        result = explain_text(ref)
        emit(result, as_json, lambda: render.explanation(console, result))
        if not result.found:
            raise typer.Exit(2)
        return

    def go():
        net = Network.resolve(network)
        with console.status("Finding the extrinsic", spinner="dots") if not as_json else nullcontext():
            return debug(net, ref, window=within)

    report = run(go)
    emit(report, as_json, lambda: render.tx(console, report))


class Action(StrEnum):
    burned_register = "burned_register"
    add_stake = "add_stake"
    remove_stake = "remove_stake"
    set_weights = "set_weights"
    serve_axon = "serve_axon"
    register_network = "register_network"
    start_call = "start_call"


def _floats(text: str | None) -> list[float]:
    return [float(x) for x in text.split(",") if x.strip()] if text else []


@app.command()
def sim(
    action: Annotated[Action, typer.Argument(help="What to try")],
    netuid: Annotated[int | None, typer.Option("--netuid")] = None,
    coldkey: Annotated[str | None, typer.Option("--coldkey", "--as", help="Signing coldkey ss58 (coldkey actions)")] = None,
    hotkey: Annotated[str | None, typer.Option("--hotkey", help="Hotkey ss58 (signer for set_weights and serve_axon)")] = None,
    amount: Annotated[float | None, typer.Option("--amount", help="TAO to stake or alpha to unstake")] = None,
    uids: Annotated[str | None, typer.Option("--uids", help="Comma separated UIDs for set_weights")] = None,
    weights: Annotated[str | None, typer.Option("--weights", help="Comma separated weights for set_weights")] = None,
    ip: Annotated[str | None, typer.Option("--ip")] = None,
    port: Annotated[int | None, typer.Option("--port")] = None,
    balance: Annotated[float | None, typer.Option("--balance", help="Pretend the coldkey holds this much TAO (fork only)")] = None,
    network: NetworkOpt = "finney",
    no_fork: Annotated[bool, typer.Option("--no-fork", help="Predict only, even if a fork is running")] = False,
    as_json: JsonOpt = False,
) -> None:
    """Try a transaction against live state before you spend anything. Never broadcasts"""
    from .core.models import SimRequest
    from .core.sim.engine import simulate

    def go():
        request = SimRequest(
            action=action.value, netuid=netuid, coldkey=coldkey, hotkey=hotkey, amount=amount,
            uids=[int(u) for u in _floats(uids)], weights=_floats(weights), ip=ip, port=port,
            balance_override_tao=balance,
        )  # fmt: skip
        with console.status("Simulating", spinner="dots") if not as_json else nullcontext():
            return simulate(Network.resolve(network), request, use_fork=not no_fork)

    result = run(go)
    emit(result, as_json, lambda: render.sim(console, result))
    if not result.would_succeed:
        raise typer.Exit(1)


@app.command()
def fork(network: NetworkOpt = "finney") -> None:
    """Start a Chopsticks fork so `sim` executes with the real runtime (needs Node and npx)"""
    from .core.sim.fork import ForkUnavailable, start_fork

    try:
        with console.status(f"Forking {network} (first start downloads Chopsticks and warms a cache)", spinner="dots"):
            started = start_fork(Network.resolve(network))
    except ForkUnavailable as error:
        err.print(f"[red]{error}[/red]")
        raise typer.Exit(3) from error
    console.print(f"Fork of {network} at block {started.head():,} serving on {started.url}. Leave it running; `preflight sim` will use it")


@app.command()
def serve(
    port: Annotated[int, typer.Option("--port")] = 7979,
    host: Annotated[str, typer.Option("--host")] = "127.0.0.1",
) -> None:
    """Run the API locally (localnet and custom endpoints enabled) for the web app and scripts"""
    import os

    import uvicorn

    os.environ["PREFLIGHT_LOCAL"] = "1"
    console.print(f"Preflight API on http://{host}:{port}/v1  (docs at /v1/docs). The web app shows a Local network option while this runs")
    uvicorn.run("preflight.api:app", host=host, port=port, log_level="warning")


@app.command()
def mcp() -> None:
    """MCP server over stdio, for Claude and other agents"""
    from .mcp_server import run as serve_mcp

    serve_mcp()


@app.command()
def version() -> None:
    """Print the Preflight version"""
    import bittensor

    console.print(f"preflight {__version__} (bittensor {bittensor.__version__})")


def main() -> None:
    app()


if __name__ == "__main__":
    main()

