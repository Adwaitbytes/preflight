"""`preflight local break|fix <scenario>`: each break creates one failure the Doctor must
report, and each fix undoes it the way a user would, with btcli where btcli can do it.

Scenarios that only add neurons run on the main subnet. Scenarios that change a subnet-wide
parameter (activity cutoff, weights rate limit, commit reveal, UID cap) each get a small
scratch subnet of their own, so they cannot spoil the main subnet or one another. Every
scenario is safe to rerun: steps already done are skipped and the failure is re-created.
"""

from __future__ import annotations

import ipaddress
import itertools
import math
import os
import shlex
import socket
import subprocess
import sys
from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path

import bittensor as bt

from ..chain.harness import (
    RAO_PER_TAO,
    ChainError,
    DevWallet,
    Submission,
    serve_axon_call,
    wait_until,
)
from ..chain.localnet import LOOPBACK_AXON_IP
from ..models import Model
from .kit import (
    BreakResult,
    Kit,
    KitError,
    LocalNeuron,
    Progress,
    SubmittedExtrinsic,
    format_axon,
    open_kit,
)

ADMIN = bt.calls.AdminUtils
LAB_TEMPO = 20
LAB_VALIDATOR_STAKE_TAO = 500
LOW_STAKE_TAO = 2
# ActivityCutoff becomes tempo x factor / 1000. AdminUtils refuses a direct
# sudo_set_activity_cutoff below MinActivityCutoff (360), but the factor path is accepted
# and gives 40 blocks, about 12 s, on a tempo 20 scratch subnet.
STALE_FACTOR_MILLI = 2_000
RATE_LIMIT_BLOCKS = 3_600
# Drand is unreachable from the container, so timelocked commits never reveal; the long
# reveal period keeps them pending even on a machine where drand does answer.
REVEAL_PERIOD_EPOCHS = 50
SCENARIO_PORT = 8191
UNSERVED_FIX_PORT = SCENARIO_PORT + 3
FALLBACK_LAN_IP = "192.168.1.100"
BTCLI_TIMEOUT_S = 180


class FixResult(Model):
    scenario: str
    netuid: int
    hotkey: str
    rule: str
    command: str
    ran: bool
    steps: list[str]
    block: int


@dataclass(frozen=True)
class Scenario:
    name: str
    rule: str
    description: str
    run: Callable[[Kit], BreakResult]
    fix: Callable[[Kit], FixResult]


def lan_ip() -> str:
    """This machine's LAN address, the one people paste into `--axon.ip` after the chain
    refuses 127.0.0.1. Falls back to a typical private address when the route is not one."""
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as probe:
        try:
            # A UDP connect sends nothing; it only asks the kernel which interface routes.
            probe.connect(("10.255.255.255", 1))
            address = str(probe.getsockname()[0])
        except OSError:
            return FALLBACK_LAN_IP
    try:
        parsed = ipaddress.ip_address(address)
    except ValueError:
        return FALLBACK_LAN_IP
    return address if parsed.is_private and not parsed.is_loopback else FALLBACK_LAN_IP


def submitted(call: str, sent: Submission) -> SubmittedExtrinsic:
    result = sent.result
    block: int | None = None
    index: int | None = None
    if result.extrinsic_id:
        number, _, position = result.extrinsic_id.partition("-")
        block, index = int(number), int(position)
    return SubmittedExtrinsic(
        call=call,
        signer=sent.signer,
        nonce=sent.nonce,
        extrinsic_hash=sent.extrinsic_hash,
        call_data=sent.call_data,
        submitted_at_block=sent.head_block,
        stage="block" if block is not None else "pool",
        block=block,
        index=index,
        error=result.error.name if result.error is not None else None,
        message=None if result.success else result.message,
    )


def _main_miner_uids(kit: Kit) -> list[int]:
    return sorted(
        n.uid
        for n in kit.state.neurons
        if n.role == "miner" and n.scenario is None and n.netuid == kit.state.netuid and n.uid is not None
    )


