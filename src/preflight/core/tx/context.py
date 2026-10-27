"""What we know about the failed attempt, so explanations can use its own numbers."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ExplainContext:
    network: str = "finney"
    call: str | None = None
    shielded: bool = False
    netuid: int | None = None
    hotkey: str | None = None
    coldkey: str | None = None
    block: int | None = None
    amount_tao: float | None = None
    balance_tao: float | None = None
    burn_tao: float | None = None
    burn_now_tao: float | None = None
    last_update: int | None = None
    rate_limit: int | None = None
    stake: float | None = None
    stake_threshold: float | None = None
    version_key: int | None = None
    required_version: int | None = None
    ip: str | None = None
    weights_count: int | None = None
    min_allowed_weights: int | None = None
    pending_commits: int | None = None

    @property
    def network_flag(self) -> str:
        return f"--network {self.network}"
