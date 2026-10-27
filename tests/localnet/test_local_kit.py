"""`preflight local` against a fresh container: up, the healthy baseline, and every break.

Run with `uv run pytest tests/localnet -m chain -x -v`. Docker must be running; the session
replaces any container named `preflight_localnet`.
"""

from __future__ import annotations

import hashlib
import json
import stat
from pathlib import Path

import httpx
import pytest

from preflight.core.chain.harness import signed_extrinsic_hash
from preflight.core.chain.localnet import LOOPBACK_AXON_IP
from preflight.core.chain.network import Network
from preflight.core.doctor.engine import diagnose
from preflight.core.local import SCENARIOS, BreakResult, LocalState, break_scenario, status
from preflight.core.models import Diagnosis, Severity

pytestmark = pytest.mark.chain

LOCAL = Network.resolve("local")


def diagnosis(hotkey: str, netuid: int) -> Diagnosis:
    report = diagnose(LOCAL, hotkey, netuid)
    assert len(report.diagnoses) == 1
    return report.diagnoses[0]


def rule_ids(result: BreakResult) -> list[str]:
    return [f.id for f in diagnosis(result.hotkey, result.netuid).findings]


def test_up_registers_every_neuron_with_distinct_axons(local_state: LocalState) -> None:
    miners = [n for n in local_state.neurons if n.role == "miner"]
    validators = [n for n in local_state.neurons if n.role == "validator"]
    assert len(miners) == 3
    assert len(validators) == 2
    assert all(n.uid is not None and n.netuid == local_state.netuid for n in miners + validators)
    assert len({n.uid for n in miners + validators}) == 5
    assert all(n.axon is not None and n.axon.startswith(f"[{LOOPBACK_AXON_IP}]:") for n in miners)
    assert len({n.axon for n in miners}) == 3
    assert all(n.stake > 0 for n in validators)


def test_up_persists_state_and_keys_without_leaking_mnemonics(
    local_state: LocalState, local_home: Path
) -> None:
    state_file = local_home / "state.json"
    keys_file = local_home / "keys.json"
    assert json.loads(state_file.read_text())["netuid"] == local_state.netuid
    assert "mnemonic" not in state_file.read_text()
    assert stat.S_IMODE(keys_file.stat().st_mode) == 0o600
    assert "mnemonic" not in local_state.model_dump_json()


def test_status_reads_back_the_running_localnet(local_state: LocalState, local_home: Path) -> None:
    current = status(home=local_home)
    assert current is not None
    assert current.netuid == local_state.netuid
    assert current.block >= local_state.block


def test_healthy_neurons_from_up_have_no_critical_findings(local_state: LocalState) -> None:
    for neuron in local_state.neurons:
        if neuron.role not in ("miner", "validator"):
            continue
        found = diagnosis(neuron.hotkey, neuron.netuid)
        assert found.role == neuron.role, neuron.name
        critical = [f.id for f in found.findings if f.severity == Severity.CRITICAL]
        assert critical == [], f"{neuron.name}: {critical}"
        if neuron.role == "miner":
            assert found.neuron is not None and found.neuron.incentive > 0, neuron.name


@pytest.mark.parametrize(
    ("scenario", "rule"),
    [
        ("unserved-axon", "PF105"),
        ("loopback-axon", "PF106"),
        ("no-weight-miner", "PF108"),
        ("low-stake-validator", "PF204"),
        ("stale-validator", "PF202"),
        ("rate-limited-validator", "PF203"),
        ("pending-reveal", "PF205"),
    ],
)
def test_break_scenario_makes_the_doctor_report_its_rule(
    local_state: LocalState, local_home: Path, scenario: str, rule: str
) -> None:
    assert SCENARIOS[scenario].rule == rule
    result = break_scenario(scenario, home=local_home)
    assert result.expected_rule == rule
    assert rule in rule_ids(result)


def test_break_scenarios_can_run_twice(local_state: LocalState, local_home: Path) -> None:
    for scenario in ("unserved-axon", "stale-validator", "pending-reveal"):
        result = break_scenario(scenario, home=local_home)
        assert result.expected_rule in rule_ids(result), scenario


def test_loopback_scenario_keeps_the_rejected_extrinsic(
    local_state: LocalState, local_home: Path
) -> None:
    result = break_scenario("loopback-axon", home=local_home)
    failed = result.failed_extrinsic
    assert failed is not None
    assert failed.error == "InvalidIpAddress"
    assert failed.stage == "pool"
    assert failed.call == "SubtensorModule.serve_axon"
    assert failed.extrinsic_hash.startswith("0x") and len(failed.extrinsic_hash) == 66
    # The fix that did land went through the same signing path; its computed hash must
    # match the bytes in the block, which proves the rejected hash is computed right too.
    fixed = result.landed_extrinsic
    assert fixed is not None and fixed.block is not None and fixed.index is not None
    block_hash = httpx.post(
        "http://127.0.0.1:9944",
        json={"jsonrpc": "2.0", "id": 1, "method": "chain_getBlockHash", "params": [fixed.block]},
    ).json()["result"]
    block = httpx.post(
        "http://127.0.0.1:9944",
        json={"jsonrpc": "2.0", "id": 1, "method": "chain_getBlock", "params": [block_hash]},
    ).json()["result"]["block"]
    landed = block["extrinsics"][fixed.index]
    digest = "0x" + hashlib.blake2b(bytes.fromhex(landed[2:]), digest_size=32).hexdigest()
    assert digest == fixed.extrinsic_hash


@pytest.fixture(scope="module")
def deregistered(local_state: LocalState, local_home: Path) -> BreakResult:
    return break_scenario("deregistered-miner", home=local_home)


def test_deregistered_miner_lost_its_uid(deregistered: BreakResult) -> None:
    found = diagnosis(deregistered.hotkey, deregistered.netuid)
    assert found.neuron is None
    assert deregistered.uid is not None


@pytest.mark.xfail(
    strict=True,
    reason=(
        "find_deregistration requires the hotkey to hold a UID at max(1, head - 21600); on a "
        "localnet younger than 21600 blocks that block predates the subnet, and the node keeps "
        "only ~256 blocks of state, so PF101 fires instead. See docs/decisions/002-localnet.md"
    ),
)
def test_deregistered_miner_makes_the_doctor_report_pf102(deregistered: BreakResult) -> None:
    assert "PF102" in rule_ids(deregistered)


def test_signed_extrinsic_hash_length_prefixes_the_v4_body() -> None:
    body = b"\x84\x00" + b"\x01" * 32 + b"\x01" + b"\x02" * 64 + b"\x00" + b"\x07"
    assert len(body) == 101  # two-byte compact length: (101 << 2) | 1, little endian
    expected = hashlib.blake2b(((101 << 2) | 1).to_bytes(2, "little") + body, digest_size=32)
    assert signed_extrinsic_hash(b"\x01" * 32, b"\x02" * 64, b"\x00", b"\x07") == (
        "0x" + expected.hexdigest()
    )
