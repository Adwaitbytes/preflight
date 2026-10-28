from preflight.core.live.weather import summarize
from preflight.core.models import Activity, ActivityKind, ChainRef, LiveBlock

CHAIN = ChainRef(network="finney", endpoint="wss://example", block=100, block_hash="0x00")


def act(number: int, index: int, *, error: str | None = None, netuid: int | None = 1, kind: ActivityKind = "stake") -> Activity:
    return Activity(
        block=number,
        index=index,
        ref=f"{number}-{index}",
        hash=None,
        kind=kind,
        pallet="SubtensorModule",
        call="add_stake",
        signer=None,
        netuid=netuid,
        summary="someone staked",
        success=error is None,
        error=error,
        amount=None,
    )


def block(number: int, activities: list[Activity]) -> LiveBlock:
    return LiveBlock(number=number, hash="0x", timestamp=None, activities=activities, system_calls=2, failed=sum(1 for a in activities if not a.success))


def test_groups_failures_by_error_with_subnets_and_explanation() -> None:
    blocks = [
        block(1, [act(1, 1), act(1, 2, error="SubtensorModule.SameNetuid", netuid=23)]),
        block(2, [act(2, 1, error="SubtensorModule.SameNetuid", netuid=7), act(2, 2, error="System.BadOrigin", netuid=None)]),
        block(3, [act(3, 1, kind="weights", netuid=7)]),
    ]
    w = summarize(blocks, CHAIN)
    assert (w.blocks, w.extrinsics, w.failed) == (3, 5, 3)
    top = w.top_errors[0]
    assert (top.error, top.count, top.subnets, top.example_ref) == ("SameNetuid", 2, [7, 23], "1-2")
    assert top.meaning and "BadOrigin" in [e.error for e in w.top_errors]
    assert w.headline.startswith("60.0% of transactions failed") and "SameNetuid on SN7, SN23, 2 times" in w.headline
    assert w.busiest_subnets[0] == (7, 2)
    assert w.by_kind == {"stake": 4, "weights": 1}


def test_clear_and_empty_windows() -> None:
    assert summarize([block(1, [act(1, 1)])], CHAIN).headline.startswith("Clear: 1 transactions")
    assert summarize([block(1, [])], CHAIN).headline == "No signed activity in this window"
    assert summarize([], CHAIN).failure_rate == 0.0
