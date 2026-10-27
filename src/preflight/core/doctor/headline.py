"""One plain sentence that says what is wrong, built from the worst findings."""

from __future__ import annotations

from collections.abc import Callable

from ..models import SEVERITY_RANK, Finding, NeuronState, Severity

# Each clause continues "UID 37 on SN64 ..." and reads the finding's own evidence.
CLAUSES: dict[str, Callable[[Finding], str]] = {
    "PF101": lambda f: "is not registered",
    "PF102": lambda f: f"lost its seat at block {_value(f, 'First block without it')}",
    "PF103": lambda f: "is still in immunity, so low rewards are expected",
    "PF104": lambda f: "is close to being pruned",
    "PF105": lambda f: "has no axon published",
    "PF106": lambda f: f"advertises {_value(f, 'Axon')}, which validators cannot reach",
    "PF107": lambda f: f"does not answer on {_value(f, 'Probed address')}",
    "PF108": lambda f: "earns nothing because no validator has scored it",
    "PF109": lambda f: "is only scored by validators the epoch ignores",
    "PF110": lambda f: "is scored but clipped to zero by consensus",
    "PF111": lambda f: "has low trust",
    "PF201": lambda f: "has stake but no validator permit",
    "PF202": lambda f: f"has not set weights for {_value(f, 'Blocks since')}",
    "PF203": lambda f: "is rate limited for its next set_weights",
    "PF204": lambda f: "is below the minimum stake to set weights",
    "PF205": lambda f: "has weights waiting to be revealed",
    "PF206": lambda f: "set weights that break the subnet's limits",
    "PF207": lambda f: "mostly weights its own miners",
    "PF301": lambda f: "cannot register right now: " + f.title[0].lower() + f.title[1:],
    "PF302": lambda f: "faces a registration price spike",
    "PF303": lambda f: "is on a subnet whose emissions have not started",
    "PF304": lambda f: "is on a subnet that burns nearly all miner incentive",
    "PF305": lambda f: "is on a subnet where most validators stopped setting weights",
    "PF306": lambda f: "is on a subnet where the owner's own hotkeys take much of the incentive",
}
LEAD = {"PF108", "PF110", "PF109", "PF102", "PF101"}


def _value(finding: Finding, label: str) -> str:
    return next((e.value for e in finding.evidence if e.label == label), "?")


def _clause(finding: Finding) -> str:
    make = CLAUSES.get(finding.id)
    return make(finding) if make else finding.title[0].lower() + finding.title[1:]


def subject(netuid: int, neuron: NeuronState | None) -> str:
    return f"UID {neuron.uid} on SN{netuid}" if neuron else f"This hotkey on SN{netuid}"


def headline(netuid: int, neuron: NeuronState | None, findings: list[Finding], role: str) -> str:
    ranked = sorted(findings, key=lambda f: (-SEVERITY_RANK[f.severity], f.id not in LEAD, f.id))
    serious = [f for f in ranked if f.severity in (Severity.CRITICAL, Severity.HIGH)]
    who = subject(netuid, neuron)
    if not serious:
        medium = [f for f in ranked if f.severity == Severity.MEDIUM]
        if medium:
            return f"{who} is working, with one thing to watch: it {_clause(medium[0])}"
        if role == "validator":
            return f"{who} is a healthy validator: permit held and weights fresh"
        return f"{who} looks healthy: registered, reachable as far as the chain shows, and scored"
    first = _clause(serious[0])
    if len(serious) == 1:
        return f"{who} {first}"
    second = _clause(serious[1])
    return f"{who} {first}, and it {second}"
