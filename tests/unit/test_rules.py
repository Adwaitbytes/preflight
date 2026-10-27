"""Every rule has a firing case and a quiet case on hand-built snapshots."""

from __future__ import annotations

from preflight.core.chain.snapshot import Deregistration, PendingCommit, ProbeResult
from preflight.core.doctor import rules_miner as m
from preflight.core.doctor import rules_subnet as sn
from preflight.core.doctor import rules_validator as v
from preflight.core.doctor.engine import ALL_RULE_IDS, evaluate
from preflight.core.models import AxonInfo, Severity, Verdict

from .factory import BLOCK, OWNER_COLD, neuron, params, replace, snap, subnet, validator


def test_healthy_subnet_has_no_serious_findings() -> None:
    for uid in range(6):
        diagnosis = evaluate(snap(uid))
        serious = [f.id for f in diagnosis.findings if f.severity in (Severity.CRITICAL, Severity.HIGH)]
        assert serious == [], (uid, serious)


def test_rule_ids_are_unique_and_complete() -> None:
    assert len(ALL_RULE_IDS) == len(set(ALL_RULE_IDS)) == 27


# Miner rules


def test_pf101_fires_for_unregistered_hotkey() -> None:
    found = m.pf101_not_registered(snap(None))
    assert found is not None and found.severity == Severity.CRITICAL
    assert "btcli subnets register --netuid 7 --hotkey 5Stranger --network finney" in (found.fix.text if found.fix else "")


def test_pf101_quiet_when_registered_or_known_deregistration() -> None:
    assert m.pf101_not_registered(snap(2)) is None
    dereg = Deregistration(last_seen_block=BLOCK - 10, lost_at_block=BLOCK - 9, uid=3, incentive=0.0, emission=0.0)
    assert m.pf101_not_registered(snap(None, deregistration=dereg)) is None


def test_pf102_reports_the_block_the_seat_was_lost() -> None:
    dereg = Deregistration(last_seen_block=BLOCK - 10, lost_at_block=BLOCK - 9, uid=3, incentive=0.01, emission=0.5)
    found = m.pf102_recently_deregistered(snap(None, deregistration=dereg))
    assert found is not None and "UID 3" in found.title
    assert any(e.value == f"{BLOCK - 9:,}" for e in found.evidence)
    assert m.pf102_recently_deregistered(snap(None)) is None


def test_pf103_in_immunity_counts_blocks_left() -> None:
    s = replace(subnet(), 2, block_at_registration=BLOCK - 1000)
    found = m.pf103_in_immunity(snap(2, s))
    assert found is not None and any(e.value == "4,000" for e in found.evidence)
    assert m.pf103_in_immunity(snap(2)) is None


def test_pf104_next_to_prune_on_full_subnet_is_critical() -> None:
    s = subnet(params=params(max_uids=7))
    s = replace(s, 2, emission=0.1)
    found = m.pf104_near_pruning(snap(2, s))
    assert found is not None and found.severity == Severity.CRITICAL


def test_pf104_skips_owner_immune_and_high_emission() -> None:
    s = subnet(params=params(max_uids=7))
    # UID 6 is the owner hotkey with zero emission: exempt, so it never ranks
    order = [n.uid for n in m.pruning_order(s)]
    assert 6 not in order
    s = subnet(params=params(max_uids=60))
    assert m.pf104_near_pruning(snap(5, s)) is None


def test_pf105_fires_when_earners_use_axons() -> None:
    s = replace(subnet(), 2, axon=None, incentive=0.0)
    found = m.pf105_axon_not_served(snap(2, s))
    assert found is not None and found.severity == Severity.HIGH


def test_pf105_quiet_when_subnet_does_not_use_axons() -> None:
    s = subnet()
    for uid in (2, 3, 4, 5):
        s = replace(s, uid, axon=None)
    assert m.pf105_axon_not_served(snap(2, s)) is None


def test_pf106_flags_loopback_and_private_on_mainnet() -> None:
    for ip in ("127.0.0.1", "192.168.1.20", "10.0.0.4", "0.0.0.0", "::ffff:127.0.0.1"):
        s = replace(subnet(), 2, axon=AxonInfo(ip=ip, port=8091))
        assert m.pf106_axon_bad_address(snap(2, s)) is not None, ip


