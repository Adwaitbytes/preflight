"""The next epoch before it runs, and the last one checked against the chain.

`preview` runs Yuma consensus's incentive math on live state as of now, at the block the next
epoch runs in, so a miner sees what it will be paid and why before the chain pays it. What-ifs
change the inputs (kappa, a validator offline, a new weight row) and nothing else. `check`
recomputes the last epoch from the state one block before it and compares with what the
chain stored, so every preview carries its own measured accuracy.
"""

from __future__ import annotations

from typing import Any

from ..chain import registry as R
from ..chain.network import Network, gather, pin, with_retries
from ..chain.snapshot import SubnetSnapshot, read_subnet
from ..doctor.change import share, sig
from ..models import (
    EpochCheck,
    EpochMiner,
    EpochPreview,
    EpochValidator,
    EpochWhatIf,
    Model,
    NeuronState,
)
from ..validate import InvalidInput
from .yuma import U16, EpochInputs, EpochRun, run_epoch, to_u16

MAX_MINERS = 64
MAX_WHATIF_ROWS = 8
STEADY = 0.01


def _duration(seconds: int) -> str:
    if seconds < 90:
        return f"{max(seconds, 0)} s"
    if seconds < 90 * 60:
        return f"{round(seconds / 60)} min"
    if seconds < 48 * 3600:
        return f"{seconds / 3600:.1f} h"
    return f"{seconds / 86400:.1f} days"


def inputs_for(
    s: SubnetSnapshot, epoch_block: int, whatif: EpochWhatIf | None = None
) -> tuple[EpochInputs, list[str]]:
    """The epoch's inputs from a snapshot, with what-ifs applied and described."""
    neurons = list(s.neurons)
    weights = {v: dict(row) for v, row in s.weights.items()}
    kappa, cutoff, threshold = s.params.kappa, s.params.activity_cutoff, s.stake_threshold
    applied: list[str] = []
    if whatif is not None:
        if len(whatif.weights) > MAX_WHATIF_ROWS:
            raise InvalidInput(f"replace at most {MAX_WHATIF_ROWS} validators' weights at once")
        by_uid = {n.uid: n for n in neurons}
        if whatif.kappa is not None:
            applied.append(f"kappa {share(kappa)} → {share(whatif.kappa)}")
            kappa = whatif.kappa
        if whatif.activity_cutoff is not None:
            applied.append(f"activity cutoff {cutoff:,} → {whatif.activity_cutoff:,} blocks")
            cutoff = whatif.activity_cutoff
        if whatif.stake_threshold is not None:
            applied.append(
                f"minimum stake to vote {sig(threshold)} → {sig(whatif.stake_threshold)} alpha"
            )
            threshold = whatif.stake_threshold
        for v, row in whatif.weights.items():
            validator = by_uid.get(v)
            if validator is None:
                raise InvalidInput(f"UID {v} is not registered on SN{s.netuid}")
            if any(w < 0 for w in row.values()):
                raise InvalidInput(f"weights for UID {v} must not be negative")
            # A fresh row counts as set now: active, and newer than every registration
            by_uid[v] = validator.model_copy(update={"last_update": epoch_block})
            weights[v] = {u: float(w) for u, w in row.items() if w > 0}
            applied.append(f"UID {v} sets new weights on {len(weights[v])} UIDs")
        for v in whatif.drop_validators:
            validator = by_uid.get(v)
            if validator is None:
                raise InvalidInput(f"UID {v} is not registered on SN{s.netuid}")
            by_uid[v] = validator.model_copy(update={"last_update": 0})
            applied.append(f"UID {v} goes offline")
        neurons = [by_uid[n.uid] for n in neurons]
    return EpochInputs(epoch_block, neurons, weights, kappa, cutoff, threshold), applied


def _miner(n: NeuronState, run: EpochRun, kappa: float) -> EpochMiner:
    now, nxt = n.incentive, run.incentive.get(n.uid, 0.0)
    support = run.support.get(n.uid, 0.0)
    kept = run.kept.get(n.uid, 0.0)
    clipped = 1 - kept / support if support > 0 else 0.0
    voters = sum(1 for row in run.weights.values() if row.get(n.uid, 0.0) > 0)
    plural = "s" if voters != 1 else ""
    if support == 0:
        reason = "no voting validator weights it" + (" any more" if now > 0 else "")
    elif clipped >= STEADY:
        reason = f"{voters} validator{plural} weight it; consensus cuts {share(clipped)}, since validators holding kappa ({share(kappa)}) of stake gave less"
    else:
        reason = f"{voters} validator{plural} weight it and agree"
    change = (nxt - now) / now if now > 0 else (1.0 if nxt > 0 else 0.0)
    return EpochMiner(
        uid=n.uid,
        hotkey=n.hotkey,
        incentive_now=now,
        incentive_next=nxt,
        change=change,
        support=support,
        clipped=clipped,
        validators=voters,
        reason=reason,
    )


