"""Vendor pinned copies of the official Bittensor catalogs into catalog/.

Run with `uv run python scripts/fetch_catalogs.py`. Each file is wrapped as
{"fetched_at": ..., "source": ..., "data": ...} so a stale copy is visible in review.
"""

from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path

import httpx

BASE = "https://www.bittensor.com/catalog"
NAMES = ("errors", "reads", "intents")
OUT = Path(__file__).resolve().parent.parent / "catalog"


def main() -> None:
    OUT.mkdir(exist_ok=True)
    fetched_at = datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")
    with httpx.Client(follow_redirects=True, timeout=30.0) as client:
        for name in NAMES:
            url = f"{BASE}/{name}.json"
            response = client.get(url)
            response.raise_for_status()
            wrapped = {"fetched_at": fetched_at, "source": url, "data": response.json()}
            path = OUT / f"{name}.json"
            path.write_text(json.dumps(wrapped, indent=1, sort_keys=True) + "\n")
            print(f"{name}: {len(response.content):,} bytes -> {path.relative_to(OUT.parent)}")


if __name__ == "__main__":
    main()
