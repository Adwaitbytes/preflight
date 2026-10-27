"""Snapshots: everything a rule may look at, read once at one pinned block.

Rules never touch the chain. They read these models, which are plain data, so real
finney reads can be recorded as JSON fixtures and replayed offline in tests.
"""

from __future__ import annotations

import contextlib
import ipaddress
from collections.abc import Callable
from typing import Any

from bittensor import metagraph as sdk_metagraph
from pydantic import Field

from ..models import AxonInfo, ChainRef, Model, NeuronState
from . import registry as R
from .network import Pinned, gather

RAO = 1_000_000_000
U16 = 65535


def _tolerant_axon_endpoint(axon: Any) -> str | None:
    """The SDK's metagraph builder raises on one malformed axon and fails the whole subnet:
    testnet SN51 has a neuron advertising ip_type 4 with a value past 2**32 (seen
    2026-10-28). One bad advertisement must not hide every other neuron, so it reads as
    unserved here."""
    try:
        return _sdk_axon_endpoint(axon)
    except ValueError:
        return None


_sdk_axon_endpoint = sdk_metagraph._axon_endpoint  # pyright: ignore[reportPrivateUsage]  # patched once, below
sdk_metagraph._axon_endpoint = _tolerant_axon_endpoint  # pyright: ignore[reportPrivateUsage]


class SubnetParams(Model):
    tempo: int
    immunity_period: int
    max_uids: int
    max_validators: int
    weights_rate_limit: int
    activity_cutoff: int
    min_allowed_weights: int
    max_weights_limit: float = Field(description="Fraction of total weight one UID may get")
    weights_version: int
    kappa: float
    commit_reveal: bool
    reveal_period_epochs: int
    registration_allowed: bool
    max_regs_per_block: int
    target_regs_per_interval: int
    adjustment_interval: int
    min_burn_tao: float
    max_burn_tao: float
    serving_rate_limit: int
    yuma_version: int | None = None
    liquid_alpha: bool = False


class PendingCommit(Model):
    kind: str = Field(description="'hash' for WeightCommits, 'timelocked' for drand commits")
    commit_block: int
    reveal_from_block: int | None = None
    reveal_until_block: int | None = None
    reveal_round: int | None = None
    reveals_at: str | None = None


class SubnetSnapshot(Model):
    chain: ChainRef
    netuid: int
    name: str
    exists: bool = True
    owner_coldkey: str | None
    owner_hotkey: str | None
    params: SubnetParams
    neurons: list[NeuronState]
    weights: dict[int, dict[int, float]] = Field(
        description="Validator UID to its latest normalized weight row"
    )
    burn_tao: float
    burn_history: list[tuple[int, float]] = Field(default_factory=list)
    regs_this_block: int
    regs_this_interval: int
    last_adjustment_block: int
    first_emission_block: int | None
    registered_at: int
    start_call_delay: int
    stake_threshold: float = Field(description="Minimum stake weight to set weights, in alpha")
    miner_burned: float | None = Field(
        default=None, description="Share of miner emission burned or recycled, 0..1"
    )
    recycle_or_burn: str | None = None
    immune_owner_uids_limit: int
    last_epoch_block: int
    block_seconds: float = 12.0
    timelocked_commits: dict[str, list[PendingCommit]] = Field(
        default={}, description="Hotkey to its pending drand commits"
    )

    @property
    def block(self) -> int:
        return self.chain.block

    def by_uid(self, uid: int) -> NeuronState | None:
        return next((n for n in self.neurons if n.uid == uid), None)

    def by_hotkey(self, hotkey: str) -> NeuronState | None:
        return next((n for n in self.neurons if n.hotkey == hotkey), None)

    def is_immune(self, neuron: NeuronState) -> bool:
        """`get_neuron_is_immune`, utils/misc.rs L569."""
        return self.block - neuron.block_at_registration < self.params.immunity_period

    def owner_immune_uids(self) -> set[int]:
        """`get_immune_owner_tuples`, subnets/registration.rs L469: the owner hotkey plus the
        owner coldkey's oldest hotkeys, up to `ImmuneOwnerUidsLimit`."""
        limit = self.immune_owner_uids_limit
        owned = sorted(
            (n for n in self.neurons if self.owner_coldkey and n.coldkey == self.owner_coldkey),
            key=lambda n: (n.block_at_registration, n.uid),
        )
        uids = [n.uid for n in owned][:limit]
        owner = self.by_hotkey(self.owner_hotkey) if self.owner_hotkey else None
        if owner is not None and owner.uid not in uids:
            uids = [owner.uid, *uids][:limit]
        return set(uids)

    def validators(self) -> list[NeuronState]:
        return [n for n in self.neurons if n.validator_permit]


