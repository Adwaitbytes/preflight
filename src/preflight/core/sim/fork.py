"""Rung 1b: execute an extrinsic with the real runtime on a Chopsticks fork of live state.

See docs/decisions/001-simulator.md. The fork serves `state_call` of
`BlockBuilder_apply_extrinsic`, which runs one extrinsic on top of the forked state and
discards the result, so nothing is ever broadcast. `--mock-signature-host` accepts any
signature that starts 0xdeadbeef, so we can build the extrinsic for any address from its
public key alone. Balance overrides go through `dev_setStorage` and are restored after.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import threading
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import httpx
from bittensor.sp_core import Keypair

from ..chain.network import Network, client_for

CHOPSTICKS = "@acala-network/chopsticks@1.5.2"
MOCK_SIGNATURE = b"\xde\xad\xbe\xef" + b"\xcd" * 60
STATE_DIR = Path(os.environ.get("PREFLIGHT_HOME", ".preflight")) / "chopsticks"
DEFAULT_PORTS = {"finney": 8011, "test": 8012, "local": 8013}
# The public entrypoint load-sheds the 1000-key `state_getKeysPaged` pages Chopsticks
# requests ("upstream_pool ... load_shed"); the archive pool serves them.
FORK_UPSTREAM = {"finney": "wss://archive.chain.opentensor.ai:443"}


class ForkUnavailable(RuntimeError):
    pass


@dataclass(frozen=True)
class ApplyOutcome:
    ok: bool
    error: str | None
    pallet: str | None
    raw: str


# DispatchError and TransactionValidityError variant tables, sp_runtime.
DISPATCH = [
    "Other", "CannotLookup", "BadOrigin", "Module", "ConsumerRemaining", "NoProviders",
    "TooManyConsumers", "Token", "Arithmetic", "Transactional", "Exhausted", "Corruption",
    "Unavailable", "RootNotAllowed", "Trie",
]  # fmt: skip
TOKEN = ["FundsUnavailable", "OnlyProvider", "BelowMinimum", "CannotCreate", "UnknownAsset", "Frozen", "Unsupported", "CannotCreateHold", "NotExpendable", "Blocked"]
ARITHMETIC = ["Underflow", "Overflow", "DivisionByZero"]
INVALID = ["Call", "Payment", "Future", "Stale", "BadProof", "AncientBirthBlock", "ExhaustsResources", "Custom", "BadMandatory", "MandatoryValidation", "BadSigner", "IndeterminateImplicit", "UnknownOrigin"]
UNKNOWN = ["CannotLookup", "NoUnsignedValidator", "Custom"]


def decode_apply_result(hex_result: str) -> ApplyOutcome:
    """SCALE `ApplyExtrinsicResult` = Result<Result<(), DispatchError>, TransactionValidityError>."""
    from .. import errors_catalog as catalog

    data = bytes.fromhex(hex_result.removeprefix("0x"))
    if not data:
        return ApplyOutcome(False, "EmptyResult", None, hex_result)
    if data[0] == 0:
        if len(data) > 1 and data[1] == 0:
            return ApplyOutcome(True, None, None, hex_result)
        variant = data[2] if len(data) > 2 else 0
        name = DISPATCH[variant] if variant < len(DISPATCH) else f"DispatchError{variant}"
        if name == "Module" and len(data) >= 5:
            resolved = catalog.module_error_name(data[3], data[4])
            pallet, error = resolved if resolved else (f"pallet {data[3]}", f"error {data[4]}")
            return ApplyOutcome(False, error, pallet, hex_result)
        if name == "Token" and len(data) > 3:
            return ApplyOutcome(False, TOKEN[data[3]] if data[3] < len(TOKEN) else name, "Token", hex_result)
        if name == "Arithmetic" and len(data) > 3:
            return ApplyOutcome(False, ARITHMETIC[data[3]] if data[3] < len(ARITHMETIC) else name, "Arithmetic", hex_result)
        return ApplyOutcome(False, name, "Runtime", hex_result)
    kind = data[1] if len(data) > 1 else 0
    variant = data[2] if len(data) > 2 else 0
    table = INVALID if kind == 0 else UNKNOWN
    name = table[variant] if variant < len(table) else f"Invalid{variant}"
    if name == "Custom" and len(data) > 3:
        custom = catalog.custom_validity_name(data[3])
        return ApplyOutcome(False, custom or f"Custom({data[3]})", "SubtensorModule", hex_result)
    return ApplyOutcome(False, name, "TransactionValidity", hex_result)


class Fork:
    """A Chopsticks fork reachable over HTTP JSON-RPC."""

    def __init__(self, network: Network, url: str) -> None:
        self.network = network
        self.url = url
        self._lock = threading.Lock()
        self._http = httpx.Client(timeout=300.0)

    def rpc(self, method: str, params: list[Any]) -> Any:
        response = self._http.post(self.url, json={"jsonrpc": "2.0", "id": 1, "method": method, "params": params})
        body = response.json()
        if "error" in body:
            raise ForkUnavailable(f"{method}: {body['error'].get('message', body['error'])}")
        return body["result"]

    def alive(self) -> bool:
        try:
            return self.head() > 0
        except (httpx.HTTPError, ForkUnavailable, ValueError):
            return False

    def head(self) -> int:
        header = self.rpc("chain_getHeader", [])
        return int(str(header["number"]), 16) if isinstance(header["number"], str) else int(header["number"])

    def nonce(self, address: str) -> int:
        return int(self.rpc("system_accountNextIndex", [address]))

    def account(self, address: str) -> dict[str, Any]:
        client = client_for(self.network)
        value = client.query(("System", "Account"), [address], block=self.head())
        return value if isinstance(value, dict) else {}

    def set_free(self, address: str, free_rao: int, original: dict[str, Any]) -> None:
        data = dict(original.get("data") or {})
        data["free"] = free_rao
        entry = {**original, "providers": max(int(original.get("providers") or 0), 1), "data": data}
        self.rpc("dev_setStorage", [{"System": {"Account": [[[address], entry]]}}])

    def restore(self, address: str, original: dict[str, Any]) -> None:
        entry: Any = original if original else None
        self.rpc("dev_setStorage", [{"System": {"Account": [[[address], entry]]}}])

    def build(self, call: Any, signer: str) -> str:
        """The signed extrinsic hex for `call` from `signer`, with a mock signature."""
        client = client_for(self.network)
        _ = client.block  # opens the connection the raw interface needs
        inner = client._client  # pyright: ignore[reportPrivateUsage]  # the SDK exposes no public way to sign with a caller-supplied signature
        substrate = inner._substrate  # pyright: ignore[reportPrivateUsage]
        nonce = self.nonce(signer)

        async def make() -> str:
            # Generated calls are (module, function, params) tuples; a planned call is
            # already composed CallBytes and goes in as is.
            composed = await substrate.compose(call) if isinstance(call, tuple) else call
            signed = await substrate.raw.sign_without_nonce_tracking(
                composed, Keypair(ss58_address=signer), nonce=nonce, era="00", signature=MOCK_SIGNATURE
            )
            return str(signed.data_hex)

        return str(client._call(make()))  # pyright: ignore[reportPrivateUsage]

    def apply(self, call: Any, signer: str, *, coldkey: str | None, free_tao: float | None) -> tuple[ApplyOutcome, int]:
        """Run the call on the fork; returns the outcome and the fork's block."""
        with self._lock:
            original: dict[str, Any] | None = None
            if free_tao is not None and coldkey:
                original = self.account(coldkey)
                self.set_free(coldkey, int(free_tao * 1_000_000_000), original)
            try:
                extrinsic = self.build(call, signer)
                result = self.rpc("state_call", ["BlockBuilder_apply_extrinsic", extrinsic])
                return decode_apply_result(str(result)), self.head()
            finally:
                if original is not None and coldkey:
                    self.restore(coldkey, original)


