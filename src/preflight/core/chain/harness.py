"""Writes to a localnet: keys, sudo, funding, subnet setup, registration, weights.

Adapted from Crucible's harness. Localnet quirks it absorbs (bittensor 11.3, devnet image):
- `BurnedRegister` forces the MEV shield, whose decrypted extrinsic never lands on
  localnet, so registration goes through the raw `burned_register` call in the clear.
- Admin hyperparameters need sudo, which `//Alice` holds on devnet. The SDK decodes the
  nested `Sudid` result, so an inner failure comes back as a failed result.
- The chain refuses `127.0.0.1` axons in transaction pool validation; see
  `localnet.LOOPBACK_AXON_IP`.
- Register every neuron before anyone stakes, keep `collateral_lock_share` at 0 and seed
  the pool with a 10,000 TAO lock, or registration fails with "reserves too low".
"""

from __future__ import annotations

import contextlib
import hashlib
import ipaddress
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
POLL_S = 0.25


class ChainError(RuntimeError):
    """An extrinsic failed for a reason other than a transient pool error, or the chain
    did not reach an expected state in time."""


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


@dataclass(frozen=True)
class Submission:
    """One signed extrinsic as it was sent, kept whether or not the chain took it."""

    result: bt.ExtrinsicResult
    extrinsic_hash: str
    call_data: str
    signer: str
    nonce: int
    head_block: int


def new_mnemonic() -> str:
    return Keypair.generate_mnemonic()


def wallet_from_mnemonics(coldkey: str, hotkey: str) -> DevWallet:
    return DevWallet(Keypair.create_from_mnemonic(coldkey), Keypair.create_from_mnemonic(hotkey))


def serve_axon_call(netuid: int, ip: str, port: int) -> Any:
    address = ipaddress.ip_address(ip)
    return bt.calls.SubtensorModule.serve_axon(
        netuid=netuid,
        version=1,
        ip=int(address),
        port=port,
        ip_type=address.version,
        protocol=4,
        placeholder1=0,
        placeholder2=0,
    )


def wait_until[T](
    read: Callable[[], T | None], what: str, timeout_s: float, interval_s: float = POLL_S
) -> T:
    """Poll `read` until it returns something other than None or False."""
    deadline = time.monotonic() + timeout_s
    while True:
        value = read()
        if value is not None and value is not False:
            return value
        if time.monotonic() > deadline:
            raise ChainError(f"timed out after {timeout_s:.0f}s waiting for {what}")
        time.sleep(interval_s)


