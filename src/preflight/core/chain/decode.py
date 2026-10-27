"""Readable extrinsics and events: units on amounts, names on errors."""

from __future__ import annotations

from typing import Any

from .. import errors_catalog as catalog
from ..models import DecodedArg, DispatchFailure, TxEvent

RAO = 1_000_000_000
TAO_ARGS = {"amount", "amount_staked", "value", "lock", "limit_price", "new_free", "tao"}
ALPHA_ARGS = {"amount_unstaked", "alpha_amount", "amount_alpha"}


def format_arg(name: str, type_name: str, value: Any) -> DecodedArg:
    raw = None if isinstance(value, dict | list) else str(value)
    if isinstance(value, int) and ("TaoBalance" in type_name or name in TAO_ARGS):
        return DecodedArg(name=name, value=f"{value / RAO:,.9f} TAO".rstrip("0").rstrip("."), raw=raw)
    if isinstance(value, int) and ("AlphaBalance" in type_name or name in ALPHA_ARGS):
        return DecodedArg(name=name, value=f"{value / RAO:,.9f} alpha".rstrip("0").rstrip("."), raw=raw)
    if name == "netuid":
        return DecodedArg(name=name, value=f"SN{value}", raw=raw)
    if isinstance(value, list) and len(value) > 12:
        return DecodedArg(name=name, value=f"{len(value)} items: {value[:8]}...", raw=None)
    if isinstance(value, str) and value.startswith("0x") and len(value) > 80:
        return DecodedArg(name=name, value=f"{value[:42]}... ({(len(value) - 2) // 2} bytes)", raw=None)
    return DecodedArg(name=name, value=str(value), raw=raw)


def call_args(call: dict[str, Any]) -> tuple[list[DecodedArg], dict[str, Any]]:
    decoded: list[DecodedArg] = []
    plain: dict[str, Any] = {}
    for arg in call.get("call_args") or []:
        name = str(arg.get("name"))
        value = arg.get("value")
        plain[name] = value
        decoded.append(format_arg(name, str(arg.get("type", "")), value))
    return decoded, plain


def dispatch_failure(error: Any) -> DispatchFailure:
    """A decoded `DispatchError` from an ExtrinsicFailed event."""
    if isinstance(error, dict) and "Module" in error:
        module = error["Module"] or {}
        pallet_index = int(module.get("index", -1))
        raw: Any = module.get("error")
        if isinstance(raw, str):
            error_index = int(raw.removeprefix("0x")[:2] or "0", 16)
        elif isinstance(raw, list | tuple):
            items: list[Any] = list(raw)  # pyright: ignore[reportUnknownArgumentType]  # decoded SCALE bytes
            error_index = int(items[0]) if items else 0
        else:
            error_index = int(raw or 0)
        resolved = catalog.module_error_name(pallet_index, error_index)
        pallet, name = resolved if resolved else (f"pallet {pallet_index}", f"error {error_index}")
    elif isinstance(error, dict) and error:
        pallet = "Runtime"
        key = next(iter(error))
        variant = error[key]
        name = next(iter(variant)) if isinstance(variant, dict) and variant else str(key)
    else:
        pallet, name = "Runtime", str(error)
    entry = catalog.lookup(name)
    return DispatchFailure(
        pallet=pallet,
        error=name,
        code=entry.code if entry else None,
        description=entry.description if entry else None,
        docs=entry.docs if entry else None,
    )


def _short(value: Any) -> str:
    text = str(value)
    if len(text) == 48 and text.startswith("5"):
        return f"{text[:6]}...{text[-4:]}"
    return text if len(text) <= 40 else text[:37] + "..."


def event_summary(module: str, name: str, attributes: Any) -> str:
    if name == "ExtrinsicFailed":
        failure = dispatch_failure((attributes or {}).get("dispatch_error"))
        return f"Failed with {failure.pallet}.{failure.error}"
    if name == "TransactionFeePaid" and isinstance(attributes, dict):
        return f"Fee paid {int(attributes.get('actual_fee') or 0) / RAO:.9f} TAO".rstrip("0").rstrip(".")
    if isinstance(attributes, dict):
        parts = [f"{k}={_short(v)}" for k, v in list(attributes.items())[:4] if k != "dispatch_info"]
        return ", ".join(parts)
    if isinstance(attributes, list | tuple):
        return ", ".join(_short(v) for v in list(attributes)[:4])
    return _short(attributes) if attributes is not None else ""


def events_for(records: list[dict[str, Any]], index: int) -> list[TxEvent]:
    out: list[TxEvent] = []
    for record in records:
        if record.get("extrinsic_idx") != index:
            continue
        module = str(record.get("module_id"))
        name = str(record.get("event_id"))
        out.append(
            TxEvent(
                index=len(out),
                pallet=module,
                name=name,
                summary=event_summary(module, name, record.get("attributes")),
            )
        )
    return out


def fee_from(records: list[dict[str, Any]], index: int) -> float | None:
    for record in records:
        if record.get("extrinsic_idx") == index and record.get("event_id") == "TransactionFeePaid":
            return int((record.get("attributes") or {}).get("actual_fee") or 0) / RAO
    return None


def failure_from(records: list[dict[str, Any]], index: int) -> DispatchFailure | None:
    for record in records:
        if record.get("extrinsic_idx") == index and record.get("event_id") == "ExtrinsicFailed":
            return dispatch_failure((record.get("attributes") or {}).get("dispatch_error"))
    return None
