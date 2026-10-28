"""The shared contract. Every surface (CLI, HTTP, MCP, web) speaks these models.

JSON Schema in `schema/` and TypeScript in `web/src/lib/types.ts` are generated from
this file by `scripts/gen_contract.py`; CI fails when they drift.
"""

from __future__ import annotations

from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class Model(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")


class Severity(StrEnum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    INFO = "info"


SEVERITY_RANK: dict[Severity, int] = {
    Severity.CRITICAL: 3,
    Severity.HIGH: 2,
    Severity.MEDIUM: 1,
    Severity.INFO: 0,
}


class Verdict(StrEnum):
    HEALTHY = "healthy"
    WARNING = "warning"
    BROKEN = "broken"


NetworkName = Literal["local", "test", "finney", "custom"]


class ChainRef(Model):
    """Where and when a result was read. Every report carries one."""

    network: NetworkName
    endpoint: str
    block: int
    block_hash: str
    runtime_spec: int | None = None


class Evidence(Model):
    label: str
    value: str
    source: str | None = Field(
        default=None, description="Storage item or runtime API the value came from"
    )


class Fix(Model):
    kind: Literal["command", "code", "wait", "info"]
    text: str = Field(description="The exact command or change, filled with the user's values")
    note: str | None = None


class Finding(Model):
    id: str = Field(description="Rule id such as PF101")
    rule: str = Field(description="Rule slug such as not_registered")
    severity: Severity
    title: str
    evidence: list[Evidence]
    explanation: str
    fix: Fix | None = None
    docs: str | None = None


class AxonInfo(Model):
    ip: str
    port: int
    ip_type: int = 4

    @property
    def address(self) -> str:
        host = f"[{self.ip}]" if ":" in self.ip else self.ip
        return f"{host}:{self.port}"


class NeuronState(Model):
    """One UID as the chain sees it at the pinned block."""

    uid: int
    hotkey: str
    coldkey: str
    active: bool
    validator_permit: bool
    stake: float = Field(description="Stake weight in alpha units, as the epoch uses it")
    incentive: float
    trust: float
    consensus: float
    dividends: float
    emission: float = Field(description="Alpha per tempo")
    last_update: int
    block_at_registration: int
    axon: AxonInfo | None = None


class Diagnosis(Model):
    """The Doctor's answer for one hotkey on one subnet."""

    hotkey: str
    netuid: int
    subnet_name: str | None = None
    chain: ChainRef
    verdict: Verdict
    headline: str
    findings: list[Finding]
    neuron: NeuronState | None = None
    role: Literal["miner", "validator", "unregistered"]
    rules_run: int


class DoctorReport(Model):
    hotkey: str
    chain: ChainRef
    diagnoses: list[Diagnosis]
    verdict: Verdict
    headline: str
    elapsed_ms: int
    owned_hotkeys: int | None = Field(
        default=None, description="Set when the address is a coldkey: how many hotkeys it owns"
    )


class FleetRow(Model):
    hotkey: str
    netuid: int | None
    subnet_name: str | None = None
    uid: int | None = None
    role: Literal["miner", "validator", "unregistered"]
    verdict: Verdict
    headline: str
    worst: Finding | None = None
    incentive: float = 0.0
    alpha_per_day: float = 0.0
    tao_per_day: float = 0.0


class FleetReport(Model):
    """Every hotkey a coldkey owns, on every subnet it is registered on, worst first."""

    coldkey: str
    chain: ChainRef
    hotkeys: int
    checked: int
    rows: list[FleetRow]
    broken: int
    warning: int
    healthy: int
    unseated: int = Field(default=0, description="Owned hotkeys that hold no seat on any subnet")
    tao_per_day: float = Field(description="All rows' emission at today's alpha prices")
    headline: str
    elapsed_ms: int


class EarningsBand(Model):
    label: str
    alpha_per_day: float
    tao_per_day: float


class MinerEconomics(Model):
    """What mining a subnet looks like from the outside, before paying to register."""

    chain: ChainRef
    netuid: int
    name: str
    verdict: Literal["promising", "competitive", "hard", "closed"]
    headline: str
    registration_cost_tao: float
    burn_history: list[tuple[int, float]]
    seats_used: int
    seats_max: int
    miners: int
    earning_miners: int
    alpha_price_tao: float
    bands: list[EarningsBand]
    immunity_blocks: int
    immunity_hours: float
    prune_bar_alpha_per_day: float | None = Field(
        description="Emission of the neuron the runtime would prune next; earn more than this to keep a seat"
    )
    prune_bar_tao_per_day: float | None
    registrations_per_day: float
    seat_turnover_hours: float | None = Field(
        description="When full, hours between prunes at the registration rate the burn steers toward"
    )
    payback_days: float | None = Field(description="Registration cost over the median earner's day")
    notes: list[str]
    findings: list[Finding]


class HistoryPoint(Model):
    block: int
    uid: int | None = Field(description="None when the hotkey held no UID at that block")
    incentive: float
    trust: float
    emission: float = Field(description="Alpha per tempo")
    weighted_by: int = Field(description="Permitted validators with non zero weight on this UID")


class NeuronHistory(Model):
    chain: ChainRef
    hotkey: str
    netuid: int
    points: list[HistoryPoint] = Field(description="Oldest first, one per tempo")


ActivityKind = Literal[
    "weights", "register", "stake", "unstake", "serve", "transfer", "commitment", "shielded", "evm", "subnet", "other"
]


class Activity(Model):
    """One extrinsic as a sentence, for the live feed."""

    block: int
    index: int
    ref: str = Field(description="block-index, the Tx debugger's reference")
    hash: str | None
    kind: ActivityKind
    pallet: str
    call: str
    signer: str | None
    netuid: int | None
    summary: str
    success: bool
    error: str | None = None
    amount: str | None = None


class LiveBlock(Model):
    number: int
    hash: str
    timestamp: str | None
    activities: list[Activity]
    system_calls: int = Field(description="Housekeeping extrinsics counted but not listed")
    failed: int


class LiveFeed(Model):
    chain: ChainRef
    head: int
    blocks: list[LiveBlock] = Field(description="Oldest first")


class NeuronPoint(Model):
    block: int
    uid: int | None
    incentive: float
    emission: float = Field(description="Alpha per tempo")
    trust: float
    rank_by_emission: int | None = Field(description="1 is the highest emission among miners")
    miners: int


class ChangeDriver(Model):
    """One validator's part in the change: its stake share times its weight on the UID."""

    uid: int
    hotkey: str
    stake_share_before: float
    stake_share_after: float
    weight_before: float = Field(description="Share of this validator's weight on the UID, 0..1")
    weight_after: float
    support_before: float = Field(description="stake share x weight share")
    support_after: float
    blocks_since_update: int
    reason: str


class IncentiveChange(Model):
    """Why a UID's incentive moved between two blocks, in validators' terms."""

    chain: ChainRef
    hotkey: str
    netuid: int
    from_block: int
    to_block: int
    before: NeuronPoint
    after: NeuronPoint
    change: float = Field(description="Relative change in incentive, -1..inf; 0 when both are zero")
    headline: str
    drivers: list[ChangeDriver]
    notes: list[str]


class ErrorTrend(Model):
    error: str
    count: int
    subnets: list[int]
    example_ref: str
    title: str
    meaning: str = Field(description="The error's own explanation, first sentence")
    fix: str | None = None


class Weather(Model):
    """The chain's condition over recent blocks, from the live feed."""

    chain: ChainRef
    from_block: int
    to_block: int
    blocks: int
    extrinsics: int
    failed: int
    failure_rate: float
    headline: str
    top_errors: list[ErrorTrend]
    by_kind: dict[str, int]
    busiest_subnets: list[tuple[int, int]] = Field(description="(netuid, extrinsics), busiest first")
    failing_subnets: list[tuple[int, int]] = Field(description="(netuid, failures), most first")


class DecodedArg(Model):
    name: str
    value: str
    raw: str | None = None


class TxEvent(Model):
    index: int
    pallet: str
    name: str
    summary: str


class DispatchFailure(Model):
    pallet: str
    error: str
    code: str | None = Field(default=None, description="Semantic code from errors.json")
    description: str | None = None
    docs: str | None = None


class ErrorExplanation(Model):
    """What an error means, why it happened and what to run, with this case's numbers."""

    error: str
    pallet: str | None = None
    code: str | None = None
    title: str
    explanation: str
    fix: Fix | None = None
    trap: str | None = Field(default=None, description="Id of a hand written trap explainer")
    source: str | None = Field(default=None, description="Subtensor source file and line")
    docs: str | None = None
    found: bool = True


class TxReport(Model):
    chain: ChainRef
    ref: str
    extrinsic_hash: str | None
    block: int
    index: int
    signer: str | None
    pallet: str
    call: str
    args: list[DecodedArg]
    success: bool
    fee_tao: float | None
    events: list[TxEvent]
    failure: DispatchFailure | None = None
    explanation: ErrorExplanation | None = None
    hotkey: str | None = None
    netuid: int | None = None


SimAction = Literal[
    "burned_register",
    "add_stake",
    "remove_stake",
    "set_weights",
    "serve_axon",
    "register_network",
    "start_call",
]


class SimRequest(Model):
    """One action to try. Hotkey-signed actions (set_weights, serve_axon) use `hotkey` as
    the signer; coldkey-signed actions use `coldkey`."""

    action: SimAction
    coldkey: str | None = Field(default=None, description="Signing coldkey ss58 for coldkey actions")
    hotkey: str | None = Field(default=None, description="Hotkey ss58 the action targets or signs with")
    netuid: int | None = None
    amount: float | None = Field(default=None, description="TAO for add_stake, alpha for remove_stake")
    uids: list[int] = []
    weights: list[float] = []
    ip: str | None = None
    port: int | None = None
    version_key: int = 0
    balance_override_tao: float | None = Field(
        default=None, description="Pretend the coldkey holds this much free TAO (fork mode only)"
    )


class BalanceChange(Model):
    account: str
    label: str
    before: str
    after: str
    delta: str


class SimResult(Model):
    chain: ChainRef
    action: SimAction
    signer: str
    args: list[DecodedArg]
    mode: Literal["fork", "predicted"]
    mode_label: str
    would_succeed: bool
    failure: DispatchFailure | None = None
    explanation: ErrorExplanation | None = None
    fee_tao: float | None = None
    effects: list[str]
    balance_changes: list[BalanceChange] = []
    checks: list[Evidence] = []
    overrides: list[str] = Field(default=[], description="Storage overrides applied on the fork")
    elapsed_ms: int


class Hyperparam(Model):
    name: str
    group: Literal["Registration", "Weights", "Consensus", "Emissions", "Commit reveal", "Other"]
    value: str
    meaning: str
    range: str | None = None
    who: Literal["owner", "root", "chain"]


class TimelineStep(Model):
    label: str
    block: int | None
    detail: str


class LaunchPlan(Model):
    chain: ChainRef
    lock_cost_tao: float
    min_lock_tao: float
    last_lock_tao: float
    lock_reduction_interval: int
    rate_limit_blocks: int
    next_registration_block: int | None
    subnet_count: int
    subnet_limit: int
    replaced_netuid: int | None = Field(
        description="Subnet the runtime would dissolve if a new one registers at the cap"
    )
    replaced_name: str | None = None
    network_immunity_blocks: int
    start_call_delay: int
    timeline: list[TimelineStep]
    defaults: list[Hyperparam]
    block_seconds: float


class HealthFactor(Model):
    id: str
    label: str
    score: float = Field(ge=0, le=1)
    weight: float
    value: str
    explanation: str


class Health(Model):
    netuid: int
    score: int = Field(ge=0, le=100)
    band: Literal["healthy", "watch", "at_risk"]
    factors: list[HealthFactor]
    findings: list[Finding]


class HealthScores(Model):
    """Every subnet's health, from one bulk read. Keys are netuids as strings."""

    chain: ChainRef
    scores: dict[str, Health]


class SubnetLive(Model):
    netuid: int
    name: str
    symbol: str | None = None
    price_tao: float | None = None
    emission_share: float | None = None
    miners: int
    validators: int
    max_uids: int
    registration_cost_tao: float
    registration_allowed: bool
    tempo: int
    owner_coldkey: str | None = None


class SubnetCatalogEntry(Model):
    netuid: int
    name: str
    summary: str
    capabilities: list[str]
    operator: str | None = None
    website: str | None = None
    github: str | None = None
    docs: str | None = None
    api: str | None = Field(description="Public API base URL, or 'none'")
    api_example: str | None = None
    api_needs_key: bool = False
    sources: list[str]


class SubnetCard(Model):
    netuid: int
    catalog: SubnetCatalogEntry | None
    live: SubnetLive | None
    health: Health | None


class SubnetDetail(Model):
    chain: ChainRef
    card: SubnetCard
    hyperparams: list[Hyperparam]


class AskAnswer(Model):
    """The deterministic Ask box: what we understood and where it routes."""

    query: str
    intent: Literal[
        "doctor", "tx", "explain_error", "subnet", "plan", "find", "sim", "economics", "fleet", "unknown"
    ]
    route: str | None
    params: dict[str, str]
    message: str


class ServiceHealth(Model):
    ok: bool
    version: str
    networks: dict[str, bool]
    fork: bool = Field(description="True when a Chopsticks fork is available for simulation")
