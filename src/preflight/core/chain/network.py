"""Networks, pooled clients and block-pinned views.

Every diagnosis reads one consistent block: callers take a `Pinned` view, which
carries the block number, hash and runtime spec into the result as a `ChainRef`.
"""

from __future__ import annotations

import threading
import time
from collections.abc import Callable
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from typing import Any

import bittensor as bt

from ..models import ChainRef, NetworkName


ENDPOINTS: dict[str, str] = {
    "finney": "wss://entrypoint-finney.opentensor.ai:443",
    "test": "wss://test.finney.opentensor.ai:443",
    "local": "ws://127.0.0.1:9944",
}
ALIASES = {"main": "finney", "mainnet": "finney", "testnet": "test", "localnet": "local"}
# Pool and RPC errors worth one more try; anything else is a real answer.
TRANSIENT = (
    "nonce",
    "banned",
    "priority",
    "outdated",
    "stale",
    "future",
    "temporarily",
    "timeout",
    "timed out",
    "connection",
    "closed",
)
READ_RETRIES = 3


class ChainUnreachable(RuntimeError):
    """The endpoint did not answer. Surfaces as exit code 3 and HTTP 503."""


@dataclass(frozen=True)
class Network:
    name: NetworkName
    endpoint: str

    @classmethod
    def resolve(cls, value: str | None) -> Network:
        """`local`, `test`, `finney` (and aliases) or a raw ws:// or wss:// endpoint."""
        raw = (value or "finney").strip()
        key = ALIASES.get(raw.lower(), raw.lower())
        if key in ENDPOINTS:
            name: NetworkName = "finney" if key == "finney" else "test" if key == "test" else "local"
            return cls(name, ENDPOINTS[key])
        if raw.startswith(("ws://", "wss://")):
            return cls("custom", raw)
        raise ValueError(
            f"unknown network {raw!r}: use local, test, finney or a ws:// or wss:// endpoint"
        )

    def explorer_account(self, ss58: str) -> str | None:
        base = _explorer_base(self.name)
        return f"{base}/account/{ss58}" if base else None

    def explorer_extrinsic(self, block: int, index: int) -> str | None:
        base = _explorer_base(self.name)
        return f"{base}/extrinsic/{block}-{index:04d}" if base else None

    def explorer_subnet(self, netuid: int) -> str | None:
        base = _explorer_base(self.name)
        return f"{base}/subnets/{netuid}/chart" if base else None


def _explorer_base(name: str) -> str | None:
    # Mainnet URL shapes verified 2026-10-28 (account, extrinsic block-index, subnet chart).
    # testnet.taostats.io, the one testnet explorer we found cited, does not resolve.
    return {"finney": "https://taostats.io"}.get(name)


def is_transient(message: str) -> bool:
    lowered = message.lower()
    return any(marker in lowered for marker in TRANSIENT)


_pool: dict[str, bt.Subtensor] = {}
_pool_lock = threading.Lock()


def client_for(network: Network) -> bt.Subtensor:
    """One long-lived client per endpoint; reconnects are the SDK's job."""
    with _pool_lock:
        client = _pool.get(network.endpoint)
        if client is None:
            try:
                client = bt.Subtensor(network.endpoint)
            except Exception as error:  # the SDK raises several connection types
                raise ChainUnreachable(f"{network.endpoint} is unreachable: {error}") from error
            _pool[network.endpoint] = client
        return client


def drop_client(network: Network) -> None:
    with _pool_lock:
        client = _pool.pop(network.endpoint, None)
    if client is not None:
        try:
            client.close()
        except Exception:  # closing a dead socket can fail; the client is gone either way
            pass


def with_retries[R](network: Network, read: Callable[[], R]) -> R:
    """Run a read, retrying transient RPC failures with a fresh client."""
    last: Exception | None = None
    for attempt in range(READ_RETRIES):
        try:
            return read()
        except (bt.ConnectionNotReady, bt.RpcConnectionError, ConnectionError, TimeoutError) as error:
            last = error
            drop_client(network)
        except bt.BittensorError as error:
            if not is_transient(str(error)):
                raise
            last = error
        time.sleep(0.4 * (attempt + 1))
    raise ChainUnreachable(f"{network.endpoint} did not answer: {last}") from last


@dataclass(frozen=True)
class Pinned:
    """A read-only view of one network at one block."""

    network: Network
    block: int
    block_hash: str
    runtime_spec: int | None
    view: Any  # bittensor SyncSnapshot pinned to `block`
    client: bt.Subtensor

    @property
    def ref(self) -> ChainRef:
        return ChainRef(
            network=self.network.name,
            endpoint=self.network.endpoint,
            block=self.block,
            block_hash=self.block_hash,
            runtime_spec=self.runtime_spec,
        )

    def query(self, item: Any, params: list[Any] | None = None) -> Any:
        return self.client.query(item, params, block=self.block)

    def query_map(self, item: Any, params: list[Any] | None = None) -> Any:
        return self.client.query_map(item, params, block=self.block)

    def runtime(self, method: tuple[str, str], params: list[Any]) -> Any:
        return self.client.runtime(method, params, block=self.block)


def pin(network: Network, block: int | None = None) -> Pinned:
    def read() -> Pinned:
        client = client_for(network)
        number = int(block if block is not None else client.block)
        info = client.block_info(number)
        block_hash = str(getattr(info, "hash", "") or "")
        try:
            spec: int | None = int(client.spec_version)
        except Exception:  # informational only
            spec = None
        return Pinned(network, number, block_hash, spec, client.at(number), client)

    return with_retries(network, read)


_executor = ThreadPoolExecutor(max_workers=16, thread_name_prefix="preflight-read")


def gather(reads: dict[str, Callable[[], Any]]) -> dict[str, Any]:
    """Run independent reads concurrently. The SDK's sync client hands each call to one
    event loop, so these multiplex over a single websocket instead of queueing."""
    futures = {key: _executor.submit(read) for key, read in reads.items()}
    return {key: future.result() for key, future in futures.items()}
