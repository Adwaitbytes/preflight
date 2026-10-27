"""PF107's TCP probe. Runs only when the user asks, and only against the axon they own.

BUILD.md section 14: never probe any address except the axon the user asked about.
The caller passes the advertised AxonInfo straight from chain; nothing else is accepted.
"""

from __future__ import annotations

import errno
import socket
import time

from ..chain.snapshot import ProbeResult
from ..models import AxonInfo

TIMEOUT_S = 3.0


def probe_axon(axon: AxonInfo) -> ProbeResult:
    started = time.monotonic()
    error: str | None = None
    try:
        with socket.create_connection((axon.ip, axon.port), timeout=TIMEOUT_S):
            pass
    except TimeoutError:
        error = f"timed out after {TIMEOUT_S:.0f} s (likely a firewall or missing port forward)"
    except ConnectionRefusedError:
        error = "connection refused (nothing is listening on that port)"
    except OSError as failure:
        if failure.errno in (errno.EHOSTUNREACH, errno.ENETUNREACH):
            error = "no route to host"
        else:
            error = failure.strerror or str(failure)
    return ProbeResult(
        address=axon.address,
        ok=error is None,
        error=error,
        elapsed_ms=int((time.monotonic() - started) * 1000),
    )
