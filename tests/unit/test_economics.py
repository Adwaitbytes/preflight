from __future__ import annotations

from preflight.core.ask import ask
from preflight.core.plan.economics import assess

from .factory import OWNER_COLD, params, replace, subnet


def test_earning_subnet_has_bands_payback_and_a_verdict() -> None:
    result = assess(subnet(burn_tao=1.0), price=0.5)
    assert result.miners == 5  # UIDs 2 to 6; validators set weights
    assert result.earning_miners == 4
    median = next(b for b in result.bands if b.label.startswith("Median"))
    assert median.tao_per_day > 0
    assert result.payback_days is not None and result.payback_days > 0
    assert result.verdict in ("promising", "competitive")
    assert "earn today" in result.headline


def test_closed_registration_is_called_closed() -> None:
    result = assess(subnet(params=params(registration_allowed=False)), price=0.5)
    assert result.verdict == "closed"
    assert result.headline.startswith("SN7 Test is not taking new miners")


def test_full_burn_subnet_says_so() -> None:
    s = subnet()
    for uid in (2, 3, 4, 5):
        s = replace(s, uid, incentive=0.0, emission=0.0)
    s = replace(s, 6, incentive=1.0, coldkey=OWNER_COLD)
    result = assess(s, price=0.5)
    assert result.verdict == "hard"
    assert "burns its miner emission" in result.headline


def test_free_seats_note_and_full_subnet_turnover() -> None:
    roomy = assess(subnet(params=params(max_uids=64)), price=0.5)
    assert any("seats are free" in n for n in roomy.notes)
    assert roomy.seat_turnover_hours is None
    full = assess(subnet(params=params(max_uids=7, adjustment_interval=360, target_regs_per_interval=2)), price=0.5)
    assert full.seat_turnover_hours is not None and full.seat_turnover_hours > 0


def test_ask_routes_mining_questions() -> None:
    assert ask("should I mine sn64").intent == "economics"
    assert ask("how much do miners earn on subnet 51").route == "/subnets/51/mine"
