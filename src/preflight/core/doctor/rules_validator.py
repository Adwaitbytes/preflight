"""Validator rules, PF201 to PF208. Each is a pure function of a NeuronSnapshot.

The checks mirror `internal_set_weights` in subnets/weights.rs (L971 onward), in the
order the runtime applies them, so a finding here predicts the exact chain error.
"""

from __future__ import annotations

import math

from ..chain import registry as R
from ..chain.snapshot import NeuronSnapshot, SubnetSnapshot
from ..models import Finding, Fix, Severity
from .common import (
    DOCS,
    Rule,
    alpha,
    block_ev,
    blocks_since_update,
    command,
    duration,
    ev,
    finding,
    median,
    network_flag,
    pct,
    stale_after,
    wait,
    worse,
)

C, H, M, I = Severity.CRITICAL, Severity.HIGH, Severity.MEDIUM, Severity.INFO


def _owner_exempt(snap: NeuronSnapshot) -> bool:
    return snap.hotkey == snap.subnet.owner_hotkey


def stake_fix(s: SubnetSnapshot, hotkey: str, amount: float) -> Fix:
    return command(
        f"btcli stake add --netuid {s.netuid} --hotkey {hotkey} --amount {math.ceil(amount)} {network_flag(s)}",
        note="The amount is in TAO; the alpha you receive depends on the pool price",
    )


def pf201_no_validator_permit(snap: NeuronSnapshot) -> Finding | None:
    n, s = snap.neuron, snap.subnet
    if n is None or n.validator_permit:
        return None
    permitted = s.validators()
    if not permitted:
        return None
    lowest = min(permitted, key=lambda v: v.stake)
    wants_permit = n.stake >= 0.5 * lowest.stake or (s.stake_threshold > 0 and n.stake >= s.stake_threshold)
    if not wants_permit:
        return None
    gap = max(lowest.stake - n.stake, 0.0)
    return finding(
        "PF201",
        "no_validator_permit",
        H,
        "Has stake but no validator permit",
        [
            ev("This hotkey's stake", alpha(n.stake)),
            ev("Lowest permitted validator", f"UID {lowest.uid} with {alpha(lowest.stake)}"),
            ev("Gap", alpha(gap)),
            ev("Permit slots", s.params.max_validators, "SubtensorModule.MaxAllowedValidators"),
            block_ev(s),
        ],
        "Permits go to the top stake holders on the subnet, up to the permit slot count, and are reassigned "
        "every epoch. Without one, setting weights on other UIDs fails with NeuronNoValidatorPermit",
        stake_fix(s, snap.hotkey, gap) if gap > 0 else wait("The permit is assigned at the next epoch"),
        f"{DOCS}/errors/chain/NeuronNoValidatorPermit",
    )


def pf202_weights_stale(snap: NeuronSnapshot) -> Finding | None:
    n, s = snap.neuron, snap.subnet
    if n is None or not n.validator_permit:
        return None
    since = blocks_since_update(n, s)
    cutoff = s.params.activity_cutoff
    if since > cutoff:
        severity, title = C, "Weights older than the activity cutoff"
        why = "The epoch treats this validator as inactive, so its weights are ignored and it earns no dividends"
    elif since > stale_after(s):
        severity, title = M, f"Weights not set for {duration(since, s)}"
        why = "It has missed at least one epoch. It is still counted, but dividends follow fresh weights"
    else:
        return None
    return finding(
        "PF202",
        "weights_stale",
        severity,
        title,
        [
            ev("Last set weights at block", f"{n.last_update:,}", "SubtensorModule.LastUpdate"),
            ev("Blocks since", duration(since, s)),
            ev("Activity cutoff", duration(cutoff, s), "SubtensorModule.ActivityCutoff"),
            ev("Tempo", s.params.tempo, "SubtensorModule.Tempo"),
            block_ev(s),
        ],
        why,
        Fix(kind="info", text="Check the validator process is running and that its set_weights calls land (run `preflight tx` on its last attempt)"),
        f"{DOCS}/errors/chain/SettingWeightsTooFast",
    )


def pf203_rate_limited(snap: NeuronSnapshot) -> Finding | None:
    n, s = snap.neuron, snap.subnet
    if n is None or s.params.commit_reveal or n.last_update == 0:
        return None
    limit = s.params.weights_rate_limit
    since = s.block - n.last_update
    if since >= limit:
        return None
    allowed = n.last_update + limit
    return finding(
        "PF203",
        "rate_limited",
        I,
        f"A new set_weights would be rejected until block {allowed:,}",
        [
            ev("Last set at block", f"{n.last_update:,}", "SubtensorModule.LastUpdate"),
            ev("Rate limit", duration(limit, s), "SubtensorModule.WeightsSetRateLimit"),
            ev("Allowed again in", duration(allowed - s.block, s)),
            block_ev(s),
        ],
        "The runtime refuses weights set sooner than WeightsSetRateLimit blocks after the last ones "
        f"(SettingWeightsTooFast, {R.SRC_RATE_LIMIT}). Retrying in a tight loop only burns time",
        wait(f"Wait until block {allowed:,} before calling set_weights again"),
        f"{DOCS}/errors/chain/SettingWeightsTooFast",
    )


