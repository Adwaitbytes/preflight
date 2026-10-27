"""Subnet rules, PF301 to PF306. Pure functions of a SubnetSnapshot.

Used by the Doctor (a miner on a closed subnet needs to know) and by the Health Score.
Wording follows BUILD.md section 15: signals and "looks like", never accusations.
"""

from __future__ import annotations

from ..chain.snapshot import SubnetSnapshot
from ..models import Finding, Severity
from .common import (
    DOCS,
    Rule,
    block_ev,
    blocks_since_update,
    command,
    duration,
    ev,
    finding,
    network_flag,
    pct,
    stale_after,
    tao,
    wait,
)

C, H, M, INFO = Severity.CRITICAL, Severity.HIGH, Severity.MEDIUM, Severity.INFO
HALTING_REASONS = "https://www.bittensor.com/docs/concepts/emissions"


def pf301_registration_closed(s: SubnetSnapshot) -> Finding | None:
    p = s.params
    interval_cap = 3 * p.target_regs_per_interval
    reopen = s.last_adjustment_block + p.adjustment_interval if p.adjustment_interval else None
    if not p.registration_allowed:
        severity, title = C, "Registration is switched off on this subnet"
        why = "The owner or root has disabled NetworkRegistrationAllowed, so every register call fails with SubNetRegistrationDisabled"
        fix = None
    elif s.regs_this_interval >= interval_cap:
        severity, title = H, "Registration cap for this interval is used up"
        why = (
            f"The subnet allows {interval_cap} registrations per adjustment interval (three times the target) "
            "and they are taken. Calls fail with TooManyRegistrationsThisInterval until the interval rolls over"
        )
        fix = wait(f"Retry after block {reopen:,}") if reopen else None
    elif s.regs_this_block >= p.max_regs_per_block:
        severity, title = M, "This block's registration slot is already taken"
        why = "Only MaxRegistrationsPerBlock registrations fit in one block; retry in the next one"
        fix = wait("Retry in the next block (about 12 s)")
    else:
        return None
    return finding(
        "PF301",
        "registration_closed",
        severity,
        title,
        [
            ev("Registration allowed", p.registration_allowed, "SubtensorModule.NetworkRegistrationAllowed"),
            ev("This interval", f"{s.regs_this_interval} of {interval_cap}", "SubtensorModule.RegistrationsThisInterval"),
            ev("This block", f"{s.regs_this_block} of {p.max_regs_per_block}", "SubtensorModule.RegistrationsThisBlock"),
            ev("Interval resets at block", f"{reopen:,}" if reopen else "unknown", "SubtensorModule.LastAdjustmentBlock"),
            block_ev(s),
        ],
        why,
        fix,
        f"{DOCS}/errors/chain/TooManyRegistrationsThisInterval",
    )


def pf302_burn_spiking(s: SubnetSnapshot) -> Finding | None:
    past = [burn for block, burn in s.burn_history if block < s.block]
    if len(past) < 3:
        return None
    mean = sum(past) / len(past)
    if mean <= 0 or s.burn_tao < 2 * mean:
        return None
    trend = ", ".join(f"{burn:.4g}" for _, burn in s.burn_history)
    return finding(
        "PF302",
        "burn_spiking",
        M,
        f"Registration cost is {s.burn_tao / mean:.1f}x its recent average",
        [
            ev("Cost now", tao(s.burn_tao), "SubtensorModule.Burn"),
            ev("Average over the last tempos", tao(mean)),
            ev("Trend, oldest first (TAO)", trend),
            block_ev(s),
        ],
        "The burn rises when registrations exceed the target and decays when they slow down. Registering "
        "during a spike pays a premium, and the price can move again between your attempts",
        wait("If it is not urgent, wait a few tempos for the burn to decay"),
        f"{DOCS}/errors/chain/NotEnoughBalanceToStake",
    )


def pf303_emissions_not_started(s: SubnetSnapshot) -> Finding | None:
    if s.first_emission_block is not None:
        return None
    ready_at = s.registered_at + s.start_call_delay
    left = max(ready_at - s.block, 0)
    return finding(
        "PF303",
        "emissions_not_started",
        H,
        "Emissions have not started on this subnet",
        [
            ev("Subnet registered at block", f"{s.registered_at:,}", "SubtensorModule.NetworkRegisteredAt"),
            ev("Start call delay", duration(s.start_call_delay, s), "SubtensorModule.StartCallDelay"),
            ev("Start call possible", "now" if left == 0 else f"in {duration(left, s)}"),
            block_ev(s),
        ],
        "Nobody on this subnet earns anything until the owner calls start_call, which is allowed once the "
        "start call delay has passed since registration. Until then staking is blocked too (SubtokenDisabled)",
        command(f"btcli hparams start --netuid {s.netuid} {network_flag(s)}", note="Owner coldkey only")
        if left == 0
        else wait(f"The owner can start the subnet at block {ready_at:,}"),
        f"{DOCS}/errors/chain/SubtokenDisabled",
    )


