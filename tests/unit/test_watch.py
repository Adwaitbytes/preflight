from __future__ import annotations

from preflight.core.doctor.engine import evaluate as diagnose_snapshot
from preflight.core.watch.alerts import evaluate, message
from preflight.core.watch.telegram import START

from .factory import BLOCK, replace, snap, subnet


def test_first_run_alerts_on_existing_problems_once() -> None:
    broken = diagnose_snapshot(snap(2, subnet(weights={0: {3: 1.0}, 1: {3: 1.0}})))
    fresh, state = evaluate(broken, None)
    assert {a.id for a in fresh} == {"PF104", "PF108"}
    again, _ = evaluate(broken, state)
    assert again == [], "a persisting problem must not alert twice"


def test_problem_that_clears_and_returns_alerts_again() -> None:
    broken = diagnose_snapshot(snap(5, subnet(weights={0: {3: 1.0}, 1: {3: 1.0}})))
    healthy = diagnose_snapshot(snap(5))
    _, state = evaluate(broken, None)
    _, state = evaluate(healthy, state)
    assert state.active == []
    fresh, _ = evaluate(broken, state)
    assert "PF108" in {a.id for a in fresh}


def test_incentive_drop_and_deregistration_transitions() -> None:
    before = diagnose_snapshot(snap(2))
    _, state = evaluate(before, None)
    dropped = diagnose_snapshot(snap(2, replace(subnet(), 2, incentive=0.01)))
    fresh, _ = evaluate(dropped, state)
    assert "incentive_drop" in [a.id for a in fresh]
    gone = diagnose_snapshot(snap(None))
    fresh, after = evaluate(gone, state)
    assert "deregistered" in [a.id for a in fresh]
    assert after.uid is None


def test_permit_loss_alerts() -> None:
    validator = diagnose_snapshot(snap(0))
    _, state = evaluate(validator, None)
    demoted = diagnose_snapshot(snap(0, replace(subnet(), 0, validator_permit=False)))
    fresh, _ = evaluate(demoted, state)
    assert "permit_lost" in [a.id for a in fresh]


def test_message_links_the_doctor_and_includes_the_fix() -> None:
    broken = diagnose_snapshot(snap(2, subnet(weights={0: {3: 1.0}, 1: {3: 1.0}})))
    fresh, _ = evaluate(broken, None)
    text = message(next(a for a in fresh if a.id == "PF108"), broken, "https://example.test")
    assert text.startswith("Preflight: UID 2 on SN7")
    assert f"https://example.test/doctor/finney/{broken.hotkey}?netuid=7" in text
    assert BLOCK > 0


def test_start_command_parsing() -> None:
    assert START.match("/start Ab12Cd34") is not None
    assert START.match("/start") is None
    assert START.match("/start ../../etc") is None