def test_pf106_accepts_mapped_loopback_on_localnet_only() -> None:
    s = replace(subnet(network="local"), 2, axon=AxonInfo(ip="::ffff:127.0.0.1", port=8091, ip_type=6))
    assert m.pf106_axon_bad_address(snap(2, s)) is None
    lan = replace(subnet(network="local"), 2, axon=AxonInfo(ip="192.168.1.20", port=8091))
    found = m.pf106_axon_bad_address(snap(2, lan))
    assert found is not None and "::ffff:127.0.0.1" in found.explanation
    assert m.pf106_axon_bad_address(snap(2)) is None


def test_pf107_reports_probe_error_only_on_failure() -> None:
    failed = ProbeResult(address="34.1.2.3:8002", ok=False, error="connection refused", elapsed_ms=4)
    found = m.pf107_axon_unreachable(snap(2, probe=failed))
    assert found is not None and any("refused" in e.value for e in found.evidence)
    ok = ProbeResult(address="34.1.2.3:8002", ok=True, elapsed_ms=4)
    assert m.pf107_axon_unreachable(snap(2, probe=ok)) is None
    assert m.pf107_axon_unreachable(snap(2)) is None


def test_pf108_no_weight_is_critical_out_of_immunity_medium_inside() -> None:
    w = {0: {3: 1.0}, 1: {3: 1.0}}
    found = m.pf108_no_validator_weight(snap(2, subnet(weights=w)))
    assert found is not None and found.severity == Severity.CRITICAL
    young = replace(subnet(weights=w), 2, block_at_registration=BLOCK - 10)
    found = m.pf108_no_validator_weight(snap(2, young))
    assert found is not None and found.severity == Severity.MEDIUM
    assert m.pf108_no_validator_weight(snap(2)) is None


def test_pf109_only_stale_validators_score_it() -> None:
    w = {0: {2: 1.0}, 1: {3: 1.0}}
    s = replace(subnet(weights=w), 0, last_update=BLOCK - 9_000)
    assert m.pf109_weights_from_stale_validators_only(snap(2, s)) is not None
    assert m.pf109_weights_from_stale_validators_only(snap(2, subnet(weights=w))) is None


def test_pf110_weighted_by_minority_stake_is_clipped() -> None:
    w = {0: {3: 1.0}, 1: {2: 1.0}}  # only the 3,000 stake validator weights UID 2: 37.5% < kappa
    s = replace(subnet(weights=w), 2, incentive=0.0)
    found = m.pf110_incentive_zero_but_weighted(snap(2, s))
    assert found is not None and any(e.value == "37.5%" for e in found.evidence)
    assert m.pf110_incentive_zero_but_weighted(snap(2)) is None


def test_pf111_low_trust_against_median() -> None:
    s = replace(subnet(), 2, trust=0.1)
    assert m.pf111_low_trust(snap(2, s)) is not None
    assert m.pf111_low_trust(snap(2)) is None


def test_pf112_many_uids_on_one_coldkey() -> None:
    s = subnet()
    for uid in (2, 3, 4, 5, 6):
        s = replace(s, uid, coldkey="5Farm")
    found = m.pf112_duplicate_coldkey_crowding(snap(2, s))
    assert found is not None and found.severity == Severity.INFO
    assert m.pf112_duplicate_coldkey_crowding(snap(2)) is None


def test_pf113_only_when_version_key_set() -> None:
    s = subnet(params=params(weights_version=42))
    assert m.pf113_version_mismatch(snap(2, s)) is not None
    assert m.pf113_version_mismatch(snap(2)) is None


# Validator rules


def test_pf201_staked_without_permit_shows_gap() -> None:
    s = subnet(neurons=[*subnet().neurons, neuron(7, stake=2_000.0)])
    found = v.pf201_no_validator_permit(snap(7, s))
    assert found is not None and any(e.value == "1,000 alpha" for e in found.evidence)
    assert v.pf201_no_validator_permit(snap(2)) is None


