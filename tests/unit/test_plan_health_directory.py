"""Launch planner, hyperparameter explainer, Health Score and the subnet directory.

Offline tests use factory snapshots and the real catalog yaml. The two live smoke tests
read finney and run only when selected: `uv run pytest -m live tests/unit/...`.
"""

from __future__ import annotations

import pytest

from preflight.core.chain import registry as R
from preflight.core.chain.network import Network
from preflight.core.directory import catalog
from preflight.core.directory.health import WEIGHTS, band, health, miner_concentration
from preflight.core.models import Severity
from preflight.core.plan.hyperparams import DEFAULTS, SPECS, U16, U64, explain_hyperparams, span
from preflight.core.plan.launch import build_timeline, merge_defaults

from .factory import BLOCK, OWNER_COLD, neuron, params, replace, subnet, validator

DASHES = (chr(0x2014), chr(0x2013))  # em and en dash, banned by BUILD.md section 15

# Hyperparameters

RAW = {
    "tempo": 360,
    "kappa": 32_767,
    "min_burn": 500_000,
    "max_burn": 100_000_000_000,
    "burn_increase_mult": 23_242_897_532_874_035_200,
    "owner_emission": 3_320_329_489_486_196_244,
    "bonds_moving_avg": 900_000,
    "commit_reveal_weights_enabled": False,
    "commit_reveal_period": 1,
    "activity_cutoff_factor": 13_889,
    "epoch_consensus": 0,
    "subnet_is_active": True,
    "collateral_drain_ratio": {"bits": 1 << 64},
    "brand_new_param": 7,
}


def test_hyperparams_format_units_and_who() -> None:
    rows = {row.name: row for row in explain_hyperparams(RAW)}
    assert rows["tempo"].value == "360 blocks (about 72 min)"
    assert rows["tempo"].who == "owner" and rows["tempo"].group == "Consensus"
    assert rows["kappa"].value == "50%" and rows["kappa"].who == "root"
    assert rows["min_burn"].value == "0.0005 TAO"
    assert rows["max_burn"].value == "100 TAO"
    assert rows["burn_increase_mult"].value == "1.26x"
    assert rows["owner_emission"].value == "18%" and rows["owner_emission"].group == "Emissions"
    assert rows["bonds_moving_avg"].value == "90%"
    assert rows["commit_reveal_weights_enabled"].value == "off"
    assert rows["commit_reveal_weights_enabled"].group == "Commit reveal"
    assert rows["commit_reveal_period"].value == "1 tempo"
    assert rows["activity_cutoff_factor"].value == "13,889 (13.9 tempos)"
    assert rows["epoch_consensus"].value == "Yuma"
    assert rows["subnet_is_active"].who == "chain"
    assert rows["collateral_drain_ratio"].value == "1x"


def test_hyperparams_keep_every_key_and_group_in_order() -> None:
    rows = explain_hyperparams(RAW)
    assert {row.name for row in rows} == set(RAW)
    unknown = rows[-1]
    assert unknown.name == "brand_new_param" and unknown.group == "Other" and unknown.value == "7"
    order = ["Registration", "Weights", "Consensus", "Emissions", "Commit reveal", "Other"]
    ranks = [order.index(row.group) for row in rows]
    assert ranks == sorted(ranks)


def test_hyperparam_text_follows_writing_rules() -> None:
    for name, spec in SPECS.items():
        text = spec.meaning + (spec.range or "")
        assert not any(dash in text for dash in DASHES), name
        assert not spec.meaning.endswith("."), name


def test_defaults_are_all_explained_and_sane() -> None:
    assert set(DEFAULTS) <= set(SPECS)
    assert set(R.FRESH_SUBNET_DEFAULTS) <= set(SPECS)
    rows = {row.name: row.value for row in explain_hyperparams(DEFAULTS)}
    assert rows["max_allowed_uids"] == "256"
    assert rows["immunity_period"] == "5,000 blocks (about 16.7 h)"
    assert rows["owner_emission"] == "18%" and rows["miner_emission"] == "41%"
    assert DEFAULTS["kappa"] / U16 == pytest.approx(0.5, abs=1e-4)
    assert DEFAULTS["validator_emission"] / U64 == pytest.approx(0.41)


def test_merge_defaults_prefers_live_values() -> None:
    merged = merge_defaults({"default:tempo": 99, "default:kappa": None, "cost": 5})
    assert merged["tempo"] == 99
    assert merged["kappa"] == DEFAULTS["kappa"]
    assert "cost" not in merged


