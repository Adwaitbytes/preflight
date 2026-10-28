"""Why did my incentive change? Compare a UID at two blocks in validators' terms.

A validator's support for a UID is its stake share times the share of its weight on that
UID. Summed over validators, support is what Yuma consensus starts from before clipping,
so the validators whose support moved most are the ones that moved the incentive. The
explanation names them and says what they did: stopped or started weighting, cut or raised
the weight, went stale, or lost stake.
"""

from __future__ import annotations

from ..chain.network import Network, gather, pin, with_retries
from ..chain.snapshot import SubnetSnapshot, read_subnet
from ..models import ChangeDriver, IncentiveChange, NeuronPoint
from .common import blocks_since_update

MAX_DRIVERS = 6
STEADY = 0.05


def sig(value: float, digits: int = 3) -> str:
    """Three significant figures, so 0.000312 does not print as 0.0003 next to 0.0003."""
    if value == 0:
        return "0"
    return f"{value:.{digits}g}" if abs(value) < 1 else f"{value:,.{digits}f}".rstrip("0").rstrip(".")


def share(value: float) -> str:
    percent = value * 100
    if percent >= 10:
        return f"{percent:.1f}%"
    if percent >= 1:
        return f"{percent:.2f}%"
    return f"{sig(percent)}%"


def _stake_shares(s: SubnetSnapshot) -> dict[int, float]:
    validators = [n for n in s.neurons if n.uid in s.weights]
    total = sum(n.stake for n in validators) or 1.0
    return {n.uid: n.stake / total for n in validators}


def _weight_share(s: SubnetSnapshot, validator: int, uid: int | None) -> float:
    row = s.weights.get(validator) or {}
    total = sum(row.values()) or 1.0
    return row.get(uid, 0.0) / total if uid is not None else 0.0


def _point(s: SubnetSnapshot, hotkey: str) -> NeuronPoint:
    neuron = s.by_hotkey(hotkey)
    miners = sorted((n for n in s.neurons if n.uid not in s.weights), key=lambda n: -n.emission)
    rank = next((i + 1 for i, n in enumerate(miners) if neuron and n.uid == neuron.uid), None)
    return NeuronPoint(
        block=s.block,
        uid=neuron.uid if neuron else None,
        incentive=neuron.incentive if neuron else 0.0,
        emission=neuron.emission if neuron else 0.0,
        trust=neuron.trust if neuron else 0.0,
        rank_by_emission=rank,
        miners=len(miners),
    )


def _reason(before: float, after: float, stale: bool, stale_blocks: int, share_before: float, share_after: float) -> str:
    if before > 0 and after == 0:
        text = "stopped weighting this UID"
    elif before == 0 and after > 0:
        text = "started weighting this UID"
    elif after < before:
        text = f"cut its weight on this UID from {share(before)} to {share(after)}"
    elif after > before:
        text = f"raised its weight on this UID from {share(before)} to {share(after)}"
    else:
        text = f"kept its weight at {share(after)}"
    if abs(share_after - share_before) >= 0.02:
        text += f", while its stake share moved from {share(share_before)} to {share(share_after)}"
    if stale:
        text += f"; it has not set weights for {stale_blocks:,} blocks"
    return text


