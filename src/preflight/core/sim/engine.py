"""Try it before you pay: run one action against live state without broadcasting anything.

When a Chopsticks fork is running the verdict comes from the real runtime executing the
extrinsic on forked state (rung 1b). Otherwise it is predicted from live reads and the
ported pallet checks (rung 3). Either way the ported checks are shown as evidence, and
fees and effects come from the SDK's own `plan()`.
"""

from __future__ import annotations

import time
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

import bittensor as bt
from bittensor.sp_core import Keypair, ss58_encode

from .. import validate
from ..chain import registry as R
from ..chain.network import Network, Pinned, gather, pin, with_retries
from ..chain.snapshot import SubnetSnapshot, read_subnet
from ..models import BalanceChange, DecodedArg, DispatchFailure, SimRequest, SimResult
from ..tx.context import ExplainContext
from ..tx.explain import explain
from . import rules
from .fork import ApplyOutcome, ForkUnavailable, get_fork

RAO = 1_000_000_000
# `Owner` is a ValueQuery: an unknown hotkey reads as the all-zero account, not None.
ZERO_ACCOUNT = ss58_encode(bytes(32), 42)
HOTKEY_SIGNED = {"set_weights", "serve_axon"}

Checker = Callable[[SimRequest, Any, rules.AccountState, rules.GlobalState], rules.Prediction]
CHECKS: dict[str, Checker] = {
    "burned_register": rules.burned_register,
    "add_stake": rules.add_stake,
    "remove_stake": rules.remove_stake,
    "set_weights": rules.set_weights,
    "serve_axon": rules.serve_axon,
    "register_network": rules.register_network,
    "start_call": rules.start_call,
}


@dataclass(frozen=True)
class WatchWallet:
    """Public keys only: enough for the SDK to build and price a call, never to sign."""

    coldkey: Keypair
    hotkey: Keypair

    @property
    def coldkeypub(self) -> Keypair:
        return self.coldkey

    @property
    def hotkey_ss58(self) -> str:
        return str(self.hotkey.ss58_address)


def _validate(req: SimRequest) -> SimRequest:
    if req.action in HOTKEY_SIGNED:
        if not req.hotkey:
            raise validate.InvalidInput(f"{req.action} is signed by a hotkey; pass hotkey")
    elif not req.coldkey:
        raise validate.InvalidInput(f"{req.action} is signed by a coldkey; pass coldkey")
    if req.coldkey:
        validate.ss58(req.coldkey, "coldkey")
    if req.hotkey:
        validate.ss58(req.hotkey, "hotkey")
    if req.action != "register_network" and validate.netuid(req.netuid) is None:
        raise validate.InvalidInput(f"{req.action} needs a netuid")
    if req.action in {"add_stake", "remove_stake"} and (req.amount is None or req.amount <= 0):
        raise validate.InvalidInput("amount must be a positive number")
    if req.action == "burned_register" and not req.hotkey:
        raise validate.InvalidInput("burned_register needs the hotkey to register")
    if req.action in {"add_stake", "remove_stake"} and not req.hotkey:
        raise validate.InvalidInput(f"{req.action} needs the hotkey to stake to")
    if req.action == "set_weights" and (not req.uids or len(req.uids) != len(req.weights)):
        raise validate.InvalidInput("set_weights needs uids and weights of the same length")
    if req.action == "serve_axon" and (not req.ip or not req.port):
        raise validate.InvalidInput("serve_axon needs ip and port")
    return req


def _intent(req: SimRequest) -> Any:
    netuid = req.netuid or 0
    hotkey = req.hotkey or ""
    match req.action:
        case "burned_register":
            return bt.BurnedRegister(netuid=netuid, hotkey_ss58=hotkey)
        case "add_stake":
            return bt.AddStake(hotkey, netuid, float(req.amount or 0))
        case "remove_stake":
            return bt.RemoveStake(hotkey, netuid, float(req.amount or 0))
        case "set_weights":
            return bt.SetWeights(netuid, uids=list(req.uids), weights=list(req.weights), version_key=req.version_key)
        case "serve_axon":
            return bt.ServeAxon(netuid, req.ip or "", int(req.port or 0))
        case "register_network":
            return bt.RegisterSubnet(hotkey_ss58=hotkey or (req.coldkey or ""))
        case "start_call":
            return bt.StartCall(netuid)