def _validator(
    n: NeuronState, run: EpochRun, cutoff: int, threshold: float, epoch_block: int
) -> EpochValidator:
    since = max(0, epoch_block - n.last_update) if n.last_update else epoch_block
    row = run.weights.get(n.uid, {})
    if n.uid in run.below_threshold:
        status, note = (
            "below_threshold",
            f"holds less than the {sig(threshold)} alpha needed to vote",
        )
    elif n.uid in run.inactive:
        status, note = (
            "inactive",
            f"last set weights {since:,} blocks before the epoch, past the {cutoff:,} block cutoff, so its stake does not vote",
        )
    elif not row:
        status, note = "no_weights", "holds a permit but sets no weights the epoch can use"
    else:
        status = "voting"
        trust = run.validator_trust.get(n.uid, 0.0)
        note = (
            "all of its weight survives consensus"
            if trust >= 1 - 1e-6
            else f"{share(1 - trust)} of its weight sits above consensus and is cut"
        )
    return EpochValidator(
        uid=n.uid,
        hotkey=n.hotkey,
        stake_share=run.active_stake.get(n.uid, 0.0),
        trust=run.validator_trust.get(n.uid, 0.0) if row else 0.0,
        weighted_uids=len(row),
        blocks_since_update=since,
        status=status,
        note=note,
    )


def preview(
    s: SubnetSnapshot,
    epoch_block: int,
    *,
    hotkey: str | None = None,
    whatif: EpochWhatIf | None = None,
) -> EpochPreview:
    """Pure: the next epoch from a snapshot."""
    inputs, applied = inputs_for(s, epoch_block, whatif)
    run = run_epoch(inputs)
    permitted = [n for n in inputs.neurons if n.validator_permit]
    miners = [
        _miner(n, run, inputs.kappa)
        for n in inputs.neurons
        if n.uid not in run.weights and (n.incentive > 0 or run.incentive.get(n.uid, 0.0) > 0)
    ]
    miners.sort(key=lambda m: (-m.incentive_next, -m.incentive_now, m.uid))
    validators = [
        _validator(n, run, inputs.activity_cutoff, inputs.stake_threshold, epoch_block)
        for n in permitted
    ]
    validators.sort(key=lambda v: (-v.stake_share, v.uid))

    blocks_until = max(0, epoch_block - s.block)
    seconds = round(blocks_until * s.block_seconds)
    when = f"block {epoch_block:,}, in about {_duration(seconds)}"
    earners_now = sum(1 for n in s.neurons if n.incentive > 0)
    earners_next = sum(1 for v in run.incentive.values() if v > 0)
    total_support = sum(run.support.values())
    cut = 1 - sum(run.kept.values()) / total_support if total_support > 0 else 0.0

    focus_neuron = next((n for n in inputs.neurons if n.hotkey == hotkey), None) if hotkey else None
    focus = _miner(focus_neuron, run, inputs.kappa) if focus_neuron else None
    condition = "with these changes" if applied else "if validators keep their current weights"
    if hotkey and focus is None:
        headline = (
            f"This hotkey holds no UID on SN{s.netuid}, so the next epoch ({when}) pays it nothing"
        )
    elif focus is not None:
        who = f"UID {focus.uid} on SN{s.netuid}"
        if focus.incentive_next == 0 and focus.incentive_now == 0:
            headline = f"{who} earns nothing at the next epoch ({when}) either: {focus.reason}"
        elif focus.incentive_next == 0:
            headline = (
                f"{who} drops to zero at the next epoch ({when}), {condition}: {focus.reason}"
            )
        elif abs(focus.change) < STEADY:
            headline = f"{who} holds steady at incentive {sig(focus.incentive_next)} at the next epoch ({when}), {condition}"
        else:
            direction = "rises" if focus.change > 0 else "falls"
            amount = "from zero" if focus.incentive_now == 0 else f"{abs(focus.change):.0%}"
            headline = f"{who} {direction} {amount} to incentive {sig(focus.incentive_next)} at the next epoch ({when}), {condition}"
    else:
        top = miners[0] if miners else None
        lead = (
            f"; the top miner, UID {top.uid}, takes {share(top.incentive_next)}"
            if top and top.incentive_next > 0
            else ""
        )
        headline = f"SN{s.netuid}'s next epoch ({when}) pays {earners_next} UID{'s' if earners_next != 1 else ''}{lead}, {condition}"

    notes = [
        f"Computed off-chain with Yuma consensus's own incentive math on live state at block {s.block:,}; the chain pays this at block {epoch_block:,} unless validators set new weights first",
        f"Consensus cuts {share(cut)} of all stake weighted weight this epoch: a weight survives only up to what validators holding kappa, {share(inputs.kappa)} of stake, agree on",
    ]
    sealed = sum(len(v) for v in s.timelocked_commits.values())
    if s.params.commit_reveal:
        notes.append(
            f"Weights here are commit-reveal: {sealed} sealed commit{'s are' if sealed != 1 else ' is'} waiting, encrypted until revealed, so validators are counted with the weights they last revealed"
        )
    notes.append(
        "Dividends are not part of this preview: they depend on bonds, which this computes only for incentive"
    )
    if focus is not None and focus.uid not in {m.uid for m in miners[:MAX_MINERS]}:
        miners = [*miners[:MAX_MINERS], focus]
    return EpochPreview(
        chain=s.chain,
        netuid=s.netuid,
        name=s.name,
        epoch_block=epoch_block,
        blocks_until=blocks_until,
        seconds_until=seconds,
        kappa=inputs.kappa,
        commit_reveal=s.params.commit_reveal,
        sealed_commits=sealed,
        headline=headline,
        focus=focus,
        miners=miners[: MAX_MINERS + 1],
        validators=validators,
        earners_now=earners_now,
        earners_next=earners_next,
        whatif=applied,
        notes=notes,
    )


