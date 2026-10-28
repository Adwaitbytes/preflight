"""The vendored official error catalog, and a parser that pulls error names out of pasted text.

`catalog/errors.json` is bittensor.com's machine-readable catalog (406 chain errors with
descriptions, semantic codes and subtensor source lines), refreshed by
`scripts/fetch_catalogs.py`. Pool rejections that never reach dispatch (custom validity
codes, InvalidTransaction variants) are resolved through the SDK's own tables.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from functools import cache
from pathlib import Path
from typing import Any

from bittensor import result as sdk_result
from bittensor._generated.errors import ERRORS as MODULE_ERRORS

SITE = "https://www.bittensor.com"
# The SDK keeps its pool rejection tables private; they are the only source of subtensor's
# custom validity codes and the InvalidTransaction display strings, so read them once here.
_CUSTOM_CODES: dict[int, str] = vars(sdk_result)["_CUSTOM_TRANSACTION_ERRORS"]
_POOL_PHRASES: tuple[tuple[str, str], ...] = tuple(vars(sdk_result)["_INVALID_TRANSACTION_ERRORS"])
# Runtime level DispatchError variants (BadOrigin, Token, Arithmetic...) with their semantic code.
_DISPATCH: dict[str, tuple[Any, str]] = vars(sdk_result)["_DISPATCH_ERRORS"]


def dispatch_error(name: str) -> tuple[str, str] | None:
    """(semantic code, description) for a runtime DispatchError variant, or None."""
    found = _DISPATCH.get(name)
    if found is None:
        return None
    code, description = found
    return str(getattr(code, "value", code)), description


@dataclass(frozen=True)
class CatalogError:
    name: str
    code: str | None
    description: str
    pallets: tuple[str, ...]
    docs: str | None
    source: str | None


def _catalog_dir() -> Path:
    packaged = Path(__file__).resolve().parent.parent / "catalog"
    if packaged.is_dir():
        return packaged
    return Path(__file__).resolve().parents[3] / "catalog"


@cache
def _load() -> tuple[dict[str, CatalogError], dict[str, dict[str, Any]], str]:
    wrapped = json.loads((_catalog_dir() / "errors.json").read_text())
    data = wrapped["data"]
    errors: dict[str, CatalogError] = {}
    for name, entry in data["chain_errors"].items():
        sources = entry.get("sources") or []
        errors[name] = CatalogError(
            name=name,
            code=entry.get("code"),
            description=entry.get("description", ""),
            pallets=tuple(entry.get("pallets") or ()),
            docs=SITE + entry["docs_url"] if entry.get("docs_url") else None,
            source=SITE + sources[0]["url"] if sources else None,
        )
    return errors, data["codes"], str(wrapped.get("fetched_at", ""))


def chain_errors() -> dict[str, CatalogError]:
    return _load()[0]


def semantic_codes() -> dict[str, dict[str, Any]]:
    return _load()[1]


def fetched_at() -> str:
    return _load()[2]


def lookup(name: str) -> CatalogError | None:
    return chain_errors().get(name)


def remediation(code: str | None) -> str | None:
    if not code:
        return None
    entry = semantic_codes().get(code)
    return str(entry["remediation"]) if entry and entry.get("remediation") else None


def module_error_name(pallet_index: int, error_index: int) -> tuple[str, str] | None:
    info = MODULE_ERRORS.get((pallet_index, error_index))
    return (info.pallet, info.name) if info else None


def custom_validity_name(code: int) -> str | None:
    return _CUSTOM_CODES.get(code)


INVALID_TRANSACTION = {
    1: "Payment",
    2: "Future",
    3: "Stale",
    4: "BadProof",
    5: "AncientBirthBlock",
    6: "ExhaustsResources",
    8: "BadMandatory",
    9: "MandatoryValidation",
    10: "BadSigner",
}

_CAMEL = re.compile(r"\b([A-Z][a-z0-9]+(?:[A-Z][a-z0-9]*)+)\b")
_QUALIFIED = re.compile(r"\b([A-Z][A-Za-z]+)\.([A-Z][A-Za-z0-9]+)\b")
_MODULE = re.compile(r"index['\"]?\s*[:=]\s*(\d+).{0,40}?error['\"]?\s*[:=]\s*['\"]?(?:0x)?([0-9a-fA-F]{2})", re.S)
_CUSTOM = re.compile(r"Custom(?:\s*error)?\W{0,4}(\d+)", re.I)
_EXTRA_NAMES = {"MevShield", "ReservesTooLow", "InsufficientLiquidity", "Payment"}


def parse_error_names(text: str) -> list[str]:
    """Error names found in pasted btcli output, SDK exceptions or tracebacks, best first."""
    found: list[str] = []

    def add(name: str) -> None:
        if name not in found:
            found.append(name)

    errors = chain_errors()
    for _pallet, name in _QUALIFIED.findall(text):
        if name in errors:
            add(name)
    for pallet_index, error_hex in _MODULE.findall(text):
        resolved = module_error_name(int(pallet_index), int(error_hex, 16))
        if resolved:
            add(resolved[1])
    for code in _CUSTOM.findall(text):
        if (name := custom_validity_name(int(code))) is not None:
            add(name)
    lowered = text.lower()
    for needle, name in _POOL_PHRASES:
        if needle in lowered:
            add(name)
    for name in _CAMEL.findall(text):
        if name in errors or name in _EXTRA_NAMES:
            add(name)
    return found