def compare(before: SubnetSnapshot, after: SubnetSnapshot, hotkey: str) -> IncentiveChange:
    """Pure: the change between two snapshots of the same subnet."""
    p_before, p_after = _point(before, hotkey), _point(after, hotkey)
    shares_before, shares_after = _stake_shares(before), _stake_shares(after)
    drivers: list[ChangeDriver] = []
    for v in sorted(set(shares_before) | set(shares_after)):
        w_before = _weight_share(before, v, p_before.uid)
        w_after = _weight_share(after, v, p_after.uid)
        s_before, s_after = shares_before.get(v, 0.0), shares_after.get(v, 0.0)
        if w_before == 0 and w_after == 0:
            continue
        neuron = after.by_uid(v) or before.by_uid(v)
        since = blocks_since_update(neuron, after) if neuron else 0
        stale = since > after.params.activity_cutoff
        drivers.append(
            ChangeDriver(
                uid=v,
                hotkey=neuron.hotkey if neuron else "",
                stake_share_before=s_before,
                stake_share_after=s_after,
                weight_before=w_before,
                weight_after=w_after,
                support_before=s_before * w_before,
                support_after=s_after * w_after,
                blocks_since_update=since,
                reason=_reason(w_before, w_after, stale, since, s_before, s_after),
            )
        )
    drivers.sort(key=lambda d: -abs(d.support_after - d.support_before))
    top = drivers[:MAX_DRIVERS]

    old, new = p_before.incentive, p_after.incentive
    change = (new - old) / old if old > 0 else (1.0 if new > 0 else 0.0)
    span = f"between blocks {before.block:,} and {after.block:,}"
    who = f"UID {p_after.uid if p_after.uid is not None else p_before.uid} on SN{after.netuid}"
    moved = [d for d in drivers if abs(d.support_after - d.support_before) > 1e-9]
    lead = moved[0] if moved and moved[0] is top[0] else None
    cause = f"validator UID {lead.uid} ({share(lead.stake_share_after or lead.stake_share_before)} of validator stake) {lead.reason}" if lead else None
    rising = [d.support_after > d.support_before for d in moved]
    if lead and len(moved) >= 3 and (all(rising) or not any(rising)):
        # Every validator moving the same way is consensus moving, not one validator's choice.
        verb = "raised" if rising[0] else "cut"
        held = sum(d.stake_share_after or d.stake_share_before for d in moved)
        cause = f"all {len(moved)} validators that weight it ({share(held)} of validator stake) {verb} their weight on it; the largest, UID {lead.uid}, {lead.reason}"

    if p_before.uid is not None and p_after.uid is None:
        headline = f"{who} lost its seat {span}, so it earns nothing now"
    elif old == 0 and new == 0:
        headline = f"{who} earned nothing at both blocks" + (f"; {cause}" if cause else "; no validator weighted it at either block")
    elif abs(change) < STEADY:
        headline = f"{who} held steady {span} at incentive {sig(new)}"
    else:
        direction = "rose" if change > 0 else "fell"
        amount = "from zero" if old == 0 else f"{abs(change):.0%}"
        headline = f"{who} incentive {direction} {amount} ({sig(old)} to {sig(new)}) {span}" + (f"; the biggest cause: {cause}" if cause else "")

    total_before = sum(d.support_before for d in drivers)
    total_after = sum(d.support_after for d in drivers)
    notes = [f"Stake weighted support for this UID is {share(total_after)} now against {share(total_before)} before (each validator's stake share times its weight share); consensus keeps a weight only where validators holding at least kappa, {share(after.params.kappa)} of stake, agree"]
    earners_before = sum(1 for n in before.neurons if n.uid not in before.weights and n.incentive > 0)
    earners_after = sum(1 for n in after.neurons if n.uid not in after.weights and n.incentive > 0)
    if earners_after != earners_before:
        notes.append(f"The number of earning miners went from {earners_before} to {earners_after}, so the pool is shared {'more' if earners_after > earners_before else 'less'} widely")
    if p_before.rank_by_emission and p_after.rank_by_emission:
        notes.append(f"By emission this UID ranked {p_before.rank_by_emission} of {p_before.miners} miners before and {p_after.rank_by_emission} of {p_after.miners} now")
    return IncentiveChange(
        chain=after.chain,
        hotkey=hotkey,
        netuid=after.netuid,
        from_block=before.block,
        to_block=after.block,
        before=p_before,
        after=p_after,
        change=change,
        headline=headline,
        drivers=top,
        notes=notes,
    )


def explain_change(network: Network, hotkey: str, netuid: int, *, epochs: int = 1, since: int | None = None) -> IncentiveChange:
    now = pin(network)
    tempo = int(now.query(("SubtensorModule", "Tempo"), [netuid]) or 360)
    then_block = since if since is not None else now.block - max(1, epochs) * (tempo + 1)
    then = pin(network, then_block)
    got = with_retries(network, lambda: gather({"before": lambda: read_subnet(then, netuid), "after": lambda: read_subnet(now, netuid)}))
    return compare(got["before"], got["after"], hotkey)


