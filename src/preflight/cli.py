"""`preflight`: the command line surface. Exit codes: 0 healthy, 1 findings at or above
--fail-on, 2 usage error or bad reference, 3 chain unreachable."""

from __future__ import annotations

import sys
from collections.abc import Callable
from contextlib import nullcontext
from enum import StrEnum
from typing import Annotated

import typer
from pydantic import BaseModel
from rich.console import Console

from . import __version__, render
from .core import validate
from .core.chain.network import ChainUnreachable, Network
from .core.local import LocalState
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
    with_fork: Annotated[str | None, typer.Option("--fork", help="Also start a Chopsticks fork of this network for real simulation")] = None,
) -> None:
    """Run the API locally (localnet and custom endpoints enabled) for the web app and scripts"""
    import os

    import uvicorn

    os.environ["PREFLIGHT_LOCAL"] = "1"
    if with_fork:
        from .core.sim.fork import ForkUnavailable, start_fork

        try:
            started = start_fork(Network.resolve(with_fork))
            console.print(f"Fork of {with_fork} at block {started.head():,}; warming its cache in the background")
        except ForkUnavailable as error:
            err.print(f"[yellow]No fork, simulations will be predicted:[/yellow] {error}")
    console.print(f"Preflight API on http://{host}:{port}/v1  (docs at /v1/docs). The web app shows a Local network option while this runs")
    uvicorn.run("preflight.api:app", host=host, port=port, log_level="warning")


@app.command()
def mcp() -> None:
    """MCP server over stdio, for Claude and other agents"""
    from .mcp_server import run as serve_mcp

    serve_mcp()


@app.command()
def plan(network: NetworkOpt = "finney", as_json: JsonOpt = False) -> None:
    """What launching a subnet costs now, which subnet it would replace, and the timeline"""
    from .core.plan.launch import launch_plan

    result = run(lambda: launch_plan(Network.resolve(network)))
    emit(result, as_json, lambda: render.plan(console, result))


@app.command()
def subnet(
    netuid: Annotated[int, typer.Argument(help="Subnet netuid")],
    network: NetworkOpt = "finney",
    params: Annotated[bool, typer.Option("--params/--no-params", help="Show the hyperparameter table")] = True,
    as_json: JsonOpt = False,
) -> None:
    """Health score with its factors, every hyperparameter explained, and the catalog entry"""
    from .core.directory.live import subnet_detail

    def go():
        with console.status(f"Reading SN{netuid}", spinner="dots") if not as_json else nullcontext():
            return subnet_detail(Network.resolve(network), int(validate.netuid(netuid) or 0))

    result = run(go)
    emit(result, as_json, lambda: render.subnet(console, result, show_params=params))


@app.command()
def find(
    query: Annotated[str, typer.Argument(help="Capability words, like '3d generation' or 'inference api'")],
    as_json: JsonOpt = False,
) -> None:
    """Search the curated subnet directory; every entry cites its sources"""
    from .core.directory.catalog import search
    from .core.models import SubnetCard

    cards = [SubnetCard(netuid=e.netuid, catalog=e, live=None, health=None) for e in search(query)]
    if as_json:
        sys.stdout.write("[" + ",".join(c.model_dump_json() for c in cards) + "]\n")
        return
    if not cards:
        err.print(f"No subnet in the directory matches {query!r}")
        raise typer.Exit(1)
    render.cards(console, cards)


watch_app = typer.Typer(help="Alerts on Telegram when a neuron breaks (needs DATABASE_URL; TELEGRAM_BOT_TOKEN to deliver)", no_args_is_help=True)
app.add_typer(watch_app, name="watch")


def _store[T](action: Callable[[], T]) -> T:
    from .core import store

    try:
        return action()
    except store.StoreUnavailable as error:
        err.print(f"[red]{error}[/red]. Set DATABASE_URL, for example with `uv run --env-file web/.env.local preflight watch ...`")
        raise typer.Exit(2) from error