def pf204_below_min_stake_for_weights(snap: NeuronSnapshot) -> Finding | None:
    n, s = snap.neuron, snap.subnet
    if n is None or _owner_exempt(snap) or s.stake_threshold <= 0:
        return None
    if not (n.validator_permit or n.uid in s.weights) or n.stake >= s.stake_threshold:
        return None
    gap = s.stake_threshold - n.stake
    return finding(
        "PF204",
        "below_min_stake_for_weights",
        H,
        "Stake is below the minimum needed to set weights",
        [
            ev("Stake weight", alpha(n.stake)),
            ev("Minimum (StakeThreshold)", alpha(s.stake_threshold), "SubtensorModule.StakeThreshold"),
            ev("Gap", alpha(gap)),
            block_ev(s),
        ],
        "Setting or committing weights fails with NotEnoughStakeToSetWeights when the hotkey's stake weight "
        "is below StakeThreshold. The subnet owner hotkey is exempt",
        stake_fix(s, snap.hotkey, gap),
        f"{DOCS}/errors/chain/NotEnoughStakeToSetWeights",
    )


def pf205_commit_pending_reveal(snap: NeuronSnapshot) -> Finding | None:
    s = snap.subnet
    if not snap.commits:
        return None
    evidence = [ev("Pending commits", len(snap.commits), "SubtensorModule.WeightCommits / TimelockedWeightCommits")]
    severity = I
    for c in snap.commits[:3]:
        if c.kind == "timelocked":
            evidence.append(ev(f"Commit at block {c.commit_block:,}", f"drand round {c.reveal_round}, reveals automatically at {c.reveals_at or 'unknown'}"))
        else:
            start, end = c.reveal_from_block or 0, c.reveal_until_block or 0
            if s.block > end:
                severity = H
                status = f"window closed at block {end:,}, the commit has expired"
            elif s.block < start:
                status = f"reveal opens at block {start:,} (in {duration(start - s.block, s)})"
            else:
                severity = worse(severity, M)
                status = f"reveal window open until block {end:,} ({duration(end - s.block, s)} left)"
            evidence.append(ev(f"Commit at block {c.commit_block:,}", status))
    evidence.append(block_ev(s))
    timelocked = all(c.kind == "timelocked" for c in snap.commits)
    return finding(
        "PF205",
        "commit_pending_reveal",
        severity,
        "Weights committed and waiting to be revealed",
        evidence,
        "On commit reveal subnets, weights only count once revealed. "
        + (
            "These are timelock commits: the chain decrypts them itself when the drand round arrives, nothing to do"
            if timelocked
            else "Reveal inside the window or the commit expires and the weights never apply"
        ),
        None if timelocked else command(f"btcli weights reveal --netuid {s.netuid} --uids <uids> --weights <weights> --salt <salt> {network_flag(s)}"),
        f"{DOCS}/errors/chain/RevealTooEarly",
    )


def pf206_weights_too_few_uids(snap: NeuronSnapshot) -> Finding | None:
    n, s = snap.neuron, snap.subnet
    if n is None or n.uid not in s.weights:
        return None
    row = {u: w for u, w in s.weights[n.uid].items() if w > 0}
    if not row or set(row) == {n.uid}:
        return None
    needed = min(s.params.min_allowed_weights, len(s.neurons))
    top = max(row.values()) / (sum(row.values()) or 1.0)
    problems = []
    if len(row) < needed:
        problems.append(f"covers {len(row)} UIDs, the subnet requires {needed} (WeightVecLengthIsLow)")
    if s.params.max_weights_limit < 1.0 and top > s.params.max_weights_limit + 1e-6:
        problems.append(f"puts {pct(top)} on one UID, the cap is {pct(s.params.max_weights_limit)} (MaxWeightExceeded)")
    if not problems:
        return None
    return finding(
        "PF206",
        "weights_too_few_uids",
        H,
        "Last weights break the subnet's weight limits",
        [
            ev("UIDs weighted", len(row)),
            ev("MinAllowedWeights", s.params.min_allowed_weights, "SubtensorModule.MinAllowedWeights"),
            ev("MaxWeightsLimit", pct(s.params.max_weights_limit), "SubtensorModule.MaxWeightsLimit"),
            ev("Largest single weight", pct(top)),
            block_ev(s),
        ],
        "The next set_weights with the same shape would fail: " + "; ".join(problems) + f" ({R.SRC_CHECK_LENGTH})",
        Fix(kind="code", text="Spread weights across at least MinAllowedWeights UIDs and keep each under MaxWeightsLimit before calling set_weights"),
        f"{DOCS}/errors/chain/WeightVecLengthIsLow",
    )


