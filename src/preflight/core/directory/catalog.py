"""The curated subnet catalog (`catalog/subnets.yaml`) and capability search over it.

Every entry cites the project's own site, docs or README in `sources`; entries without a
public API say `api: none`. Search is deterministic token matching, no ranking model:
capability words (and their common synonyms) match an entry's capabilities, other tokens
match its name, operator and summary.
"""

from __future__ import annotations

import re
from functools import cache
from pathlib import Path
from typing import Any

import yaml
from pydantic import ValidationError

from ..models import SubnetCatalogEntry

CAPABILITIES = (
    "inference",
    "data",
    "3d",
    "video",
    "voice",
    "agents",
    "compute",
    "prediction",
    "training",
    "storage",
    "security",
    "finance",
    "science",
    "other",
)

# Words people type for a capability, mapped onto the catalog's capability tags.
SYNONYMS: dict[str, str] = {
    "llm": "inference",
    "llms": "inference",
    "model": "inference",
    "models": "inference",
    "serving": "inference",
    "chat": "inference",
    "dataset": "data",
    "datasets": "data",
    "scraping": "data",
    "scrape": "data",
    "mesh": "3d",
    "meshes": "3d",
    "gaussian": "3d",
    "speech": "voice",
    "audio": "voice",
    "tts": "voice",
    "stt": "voice",
    "agent": "agents",
    "agentic": "agents",
    "gpu": "compute",
    "gpus": "compute",
    "cpu": "compute",
    "vm": "compute",
    "vms": "compute",
    "forecast": "prediction",
    "forecasting": "prediction",
    "predictions": "prediction",
    "pretraining": "training",
    "finetuning": "training",
    "fine-tuning": "training",
    "train": "training",
    "trading": "finance",
    "markets": "finance",
    "tee": "security",
    "confidential": "security",
    "red-teaming": "security",
    "biology": "science",
    "chemistry": "science",
    "drug": "science",
    "videos": "video",
}

CAPABILITY_HIT = 5.0
NAME_HIT = 4.0
OPERATOR_HIT = 3.0
SUMMARY_HIT = 1.0
TOKEN = re.compile(r"[a-z0-9][a-z0-9\-.]*")


class CatalogError(ValueError):
    """`catalog/subnets.yaml` is missing or an entry does not fit SubnetCatalogEntry."""


def _catalog_dir() -> Path:
    packaged = Path(__file__).resolve().parent.parent.parent / "catalog"
    if packaged.is_dir():
        return packaged
    return Path(__file__).resolve().parents[4] / "catalog"


def tokens(text: str) -> list[str]:
    return [t.strip(".-") for t in TOKEN.findall(text.lower()) if t.strip(".-")]


@cache
def load() -> tuple[SubnetCatalogEntry, ...]:
    path = _catalog_dir() / "subnets.yaml"
    try:
        raw: Any = yaml.safe_load(path.read_text())
    except (OSError, yaml.YAMLError) as error:
        raise CatalogError(f"cannot read {path}: {error}") from error
    if not isinstance(raw, list):
        raise CatalogError(f"{path} must be a list of subnet entries")
    entries: list[SubnetCatalogEntry] = []
    for index, item in enumerate(raw):  # pyright: ignore[reportUnknownVariableType]
        try:
            entries.append(SubnetCatalogEntry.model_validate(item))
        except ValidationError as error:
            raise CatalogError(f"{path} entry {index}: {error}") from error
    netuids = [e.netuid for e in entries]
    if len(netuids) != len(set(netuids)):
        raise CatalogError(f"{path} lists a netuid twice")
    return tuple(sorted(entries, key=lambda e: e.netuid))


def by_netuid() -> dict[int, SubnetCatalogEntry]:
    return {entry.netuid: entry for entry in load()}


def capability_of(token: str) -> str | None:
    if token in CAPABILITIES:
        return token
    return SYNONYMS.get(token)


def _score(entry: SubnetCatalogEntry, query: list[str]) -> float:
    name = set(tokens(entry.name))
    operator = set(tokens(entry.operator or ""))
    summary = set(tokens(entry.summary))
    capabilities = {c.lower() for c in entry.capabilities}
    total = 0.0
    for token in query:
        capability = capability_of(token)
        if capability is not None and capability in capabilities:
            total += CAPABILITY_HIT
        if token in name or token == entry.name.lower():
            total += NAME_HIT
        if token in operator:
            total += OPERATOR_HIT
        if token in summary:
            total += SUMMARY_HIT
        if token.isdigit() and int(token) == entry.netuid:
            total += NAME_HIT
    return total


def search(q: str, limit: int | None = None) -> list[SubnetCatalogEntry]:
    """Entries matching any token of `q`, best first; ties keep netuid order.

    "sn64" and "64" both find netuid 64. An empty query returns the whole catalog.
    """
    query = [re.sub(r"^sn(\d+)$", r"\1", t) for t in tokens(q)]
    entries = load()
    if not query:
        return list(entries)[:limit]
    scored = [(score, entry) for entry in entries if (score := _score(entry, query)) > 0]
    scored.sort(key=lambda pair: (-pair[0], pair[1].netuid))
    return [entry for _, entry in scored][:limit]
