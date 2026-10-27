"""Should I mine here? A subnet's economics as a would-be miner sees them before registering.

Everything is read from chain at one block: what earning miners make, how many earn at
all, the emission you must beat to keep a seat once immunity ends, and how fast seats turn
over. Past emission does not promise future emission; the copy says "today" and "signals".
"""

from __future__ import annotations

import statistics

from ..chain.network import Network, gather, pin, with_retries
from ..chain.snapshot import SubnetSnapshot, read_subnet
from ..doctor.fleet import per_day
from ..doctor.rules_miner import pruning_order
from ..doctor.rules_subnet import SUBNET_RULES
from ..models import EarningsBand, Finding, MinerEconomics, NeuronState, Severity

BURN_HISTORY_POINTS = 8


def _miners(s: SubnetSnapshot) -> list[NeuronState]:
    validators = {v for v, row in s.weights.items() if row}
    return [n for n in s.neurons if n.uid not in validators and not (s.stake_threshold > 0 and n.stake >= s.stake_threshold)]


def _percentile(values: list[float], q: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    index = min(len(ordered) - 1, max(0, round(q * (len(ordered) - 1))))
    return ordered[index]


def _fmt(tao: float) -> str:
    return f"{tao:,.4f}" if tao < 1 else f"{tao:,.2f}"


def economics(network: Network, netuid: int) -> MinerEconomics:
    pinned = pin(network)
    got = with_retries(
        network,
        lambda: gather(
            {
                "subnet": lambda: read_subnet(pinned, netuid, burn_history=BURN_HISTORY_POINTS),
                "price": lambda: pinned.view.prices.alpha_price(netuid),
            }
        ),
    )
    s: SubnetSnapshot = got["subnet"]
    price = float((got["price"] or {}).get("tao_per_alpha") or 0.0)
    return assess(s, price)


def assess(s: SubnetSnapshot, price: float) -> MinerEconomics:
    """Pure: the numbers and the verdict from a snapshot and an alpha price."""
    p = s.params

    def daily(alpha_per_tempo: float) -> float:
        return per_day(alpha_per_tempo, p.tempo, s.block_seconds)

    miners = _miners(s)
    earning = [daily(n.emission) for n in miners if n.emission > 0]
    bands = [
        EarningsBand(label=label, alpha_per_day=value, tao_per_day=value * price)
        for label, value in (
            ("Lowest earning miner", min(earning) if earning else 0.0),
            ("Median earning miner", statistics.median(earning) if earning else 0.0),
            ("Top 25 percent", _percentile(earning, 0.75)),
            ("Top 10 percent", _percentile(earning, 0.9)),
        )
    ]
    order = pruning_order(s)
    bar = daily(order[0].emission) if order else None
    full = len(s.neurons) >= p.max_uids
    blocks_per_day = 86400.0 / s.block_seconds if s.block_seconds > 0 else 7200.0
    regs_per_day = p.target_regs_per_interval * blocks_per_day / p.adjustment_interval if p.adjustment_interval else 0.0
    turnover = 24.0 / regs_per_day if full and regs_per_day > 0 else None
    median_tao = bands[1].tao_per_day
    payback = s.burn_tao / median_tao if median_tao > 0 else None
    immunity_hours = p.immunity_period * s.block_seconds / 3600.0
    findings: list[Finding] = [f for f in (rule.run(s) for rule in SUBNET_RULES) if f is not None]
    closed = any(f.id == "PF301" and f.severity is Severity.CRITICAL for f in findings) or any(f.id == "PF303" for f in findings)
    burns_all = any(f.id == "PF304" for f in findings)
    share = len(earning) / len(miners) if miners else 0.0

    if closed:
        verdict = "closed"
    elif burns_all or share < 0.2:
        verdict = "hard"
    elif share >= 0.5 and payback is not None and payback <= 7:
        verdict = "promising"
    else:
        verdict = "competitive"

    name = f"SN{s.netuid} {s.name}"
    if verdict == "closed":
        headline = f"{name} is not taking new miners right now: {next(f.title for f in findings if f.id in ('PF301', 'PF303'))}"
    elif not earning and burns_all:
        headline = f"{name} burns its miner emission today: validators weight the owner's UID, so no miner earns"
    elif not earning:
        headline = f"No miner on {name} earns anything today, so there is nothing to compete for yet"
    else:
        payback_text = (
            "less than a day" if payback is not None and payback < 1 else f"about {payback:.0f} days" if payback is not None else "no estimate"
        )
        headline = (
            f"{len(earning)} of {len(miners)} miners on {name} earn today; the median earner makes "
            f"{_fmt(median_tao)} TAO a day, so the {_fmt(s.burn_tao)} TAO registration pays back in {payback_text} if validators score you like them"
        )

    notes = [f"Immunity lasts {p.immunity_period:,} blocks (about {immunity_hours:.1f} h): use it to get scored"]
    zero_seats = sum(1 for n in order if n.emission == 0)
    if bar is not None and full and bar > 0:
        notes.append(f"After immunity you must out-earn the weakest seat, now {bar:,.4f} alpha a day ({bar * price:,.4f} TAO), or the next registration replaces you")
    elif full and zero_seats:
        notes.append(f"{zero_seats} seats out of immunity earn nothing; each registration prunes the oldest of them, so a miner still unscored when immunity ends joins that queue")
    elif not full:
        notes.append(f"{p.max_uids - len(s.neurons)} seats are free, so nobody is pruned until the subnet fills")
    if turnover is not None:
        notes.append(f"Seats turn over about every {turnover:.1f} h at the {regs_per_day:,.1f} registrations a day the burn steers toward")
    if burns_all:
        notes.append("Validators send almost all weight to the owner's burn UID, so little reaches miners")
    notes.append("Amounts are today's emission at today's alpha price, not a forecast")

    return MinerEconomics(
        chain=s.chain,
        netuid=s.netuid,
        name=s.name,
        verdict=verdict,
        headline=headline,
        registration_cost_tao=s.burn_tao,
        burn_history=s.burn_history,
        seats_used=len(s.neurons),
        seats_max=p.max_uids,
        miners=len(miners),
        earning_miners=len(earning),
        alpha_price_tao=price,
        bands=bands,
        immunity_blocks=p.immunity_period,
        immunity_hours=immunity_hours,
        prune_bar_alpha_per_day=bar,
        prune_bar_tao_per_day=bar * price if bar is not None else None,
        registrations_per_day=regs_per_day,
        seat_turnover_hours=turnover,
        payback_days=payback,
        notes=notes,
        findings=findings,
    )

