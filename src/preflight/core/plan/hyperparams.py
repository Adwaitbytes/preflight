"""Subnet hyperparameters in plain words: meaning, current value with units, range, who sets it.

Meanings, ranges and the owner or root split come from the official reference,
https://www.bittensor.com/docs/hyperparameters (fetched 2026-10-27 from
https://www.bittensor.com/llms.mdx/docs/hyperparameters/content.md and the per-parameter
pages under it). `who` is "owner" when the reference marks a parameter owner-settable,
"root" when only root governance can change it, and "chain" for values the runtime
derives or sets itself (start_call status, the owner cut flag, the legacy LP flag).

`explain_hyperparams` takes the raw dict `subnet_hyperparameters(netuid)` returns: raw
on-chain integers, which this module turns into units (u16 fractions as %, rao as TAO,
blocks with minutes at the chain's block time).
"""

from __future__ import annotations

from collections.abc import Callable, Mapping
from dataclasses import dataclass
from typing import Any, Literal

from ..models import Hyperparam

REFERENCE = "https://www.bittensor.com/docs/hyperparameters"
RAO = 1_000_000_000
U16 = 65535
U64 = (1 << 64) - 1
FIXED64 = 1 << 64

Group = Literal["Registration", "Weights", "Consensus", "Emissions", "Commit reveal", "Other"]
Who = Literal["owner", "root", "chain"]
Kind = Literal[
    "blocks",
    "u16_pct",
    "u64_pct",
    "fixed",
    "rao",
    "flag",
    "int",
    "epochs",
    "milli_tempo",
    "ppm_pct",
    "consensus",
    "steepness",
]


@dataclass(frozen=True)
class Spec:
    group: Group
    who: Who
    kind: Kind
    meaning: str
    range: str | None = None