def check(pre: SubnetSnapshot, epoch_block: int, stored: list[int]) -> EpochCheck:
    """Pure: the epoch recomputed from `pre` (state one block before `epoch_block`) against
    the u16 incentive vector the chain stored at `epoch_block`."""
    inputs, _ = inputs_for(pre, epoch_block)
    run = run_epoch(inputs)
    errors = [abs(to_u16(run.incentive.get(uid, 0.0)) - value) for uid, value in enumerate(stored)]
    exact = sum(1 for e in errors if e <= 1)
    total = sum(errors) / U16
    uids = len(stored)
    matched = exact == uids
    if matched:
        headline = f"Matched the chain: all {uids} UIDs at SN{pre.netuid}'s last epoch (block {epoch_block:,}) to the last step the chain stores"
    else:
        headline = f"{exact} of {uids} UIDs matched the chain exactly at SN{pre.netuid}'s last epoch (block {epoch_block:,}); the rest differ by {share(total)} of incentive in total"
        if pre.params.commit_reveal:
            headline += ", which is what a validator's sealed weights revealed in the epoch block itself looks like"
    return EpochCheck(
        chain=pre.chain,
        netuid=pre.netuid,
        epoch_block=epoch_block,
        uids=uids,
        exact=exact,
        max_error=max(errors, default=0),
        total_error=total,
        matched=matched,
        headline=headline,
    )


class EpochState(Model):
    """Live state and the block the next epoch runs in: the expensive read, cached by the API
    and shared by every preview of the subnet."""

    subnet: SubnetSnapshot
    epoch_block: int


def epoch_state(network: Network, netuid: int) -> EpochState:
    now = pin(network)

    def read() -> dict[str, Any]:
        return gather(
            {
                "subnet": lambda: read_subnet(now, netuid),
                "start": lambda: now.runtime(R.API_NEXT_EPOCH_START, [netuid]),
            }
        )

    got = with_retries(network, read)
    subnet: SubnetSnapshot = got["subnet"]
    start = int(str(got["start"] or 0)) or subnet.last_epoch_block + subnet.params.tempo
    return EpochState(subnet=subnet, epoch_block=start + 1)


def next_epoch(
    network: Network, netuid: int, *, hotkey: str | None = None, whatif: EpochWhatIf | None = None
) -> EpochPreview:
    state = epoch_state(network, netuid)
    return preview(state.subnet, state.epoch_block, hotkey=hotkey, whatif=whatif)


def check_last_epoch(network: Network, netuid: int) -> EpochCheck:
    now = pin(network)
    epoch_block = int(now.query(R.LAST_MECHANISM_STEP_BLOCK, [netuid]) or 0)
    if epoch_block <= 1:
        raise LookupError(f"SN{netuid} has not run an epoch yet")
    pre, at = pin(network, epoch_block - 1), pin(network, epoch_block)
    got = with_retries(
        network,
        lambda: gather(
            {
                "pre": lambda: read_subnet(pre, netuid),
                "stored": lambda: at.query(R.INCENTIVE, [netuid]),
            }
        ),
    )
    stored = [int(v) for v in (got["stored"] or [])]
    return check(got["pre"], epoch_block, stored)