def owner_incentive_shares(s: SubnetSnapshot) -> tuple[float, float]:
    """(share to the owner hotkey's UIDs, share to other UIDs under the owner coldkey)."""
    total = sum(n.incentive for n in s.neurons) or 0.0
    if total <= 0:
        return 0.0, 0.0
    burn_uids = {n.uid for n in s.neurons if s.owner_hotkey and n.hotkey == s.owner_hotkey}
    to_burn = sum(n.incentive for n in s.neurons if n.uid in burn_uids)
    to_owner_miners = sum(
        n.incentive
        for n in s.neurons
        if n.uid not in burn_uids and s.owner_coldkey and n.coldkey == s.owner_coldkey
    )
    return to_burn / total, to_owner_miners / total


def pf304_near_full_burn(s: SubnetSnapshot) -> Finding | None:
    burned, _ = owner_incentive_shares(s)
    if burned < 0.9:
        return None
    return finding(
        "PF304",
        "near_full_burn",
        M,
        f"{pct(burned)} of miner incentive goes to the owner's burn UID",
        [
            ev("Incentive to the owner hotkey's UID", pct(burned), "SubtensorModule.Incentive"),
            ev("Recycle or burn", s.recycle_or_burn or "unknown", "SubtensorModule.RecycleOrBurn"),
            block_ev(s),
        ],
        "Validators are sending almost all weight to the owner's UID, so almost nothing reaches real "
        "miners. Near full miner burn was one of the reasons given for halting emissions on 57 subnets "
        "in June 2026. For a miner, this means there is little to earn here right now",
        None,
        HALTING_REASONS,
    )


def pf305_weights_mostly_stale(s: SubnetSnapshot) -> Finding | None:
    validators = s.validators()
    if len(validators) < 2:
        return None
    limit = stale_after(s)
    stale = [v for v in validators if blocks_since_update(v, s) > limit]
    share = len(stale) / len(validators)
    if share <= 0.5:
        return None
    return finding(
        "PF305",
        "weights_mostly_stale",
        H,
        f"{len(stale)} of {len(validators)} validators have stopped setting weights",
        [
            ev("Stale validators", f"{len(stale)} of {len(validators)} ({pct(share)})"),
            ev("Stale means no weights for", duration(limit, s)),
            block_ev(s),
        ],
        "Most permitted validators have not set weights for more than two tempos, so miner scores barely "
        "move and new miners struggle to get scored at all",
        None,
        None,
    )


def pf306_owner_self_mining(s: SubnetSnapshot) -> Finding | None:
    _, owned = owner_incentive_shares(s)
    if owned < 0.3:
        return None
    return finding(
        "PF306",
        "owner_self_mining",
        M,
        f"{pct(owned)} of miner incentive goes to other hotkeys under the owner coldkey",
        [
            ev("Owner coldkey", s.owner_coldkey or "unknown", "SubtensorModule.SubnetOwner"),
            ev("Incentive share to its miners", pct(owned)),
            block_ev(s),
        ],
        "A large share of miner rewards flowing to the owner's own hotkeys looks like owner self mining, "
        "another reason given for the June 2026 halts. It can also be legitimate bootstrapping on a young subnet",
        None,
        HALTING_REASONS,
    )


SUBNET_RULES: list[Rule[SubnetSnapshot]] = [
    Rule("PF301", "registration_closed", C, "Registration closed", pf301_registration_closed, "subnet"),
    Rule("PF302", "burn_spiking", M, "Burn spiking", pf302_burn_spiking, "subnet"),
    Rule("PF303", "emissions_not_started", H, "Emissions not started", pf303_emissions_not_started, "subnet"),
    Rule("PF304", "near_full_burn", M, "Near full burn", pf304_near_full_burn, "subnet"),
    Rule("PF305", "weights_mostly_stale", H, "Validators stale", pf305_weights_mostly_stale, "subnet"),
    Rule("PF306", "owner_self_mining", M, "Owner self mining", pf306_owner_self_mining, "subnet"),
]  # fmt: skip
