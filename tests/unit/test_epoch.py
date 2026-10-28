from __future__ import annotations

import json
from pathlib import Path

import pytest

from preflight.core.chain.snapshot import SubnetSnapshot
from preflight.core.epoch.preview import check, preview
from preflight.core.epoch.yuma import weighted_median
from preflight.core.models import EpochPreview, EpochWhatIf
from preflight.core.validate import InvalidInput

from .factory import BLOCK, replace, subnet

FIXTURES = Path(__file__).resolve().parent.parent / "fixtures" / "epochs" / "finney"
EPOCH = BLOCK + 350


def recorded(netuid: int) -> tuple[SubnetSnapshot, int, list[int]]:
    data = json.loads((FIXTURES / f"epoch_sn{netuid}.json").read_text())
    return SubnetSnapshot.model_validate(data["pre"]), data["epoch_block"], data["stored"]


@pytest.mark.parametrize("netuid", [19, 64])
def test_real_epochs_match_the_chain_to_the_last_step(netuid: int) -> None:
    pre, epoch_block, stored = recorded(netuid)
    result = check(pre, epoch_block, stored)
    assert result.matched and result.exact == result.uids == 256
    assert result.max_error <= 1
    assert result.headline.startswith("Matched the chain: all 256 UIDs")


def test_a_reveal_in_the_epoch_block_shows_as_a_small_gap_and_says_why() -> None:
    # SN51 commit-reveals; one validator's sealed weights opened in the epoch block itself
    pre, epoch_block, stored = recorded(51)
    result = check(pre, epoch_block, stored)
    assert not result.matched and result.exact >= 240
    assert result.total_error < 0.005
    assert "sealed weights revealed in the epoch block" in result.headline


def test_weighted_median_takes_the_value_a_stake_majority_agrees_on() -> None:
    assert weighted_median([0.6, 0.4], [0.1, 0.5], 0.5) == 0.1
    assert weighted_median([0.4, 0.6], [0.1, 0.5], 0.5) == 0.5
    assert weighted_median([], [], 0.5) == 0.0


def test_validators_that_agree_keep_every_weight() -> None:
    result = preview(subnet(), EPOCH)
    assert [round(m.incentive_next, 6) for m in result.miners] == [0.25] * 4
    assert all(m.clipped == 0 and m.reason.endswith("weight it and agree") for m in result.miners)
    assert all(v.status == "voting" and v.trust == pytest.approx(1.0) for v in result.validators)
    assert result.blocks_until == 350 and "SN7's next epoch (block 100,350, in about 70 min) pays 4 UIDs" in result.headline


def test_consensus_clips_a_minority_validators_outlier_weight() -> None:
    lopsided = subnet(weights={0: {2: 0.25, 3: 0.25, 4: 0.25, 5: 0.25}, 1: {2: 1.0}})
    result = preview(lopsided, EPOCH, hotkey="5Hot2")
    focus = result.focus
    assert focus is not None and focus.clipped == pytest.approx(1 - 0.25 / 0.53125)
    assert focus.incentive_next == pytest.approx(0.25 / 0.71875)
    assert "consensus cuts 52.9%" in focus.reason
    minority = next(v for v in result.validators if v.uid == 1)
    assert minority.trust == pytest.approx(0.25) and "75.0% of its weight sits above consensus" in minority.note


def test_what_if_a_validator_goes_offline_or_kappa_moves() -> None:
    lopsided = subnet(weights={0: {2: 0.25, 3: 0.25, 4: 0.25, 5: 0.25}, 1: {2: 1.0}})
    offline = preview(lopsided, EPOCH, hotkey="5Hot2", whatif=EpochWhatIf(drop_validators=[0]))
    assert offline.focus is not None and offline.focus.incentive_next == pytest.approx(1.0)
    assert offline.whatif == ["UID 0 goes offline"] and "with these changes" in offline.headline
    assert next(v for v in offline.validators if v.uid == 0).status == "inactive"
    lower = preview(lopsided, EPOCH, hotkey="5Hot2", whatif=EpochWhatIf(kappa=0.3))
    assert lower.focus is not None and lower.focus.clipped == 0 and lower.whatif == ["kappa 50.0% → 30.0%"]


def test_a_new_weight_row_is_tested_against_real_consensus() -> None:
    result = preview(subnet(), EPOCH, whatif=EpochWhatIf(weights={1: {2: 3, 3: 1}}))
    tested = next(v for v in result.validators if v.uid == 1)
    assert tested.weighted_uids == 2 and tested.trust == pytest.approx(0.5)
    assert result.whatif == ["UID 1 sets new weights on 2 UIDs"]