@watch_app.command("add")
def watch_add(
    hotkey: Annotated[str, typer.Argument(help="Hotkey ss58 to watch")],
    netuid: Annotated[int, typer.Option("--netuid")],
    network: NetworkOpt = "finney",
    telegram_chat: Annotated[str | None, typer.Option("--telegram", help="Telegram chat id; omit to get a /start code instead")] = None,
) -> None:
    """Watch a hotkey on one subnet"""
    from .core import store
    from .core.watch import telegram

    key = validate.ss58(hotkey)
    net = Network.resolve(network)
    created = _store(lambda: store.add_watch(net.endpoint if net.name == "custom" else net.name, key, int(validate.netuid(netuid) or 0), telegram_chat, {}))
    console.print(f"Watching {key} on SN{netuid} ({network}) as watch [bold]{created['id']}[/bold]")
    if created["link_code"]:
        bot = telegram.bot_username()
        target = f"@{bot}" if bot else "the Preflight Alerts bot"
        console.print(f"Link Telegram: send [bold green]/start {created['link_code']}[/bold green] to {target}")


@watch_app.command("list")
def watch_list(network: Annotated[str | None, typer.Option("--network", "-n")] = None) -> None:
    """List watches and their last known state"""
    from rich.table import Table

    from .core import store

    rows = _store(lambda: store.watches(network))
    table = Table(header_style="dim", box=None, padding=(0, 1))
    for column in ("Id", "Network", "SN", "Hotkey", "Telegram", "Last state"):
        table.add_column(column)
    for r in rows:
        state = r.get("last_state") or {}
        summary = f"UID {state.get('uid')}, block {state.get('block')}, active {state.get('active')}" if state else "not checked yet"
        table.add_row(str(r["id"]), str(r["network"]), str(r["netuid"]), str(r["hotkey"]), "linked" if r.get("chat_id") else f"/start {r.get('link_code')}", summary)
    console.print(table)


@watch_app.command("remove")
def watch_remove(watch_id: Annotated[str, typer.Argument()]) -> None:
    """Stop a watch"""
    from .core import store

    removed = _store(lambda: store.remove_watch(watch_id))
    if not removed:
        err.print(f"No watch {watch_id}")
        raise typer.Exit(2)
    console.print(f"Removed {watch_id}")


@watch_app.command("run")
def watch_run(
    network: Annotated[str | None, typer.Option("--network", "-n", help="Only watches on this network")] = None,
    every: Annotated[float, typer.Option("--every", help="Seconds between rounds; 0 runs once")] = 0,
    dry_run: Annotated[bool, typer.Option("--dry-run", help="Evaluate and print alerts without sending them")] = False,
) -> None:
    """Evaluate every watch: link new chats, diagnose, send fresh alerts"""
    import time

    from .core.watch.worker import run_once

    while True:
        report = _store(lambda: run_once(network, deliver=not dry_run))
        console.print(f"Checked {report.checked} watches, linked {report.linked} chats, {len(report.alerts)} new alerts, {report.delivered} delivered")
        for watch_id, alert in report.alerts:
            console.print(f"  [yellow]{watch_id}[/yellow] {alert.title}: {alert.detail}")
        for problem in report.errors:
            err.print(f"  [red]{problem}[/red]")
        if every <= 0:
            return
        time.sleep(every)


local_app = typer.Typer(help="A throwaway localnet with a working subnet, and ways to break it", no_args_is_help=True)
app.add_typer(local_app, name="local")


def _local_table(state: LocalState) -> None:
    from rich.table import Table

    console.print(f"Localnet {state.endpoint}, runtime {state.runtime_spec}, block {state.block:,}, subnet SN{state.netuid} with tempo {state.tempo}")
    table = Table(header_style="dim", box=None, padding=(0, 1))
    for column in ("Name", "Role", "SN", "UID", "Hotkey", "Axon", "Stake"):
        table.add_column(column)
    for n in state.neurons:
        table.add_row(n.name, n.role, str(n.netuid), "" if n.uid is None else str(n.uid), n.hotkey, n.axon or "", f"{n.stake:,.2f}")
    console.print(table)


