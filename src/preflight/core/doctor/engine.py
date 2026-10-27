"""The Doctor: read one block, run every rule that applies, explain the worst of it."""

from __future__ import annotations

import time
from collections.abc import Callable

from ..chain.network import Network, gather, pin, with_retries
from ..chain.snapshot import NeuronSnapshot, read_neuron, read_subnet
from ..models import SEVERITY_RANK, AxonInfo, Diagnosis, DoctorReport, Finding, Severity, Verdict
from .common import is_validator
from .headline import headline
from .probe import probe_axon
from .rules_miner import MINER_RULES
from .rules_subnet import SUBNET_RULES
from .rules_validator import VALIDATOR_RULES

ALL_RULE_IDS = [r.id for r in (*MINER_RULES, *VALIDATOR_RULES, *SUBNET_RULES)]


def role_of(snap: NeuronSnapshot) -> str:
    if snap.uid is None:
        return "unregistered"
    return "validator" if is_validator(snap) else "miner"


def verdict_of(findings: list[Finding]) -> Verdict:
    worst = max((SEVERITY_RANK[f.severity] for f in findings), default=0)
    if worst >= SEVERITY_RANK[Severity.CRITICAL]:
        return Verdict.BROKEN
    if worst >= SEVERITY_RANK[Severity.MEDIUM]:
        return Verdict.WARNING
    return Verdict.HEALTHY


def evaluate(snap: NeuronSnapshot) -> Diagnosis:
    """Pure: the same snapshot always gives the same diagnosis."""
    role = role_of(snap)
    findings: list[Finding] = []
    run = 0
    for rule in (*MINER_RULES, *VALIDATOR_RULES):
        if rule.applies_to == "miner" and role != "miner":
            continue
        if rule.applies_to == "validator" and role != "validator":
            continue
        run += 1
        if (found := rule.run(snap)) is not None:
            findings.append(found)
    for rule in SUBNET_RULES:
        run += 1
        if (found := rule.run(snap.subnet)) is not None:
            findings.append(found)
    findings.sort(key=lambda f: (-SEVERITY_RANK[f.severity], f.id))
    return Diagnosis(
        hotkey=snap.hotkey,
        netuid=snap.subnet.netuid,
        subnet_name=snap.subnet.name,
        chain=snap.subnet.chain,
        verdict=verdict_of(findings),
        headline=headline(snap.subnet.netuid, snap.neuron, findings, role),
        findings=findings,
        neuron=snap.neuron,
        role="unregistered" if role == "unregistered" else "validator" if role == "validator" else "miner",
        rules_run=run,
    )


def diagnose(
    network: Network,
    hotkey: str,
    netuid: int | None = None,
    *,
    probe: bool = False,
    block: int | None = None,
    probe_allowed: Callable[[AxonInfo], bool] | None = None,
) -> DoctorReport:
    started = time.monotonic()
    pinned = pin(network, block)
    if netuid is None:
        netuids = sorted(
            with_retries(network, lambda: pinned.view.neurons.netuids_for_hotkey(hotkey))
        )
    else:
        netuids = [netuid]

    def one(n: int) -> Diagnosis:
        subnet = with_retries(network, lambda: read_subnet(pinned, n))
        snap = with_retries(network, lambda: read_neuron(pinned, n, hotkey, subnet=subnet))
        axon = snap.neuron.axon if snap.neuron is not None else None
        if probe and axon is not None and (probe_allowed is None or probe_allowed(axon)):
            snap = snap.model_copy(update={"probe": probe_axon(axon)})
        return evaluate(snap)

    results = gather({str(n): (lambda n=n: one(n)) for n in netuids})
    diagnoses = sorted(
        results.values(),
        key=lambda d: (-max((SEVERITY_RANK[f.severity] for f in d.findings), default=-1), d.netuid),
    )
    if diagnoses:
        worst = diagnoses[0]
        verdict = worst.verdict
        extra = len(diagnoses) - 1
        summary = worst.headline + (f" ({extra} other subnet{'s' if extra > 1 else ''} checked)" if extra else "")
    else:
        verdict = Verdict.BROKEN
        summary = "This hotkey has no UID on any subnet"
    return DoctorReport(
        hotkey=hotkey,
        chain=pinned.ref,
        diagnoses=diagnoses,
        verdict=verdict,
        headline=summary,
        elapsed_ms=int((time.monotonic() - started) * 1000),
    )
