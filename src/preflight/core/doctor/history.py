"""A neuron's recent epochs: incentive, trust, emission and how many validators weighted it.

One point per tempo going back, read concurrently. Each point resolves the hotkey's UID at
that block, so a deregistration shows up as a gap rather than another neuron's numbers.
"""

from __future__ import annotations

from typing import Any

from ..chain.network import Network, Pinned, gather, pin, with_retries
from ..chain.snapshot import uid_at
from ..models import HistoryPoint, NeuronHistory

U16 = 65535
RAO = 1_000_000_000


def _point(pinned: Pinned, netuid: int, hotkey: str, block: int) -> HistoryPoint | None:
    try:
        uid = uid_at(pinned, netuid, hotkey, block)
    except Exception:  # pruned state on a non-archive node: no point for this block
        return None
    if uid is None:
        return HistoryPoint(block=block, uid=None, incentive=0.0, trust=0.0, emission=0.0, weighted_by=0)
    got = gather(
        {
            "neuron": lambda: pinned.client.runtime(("NeuronInfoRuntimeApi", "get_neuron_lite"), [netuid, uid], block=block),
            "weights": lambda: _weights(pinned, netuid, block),
        }
    )
    neuron: dict[str, Any] = got["neuron"] or {}
    rows: dict[int, dict[int, float]] = got["weights"]
    return HistoryPoint(
        block=block,
        uid=uid,
        incentive=int(neuron.get("incentive") or 0) / U16,
        trust=int(neuron.get("trust") or 0) / U16,
        emission=int(neuron.get("emission") or 0) / RAO,
        weighted_by=sum(1 for v, row in rows.items() if v != uid and row.get(uid, 0.0) > 0),
    )


def _weights(pinned: Pinned, netuid: int, block: int) -> dict[int, dict[int, float]]:
    view: Any = pinned.client.at(block)  # namespaces resolve dynamically
    rows = view.weights.weights(netuid)
    return {int(v): {int(u): float(w) for u, w in row.items()} for v, row in rows.items()}


def history(network: Network, hotkey: str, netuid: int, *, points: int = 12) -> NeuronHistory:
    pinned = pin(network)
    tempo = int(pinned.query(("SubtensorModule", "Tempo"), [netuid]) or 360)
    blocks = [pinned.block - k * (tempo + 1) for k in range(points - 1, -1, -1)]
    found = with_retries(
        network,
        lambda: gather({str(b): (lambda b=b: _point(pinned, netuid, hotkey, b)) for b in blocks if b > 0}),
    )
    series = [p for b in blocks if (p := found.get(str(b))) is not None]
    return NeuronHistory(chain=pinned.ref, hotkey=hotkey, netuid=netuid, points=series)
