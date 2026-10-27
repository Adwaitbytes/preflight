"""Which alerts a new diagnosis deserves, given the last one. Pure, so it is unit tested.

An alert fires when a problem appears, not while it persists: the state stores which
alert ids were active, and only newly active ones are sent. When the problem clears and
later returns, it alerts again.
"""

from __future__ import annotations

from typing import Any

from pydantic import Field

from ..models import Diagnosis, Model

INCENTIVE_DROP = 0.5  # alert when incentive falls by more than half between epochs


class Alert(Model):
    id: str
    title: str
    detail: str


class WatchState(Model):
    uid: int | None
    incentive: float
    validator_permit: bool
    active: list[str] = Field(default_factory=list, description="Alert ids currently true")
    block: int


FINDING_ALERTS = {
    "PF104": "entered the bottom of the pruning order",
    "PF202": "stopped setting weights",
    "PF205": "has a reveal window open or expired",
    "PF107": "axon stopped answering",
    "PF108": "is no longer scored by any validator",
    "PF102": "was deregistered",
}


def state_of(d: Diagnosis) -> WatchState:
    n = d.neuron
    return WatchState(
        uid=n.uid if n else None,
        incentive=n.incentive if n else 0.0,
        validator_permit=n.validator_permit if n else False,
        block=d.chain.block,
    )


def evaluate(d: Diagnosis, previous: WatchState | None) -> tuple[list[Alert], WatchState]:
    state = state_of(d)
    candidates: dict[str, Alert] = {}
    who = f"UID {state.uid} on SN{d.netuid}" if state.uid is not None else f"Your hotkey on SN{d.netuid}"
    for f in d.findings:
        if f.id in FINDING_ALERTS and f.severity.value != "info":
            candidates[f.id] = Alert(id=f.id, title=f"{who} {FINDING_ALERTS[f.id]}", detail=f.title)
    if previous is not None:
        if previous.uid is not None and state.uid is None:
            candidates["deregistered"] = Alert(id="deregistered", title=f"Your hotkey lost UID {previous.uid} on SN{d.netuid}", detail=d.headline)
        if previous.validator_permit and not state.validator_permit and state.uid is not None:
            candidates["permit_lost"] = Alert(id="permit_lost", title=f"{who} lost its validator permit", detail=d.headline)
        if previous.incentive > 0 and state.incentive < previous.incentive * (1 - INCENTIVE_DROP):
            drop = 1 - state.incentive / previous.incentive
            candidates["incentive_drop"] = Alert(
                id="incentive_drop",
                title=f"{who} incentive fell {drop:.0%} since block {previous.block:,}",
                detail=f"{previous.incentive:.5f} to {state.incentive:.5f}. {d.headline}",
            )
    already = set(previous.active) if previous else set()
    fresh = [a for key, a in candidates.items() if key not in already]
    # One-off transitions do not stay "active"; finding-based alerts do while they persist.
    state = state.model_copy(update={"active": sorted(k for k in candidates if k in FINDING_ALERTS)})
    return fresh, state


def message(alert: Alert, d: Diagnosis, site: str) -> str:
    link = f"{site}/doctor/{d.chain.network}/{d.hotkey}?netuid={d.netuid}"
    fix = next((f.fix.text for f in d.findings if f.id == alert.id and f.fix), None)
    lines = [f"Preflight: {alert.title}", alert.detail]
    if fix:
        lines.append(f"Fix: {fix}")
    lines.append(link)
    return "\n".join(lines)


def load_state(raw: Any) -> WatchState | None:
    if not raw:
        return None
    try:
        return WatchState.model_validate(raw)
    except ValueError:
        return None
