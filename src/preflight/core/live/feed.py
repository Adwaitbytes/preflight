"""The live feed: every extrinsic in recent blocks as one plain sentence, newest last.

Blocks are immutable once read, so each decoded block is cached by number. Housekeeping
calls every block carries (timestamp, drand pulses, shield key rotation) are counted, not
listed, so the feed shows what people did. Batches and proxies are unwrapped to the calls
inside them.
"""

from __future__ import annotations

import threading
from collections import OrderedDict
from typing import Any

from ..chain.decode import failure_from
from ..chain.network import Network, Pinned, gather, pin, with_retries
from ..models import Activity, ActivityKind, LiveBlock, LiveFeed

RAO = 1_000_000_000
SYSTEM_CALLS = {
    ("Timestamp", "set"),
    ("Drand", "write_pulse"),
    ("MevShield", "announce_next_key"),
}
WRAPPERS = {("Utility", "batch"), ("Utility", "batch_all"), ("Utility", "force_batch"), ("Proxy", "proxy"), ("Proxy", "proxy_announced"), ("Sudo", "sudo")}
MAX_BLOCKS = 12
_cache: OrderedDict[str, LiveBlock] = OrderedDict()
_cache_lock = threading.Lock()


def short(address: Any) -> str:
    text = str(address or "")
    return f"{text[:6]}...{text[-4:]}" if len(text) >= 46 else text or "someone"


def _args(call: dict[str, Any]) -> dict[str, Any]:
    return {str(a.get("name")): a.get("value") for a in call.get("call_args") or []}


def _tao(value: Any, unit: str = "TAO") -> str | None:
    try:
        amount = int(value) / RAO
    except (TypeError, ValueError):
        return None
    text = f"{amount:,.4f}".rstrip("0").rstrip(".") if amount < 1000 else f"{amount:,.0f}"
    return f"{text} {unit}"


def _inner(call: dict[str, Any]) -> list[dict[str, Any]]:
    args = _args(call)
    if isinstance(args.get("calls"), list):
        return [c for c in args["calls"] if isinstance(c, dict)]
    if isinstance(args.get("call"), dict):
        return [args["call"]]
    return []


def describe(call: dict[str, Any], signer: Any) -> tuple[ActivityKind, str, int | None, str | None]:
    """(kind, sentence, netuid, amount) for one call."""
    module = str(call.get("call_module", ""))
    function = str(call.get("call_function", ""))
    a = _args(call)
    netuid = int(a["netuid"]) if isinstance(a.get("netuid"), int) else None
    sn = f"SN{netuid}" if netuid is not None else "a subnet"
    who = short(signer)
    if (module, function) in WRAPPERS:
        inner = _inner(call)
        if not inner:
            return "other", f"{who} sent an empty {function}", None, None
        kind, sentence, inner_netuid, amount = describe(inner[0], signer)
        more = f" and {len(inner) - 1} more call{'s' if len(inner) > 2 else ''}" if len(inner) > 1 else ""
        via = " through a proxy" if module == "Proxy" else ""
        return kind, f"{sentence}{more}{via}", inner_netuid, amount
    if module == "SubtensorModule":
        if "weights" in function:
            uids = a.get("dests") or a.get("uids")
            count = f" for {len(uids)} UIDs" if isinstance(uids, list) else ""
            verb = "committed encrypted weights" if "commit" in function else "revealed weights" if "reveal" in function else "set weights"
            return "weights", f"Validator {who} {verb} on {sn}{count}", netuid, None
        if "register" in function and function != "register_network":
            hotkey = short(a.get("hotkey") or signer)
            how = " by proof of work" if "pow" in function else ""
            return "register", f"{hotkey} registered on {sn}{how}", netuid, None
        if function.startswith("add_stake"):
            amount = _tao(a.get("amount_staked"))
            return "stake", f"{who} staked {amount or 'TAO'} to {short(a.get('hotkey'))} on {sn}", netuid, amount
        if function.startswith(("remove_stake", "unstake")):
            amount = _tao(a.get("amount_unstaked"), "alpha")
            what = "all stake" if "all" in function or "full" in function else amount or "stake"
            return "unstake", f"{who} unstaked {what} from {short(a.get('hotkey'))} on {sn}", netuid, amount
        if function in {"move_stake", "swap_stake", "transfer_stake"}:
            origin = a.get("origin_netuid")
            target = a.get("destination_netuid")
            route = f" from SN{origin} to SN{target}" if origin is not None and target is not None else ""
            return "stake", f"{who} moved stake{route}", netuid if netuid is not None else target if isinstance(target, int) else None, None
        if function.startswith("serve_axon"):
            return "serve", f"{who} published its axon on {sn}", netuid, None
        if function == "register_network":
            return "subnet", f"{who} registered a new subnet", None, None
        if function == "start_call":
            return "subnet", f"The owner started emissions on {sn}", netuid, None
        if function in {"set_children", "set_childkey_take"}:
            return "stake", f"{who} changed child hotkeys on {sn}", netuid, None
        return "other", f"{who} called {function.replace('_', ' ')}" + (f" on {sn}" if netuid is not None else ""), netuid, None
    if module == "Balances" and function.startswith("transfer"):
        amount = _tao(a.get("value"))
        return "transfer", f"{who} sent {amount or 'TAO'} to {short(a.get('dest'))}", None, amount
    if module == "Commitments":
        return "commitment", f"{who} published a commitment on {sn}", netuid, None
    if module == "MevShield" and function == "submit_encrypted":
        return "shielded", f"{who} sent a shielded transaction; its contents stay hidden until it executes", None, None
    if module in {"Ethereum", "EVM"}:
        return "evm", "An EVM transaction ran", None, None
    if module == "AdminUtils":
        return "subnet", f"{who} changed {function.removeprefix('sudo_set_').replace('_', ' ')}" + (f" on {sn}" if netuid is not None else ""), netuid, None
    return "other", f"{who} called {module}.{function}", netuid, None


