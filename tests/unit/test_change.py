from __future__ import annotations

from preflight.core.doctor.change import compare, share, sig

from .factory import BLOCK, replace, subnet, validator


def test_validator_that_stopped_weighting_is_the_named_cause() -> None:
    before = subnet()
    after = subnet(weights={0: {3: 0.5, 4: 0.5}, 1: {2: 0.25, 3: 0.25, 4: 0.25, 5: 0.25}})
    after = replace(after, 2, incentive=0.04).model_copy(update={"chain": after.chain.model_copy(update={"block": BLOCK + 361})})
    result = compare(before, after, "5Hot2")
    assert result.change < -0.5
    assert result.drivers[0].uid == 0 and result.drivers[0].reason == "stopped weighting this UID"
    assert "fell 60%" in result.headline and "validator UID 0" in result.headline


def test_steady_and_lost_seat() -> None:
    assert "held steady" in compare(subnet(), subnet(), "5Hot2").headline
    gone = subnet(neurons=[n for n in subnet().neurons if n.uid != 2])
    assert "lost its seat" in compare(subnet(), gone, "5Hot2").headline


def test_small_numbers_keep_their_meaning() -> None:
    assert sig(0.000305) == "0.000305" and share(0.65836) == "65.8%" and share(0.000334) == "0.0334%"


def test_every_validator_moving_together_reads_as_consensus() -> None:
    neurons = [validator(0), validator(1, stake=3_000.0), validator(7, stake=2_000.0), *subnet().neurons[2:]]
    even = {2: 0.25, 3: 0.25, 4: 0.25, 5: 0.25}
    favoured = {2: 0.4, 3: 0.2, 4: 0.2, 5: 0.2}
    before = subnet(neurons=neurons, weights={0: even, 1: even, 7: even})
    after = replace(subnet(neurons=neurons, weights={0: favoured, 1: favoured, 7: favoured}), 2, incentive=0.16)
    headline = compare(before, after, "5Hot2").headline
    assert "all 3 validators that weight it (100.0% of validator stake) raised their weight on it" in headline
    assert "the largest, UID 0" in headline
