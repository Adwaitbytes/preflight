"""Miner rules, PF101 to PF113. Each is a pure function of a NeuronSnapshot."""

from __future__ import annotations

import math
from collections import Counter

from ..chain import registry as R
from ..chain.snapshot import NeuronSnapshot, SubnetSnapshot
from ..models import Finding, Fix, NeuronState, Severity
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
    short,
    tao,
    unreachable_reason,
    wait,
)

C, H, M, I = Severity.CRITICAL, Severity.HIGH, Severity.MEDIUM, Severity.INFO


def register_command(s: SubnetSnapshot, hotkey: str) -> Fix:
    return command(
        f"btcli subnets register --netuid {s.netuid} --hotkey {hotkey} {network_flag(s)}",
        note=f"Costs about {tao(s.burn_tao)} right now; the price moves with demand",
    )


def pf101_not_registered(snap: NeuronSnapshot) -> Finding | None:
    if snap.uid is not None or snap.deregistration is not None:
        return None
    s = snap.subnet
    full = len(s.neurons) >= s.params.max_uids
    return finding(
        "PF101",
        "not_registered",
        C,
        f"Not registered on SN{s.netuid}",
        [
            ev("Hotkey", snap.hotkey),
            ev("UIDs in use", f"{len(s.neurons)} of {s.params.max_uids}", "SubtensorModule.MaxAllowedUids"),
            ev("Registration cost now", tao(s.burn_tao), "SubtensorModule.Burn"),
            block_ev(s),
        ],
        "This hotkey holds no UID on this subnet, so validators cannot score it and it earns nothing. "
        + (
            "The subnet is full, so registering replaces the lowest emission neuron that is out of immunity"
            if full
            else "There are free seats, so registering does not push anyone out"
        ),
        register_command(s, snap.hotkey),
        f"{DOCS}/errors/chain/HotKeyNotRegisteredInSubNet",
    )


def pf102_recently_deregistered(snap: NeuronSnapshot) -> Finding | None:
    d = snap.deregistration
    if snap.uid is not None or d is None:
        return None
    s = snap.subnet
    ago = s.block - d.lost_at_block
    return finding(
        "PF102",
        "recently_deregistered",
        C,
        f"Lost UID {d.uid} on SN{s.netuid} {duration(ago, s)} ago",
        [
            ev("Last block with a seat", f"{d.last_seen_block:,}", "SubtensorModule.Uids"),
            ev("First block without it", f"{d.lost_at_block:,}"),
            ev("Emission just before", alpha(d.emission), "SubtensorModule.Emission"),
            ev("Incentive just before", f"{d.incentive:.5f}", "SubtensorModule.Incentive"),
            ev("Registration cost now", tao(s.burn_tao), "SubtensorModule.Burn"),
        ],
        "When a full subnet takes a new registration, the runtime prunes the neuron with the lowest "
        "emission that is out of immunity. This hotkey had the lowest emission when someone registered, "
        f"so it was replaced (runtime source: {R.SRC_NEURON_TO_PRUNE})",
        register_command(s, snap.hotkey),
        f"{DOCS}/guides/mining",
    )


def pf103_in_immunity(snap: NeuronSnapshot) -> Finding | None:
    n, s = snap.neuron, snap.subnet
    if n is None or not s.is_immune(n):
        return None
    left = s.params.immunity_period - (s.block - n.block_at_registration)
    return finding(
        "PF103",
        "in_immunity",
        I,
        f"In immunity for another {duration(left, s)}",
        [
            ev("Registered at block", f"{n.block_at_registration:,}", "SubtensorModule.BlockAtRegistration"),
            ev("Immunity period", duration(s.params.immunity_period, s), "SubtensorModule.ImmunityPeriod"),
            ev("Blocks left", f"{left:,}"),
        ],
        "New neurons cannot be pruned until immunity ends, which gives validators time to find and score "
        "them. Low or zero rewards in this window are normal; what matters is being scored before it ends",
        wait(f"Make sure validators can reach the axon and score it before block {n.block_at_registration + s.params.immunity_period:,}"),
        None,
    )


def pruning_order(s: SubnetSnapshot) -> list[NeuronState]:
    """Candidates in the order the runtime would prune them: lowest emission, then oldest
    registration, then lowest UID, skipping owner-immune hotkeys and immune neurons
    (subnets/registration.rs L513)."""
    exempt = s.owner_immune_uids()
    candidates = [n for n in s.neurons if n.uid not in exempt and not s.is_immune(n)]
    return sorted(candidates, key=lambda n: (n.emission, n.block_at_registration, n.uid))


