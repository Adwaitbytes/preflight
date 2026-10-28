"""Network weather: what is going wrong on chain right now, explained.

Built from the same decoded blocks as the live feed (cached per block), over a window of
recent blocks. Failures are grouped by error with the subnets they hit and one example to
open in the debugger, and each error carries the explainer's title and fix.
"""

from __future__ import annotations

from collections import Counter, defaultdict

from ..chain.network import Network, gather, pin, with_retries
from ..models import ChainRef, ErrorTrend, LiveBlock, Weather
from ..tx.explain import explain
from .feed import decoded_block

WINDOW = 60
TOP = 6


def summarize(blocks: list[LiveBlock], chain_ref: ChainRef) -> Weather:
    """Pure: the weather for already decoded blocks."""
    activities = [a for b in blocks for a in b.activities]
    failed = [a for a in activities if not a.success]
    by_error: dict[str, list[int]] = defaultdict(list)
    examples: dict[str, str] = {}
    for a in failed:
        name = (a.error or "Unknown").split(".")[-1]
        by_error[name].append(a.netuid if a.netuid is not None else -1)
        examples.setdefault(name, a.ref)
    trends: list[ErrorTrend] = []
    for name, netuids in sorted(by_error.items(), key=lambda item: -len(item[1]))[:TOP]:
        explanation = explain(name)
        trends.append(
            ErrorTrend(
                error=name,
                count=len(netuids),
                subnets=sorted({n for n in netuids if n >= 0}),
                example_ref=examples[name],
                title=explanation.title,
                meaning=explanation.explanation.split("\n")[0].split(". ")[0].rstrip("."),
                fix=explanation.fix.text if explanation.fix else None,
            )
        )
    kinds = Counter(a.kind for a in activities)
    busiest = Counter(a.netuid for a in activities if a.netuid is not None).most_common(6)
    failing = Counter(a.netuid for a in failed if a.netuid is not None).most_common(6)
    rate = len(failed) / len(activities) if activities else 0.0
    first, last = (blocks[0].number, blocks[-1].number) if blocks else (0, 0)
    minutes = len(blocks) * 12 // 60
    if not activities:
        headline = "No signed activity in this window"
    elif not failed:
        headline = f"Clear: {len(activities):,} transactions in the last {minutes} minutes and none failed"
    else:
        top = trends[0]
        where = f" on SN{', SN'.join(map(str, top.subnets[:3]))}" if top.subnets else ""
        times = "once" if top.count == 1 else f"{top.count} times"
        lead = "most often" if top.count > 1 else "for example"
        headline = f"{rate:.1%} of transactions failed in the last {minutes} minutes; {lead} {top.error}{where}, {times}"
    return Weather(
        chain=chain_ref,
        from_block=first,
        to_block=last,
        blocks=len(blocks),
        extrinsics=len(activities),
        failed=len(failed),
        failure_rate=rate,
        headline=headline,
        top_errors=trends,
        by_kind=dict(kinds),
        busiest_subnets=[(int(n), c) for n, c in busiest],
        failing_subnets=[(int(n), c) for n, c in failing],
    )


def weather(network: Network, window: int = WINDOW) -> Weather:
    pinned = pin(network)
    numbers = list(range(pinned.block - max(1, min(window, 120)) + 1, pinned.block + 1))
    blocks = with_retries(network, lambda: gather({str(n): (lambda n=n: decoded_block(pinned, n)) for n in numbers}))
    return summarize([blocks[str(n)] for n in numbers], pinned.ref)
