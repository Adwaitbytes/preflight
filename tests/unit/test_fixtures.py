"""Replay recorded real-chain snapshots offline; the Doctor must reach the same answer."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from preflight.core.chain.snapshot import NeuronSnapshot
from preflight.core.doctor.engine import evaluate

ROOT = Path(__file__).resolve().parent.parent / "fixtures"
FIXTURES = sorted(p for net in ("finney", "test", "local") for p in (ROOT / net).glob("*.json"))


@pytest.mark.parametrize("path", FIXTURES, ids=[f"{p.parent.name}/{p.stem}" for p in FIXTURES])
def test_recorded_snapshot_gives_recorded_diagnosis(path: Path) -> None:
    data = json.loads(path.read_text())
    diagnosis = evaluate(NeuronSnapshot.model_validate(data["snapshot"]))
    assert [f.id for f in diagnosis.findings] == data["expected_rules"]
    assert diagnosis.verdict.value == data["expected_verdict"]
    assert diagnosis.headline


def test_there_are_real_fixtures() -> None:
    assert len(FIXTURES) >= 4
