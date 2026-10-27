"""Subnet launch planner: what registering a subnet costs right now, and when things happen.

Every number is read at one pinned block. The lock cost is the runtime's own answer
(`SubnetRegistrationRuntimeApi.get_network_registration_cost`); its per-block decay is
measured by asking the same API one block earlier instead of porting the formula, because
the deployed runtime decays faster than the mirrored `get_network_lock_cost`
(coinbase/root.rs L253) reads. The subnet the runtime would dissolve at the cap is
`get_subnet_to_prune`, which ports `get_network_to_prune` (coinbase/root.rs L344): the
lowest moving alpha price among subnets past their network immunity.
"""

from __future__ import annotations

import math
from collections.abc import Callable
from typing import Any

from ..chain import registry as R
from ..chain.network import Network, Pinned, gather, pin
from ..models import LaunchPlan, TimelineStep
from .hyperparams import DEFAULTS, RAO, explain_hyperparams, raw_int, span

UNUSED_NETUID = 65535  # never registered; per-subnet storage reads back its default here


def _tao(value: Any) -> float:
    return raw_int(value) / RAO


def _optional(read: Callable[[], Any]) -> Callable[[], Any]:
    def run() -> Any:
        try:
            return read()
        except Exception:  # absent storage or an older runtime; the caller has a fallback
            return None

    return run


def decode_text(value: Any) -> str | None:
    """Runtime API strings arrive as byte lists or str."""
    if value is None:
        return None
    if isinstance(value, list | tuple | bytes):
        try:
            text = bytes(value).decode("utf-8").strip()  # pyright: ignore[reportUnknownArgumentType]
        except (ValueError, TypeError):
            return None
        return text or None
    text = str(value).strip()
    return text or None


def subnet_name(info: Any) -> str | None:
    """Identity name first, then the on-chain subnet_name, from a dynamic info row."""
    if not isinstance(info, dict):
        return None
    identity = info.get("subnet_identity")
    if isinstance(identity, dict):
        name = decode_text(identity.get("subnet_name"))  # pyright: ignore[reportUnknownArgumentType]
        if name:
            return name
    return decode_text(info.get("subnet_name"))


DEFAULT_PREFIX = "default:"


def default_reads(pinned: Pinned) -> dict[str, Callable[[], Any]]:
    """One read per per-subnet default, keyed `default:<hyperparameter>`, to merge into a
    caller's gather so nothing nests on the shared executor."""
    return {
        DEFAULT_PREFIX + key: _optional(lambda item=item: pinned.query(item, [UNUSED_NETUID]))
        for key, item in R.FRESH_SUBNET_DEFAULTS.items()
    }


def merge_defaults(got: dict[str, Any]) -> dict[str, Any]:
    """`DEFAULTS` with every per-subnet default the live runtime reported layered on top."""
    live = {
        key.removeprefix(DEFAULT_PREFIX): value
        for key, value in got.items()
        if key.startswith(DEFAULT_PREFIX) and value is not None
    }
    return {**DEFAULTS, **live}


