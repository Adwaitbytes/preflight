"""Subnet Health Score: 0 to 100 from five factors read off one SubnetSnapshot.

Each factor scores 0..1 and carries a weight; the weights sum to 1.

    score = round(100 * sum(weight_i * score_i))

    validators_active     0.30  share of permitted validators whose last weights are
                                within `stale_after` (two tempos, or the rate limit plus a tempo)
    owner_burn            0.25  1 - share of miner incentive to the owner hotkey's UID
    incentive_spread      0.15  1 - Gini of miner incentive over every non-validator UID except
                                the owner hotkey, zeros included
    owner_self_mining     0.15  1 - share of miner incentive to other hotkeys of the owner coldkey
    registration_open     0.15  1 open, 0.75 this block's slot taken, 0.5 the interval cap used,
                                0 registration switched off (PF301's three cases)

A subnet whose emissions have not started (PF303) pays nobody, so its score is capped at
39, inside at_risk. Bands: healthy at 70 and above, watch 40 to 69, at_risk below 40.

The Gini comes from `doctor.common.gini`, which only looks at positive values. Miners
earning nothing are part of the concentration a newcomer faces, so they are folded back
in exactly: with k earners out of n miners, Gini over all n is 1 - (k / n) * (1 - G_k).

Owner burn and owner self mining are two of the reasons given for halting emissions on 57
subnets in June 2026 (https://www.bittensor.com/docs/concepts/emissions). Factor text
follows BUILD.md section 15: these are signals, and nothing here says a subnet is a scam.
"""

from __future__ import annotations

from typing import Literal

from ..chain.snapshot import SubnetSnapshot
from ..doctor.common import blocks_since_update, duration, gini, pct, stale_after
from ..doctor.rules_subnet import SUBNET_RULES, owner_incentive_shares
from ..models import Finding, Health, HealthFactor, Severity

HEALTHY_AT = 70
WATCH_AT = 40
NOT_STARTED_CAP = WATCH_AT - 1

WEIGHTS = {
    "validators_active": 0.30,
    "owner_burn": 0.25,
    "incentive_spread": 0.15,
    "owner_self_mining": 0.15,
    "registration_open": 0.15,
}

REGISTRATION_SCORE = {
    None: 1.0,
    Severity.MEDIUM: 0.75,
    Severity.HIGH: 0.5,
    Severity.CRITICAL: 0.0,
}


def band(score: int) -> Literal["healthy", "watch", "at_risk"]:
    if score >= HEALTHY_AT:
        return "healthy"
    return "watch" if score >= WATCH_AT else "at_risk"


def miner_concentration(subnet: SubnetSnapshot) -> tuple[float, int, int]:
    """(Gini over all miners with zeros, earners, miners). Miners are UIDs without a
    validator permit, minus the owner hotkey, whose share the burn factor already counts."""
    incentives = [
        n.incentive
        for n in subnet.neurons
        if not n.validator_permit and n.hotkey != subnet.owner_hotkey
    ]
    miners = len(incentives)
    earners = sum(1 for value in incentives if value > 0)
    if miners == 0 or earners == 0:
        return 0.0, earners, miners
    return 1 - (earners / miners) * (1 - gini(incentives)), earners, miners


def _validators_factor(subnet: SubnetSnapshot) -> HealthFactor:
    validators = subnet.validators()
    limit = stale_after(subnet)
    fresh = [v for v in validators if blocks_since_update(v, subnet) <= limit]
    if not validators:
        score, value = 0.0, "no permitted validators"
        explanation = "No UID holds a validator permit, so nobody scores miners"
    else:
        score = len(fresh) / len(validators)
        value = f"{len(fresh)} of {len(validators)}"
        explanation = (
            f"{len(fresh)} of {len(validators)} permitted validators set weights within the last "
            f"{duration(limit, subnet)}; stale validators stop moving miner scores"
        )
    return _factor("validators_active", "Validators active this tempo", score, value, explanation)


def _burn_factor(burned: float) -> HealthFactor:
    explanation = (
        f"{pct(burned)} of miner incentive goes to the owner hotkey's UID, which is burned or "
        "recycled instead of reaching miners"
        if burned > 0
        else "No miner incentive goes to the owner hotkey's UID"
    )
    return _factor("owner_burn", "Owner burn share", 1 - burned, pct(burned), explanation)


def _spread_factor(subnet: SubnetSnapshot) -> HealthFactor:
    concentration, earners, miners = miner_concentration(subnet)
    if miners == 0:
        return _factor(
            "incentive_spread",
            "Miner incentive spread",
            0.0,
            "no miners",
            "No miner UIDs are registered, so there is no incentive to spread",
        )
    if earners == 0:
        return _factor(
            "incentive_spread",
            "Miner incentive spread",
            0.0,
            f"0 of {miners} earning",
            f"None of the {miners} miners earned incentive in the last epoch",
        )
    return _factor(
        "incentive_spread",
        "Miner incentive spread",
        1 - concentration,
        f"Gini {concentration:.2f}",
        f"{earners} of {miners} miners earn incentive; a Gini of {concentration:.2f} "
        f"{'looks like a few miners take most rewards' if concentration >= 0.8 else 'means rewards are spread across miners'}",
    )


def _self_mining_factor(owned: float) -> HealthFactor:
    explanation = (
        f"{pct(owned)} of miner incentive goes to other hotkeys under the owner coldkey, which "
        "looks like owner self mining when it is large"
        if owned > 0
        else "No miner incentive goes to other hotkeys under the owner coldkey"
    )
    return _factor(
        "owner_self_mining", "Owner self mining share", 1 - owned, pct(owned), explanation
    )


def _registration_factor(pf301: Finding | None) -> HealthFactor:
    severity = pf301.severity if pf301 else None
    value = "open" if pf301 is None else pf301.title
    explanation = (
        "New miners can register now"
        if pf301 is None
        else f"{pf301.title}, so newcomers cannot join right now"
    )
    return _factor(
        "registration_open",
        "Registration openness",
        REGISTRATION_SCORE[severity],
        value,
        explanation,
    )


def _factor(factor_id: str, label: str, score: float, value: str, explanation: str) -> HealthFactor:
    return HealthFactor(
        id=factor_id,
        label=label,
        score=round(min(max(score, 0.0), 1.0), 4),
        weight=WEIGHTS[factor_id],
        value=value,
        explanation=explanation,
    )


def health(subnet: SubnetSnapshot) -> Health:
    findings = [f for f in (rule.run(subnet) for rule in SUBNET_RULES) if f is not None]
    by_id = {f.id: f for f in findings}
    burned, owned = owner_incentive_shares(subnet)
    factors = [
        _validators_factor(subnet),
        _burn_factor(burned),
        _spread_factor(subnet),
        _self_mining_factor(owned),
        _registration_factor(by_id.get("PF301")),
    ]
    score = round(100 * sum(f.weight * f.score for f in factors))
    if "PF303" in by_id:
        score = min(score, NOT_STARTED_CAP)
    return Health(
        netuid=subnet.netuid,
        score=score,
        band=band(score),
        factors=factors,
        findings=findings,
    )
