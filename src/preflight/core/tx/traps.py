"""Hand-written explainers for traps the official catalog does not tell you about.

Each was hit for real while building on bittensor 11.3 (BUILD.md section 4) or is a
well known source of confused retries. A trap matches on error names plus context.
"""

from __future__ import annotations

from dataclasses import dataclass

from .context import ExplainContext


@dataclass(frozen=True)
class Trap:
    id: str
    title: str
    errors: frozenset[str]
    body: str

    def matches(self, name: str, ctx: ExplainContext) -> bool:
        if name in self.errors:
            return True
        return self.id == "mev_shield_register" and ctx.call == "burned_register" and ctx.shielded


TRAPS: tuple[Trap, ...] = (
    Trap(
        "mev_shield_register",
        "Shielded registration never lands on localnet",
        frozenset({"FailedShieldedTxParsing", "InvalidShieldedTxPubKeyHash", "MevShield"}),
        "In bittensor 11 the BurnedRegister intent always goes through the MEV shield. On localnet the "
        "decrypted transaction never lands, so the register call looks submitted but no UID appears. "
        "Submit the raw call in the clear instead: client.submit_call(bt.calls.SubtensorModule"
        ".burned_register(netuid=N, hotkey=HOTKEY), wallet)",
    ),
    Trap(
        "reserves_too_low",
        "The subnet pool is too shallow",
        frozenset({"ReservesTooLow", "InsufficientLiquidity"}),
        "A new subnet's AMM pool starts with the lock as its only liquidity. With a small lock, staking "
        "or registering with collateral cannot clear against the pool. On localnet create subnets with a "
        "lock of at least 10,000 TAO and keep collateral_lock_share at 0",
    ),
    Trap(
        "register_before_stake",
        "Register every neuron before anyone stakes",
        frozenset({"SubtokenDisabled", "NotEnoughLiquidity"}),
        "Staking moves the pool price, and registrations that buy collateral then fail against the moved "
        "price. On a fresh subnet, register all miners and validators first, run start_call, then stake",
    ),
    Trap(
        "loopback_axon",
        "127.0.0.1 is rejected, ::ffff:127.0.0.1 is accepted",
        frozenset({"InvalidIpAddress"}),
        "The chain refuses 127.0.0.1 and ::1 as axon addresses (subnets/serving.rs L222) but accepts the "
        "IPv4 mapped form ::ffff:127.0.0.1, which every local client still resolves to loopback. For a "
        "local test subnet serve on ::ffff:127.0.0.1; on mainnet serve your public IP",
    ),
    Trap(
        "weight_rate_limit",
        "Weights were set too soon after the last ones",
        frozenset({"SettingWeightsTooFast", "CommittingWeightsTooFast", "RateLimitExceeded"}),
        "Each UID may set weights once every WeightsSetRateLimit blocks, counted from its LastUpdate. "
        "Retrying in a loop does not help; schedule the next call for the block where the limit expires",
    ),
    Trap(
        "commit_reveal_timing",
        "Commit reveal has a window",
        frozenset({"RevealTooEarly", "ExpiredWeightCommit", "NoWeightsCommitFound", "CommitRevealEnabled", "InvalidRevealRound"}),
        "On commit reveal subnets plain set_weights is refused. With the timelocked flow the chain reveals "
        "for you when the drand round arrives; with hash commits you must reveal in the epoch the window "
        "opens, not before and not after",
    ),
    Trap(
        "burn_moved",
        "The registration price moved between attempts",
        frozenset({"NotEnoughBalanceToStake", "TooManyRegistrationsThisBlock", "TooManyRegistrationsThisInterval", "Payment"}),
        "The burn rises with every registration and decays over time, so a balance that covered the quote "
        "can fall short a block later, and a failed attempt can still cost its fee. Check `btcli subnets "
        "burn-cost` right before retrying and keep some headroom",
    ),
)


def find_trap(name: str, ctx: ExplainContext) -> Trap | None:
    return next((t for t in TRAPS if t.matches(name, ctx)), None)