def _local[T](action: Callable[[], T]) -> T:
    from .core.chain.harness import ChainError
    from .core.chain.localnet import LocalnetError
    from .core.local import KitError

    try:
        return action()
    except (KitError, LocalnetError) as error:
        err.print(f"[red]{error}[/red]")
        raise typer.Exit(2) from error
    except ChainError as error:
        err.print(f"[red]Localnet chain error:[/red] {error}")
        raise typer.Exit(3) from error


@local_app.command("up")
def local_up(
    miners: Annotated[int, typer.Option("--miners")] = 3,
    validators: Annotated[int, typer.Option("--validators")] = 2,
    tempo: Annotated[int, typer.Option("--tempo")] = 100,
    as_json: JsonOpt = False,
) -> None:
    """Boot a fresh localnet: subnet created, miners served and scored, emissions flowing"""
    from .core.local import up

    with console.status("Starting localnet", spinner="dots") as status:
        state = _local(lambda: up(miners, validators, tempo, progress=lambda m: status.update(m)))
    if as_json:
        sys.stdout.write(state.model_dump_json(indent=2) + "\n")
        return
    _local_table(state)


@local_app.command("down")
def local_down() -> None:
    """Remove the localnet container and forget its dev keys"""
    from .core.local import down

    _local(down)
    console.print("Localnet removed")


@local_app.command("reset")
def local_reset() -> None:
    """A fresh chain with the same shape as the last `local up`"""
    from .core.local import reset

    with console.status("Resetting localnet", spinner="dots") as status:
        state = _local(lambda: reset(progress=lambda m: status.update(m)))
    _local_table(state)


@local_app.command("status")
def local_status(as_json: JsonOpt = False) -> None:
    """Show the running localnet and its neurons"""
    from .core.local import status

    state = _local(status)
    if state is None:
        err.print("Nothing is up. Run `preflight local up`")
        raise typer.Exit(2)
    if as_json:
        sys.stdout.write(state.model_dump_json(indent=2) + "\n")
        return
    _local_table(state)


@local_app.command("break")
def local_break(
    scenario: Annotated[str, typer.Argument(help="unserved-axon, loopback-axon, stale-validator, rate-limited-validator, low-stake-validator, pending-reveal, deregistered-miner, no-weight-miner")],
    as_json: JsonOpt = False,
) -> None:
    """Create one failure the Doctor detects, for demos and integration tests"""
    from .core.local import break_scenario

    with console.status(f"Breaking: {scenario}", spinner="dots") as status:
        result = _local(lambda: break_scenario(scenario, progress=lambda m: status.update(m)))
    if as_json:
        sys.stdout.write(result.model_dump_json(indent=2) + "\n")
        return
    console.print(f"[bold]{result.summary}[/bold]")
    for step in result.steps:
        console.print(f"  [dim]-[/dim] {step}")
    if result.failed_extrinsic and result.failed_extrinsic.error:
        console.print(f"  [dim]-[/dim] the chain rejected the first attempt with [red]{result.failed_extrinsic.error}[/red]")
        console.print(f"\nExplain that rejection:  [bold green]preflight tx {result.failed_extrinsic.error} --network local[/bold green]")
    console.print(f"Diagnose it:  [bold green]preflight doctor {result.hotkey} --netuid {result.netuid} --network local[/bold green]  (expect {result.expected_rule})")


@app.command()
def version() -> None:
    """Print the Preflight version"""
    import bittensor

    console.print(f"preflight {__version__} (bittensor {bittensor.__version__})")


def main() -> None:
    app()


if __name__ == "__main__":
    main()