def test_bad_what_ifs_are_refused_in_words() -> None:
    with pytest.raises(InvalidInput, match="UID 99 is not registered on SN7"):
        preview(subnet(), EPOCH, whatif=EpochWhatIf(drop_validators=[99]))
    with pytest.raises(InvalidInput, match="must not be negative"):
        preview(subnet(), EPOCH, whatif=EpochWhatIf(weights={0: {2: -1}}))
    with pytest.raises(InvalidInput, match="at most 8"):
        preview(subnet(), EPOCH, whatif=EpochWhatIf(weights={uid: {2: 1} for uid in range(9)}))


def test_stale_or_thin_validators_do_not_vote() -> None:
    s = replace(replace(subnet(), 0, last_update=BLOCK - 6_000), 1, stake=500.0)
    statuses = {v.uid: v.status for v in preview(s, EPOCH).validators}
    assert statuses == {0: "inactive", 1: "below_threshold"}


def test_headlines_for_a_miner_dropped_and_a_stranger() -> None:
    dropped = subnet(weights={0: {2: 0.5, 3: 0.5}, 1: {2: 0.5, 3: 0.5}})
    result = preview(dropped, EPOCH, hotkey="5Hot5")
    assert result.headline.startswith("UID 5 on SN7 drops to zero at the next epoch")
    assert result.headline.endswith("no voting validator weights it any more")
    assert "holds no UID on SN7" in preview(subnet(), EPOCH, hotkey="5Stranger").headline


def test_api_previews_and_what_ifs_share_one_cached_read(monkeypatch: pytest.MonkeyPatch) -> None:
    from fastapi.testclient import TestClient

    from preflight import api
    from preflight.core.epoch import preview as module

    reads: list[int] = []
    real = "5FcJiV9Vc2Y5GemgWoXhksvQVXQ99csas9En9nYbSx38sS93"
    lopsided = replace(subnet(weights={0: {2: 0.25, 3: 0.25, 4: 0.25, 5: 0.25}, 1: {2: 1.0}}), 2, hotkey=real)

    def state(_net: object, netuid: int) -> module.EpochState:
        reads.append(netuid)
        return module.EpochState(subnet=lopsided, epoch_block=EPOCH)

    monkeypatch.setattr(module, "epoch_state", state)
    client = TestClient(api.app)
    first = client.get("/v1/epoch/finney/907", params={"hotkey": real})
    assert first.status_code == 200 and first.json()["focus"]["uid"] == 2
    tried = client.post("/v1/epoch/finney/907", json={"drop_validators": [0]})
    assert tried.status_code == 200 and tried.json()["whatif"] == ["UID 0 goes offline"]
    assert reads == [907]
    refused = client.post("/v1/epoch/finney/907", json={"drop_validators": [99]})
    assert refused.status_code == 400 and "UID 99 is not registered" in refused.json()["detail"]
    assert client.post("/v1/epoch/finney/907", json={"kappa": 2}).status_code == 422


def test_bot_epoch_leads_with_the_hotkey_and_links_the_lab(monkeypatch: pytest.MonkeyPatch) -> None:
    from preflight import bot
    from preflight.core.epoch import preview as module

    real = "5FcJiV9Vc2Y5GemgWoXhksvQVXQ99csas9En9nYbSx38sS93"
    s = replace(subnet(weights={0: {2: 0.5, 3: 0.5}, 1: {2: 0.5, 3: 0.5}}), 5, hotkey=real)

    def fake(_net: object, _netuid: int, *, hotkey: str | None = None, whatif: EpochWhatIf | None = None) -> EpochPreview:
        return preview(s, EPOCH, hotkey=hotkey, whatif=whatif)

    monkeypatch.setattr(module, "next_epoch", fake)
    text = bot.reply(f"/epoch 7 {real}", "1")
    assert text.startswith("📉 <b>UID 5 on SN7 drops to zero at the next epoch")
    assert "UID 5: incentive 0.1000 now → <b>0.0000</b> next epoch" in text
    assert "• UID 2: 50.0%" in text and "2 validators vote" in text
    assert f'/epoch/finney/7?hotkey={real}">Open Epoch Lab' in text
    assert "Send /epoch &lt;netuid&gt;" in bot.reply("/epoch", "1")