def test_pf202_stale_beyond_activity_cutoff_is_critical() -> None:
    s = replace(subnet(), 0, last_update=BLOCK - 6_000)
    found = v.pf202_weights_stale(snap(0, s))
    assert found is not None and found.severity == Severity.CRITICAL
    s = replace(subnet(), 0, last_update=BLOCK - 1_000)
    found = v.pf202_weights_stale(snap(0, s))
    assert found is not None and found.severity == Severity.MEDIUM
    assert v.pf202_weights_stale(snap(0)) is None


def test_pf203_rate_limit_names_the_allowed_block() -> None:
    s = replace(subnet(), 0, last_update=BLOCK - 10)
    found = v.pf203_rate_limited(snap(0, s))
    assert found is not None and f"{BLOCK + 90:,}" in found.title
    assert v.pf203_rate_limited(snap(0, replace(subnet(), 0, last_update=BLOCK - 200))) is None
    cr = replace(subnet(params=params(commit_reveal=True)), 0, last_update=BLOCK - 10)
    assert v.pf203_rate_limited(snap(0, cr)) is None


def test_pf204_below_stake_threshold_except_owner() -> None:
    s = replace(subnet(), 0, stake=500.0)
    found = v.pf204_below_min_stake_for_weights(snap(0, s))
    assert found is not None and "--amount 500" in (found.fix.text if found.fix else "")
    assert v.pf204_below_min_stake_for_weights(snap(0)) is None


def test_pf205_hash_commit_window_states() -> None:
    open_commit = PendingCommit(kind="hash", commit_block=BLOCK - 400, reveal_from_block=BLOCK - 10, reveal_until_block=BLOCK + 300)
    found = v.pf205_commit_pending_reveal(snap(0, commits=[open_commit]))
    assert found is not None and found.severity == Severity.MEDIUM
    expired = open_commit.model_copy(update={"reveal_until_block": BLOCK - 1})
    found = v.pf205_commit_pending_reveal(snap(0, commits=[expired]))
    assert found is not None and found.severity == Severity.HIGH
    assert v.pf205_commit_pending_reveal(snap(0)) is None


def test_pf205_timelocked_commits_need_no_action() -> None:
    commit = PendingCommit(kind="timelocked", commit_block=BLOCK - 5, reveal_round=123, reveals_at="2026-10-27T18:00:00+00:00")
    found = v.pf205_commit_pending_reveal(snap(0, commits=[commit]))
    assert found is not None and found.fix is None and found.severity == Severity.INFO


def test_pf206_too_few_uids_and_max_weight() -> None:
    s = subnet(params=params(min_allowed_weights=3), weights={0: {2: 0.5, 3: 0.5}, 1: {2: 0.25, 3: 0.25, 4: 0.25, 5: 0.25}})
    assert v.pf206_weights_too_few_uids(snap(0, s)) is not None
    capped = subnet(params=params(max_weights_limit=0.3), weights={0: {2: 0.7, 3: 0.3}, 1: {2: 0.25, 3: 0.25, 4: 0.25, 5: 0.25}})
    found = v.pf206_weights_too_few_uids(snap(0, capped))
    assert found is not None and "MaxWeightExceeded" in found.explanation
    assert v.pf206_weights_too_few_uids(snap(0)) is None


def test_pf207_weighting_own_coldkey() -> None:
    s = subnet()
    s = replace(replace(s, 2, coldkey="5Cold0"), 3, coldkey="5Cold0")
    s = s.model_copy(update={"weights": {0: {2: 0.4, 3: 0.4, 4: 0.2}, 1: s.weights[1]}})
    found = v.pf207_self_weighting(snap(0, s))
    assert found is not None and "looks like" in found.explanation
    assert v.pf207_self_weighting(snap(0)) is None