def _weight_rows(kit: Kit, netuid: int) -> dict[int, dict[int, float]]:
    rows = kit.chain.client.weights.weights(netuid)
    return {int(v): {int(u): float(w) for u, w in row.items()} for v, row in rows.items()}


def _last_update(kit: Kit, netuid: int, hotkey: str) -> int:
    graph = kit.chain.metagraph(netuid)
    live = next((n for n in graph.neurons if n.hotkey == hotkey), None)
    if live is None:
        raise ChainError(f"{hotkey[:8]} is not registered on netuid {netuid}")
    return int(live.last_update)


def _lab_validator(kit: Kit, scenario: str) -> tuple[int, DevWallet, int, int]:
    """A scratch subnet with one staked, permitted validator and one served miner."""
    netuid = kit.lab(scenario, LAB_TEMPO)
    validator, validator_uid = kit.enroll(f"{scenario}-validator", "validator", netuid, scenario=scenario)
    _, miner_uid = kit.enroll(
        f"{scenario}-miner", "miner", netuid, scenario=scenario, axon=(LOOPBACK_AXON_IP, SCENARIO_PORT)
    )
    kit.stake(f"{scenario}-validator", netuid, LAB_VALIDATOR_STAKE_TAO)
    kit.wait_for_permits(netuid, [validator.hotkey_ss58])
    return netuid, validator, validator_uid, miner_uid


def _served(kit: Kit, netuid: int, name: str) -> bool:
    known = kit.state.neuron(name)
    if known is None:
        return False
    graph = kit.chain.metagraph(netuid)
    return any(n.hotkey == known.hotkey and n.axon for n in graph.neurons)


def unserved_axon(kit: Kit) -> BreakResult:
    netuid = kit.state.netuid
    # A fix serves the axon, and serving cannot be undone without leaving 0.0.0.0:1 behind,
    # so a rerun after a fix brings in a fresh miner that never served.
    names = itertools.chain(["unserved-miner"], (f"unserved-miner-{k}" for k in itertools.count(2)))
    name = next(n for n in names if not _served(kit, netuid, n))
    wallet, uid = kit.enroll(name, "miner", netuid, scenario="unserved-axon")
    return kit.result(
        "unserved-axon",
        "PF105",
        netuid,
        wallet.hotkey_ss58,
        uid,
        f"Miner UID {uid} registered on SN{netuid} but never published an axon",
        [f"registered {name} as UID {uid}", "skipped serve_axon, so Axons holds nothing for it"],
    )


def loopback_axon(kit: Kit) -> BreakResult:
    name = "loopback-miner"
    netuid = kit.state.netuid
    port = SCENARIO_PORT + 1
    wallet, uid = kit.enroll(name, "miner", netuid, scenario="loopback-axon")
    first = kit.chain.submit_signed(serve_axon_call(netuid, "127.0.0.1", port), wallet.hotkey)
    if first.result.success:
        raise KitError("the chain accepted a 127.0.0.1 axon; the localnet rule this scenario shows has changed")
    lan = lan_ip()
    second = kit.chain.submit_signed(serve_axon_call(netuid, lan, port), wallet.hotkey)
    if not second.result.success:
        raise ChainError(f"serving {lan} failed: {second.result.message}")
    neuron = kit.state.neuron(name)
    if neuron is not None:
        kit.remember(neuron.model_copy(update={"axon": format_axon(lan, port)}))
    rejected = submitted("SubtensorModule.serve_axon", first)
    return kit.result(
        "loopback-axon",
        "PF106",
        netuid,
        wallet.hotkey_ss58,
        uid,
        f"Miner UID {uid} was refused 127.0.0.1, then advertised its LAN address {lan}:{port}",
        [
            f"serve_axon 127.0.0.1:{port} rejected by the transaction pool: {rejected.error} "
            f"(never included in a block; hash {rejected.extrinsic_hash})",
            f"serve_axon {lan}:{port} landed in extrinsic {second.result.extrinsic_id}",
        ],
        failed_extrinsic=rejected,
        landed_extrinsic=submitted("SubtensorModule.serve_axon", second),
    )


