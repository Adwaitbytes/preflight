"""Turn an error name into an explanation that uses this attempt's own numbers.

The official catalog description is the base. When the debugger knows the attempt's
values (amount, balance, burn, last update...) a template rewrites it with them and
fills the fix command; without context the catalog text and remediation stand alone.
"""

from __future__ import annotations

import math
from collections.abc import Callable

from .. import errors_catalog as catalog
from ..models import ErrorExplanation, Fix
from .context import ExplainContext
from .traps import find_trap

Template = Callable[[ExplainContext], tuple[str, Fix | None] | None]


def _tao(value: float) -> str:
    return f"{value:,.4f} TAO"


def _not_enough_balance(c: ExplainContext) -> tuple[str, Fix | None] | None:
    if c.balance_tao is None:
        return None
    needed = c.amount_tao if c.amount_tao is not None else c.burn_tao
    if needed is None:
        return None
    what = "stake" if c.call and "stake" in c.call else "register"
    text = f"You tried to {what} with {_tao(needed)} needed, but the coldkey held {_tao(c.balance_tao)} free."
    if c.burn_now_tao is not None and c.call and "register" in c.call:
        text += f" The registration cost is {_tao(c.burn_now_tao)} now."
    short = max(needed - c.balance_tao, 0.0)
    return text, Fix(kind="info", text=f"Top up the coldkey by at least {_tao(short)} plus fees, or wait for the burn to decay")


def _rate_limited(c: ExplainContext) -> tuple[str, Fix | None] | None:
    if c.last_update is None or c.rate_limit is None or c.block is None:
        return None
    allowed = c.last_update + c.rate_limit
    text = (
        f"This hotkey last set weights at block {c.last_update:,} and the subnet allows one call every "
        f"{c.rate_limit:,} blocks, so nothing before block {allowed:,} can succeed. The attempt was at block {c.block:,}."
    )
    return text, Fix(kind="wait", text=f"Retry at or after block {allowed:,}")


def _min_stake(c: ExplainContext) -> tuple[str, Fix | None] | None:
    if c.stake is None or c.stake_threshold is None:
        return None
    gap = max(c.stake_threshold - c.stake, 0.0)
    text = (
        f"The hotkey's stake weight was {c.stake:,.2f} and setting weights needs {c.stake_threshold:,.2f} "
        f"(StakeThreshold), a gap of {gap:,.2f}."
    )
    fix = None
    if c.netuid is not None and c.hotkey:
        fix = Fix(kind="command", text=f"btcli stake add --netuid {c.netuid} --hotkey {c.hotkey} --amount {math.ceil(gap)} {c.network_flag}")
    return text, fix


def _version(c: ExplainContext) -> tuple[str, Fix | None] | None:
    if c.required_version is None:
        return None
    sent = f"{c.version_key}" if c.version_key is not None else "an older key"
    return (
        f"The call sent version key {sent}; the subnet requires {c.required_version} or newer.",
        Fix(kind="code", text=f"Update the validator code, or pass --version-key {c.required_version}"),
    )


def _bad_ip(c: ExplainContext) -> tuple[str, Fix | None] | None:
    if c.ip is None:
        return None
    replacement = "::ffff:127.0.0.1" if c.network == "local" else "<public-ip>"
    netuid = c.netuid if c.netuid is not None else "<netuid>"
    return (
        f"The call tried to serve {c.ip}, which the chain refuses as an axon address.",
        Fix(kind="command", text=f"btcli axon set --netuid {netuid} --ip {replacement} --port <port> {c.network_flag}"),
    )


def _too_few_weights(c: ExplainContext) -> tuple[str, Fix | None] | None:
    if c.weights_count is None or c.min_allowed_weights is None:
        return None
    return (
        f"The call weighted {c.weights_count} UIDs; this subnet requires at least {c.min_allowed_weights}.",
        Fix(kind="code", text=f"Include at least {c.min_allowed_weights} UIDs in the weight vector"),
    )


def _already_registered(c: ExplainContext) -> tuple[str, Fix | None] | None:
    if c.hotkey is None or c.netuid is None:
        return None
    return (
        f"Hotkey {c.hotkey} already holds a UID on SN{c.netuid}, so there is nothing to register.",
        Fix(kind="command", text=f"preflight doctor {c.hotkey} --netuid {c.netuid} {c.network_flag}"),
    )


