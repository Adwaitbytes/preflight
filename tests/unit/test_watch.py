from __future__ import annotations

from preflight.core.doctor.engine import evaluate as diagnose_snapshot
from preflight.core.epoch.preview import preview
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


def test_a_coming_cut_alerts_once_before_the_epoch_pays_it() -> None:
    healthy = diagnose_snapshot(snap(2))
    dropped = subnet(weights={0: {3: 0.5, 4: 0.5}, 1: {3: 0.5, 4: 0.5}})
    coming = preview(dropped, BLOCK + 350, hotkey="5Hot2")
    fresh, state = evaluate(healthy, None, coming)
    [alert] = [a for a in fresh if a.id == "epoch_drop"]
    assert alert.title == "UID 2 on SN7 is set to drop to zero at the next epoch, block 100,350 (in about 1.2 h)"
    assert "no voting validator weights it any more" in alert.detail
    text = message(alert, healthy, "https://example.test")
    assert "https://example.test/epoch/finney/7?hotkey=5Hot2" in text
    again, state = evaluate(healthy, state, coming)
    assert "epoch_drop" not in [a.id for a in again]
    steady, state = evaluate(healthy, state, preview(subnet(), BLOCK + 350, hotkey="5Hot2"))
    assert steady == [] and "epoch_drop" not in state.active