def no_weight_miner(kit: Kit) -> BreakResult:
    name = "unscored-miner"
    netuid = kit.state.netuid
    wallet, uid = kit.enroll(
        name, "miner", netuid, scenario="no-weight-miner", axon=(LOOPBACK_AXON_IP, SCENARIO_PORT + 2)
    )
    scored = [u for u in _main_miner_uids(kit) if u != uid]
    weights = {u: float(rank + 1) for rank, u in enumerate(scored)}
    validators = [n for n in kit.state.neurons if n.role == "validator" and n.scenario is None]
    # Validators stay active and keep scoring the other miners; they just never include
    # this one, which is what a miner that answers in the wrong format looks like.
    for validator in validators:
        kit.chain.set_weights(netuid, kit.wallet(validator.name), weights)
    return kit.result(
        "no-weight-miner",
        "PF108",
        netuid,
        wallet.hotkey_ss58,
        uid,
        f"Miner UID {uid} is served and registered, but no validator's weights include it",
        [
            f"registered {name} as UID {uid} and served {LOOPBACK_AXON_IP}:{SCENARIO_PORT + 2}",
            f"{len(validators)} validators set fresh weights on UIDs {scored} only",
        ],
    )


def low_stake_validator(kit: Kit) -> BreakResult:
    scenario = "low-stake-validator"
    name = "low-stake-validator"
    netuid = kit.state.netuid
    wallet, uid = kit.enroll(name, "validator", netuid, scenario=scenario)
    own = kit.stake(name, netuid, LOW_STAKE_TAO)
    steps = [f"registered {name} as UID {uid} with {own:.4f} alpha of stake"]
    if uid not in _weight_rows(kit, netuid):
        # Only a permit holder may weight other UIDs. Once StakeThreshold sits above its stake
        # the epoch takes the permit away, so a rerun must not wait for one: its weights row
        # is already there, which is what makes the Doctor treat it as a validator.
        kit.wait_for_permits(netuid, [wallet.hotkey_ss58])
        weights = {u: 1.0 for u in _main_miner_uids(kit)}
        kit.chain.set_weights(netuid, wallet, weights)
        steps.append(f"set weights on UIDs {sorted(weights)} while it still could")
    others = [
        kit.alpha_stake(n.netuid, n.hotkey)
        for n in kit.state.neurons
        if n.role == "validator" and n.name != name and n.uid is not None
    ]
    floor = min(others, default=own * 100)
    threshold = min(own * 10, (own + floor) / 2)
    if not own < threshold < floor:
        raise KitError(f"no stake threshold fits between {own:.4f} and the other validators' {floor:.4f}")
    kit.chain.sudo(ADMIN.sudo_set_stake_threshold(min_stake=int(threshold * RAO_PER_TAO)), "stake threshold")
    steps.append(
        f"raised the global StakeThreshold to {threshold:.4f} alpha with sudo; every other "
        f"validator holds at least {floor:.4f}"
    )
    return kit.result(
        scenario,
        "PF204",
        netuid,
        wallet.hotkey_ss58,
        uid,
        f"Validator UID {uid} holds {own:.4f} alpha, below the new StakeThreshold of {threshold:.4f}",
        steps,
    )


def stale_validator(kit: Kit) -> BreakResult:
    scenario = "stale-validator"
    netuid, validator, uid, miner_uid = _lab_validator(kit, scenario)
    steps = [f"scratch subnet SN{netuid} (tempo {LAB_TEMPO}) with validator UID {uid} and miner UID {miner_uid}"]
    if uid not in _weight_rows(kit, netuid):
        kit.chain.set_weights(netuid, validator, {miner_uid: 1.0})
        steps.append("the validator set weights once, then stopped")
    kit.chain.sudo(
        ADMIN.sudo_set_activity_cutoff_factor(netuid=netuid, factor_milli=STALE_FACTOR_MILLI),
        "activity cutoff factor",
    )

    def stale_for() -> int | None:
        cutoff = int(kit.chain.hyperparameters(netuid)["activity_cutoff"])
        since = kit.chain.block - _last_update(kit, netuid, validator.hotkey_ss58)
        return since if since > cutoff else None

    since = wait_until(stale_for, "the validator to pass the activity cutoff", kit.epoch_timeout(netuid))
    cutoff = int(kit.chain.hyperparameters(netuid)["activity_cutoff"])
    steps.append(f"shortened the activity cutoff to {cutoff} blocks with sudo; {since} blocks have passed")
    return kit.result(
        scenario,
        "PF202",
        netuid,
        validator.hotkey_ss58,
        uid,
        f"Validator UID {uid} last set weights {since} blocks ago, past the {cutoff} block activity cutoff",
        steps,
    )


