"""Writes to a localnet: keys, sudo, funding, subnet setup, registration, weights.

Adapted from Crucible's harness. Localnet quirks it absorbs (bittensor 11.3, devnet image):
- `BurnedRegister` forces the MEV shield, whose decrypted extrinsic never lands on
  localnet, so registration goes through the raw `burned_register` call in the clear.
- Admin hyperparameters need sudo, which `//Alice` holds on devnet.
- The chain refuses `127.0.0.1` axons; see `localnet.LOOPBACK_AXON_IP`.
- Register every neuron before anyone stakes, keep `collateral_lock_share` at 0 and seed
  the pool with a 10,000 TAO lock, or registration fails with "reserves too low".
"""

from __future__ import annotations

import contextlib
import time
from collections.abc import Callable, Sequence
from dataclasses import dataclass
from typing import Any

import bittensor as bt
from bittensor.signing import Signer
from bittensor.sp_core import Keypair

from .network import is_transient

SUDO_URI = "//Alice"
FUNDING_TAO = 10_000
RETRIES = 8
RAO_PER_TAO = 1_000_000_000
# The lock seeds the new subnet's AMM pool; much below this, staking and registration
# fail with "reserves too low".
MIN_LOCK_TAO = 10_000
SUDO_FLOAT_TAO = 10_000_000


class ChainError(RuntimeError):
    """An extrinsic failed for a reason other than a transient pool error."""


@dataclass(frozen=True)
class DevWallet:
    """An in-memory wallet; satisfies bittensor's KeyedWallet protocol."""

    coldkey: Signer
    hotkey: Signer

    @property
    def coldkeypub(self) -> Signer:
        return self.coldkey

    @property
    def hotkey_ss58(self) -> str:
        return self.hotkey.ss58_address

    @property
    def coldkey_ss58(self) -> str:
        return self.coldkey.ss58_address


def new_mnemonic() -> str:
    return Keypair.generate_mnemonic()


def wallet_from_mnemonics(coldkey: str, hotkey: str) -> DevWallet:
    return DevWallet(Keypair.create_from_mnemonic(coldkey), Keypair.create_from_mnemonic(hotkey))


