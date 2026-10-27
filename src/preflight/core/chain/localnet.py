"""Lifecycle of the throwaway subtensor container behind `--network local`.

Adapted from Crucible's localnet module. A long lived localnet drifts, so `start`
always removes the old container first; anything recorded for a demo comes from a
fresh one.
"""

from __future__ import annotations

import shutil
import subprocess
import time
from dataclasses import dataclass

import httpx

CONTAINER = "preflight_localnet"
IMAGE = "ghcr.io/raofoundation/subtensor-localnet:devnet"
ENDPOINT = "ws://127.0.0.1:9944"
PORTS = (9944, 9945)

# The chain rejects plain loopback axons but accepts the IPv4-mapped form, which every
# local client still resolves to 127.0.0.1. Unlike a LAN address it survives host
# firewalls in stealth mode and machines with no network.
LOOPBACK_AXON_IP = "::ffff:127.0.0.1"


class LocalnetError(RuntimeError):
    """Docker is missing or the node did not come up."""


@dataclass(frozen=True)
class Localnet:
    image: str = IMAGE
    endpoint: str = ENDPOINT
    container: str = CONTAINER

    def start(self, timeout_s: float = 180.0) -> None:
        """Replace any existing container with a fresh chain and wait until it serves blocks."""
        self._require_docker()
        self.stop()
        ports = [arg for port in PORTS for arg in ("-p", f"{port}:{port}")]
        self._docker("run", "-d", "--name", self.container, *ports, self.image)
        self.wait_ready(timeout_s)

    def stop(self) -> None:
        if shutil.which("docker") is not None:
            self._docker("rm", "-f", self.container, check=False)

    def is_running(self) -> bool:
        if shutil.which("docker") is None:
            return False
        result = self._docker("ps", "-q", "--filter", f"name=^{self.container}$", check=False)
        return bool(result.stdout.strip())

    def head(self) -> int | None:
        """The best block number, or None when the node does not answer."""
        host, port = _host_port(self.endpoint)
        payload = {"jsonrpc": "2.0", "id": 1, "method": "chain_getHeader", "params": []}
        try:
            header = httpx.post(f"http://{host}:{port}", json=payload, timeout=2.0).json()
        except (httpx.HTTPError, ValueError):
            return None
        result = header.get("result") or {}
        try:
            return int(str(result.get("number", "0x0")), 16)
        except ValueError:
            return None

    def wait_ready(self, timeout_s: float = 180.0) -> None:
        """Wait until the node answers RPC with a real block, not just until the port opens.

        On a cold machine the port accepts connections well before the runtime can serve.
        """
        deadline = time.monotonic() + timeout_s
        while time.monotonic() < deadline:
            number = self.head()
            if number is not None and number >= 1:
                return
            time.sleep(0.5)
        raise LocalnetError(f"localnet at {self.endpoint} did not come up within {timeout_s:.0f}s")

    def _require_docker(self) -> None:
        if shutil.which("docker") is None:
            raise LocalnetError("docker is not installed; the local dev kit runs subtensor in a container")
        if self._docker("info", check=False).returncode != 0:
            raise LocalnetError("the docker daemon is not running; start Docker Desktop and retry")

    @staticmethod
    def _docker(*args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
        result = subprocess.run(["docker", *args], capture_output=True, text=True, check=False)
        if check and result.returncode != 0:
            raise LocalnetError(f"docker {' '.join(args)} failed: {result.stderr.strip()}")
        return result


def _host_port(endpoint: str) -> tuple[str, int]:
    without_scheme = endpoint.split("://", 1)[-1]
    host, _, port = without_scheme.partition(":")
    return host, int(port.rstrip("/") or 9944)