def pf104_near_pruning(snap: NeuronSnapshot) -> Finding | None:
    n, s = snap.neuron, snap.subnet
    if n is None or s.is_immune(n):
        return None
    order = pruning_order(s)
    rank = next((i for i, c in enumerate(order) if c.uid == n.uid), None)
    if rank is None:
        return None
    k = max(3, math.ceil(0.05 * s.params.max_uids))
    full = len(s.neurons) >= s.params.max_uids
    if rank >= k:
        return None
    above = order[rank + 1] if rank + 1 < len(order) else None
    severity = C if rank == 0 and full else H if full else M
    position = "next in line" if rank == 0 else f"number {rank + 1} in line"
    return finding(
        "PF104",
        "near_pruning",
        severity,
        f"{position.capitalize()} to be pruned on SN{s.netuid}",
        [
            ev("Pruning rank", f"{rank + 1} of {len(order)} prunable neurons"),
            ev("This UID's emission", alpha(n.emission), "SubtensorModule.Emission"),
            ev("Next neuron up", f"UID {above.uid} with {alpha(above.emission)}" if above else "none"),
            ev("Seats", f"{len(s.neurons)} of {s.params.max_uids}", "SubtensorModule.MaxAllowedUids"),
            block_ev(s),
        ],
        "The runtime prunes the lowest emission neuron that is out of immunity whenever a full subnet takes "
        "a registration. "
        + (
            "The subnet is full, so the next registration can remove this UID"
            if full
            else "The subnet has free seats, so this only matters once it fills"
        ),
        wait("Raise emission: check the findings above for why validators score this UID low"),
        f"{DOCS}/guides/mining",
    )


def axon_fix(s: SubnetSnapshot, ip: str = "<public-ip>", port: int = 8091) -> Fix:
    return command(
        f"btcli axon set --netuid {s.netuid} --ip {ip} --port {port} {network_flag(s)}",
        note="Use the public address validators can reach; the miner process must listen on that port",
    )


def axon_share_of_earners(s: SubnetSnapshot) -> float | None:
    """Share of earning miners that publish an axon, or None when nobody earns yet."""
    earners = [m for m in s.neurons if not m.validator_permit and m.incentive > 0]
    if not earners:
        return None
    return sum(1 for m in earners if m.axon is not None) / len(earners)


def pf105_axon_not_served(snap: NeuronSnapshot) -> Finding | None:
    n, s = snap.neuron, snap.subnet
    if n is None or n.axon is not None or n.validator_permit:
        return None
    share = axon_share_of_earners(s)
    # Some subnets (Chutes, for one) reach miners through their own registry, not axons.
    # If most earning miners publish none either, a missing axon is not the problem.
    if share is not None and share < 0.5:
        return None
    return finding(
        "PF105",
        "axon_not_served",
        I if n.incentive > 0 else H,
        "No axon published",
        [
            ev("Axon", "empty or 0.0.0.0", "SubtensorModule.Axons"),
            ev("UID", n.uid),
            ev("Earning miners with an axon", pct(share) if share is not None else "nobody earns yet"),
            block_ev(s),
        ],
        "Validators find miners through the axon address on chain, and most earning miners on this subnet "
        "publish one. With none published validators have nowhere to send queries",
        axon_fix(s),
        f"{DOCS}/guides/mining",
    )


def pf106_axon_bad_address(snap: NeuronSnapshot) -> Finding | None:
    n, s = snap.neuron, snap.subnet
    if n is None or n.axon is None:
        return None
    reason = unreachable_reason(n.axon.ip, s.chain.network)
    if reason is None:
        return None
    localnet_note = (
        " On localnet the chain rejects 127.0.0.1 itself but accepts the IPv4 mapped form ::ffff:127.0.0.1, "
        "which every local client still resolves to loopback"
        if s.chain.network == "local"
        else ""
    )
    return finding(
        "PF106",
        "axon_bad_address",
        H,
        f"Axon points at {n.axon.address}, which validators cannot reach",
        [ev("Axon", n.axon.address, "SubtensorModule.Axons"), ev("UID", n.uid), block_ev(s)],
        f"{reason}.{localnet_note}",
        axon_fix(
            s,
            "::ffff:127.0.0.1" if s.chain.network == "local" else "<public-ip>",
            n.axon.port,
        ),
        f"{DOCS}/errors/chain/InvalidIpAddress",
    )


