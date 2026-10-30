"""Account: the balance, stakes and keys of any address, on any network, at one block.

Explorers cover mainnet only, so a testnet or localnet balance had no page. This reads
System.Account, the stake runtime API and the key ownership maps at one pinned block and
never signs anything. A part that cannot be read is left out and named, never guessed.
"""

from __future__ import annotations

import time
from collections.abc import Callable
from typing import Any

import bittensor as bt
from bittensor.sp_core import ss58_encode

from ..chain.network import Network, Pinned, gather, is_transient, pin, with_retries
from ..models import AccountBalance, AccountReport, AccountStake, HotkeySeat, OwnedHotkey

RAO = 1e9
ROOT_NETUID = 0
MAX_HOTKEYS = 64
# SubtensorModule.Owner is a ValueQuery: an address that is not a hotkey reads back as the
# all-zero AccountId, which is not an owner.
ZERO_ACCOUNT = ss58_encode(bytes(32), 42)


def _optional[R](read: Callable[[], R]) -> R | None:
    """A read whose failure leaves its part out. Connection trouble still propagates, so
    `with_retries` gets a fresh client instead of a report with holes."""
    try:
        return read()
    except (bt.ConnectionNotReady, bt.RpcConnectionError, ConnectionError, TimeoutError):
        raise
    except Exception as error:  # the SDK raises many decode and runtime types
        if is_transient(str(error)):
            raise
        return None


def owner_of(raw: object) -> str | None:
    """The coldkey from an Owner read, or None when the address is not a hotkey."""
    text = str(raw or "").strip()
    return text if text and text != ZERO_ACCOUNT else None


def balance_of(account: dict[str, Any] | None) -> AccountBalance:
    account = account or {}
    data: dict[str, Any] = account.get("data") or {}
    free = int(data.get("free") or 0)
    reserved = int(data.get("reserved") or 0)
    # Older runtimes split frozen into misc_frozen and fee_frozen
    frozen = int(data["frozen"]) if data.get("frozen") is not None else max(int(data.get("misc_frozen") or 0), int(data.get("fee_frozen") or 0))
    return AccountBalance(
        free=free / RAO,
        reserved=reserved / RAO,
        frozen=frozen / RAO,
        transferable=max(free - frozen, 0) / RAO,
        nonce=int(account.get("nonce") or 0),
    )


def stakes_of(positions: list[Any], prices: dict[int, float] | None) -> list[AccountStake]:
    """Non-zero positions, each priced at spot: root is TAO one to one, a subnet without a
    price keeps its alpha amount and no TAO value."""
    rows: list[AccountStake] = []
    for position in positions:
        rao = int(position.stake.rao)
        if rao <= 0:
            continue
        netuid = int(position.netuid)
        price = 1.0 if netuid == ROOT_NETUID else (prices or {}).get(netuid)
        alpha = rao / RAO
        rows.append(
            AccountStake(
                hotkey=str(position.hotkey),
                netuid=netuid,
                alpha=alpha,
                tao_per_alpha=float(price) if price is not None else None,
                tao_value=alpha * float(price) if price is not None else None,
                hotkey_registered=bool(position.is_registered),
            )
        )
    rows.sort(key=lambda r: (-(r.tao_value or 0.0), r.netuid, r.hotkey))
    return rows


def _seats(pinned: Pinned, hotkey: str, netuids: list[int]) -> list[HotkeySeat]:
    uids = gather({str(n): (lambda n=n: _optional(lambda: pinned.view.neurons.uid(hotkey, n))) for n in netuids})
    return [HotkeySeat(netuid=n, uid=int(uids[str(n)]) if uids[str(n)] is not None else None) for n in netuids]


def read_account(pinned: Pinned, address: str) -> AccountReport:
    started = time.monotonic()
    view = pinned.view
    got = gather(
        {
            "account": lambda: pinned.query(("System", "Account"), [address]),
            "positions": lambda: _optional(lambda: list(view.staking.stake_for_coldkey(address))),
            "prices": lambda: _optional(lambda: {int(k): float(v) for k, v in view.prices.alpha_prices().items()}),
            "owned": lambda: _optional(lambda: [str(h) for h in view.neurons.owned_hotkeys(address)]),
            "owner": lambda: _optional(lambda: pinned.query(("SubtensorModule", "Owner"), [address])),
            "netuids": lambda: _optional(lambda: sorted(int(n) for n in view.neurons.netuids_for_hotkey(address))),
        }
    )
    omitted: list[str] = []
    positions: list[Any] | None = got["positions"]
    prices: dict[int, float] | None = got["prices"]
    if positions is None:
        omitted.append("Stakes: the stake runtime API did not answer, so staked TAO is left out")
    stakes = stakes_of(positions or [], prices)
    if any(s.tao_value is None for s in stakes):
        omitted.append("TAO value of some alpha stakes: no spot price was readable for their subnet")

    owned: list[str] | None = got["owned"]
    if owned is None:
        omitted.append("Owned hotkeys: OwnedHotkeys could not be read")
    owned = owned or []
    checked = owned[:MAX_HOTKEYS]
    memberships: dict[str, list[int] | None] = gather(
        {h: (lambda h=h: _optional(lambda: sorted(int(n) for n in view.neurons.netuids_for_hotkey(h)))) for h in checked}
    )
    if any(m is None for m in memberships.values()):
        omitted.append("Seats of some owned hotkeys: IsNetworkMember could not be read")
    seated = gather({h: (lambda h=h: _seats(pinned, h, memberships[h] or [])) for h in checked})
    owned_rows = [OwnedHotkey(hotkey=h, seats=seated[h]) for h in checked]
    if len(owned) > len(checked):
        omitted.append(f"Seats of {len(owned) - len(checked)} more owned hotkeys: only the first {MAX_HOTKEYS} are read")

    netuids: list[int] | None = got["netuids"]
    if netuids is None:
        omitted.append("Seats of this address: IsNetworkMember could not be read")
    own_seats = _seats(pinned, address, netuids or [])

    balance = balance_of(got["account"])
    staked = sum(s.tao_value or 0.0 for s in stakes)
    return AccountReport(
        address=address,
        chain=pinned.ref,
        balance=balance,
        stakes=stakes,
        staked_tao=staked,
        total_tao=balance.free + staked,
        owned_hotkeys=owned_rows,
        owned_hotkeys_total=len(owned),
        hotkey_owner=owner_of(got["owner"]),
        seats=own_seats,
        omitted=omitted,
        elapsed_ms=int((time.monotonic() - started) * 1000),
    )


def account_report(network: Network, address: str, *, block: int | None = None) -> AccountReport:
    """Everything one address holds, read at one block. Read only: nothing is signed or sent."""
    started = time.monotonic()
    pinned = pin(network, block)
    report = with_retries(network, lambda: read_account(pinned, address))
    return report.model_copy(update={"elapsed_ms": int((time.monotonic() - started) * 1000)})
