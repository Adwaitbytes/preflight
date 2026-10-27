"""The Preflight HTTP API as a Vercel Python function.

`scripts/vendor-api.mjs` copies the `preflight` package and its catalogs into `_vendor/`
during install, so the function runs the engine from the same commit as the site.

Behind the rewrite `/v1/:path* -> /api/index?__path=:path*` the function sees
`/api/index` as its path (measured, docs/decisions/003-hosting.md), so this shim puts the
original `/v1/...` path back and drops the routing parameters before FastAPI routes it.
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any
from urllib.parse import parse_qsl, urlencode

sys.path.insert(0, str(Path(__file__).resolve().parent / "_vendor"))

from preflight.api import app as preflight_app  # noqa: E402

ROUTING_PARAMS = {"__path", "path"}


async def app(scope: dict[str, Any], receive: Any, send: Any) -> None:
    if scope["type"] == "http":
        pairs = parse_qsl(scope.get("query_string", b"").decode(), keep_blank_values=True)
        rest = next((value for key, value in pairs if key == "__path"), None)
        if rest is not None:
            path = "/v1/" + rest.lstrip("/")
            query = urlencode([(k, v) for k, v in pairs if k not in ROUTING_PARAMS])
            scope = {**scope, "path": path, "raw_path": path.encode(), "query_string": query.encode()}
    await preflight_app(scope, receive, send)