def launch_plan(network: Network) -> LaunchPlan:
    pinned = pin(network)
    q = pinned.query
    got = gather(
        {
            "cost": lambda: pinned.runtime(R.API_NETWORK_REGISTRATION_COST, []),
            "cost_before": _optional(
                lambda: pinned.client.runtime(
                    R.API_NETWORK_REGISTRATION_COST, [], block=pinned.block - 1
                )
            ),
            "min_lock": lambda: q(R.NETWORK_MIN_LOCK_COST),
            "last_lock": lambda: q(R.NETWORK_LAST_LOCK_COST),
            "interval": lambda: q(R.NETWORK_LOCK_REDUCTION_INTERVAL),
            "rate_limit": lambda: q(R.NETWORK_RATE_LIMIT),
            "last_registered": _optional(
                lambda: q(R.LAST_RATE_LIMITED_BLOCK, [R.NETWORK_LAST_REGISTERED_KEY])
            ),
            "start_block": _optional(lambda: q(R.NETWORK_REGISTRATION_START_BLOCK)),
            "limit": lambda: q(R.SUBNET_LIMIT),
            "total": lambda: q(R.TOTAL_NETWORKS),
            "immunity": lambda: q(R.NETWORK_IMMUNITY_PERIOD),
            "start_delay": lambda: q(R.START_CALL_DELAY),
            "prune": _optional(lambda: pinned.runtime(R.API_SUBNET_TO_PRUNE, [])),
            "block_time": _optional(pinned.client.block_time),
            **default_reads(pinned),
        }
    )
    block = pinned.block
    block_seconds = float(got["block_time"] or 12.0)
    cost = _tao(got["cost"])
    min_lock = _tao(got["min_lock"])
    rate_limit = raw_int(got["rate_limit"])
    # TotalNetworks counts root (netuid 0), which never counts against SubnetLimit.
    subnet_count = max(raw_int(got["total"]) - 1, 0)
    subnet_limit = raw_int(got["limit"])
    at_cap = subnet_count >= subnet_limit
    replaced = raw_int(got["prune"]) if got["prune"] is not None else None
    replaced_name = None
    if at_cap and replaced is not None:
        info = _optional(lambda: pinned.runtime(R.API_DYNAMIC_INFO, [replaced]))()
        replaced_name = subnet_name(info)

    next_allowed: int | None = None
    if got["last_registered"] is not None:
        # check_passes_rate_limit, utils/rate_limiting.rs: block - last >= limit, or last == 0
        last = raw_int(got["last_registered"])
        next_allowed = max(block, last + rate_limit) if last else block
        next_allowed = max(next_allowed, raw_int(got["start_block"]))

    defaults_raw = merge_defaults(got)
    defaults = explain_hyperparams(defaults_raw, block_seconds)
    timeline = _timeline(
        block=next_allowed if next_allowed is not None else block,
        rate_limited=next_allowed is not None and next_allowed > block,
        cost=cost,
        min_lock=min_lock,
        decay_per_block=(_tao(got["cost_before"]) - cost)
        if got["cost_before"] is not None
        else None,
        head=block,
        at_cap=at_cap,
        replaced=replaced,
        replaced_name=replaced_name,
        start_delay=raw_int(got["start_delay"]),
        tempo=raw_int(defaults_raw.get("tempo"), 360),
        immunity=raw_int(got["immunity"]),
        block_seconds=block_seconds,
    )
    return LaunchPlan(
        chain=pinned.ref,
        lock_cost_tao=cost,
        min_lock_tao=min_lock,
        last_lock_tao=_tao(got["last_lock"]),
        lock_reduction_interval=raw_int(got["interval"]),
        rate_limit_blocks=rate_limit,
        next_registration_block=next_allowed,
        subnet_count=subnet_count,
        subnet_limit=subnet_limit,
        replaced_netuid=replaced if at_cap else None,
        replaced_name=replaced_name,
        network_immunity_blocks=raw_int(got["immunity"]),
        start_call_delay=raw_int(got["start_delay"]),
        timeline=timeline,
        defaults=defaults,
        block_seconds=block_seconds,
    )


def _timeline(
    *,
    block: int,
    rate_limited: bool,
    cost: float,
    min_lock: float,
    decay_per_block: float | None,
    head: int,
    at_cap: bool,
    replaced: int | None,
    replaced_name: str | None,
    start_delay: int,
    tempo: int,
    immunity: int,
    block_seconds: float,
) -> list[TimelineStep]:
    def wait(blocks: int) -> str:
        return span(blocks, block_seconds)

    register = [f"Locks {cost:,.4f} TAO at block {head:,}"]
    if decay_per_block and decay_per_block > 0 and cost > min_lock:
        floor_at = head + math.ceil((cost - min_lock) / decay_per_block)
        register.append(
            f"the cost falls by about {decay_per_block:,.4f} TAO per block and reaches the "
            f"{min_lock:,.4f} TAO floor at block {floor_at:,}"
        )
        if block > head:
            later = max(cost - decay_per_block * (block - head), min_lock)
            register.append(f"about {later:,.4f} TAO at block {block:,}")
    register.append("each registration doubles the cost for the next one")
    if rate_limited:
        register.append(
            f"network registration is rate limited until block {block:,}, {wait(block - head)} from now"
        )
    if at_cap and replaced is not None:
        name = f"SN{replaced} {replaced_name}" if replaced_name else f"SN{replaced}"
        register.append(
            f"the subnet cap is reached, so the runtime dissolves {name} and queues this "
            "registration until its cleanup finishes"
        )
    start_at = block + start_delay
    # start_call sets FirstEmissionBlockNumber to the next block (subnets/subnet.rs L645);
    # the epoch that pays it out fires once `tempo` blocks pass since LastEpochBlock, which
    # init_new_network staggers to at most one tempo back, so payout lands within a tempo.
    first_payout = start_at + 1 + tempo
    return [
        TimelineStep(label="Register network", block=block, detail="; ".join(register)),
        TimelineStep(
            label="Start call allowed",
            block=start_at,
            detail=(
                "The owner can call start_call right after registering"
                if start_delay == 0
                else f"StartCallDelay is {wait(start_delay)} after registration"
            ),
        ),
        TimelineStep(
            label="First emissions",
            block=first_payout,
            detail=(
                f"Emission starts the block after start_call ({start_at + 1:,}); the first epoch "
                f"pays it out within one tempo, {wait(tempo)}, by block {first_payout:,}"
            ),
        ),
        TimelineStep(
            label="Immunity ends",
            block=block + immunity,
            detail=(
                f"After {wait(immunity)} the subnet can be dissolved when a new one registers at "
                "the cap, if its moving alpha price is the lowest"
            ),
        ),
    ]
