"""Rung 3: predict an extrinsic's outcome from live state and the runtime's own checks.

Each action runs the checks its pallet function runs, in the same order, so the first
failing check names the error the chain would return. Sources: subtensor at the commit
mirrored on bittensor.com/code (see registry.SOURCE), file and line on each check.
"""

from __future__ import annotations

import ipaddress
from dataclasses import dataclass, field

from ..chain import registry as R
from ..chain.snapshot import SubnetSnapshot
from ..models import Evidence, SimRequest

U16 = 65535


@dataclass(frozen=True)
class AccountState:
    free_tao: float
    stake_alpha: float = 0.0
    hotkey_owner: str | None = None
    hotkey_registered_anywhere: bool = False


@dataclass
class Prediction:
    checks: list[Evidence] = field(default_factory=list)
    error: str | None = None

    def check(self, label: str, ok: bool, detail: str, error: str, source: str | None = None) -> bool:
        self.checks.append(Evidence(label=label, value=("pass: " if ok else "fail: ") + detail, source=source))
        if not ok and self.error is None:
            self.error = error
        return ok


@dataclass(frozen=True)
class GlobalState:
    block: int
    fee_tao: float
    lock_cost_tao: float | None = None
    last_network_registration: int | None = None
    network_rate_limit: int | None = None
    min_stake_tao: float = 0.0005


def burned_register(req: SimRequest, s: SubnetSnapshot, acct: AccountState, g: GlobalState) -> Prediction:
    """`do_burned_registration`, subnets/registration.rs."""
    p = Prediction()
    params = s.params
    p.check("Registration open", params.registration_allowed, f"NetworkRegistrationAllowed is {params.registration_allowed}", "SubNetRegistrationDisabled", f"{R.SOURCE}/subnets/registration.rs")
    p.check("Per block cap", s.regs_this_block < params.max_regs_per_block, f"{s.regs_this_block} of {params.max_regs_per_block} used this block", "TooManyRegistrationsThisBlock")
    cap = 3 * params.target_regs_per_interval
    p.check("Per interval cap", s.regs_this_interval < cap, f"{s.regs_this_interval} of {cap} used this interval", "TooManyRegistrationsThisInterval")
    already = req.hotkey is not None and s.by_hotkey(req.hotkey) is not None
    p.check("Hotkey not already registered", not already, "hotkey already holds a UID" if already else "no UID yet", "HotKeyAlreadyRegisteredInSubNet")
    if acct.hotkey_owner and req.coldkey and acct.hotkey_owner != req.coldkey:
        p.check("Hotkey owned by this coldkey", False, f"hotkey belongs to {acct.hotkey_owner}", "NonAssociatedColdKey")
    needed = s.burn_tao + g.fee_tao
    p.check("Balance covers burn and fee", acct.free_tao >= needed, f"{acct.free_tao:,.4f} TAO free, needs {s.burn_tao:,.4f} burn + {g.fee_tao:.6f} fee", "NotEnoughBalanceToStake")
    return p


def add_stake(req: SimRequest, s: SubnetSnapshot, acct: AccountState, g: GlobalState) -> Prediction:
    """`do_add_stake`, staking/add_stake.rs and staking/helpers.rs validation."""
    p = Prediction()
    amount = req.amount or 0.0
    p.check("Subnet started", s.first_emission_block is not None, "start_call done" if s.first_emission_block else "owner has not called start_call", "SubtokenDisabled")
    p.check("Hotkey exists", acct.hotkey_registered_anywhere, "hotkey is registered" if acct.hotkey_registered_anywhere else "hotkey has no account on chain", "HotKeyAccountNotExists")
    p.check("Above minimum stake", amount >= g.min_stake_tao, f"{amount:,.4f} TAO vs minimum {g.min_stake_tao}", "AmountTooLow")
    p.check("Balance covers amount and fee", acct.free_tao >= amount + g.fee_tao, f"{acct.free_tao:,.4f} TAO free, needs {amount:,.4f} + {g.fee_tao:.6f} fee", "NotEnoughBalanceToStake")
    return p


def remove_stake(req: SimRequest, s: SubnetSnapshot, acct: AccountState, g: GlobalState) -> Prediction:
    p = Prediction()
    amount = req.amount or 0.0
    p.check("Subnet started", s.first_emission_block is not None, "start_call done" if s.first_emission_block else "owner has not called start_call", "SubtokenDisabled")
    p.check("Stake covers amount", acct.stake_alpha >= amount, f"{acct.stake_alpha:,.4f} alpha staked, removing {amount:,.4f}", "NotEnoughStakeToWithdraw")
    p.check("Balance covers fee", acct.free_tao >= g.fee_tao, f"{acct.free_tao:,.6f} TAO free for a {g.fee_tao:.6f} fee", "Payment")
    return p