class Harness:
    def __init__(self, endpoint: str, *, finalize: bool = False) -> None:
        self.client = bt.Subtensor(endpoint)
        # Inclusion is enough on a single-authority-set devnet and is several times faster
        # than waiting for GRANDPA; see docs/decisions/002-localnet.md.
        self.finalize = finalize
        self.sudo_wallet = DevWallet(
            Keypair.create_from_uri(SUDO_URI), Keypair.create_from_uri(f"{SUDO_URI}//preflight")
        )

    def close(self) -> None:
        # Closing a dead socket can fail; nothing is left to release either way.
        with contextlib.suppress(Exception):
            self.client.close()

    @property
    def block(self) -> int:
        return int(self.client.block)

    def wait_blocks(self, count: int, timeout_s: float = 120.0) -> int:
        """Poll until `count` more blocks are produced; returns the new head."""
        target = self.block + count
        return wait_until(
            lambda: head if (head := self.block) >= target else None,
            f"block {target}",
            timeout_s,
        )

    def _submit(self, what: str, send: Callable[[], bt.ExtrinsicResult]) -> bt.ExtrinsicResult:
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

    def call(self, what: str, call: Any, wallet: DevWallet, *, signer: str = "coldkey") -> bt.ExtrinsicResult:
        return self._submit(
            what,
            lambda: self.client.submit_call(
                call, wallet, signer=signer, wait_for_finalization=self.finalize
            ),
        )

    def execute(self, what: str, intent: Any, wallet: DevWallet) -> bt.ExtrinsicResult:
        return self._submit(
            what, lambda: self.client.execute(intent, wallet, wait_for_finalization=self.finalize)
        )

    def submit_signed(self, call: Any, signer: Signer) -> Submission:
        """Sign and submit through the prepare/sign/submit flow so the exact extrinsic hash
        is known even when the pool rejects it and it never reaches a block."""
        for attempt in range(RETRIES):
            head = self.block
            unsigned = self.client.prepare_call(call, address=signer.ss58_address)
            signature = bytes(signer.sign(bytes(unsigned.payload)))
            result: bt.ExtrinsicResult = self.client.submit_signature(
                unsigned, signature, wait_for_finalization=self.finalize
            )
            if result.success or not is_transient(result.message) or attempt == RETRIES - 1:
                return Submission(
                    result=result,
                    extrinsic_hash=signed_extrinsic_hash(
                        bytes(unsigned.public_key),
                        signature,
                        bytes(unsigned.included_in_extrinsic),
                        bytes(unsigned.call_data),
                    ),
                    call_data="0x" + bytes(unsigned.call_data).hex(),
                    signer=signer.ss58_address,
                    nonce=int(unsigned.nonce),
                    head_block=head,
                )
            time.sleep(0.5 * (attempt + 1))
        raise ChainError("submit failed")

    def sudo(self, call: Any, what: str) -> None:
        self.call(what, bt.calls.Sudo.sudo(call=self.client.compose(call)), self.sudo_wallet)

    def mint(self, address: str, tao: float) -> None:
        """Set a free balance outright, so repeated runs never drain the sudo account."""
        rao = int(tao * RAO_PER_TAO)
        self.sudo(bt.calls.Balances.force_set_balance(who=address, new_free=rao), "mint balance")

    def fund(self, wallets: Sequence[DevWallet], tao: float = FUNDING_TAO) -> None:
        for wallet in wallets:
            self.mint(wallet.coldkey_ss58, tao)

    def create_subnet(self) -> int:
        admin = bt.calls.AdminUtils
        # Every subnet here is throwaway; these global limits otherwise throttle repeat
        # creation, and the lock cost would double with every registration.
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
        self.execute(
            "register subnet",
            bt.RegisterSubnet(hotkey_ss58=self.sudo_wallet.hotkey_ss58),
            self.sudo_wallet,
        )
        created = wait_until(
            lambda: {info.netuid for info in self.client.subnets.all()} - before or None,
            "the new netuid to appear",
            30,
        )
        return max(created)

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

    def start_subnet(self, netuid: int) -> None:
        self.execute("start call", bt.StartCall(netuid), self.sudo_wallet)

    def register(self, netuid: int, wallet: DevWallet) -> int:
        existing = self.uid_or_none(netuid, wallet.hotkey_ss58)
        if existing is not None:
            return existing
        self.call(
            f"register {wallet.hotkey_ss58[:8]}",
            bt.calls.SubtensorModule.burned_register(netuid=netuid, hotkey=wallet.hotkey_ss58),
            wallet,
        )
        return wait_until(
            lambda: self.uid_or_none(netuid, wallet.hotkey_ss58),
            f"{wallet.hotkey_ss58[:8]} to get a UID on netuid {netuid}",
            30,
        )

    def stake(self, netuid: int, wallet: DevWallet, tao: float) -> None:
        self.execute(
            "add stake", bt.AddStake(wallet.hotkey_ss58, netuid, tao, slippage_protection=False), wallet
        )

    def serve(self, netuid: int, wallet: DevWallet, ip: str, port: int) -> bt.ExtrinsicResult:
        return self.execute("serve axon", bt.ServeAxon(netuid, ip, port), wallet)

    def set_weights(self, netuid: int, wallet: DevWallet, weights: dict[int, float]) -> bt.ExtrinsicResult:
        uids = sorted(weights)
        return self.execute(
            "set weights", bt.SetWeights(netuid, uids=uids, weights=[weights[u] for u in uids]), wallet
        )

    def uid_or_none(self, netuid: int, hotkey: str) -> int | None:
        value = self.client.query(bt.storage.SubtensorModule.Uids, [netuid, hotkey])
        return None if value is None else int(value)

    def metagraph(self, netuid: int) -> bt.Metagraph:
        graph = self.client.subnets.metagraph(netuid, commitments=False)
        if graph is None:
            raise ChainError(f"netuid {netuid} has no metagraph")
        return graph

    def hyperparameters(self, netuid: int) -> dict[str, Any]:
        return dict(self.client.subnets.subnet_hyperparameters(netuid) or {})

    def netuids(self) -> set[int]:
        return {int(info.netuid) for info in self.client.subnets.all()}


def signed_extrinsic_hash(public_key: bytes, signature: bytes, extra: bytes, call: bytes) -> str:
    """blake2b-256 of a v4 signed extrinsic: version byte, MultiAddress::Id signer,
    MultiSignature::Sr25519, signed extensions, call; the whole thing length-prefixed."""
    body = b"\x84" + b"\x00" + public_key + b"\x01" + signature + extra + call
    encoded = _compact(len(body)) + body
    return "0x" + hashlib.blake2b(encoded, digest_size=32).hexdigest()


def _compact(value: int) -> bytes:
    if value < 1 << 6:
        return bytes([value << 2])
    if value < 1 << 14:
        return ((value << 2) | 1).to_bytes(2, "little")
    if value < 1 << 30:
        return ((value << 2) | 2).to_bytes(4, "little")
    raw = value.to_bytes((value.bit_length() + 7) // 8, "little")
    return bytes([((len(raw) - 4) << 2) | 3]) + raw