def test_span_units() -> None:
    assert span(1) == "1 block (about 12 s)"
    assert span(14_400) == "14,400 blocks (about 2.0 days)"
    assert span(1_840) == "1,840 blocks (about 6.1 h)"
    assert span(432_000) == "432,000 blocks (about 60.0 days)"


# Launch timeline


def test_timeline_blocks_and_cap_text() -> None:
    steps = build_timeline(
        block=1_000,
        rate_limited=True,
        cost=300.0,
        min_lock=1.0,
        decay_per_block=0.01,
        head=900,
        at_cap=True,
        replaced=16,
        replaced_name="Zero Hour",
        start_delay=0,
        tempo=360,
        immunity=432_000,
        block_seconds=12.0,
    )
    labels = [step.label for step in steps]
    assert labels == ["Register network", "Start call allowed", "First emissions", "Immunity ends"]
    register, start, first, immune = steps
    assert register.block == 1_000 and start.block == 1_000
    assert first.block == 1_000 + 1 + 360
    assert immune.block == 1_000 + 432_000
    assert "rate limited until block 1,000" in register.detail
    assert "dissolves SN16 Zero Hour" in register.detail
    assert "floor at block 30,800" in register.detail  # 900 + ceil(299 / 0.01)
    assert "about 299.0000 TAO at block 1,000" in register.detail


def test_timeline_without_cap_or_rate_limit() -> None:
    steps = build_timeline(
        block=500,
        rate_limited=False,
        cost=1.0,
        min_lock=1.0,
        decay_per_block=None,
        head=500,
        at_cap=False,
        replaced=16,
        replaced_name=None,
        start_delay=7_200,
        tempo=360,
        immunity=100,
        block_seconds=12.0,
    )
    assert steps[1].block == 500 + 7_200
    assert "rate limited" not in steps[0].detail and "dissolves" not in steps[0].detail
    assert "StartCallDelay is 7,200 blocks" in steps[1].detail


# Health


def test_healthy_subnet_scores_100() -> None:
    result = health(subnet())
    assert result.score == 100 and result.band == "healthy"
    assert result.findings == []
    assert sum(f.weight for f in result.factors) == pytest.approx(1.0)
    assert {f.id for f in result.factors} == set(WEIGHTS)


def test_stale_validators_lower_the_score_and_fire_pf305() -> None:
    s = replace(replace(subnet(), 0, last_update=BLOCK - 2_000), 1, last_update=BLOCK - 2_000)
    result = health(s)
    factor = next(f for f in result.factors if f.id == "validators_active")
    assert factor.score == 0 and factor.value == "0 of 2"
    assert result.score == 70
    assert "PF305" in {f.id for f in result.findings}


def test_owner_burn_and_self_mining() -> None:
    burn = subnet()
    for uid in (2, 3, 4, 5):
        burn = replace(burn, uid, incentive=0.0)
    burn = replace(burn, 6, incentive=1.0)
    result = health(burn)
    factor = next(f for f in result.factors if f.id == "owner_burn")
    assert factor.score == 0 and factor.value == "100.0%"
    assert "PF304" in {f.id for f in result.findings}
    assert result.band == "watch"

    owned = replace(replace(subnet(), 2, coldkey=OWNER_COLD), 3, coldkey=OWNER_COLD)
    result = health(owned)
    factor = next(f for f in result.factors if f.id == "owner_self_mining")
    assert (
        factor.score == pytest.approx(0.5) and "looks like owner self mining" in factor.explanation
    )
    assert "PF306" in {f.id for f in result.findings}


def test_registration_states_map_to_scores() -> None:
    closed = health(subnet(params=params(registration_allowed=False)))
    assert next(f for f in closed.factors if f.id == "registration_open").score == 0
    assert any(f.id == "PF301" and f.severity == Severity.CRITICAL for f in closed.findings)
    capped = health(subnet(regs_this_interval=6))
    assert next(f for f in capped.factors if f.id == "registration_open").score == 0.5


def test_emissions_not_started_caps_at_risk() -> None:
    result = health(subnet(first_emission_block=None))
    assert result.score == 39 and result.band == "at_risk"
    assert "PF303" in {f.id for f in result.findings}


