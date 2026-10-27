"""Scoring is pure: it never touches the chain, so it is easy to test and hard to game by accident.

Replace this with your subnet's real evaluation. Keep it deterministic for the same inputs.
"""

from __future__ import annotations

from .protocol import Answer, Task


def score(task: Task, answer: Answer | None) -> float:
    """1.0 for a correct answer, 0.0 for a wrong or missing one."""
    if answer is None:
        return 0.0
    return 1.0 if answer.total == sum(task.numbers) else 0.0


def normalize(scores: dict[int, float]) -> dict[int, float]:
    total = sum(scores.values())
    if total <= 0:
        return {}
    return {uid: value / total for uid, value in scores.items() if value > 0}