class Deregistration(Model):
    last_seen_block: int
    lost_at_block: int
    uid: int
    incentive: float
    emission: float


class ProbeResult(Model):
    address: str
    ok: bool
    error: str | None = None
    elapsed_ms: int


class NeuronSnapshot(Model):
    subnet: SubnetSnapshot
    hotkey: str
    uid: int | None
    commits: list[PendingCommit] = Field(default_factory=list)
    previous_weights: dict[int, dict[int, float]] = Field(
        default={}, description="Weight rows one tempo before the pinned block, for PF208"
    )
    deregistration: Deregistration | None = None
    probe: ProbeResult | None = None

    @property
    def neuron(self) -> NeuronState | None:
        return self.subnet.by_uid(self.uid) if self.uid is not None else None


def _balance(value: Any) -> float:
    """SDK Balance (TAO or alpha) or raw rao to a float in whole units."""
    rao = getattr(value, "rao", None)
    if rao is not None:
        return int(rao) / RAO
    if isinstance(value, int | float):
        return float(value) / RAO
    return 0.0


def _int(value: Any, default: int = 0) -> int:
    if value is None:
        return default
    if isinstance(value, dict):
        bits: Any = value.get("bits", default)  # pyright: ignore[reportUnknownMemberType]  # decoded SCALE dict
        return int(bits)
    number: Any = value
    return int(number)


def parse_axon(value: Any) -> AxonInfo | None:
    """Metagraph axons come as 'ip:port' or '[v6]:port'; None when never served."""
    if not value:
        return None
    text = str(value)
    if text.startswith("["):
        host, _, port = text[1:].partition("]:")
    else:
        host, _, port = text.rpartition(":")
    if not host or not port.isdigit():
        return None
    try:
        version = ipaddress.ip_address(host).version
    except ValueError:
        version = 4
    return AxonInfo(ip=host, port=int(port), ip_type=version)


def _neuron(n: Any) -> NeuronState:
    return NeuronState(
        uid=int(n.uid),
        hotkey=str(n.hotkey),
        coldkey=str(n.coldkey),
        active=bool(n.active),
        validator_permit=bool(n.validator_permit),
        stake=_balance(n.total_stake),
        incentive=float(n.incentive),
        trust=float(n.trust),
        consensus=float(n.consensus),
        dividends=float(n.dividends),
        emission=_balance(n.emission),
        last_update=int(n.last_update),
        block_at_registration=int(n.block_at_registration),
        axon=parse_axon(n.axon),
    )


def _fixed_u128(value: Any) -> float | None:
    """FixedU128 stored as {'bits': n} with 64 fractional bits... or 18 decimals."""
    if value is None:
        return None
    bits = value.get("bits") if isinstance(value, dict) else value
    if bits is None:
        return None
    # subtensor's FixedU128 here is substrate_fixed U64F64: 64 fractional bits.
    return int(bits) / float(1 << 64)


def _timelocked(rows_by_epoch: Any) -> dict[str, list[PendingCommit]]:
    commits: dict[str, list[PendingCommit]] = {}
    for rows in (rows_by_epoch or {}).values():
        for row in rows:
            reveals_at = row.get("reveals_at")
            commits.setdefault(str(row["hotkey"]), []).append(
                PendingCommit(
                    kind="timelocked",
                    commit_block=int(row["commit_block"]),
                    reveal_round=int(row["reveal_round"]),
                    reveals_at=reveals_at.isoformat() if reveals_at else None,
                )
            )
    return commits


def _optional(read: Callable[[], Any]) -> Callable[[], Any]:
    """Reads that legitimately fail on some subnets or runtimes resolve to None."""

    def run() -> Any:
        try:
            return read()
        except Exception:  # absent storage or an unsupported runtime API
            return None

    return run