def rate_limited_validator(kit: Kit) -> BreakResult:
    scenario = "rate-limited-validator"
    netuid, validator, uid, miner_uid = _lab_validator(kit, scenario)
    steps = [f"scratch subnet SN{netuid} with validator UID {uid} and miner UID {miner_uid}"]
    limit = int(kit.chain.hyperparameters(netuid)["weights_rate_limit"])
    since = kit.chain.block - _last_update(kit, netuid, validator.hotkey_ss58)
    if limit < RATE_LIMIT_BLOCKS or since >= limit or uid not in _weight_rows(kit, netuid):
        kit.chain.sudo(
            ADMIN.sudo_set_weights_set_rate_limit(netuid=netuid, weights_set_rate_limit=0), "rate limit off"
        )
        kit.chain.set_weights(netuid, validator, {miner_uid: 1.0})
        kit.chain.sudo(
            ADMIN.sudo_set_weights_set_rate_limit(netuid=netuid, weights_set_rate_limit=RATE_LIMIT_BLOCKS),
            "rate limit",
        )
        steps.append(f"set weights, then WeightsSetRateLimit became {RATE_LIMIT_BLOCKS} blocks")
    try:
        kit.chain.set_weights(netuid, validator, {miner_uid: 1.0})
    except ChainError as error:
        steps.append(f"an immediate retry was refused: {error}")
    else:
        raise KitError("a set_weights inside the rate limit was accepted; the rate limit did not apply")
    return kit.result(
        scenario,
        "PF203",
        netuid,
        validator.hotkey_ss58,
        uid,
        f"Validator UID {uid} cannot set weights again for up to {RATE_LIMIT_BLOCKS} blocks",
        steps,
    )


def pending_reveal(kit: Kit) -> BreakResult:
    scenario = "pending-reveal"
    netuid, validator, uid, miner_uid = _lab_validator(kit, scenario)
    steps = [f"scratch subnet SN{netuid} with validator UID {uid} and miner UID {miner_uid}"]
    kit.chain.sudo(ADMIN.sudo_set_commit_reveal_weights_enabled(netuid=netuid, enabled=True), "commit reveal on")
    kit.chain.sudo(
        ADMIN.sudo_set_commit_reveal_weights_interval(netuid=netuid, interval=REVEAL_PERIOD_EPOCHS),
        "reveal period",
    )
    steps.append(f"enabled commit reveal with a reveal period of {REVEAL_PERIOD_EPOCHS} epochs")

    def committed() -> bool:
        rows = kit.chain.client.weights.timelocked_weight_commits(netuid) or {}
        return any(row["hotkey"] == validator.hotkey_ss58 for epoch in rows.values() for row in epoch)

    if not committed():
        kit.chain.set_weights(netuid, validator, {miner_uid: 1.0})
        wait_until(committed, "the timelocked commit to appear", 30)
        steps.append("the validator committed timelocked weights; drand cannot reveal them on localnet")
    return kit.result(
        scenario,
        "PF205",
        netuid,
        validator.hotkey_ss58,
        uid,
        f"Validator UID {uid} has committed weights waiting to be revealed",
        steps,
    )


