from __future__ import annotations

import pytest

from preflight.core import errors_catalog as catalog
from preflight.core.tx.context import ExplainContext
from preflight.core.tx.explain import explain, explain_text


def test_catalog_is_vendored_with_hundreds_of_errors() -> None:
    assert len(catalog.chain_errors()) > 300
    assert catalog.fetched_at().startswith("20")


def test_every_catalog_error_has_a_non_empty_explanation() -> None:
    for name in catalog.chain_errors():
        result = explain(name)
        assert result.found and result.explanation.strip(), name


@pytest.mark.parametrize(
    ("text", "expected"),
    [
        ("SubtensorModule.TooManyRegistrationsThisBlock", "TooManyRegistrationsThisBlock"),
        (
            "bittensor.result.ChainError: SettingWeightsTooFast: The neuron set weights again before",
            "SettingWeightsTooFast",
        ),
        ("{'Module': {'index': 7, 'error': '0x4d000000'}}", "TooManyUnrevealedCommits"),
        ("Invalid Transaction: Custom error: 6", "RateLimitExceeded"),
        ("1010: Invalid Transaction: Inability to pay some fees (e.g. account balance too low)", "Payment"),
        ("nothing useful here", None),
    ],
)
def test_parse_error_names(text: str, expected: str | None) -> None:
    names = catalog.parse_error_names(text)
    if expected is None:
        assert names == []
    else:
        assert names[0] == expected


def test_context_numbers_reach_the_explanation_and_fix() -> None:
    ctx = ExplainContext(call="set_weights", block=1_000, last_update=950, rate_limit=100)
    result = explain("SettingWeightsTooFast", ctx)
    assert "block 1,050" in result.explanation
    assert result.fix is not None and result.fix.text == "Retry at or after block 1,050"
    assert result.trap == "weight_rate_limit"


def test_stake_gap_fills_the_command() -> None:
    ctx = ExplainContext(netuid=7, hotkey="5Hot", stake=400.0, stake_threshold=1000.0)
    result = explain("NotEnoughStakeToSetWeights", ctx)
    assert result.fix is not None and result.fix.text == "btcli stake add --netuid 7 --hotkey 5Hot --amount 600 --network finney"


def test_loopback_trap_on_localnet() -> None:
    ctx = ExplainContext(network="local", netuid=2, ip="127.0.0.1")
    result = explain("InvalidIpAddress", ctx)
    assert result.trap == "loopback_axon"
    assert result.fix is not None and "::ffff:127.0.0.1" in result.fix.text


def test_pool_rejection_without_catalog_entry() -> None:
    result = explain("Payment", ExplainContext(balance_tao=0.0, burn_tao=0.5, call="burned_register"))
    assert result.found and "held 0.0000 TAO" in result.explanation


def test_unknown_text_is_honest() -> None:
    result = explain_text("the vibes are off")
    assert not result.found