def _raw_call(req: SimRequest, plan_call: Any) -> Any:
    # Registration on its own path: BurnedRegister forces the MEV shield wrapper, which the
    # fork cannot decrypt; the inner call is what the runtime would dispatch.
    if req.action == "burned_register":
        return bt.calls.SubtensorModule.burned_register(netuid=req.netuid or 0, hotkey=req.hotkey or "")
    return plan_call


def _account(pinned: Pinned, req: SimRequest, signer: str) -> rules.AccountState:
    reads: dict[str, Callable[[], Any]] = {"account": lambda: pinned.query(R.ACCOUNT, [signer])}
    if req.hotkey:
        reads["owner"] = lambda: pinned.query(R.OWNER, [req.hotkey])
    if req.hotkey and req.coldkey and req.netuid is not None:
        reads["stake"] = lambda: pinned.view.staking.get(req.coldkey, req.hotkey, req.netuid)
    got = gather(reads)
    account = got.get("account") or {}
    free = int(((account.get("data") or {}).get("free")) or 0) if isinstance(account, dict) else 0
    stake = got.get("stake")
    owner = got.get("owner")
    owner = None if not owner or str(owner) == ZERO_ACCOUNT else str(owner)
    return rules.AccountState(
        free_tao=free / RAO,
        stake_alpha=int(getattr(stake, "rao", 0) or 0) / RAO,
        hotkey_owner=owner,
        hotkey_registered_anywhere=bool(owner),
    )


def _globals(pinned: Pinned, req: SimRequest, fee: float) -> rules.GlobalState:
    lock = last = limit = None
    if req.action == "register_network":
        got = gather(
            {
                "lock": lambda: pinned.view.subnets.subnet_registration_cost(),
                "limit": lambda: pinned.query(R.NETWORK_RATE_LIMIT),
            }
        )
        lock = int(getattr(got["lock"], "rao", 0) or 0) / RAO
        limit = int(got["limit"] or 0)
    return rules.GlobalState(block=pinned.block, fee_tao=fee, lock_cost_tao=lock, last_network_registration=last, network_rate_limit=limit)


def _quote(pinned: Pinned, req: SimRequest) -> tuple[str, float] | None:
    try:
        if req.action == "add_stake":
            q = pinned.view.prices.quote_stake(req.netuid, float(req.amount or 0))
        elif req.action == "remove_stake":
            q = pinned.view.prices.quote_unstake(req.netuid, float(req.amount or 0))
        else:
            return None
    except Exception:  # a quote is a nicety; the verdict does not depend on it
        return None
    received = getattr(q, "amount_out", None) or getattr(q, "received", None)
    value = float(getattr(received, "tao", received) or 0) if received is not None else None
    if value is None:
        return None
    return ("alpha" if req.action == "add_stake" else "TAO", value)


def _args(req: SimRequest) -> list[DecodedArg]:
    out: list[DecodedArg] = []
    for name in ("coldkey", "hotkey", "netuid", "amount", "uids", "weights", "ip", "port", "version_key", "balance_override_tao"):
        value = getattr(req, name)
        if value in (None, [], 0) and name != "netuid":
            continue
        if value is None:
            continue
        out.append(DecodedArg(name=name, value=f"SN{value}" if name == "netuid" else str(value)))
    return out


def _changes(req: SimRequest, acct: rules.AccountState, s: SubnetSnapshot | None, g: rules.GlobalState, quote: tuple[str, float] | None) -> list[BalanceChange]:
    signer = req.coldkey or req.hotkey or ""
    before = acct.free_tao
    spend = g.fee_tao
    if req.action == "burned_register" and s is not None:
        spend += s.burn_tao
    elif req.action == "add_stake":
        spend += req.amount or 0.0
    elif req.action == "register_network":
        spend += g.lock_cost_tao or 0.0
    changes = [BalanceChange(account=signer, label="Free TAO", before=f"{before:,.6f}", after=f"{before - spend:,.6f}", delta=f"-{spend:,.6f}")]
    if quote is not None:
        unit, amount = quote
        changes.append(BalanceChange(account=req.hotkey or "", label=f"{'Stake' if unit == 'alpha' else 'Free TAO'} received", before="", after=f"{amount:,.6f} {unit}", delta=f"+{amount:,.6f} {unit}"))
    return changes


