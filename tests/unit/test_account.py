from dataclasses import dataclass, field
from typing import Any, cast

import bittensor as bt
import pytest
from bittensor.balance import Balance

from preflight.core.account import report as module
from preflight.core.account.report import (
    ZERO_ACCOUNT,
    account_report,
    balance_of,
    owner_of,
    read_account,
)
from preflight.core.chain.network import Network, Pinned

COLDKEY = "5DFVgQQbtgqjxuYzxbcSQPLktKUgnPHFRBdkvPD34kK87cws"
HOTKEY = "5EKtvzbEvYZPRJdo42ug7mWrHdt4AurCNMs5CAefuBHfQmhq"
OWNER = "5HDgs3ThsX8SoNFqVJUgbdqAZRJX9B6KR7QUbSmLFAfdFYJK"
VALIDATOR = "5HK5tp6t2S59DywmHRWPBVJeJ86T61KjurYqeooqj8sREpeN"
BLOCK = 8_336_800


@dataclass
class Position:
    hotkey: str
    netuid: int
    stake: Balance
    is_registered: bool = True


@dataclass
class Chain:
    """What the fake chain holds, keyed the way the reads ask for it."""

    accounts: dict[str, dict[str, Any]] = field(default_factory=dict[str, dict[str, Any]])
    owners: dict[str, str] = field(default_factory=dict[str, str])
    owned: dict[str, list[str]] = field(default_factory=dict[str, list[str]])
    members: dict[str, list[int]] = field(default_factory=dict[str, list[int]])
    uids: dict[tuple[str, int], int] = field(default_factory=dict[tuple[str, int], int])
    positions: dict[str, list[Position]] = field(default_factory=dict[str, list[Position]])
    prices: dict[int, float] = field(default_factory=dict[int, float])
    stake_api_fails: bool = False
    blocks: list[int | None] = field(default_factory=list[int | None])


class Staking:
    def __init__(self, chain: Chain) -> None:
        self.chain = chain

    def stake_for_coldkey(self, coldkey: str) -> list[Position]:
        if self.chain.stake_api_fails:
            raise bt.BittensorError("StakeInfoRuntimeApi_get_stake_info_for_coldkey is not a runtime API on this chain")
        return self.chain.positions.get(coldkey, [])


class Prices:
    def __init__(self, chain: Chain) -> None:
        self.chain = chain

    def alpha_prices(self) -> dict[int, float]:
        return self.chain.prices


class Neurons:
    def __init__(self, chain: Chain) -> None:
        self.chain = chain

    def owned_hotkeys(self, coldkey: str) -> list[str]:
        return self.chain.owned.get(coldkey, [])

    def netuids_for_hotkey(self, hotkey: str) -> list[int]:
        return self.chain.members.get(hotkey, [])

    def uid(self, hotkey: str, netuid: int) -> int | None:
        return self.chain.uids.get((hotkey, netuid))


class View:
    def __init__(self, chain: Chain) -> None:
        self.staking = Staking(chain)
        self.prices = Prices(chain)
        self.neurons = Neurons(chain)


class Client:
    def __init__(self, chain: Chain) -> None:
        self.chain = chain

    def query(self, item: tuple[str, str], params: list[Any] | None, block: int | None = None) -> Any:
        self.chain.blocks.append(block)
        key = str((params or [""])[0])
        if item == ("System", "Account"):
            return self.chain.accounts.get(key)
        if item == ("SubtensorModule", "Owner"):
            # A ValueQuery: an unknown key reads back as the all-zero AccountId
            return self.chain.owners.get(key, ZERO_ACCOUNT)
        raise AssertionError(f"unexpected storage read {item}")


def _pinned(chain: Chain) -> Pinned:
    return Pinned(Network.resolve("test"), BLOCK, "0x" + "ab" * 32, 486, View(chain), cast(bt.Subtensor, Client(chain)))


def _account(free: int, *, nonce: int = 1, reserved: int = 0, frozen: int = 0) -> dict[str, Any]:
    return {"nonce": nonce, "data": {"free": free, "reserved": reserved, "frozen": frozen, "flags": 0}}


def test_the_zero_owner_of_a_value_query_is_not_an_owner() -> None:
    assert ZERO_ACCOUNT == "5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM"
    assert owner_of(ZERO_ACCOUNT) is None
    assert owner_of(None) is None
    assert owner_of(OWNER) == OWNER

    report = read_account(_pinned(Chain(accounts={COLDKEY: _account(3_000_000_000)})), COLDKEY)

    assert report.hotkey_owner is None
    assert report.seats == []


def test_a_plain_testnet_coldkey_reads_its_free_balance_in_tao() -> None:
    chain = Chain(accounts={COLDKEY: _account(3_000_000_000, nonce=1)})

    report = read_account(_pinned(chain), COLDKEY)

    assert (report.balance.free, report.balance.transferable, report.balance.nonce) == (3.0, 3.0, 1)
    assert (report.staked_tao, report.total_tao) == (0.0, 3.0)
    assert report.stakes == [] and report.owned_hotkeys == [] and report.omitted == []
    assert (report.chain.network, report.chain.block) == ("test", BLOCK)
    # Every storage read is pinned to the one block the report names
    assert set(chain.blocks) == {BLOCK}


