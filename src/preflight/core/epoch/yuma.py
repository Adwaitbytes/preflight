"""The incentive half of Yuma consensus, off-chain.

A line-by-line port of `epoch_dense_mechanism` (pallets/subtensor/src/epoch/run_epoch.rs)
up to the incentive vector, plus `weighted_median` from epoch/math.rs. Floats stand in for
I32F32; replayed against real finney epochs on 2026-10-29 it matched the stored `Incentive`
to the last u16 step on 8 of 9 subnets. Pure: it reads a snapshot and never the chain.
"""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass, field

from ..models import NeuronState

U16 = 65535


@dataclass(frozen=True)
class EpochInputs:
    """What the epoch reads, at the block it runs in."""

    block: int
    neurons: list[NeuronState]
    weights: Mapping[int, Mapping[int, float]]
    kappa: float
    activity_cutoff: int
    stake_threshold: float


@dataclass(frozen=True)
class EpochRun:
    block: int
    active_stake: dict[int, float] = field(default_factory=dict[int, float])
    """Validator UID to its share of active validator stake, the stake the epoch votes with."""
    weights: dict[int, dict[int, float]] = field(default_factory=dict[int, dict[int, float]])
    """Each voting validator's masked, normalized weight row."""
    consensus: dict[int, float] = field(default_factory=dict[int, float])
    support: dict[int, float] = field(default_factory=dict[int, float])
    """Stake weighted weight before clipping, per UID."""
    kept: dict[int, float] = field(default_factory=dict[int, float])
    """Stake weighted weight after clipping at consensus, per UID: the unnormalized rank."""
    incentive: dict[int, float] = field(default_factory=dict[int, float])
    validator_trust: dict[int, float] = field(default_factory=dict[int, float])
    inactive: frozenset[int] = frozenset()
    below_threshold: frozenset[int] = frozenset()


def weighted_median(stake: list[float], score: list[float], minority: float) -> float:
    """`weighted_median` in epoch/math.rs: a quickselect over stake-weighted scores that
    returns the score where the cumulative stake from below passes `minority`."""
    idx = list(range(len(stake)))
    lo_part, hi_part = 0.0, float(sum(stake))
    for _ in range(len(stake) + 1):
        n = len(idx)
        if n == 0:
            return 0.0
        if n == 1:
            return score[idx[0]]
        pivot = score[idx[n // 2]]
        lower = [i for i in idx if score[i] < pivot]
        upper = [i for i in idx if score[i] > pivot]
        lo = sum(stake[i] for i in lower)
        hi = sum(stake[i] for i in upper)
        if minority < lo_part + lo and lower:
            idx, hi_part = lower, lo_part + lo
        elif hi_part - hi <= minority and upper:
            idx, lo_part = upper, hi_part - hi
        else:
            return pivot
    return 0.0


def _normalize(values: dict[int, float]) -> dict[int, float]:
    total = sum(values.values())
    return {k: v / total for k, v in values.items()} if total > 0 else {k: 0.0 for k in values}


def run_epoch(inputs: EpochInputs) -> EpochRun:
    by_uid = {n.uid: n for n in inputs.neurons}
    block = inputs.block

    # Active & updated (run_epoch.rs "Active & updated")
    inactive = frozenset(
        n.uid for n in inputs.neurons if n.last_update + inputs.activity_cutoff < block
    )

    # Stake: filtered by the weights-min-stake threshold, then normalized
    below = frozenset(n.uid for n in inputs.neurons if n.stake < inputs.stake_threshold)
    stake = _normalize({n.uid: 0.0 if n.uid in below else n.stake for n in inputs.neurons})

    # Active stake: drop inactive and unpermitted neurons, renormalize
    active_stake = _normalize(
        {uid: s for uid, s in stake.items() if uid not in inactive and by_uid[uid].validator_permit}
    )
    voters = [uid for uid, s in active_stake.items() if s > 0]

    # Weights: permitted rows only, no self weight, nothing on a UID registered after the
    # validator last set weights, then each row normalized
    rows: dict[int, dict[int, float]] = {}
    for v, row in inputs.weights.items():
        validator = by_uid.get(v)
        if validator is None or not validator.validator_permit:
            continue
        kept_row = {
            u: w
            for u, w in row.items()
            if u != v
            and u in by_uid
            and w > 0
            and validator.last_update > by_uid[u].block_at_registration
        }
        total = sum(kept_row.values())
        rows[v] = {u: w / total for u, w in kept_row.items()} if total > 0 else {}

    # Consensus: stake-weighted median per column over voting validators, at kappa
    vote_stake = [active_stake[v] for v in voters]
    stake_sum = sum(vote_stake)
    minority = stake_sum - inputs.kappa
    columns = sorted({u for v in voters for u in rows.get(v, {})})
    consensus: dict[int, float] = {}
    for u in columns:
        scores = [rows.get(v, {}).get(u, 0.0) for v in voters]
        consensus[u] = weighted_median(vote_stake, scores, minority) if voters else 0.0

    # Clip at consensus; validator trust is the weight each validator keeps
    support: dict[int, float] = dict.fromkeys(columns, 0.0)
    kept: dict[int, float] = dict.fromkeys(columns, 0.0)
    trust: dict[int, float] = {}
    for v in rows:
        row = rows[v]
        trust[v] = sum(min(w, consensus.get(u, 0.0)) for u, w in row.items())
        s = active_stake.get(v, 0.0)
        if s <= 0:
            continue
        for u, w in row.items():
            support[u] += s * w
            kept[u] += s * min(w, consensus.get(u, 0.0))

    incentive = dict.fromkeys(by_uid, 0.0)
    incentive.update(_normalize(kept))
    return EpochRun(
        block=block,
        active_stake={v: active_stake[v] for v in voters},
        weights={v: rows[v] for v in voters if v in rows},
        consensus=consensus,
        support=support,
        kept=kept,
        incentive=incentive,
        validator_trust=trust,
        inactive=inactive,
        below_threshold=below,
    )


def to_u16(value: float) -> int:
    return round(value * U16)