def test_concentration_counts_non_earning_miners() -> None:
    s = subnet()
    for uid in (3, 4, 5):
        s = replace(s, uid, incentive=0.0)
    concentration, earners, miners = miner_concentration(s)
    assert (earners, miners) == (1, 4)
    # One of four equal-weight slots holds everything: population Gini is 1 - 1/4.
    assert concentration == pytest.approx(0.75)
    many = subnet(
        neurons=[validator(0), *[neuron(uid, incentive=float(uid)) for uid in range(1, 5)]]
    )
    values = [1.0, 2.0, 3.0, 4.0, 0.0, 0.0]
    brute = sum(abs(a - b) for a in values for b in values) / (
        2 * len(values) ** 2 * (sum(values) / len(values))
    )
    padded = many.model_copy(
        update={"neurons": [*many.neurons, neuron(5, incentive=0.0), neuron(6, incentive=0.0)]}
    )
    assert miner_concentration(padded)[0] == pytest.approx(brute)


def test_bands() -> None:
    assert (
        band(70) == "healthy"
        and band(69) == "watch"
        and band(40) == "watch"
        and band(39) == "at_risk"
    )


def test_health_text_never_accuses() -> None:
    worst = subnet(params=params(registration_allowed=False), first_emission_block=None)
    for uid in (2, 3):
        worst = replace(worst, uid, coldkey=OWNER_COLD)
    text = " ".join(f.explanation for f in health(worst).factors).lower()
    assert "scam" not in text and "fraud" not in text
    assert not any(dash in text for dash in DASHES)


# Catalog


def test_catalog_loads_and_validates() -> None:
    entries = catalog.load()
    assert len(entries) == 35
    assert [e.netuid for e in entries] == sorted(e.netuid for e in entries)
    assert all(e.sources for e in entries)
    assert catalog.by_netuid()[64].name == "Chutes"


@pytest.mark.parametrize(
    ("query", "first"),
    [
        ("3D", 17),
        ("chutes", 64),
        ("SN64", 64),
        ("404-GEN", 17),
        ("Targon", 4),
        ("gpu", None),
    ],
)
def test_search_ranks_best_match_first(query: str, first: int | None) -> None:
    results = catalog.search(query)
    assert results, query
    if first is not None:
        assert results[0].netuid == first
    else:
        assert all("compute" in r.capabilities or "gpu" in r.summary.lower() for r in results)


def test_search_capability_words_and_case() -> None:
    inference = catalog.search("Inference")
    assert inference and "inference" in inference[0].capabilities
    assert {e.netuid for e in catalog.search("inference")} == {e.netuid for e in inference}
    assert catalog.search("macrocosmos")[0].operator == "Macrocosmos"
    assert catalog.search("") == list(catalog.load())
    assert catalog.search("zzzz-nothing") == []
    assert len(catalog.search("training", limit=2)) == 2


# Live smoke tests: run with `-m live`


def _live_selected(request: pytest.FixtureRequest) -> None:
    if "live" not in str(request.config.getoption("-m") or ""):
        pytest.skip("live: run with -m live")


@pytest.mark.live
def test_live_launch_plan(request: pytest.FixtureRequest) -> None:
    _live_selected(request)
    from preflight.core.plan.launch import launch_plan

    plan = launch_plan(Network.resolve("finney"))
    assert plan.lock_cost_tao >= plan.min_lock_tao > 0
    assert plan.subnet_limit >= 64 and 0 < plan.subnet_count <= plan.subnet_limit
    assert plan.rate_limit_blocks > 0 and plan.block_seconds > 0
    if plan.subnet_count >= plan.subnet_limit:
        assert plan.replaced_netuid is not None
    blocks = [step.block for step in plan.timeline]
    assert all(b is not None and b >= plan.chain.block for b in blocks)
    assert {row.name for row in plan.defaults} >= {"tempo", "kappa", "immunity_period"}


@pytest.mark.live
def test_live_subnet_detail_64(request: pytest.FixtureRequest) -> None:
    _live_selected(request)
    from preflight.core.directory.live import subnet_detail

    detail = subnet_detail(Network.resolve("finney"), 64)
    card = detail.card
    assert card.catalog is not None and card.catalog.name == "Chutes"
    assert card.live is not None and card.live.miners + card.live.validators > 0
    assert card.live.price_tao and card.live.emission_share
    assert card.health is not None and 0 <= card.health.score <= 100
    assert len(card.health.factors) == len(WEIGHTS)
    assert {row.name for row in detail.hyperparams} >= {"tempo", "kappa", "min_burn", "max_burn"}