def deregistered_miner(kit: Kit) -> BreakResult:
    scenario = "deregistered-miner"
    netuid = kit.lab(scenario, LAB_TEMPO)
    run = sum(1 for n in kit.state.neurons if n.name.startswith("dereg-victim-")) + 1
    victim, victim_uid = kit.enroll(f"dereg-victim-{run}", "miner", netuid, scenario=scenario)
    # Pruning needs a full subnet and neurons out of immunity. MaxAllowedUids cannot go below
    # MinAllowedUids (64 by default), so that floor comes down first.
    kit.chain.sudo(ADMIN.sudo_set_min_allowed_uids(netuid=netuid, min_allowed_uids=1), "min uids")
    kit.chain.sudo(ADMIN.sudo_set_min_non_immune_uids(netuid=netuid, min=0), "min non immune uids")
    kit.chain.sudo(ADMIN.sudo_set_immunity_period(netuid=netuid, immunity_period=0), "immunity period")
    seats = len(kit.chain.metagraph(netuid).neurons)
    kit.chain.sudo(ADMIN.sudo_set_max_allowed_uids(netuid=netuid, max_allowed_uids=seats), "max uids")
    newcomer, newcomer_uid = kit.enroll(f"dereg-newcomer-{run}", "miner", netuid, scenario=scenario)
    wait_until(
        lambda: kit.chain.uid_or_none(netuid, victim.hotkey_ss58) is None,
        "the victim to be pruned",
        30,
    )
    lost = kit.state.neuron(f"dereg-victim-{run}")
    if lost is not None:
        kit.remember(lost.model_copy(update={"uid": None}))
    return kit.result(
        scenario,
        "PF102",
        netuid,
        victim.hotkey_ss58,
        victim_uid,
        f"Miner UID {victim_uid} was pruned when {newcomer.hotkey_ss58[:8]} registered into a full subnet",
        [
            f"scratch subnet SN{netuid}; registered the victim as UID {victim_uid}",
            f"with sudo: MinAllowedUids 1, MinNonImmuneUids 0, ImmunityPeriod 0, MaxAllowedUids {seats}",
            f"a newcomer registered and took UID {newcomer_uid}, pruning the lowest emission neuron",
        ],
    )


def run_btcli(args: list[str]) -> str:
    """Run btcli exactly as a user would type it and return that command line.

    The btcli next to this interpreter goes first on PATH, and BT_* variables are dropped so
    a user's own btcli defaults cannot redirect the call to another network or wallet."""
    env = {k: v for k, v in os.environ.items() if not k.startswith("BT_")}
    beside = Path(sys.executable).parent
    if (beside / "btcli").exists():
        env["PATH"] = str(beside) + os.pathsep + env.get("PATH", "")
    argv = ["btcli", *args]
    command = shlex.join(argv)
    try:
        done = subprocess.run(
            argv, env=env, capture_output=True, text=True, timeout=BTCLI_TIMEOUT_S, check=False
        )
    except FileNotFoundError as error:
        raise KitError("btcli is not installed in this environment") from error
    except subprocess.TimeoutExpired as error:
        raise KitError(f"`{command}` did not finish within {BTCLI_TIMEOUT_S}s") from error
    if done.returncode != 0:
        output = (done.stderr or done.stdout).strip().splitlines()[-6:]
        raise KitError(f"`{command}` failed: {' '.join(output)}")
    return command


def _broken(kit: Kit, scenario: str) -> tuple[BreakResult, LocalNeuron, str]:
    """The recorded break, its neuron and that neuron's wallet name."""
    result = kit.state.breaks.get(scenario)
    if result is None:
        raise KitError(f"nothing to fix: run `preflight local break {scenario}` first")
    neuron = next((n for n in kit.state.neurons if n.hotkey == result.hotkey), None)
    if neuron is None or neuron.wallet is None:
        raise KitError(f"the {scenario} neuron has no wallet in this kit")
    return result, neuron, neuron.wallet


def _uid_of(kit: Kit, name: str) -> int:
    neuron = kit.state.neuron(name)
    if neuron is None or neuron.uid is None:
        raise KitError(f"{name} is not registered in this kit")
    return neuron.uid


