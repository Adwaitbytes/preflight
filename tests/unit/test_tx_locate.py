from types import SimpleNamespace
from typing import Any, cast

import pytest

from preflight.core.chain.network import Pinned
from preflight.core.tx import debugger
from preflight.core.tx.debugger import BlockHashGiven, TxNotFound, locate, summarize_extrinsics

BLOCK_HASH = "0x1ee55e83eb75d01abc8f865951e619b2e48df8867bcb26afd39d75bb675bfabc"
TX_HASH = "0x" + "ab" * 32


def _pinned(head: int = 1000) -> Pinned:
    return cast(Pinned, SimpleNamespace(block=head))


def _no_block(_pinned: Pinned, _hash: str) -> int | None:
    return None


def _empty_blocks(_pinned: Pinned, _block: int) -> list[Any]:
    return []


def test_a_block_hash_names_the_block_instead_of_scanning(monkeypatch: pytest.MonkeyPatch) -> None:
    scanned: list[int] = []

    def block_for_hash(_pinned: Pinned, block_hash: str) -> int | None:
        return 9_392_800 if block_hash == BLOCK_HASH else None

    def extrinsics(_pinned: Pinned, block: int) -> list[Any]:
        scanned.append(block)
        return []

    monkeypatch.setattr(debugger, "block_for_hash", block_for_hash)
    monkeypatch.setattr(debugger, "_extrinsics", extrinsics)

    with pytest.raises(BlockHashGiven) as caught:
        locate(_pinned(), BLOCK_HASH.upper().replace("0X", "0x"))

    assert caught.value.block == 9_392_800
    assert "block hash" in str(caught.value)
    assert scanned == []


def test_a_transaction_hash_is_still_found_by_scanning(monkeypatch: pytest.MonkeyPatch) -> None:
    def extrinsics(_pinned: Pinned, block: int) -> list[Any]:
        return [{"extrinsic_hash": TX_HASH}] if block == 997 else [{"extrinsic_hash": "0x00"}]

    monkeypatch.setattr(debugger, "block_for_hash", _no_block)
    monkeypatch.setattr(debugger, "_extrinsics", extrinsics)

    block, index, extrinsic = locate(_pinned(), TX_HASH, window=24)

    assert (block, index) == (997, 0)
    assert extrinsic["extrinsic_hash"] == TX_HASH


def test_an_unknown_hash_says_what_was_searched_and_what_to_try(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(debugger, "block_for_hash", _no_block)
    monkeypatch.setattr(debugger, "_extrinsics", _empty_blocks)

    with pytest.raises(TxNotFound) as caught:
        locate(_pinned(), TX_HASH, window=24)

    message = str(caught.value)
    assert "24 blocks" in message
    assert "block-index" in message


def test_block_summary_marks_failed_extrinsics_and_their_signers() -> None:
    extrinsics: list[Any] = [
        {"extrinsic_hash": "0x01", "call": {"call_module": "Timestamp", "call_function": "set"}},
        {"extrinsic_hash": "0x02", "address": "5Signer", "call": {"call_module": "SubtensorModule", "call_function": "remove_stake"}},
        None,
    ]
    events: list[dict[str, Any]] = [{"extrinsic_idx": 1, "event_id": "ExtrinsicFailed", "attributes": {"dispatch_error": {"Module": {"index": 7, "error": "0x01000000"}}}}]

    rows = summarize_extrinsics(extrinsics, events)

    assert [(r.index, r.pallet, r.call, r.signer, r.success) for r in rows] == [
        (0, "Timestamp", "set", None, True),
        (1, "SubtensorModule", "remove_stake", "5Signer", False),
    ]
