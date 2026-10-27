"""Health for every subnet from one bulk read, for the directory grid.

`get_all_metagraphs` returns every subnet's neurons and parameters in a single runtime call
(26 s on finney, measured 2026-10-28) instead of about 1,900 per-subnet reads, and five map
queries add the registration counters the subnet rules need. The result feeds the same
`health()` and subnet rules as the detail page, so the grid and the page agree. Weight rows
and burn history are not part of the bulk read; no subnet rule or health factor needs them.
"""

from __future__ import annotations

import ipaddress
from typing import Any

from ..chain import registry as R
from ..chain.network import Pinned, gather
from ..chain.snapshot import SubnetParams, SubnetSnapshot
from ..models import AxonInfo, Health, NeuronState
from .health import health

RAO = 1_000_000_000
U16 = 65535


def _list(row: dict[str, Any], key: str, n: int, default: Any = 0) -> list[Any]:
    value = row.get(key)
    items: list[Any] = list(value) if isinstance(value, list) else []  # pyright: ignore[reportUnknownArgumentType]  # decoded SCALE
    return items + [default] * (n - len(items))


def _axon(raw: Any) -> AxonInfo | None:
    if not isinstance(raw, dict) or not raw.get("ip"):
        return None
    number = int(raw["ip"])  # pyright: ignore[reportUnknownArgumentType]
    version = 6 if int(raw.get("ip_type") or 4) == 6 else 4  # pyright: ignore[reportUnknownArgumentType]
    try:
        address = ipaddress.IPv6Address(number) if version == 6 else ipaddress.IPv4Address(number)
    except ValueError:
        return None
    return AxonInfo(ip=str(address), port=int(raw.get("port") or 0), ip_type=version)  # pyright: ignore[reportUnknownArgumentType]


def _neurons(row: dict[str, Any]) -> list[NeuronState]:
    hotkeys = [str(h) for h in _list(row, "hotkeys", 0)]
    n = len(hotkeys)
    coldkeys = _list(row, "coldkeys", n, "")
    active = _list(row, "active", n, False)
    permit = _list(row, "validator_permit", n, False)
    incentive = _list(row, "incentives", n)
    consensus = _list(row, "consensus", n)
    dividends = _list(row, "dividends", n)
    emission = _list(row, "emission", n)
    last_update = _list(row, "last_update", n)
    registered = _list(row, "block_at_registration", n)
    stake = _list(row, "total_stake", n)
    axons = _list(row, "axons", n, None)
    return [
        NeuronState(
            uid=uid,
            hotkey=hotkeys[uid],
            coldkey=str(coldkeys[uid]),
            active=bool(active[uid]),
            validator_permit=bool(permit[uid]),
            stake=int(stake[uid] or 0) / RAO,
            incentive=int(incentive[uid] or 0) / U16,
            trust=0.0,  # not in the bulk read; only the per-neuron PF111 uses it
            consensus=int(consensus[uid] or 0) / U16,
            dividends=int(dividends[uid] or 0) / U16,
            emission=int(emission[uid] or 0) / RAO,
            last_update=int(last_update[uid] or 0),
            block_at_registration=int(registered[uid] or 0),
            axon=_axon(axons[uid]),
        )
        for uid in range(n)
    ]