def read_subnet(pinned: Pinned, netuid: int, *, burn_history: int = 0) -> SubnetSnapshot:
    view = pinned.view
    q = pinned.query
    got = gather(
        {
            "graph": lambda: view.subnets.metagraph(netuid, commitments=False),
            "hp": lambda: view.subnets.subnet_hyperparameters(netuid),
            "weights": lambda: view.weights.weights(netuid),
            "burn": lambda: view.subnets.burn(netuid),
            "timelocked": _optional(lambda: view.weights.timelocked_weight_commits(netuid)),
            "first_emission": lambda: q(R.FIRST_EMISSION_BLOCK, [netuid]),
            "regs_block": lambda: q(R.REGS_THIS_BLOCK, [netuid]),
            "regs_interval": lambda: q(R.REGS_THIS_INTERVAL, [netuid]),
            "last_adjustment": lambda: q(R.LAST_ADJUSTMENT_BLOCK, [netuid]),
            "start_call_delay": lambda: q(R.START_CALL_DELAY),
            "stake_threshold": lambda: q(R.STAKE_THRESHOLD),
            "miner_burned": _optional(lambda: q(R.MINER_BURNED, [netuid])),
            "recycle_or_burn": _optional(lambda: q(R.RECYCLE_OR_BURN, [netuid])),
            "owner_limit": lambda: q(R.IMMUNE_OWNER_UIDS_LIMIT, [netuid]),
            "last_epoch": lambda: q(R.LAST_EPOCH_BLOCK, [netuid]),
            "block_time": _optional(pinned.client.block_time),
        }
    )
    graph = got["graph"]
    if graph is None:
        raise LookupError(f"netuid {netuid} does not exist at block {pinned.block}")
    raw: dict[str, Any] = graph.raw if isinstance(graph.raw, dict) else {}
    hp: dict[str, Any] = got["hp"] or {}
    weights = {
        int(v): {int(u): float(w) for u, w in row.items()} for v, row in got["weights"].items()
    }
    params = SubnetParams(
        tempo=int(hp.get("tempo", raw.get("tempo", 360))),
        immunity_period=int(hp.get("immunity_period", 0)),
        max_uids=int(raw.get("max_uids") or graph.max_uids),
        max_validators=int(hp.get("max_validators", 64)),
        weights_rate_limit=int(hp.get("weights_rate_limit", 0)),
        activity_cutoff=int(hp.get("activity_cutoff", 0)),
        min_allowed_weights=int(hp.get("min_allowed_weights", 0)),
        max_weights_limit=int(hp.get("max_weights_limit", U16)) / U16,
        weights_version=int(hp.get("weights_version", 0)),
        kappa=int(hp.get("kappa", 32767)) / U16,
        commit_reveal=bool(hp.get("commit_reveal_weights_enabled", False)),
        reveal_period_epochs=int(hp.get("commit_reveal_period", 1)),
        registration_allowed=bool(hp.get("registration_allowed", True)),
        max_regs_per_block=int(hp.get("max_regs_per_block", 1)),
        target_regs_per_interval=int(hp.get("target_regs_per_interval", 1)),
        adjustment_interval=int(raw.get("adjustment_interval") or 0),
        min_burn_tao=int(hp.get("min_burn", 0)) / RAO,
        max_burn_tao=int(hp.get("max_burn", 0)) / RAO,
        serving_rate_limit=int(hp.get("serving_rate_limit", 0)),
        yuma_version=int(hp["yuma_version"]) if "yuma_version" in hp else None,
        liquid_alpha=bool(hp.get("liquid_alpha_enabled", False)),
    )
    burn = _balance(got["burn"])
    history = (
        read_burn_history(pinned, netuid, burn_history, params.tempo, burn) if burn_history else []
    )
    return SubnetSnapshot(
        chain=pinned.ref,
        netuid=netuid,
        name=str(graph.name or f"SN{netuid}"),
        owner_coldkey=str(graph.owner_coldkey) if graph.owner_coldkey else None,
        owner_hotkey=str(graph.owner_hotkey) if graph.owner_hotkey else None,
        params=params,
        neurons=[_neuron(n) for n in graph.neurons],
        weights=weights,
        burn_tao=burn,
        burn_history=history,
        regs_this_block=_int(got["regs_block"]),
        regs_this_interval=_int(got["regs_interval"]),
        last_adjustment_block=_int(got["last_adjustment"]),
        first_emission_block=_int(got["first_emission"]) or None,
        registered_at=int(raw.get("network_registered_at") or graph.network_registered_at or 0),
        start_call_delay=_int(got["start_call_delay"]),
        stake_threshold=_int(got["stake_threshold"]) / RAO,
        miner_burned=_fixed_u128(got["miner_burned"]),
        recycle_or_burn=str(got["recycle_or_burn"] or "") or None,
        immune_owner_uids_limit=_int(got["owner_limit"], 1),
        last_epoch_block=_int(got["last_epoch"]),
        block_seconds=float(got["block_time"] or 12.0),
        timelocked_commits=_timelocked(got["timelocked"]),
    )


def read_burn_history(
    pinned: Pinned, netuid: int, points: int, step: int, current: float
) -> list[tuple[int, float]]:
    """`Burn` sampled once per tempo going back `points` tempos, oldest first."""
    blocks = [pinned.block - k * max(step, 1) for k in range(points, 0, -1)]
    reads = {
        str(block): _optional(
            lambda block=block: pinned.client.query(R.BURN, [netuid], block=block)
        )
        for block in blocks
        if block > 0
    }
    # Pruned state on non-archive nodes reads as None and is skipped.
    values = gather(reads)
    history = [(int(b), _int(v) / RAO) for b, v in values.items() if v is not None]
    history.append((pinned.block, current))
    return history