SPECS: dict[str, Spec] = {
    # Registration
    "registration_allowed": Spec("Registration", "owner", "flag", "Whether new neurons can register by burning TAO", "on or off"),
    "network_pow_registration_allowed": Spec("Registration", "owner", "flag", "Whether new neurons can register with proof of work instead of a burn", "on or off"),
    "min_burn": Spec("Registration", "owner", "rao", "Floor on the burned registration cost", "below 1 TAO and below max_burn"),
    "max_burn": Spec("Registration", "owner", "rao", "Ceiling on the burned registration cost", "above 0.1 TAO and above min_burn"),
    "burn_half_life": Spec("Registration", "owner", "blocks", "Blocks for the registration cost to decay by half when nobody registers", "0 disables decay"),
    "burn_increase_mult": Spec("Registration", "owner", "fixed", "Multiplier applied to the registration cost after each registration", "1 to 3"),
    "max_regs_per_block": Spec("Registration", "root", "int", "Most registrations the subnet accepts in one block"),
    "target_regs_per_interval": Spec("Registration", "root", "int", "Registrations per interval the old difficulty adjustment aimed for; three times this is a hard cap"),
    "adjustment_interval": Spec("Registration", "root", "blocks", "Cadence of the old registration cost adjustment; the current runtime no longer adjusts on it"),
    "adjustment_alpha": Spec("Registration", "owner", "u64_pct", "Smoothing of the old registration cost adjustment"),
    "immunity_period": Spec("Registration", "owner", "blocks", "How long a newly registered neuron is protected from being pruned"),
    "max_allowed_uids": Spec("Registration", "owner", "int", "Neuron slots on the subnet before registrations start pruning the weakest UID", "not below the current neuron count"),
    "owner_immune_neuron_limit": Spec("Registration", "owner", "int", "How many of the owner's UIDs are immune from pruning", "1 to 10"),
    "difficulty": Spec("Registration", "root", "int", "Current proof of work difficulty for registration"),
    "min_difficulty": Spec("Registration", "root", "int", "Floor on the proof of work difficulty"),
    "max_difficulty": Spec("Registration", "owner", "int", "Ceiling on the proof of work difficulty"),
    "collateral_lock_share": Spec("Registration", "owner", "u16_pct", "Share of the registration price locked as collateral instead of burned", "0% to 100%"),
    "collateral_drain_ratio": Spec("Registration", "owner", "fixed", "Collateral released per alpha a hotkey earns"),
    # Weights
    "weights_version": Spec("Weights", "owner", "int", "Minimum version key a validator must send with set_weights"),
    "weights_rate_limit": Spec("Weights", "root", "blocks", "Blocks a validator must wait between weight submissions"),
    "min_allowed_weights": Spec("Weights", "owner", "int", "Fewest miners a validator must score in one submission"),
    "max_weights_limit": Spec("Weights", "root", "u16_pct", "Largest share of one submission any single miner may receive", "0% to 100%"),
    "activity_cutoff": Spec("Weights", "root", "blocks", "Blocks without setting weights after which a validator counts as inactive"),
    "activity_cutoff_factor": Spec("Weights", "owner", "milli_tempo", "The activity cutoff expressed in thousandths of a tempo", "1,000 to 50,000 (1 to 50 tempos)"),
    "max_validators": Spec("Weights", "root", "int", "How many top-stake neurons get a validator permit", "at most max_allowed_uids"),
    # Consensus
    "tempo": Spec("Consensus", "owner", "blocks", "Blocks between epochs; miners and validators are paid once per tempo", "360 to 50,400 blocks"),
    "kappa": Spec("Consensus", "root", "u16_pct", "Share of active stake that must agree on a weight for it to count as consensus", "0% to 100%"),
    "rho": Spec("Consensus", "owner", "int", "Steepness of the trust curve", "0 to 40 recommended"),
    "epoch_consensus": Spec("Consensus", "owner", "consensus", "Which consensus mechanism the epoch runs"),
    "yuma_version": Spec("Consensus", "root", "int", "Which Yuma Consensus variant the epoch runs", "2 or 3"),
    "yuma3_enabled": Spec("Consensus", "owner", "flag", "Whether the Yuma 3 consensus variant is on", "on or off"),
    "bonds_moving_avg": Spec("Consensus", "owner", "ppm_pct", "How much of the previous bond each epoch keeps; higher means slower moving bonds", "owners up to 97.5%"),
    "bonds_penalty": Spec("Consensus", "owner", "u16_pct", "How much out-of-consensus weight is ignored when bonds accrue", "0% to 100%"),
    "bonds_reset_enabled": Spec("Consensus", "owner", "flag", "Whether bonds reset when a miner commits new metadata", "on or off"),
    "liquid_alpha_enabled": Spec("Consensus", "owner", "flag", "Whether each validator and miner pair gets its own bonds EMA rate", "on or off"),
    "alpha_high": Spec("Consensus", "owner", "u16_pct", "Upper bound of the liquid alpha bonds rate", "at least 2.5%, needs liquid alpha on"),
    "alpha_low": Spec("Consensus", "owner", "u16_pct", "Lower bound of the liquid alpha bonds rate", "at least 2.5%, needs liquid alpha on"),
    "alpha_sigmoid_steepness": Spec("Consensus", "owner", "steepness", "Slope of the liquid alpha sigmoid between alpha_low and alpha_high"),
    # Emissions
    "owner_emission": Spec("Emissions", "root", "u64_pct", "Owner share of the subnet's emission"),
    "validator_emission": Spec("Emissions", "root", "u64_pct", "Validator share of the subnet's emission", "at most 50%"),
    "miner_emission": Spec("Emissions", "root", "u64_pct", "Miner share of the subnet's emission"),
    "owner_cut_enabled": Spec("Emissions", "chain", "flag", "Whether the owner currently takes a cut, derived from the emission split", "read only"),
    "owner_cut_auto_lock_enabled": Spec("Emissions", "owner", "flag", "Whether the owner's cut is locked automatically each epoch", "on or off"),
    "subnet_emission_enabled": Spec("Emissions", "root", "flag", "Root switch for whether the subnet receives its TAO emission share", "on or off"),
    "subnet_is_active": Spec("Emissions", "chain", "flag", "Whether the owner has called start_call, which turns on staking and emissions", "set once by start_call"),
    "min_childkey_take": Spec("Emissions", "owner", "u16_pct", "Floor on the take a childkey may charge on this subnet"),
    # Commit reveal
    "commit_reveal_weights_enabled": Spec("Commit reveal", "owner", "flag", "Whether validators commit hidden weights that are revealed later, so others cannot copy them", "on or off"),
    "commit_reveal_period": Spec("Commit reveal", "owner", "epochs", "Tempos between committing weights and the reveal"),
    # Other
    "serving_rate_limit": Spec("Other", "owner", "blocks", "Blocks a neuron must wait between axon updates"),
    "transfers_enabled": Spec("Other", "owner", "flag", "Whether stake can be transferred between coldkeys on this subnet", "on or off"),
    "user_liquidity_enabled": Spec("Other", "chain", "flag", "Legacy user liquidity flag, always off on the current runtime", "read only"),
}  # fmt: skip

GROUP_ORDER: tuple[Group, ...] = (
    "Registration",
    "Weights",
    "Consensus",
    "Emissions",
    "Commit reveal",
    "Other",
)