class Harness:
    def __init__(self, endpoint: str) -> None:
        self.client = bt.Subtensor(endpoint)
        self.sudo_wallet = DevWallet(
            Keypair.create_from_uri(SUDO_URI), Keypair.create_from_uri(f"{SUDO_URI}//preflight")
        )

    def close(self) -> None:
        with contextlib.suppress(Exception):  # closing a dead socket can fail; nothing to keep
            self.client.close()

    @property
    def block(self) -> int:
        return int(self.client.block)

    def wait_blocks(self, count: int, timeout_s: float = 120.0) -> int:
        """Poll until `count` more blocks are produced; returns the new head."""
        target = self.block + count
        deadline = time.monotonic() + timeout_s
        while (head := self.block) < target:
            if time.monotonic() > deadline:
                raise ChainError(f"chain stalled at block {head}, waiting for {target}")
            time.sleep(0.25)
        return head

    def _submit(self, what: str, send: Callable[[], Any]) -> Any:
        """Submit with retries for transient pool errors.

        Several signers share one localnet (the sudo key above all), so nonce races and
        brief pool bans are normal; anything else fails immediately.
        """
        for attempt in range(RETRIES):
            try:
                result = send()
            except bt.BittensorError as error:
                if not is_transient(str(error)) or attempt == RETRIES - 1:
                    raise ChainError(f"{what} failed: {error}") from error
            else:
                if result.success:
                    return result
                if not is_transient(str(result.message)) or attempt == RETRIES - 1:
                    raise ChainError(f"{what} failed: {result.message}")
            time.sleep(0.5 * (attempt + 1))
        raise ChainError(f"{what} failed")

    def attempt(self, send: Callable[[], Any]) -> bt.ExtrinsicResult:
        """Submit once and hand back the result, failed or not, for callers that expect a
        rejection and want to keep it (block, index, error) for the Tx debugger."""
        for attempt in range(RETRIES):
            try:
                result: bt.ExtrinsicResult = send()
            except bt.BittensorError as error:
                if not is_transient(str(error)) or attempt == RETRIES - 1:
                    return bt.ExtrinsicResult(success=False, message=str(error))
            else:
                if result.success or not is_transient(str(result.message)):
                    return result
            time.sleep(0.5 * (attempt + 1))
        return bt.ExtrinsicResult(success=False, message="gave up after transient pool errors")

    def sudo(self, call: Any, what: str) -> None:
        sudo_call = bt.calls.Sudo.sudo(call=self.client.compose(call))
        result = self._submit(what, lambda: self.client.submit_call(sudo_call, self.sudo_wallet))
        # Sudo wraps the inner dispatch: the outer extrinsic succeeds even when the inner
        # call fails, and the failure only shows up as a Sudid event carrying an Err.
        for event in result.events or []:
            text = str(event)
            if "Sudid" in text and "Err" in text:
                raise ChainError(f"{what} failed inside sudo: {text}")

    def mint(self, address: str, tao: float) -> None:
        """Set a free balance outright, so repeated runs never drain the sudo account."""
        rao = int(tao * RAO_PER_TAO)
        self.sudo(bt.calls.Balances.force_set_balance(who=address, new_free=rao), "mint balance")

    def fund(self, wallets: Sequence[DevWallet], tao: float = FUNDING_TAO) -> None:
        for wallet in wallets:
            self.mint(wallet.coldkey_ss58, tao)

    def create_subnet(self) -> int:
        admin = bt.calls.AdminUtils
        # Each run registers a fresh subnet; these global limits otherwise throttle repeat runs,
        # and the lock cost would double with every registration.
        self.sudo(admin.sudo_set_admin_freeze_window(window=0), "disable admin freeze window")
        self.sudo(admin.sudo_set_network_rate_limit(rate_limit=0), "disable network rate limit")
        self.sudo(admin.sudo_set_start_call_delay(delay=0), "disable start call delay")
        self.sudo(admin.sudo_set_lock_reduction_interval(interval=1), "lock reduction interval")
        self.sudo(
            admin.sudo_set_network_min_lock_cost(lock_cost=int(MIN_LOCK_TAO * RAO_PER_TAO)),
            "network lock cost",
        )
        self.mint(self.sudo_wallet.coldkey_ss58, SUDO_FLOAT_TAO)
        before = {info.netuid for info in self.client.subnets.all()}
        self._submit(
            "register subnet",
            lambda: self.client.execute(
                bt.RegisterSubnet(hotkey_ss58=self.sudo_wallet.hotkey_ss58), self.sudo_wallet
            ),
        )
        created = {info.netuid for info in self.client.subnets.all()} - before
        if not created:
            raise ChainError("subnet registered but no new netuid appeared")
        return max(created)

    def start_subnet(self, netuid: int) -> None:
        self._submit(
            "start call", lambda: self.client.execute(bt.StartCall(netuid), self.sudo_wallet)
        )

    def configure(self, netuid: int, *, tempo: int) -> None:
        admin = bt.calls.AdminUtils
        self.sudo(admin.sudo_set_tempo(netuid=netuid, tempo=tempo), "set tempo")
        self.sudo(
            admin.sudo_set_weights_set_rate_limit(netuid=netuid, weights_set_rate_limit=0),
            "disable weights rate limit",
        )
        self.sudo(
            admin.sudo_set_serving_rate_limit(netuid=netuid, serving_rate_limit=0), "serving limit"
        )
        self.sudo(
            admin.sudo_set_commit_reveal_weights_enabled(netuid=netuid, enabled=False),
            "commit reveal off",
        )
        # Collateral buys alpha through the pool at registration; burning keeps every
        # registration independent of pool depth and price.
        self.sudo(admin.sudo_set_collateral_lock_share(netuid=netuid, lock_share=0), "collateral")
        self.sudo(
            admin.sudo_set_max_registrations_per_block(
                netuid=netuid, max_registrations_per_block=64
            ),
            "regs per block",
        )
        self.sudo(
            admin.sudo_set_target_registrations_per_interval(
                netuid=netuid, target_registrations_per_interval=64
            ),
            "regs per interval",
        )

    def register(self, netuid: int, wallet: DevWallet) -> int:
        existing = self.uid_or_none(netuid, wallet.hotkey_ss58)
        if existing is not None:
            return existing
        self._submit(
            f"register {wallet.hotkey_ss58[:8]}",
            lambda: self.client.submit_call(
                bt.calls.SubtensorModule.burned_register(netuid=netuid, hotkey=wallet.hotkey_ss58),
                wallet,
            ),
        )
        return self.uid_of(netuid, wallet.hotkey_ss58)

    def stake(self, netuid: int, wallet: DevWallet, tao: float) -> None:
        self._submit(
            "add stake",
            lambda: self.client.execute(
                bt.AddStake(wallet.hotkey_ss58, netuid, tao, slippage_protection=False), wallet
            ),
        )

    def serve(self, netuid: int, wallet: DevWallet, ip: str, port: int) -> bt.ExtrinsicResult:
        result: bt.ExtrinsicResult = self._submit(
            "serve axon", lambda: self.client.execute(bt.ServeAxon(netuid, ip, port), wallet)
        )
        return result

    def try_serve(self, netuid: int, wallet: DevWallet, ip: str, port: int) -> bt.ExtrinsicResult:
        return self.attempt(lambda: self.client.execute(bt.ServeAxon(netuid, ip, port), wallet))

    def set_weights(self, netuid: int, wallet: DevWallet, weights: dict[int, float]) -> None:
        if not weights:
            return
        uids = sorted(weights)
        self._submit(
            "set weights",
            lambda: self.client.execute(
                bt.SetWeights(netuid, uids=uids, weights=[weights[u] for u in uids]), wallet
            ),
        )

    def uid_or_none(self, netuid: int, hotkey: str) -> int | None:
        value = self.client.query(bt.storage.SubtensorModule.Uids, [netuid, hotkey])
        return None if value is None else int(value)

    def uid_of(self, netuid: int, hotkey: str) -> int:
        uid = self.uid_or_none(netuid, hotkey)
        if uid is None:
            raise ChainError(f"hotkey {hotkey[:8]} is not registered on netuid {netuid}")
        return uid

    def neurons(self, netuid: int) -> list[Any]:
        return list(self.client.neurons.all(netuid))

    def weights(self, netuid: int) -> dict[int, dict[int, float]]:
        """Validator uid to its last weight row, normalized."""
        rows = self.client.weights.weights(netuid)
        return {int(v): {int(u): float(w) for u, w in row.items()} for v, row in rows.items()}
