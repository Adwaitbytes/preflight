"""Hand-built snapshots for rule tests: a small healthy subnet you can break one field at a time."""

from __future__ import annotations

from typing import Any

from preflight.core.chain.snapshot import NeuronSnapshot, SubnetParams, SubnetSnapshot
from preflight.core.models import AxonInfo, ChainRef, NetworkName, NeuronState

BLOCK = 100_000
OWNER_COLD = "5OwnerCold"
OWNER_HOT = "5OwnerHot"


def neuron(uid: int, **overrides: Any) -> NeuronState:
    fields: dict[str, Any] = {
        "uid": uid,
        "hotkey": f"5Hot{uid}",
        "coldkey": f"5Cold{uid}",
        "active": True,
        "validator_permit": False,
        "stake": 10.0,
        "incentive": 0.1,
        "trust": 0.9,
        "consensus": 0.1,
        "dividends": 0.0,
        "emission": 5.0 + uid,
        "last_update": BLOCK - 50,
        "block_at_registration": BLOCK - 20_000,
        "axon": AxonInfo(ip="34.1.2.3", port=8000 + uid),
    }
    fields.update(overrides)
    return NeuronState(**fields)


def validator(uid: int, **overrides: Any) -> NeuronState:
    base: dict[str, Any] = {
        "validator_permit": True,
        "stake": 5_000.0,
        "incentive": 0.0,
        "dividends": 0.2,
        "axon": None,
    }
    base.update(overrides)
    return neuron(uid, **base)


def params(**overrides: Any) -> SubnetParams:
    fields: dict[str, Any] = {
        "tempo": 360,
        "immunity_period": 5000,
        "max_uids": 8,
        "max_validators": 4,
        "weights_rate_limit": 100,
        "activity_cutoff": 5000,
        "min_allowed_weights": 1,
        "max_weights_limit": 1.0,
        "weights_version": 0,
        "kappa": 0.5,
        "commit_reveal": False,
        "reveal_period_epochs": 1,
        "registration_allowed": True,
        "max_regs_per_block": 1,
        "target_regs_per_interval": 2,
        "adjustment_interval": 360,
        "min_burn_tao": 0.0005,
        "max_burn_tao": 100.0,
        "serving_rate_limit": 50,
    }
    fields.update(overrides)
    return SubnetParams(**fields)


def subnet(
    neurons: list[NeuronState] | None = None,
    weights: dict[int, dict[int, float]] | None = None,
    network: NetworkName = "finney",
    **overrides: Any,
) -> SubnetSnapshot:
    """Validators 0 and 1, miners 2 to 5, owner hotkey at UID 6. Validators weight all miners."""
    if neurons is None:
        neurons = [
            validator(0),
            validator(1, stake=3_000.0),
            neuron(2),
            neuron(3),
            neuron(4),
            neuron(5),
            neuron(6, hotkey=OWNER_HOT, coldkey=OWNER_COLD, incentive=0.0, emission=0.0),
        ]
    if weights is None:
        weights = {0: {2: 0.25, 3: 0.25, 4: 0.25, 5: 0.25}, 1: {2: 0.25, 3: 0.25, 4: 0.25, 5: 0.25}}
    fields: dict[str, Any] = {
        "chain": ChainRef(network=network, endpoint="ws://test", block=BLOCK, block_hash="0xabc"),
        "netuid": 7,
        "name": "Test",
        "owner_coldkey": OWNER_COLD,
        "owner_hotkey": OWNER_HOT,
        "params": params(),
        "neurons": neurons,
        "weights": weights,
        "burn_tao": 1.0,
        "regs_this_block": 0,
        "regs_this_interval": 0,
        "last_adjustment_block": BLOCK - 100,
        "first_emission_block": 1_000,
        "registered_at": 500,
        "start_call_delay": 0,
        "stake_threshold": 1_000.0,
        "immune_owner_uids_limit": 1,
        "last_epoch_block": BLOCK - 10,
    }
    fields.update(overrides)
    return SubnetSnapshot(**fields)


def snap(uid: int | None, s: SubnetSnapshot | None = None, **overrides: Any) -> NeuronSnapshot:
    s = s or subnet()
    found = s.by_uid(uid) if uid is not None else None
    hotkey = found.hotkey if found else "5Stranger"
    fields: dict[str, Any] = {"subnet": s, "hotkey": hotkey, "uid": uid}
    fields.update(overrides)
    return NeuronSnapshot(**fields)


def replace(s: SubnetSnapshot, uid: int, **changes: Any) -> SubnetSnapshot:
    return s.model_copy(
        update={"neurons": [n.model_copy(update=changes) if n.uid == uid else n for n in s.neurons]}
    )