def _fixed(
    kit: Kit, broken: BreakResult, command: str, steps: list[str], *, ran: bool = True
) -> FixResult:
    kit.forget(broken.scenario)
    return FixResult(
        scenario=broken.scenario,
        netuid=broken.netuid,
        hotkey=broken.hotkey,
        rule=broken.expected_rule,
        command=command,
        ran=ran,
        steps=steps,
        block=kit.settle(),
    )


def _local(kit: Kit, wallet: str, *args: str) -> list[str]:
    return [*args, "--network", "local", *kit.wallet_flags(wallet), "--no-prompt"]


def _serve_mapped_loopback(kit: Kit, scenario: str, port: int) -> FixResult:
    broken, neuron, wallet = _broken(kit, scenario)
    command = run_btcli(
        _local(
            kit,
            wallet,
            "axon", "set", "--netuid", str(broken.netuid), "--ip", LOOPBACK_AXON_IP, "--port", str(port),
        )
    )  # fmt: skip
    kit.remember(neuron.model_copy(update={"axon": format_axon(LOOPBACK_AXON_IP, port)}))
    return _fixed(kit, broken, command, [f"served {LOOPBACK_AXON_IP}:{port}, the address every local validator reaches"])


def _weights_command(kit: Kit, wallet: str, netuid: int, uids: list[int]) -> str:
    return run_btcli(
        _local(
            kit,
            wallet,
            "weights", "set", "--netuid", str(netuid),
            "--uids", ",".join(map(str, uids)), "--weights", ",".join("1" for _ in uids),
        )
    )  # fmt: skip


def fix_unserved_axon(kit: Kit) -> FixResult:
    return _serve_mapped_loopback(kit, "unserved-axon", UNSERVED_FIX_PORT)


def fix_loopback_axon(kit: Kit) -> FixResult:
    return _serve_mapped_loopback(kit, "loopback-axon", SCENARIO_PORT + 1)


def fix_no_weight_miner(kit: Kit) -> FixResult:
    broken, miner, _ = _broken(kit, "no-weight-miner")
    validator = next(
        (n for n in kit.state.neurons if n.role == "validator" and n.scenario is None and n.wallet),
        None,
    )
    if validator is None or validator.wallet is None or miner.uid is None:
        raise KitError("no main validator and registered miner to fix no-weight-miner with")
    uids = sorted({*_main_miner_uids(kit), miner.uid})
    command = _weights_command(kit, validator.wallet, broken.netuid, uids)
    return _fixed(kit, broken, command, [f"{validator.name} set weights on UIDs {uids}, including UID {miner.uid}"])


def fix_low_stake_validator(kit: Kit) -> FixResult:
    broken, neuron, wallet = _broken(kit, "low-stake-validator")
    threshold = int(kit.chain.client.query(bt.storage.SubtensorModule.StakeThreshold) or 0) / RAO_PER_TAO
    own = kit.alpha_stake(broken.netuid, broken.hotkey)
    # Alpha costs about 1.5 TAO on a fresh 10,000 TAO pool; 3x the gap leaves room for slippage.
    amount = max(1, math.ceil((threshold - own) * 3) + 1)
    command = run_btcli(
        _local(
            kit,
            wallet,
            "stake", "add", "--netuid", str(broken.netuid), "--hotkey", broken.hotkey,
            "--amount", str(amount), "--no-mev-shield",
        )
    )  # fmt: skip
    after = wait_until(
        lambda: stake if (stake := kit.alpha_stake(broken.netuid, broken.hotkey)) >= threshold else None,
        "the stake to reach StakeThreshold",
        30,
    )
    kit.remember(neuron.model_copy(update={"stake": after}))
    return _fixed(
        kit,
        broken,
        command,
        [
            f"staked {amount} TAO; stake went from {own:.4f} to {after:.4f} alpha, above the {threshold:.4f} threshold",
            "--no-mev-shield is needed on localnet: a shielded stake never lands there",
        ],
    )


