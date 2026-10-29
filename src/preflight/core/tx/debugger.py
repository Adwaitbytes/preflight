"""The Transaction Debugger: find an extrinsic, decode it, and explain how it ended.

Explanations are filled from chain state read at the block *before* the extrinsic,
which is the state the runtime actually checked it against.
"""

from __future__ import annotations

import ipaddress
import re
from typing import Any

from ..chain import registry as R
from ..chain.decode import call_args, events_for, failure_from, fee_from
from ..chain.network import Network, Pinned, gather, pin, with_retries
from ..models import BlockExtrinsic, BlockReport, TxReport
from .context import ExplainContext
from .explain import explain

HASH = re.compile(r"^0x[0-9a-fA-F]{64}$")
BLOCK_INDEX = re.compile(r"^(\d+)-(\d+)$")
RAO = 1_000_000_000
SEARCH_WINDOW = 300
SEARCH_BATCH = 24


class TxNotFound(LookupError):
    pass


class BlockHashGiven(LookupError):
    """The hash names a block, not an extrinsic: the page can open that block instead."""

    def __init__(self, block: int) -> None:
        super().__init__(f"that is a block hash, not a transaction hash: it names block {block:,}")
        self.block = block


def is_tx_ref(ref: str) -> bool:
    ref = ref.strip()
    return bool(HASH.match(ref) or BLOCK_INDEX.match(ref))


def _extrinsics(pinned: Pinned, block: int) -> list[Any]:
    info = pinned.client.block_info(block)
    return list(getattr(info, "extrinsics", None) or [])


def block_for_hash(pinned: Pinned, block_hash: str) -> int | None:
    """The block number a hash names, or None when no block has it (0.3-0.6 s on finney).
    The SDK's public block lookups take a number only, so this asks its substrate layer."""
    substrate = pinned.client._client._substrate  # pyright: ignore[reportPrivateUsage]
    raw = pinned.client._call(substrate.get_block(block_hash=block_hash))  # pyright: ignore[reportPrivateUsage]
    header = (raw or {}).get("header") or {}
    return int(header["number"]) if header.get("number") is not None else None


def locate(pinned: Pinned, ref: str, window: int = SEARCH_WINDOW) -> tuple[int, int, dict[str, Any]]:
    """(block, index, decoded extrinsic) for a hash or a `block-index` reference."""
    ref = ref.strip()
    if match := BLOCK_INDEX.match(ref):
        block, index = int(match.group(1)), int(match.group(2))
        extrinsics = _extrinsics(pinned, block)
        if index >= len(extrinsics) or extrinsics[index] is None:
            raise TxNotFound(f"block {block:,} has {len(extrinsics)} extrinsics, no index {index}")
        return block, index, extrinsics[index]
    if not HASH.match(ref):
        raise ValueError("expected a 0x extrinsic hash or block-index such as 9376733-28")
    wanted = ref.lower()
    # People paste the hash beside "Block" on explorers and on our own pages: name it, don't scan
    if (block := block_for_hash(pinned, wanted)) is not None:
        raise BlockHashGiven(block)
    start = pinned.block
    for offset in range(0, window, SEARCH_BATCH):
        blocks = [start - offset - k for k in range(SEARCH_BATCH) if start - offset - k > 0]
        found = gather({str(b): (lambda b=b: _extrinsics(pinned, b)) for b in blocks})
        for block in blocks:
            for index, extrinsic in enumerate(found[str(block)]):
                if extrinsic and str(extrinsic.get("extrinsic_hash", "")).lower() == wanted:
                    return block, index, extrinsic
    raise TxNotFound(
        f"no transaction with that hash in the last {window} blocks (about {window * 12 // 60} minutes). "
        "If it is older, paste it as block-index, for example 9376733-28: block number, a dash, "
        "then its index in the block, as explorers list it"
    )


def _ip_text(value: Any, ip_type: Any) -> str | None:
    try:
        number = int(value)
    except (TypeError, ValueError):
        return str(value) if value else None
    if int(ip_type or 4) == 6:
        return str(ipaddress.IPv6Address(number))
    return str(ipaddress.IPv4Address(number)) if number < 2**32 else str(number)