def pf107_axon_unreachable(snap: NeuronSnapshot) -> Finding | None:
    p, n, s = snap.probe, snap.neuron, snap.subnet
    if p is None or p.ok or n is None:
        return None
    return finding(
        "PF107",
        "axon_unreachable",
        H,
        f"Axon {p.address} did not accept a connection",
        [
            ev("Probed address", p.address),
            ev("Result", p.error or "failed"),
            ev("Time", f"{p.elapsed_ms} ms"),
            block_ev(s),
        ],
        "Preflight opened a plain TCP connection to the advertised address and port, the same first step "
        "a validator takes. A refusal means nothing listens on that port; a timeout usually means a "
        "firewall or a missing port forward",
        Fix(
            kind="info",
            text=f"Check the miner is running and listening on port {n.axon.port if n.axon else '?'}, then open that port in the host and cloud firewall",
        ),
        None,
    )


def _weighters(snap: NeuronSnapshot) -> list[tuple[NeuronState, float]]:
    s, uid = snap.subnet, snap.uid
    out: list[tuple[NeuronState, float]] = []
    for v_uid, row in s.weights.items():
        validator = s.by_uid(v_uid)
        if validator is None or not validator.validator_permit or v_uid == uid:
            continue
        weight = row.get(uid, 0.0) if uid is not None else 0.0
        if weight > 0:
            out.append((validator, weight))
    return out


def pf108_no_validator_weight(snap: NeuronSnapshot) -> Finding | None:
    n, s = snap.neuron, snap.subnet
    if n is None or n.validator_permit or _weighters(snap):
        return None
    validators = sorted(s.validators(), key=lambda v: v.stake, reverse=True)[:5]
    evidence = [ev("Validators weighting this UID", "0 of " + str(len(s.validators())))]
    for v in validators:
        since = blocks_since_update(v, s)
        evidence.append(
            ev(
                f"UID {v.uid} ({short(v.hotkey)})",
                f"stake {alpha(v.stake)}, last set weights {duration(since, s)} ago",
                "SubtensorModule.LastUpdate",
            )
        )
    evidence.append(block_ev(s))
    immune = s.is_immune(n)
    return finding(
        "PF108",
        "no_validator_weight",
        M if immune else C,
        "No validator has scored this UID",
        evidence,
        "Incentive only comes from validators putting weight on a UID. None of the permitted validators' "
        "latest weights include this one, so it earns nothing until they do"
        + (". It is still in immunity, so there is time" if immune else ""),
        Fix(
            kind="info",
            text="Check that the axon is reachable and that the miner answers the subnet's queries in the format validators expect",
        ),
        f"{DOCS}/guides/mining",
    )


def pf109_weights_from_stale_validators_only(snap: NeuronSnapshot) -> Finding | None:
    n, s = snap.neuron, snap.subnet
    weighters = _weighters(snap)
    if n is None or not weighters:
        return None
    cutoff = s.params.activity_cutoff
    fresh = [v for v, _ in weighters if blocks_since_update(v, s) <= cutoff]
    if fresh:
        return None
    oldest = max(blocks_since_update(v, s) for v, _ in weighters)
    return finding(
        "PF109",
        "weights_from_stale_validators_only",
        H,
        "Only inactive validators are scoring this UID",
        [
            ev("Validators weighting it", len(weighters)),
            ev("Active among them", 0),
            ev("Activity cutoff", duration(cutoff, s), "SubtensorModule.ActivityCutoff"),
            ev("Stalest", f"{duration(oldest, s)} since last set"),
            block_ev(s),
        ],
        "Weights from a validator that has not set weights within the activity cutoff are ignored by the "
        "epoch, so this UID's only scores do not count",
        Fix(kind="info", text="Nothing to change on the miner; active validators need to start scoring it"),
        None,
    )