def _block(pinned: Pinned, number: int) -> LiveBlock:
    key = f"{pinned.network.endpoint}:{number}"
    with _cache_lock:
        hit = _cache.get(key)
    if hit is not None:
        return hit
    got = gather(
        {
            "info": lambda: pinned.client.block_info(number),
            "events": lambda: pinned.client.query(("System", "Events"), None, block=number) or [],
        }
    )
    info = got["info"]
    records: list[dict[str, Any]] = got["events"]
    activities: list[Activity] = []
    system = 0
    for index, extrinsic in enumerate(getattr(info, "extrinsics", None) or []):
        if not extrinsic:
            continue
        call = extrinsic.get("call") or {}
        if (str(call.get("call_module")), str(call.get("call_function"))) in SYSTEM_CALLS:
            system += 1
            continue
        signer = extrinsic.get("address")
        kind, summary, netuid, amount = describe(call, signer)
        failure = failure_from(records, index)
        activities.append(
            Activity(
                block=number,
                index=index,
                ref=f"{number}-{index}",
                hash=extrinsic.get("extrinsic_hash"),
                kind=kind,
                pallet=str(call.get("call_module", "")),
                call=str(call.get("call_function", "")),
                signer=str(signer) if signer else None,
                netuid=netuid,
                summary=summary,
                success=failure is None,
                error=f"{failure.pallet}.{failure.error}" if failure else None,
                amount=amount,
            )
        )
    timestamp = getattr(info, "timestamp", None)
    block = LiveBlock(
        number=number,
        hash=str(getattr(info, "hash", "") or ""),
        timestamp=timestamp.isoformat() if timestamp else None,
        activities=activities,
        system_calls=system,
        failed=sum(1 for a in activities if not a.success),
    )
    with _cache_lock:
        _cache[key] = block
        while len(_cache) > 512:
            _cache.popitem(last=False)
    return block


def feed(network: Network, after: int | None = None, limit: int = 8) -> LiveFeed:
    """Blocks after `after` up to the head (at most MAX_BLOCKS), or the last `limit` blocks."""
    pinned = pin(network)
    head = pinned.block
    count = max(1, min(limit, MAX_BLOCKS))
    start = head - count + 1 if after is None else max(after + 1, head - MAX_BLOCKS + 1)
    numbers = list(range(start, head + 1))
    blocks = with_retries(network, lambda: gather({str(n): (lambda n=n: _block(pinned, n)) for n in numbers}))
    return LiveFeed(chain=pinned.ref, head=head, blocks=[blocks[str(n)] for n in numbers])