def _context(
    network: Network,
    pinned: Pinned,
    block: int,
    call: str,
    args: dict[str, Any],
    signer: str | None,
    error: str,
) -> ExplainContext:
    before = block - 1
    netuid = int(args["netuid"]) if "netuid" in args and args["netuid"] is not None else None
    hotkey = str(args.get("hotkey") or args.get("hotkey_ss58") or "") or None
    if call in {"set_weights", "commit_weights", "commit_timelocked_weights", "commit_timelocked_mechanism_weights", "serve_axon", "set_mechanism_weights"}:
        hotkey = signer
    client = pinned.client

    def q(item: Any, params: list[Any] | None = None) -> Any:
        try:
            return client.query(item, params, block=before)
        except Exception:  # pruned state on a non-archive node; explain without that number
            return None

    reads: dict[str, Any] = {}
    if signer:
        reads["account"] = lambda: q(R.ACCOUNT, [signer])
    if netuid is not None:
        reads["burn"] = lambda: q(R.BURN, [netuid])
        reads["burn_now"] = lambda: client.query(R.BURN, [netuid])
        reads["rate_limit"] = lambda: q(R.WEIGHTS_SET_RATE_LIMIT, [netuid])
        reads["version"] = lambda: q(R.WEIGHTS_VERSION_KEY, [netuid])
        reads["min_weights"] = lambda: q(R.MIN_ALLOWED_WEIGHTS, [netuid])
        reads["threshold"] = lambda: q(R.STAKE_THRESHOLD)
        if error == "TooManyUnrevealedCommits":
            past: Any = client.at(before)  # namespaces resolve dynamically
            reads["commits"] = lambda: past.weights.timelocked_weight_commits(netuid)
        if hotkey:
            reads["uid"] = lambda: q(R.UIDS, [netuid, hotkey])
            reads["alpha"] = lambda: q(("SubtensorModule", "TotalHotkeyAlpha"), [hotkey, netuid])
    got = gather(reads)
    last_update = None
    if got.get("uid") is not None and netuid is not None:
        updates = q(R.LAST_UPDATE, [netuid]) or []
        uid = int(got["uid"])
        last_update = int(updates[uid]) if uid < len(updates) else None
    account = got.get("account") or {}
    free = (account.get("data") or {}).get("free") if isinstance(account, dict) else None
    pending = None
    if isinstance(got.get("commits"), dict) and hotkey:
        pending = sum(1 for rows in got["commits"].values() for row in rows if row.get("hotkey") == hotkey)
    amount = args.get("amount_staked") or args.get("amount")
    weights = args.get("dests") or args.get("uids")
    return ExplainContext(
        network=network.endpoint if network.name == "custom" else network.name,
        call=call,
        netuid=netuid,
        hotkey=hotkey,
        coldkey=signer,
        block=block,
        amount_tao=int(amount) / RAO if isinstance(amount, int) else None,
        balance_tao=int(free) / RAO if free is not None else None,
        burn_tao=int(got["burn"]) / RAO if got.get("burn") is not None else None,
        burn_now_tao=int(got["burn_now"]) / RAO if got.get("burn_now") is not None else None,
        last_update=last_update,
        rate_limit=int(got["rate_limit"]) if got.get("rate_limit") is not None else None,
        stake=int(got["alpha"]) / RAO if got.get("alpha") is not None else None,
        stake_threshold=int(got["threshold"]) / RAO if got.get("threshold") is not None else None,
        version_key=int(args["version_key"]) if args.get("version_key") is not None else None,
        required_version=int(got["version"]) if got.get("version") else None,
        ip=_ip_text(args.get("ip"), args.get("ip_type")) if "ip" in args else None,
        weights_count=len(weights) if isinstance(weights, list) else None,
        min_allowed_weights=int(got["min_weights"]) if got.get("min_weights") is not None else None,
        pending_commits=pending,
    )


def debug(network: Network, ref: str, *, window: int = SEARCH_WINDOW) -> TxReport:
    pinned = pin(network)
    block, index, extrinsic = with_retries(network, lambda: locate(pinned, ref, window))
    records = with_retries(
        network, lambda: pinned.client.query(("System", "Events"), None, block=block) or []
    )
    call = extrinsic.get("call") or {}
    module = str(call.get("call_module", "?"))
    function = str(call.get("call_function", "?"))
    args, plain = call_args(call)
    signer = extrinsic.get("address")
    failure = failure_from(records, index)
    explanation = None
    if failure is not None:
        ctx = _context(network, pinned, block, function, plain, signer, failure.error)
        explanation = explain(failure.error, ctx, failure.pallet)
    netuid = plain.get("netuid")
    hotkey = plain.get("hotkey") or (signer if function in {"set_weights", "serve_axon"} else None)
    at = pin(network, block)
    return TxReport(
        chain=at.ref,
        ref=ref,
        extrinsic_hash=extrinsic.get("extrinsic_hash"),
        block=block,
        index=index,
        signer=signer,
        pallet=module,
        call=function,
        args=args,
        success=failure is None,
        fee_tao=fee_from(records, index),
        events=events_for(records, index),
        failure=failure,
        explanation=explanation,
        hotkey=str(hotkey) if hotkey else None,
        netuid=int(netuid) if netuid is not None else None,
    )


def summarize_extrinsics(extrinsics: list[Any], events: list[dict[str, Any]]) -> list[BlockExtrinsic]:
    rows: list[BlockExtrinsic] = []
    for index, extrinsic in enumerate(extrinsics):
        if not extrinsic:
            continue
        call = extrinsic.get("call") or {}
        failure = failure_from(events, index)
        rows.append(
            BlockExtrinsic(
                index=index,
                extrinsic_hash=extrinsic.get("extrinsic_hash"),
                pallet=str(call.get("call_module", "?")),
                call=str(call.get("call_function", "?")),
                signer=extrinsic.get("address"),
                success=failure is None,
                error=f"{failure.pallet}.{failure.error}" if failure else None,
            )
        )
    return rows


def block_report(network: Network, ref: str) -> BlockReport:
    """A block by number or hash, with every extrinsic and whether it failed."""
    pinned = pin(network)
    ref = ref.strip()
    if ref.isdigit():
        block = int(ref)
        if block > pinned.block:
            raise TxNotFound(f"block {block:,} has not been produced yet; the chain is at {pinned.block:,}")
    elif HASH.match(ref):
        found = with_retries(network, lambda: block_for_hash(pinned, ref.lower()))
        if found is None:
            raise TxNotFound("no block has that hash on this network")
        block = found
    else:
        raise ValueError("expected a block number or a 0x block hash")
    got = with_retries(
        network,
        lambda: gather(
            {
                "extrinsics": lambda: _extrinsics(pinned, block),
                "events": lambda: pinned.client.query(("System", "Events"), None, block=block) or [],
            }
        ),
    )
    rows = summarize_extrinsics(got["extrinsics"], got["events"])
    at = pin(network, block)
    return BlockReport(chain=at.ref, block=block, block_hash=at.block_hash, extrinsics=rows, failed=sum(not r.success for r in rows))