def test_pf208_copier_matches_previous_consensus() -> None:
    neurons = [validator(0), validator(1), validator(2), validator(3)] + [neuron(u) for u in range(4, 10)]
    previous = {
        1: {4: 0.5, 5: 0.3, 6: 0.2},
        2: {4: 0.5, 5: 0.3, 6: 0.2},
        3: {4: 0.5, 5: 0.3, 6: 0.2},
    }
    current = {
        0: {4: 0.5, 5: 0.3, 6: 0.2},  # the copier keeps last epoch's answer
        1: {7: 0.5, 8: 0.3, 9: 0.2},
        2: {7: 0.5, 8: 0.3, 9: 0.2},
        3: {7: 0.5, 8: 0.3, 9: 0.2},
    }
    s = subnet(neurons=neurons, weights=current, params=params(max_uids=16))
    found = v.pf208_copier_signature(snap(0, s, previous_weights=previous))
    assert found is not None and found.severity == Severity.INFO
    assert v.pf208_copier_signature(snap(1, s, previous_weights=previous)) is None
    assert v.pf208_copier_signature(snap(0, s)) is None


# Subnet rules


def test_pf301_states() -> None:
    assert sn.pf301_registration_closed(subnet(params=params(registration_allowed=False))) is not None
    found = sn.pf301_registration_closed(subnet(regs_this_interval=6))
    assert found is not None and found.severity == Severity.HIGH
    found = sn.pf301_registration_closed(subnet(regs_this_block=1))
    assert found is not None and found.severity == Severity.MEDIUM
    assert sn.pf301_registration_closed(subnet()) is None


def test_pf302_burn_spike() -> None:
    history = [(BLOCK - 1080, 1.0), (BLOCK - 720, 1.1), (BLOCK - 360, 0.9), (BLOCK, 5.0)]
    assert sn.pf302_burn_spiking(subnet(burn_tao=5.0, burn_history=history)) is not None
    calm = [(BLOCK - 1080, 1.0), (BLOCK - 720, 1.1), (BLOCK - 360, 0.9), (BLOCK, 1.0)]
    assert sn.pf302_burn_spiking(subnet(burn_history=calm)) is None


def test_pf303_not_started() -> None:
    found = sn.pf303_emissions_not_started(subnet(first_emission_block=None, registered_at=BLOCK - 10, start_call_delay=100))
    assert found is not None and found.fix is not None and found.fix.kind == "wait"
    ready = sn.pf303_emissions_not_started(subnet(first_emission_block=None))
    assert ready is not None and ready.fix is not None and "btcli hparams start --netuid 7" in ready.fix.text
    assert sn.pf303_emissions_not_started(subnet()) is None


def test_pf304_and_pf306_owner_shares() -> None:
    s = subnet()
    for uid in (2, 3, 4, 5):
        s = replace(s, uid, incentive=0.0)
    s = replace(s, 6, incentive=1.0)
    assert sn.pf304_near_full_burn(s) is not None
    assert sn.pf304_near_full_burn(subnet()) is None
    owned = replace(replace(subnet(), 2, coldkey=OWNER_COLD), 3, coldkey=OWNER_COLD)
    assert sn.pf306_owner_self_mining(owned) is not None
    assert sn.pf306_owner_self_mining(subnet()) is None


def test_pf305_most_validators_stale() -> None:
    s = replace(replace(subnet(), 0, last_update=BLOCK - 2_000), 1, last_update=BLOCK - 2_000)
    assert sn.pf305_weights_mostly_stale(s) is not None
    assert sn.pf305_weights_mostly_stale(subnet()) is None


def test_engine_verdict_and_headline() -> None:
    w = {0: {3: 1.0}, 1: {3: 1.0}}
    s = replace(subnet(weights=w), 2, axon=AxonInfo(ip="127.0.0.1", port=8091), incentive=0.0)
    diagnosis = evaluate(snap(2, s))
    assert diagnosis.verdict == Verdict.BROKEN
    assert diagnosis.headline.startswith("UID 2 on SN7 earns nothing because no validator has scored it")
    assert "127.0.0.1:8091" in diagnosis.headline
    assert diagnosis.role == "miner"
    assert evaluate(snap(0)).role == "validator"
    assert evaluate(snap(None)).role == "unregistered"


def test_permit_without_weights_or_stake_is_still_a_miner() -> None:
    # Small subnets give every UID a permit; that must not switch off the miner rules.
    s = replace(subnet(weights={0: {3: 1.0}, 1: {3: 1.0}}), 2, validator_permit=True, stake=12.0)
    diagnosis = evaluate(snap(2, s))
    assert diagnosis.role == "miner"
    assert "PF108" in [f.id for f in diagnosis.findings]