def pf110_incentive_zero_but_weighted(snap: NeuronSnapshot) -> Finding | None:
    n, s = snap.neuron, snap.subnet
    weighters = _weighters(snap)
    if n is None or n.incentive > 0 or not weighters:
        return None
    total = sum(v.stake for v in s.validators()) or 1.0
    share = sum(v.stake for v, _ in weighters) / total
    if share >= s.params.kappa:
        return None
    return finding(
        "PF110",
        "incentive_zero_but_weighted",
        H,
        f"Weighted by {len(weighters)} validators but clipped to zero",
        [
            ev("Stake share that weighted it", pct(share)),
            ev("Consensus threshold (kappa)", pct(s.params.kappa), "SubtensorModule.Kappa"),
            ev("Incentive", f"{n.incentive:.5f}"),
            block_ev(s),
        ],
        "Yuma consensus clips each weight down to what validators holding at least kappa of the stake "
        f"agree on. Only {pct(share)} of validator stake scored this UID, below kappa, so its consensus "
        "weight and incentive are zero",
        Fix(kind="info", text="More of the large validators need to score this UID; check it answers their queries"),
        f"{DOCS}/internals/consensus",
    )


def pf111_low_trust(snap: NeuronSnapshot) -> Finding | None:
    n, s = snap.neuron, snap.subnet
    if n is None or n.validator_permit or n.incentive <= 0:
        return None
    peers = [m.trust for m in s.neurons if not m.validator_permit and m.incentive > 0]
    mid = median(peers)
    if mid <= 0 or n.trust >= 0.5 * mid:
        return None
    return finding(
        "PF111",
        "low_trust",
        M,
        "Trust is well below the subnet median",
        [ev("Trust", f"{n.trust:.4f}"), ev("Median trust of earning miners", f"{mid:.4f}"), block_ev(s)],
        "Trust is the share of this UID's weight that survived consensus clipping. A low value means "
        "validators disagree about it, so part of what it is given gets clipped away",
        None,
        f"{DOCS}/internals/consensus",
    )


def pf112_duplicate_coldkey_crowding(snap: NeuronSnapshot) -> Finding | None:
    n, s = snap.neuron, snap.subnet
    if n is None:
        return None
    count = Counter(m.coldkey for m in s.neurons)[n.coldkey]
    if count < 5:
        return None
    return finding(
        "PF112",
        "duplicate_coldkey_crowding",
        I,
        f"{count} UIDs on this subnet share this coldkey",
        [ev("Coldkey", n.coldkey), ev("UIDs on this coldkey", count), block_ev(s)],
        "Many UIDs under one coldkey is a common sybil signature that subnet owners and validators look "
        "for. This is informational; plenty of honest operators run several miners",
        None,
        None,
    )


def pf113_version_mismatch(snap: NeuronSnapshot) -> Finding | None:
    s = snap.subnet
    if snap.neuron is None or s.params.weights_version == 0:
        return None
    return finding(
        "PF113",
        "version_mismatch",
        I,
        f"Subnet requires weights version {s.params.weights_version} or newer",
        [ev("WeightsVersionKey", s.params.weights_version, "SubtensorModule.WeightsVersionKey"), block_ev(s)],
        "Validators running code older than this version key are rejected with IncorrectWeightVersionKey. "
        "Compare it with the version your subnet code reports",
        None,
        f"{DOCS}/errors/chain/IncorrectWeightVersionKey",
    )


MINER_RULES: list[Rule[NeuronSnapshot]] = [
    Rule("PF101", "not_registered", C, "Not registered", pf101_not_registered, "any"),
    Rule("PF102", "recently_deregistered", C, "Recently deregistered", pf102_recently_deregistered, "any"),
    Rule("PF103", "in_immunity", I, "In immunity", pf103_in_immunity, "miner"),
    Rule("PF104", "near_pruning", H, "Near pruning", pf104_near_pruning, "miner"),
    Rule("PF105", "axon_not_served", H, "Axon not served", pf105_axon_not_served, "miner"),
    Rule("PF106", "axon_bad_address", H, "Axon address unreachable", pf106_axon_bad_address, "miner"),
    Rule("PF107", "axon_unreachable", H, "Axon did not answer", pf107_axon_unreachable, "miner"),
    Rule("PF108", "no_validator_weight", C, "No validator weight", pf108_no_validator_weight, "miner"),
    Rule("PF109", "weights_from_stale_validators_only", H, "Only stale validators score it", pf109_weights_from_stale_validators_only, "miner"),
    Rule("PF110", "incentive_zero_but_weighted", H, "Weighted but clipped", pf110_incentive_zero_but_weighted, "miner"),
    Rule("PF111", "low_trust", M, "Low trust", pf111_low_trust, "miner"),
    Rule("PF112", "duplicate_coldkey_crowding", I, "Coldkey crowding", pf112_duplicate_coldkey_crowding, "miner"),
    Rule("PF113", "version_mismatch", I, "Weights version", pf113_version_mismatch, "any"),
]  # fmt: skip