def read_commits(pinned: Pinned, subnet: SubnetSnapshot, hotkey: str) -> list[PendingCommit]:
    commits = list(subnet.timelocked_commits.get(hotkey, []))
    rows = pinned.query(R.WEIGHT_COMMITS, [subnet.netuid, hotkey]) or []
    for row in rows:
        values = list(row.values()) if isinstance(row, dict) else list(row)
        if len(values) < 4:
            continue
        commits.append(
            PendingCommit(
                kind="hash",
                commit_block=_int(values[1]),
                reveal_from_block=_int(values[2]),
                reveal_until_block=_int(values[3]),
            )
        )
    return commits


def uid_at(pinned: Pinned, netuid: int, hotkey: str, block: int) -> int | None:
    value = pinned.client.query(R.UIDS, [netuid, hotkey], block=block)
    return None if value is None else int(value)


def find_deregistration(
    pinned: Pinned, netuid: int, hotkey: str, *, window: int = 7200 * 3
) -> Deregistration | None:
    """The block where the hotkey lost its UID, searched back from the pinned block.

    Gallops back in doubling steps until a block where the hotkey held a UID, then binary
    searches the gap. That finds recent losses on young chains, and stops cleanly where a
    non-archive node has pruned state. None when no seat is found within `window` blocks.
    """
    # Probe the gallop points (1, 2, 4, ... blocks back) in one concurrent round.
    steps: list[int] = []
    step = 1
    while step <= window and pinned.block - step >= 1:
        steps.append(step)
        step *= 2
    probes = gather(
        {str(k): _optional(lambda k=k: uid_at(pinned, netuid, hotkey, pinned.block - k)) for k in steps}
    )
    high = pinned.block
    low: int | None = None
    for k in steps:
        if probes[str(k)] is not None:
            low = pinned.block - k
            break
        high = pinned.block - k
    if low is None:
        return None
    # Invariant: registered at `low`, not registered at `high`.
    while high - low > 1:
        mid = (low + high) // 2
        if uid_at(pinned, netuid, hotkey, mid) is not None:
            low = mid
        else:
            high = mid
    uid = uid_at(pinned, netuid, hotkey, low)
    if uid is None:
        return None
    incentive = 0.0
    emission = 0.0
    with contextlib.suppress(Exception):
        incentives = pinned.client.query(R.EMISSION, [netuid], block=low) or []
        emission = _balance(incentives[uid]) if uid < len(incentives) else 0.0
        vector = pinned.client.query(("SubtensorModule", "Incentive"), [netuid], block=low) or []
        incentive = int(vector[uid]) / U16 if uid < len(vector) else 0.0
    return Deregistration(
        last_seen_block=low, lost_at_block=high, uid=uid, incentive=incentive, emission=emission
    )


def read_neuron(
    pinned: Pinned,
    netuid: int,
    hotkey: str,
    *,
    subnet: SubnetSnapshot | None = None,
    search_history: bool = True,
) -> NeuronSnapshot:
    snapshot = subnet or read_subnet(pinned, netuid, burn_history=0)
    neuron = snapshot.by_hotkey(hotkey)
    if neuron is None:
        if search_history:
            history = read_burn_history(
                pinned, netuid, 6, snapshot.params.tempo, snapshot.burn_tao
            )
            snapshot = snapshot.model_copy(update={"burn_history": history})
        dereg = find_deregistration(pinned, netuid, hotkey) if search_history else None
        return NeuronSnapshot(subnet=snapshot, hotkey=hotkey, uid=None, deregistration=dereg)
    reads: dict[str, Callable[[], Any]] = {"commits": lambda: read_commits(pinned, snapshot, hotkey)}
    if neuron.validator_permit and neuron.uid in snapshot.weights:
        reads["previous"] = lambda: read_weights_at(pinned, netuid, pinned.block - snapshot.params.tempo)
    got = gather(reads)
    return NeuronSnapshot(
        subnet=snapshot,
        hotkey=hotkey,
        uid=neuron.uid,
        commits=got["commits"],
        previous_weights=got.get("previous") or {},
    )


def read_weights_at(pinned: Pinned, netuid: int, block: int) -> dict[int, dict[int, float]]:
    try:
        view: Any = pinned.client.at(block)  # namespaces resolve dynamically
        rows = view.weights.weights(netuid)
    except Exception:  # pruned history on a non-archive node; PF208 then stays silent
        return {}
    return {int(v): {int(u): float(w) for u, w in row.items()} for v, row in rows.items()}