# Values a freshly registered subnet starts with. Explicit ones come from
# `init_new_network` (subnets/subnet.rs L541 to L573); the rest are the runtime defaults the
# reference lists. `launch.read_defaults` overlays what the live chain reports.
DEFAULTS: dict[str, Any] = {
    "registration_allowed": True,
    "network_pow_registration_allowed": False,
    "min_burn": 500_000,
    "max_burn": 100 * RAO,
    "burn_half_life": 360,
    "burn_increase_mult": 23_242_897_532_874_035_200,  # 1.26 as U64F64 bits
    "max_regs_per_block": 1,
    "target_regs_per_interval": 2,
    "immunity_period": 5000,
    "max_allowed_uids": 256,
    "owner_immune_neuron_limit": 1,
    "collateral_lock_share": 0,
    "collateral_drain_ratio": FIXED64,
    "weights_version": 0,
    "weights_rate_limit": 100,
    "min_allowed_weights": 1,
    "max_weights_limit": U16,
    "activity_cutoff": 5000,
    "activity_cutoff_factor": 13_889,
    "max_validators": 64,
    "tempo": 360,
    "kappa": 32_767,
    "rho": 10,
    "epoch_consensus": 0,
    "yuma3_enabled": True,
    "bonds_moving_avg": 900_000,
    "bonds_penalty": U16,
    "bonds_reset_enabled": False,
    "liquid_alpha_enabled": False,
    "alpha_sigmoid_steepness": 1000,
    "owner_emission": U64 * 18 // 100,
    "validator_emission": U64 * 41 // 100,
    "miner_emission": U64 * 41 // 100,
    "owner_cut_auto_lock_enabled": False,
    "subnet_emission_enabled": True,
    "subnet_is_active": False,
    "min_childkey_take": 0,
    "commit_reveal_weights_enabled": True,
    "commit_reveal_period": 1,
    "serving_rate_limit": 50,
    "transfers_enabled": True,
}


def span(blocks: int, block_seconds: float = 12.0) -> str:
    """'360 blocks (about 72 min)'."""
    seconds = max(blocks, 0) * block_seconds
    if seconds < 90:
        human = f"{seconds:.0f} s"
    elif seconds < 5400:
        human = f"{seconds / 60:.0f} min"
    elif seconds < 172_800:
        human = f"{seconds / 3600:.1f} h"
    else:
        human = f"{seconds / 86_400:.1f} days"
    unit = "block" if blocks == 1 else "blocks"
    return f"{blocks:,} {unit} (about {human})"


def _int(value: Any) -> int:
    if isinstance(value, Mapping) and "bits" in value:
        return int(value["bits"])  # pyright: ignore[reportUnknownArgumentType]
    return int(value)


def _pct(fraction: float) -> str:
    text = f"{fraction * 100:.2f}".rstrip("0").rstrip(".")
    return f"{text}%"


def format_value(kind: Kind, raw: Any, block_seconds: float = 12.0) -> str:
    if raw is None:
        return "not set"
    if kind == "flag":
        return "on" if bool(raw) else "off"
    number = _int(raw)
    formatters: dict[Kind, Callable[[int], str]] = {
        "blocks": lambda n: span(n, block_seconds),
        "u16_pct": lambda n: _pct(n / U16),
        "u64_pct": lambda n: _pct(n / U64),
        "ppm_pct": lambda n: _pct(n / 1_000_000),
        "fixed": lambda n: f"{n / FIXED64:.4g}x",
        "rao": lambda n: f"{n / RAO:,.9f}".rstrip("0").rstrip(".") + " TAO",
        "int": lambda n: f"{n:,}",
        "epochs": lambda n: f"{n:,} {'tempo' if n == 1 else 'tempos'}",
        "milli_tempo": lambda n: f"{n:,} ({n / 1000:.3g} tempos)",
        "consensus": lambda n: {0: "Yuma", 1: "Null"}.get(n, f"variant {n}"),
        "steepness": lambda n: f"{n:,} (slope {n / 100:g})",
    }
    return formatters[kind](number)


def explain_hyperparams(raw: Mapping[str, Any], block_seconds: float = 12.0) -> list[Hyperparam]:
    """Every key in `raw`, grouped in GROUP_ORDER, then by the reference's order in a group.

    Keys the reference does not cover yet are kept under Other with their raw value, so a
    runtime upgrade that adds a parameter shows up instead of disappearing.
    """
    order = {name: index for index, name in enumerate(SPECS)}
    known = sorted((k for k in raw if k in SPECS), key=lambda k: order[k])
    unknown = sorted(k for k in raw if k not in SPECS)
    rows: list[Hyperparam] = []
    for name in known:
        spec = SPECS[name]
        rows.append(
            Hyperparam(
                name=name,
                group=spec.group,
                value=format_value(spec.kind, raw[name], block_seconds),
                meaning=spec.meaning,
                range=spec.range,
                who=spec.who,
            )
        )
    rows.extend(
        Hyperparam(
            name=name,
            group="Other",
            value=str(raw[name]),
            meaning=f"Not in the hyperparameter reference yet; see {REFERENCE}",
            range=None,
            who="chain",
        )
        for name in unknown
    )
    rank = {group: index for index, group in enumerate(GROUP_ORDER)}
    return sorted(rows, key=lambda row: rank[row.group])