def set_weights(req: SimRequest, s: SubnetSnapshot, acct: AccountState, g: GlobalState) -> Prediction:
    """`internal_set_weights`, subnets/weights.rs L971, checks 2 to 15 in order."""
    p = Prediction()
    uids, values = req.uids, req.weights
    src = R.SRC_SET_WEIGHTS
    p.check("Commit reveal off", not s.params.commit_reveal, "plain set_weights allowed" if not s.params.commit_reveal else "subnet uses commit reveal", "CommitRevealEnabled", src)
    p.check("UIDs and weights same length", len(uids) == len(values), f"{len(uids)} uids, {len(values)} weights", "WeightVecNotEqualSize", src)
    p.check("Not more UIDs than the subnet has", len(uids) <= len(s.neurons), f"{len(uids)} of {len(s.neurons)}", "UidsLengthExceedUidsInSubNet", src)
    neuron = s.by_hotkey(req.hotkey or "")
    if not p.check("Hotkey registered", neuron is not None, "hotkey has a UID" if neuron else "hotkey has no UID on this subnet", "HotKeyNotRegisteredInSubNet", src):
        return p
    assert neuron is not None
    owner = req.hotkey == s.owner_hotkey
    p.check("Stake at least StakeThreshold", owner or neuron.stake >= s.stake_threshold, "owner hotkey is exempt" if owner else f"{neuron.stake:,.2f} vs {s.stake_threshold:,.2f}", "NotEnoughStakeToSetWeights", src)
    required = s.params.weights_version
    p.check("Version key", required == 0 or req.version_key >= required, f"sent {req.version_key}, subnet requires {required}", "IncorrectWeightVersionKey", R.SRC_VERSION_KEY)
    since = g.block - neuron.last_update
    limit = s.params.weights_rate_limit
    p.check("Rate limit", neuron.last_update == 0 or since >= limit, f"{since:,} blocks since last set, limit {limit:,}", "SettingWeightsTooFast", R.SRC_RATE_LIMIT)
    self_only = uids == [neuron.uid]
    p.check("Validator permit", neuron.validator_permit or self_only, "permit held" if neuron.validator_permit else "no permit, only a self weight is allowed", "NeuronNoValidatorPermit", src)
    p.check("No duplicate UIDs", len(set(uids)) == len(uids), f"{len(uids) - len(set(uids))} duplicates", "DuplicateUids", src)
    valid = {n.uid for n in s.neurons}
    bad = [u for u in uids if u not in valid]
    p.check("UIDs exist", not bad, f"unknown UIDs {bad[:5]}" if bad else "all UIDs registered", "UidVecContainInvalidOne", src)
    needed = min(s.params.min_allowed_weights, len(s.neurons))
    p.check("At least MinAllowedWeights", self_only or len(uids) >= needed, f"{len(uids)} UIDs, needs {needed}", "WeightVecLengthIsLow", R.SRC_CHECK_LENGTH)
    total = sum(values) or 1.0
    top = max(values) / total if values else 0.0
    p.check("Max weight limit", self_only or top <= s.params.max_weights_limit + 1e-9, f"largest share {top:.1%}, cap {s.params.max_weights_limit:.1%}", "MaxWeightExceeded", src)
    return p


def _ip_valid(ip: str) -> tuple[bool, str]:
    """`is_valid_ip_address`, subnets/serving.rs L222: rejects 0, 127.0.0.1 and ::1."""
    try:
        address = ipaddress.ip_address(ip)
    except ValueError:
        return False, f"{ip} is not an IP address"
    number = int(address)
    if number == 0:
        return False, "the zero address is rejected"
    if address.version == 4 and number == 0x7F000001:
        return False, "127.0.0.1 is rejected; use ::ffff:127.0.0.1 locally"
    if address.version == 6 and number == 1:
        return False, "::1 is rejected"
    return True, f"{ip} is accepted"


def serve_axon(req: SimRequest, s: SubnetSnapshot, acct: AccountState, g: GlobalState) -> Prediction:
    """`do_serve_axon`, subnets/serving.rs."""
    p = Prediction()
    neuron = s.by_hotkey(req.hotkey or "")
    p.check("Hotkey registered", neuron is not None, "hotkey has a UID" if neuron else "no UID on this subnet", "HotKeyNotRegisteredInNetwork", f"{R.SOURCE}/subnets/serving.rs")
    ok, detail = _ip_valid(req.ip or "")
    p.check("IP accepted", ok, detail, "InvalidIpAddress", R.SRC_VALID_IP)
    port = req.port or 0
    p.check("Port non zero", 0 < port < 65536, f"port {port}", "InvalidPort")
    return p


def register_network(req: SimRequest, s: SubnetSnapshot | None, acct: AccountState, g: GlobalState) -> Prediction:
    """`do_register_network`, subnets/subnet.rs."""
    p = Prediction()
    lock = g.lock_cost_tao or 0.0
    if g.last_network_registration is not None and g.network_rate_limit:
        since = g.block - g.last_network_registration
        p.check("Network rate limit", since >= g.network_rate_limit, f"{since:,} blocks since the last registration, limit {g.network_rate_limit:,}", "NetworkTxRateLimitExceeded")
    p.check("Balance covers lock and fee", acct.free_tao >= lock + g.fee_tao, f"{acct.free_tao:,.4f} TAO free, lock {lock:,.4f} + fee {g.fee_tao:.6f}", "NotEnoughBalanceToStake")
    return p


def start_call(req: SimRequest, s: SubnetSnapshot, acct: AccountState, g: GlobalState) -> Prediction:
    """`do_start_call`, subnets/subnet.rs."""
    p = Prediction()
    owner = s.owner_coldkey
    p.check("Signer owns the subnet", req.coldkey == owner, f"owner is {owner}", "NotSubnetOwner")
    p.check("Not started yet", s.first_emission_block is None, "already started" if s.first_emission_block else "not started", "FirstEmissionBlockNumberAlreadySet")
    ready = s.registered_at + s.start_call_delay
    p.check("Start call delay passed", g.block >= ready, f"allowed from block {ready:,}", "NeedWaitingMoreBlocksToStarCall")
    return p