def test_an_unknown_address_holds_nothing() -> None:
    report = read_account(_pinned(Chain()), COLDKEY)

    assert (report.balance.free, report.balance.nonce, report.total_tao) == (0.0, 0, 0.0)


def test_frozen_funds_are_not_transferable() -> None:
    balance = balance_of(_account(5_000_000_000, reserved=1_000_000_000, frozen=2_000_000_000))
    assert (balance.free, balance.reserved, balance.frozen, balance.transferable) == (5.0, 1.0, 2.0, 3.0)
    assert balance_of(_account(1_000_000_000, frozen=4_000_000_000)).transferable == 0.0
    legacy = balance_of({"nonce": 0, "data": {"free": 2_000_000_000, "misc_frozen": 500_000_000, "fee_frozen": 0}})
    assert (legacy.frozen, legacy.transferable) == (0.5, 1.5)


def test_stakes_are_priced_at_spot_and_root_is_tao() -> None:
    chain = Chain(
        accounts={OWNER: _account(43_979_179, nonce=50)},
        positions={
            OWNER: [
                Position(VALIDATOR, 0, Balance.from_rao(15_787_815)),
                Position(VALIDATOR, 64, Balance.from_rao(10_000_000_000, 64)),
                Position(HOTKEY, 64, Balance.from_rao(0, 64)),
            ]
        },
        prices={0: 1.0, 64: 0.0673},
    )

    report = read_account(_pinned(chain), OWNER)

    assert [(s.netuid, s.alpha, s.tao_value) for s in report.stakes] == [(64, 10.0, pytest.approx(0.673)), (0, 0.015787815, 0.015787815)]
    assert report.staked_tao == pytest.approx(0.673 + 0.015787815)
    assert report.total_tao == pytest.approx(0.043979179 + 0.673 + 0.015787815)


def test_a_subnet_without_a_price_keeps_its_alpha_and_says_so() -> None:
    chain = Chain(positions={OWNER: [Position(VALIDATOR, 9, Balance.from_rao(2_000_000_000, 9))]}, prices={0: 1.0})

    report = read_account(_pinned(chain), OWNER)

    [stake] = report.stakes
    assert (stake.alpha, stake.tao_value) == (2.0, None)
    assert report.staked_tao == 0.0
    assert any("spot price" in note for note in report.omitted)


def test_a_failed_stake_read_is_left_out_and_named_not_guessed() -> None:
    chain = Chain(accounts={OWNER: _account(1_000_000_000)}, stake_api_fails=True)

    report = read_account(_pinned(chain), OWNER)

    assert report.stakes == [] and report.total_tao == 1.0
    assert any(note.startswith("Stakes") for note in report.omitted)


def test_a_coldkey_lists_its_hotkeys_with_their_seats() -> None:
    chain = Chain(
        owned={OWNER: [HOTKEY, VALIDATOR]},
        members={HOTKEY: [64], VALIDATOR: [0, 1]},
        uids={(HOTKEY, 64): 0, (VALIDATOR, 0): 3, (VALIDATOR, 1): 7},
    )

    report = read_account(_pinned(chain), OWNER)

    assert report.owned_hotkeys_total == 2
    assert [(h.hotkey, [(s.netuid, s.uid) for s in h.seats]) for h in report.owned_hotkeys] == [
        (HOTKEY, [(64, 0)]),
        (VALIDATOR, [(0, 3), (1, 7)]),
    ]
    assert report.hotkey_owner is None


def test_a_hotkey_names_its_owner_and_where_it_sits() -> None:
    chain = Chain(owners={HOTKEY: OWNER}, members={HOTKEY: [64]}, uids={(HOTKEY, 64): 0})

    report = read_account(_pinned(chain), HOTKEY)

    assert report.hotkey_owner == OWNER
    assert [(s.netuid, s.uid) for s in report.seats] == [(64, 0)]


def test_the_report_pins_one_block(monkeypatch: pytest.MonkeyPatch) -> None:
    chain = Chain(accounts={COLDKEY: _account(3_000_000_000)})
    pinned_at: list[int | None] = []

    def pin(_network: Network, block: int | None = None) -> Pinned:
        pinned_at.append(block)
        return _pinned(chain)

    monkeypatch.setattr(module, "pin", pin)

    report = account_report(Network.resolve("test"), COLDKEY)

    assert pinned_at == [None]
    assert report.chain.block == BLOCK and report.balance.free == 3.0


def test_api_refuses_a_bad_address_and_serves_a_good_one(monkeypatch: pytest.MonkeyPatch) -> None:
    from fastapi.testclient import TestClient

    from preflight import api

    chain = Chain(accounts={COLDKEY: _account(3_000_000_000)})

    def pin(_network: Network, _block: int | None = None) -> Pinned:
        return _pinned(chain)

    monkeypatch.setattr(module, "pin", pin)
    client = TestClient(api.app)

    bad = client.get("/v1/account/test/not-an-address")
    assert bad.status_code == 400 and bad.json()["kind"] == "invalid_input"
    assert "ss58" in bad.json()["detail"]

    good = client.get(f"/v1/account/test/{COLDKEY}")
    assert good.status_code == 200
    assert good.json()["balance"]["free"] == 3.0
    assert "s-maxage=12" in good.headers["cache-control"]

    assert client.get(f"/v1/account/local/{COLDKEY}").status_code == 400
