"""`preflight local` against a fresh container: up, the healthy baseline, and every break.

Run with `uv run pytest tests/localnet -m chain -x -v`. Docker must be running; the session
replaces any container named `preflight_localnet`.
"""

from __future__ import annotations

import hashlib
import json
import stat
from pathlib import Path

import bittensor as bt
import httpx
import pytest

from preflight.core.chain.harness import signed_extrinsic_hash
from preflight.core.chain.localnet import LOOPBACK_AXON_IP
from preflight.core.chain.network import Network, pin
from preflight.core.doctor.engine import diagnose
from preflight.core.local import (
    SCENARIOS,
    BreakResult,
    KitError,
    LocalState,
    break_scenario,
    fix_scenario,
    status,
)
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


def test_up_persists_state_and_a_disk_wallet_per_neuron(
    local_state: LocalState, local_home: Path
) -> None:
    state_file = local_home / "state.json"
    assert json.loads(state_file.read_text())["netuid"] == local_state.netuid
    assert "mnemonic" not in state_file.read_text()
    assert not (local_home / "keys.json").exists()
    for neuron in local_state.neurons:
        if neuron.role == "owner":
            assert neuron.wallet is None
            continue
        assert neuron.wallet == neuron.name
        wallet = bt.Wallet(name=neuron.name, hotkey="default", path=str(local_home / "wallets"))
        assert wallet.hotkey.ss58_address == neuron.hotkey
        assert wallet.coldkey.ss58_address == neuron.coldkey
        for key in ("coldkey", "hotkeys/default"):
            assert stat.S_IMODE((local_home / "wallets" / neuron.name / key).stat().st_mode) == 0o600


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


@pytest.mark.parametrize("scenario", ["unserved-axon", "loopback-axon", "no-weight-miner"])
def test_doctor_in_the_same_process_sees_a_break_as_soon_as_it_returns(
    local_state: LocalState, local_home: Path, scenario: str
) -> None:
    pin(LOCAL)  # a warm pooled client, as in a long-lived API or MCP process
    broken = break_scenario(scenario, home=local_home)
    assert pin(LOCAL).block >= broken.block
    fixed = fix_scenario(scenario, home=local_home)
    assert pin(LOCAL).block >= fixed.block


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


def test_deregistered_miner_makes_the_doctor_report_pf102(deregistered: BreakResult) -> None:
    assert "PF102" in rule_ids(deregistered)


@pytest.mark.parametrize(
    ("scenario", "rules"),
    [
        ("unserved-axon", ["PF105"]),
        ("loopback-axon", ["PF106"]),
        ("no-weight-miner", ["PF108"]),
        ("low-stake-validator", ["PF204"]),
        ("stale-validator", ["PF202"]),
        ("rate-limited-validator", ["PF203"]),
        ("deregistered-miner", ["PF101", "PF102"]),
    ],
)
def test_fix_scenario_makes_the_rule_go_away(
    local_state: LocalState, local_home: Path, scenario: str, rules: list[str]
) -> None:
    broken = break_scenario(scenario, home=local_home)
    assert broken.expected_rule in rule_ids(broken)
    fixed = fix_scenario(scenario, home=local_home)
    assert (fixed.scenario, fixed.hotkey, fixed.netuid) == (scenario, broken.hotkey, broken.netuid)
    assert fixed.command.startswith("btcli ")
    remaining = rule_ids(broken)
    assert not set(rules) & set(remaining), remaining
    assert "mnemonic" not in fixed.model_dump_json()


@pytest.mark.parametrize("scenario", ["unserved-axon", "loopback-axon"])
def test_axon_fixes_run_the_doctor_command_with_the_kit_wallet(
    local_state: LocalState, local_home: Path, scenario: str
) -> None:
    broken = break_scenario(scenario, home=local_home)
    fixed = fix_scenario(scenario, home=local_home)
    current = status(home=local_home)
    assert current is not None
    name = next(n.wallet for n in current.neurons if n.hotkey == broken.hotkey)
    assert fixed.command.startswith(
        f"btcli axon set --netuid {broken.netuid} --ip ::ffff:127.0.0.1 --port "
    )
    assert f"--network local --wallet-path {local_home / 'wallets'} --wallet {name} " in fixed.command
    assert fixed.ran


def test_pending_reveal_has_no_local_fix(local_state: LocalState, local_home: Path) -> None:
    break_scenario("pending-reveal", home=local_home)
    with pytest.raises(KitError, match="drand"):
        fix_scenario("pending-reveal", home=local_home)


def test_signed_extrinsic_hash_length_prefixes_the_v4_body() -> None:
    body = b"\x84\x00" + b"\x01" * 32 + b"\x01" + b"\x02" * 64 + b"\x00" + b"\x07"
    assert len(body) == 101  # two-byte compact length: (101 << 2) | 1, little endian
    expected = hashlib.blake2b(((101 << 2) | 1).to_bytes(2, "little") + body, digest_size=32)
    assert signed_extrinsic_hash(b"\x01" * 32, b"\x02" * 64, b"\x00", b"\x07") == (
        "0x" + expected.hexdigest()
    )
