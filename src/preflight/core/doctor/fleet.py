"""Fleet: diagnose every hotkey a coldkey owns, on every subnet, in one pass.

Operators run tens of miners; checking them one by one is how a deregistration goes
unnoticed for a day. Rows sort worst first, and emission is priced in TAO at the pinned
block's alpha prices so the total reads as "what this coldkey earns today".
"""

from __future__ import annotations

import time

from ..chain.network import Network, gather, pin, with_retries
from ..chain.snapshot import NeuronSnapshot, read_neuron, read_subnet
from ..models import SEVERITY_RANK, FleetReport, FleetRow, Verdict
from .engine import ROOT_NETUID, evaluate

MAX_HOTKEYS = 64
BLOCKS_PER_DAY = 7200.0


def per_day(alpha_per_tempo: float, tempo: int, block_seconds: float) -> float:
    blocks_per_day = 86400.0 / block_seconds if block_seconds > 0 else BLOCKS_PER_DAY
    return alpha_per_tempo * blocks_per_day / (tempo + 1)


def _row(hotkey: str, netuid: int, snap: NeuronSnapshot, prices: dict[int, float]) -> FleetRow:
    diagnosis = evaluate(snap)
    n = diagnosis.neuron
    subnet = snap.subnet
    alpha = per_day(n.emission, subnet.params.tempo, subnet.block_seconds) if n else 0.0
    return FleetRow(
        hotkey=hotkey,
        netuid=netuid,
        subnet_name=diagnosis.subnet_name,
        uid=n.uid if n else None,
        role=diagnosis.role,
        verdict=diagnosis.verdict,
        headline=diagnosis.headline,
        worst=diagnosis.findings[0] if diagnosis.findings else None,
        incentive=n.incentive if n else 0.0,
        alpha_per_day=alpha,
        tao_per_day=alpha * prices.get(netuid, 0.0),
    )


def fleet(network: Network, coldkey: str) -> FleetReport:
    started = time.monotonic()
    pinned = pin(network)
    got = with_retries(
        network,
        lambda: gather(
            {
                "hotkeys": lambda: list(pinned.view.neurons.owned_hotkeys(coldkey)),
                "prices": lambda: {int(k): float(v) for k, v in pinned.view.prices.alpha_prices().items()},
            }
        ),
    )
    owned: list[str] = [str(h) for h in got["hotkeys"]]
    checked = owned[:MAX_HOTKEYS]
    prices: dict[int, float] = got["prices"]
    # Three flat stages, so each subnet is read once however many hotkeys sit on it.
    memberships: dict[str, list[int]] = with_retries(
        network,
        lambda: gather({h: (lambda h=h: sorted(n for n in pinned.view.neurons.netuids_for_hotkey(h) if n != ROOT_NETUID)) for h in checked}),
    )
    distinct = sorted({n for netuids in memberships.values() for n in netuids})
    subnets = with_retries(network, lambda: gather({str(n): (lambda n=n: read_subnet(pinned, n)) for n in distinct}))
    pairs = [(h, n) for h in checked for n in memberships[h]]
    snaps = with_retries(
        network,
        lambda: gather(
            {f"{h}:{n}": (lambda h=h, n=n: read_neuron(pinned, n, h, subnet=subnets[str(n)], search_history=False)) for h, n in pairs}
        ),
    )
    rows = [_row(h, n, snaps[f"{h}:{n}"], prices) for h, n in pairs]
    rows += [
        FleetRow(hotkey=h, netuid=None, role="unregistered", verdict=Verdict.WARNING, headline="Owned by this coldkey but registered on no subnet")
        for h in checked
        if not memberships[h]
    ]
    rank = {Verdict.BROKEN: 0, Verdict.WARNING: 1, Verdict.HEALTHY: 2}
    rows.sort(key=lambda r: (rank[r.verdict], -(SEVERITY_RANK[r.worst.severity] if r.worst else -1), -r.tao_per_day))
    seats = [r for r in rows if r.netuid is not None]
    unseated = len(rows) - len(seats)
    broken = sum(1 for r in seats if r.verdict is Verdict.BROKEN)
    warning = sum(1 for r in seats if r.verdict is Verdict.WARNING)
    healthy = sum(1 for r in seats if r.verdict is Verdict.HEALTHY)
    total = sum(r.tao_per_day for r in rows)
    if not owned:
        headline = "This coldkey owns no hotkeys"
    elif not seats:
        headline = f"None of this coldkey's {len(owned)} hotkeys holds a seat on any subnet"
    elif broken:
        headline = f"{broken} of {len(seats)} seats need attention; the worst: {rows[0].headline}"
    elif warning:
        headline = f"All {len(seats)} seats are earning or in immunity; {warning} have something to watch"
    else:
        headline = f"All {len(seats)} seats look healthy"
    return FleetReport(
        coldkey=coldkey,
        chain=pinned.ref,
        hotkeys=len(owned),
        checked=len(checked),
        rows=rows,
        broken=broken,
        warning=warning,
        healthy=healthy,
        unseated=unseated,
        tao_per_day=total,
        headline=headline,
        elapsed_ms=int((time.monotonic() - started) * 1000),
    )