def simulate(network: Network, req: SimRequest, *, use_fork: bool = True) -> SimResult:
    started = time.monotonic()
    req = _validate(req)
    pinned = pin(network)
    intent = _intent(req)
    signer = (req.hotkey if req.action in HOTKEY_SIGNED else req.coldkey) or ""
    wallet = WatchWallet(Keypair(ss58_address=req.coldkey or signer), Keypair(ss58_address=req.hotkey or signer))

    subnet: SubnetSnapshot | None = None
    if req.action != "register_network":
        subnet = with_retries(network, lambda: read_subnet(pinned, req.netuid or 0))
    plan = with_retries(network, lambda: pinned.client.plan(intent, wallet))
    fee = float(plan.fee.tao) if plan.fee is not None else 0.0
    acct = with_retries(network, lambda: _account(pinned, req, signer))
    if req.balance_override_tao is not None:
        acct = rules.AccountState(req.balance_override_tao, acct.stake_alpha, acct.hotkey_owner, acct.hotkey_registered_anywhere)
    g = _globals(pinned, req, fee)
    prediction = rules.Prediction()
    # The transaction payment extension runs before dispatch: no fee, no execution.
    prediction.check("Balance covers the fee", acct.free_tao >= fee, f"{acct.free_tao:,.6f} TAO free for a {fee:.6f} fee", "Payment")
    action_checks = CHECKS[req.action](req, subnet, acct, g)
    prediction.checks.extend(action_checks.checks)
    prediction.error = prediction.error or action_checks.error

    outcome: ApplyOutcome | None = None
    fork_block = None
    fork = get_fork(network) if use_fork else None
    if fork is not None:
        try:
            outcome, fork_block = fork.apply(_raw_call(req, plan.call), signer, coldkey=req.coldkey, free_tao=req.balance_override_tao)
        except ForkUnavailable:
            outcome = None

    if outcome is not None:
        mode, ok = "fork", outcome.ok
        error, pallet = outcome.error, outcome.pallet
        label = f"Executed with the real runtime on a fork of {network.name} block {fork_block:,}; nothing was broadcast"
    else:
        mode, ok = "predicted", prediction.error is None
        error, pallet = prediction.error, "SubtensorModule" if prediction.error else None
        label = f"Predicted from live state at block {pinned.block:,} and the runtime's own checks; start a fork with `preflight fork` to execute it for real"

    failure = explanation = None
    if not ok and error:
        failure = DispatchFailure(pallet=pallet or "Runtime", error=error)
        ctx = ExplainContext(
            network=network.name,
            call=req.action,
            netuid=req.netuid,
            hotkey=req.hotkey,
            coldkey=req.coldkey,
            block=pinned.block,
            amount_tao=req.amount,
            balance_tao=acct.free_tao,
            burn_tao=subnet.burn_tao if subnet else g.lock_cost_tao,
            ip=req.ip,
            weights_count=len(req.uids) if req.uids else None,
            min_allowed_weights=subnet.params.min_allowed_weights if subnet else None,
            stake=neuron.stake if (neuron := subnet.by_hotkey(req.hotkey or "") if subnet else None) else None,
            stake_threshold=subnet.stake_threshold if subnet else None,
            last_update=neuron.last_update if neuron else None,
            rate_limit=subnet.params.weights_rate_limit if subnet else None,
            required_version=subnet.params.weights_version or None if subnet else None,
            version_key=req.version_key,
        )
        explanation = explain(error, ctx, pallet)
        failure = failure.model_copy(update={"code": explanation.code, "description": explanation.title, "docs": explanation.docs})

    overrides = [f"free balance of {req.coldkey} set to {req.balance_override_tao:,.4f} TAO"] if req.balance_override_tao is not None and req.coldkey else []
    quote = _quote(pinned, req) if ok else None
    return SimResult(
        chain=pinned.ref,
        action=req.action,
        signer=signer,
        args=_args(req),
        mode=mode,  # type: ignore[arg-type]  # one of the two Literal values above
        mode_label=label,
        would_succeed=ok,
        failure=failure,
        explanation=explanation,
        fee_tao=fee,
        effects=list(plan.effects),
        balance_changes=_changes(req, acct, subnet, g, quote) if ok else [],
        checks=prediction.checks,
        overrides=overrides,
        elapsed_ms=int((time.monotonic() - started) * 1000),
    )


__all__ = ["ForkUnavailable", "simulate"]