def pf207_self_weighting(snap: NeuronSnapshot) -> Finding | None:
    n, s = snap.neuron, snap.subnet
    if n is None or n.uid not in s.weights:
        return None
    row = s.weights[n.uid]
    total = sum(row.values()) or 1.0
    own = sum(w for u, w in row.items() if u != n.uid and (m := s.by_uid(u)) is not None and m.coldkey == n.coldkey)
    share = own / total
    if share < 0.5:
        return None
    return finding(
        "PF207",
        "self_weighting",
        M,
        f"{pct(share)} of its weight goes to UIDs under its own coldkey",
        [ev("Share to own coldkey", pct(share)), ev("Coldkey", n.coldkey), block_ev(s)],
        "Validators mostly weighting their own miners looks like self mining, one of the reasons given "
        "for halting emissions on 57 subnets in June 2026. This is a signal, not a verdict",
        None,
        None,
    )


def _consensus(s: SubnetSnapshot, rows: dict[int, dict[int, float]], exclude: int) -> dict[int, float]:
    totals: dict[int, float] = {}
    for v_uid, row in rows.items():
        validator = s.by_uid(v_uid)
        if v_uid == exclude or validator is None:
            continue
        norm = sum(row.values()) or 1.0
        for u, w in row.items():
            totals[u] = totals.get(u, 0.0) + validator.stake * w / norm
    grand = sum(totals.values()) or 1.0
    return {u: w / grand for u, w in totals.items()}


def _corr(a: dict[int, float], b: dict[int, float]) -> float:
    keys = sorted(set(a) | set(b))
    if len(keys) < 3:
        return 0.0
    xs = [a.get(k, 0.0) for k in keys]
    ys = [b.get(k, 0.0) for k in keys]
    mx, my = sum(xs) / len(xs), sum(ys) / len(ys)
    cov = sum((x - mx) * (y - my) for x, y in zip(xs, ys, strict=True))
    sx = math.sqrt(sum((x - mx) ** 2 for x in xs))
    sy = math.sqrt(sum((y - my) ** 2 for y in ys))
    return cov / (sx * sy) if sx and sy else 0.0


def pf208_copier_signature(snap: NeuronSnapshot) -> Finding | None:
    n, s, previous = snap.neuron, snap.subnet, snap.previous_weights
    if n is None or n.uid not in s.weights or len(previous) < 3:
        return None
    row = s.weights[n.uid]
    to_previous = _corr(row, _consensus(s, previous, n.uid))
    to_current = _corr(row, _consensus(s, s.weights, n.uid))
    peer_current = [
        _corr(r, _consensus(s, s.weights, v)) for v, r in s.weights.items() if v != n.uid
    ]
    if to_previous <= 0.98 or to_current >= median(peer_current) - 0.02:
        return None
    return finding(
        "PF208",
        "copier_signature",
        I,
        "Weights look like a copy of last epoch's consensus",
        [
            ev("Correlation with previous epoch consensus", f"{to_previous:.3f}"),
            ev("Correlation with current consensus", f"{to_current:.3f}"),
            ev("Median peer correlation with current", f"{median(peer_current):.3f}"),
            block_ev(s),
        ],
        "These weights match the previous epoch's stake weighted consensus almost exactly while differing "
        "from the current one more than peers do. That looks like weight copying, which commit reveal is "
        "designed to stop. It is a statistical signal only",
        None,
        f"{DOCS}/guides/timelock",
    )


VALIDATOR_RULES: list[Rule[NeuronSnapshot]] = [
    Rule("PF201", "no_validator_permit", H, "No validator permit", pf201_no_validator_permit, "validator"),
    Rule("PF202", "weights_stale", C, "Weights stale", pf202_weights_stale, "validator"),
    Rule("PF203", "rate_limited", I, "Rate limited", pf203_rate_limited, "validator"),
    Rule("PF204", "below_min_stake_for_weights", H, "Below weights minimum stake", pf204_below_min_stake_for_weights, "validator"),
    Rule("PF205", "commit_pending_reveal", I, "Commit pending reveal", pf205_commit_pending_reveal, "validator"),
    Rule("PF206", "weights_too_few_uids", H, "Weight limits", pf206_weights_too_few_uids, "validator"),
    Rule("PF207", "self_weighting", M, "Self weighting", pf207_self_weighting, "validator"),
    Rule("PF208", "copier_signature", I, "Copier signature", pf208_copier_signature, "validator"),
]  # fmt: skip