_forks: dict[str, Fork] = {}
_processes: dict[str, subprocess.Popen[bytes]] = {}


def fork_url(network: Network) -> str:
    env = os.environ.get(f"PREFLIGHT_FORK_{network.name.upper()}")
    if env:
        return env
    return f"http://127.0.0.1:{DEFAULT_PORTS.get(network.name, 8014)}"


def get_fork(network: Network) -> Fork | None:
    """A live fork for this network, or None. Never starts one implicitly."""
    fork = _forks.get(network.name) or Fork(network, fork_url(network))
    if fork.alive():
        _forks[network.name] = fork
        return fork
    return None


def start_fork(network: Network, *, wait_s: float = 180.0) -> Fork:
    """Start Chopsticks for this network in the background and wait until it serves."""
    if (existing := get_fork(network)) is not None:
        return existing
    if shutil.which("npx") is None:
        raise ForkUnavailable("npx is not installed; the simulator falls back to predictions")
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    port = DEFAULT_PORTS.get(network.name, 8014)
    log = (STATE_DIR / f"{network.name}.log").open("ab")
    process = subprocess.Popen(
        [
            "npx", "-y", CHOPSTICKS,
            "--endpoint", FORK_UPSTREAM.get(network.name, network.endpoint),
            "--port", str(port),
            "--allow-unresolved-imports", "true",
            "--mock-signature-host", "true",
            "--build-block-mode", "Manual",
            "--db", str(STATE_DIR / f"{network.name}.sqlite"),
        ],
        stdout=log,
        stderr=subprocess.STDOUT,
        start_new_session=True,
    )  # fmt: skip
    _processes[network.name] = process
    fork = Fork(network, f"http://127.0.0.1:{port}")
    deadline = time.monotonic() + wait_s
    while time.monotonic() < deadline:
        if process.poll() is not None:
            raise ForkUnavailable(f"chopsticks exited with code {process.returncode}; see {STATE_DIR / f'{network.name}.log'}")
        if fork.alive():
            _forks[network.name] = fork
            return fork
        time.sleep(1.0)
    raise ForkUnavailable(f"chopsticks did not start within {wait_s:.0f} s")


def stop_forks() -> None:
    for process in _processes.values():
        process.terminate()
    _processes.clear()
    _forks.clear()
