"""Every storage item and runtime API Preflight reads, in one place.

Each name was confirmed against runtime metadata (finney spec 486, devnet localnet) and
`catalog/reads.json` on 2026-10-27. `tests/unit/test_registry.py` fails if the SDK's
generated descriptors lose one, and `tests/localnet/test_registry_live.py` checks them
against a running node's metadata. Runtime upgrades rename things; fix them here only.
"""

from __future__ import annotations

from bittensor._generated.storage import SubtensorModule as SM
from bittensor._generated.storage import System

SOURCE = "https://www.bittensor.com/code/pallets/subtensor/src"

# Registration
BURN = SM.Burn
REGISTRATION_ALLOWED = SM.NetworkRegistrationAllowed
REGS_THIS_BLOCK = SM.RegistrationsThisBlock
REGS_THIS_INTERVAL = SM.RegistrationsThisInterval
MAX_REGS_PER_BLOCK = SM.MaxRegistrationsPerBlock
TARGET_REGS_PER_INTERVAL = SM.TargetRegistrationsPerInterval
LAST_ADJUSTMENT_BLOCK = SM.LastAdjustmentBlock
ADJUSTMENT_INTERVAL = SM.AdjustmentInterval
IMMUNITY_PERIOD = SM.ImmunityPeriod
IMMUNE_OWNER_UIDS_LIMIT = SM.ImmuneOwnerUidsLimit
MAX_ALLOWED_UIDS = SM.MaxAllowedUids
UIDS = SM.Uids
KEYS = SM.Keys
BLOCK_AT_REGISTRATION = SM.BlockAtRegistration
OWNER = SM.Owner

# Weights
LAST_UPDATE = SM.LastUpdate
WEIGHTS_SET_RATE_LIMIT = SM.WeightsSetRateLimit
STAKE_THRESHOLD = SM.StakeThreshold  # the weights-min-stake floor; errors.json NotEnoughStakeToSetWeights
WEIGHTS_VERSION_KEY = SM.WeightsVersionKey
MIN_ALLOWED_WEIGHTS = SM.MinAllowedWeights
MAX_WEIGHTS_LIMIT = SM.MaxWeightsLimit
WEIGHT_COMMITS = SM.WeightCommits
TIMELOCKED_WEIGHT_COMMITS = SM.TimelockedWeightCommits
COMMIT_REVEAL_ENABLED = SM.CommitRevealWeightsEnabled
REVEAL_PERIOD_EPOCHS = SM.RevealPeriodEpochs
ACTIVITY_CUTOFF = SM.ActivityCutoff

# Epochs and emission
TEMPO = SM.Tempo
LAST_EPOCH_BLOCK = SM.LastEpochBlock
LAST_MECHANISM_STEP_BLOCK = SM.LastMechansimStepBlock  # the misspelling is the runtime's
FIRST_EMISSION_BLOCK = SM.FirstEmissionBlockNumber
NETWORK_REGISTERED_AT = SM.NetworkRegisteredAt
START_CALL_DELAY = SM.StartCallDelay
MINER_BURNED = SM.MinerBurned
RECYCLE_OR_BURN = SM.RecycleOrBurn
SUBNET_OWNER = SM.SubnetOwner
SUBNET_OWNER_HOTKEY = SM.SubnetOwnerHotkey
KAPPA = SM.Kappa
EMISSION = SM.Emission

# Network registration (launch planner)
SUBNET_LIMIT = SM.SubnetLimit
TOTAL_NETWORKS = SM.TotalNetworks
NETWORK_RATE_LIMIT = SM.NetworkRateLimit
NETWORK_IMMUNITY_PERIOD = SM.NetworkImmunityPeriod
NETWORK_MIN_LOCK_COST = SM.NetworkMinLockCost
NETWORK_LAST_LOCK_COST = SM.NetworkLastLockCost
NETWORK_LOCK_REDUCTION_INTERVAL = SM.NetworkLockReductionInterval
NETWORK_REGISTRATION_START_BLOCK = SM.NetworkRegistrationStartBlock

ACCOUNT = System.Account

# Runtime APIs
API_SUBNET_TO_PRUNE = ("SubnetInfoRuntimeApi", "get_subnet_to_prune")
API_NETWORK_REGISTRATION_COST = ("SubnetRegistrationRuntimeApi", "get_network_registration_cost")
API_SIM_SWAP_TAO_FOR_ALPHA = ("SwapRuntimeApi", "sim_swap_tao_for_alpha")
API_SIM_SWAP_ALPHA_FOR_TAO = ("SwapRuntimeApi", "sim_swap_alpha_for_tao")

# Source citations for ported runtime checks
SRC_SET_WEIGHTS = f"{SOURCE}/subnets/weights.rs#L971"
SRC_RATE_LIMIT = f"{SOURCE}/subnets/weights.rs#L1295"
SRC_VERSION_KEY = f"{SOURCE}/subnets/weights.rs#L1285"
SRC_CHECK_LENGTH = f"{SOURCE}/subnets/weights.rs#L1370"
SRC_NEURON_TO_PRUNE = f"{SOURCE}/subnets/registration.rs#L513"
SRC_IMMUNE_OWNER = f"{SOURCE}/subnets/registration.rs#L469"
SRC_IS_IMMUNE = f"{SOURCE}/utils/misc.rs#L569"
SRC_VALID_IP = f"{SOURCE}/subnets/serving.rs#L222"

ALL_STORAGE = (
    BURN, REGISTRATION_ALLOWED, REGS_THIS_BLOCK, REGS_THIS_INTERVAL, MAX_REGS_PER_BLOCK,
    TARGET_REGS_PER_INTERVAL, LAST_ADJUSTMENT_BLOCK, ADJUSTMENT_INTERVAL, IMMUNITY_PERIOD,
    IMMUNE_OWNER_UIDS_LIMIT, MAX_ALLOWED_UIDS, UIDS, KEYS, BLOCK_AT_REGISTRATION, OWNER,
    LAST_UPDATE, WEIGHTS_SET_RATE_LIMIT, STAKE_THRESHOLD, WEIGHTS_VERSION_KEY,
    MIN_ALLOWED_WEIGHTS, MAX_WEIGHTS_LIMIT, WEIGHT_COMMITS, TIMELOCKED_WEIGHT_COMMITS,
    COMMIT_REVEAL_ENABLED, REVEAL_PERIOD_EPOCHS, ACTIVITY_CUTOFF, TEMPO, LAST_EPOCH_BLOCK,
    LAST_MECHANISM_STEP_BLOCK, FIRST_EMISSION_BLOCK, NETWORK_REGISTERED_AT, START_CALL_DELAY,
    MINER_BURNED, RECYCLE_OR_BURN, SUBNET_OWNER, SUBNET_OWNER_HOTKEY, KAPPA, EMISSION,
    SUBNET_LIMIT, TOTAL_NETWORKS, NETWORK_RATE_LIMIT, NETWORK_IMMUNITY_PERIOD,
    NETWORK_MIN_LOCK_COST, NETWORK_LAST_LOCK_COST, NETWORK_LOCK_REDUCTION_INTERVAL,
    NETWORK_REGISTRATION_START_BLOCK, ACCOUNT,
)  # fmt: skip
