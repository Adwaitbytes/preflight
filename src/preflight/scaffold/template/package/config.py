"""Settings from preflight.toml, overridable by environment variables."""

from __future__ import annotations

import os
import tomllib
from dataclasses import dataclass
from pathlib import Path

ENDPOINTS = {
    "local": "ws://127.0.0.1:9944",
    "test": "wss://test.finney.opentensor.ai:443",
    "finney": "wss://entrypoint-finney.opentensor.ai:443",
}


@dataclass(frozen=True)
class Config:
    network: str
    netuid: int
    miner_port: int

    @property
    def endpoint(self) -> str:
        return ENDPOINTS.get(self.network, self.network)

    @property
    def advertise_ip(self) -> str:
        # The chain refuses 127.0.0.1 as an axon address but accepts the IPv4 mapped form,
        # which local clients still resolve to loopback. On a real network, your public IP.
        return os.environ.get("AXON_IP", "::ffff:127.0.0.1" if self.network == "local" else "")


def load(path: Path = Path("preflight.toml")) -> Config:
    data = tomllib.loads(path.read_text()) if path.exists() else {}
    return Config(
        network=os.environ.get("NETWORK", str(data.get("network", "local"))),
        netuid=int(os.environ.get("NETUID", data.get("netuid", 2))),
        miner_port=int(os.environ.get("MINER_PORT", data.get("miner_port", 8091))),
    )