def snapshot_from_bulk(pinned: Pinned, row: dict[str, Any], counters: dict[str, dict[int, int]], globals_: dict[str, int]) -> SubnetSnapshot:
    netuid = int(row["netuid"])
    identity = row.get("identity") if isinstance(row.get("identity"), dict) else {}
    name_bytes = row.get("name")
    name = str((identity or {}).get("subnet_name") or (bytes(name_bytes).decode(errors="replace") if isinstance(name_bytes, list) else f"SN{netuid}"))  # pyright: ignore[reportUnknownArgumentType]
    params = SubnetParams(
        tempo=int(row.get("tempo") or 360),
        immunity_period=int(row.get("immunity_period") or 0),
        max_uids=int(row.get("max_uids") or 0),
        max_validators=int(row.get("max_validators") or 64),
        weights_rate_limit=int(row.get("weights_rate_limit") or 0),
        activity_cutoff=int(row.get("activity_cutoff") or 0),
        min_allowed_weights=int(row.get("min_allowed_weights") or 0),
        max_weights_limit=int(row.get("max_weights_limit") or U16) / U16,
        weights_version=int(row.get("weights_version") or 0),
        kappa=int(row.get("kappa") or 32767) / U16,
        commit_reveal=bool(row.get("commit_reveal_weights_enabled")),
        reveal_period_epochs=int(row.get("commit_reveal_period") or 1),
        registration_allowed=bool(row.get("registration_allowed", True)),
        max_regs_per_block=int(row.get("max_regs_per_block") or 1),
        target_regs_per_interval=int(row.get("target_regs_per_interval") or 1),
        adjustment_interval=int(row.get("adjustment_interval") or 0),
        min_burn_tao=int(row.get("min_burn") or 0) / RAO,
        max_burn_tao=int(row.get("max_burn") or 0) / RAO,
        serving_rate_limit=int(row.get("serving_rate_limit") or 0),
        liquid_alpha=bool(row.get("liquid_alpha_enabled")),
    )
    return SubnetSnapshot(
        chain=pinned.ref,
        netuid=netuid,
        name=name,
        owner_coldkey=str(row.get("owner_coldkey") or "") or None,
        owner_hotkey=str(row.get("owner_hotkey") or "") or None,
        params=params,
        neurons=_neurons(row),
        weights={},
        burn_tao=int(row.get("burn") or 0) / RAO,
        regs_this_block=counters["block"].get(netuid, 0),
        regs_this_interval=counters["interval"].get(netuid, 0),
        last_adjustment_block=counters["adjustment"].get(netuid, 0),
        first_emission_block=counters["first_emission"].get(netuid) or None,
        registered_at=int(row.get("network_registered_at") or 0),
        start_call_delay=globals_["start_call_delay"],
        stake_threshold=globals_["stake_threshold"] / RAO,
        immune_owner_uids_limit=counters["owner_limit"].get(netuid, 1),
        last_epoch_block=int(row.get("last_step") or 0),
        block_seconds=12.0 if pinned.network.name != "local" else 0.25,
    )


def _map(pinned: Pinned, item: Any) -> dict[int, int]:
    return {int(k): int(v or 0) for k, v in pinned.query_map(item)}


def health_all(pinned: Pinned) -> dict[int, Health]:
    got = gather(
        {
            "rows": lambda: pinned.runtime(R.API_ALL_METAGRAPHS, []),
            "interval": lambda: _map(pinned, R.REGS_THIS_INTERVAL),
            "block": lambda: _map(pinned, R.REGS_THIS_BLOCK),
            "adjustment": lambda: _map(pinned, R.LAST_ADJUSTMENT_BLOCK),
            "first_emission": lambda: _map(pinned, R.FIRST_EMISSION_BLOCK),
            "owner_limit": lambda: _map(pinned, R.IMMUNE_OWNER_UIDS_LIMIT),
            "start_call_delay": lambda: int(pinned.query(R.START_CALL_DELAY) or 0),
            "stake_threshold": lambda: int(pinned.query(R.STAKE_THRESHOLD) or 0),
        }
    )
    counters = {k: got[k] for k in ("interval", "block", "adjustment", "first_emission", "owner_limit")}
    globals_ = {"start_call_delay": got["start_call_delay"], "stake_threshold": got["stake_threshold"]}
    scores: dict[int, Health] = {}
    for row in got["rows"] or []:
        if not row or int(row.get("netuid", 0)) == 0:
            continue
        scores[int(row["netuid"])] = health(snapshot_from_bulk(pinned, row, counters, globals_))
    return scores
