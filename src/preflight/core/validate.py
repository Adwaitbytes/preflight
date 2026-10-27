"""Boundary validation shared by the CLI, HTTP API and MCP server. Reject early, say why."""

from __future__ import annotations

import re

from bittensor.sp_core import ss58_decode

MAX_NETUID = 1024
SS58_SHAPE = re.compile(r"^[1-9A-HJ-NP-Za-km-z]{46,48}$")


class InvalidInput(ValueError):
    pass


def ss58(value: str, what: str = "hotkey") -> str:
    text = value.strip()
    if not SS58_SHAPE.match(text):
        raise InvalidInput(f"{what} must be an ss58 address like 5F...; got {text[:60]!r}")
    try:
        ss58_decode(text)
    except Exception as error:  # the decoder raises ValueError subclasses with useful text
        raise InvalidInput(f"{what} {text} is not a valid ss58 address: {error}") from error
    return text


def is_ss58(value: str) -> bool:
    try:
        ss58(value)
    except InvalidInput:
        return False
    return True


def netuid(value: int | str | None) -> int | None:
    if value is None or value == "":
        return None
    try:
        number = int(value)
    except (TypeError, ValueError) as error:
        raise InvalidInput(f"netuid must be a whole number; got {value!r}") from error
    if not 0 <= number <= MAX_NETUID:
        raise InvalidInput(f"netuid must be between 0 and {MAX_NETUID}; got {number}")
    return number