def _too_many_commits(c: ExplainContext) -> tuple[str, Fix | None] | None:
    if c.pending_commits is None:
        return None
    return (
        f"Before this block the hotkey already had {c.pending_commits} unrevealed commits queued on the subnet, "
        "so the runtime refused another.",
        Fix(kind="wait", text="Let the queued commits reveal (timelocked commits reveal on their drand round) before committing again"),
    )


TEMPLATES: dict[str, Template] = {
    "TooManyUnrevealedCommits": _too_many_commits,
    "NotEnoughBalanceToStake": _not_enough_balance,
    "Payment": _not_enough_balance,
    "SettingWeightsTooFast": _rate_limited,
    "CommittingWeightsTooFast": _rate_limited,
    "NotEnoughStakeToSetWeights": _min_stake,
    "IncorrectWeightVersionKey": _version,
    "InvalidIpAddress": _bad_ip,
    "WeightVecLengthIsLow": _too_few_weights,
    "HotKeyAlreadyRegisteredInSubNet": _already_registered,
}

POOL_ERRORS = {
    "Payment": ("The account cannot pay the transaction fee", "insufficient_balance"),
    "Future": ("The nonce is ahead of the account's next nonce", "nonce"),
    "Stale": ("The nonce was already used; the transaction is outdated", "nonce"),
    "BadProof": ("The signature does not match the signer", "invalid_signature"),
    "AncientBirthBlock": ("The transaction's era expired before it was included", "expired"),
    "ExhaustsResources": ("The block is full; retry in a later block", "rate_limited"),
    "PriorityTooLow": ("A transaction with the same nonce and higher priority is already in the pool", "nonce"),
}


def explain(name: str, ctx: ExplainContext | None = None, pallet: str | None = None) -> ErrorExplanation:
    ctx = ctx or ExplainContext()
    entry = catalog.lookup(name)
    trap = find_trap(name, ctx)
    template = TEMPLATES.get(name)
    specific = template(ctx) if template else None

    runtime = catalog.dispatch_error(name) if entry is None else None
    if entry is None and runtime is not None:
        code, base = runtime
        title = _title(name)
    elif entry is None and name in POOL_ERRORS:
        title, code = POOL_ERRORS[name]
        base = f"{title}. The transaction was rejected before it ran, so no state changed"
    elif entry is None:
        title, code = _title(name), None
        base = ""
    else:
        title, code = _title(name), entry.code
        base = entry.description

    # The specific sentence restates the catalog text with this case's numbers; showing both
    # reads as a stutter, so the catalog text is the fallback, still one click away in `docs`.
    parts = [p for p in ((specific[0] if specific else base), trap.body if trap else None) if p]
    fix = specific[1] if specific else None
    if fix is None and (hint := catalog.remediation(code)):
        fix = Fix(kind="info", text=hint)
    found = entry is not None or runtime is not None or name in POOL_ERRORS or trap is not None
    return ErrorExplanation(
        error=name,
        pallet=pallet or (entry.pallets[0] if entry and entry.pallets else None),
        code=code,
        title=title if found else f"{name} is not in the error catalog",
        explanation="\n\n".join(parts)
        if parts
        else "This name is not in the official catalog fetched "
        f"{catalog.fetched_at()[:10]}. Check the spelling, or paste the full error output",
        fix=fix,
        trap=trap.id if trap else None,
        source=entry.source if entry else None,
        docs=entry.docs if entry else None,
        found=found,
    )


def explain_text(text: str, ctx: ExplainContext | None = None) -> ErrorExplanation:
    names = catalog.parse_error_names(text)
    if not names:
        return ErrorExplanation(
            error="",
            title="No known error name found",
            explanation="Paste the full error from btcli or the SDK, for example "
            "`SubtensorModule.TooManyRegistrationsThisBlock` or a Python traceback ending in a ChainError",
            found=False,
        )
    return explain(names[0], ctx)


def _title(name: str) -> str:
    words: list[str] = []
    current = ""
    for char in name:
        if char.isupper() and current and not current[-1].isupper():
            words.append(current)
            current = char
        else:
            current += char
    words.append(current)
    sentence = " ".join(words).lower()
    return sentence[0].upper() + sentence[1:]