def fix_stale_validator(kit: Kit) -> FixResult:
    broken, _, wallet = _broken(kit, "stale-validator")
    command = _weights_command(kit, wallet, broken.netuid, [_uid_of(kit, "stale-validator-miner")])
    return _fixed(kit, broken, command, ["the validator set weights again, so LastUpdate is fresh"])


def fix_rate_limited_validator(kit: Kit) -> FixResult:
    broken, _, wallet = _broken(kit, "rate-limited-validator")
    miner_uid = _uid_of(kit, "rate-limited-validator-miner")
    allowed = _last_update(kit, broken.netuid, broken.hotkey) + RATE_LIMIT_BLOCKS
    kit.chain.sudo(
        ADMIN.sudo_set_weights_set_rate_limit(netuid=broken.netuid, weights_set_rate_limit=0), "rate limit off"
    )
    command = _weights_command(kit, wallet, broken.netuid, [miner_uid])
    return _fixed(
        kit,
        broken,
        command,
        [
            f"a user waits until block {allowed:,}; the kit stands in for that wait by setting "
            "WeightsSetRateLimit back to 0 with sudo",
            "the validator set weights again and the chain accepted them",
        ],
    )


def fix_pending_reveal(kit: Kit) -> FixResult:
    raise KitError(
        "pending-reveal has no fix on localnet: timelocked commits reveal only when the chain "
        "receives the drand round, and the container cannot reach drand"
    )


def fix_deregistered_miner(kit: Kit) -> FixResult:
    broken, neuron, wallet = _broken(kit, "deregistered-miner")
    command = shlex.join(
        ["btcli", *_local(kit, wallet, "subnets", "register", "--netuid", str(broken.netuid))]
    )
    # btcli forces the MEV shield for burned_register (and refuses --no-mev-shield), and the
    # shielded extrinsic never lands on localnet, so the kit submits the same call in the clear.
    uid = kit.chain.register(broken.netuid, kit.wallet(wallet))
    kit.remember(neuron.model_copy(update={"uid": uid}))
    return _fixed(
        kit,
        broken,
        command,
        [
            f"registered again and got UID {uid}",
            "btcli cannot do this on localnet: it forces the MEV shield for burned_register, which "
            "never lands there, so the kit submitted the same burned_register unshielded",
        ],
        ran=False,
    )


def fix_scenario(name: str, *, home: Path | None = None, progress: Progress | None = None) -> FixResult:
    """Undo a break the way a user would, so the Doctor stops reporting its rule."""
    scenario = SCENARIOS.get(name)
    if scenario is None:
        raise KitError(f"unknown scenario {name!r}; choose one of {', '.join(SCENARIOS)}")
    kit = open_kit(home, progress)
    try:
        return scenario.fix(kit)
    finally:
        kit.close()


SCENARIOS: dict[str, Scenario] = {
    s.name: s
    for s in (
        Scenario("unserved-axon", "PF105", "a registered miner that never served an axon", unserved_axon, fix_unserved_axon),
        Scenario("loopback-axon", "PF106", "127.0.0.1 refused by the chain, then a LAN address served", loopback_axon, fix_loopback_axon),
        Scenario("stale-validator", "PF202", "a validator that stopped setting weights", stale_validator, fix_stale_validator),
        Scenario("rate-limited-validator", "PF203", "a validator inside WeightsSetRateLimit", rate_limited_validator, fix_rate_limited_validator),
        Scenario("low-stake-validator", "PF204", "a validator below StakeThreshold", low_stake_validator, fix_low_stake_validator),
        Scenario("pending-reveal", "PF205", "committed weights not yet revealed", pending_reveal, fix_pending_reveal),
        Scenario("deregistered-miner", "PF102", "a miner pruned by a newer registration", deregistered_miner, fix_deregistered_miner),
        Scenario("no-weight-miner", "PF108", "a served miner no validator scores", no_weight_miner, fix_no_weight_miner),
    )
}  # fmt: skip

__all__ = ["SCENARIOS", "FixResult", "Scenario", "fix_scenario", "lan_ip", "run_btcli"]
