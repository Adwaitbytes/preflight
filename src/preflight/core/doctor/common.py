"""Shared helpers for rules: formatting, time, and finding construction."""

from __future__ import annotations

import ipaddress
import statistics
from collections.abc import Callable, Iterable
from dataclasses import dataclass

from ..chain.snapshot import NeuronSnapshot, SubnetSnapshot
from ..models import SEVERITY_RANK, Evidence, Finding, Fix, NeuronState, Severity

DOCS = "https://www.bittensor.com/docs"


def block_seconds(subnet: SubnetSnapshot) -> float:
    return subnet.block_seconds


def duration(blocks: int, subnet: SubnetSnapshot) -> str:
    """Blocks as a human span on this network: '312 blocks (about 62 min)'."""
    seconds = max(blocks, 0) * block_seconds(subnet)
    if seconds < 90:
        span = f"{seconds:.0f} s"
    elif seconds < 5400:
        span = f"{seconds / 60:.0f} min"
    elif seconds < 172800:
        span = f"{seconds / 3600:.1f} h"
    else:
        span = f"{seconds / 86400:.1f} days"
    return f"{blocks:,} blocks (about {span})"


def tao(value: float) -> str:
    return f"{value:,.4f} TAO" if value < 1000 else f"{value:,.0f} TAO"


def alpha(value: float) -> str:
    return f"{value:,.4f} alpha" if value < 1000 else f"{value:,.0f} alpha"


def pct(value: float) -> str:
    return f"{value * 100:.1f}%"


def short(ss58: str) -> str:
    return f"{ss58[:6]}...{ss58[-4:]}"


def network_flag(subnet: SubnetSnapshot) -> str:
    chain = subnet.chain
    return f"--network {chain.endpoint if chain.network == 'custom' else chain.network}"


def ev(label: str, value: object, source: str | None = None) -> Evidence:
    return Evidence(label=label, value=str(value), source=source)


def block_ev(subnet: SubnetSnapshot) -> Evidence:
    return ev("Read at block", f"{subnet.block:,}")


def command(text: str, note: str | None = None) -> Fix:
    return Fix(kind="command", text=text, note=note)


def wait(text: str) -> Fix:
    return Fix(kind="wait", text=text)


@dataclass(frozen=True)
class Rule[S]:
    id: str
    slug: str
    severity: Severity
    title: str
    check: Callable[[S], Finding | None]
    applies_to: str  # "miner", "validator", "any", "subnet"

    def run(self, snapshot: S) -> Finding | None:
        return self.check(snapshot)


def finding(
    rule_id: str,
    slug: str,
    severity: Severity,
    title: str,
    evidence: Iterable[Evidence],
    explanation: str,
    fix: Fix | None = None,
    docs: str | None = None,
) -> Finding:
    return Finding(
        id=rule_id,
        rule=slug,
        severity=severity,
        title=title,
        evidence=list(evidence),
        explanation=explanation,
        fix=fix,
        docs=docs,
    )


def worse(a: Severity, b: Severity) -> Severity:
    return a if SEVERITY_RANK[a] >= SEVERITY_RANK[b] else b


def median(values: Iterable[float]) -> float:
    items = list(values)
    return statistics.median(items) if items else 0.0


def gini(values: Iterable[float]) -> float:
    """0 when everyone gets the same, near 1 when one UID gets everything."""
    items = sorted(v for v in values if v > 0)
    n = len(items)
    total = sum(items)
    if n == 0 or total == 0:
        return 0.0
    cumulative = sum((i + 1) * v for i, v in enumerate(items))
    return (2 * cumulative) / (n * total) - (n + 1) / n


def blocks_since_update(neuron: NeuronState, subnet: SubnetSnapshot) -> int:
    return subnet.block - neuron.last_update if neuron.last_update else subnet.block


def stale_after(subnet: SubnetSnapshot) -> int:
    """A validator that has not set weights for this long missed at least one full epoch."""
    params = subnet.params
    return max(2 * params.tempo, params.weights_rate_limit + params.tempo)


def is_validator(snapshot: NeuronSnapshot) -> bool:
    neuron = snapshot.neuron
    if neuron is None:
        return False
    if neuron.validator_permit or neuron.uid in snapshot.subnet.weights:
        return True
    return snapshot.subnet.stake_threshold > 0 and neuron.stake >= snapshot.subnet.stake_threshold


def unreachable_reason(ip: str, network: str) -> str | None:
    """Why validators on `network` could not reach this advertised address, or None."""
    try:
        address = ipaddress.ip_address(ip)
    except ValueError:
        return f"{ip} is not a valid IP address"
    mapped = getattr(address, "ipv4_mapped", None)
    target = mapped if mapped is not None else address
    if target.is_unspecified:
        return f"{ip} is the unspecified address, which nobody can connect to"
    if target.is_loopback:
        if network == "local" and mapped is not None:
            return None
        return f"{ip} is a loopback address, so it only points back at each validator's own machine"
    if target.is_private or target.is_link_local:
        if network == "local":
            # Verified on macOS: stealth mode firewalls drop connections to the LAN IP even
            # from the same machine, while the mapped loopback form always works.
            return f"{ip} is a LAN address; host firewalls (macOS stealth mode among them) drop connections to it even locally"
        return f"{ip} is a private LAN address that validators on the internet cannot route to"
    if target.is_multicast or target.is_reserved:
        return f"{ip} is a reserved or multicast address"
    return None
