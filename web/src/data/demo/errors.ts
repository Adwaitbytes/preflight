// Generated from catalog/errors.json for offline error explanations. Offline demo only.

export interface CatalogError {
  pallet: string | null;
  code: string | null;
  description: string;
  source: string | null;
  docs: string | null;
}

export const CHAIN_ERRORS: Record<string, CatalogError> = {
 "AccountNotAllowedCommit": {
  "pallet": "Commitments",
  "code": "not_authorized",
  "description": "Raised by `set_commitment` when the runtime commit check fails: the subnet must exist and the signing hotkey must be registered on it. Verify the `netuid` and that the hotkey has a UID on that subnet.",
  "source": "pallets/commitments/src/lib.rs#L132",
  "docs": "https://www.bittensor.com/docs/errors/chain/AccountNotAllowedCommit"
 },
 "AccountRejectsLockedAlpha": {
  "pallet": "SubtensorModule",
  "code": "policy_violation",
  "description": "Locked alpha was being transferred to a coldkey whose `AccountFlags` do not have the accept-locked-alpha bit set, e.g. during a lock transfer or coldkey swap of locks. Check the destination coldkey's `AccountFlags` storage and have the recipient opt in to receiving locked alpha before retrying.",
  "source": "pallets/subtensor/src/macros/errors.rs#L331",
  "docs": "https://www.bittensor.com/docs/errors/chain/AccountRejectsLockedAlpha"
 },
 "AccountRejectsStakingHotkeyGrowth": {
  "pallet": "SubtensorModule",
  "code": "policy_violation",
  "description": "The receiving coldkey opted out of staking-list growth caused by other accounts. Transfer onto a hotkey the receiver already lists or owns, or have the receiver voluntarily establish the destination through its own staking action. Contracts can check getRejectStakingHotkeyGrowth before transferring to avoid a refused precompile call.",
  "source": "pallets/subtensor/src/macros/errors.rs#L419",
  "docs": "https://www.bittensor.com/docs/errors/chain/AccountRejectsStakingHotkeyGrowth"
 },
 "ActiveLockExists": {
  "pallet": "SubtensorModule",
  "code": "already_exists",
  "description": "The destination coldkey already holds a lock with nonzero locked mass on that subnet, so a new or transferred lock cannot be created there. Inspect the `Lock` storage for the (coldkey, netuid, hotkey) triple and wait for the existing lock to unlock or remove it first.",
  "source": "pallets/subtensor/src/macros/errors.rs#L309",
  "docs": "https://www.bittensor.com/docs/errors/chain/ActiveLockExists"
 },
 "ActivityCutoffFactorMilliOutOfBounds": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The `factor_milli` argument to set the activity-cutoff factor was outside the allowed 1000-50000 per-mille range (1 to 50 tempos). Adjust the argument to fall within those bounds before resubmitting.",
  "source": "pallets/subtensor/src/macros/errors.rs#L319",
  "docs": "https://www.bittensor.com/docs/errors/chain/ActivityCutoffFactorMilliOutOfBounds"
 },
 "ActivityCutoffTooLow": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "An admin tried to set the subnet's activity cutoff below the chain-wide minimum. Compare the requested value against the `MinActivityCutoff` storage item and current `activity_cutoff` in `btcli hparams get --netuid <n>`.",
  "source": "pallets/subtensor/src/macros/errors.rs#L198",
  "docs": "https://www.bittensor.com/docs/errors/chain/ActivityCutoffTooLow"
 },
 "AddStakeBurnRateLimitExceeded": {
  "pallet": "SubtensorModule",
  "code": "rate_limited",
  "description": "The add-stake-and-burn operation was submitted again before its per-key rate-limit window elapsed. Wait some blocks and retry; no active raise site exists in current code, so this mainly appears on older runtimes.",
  "source": "pallets/subtensor/src/macros/errors.rs#L291",
  "docs": "https://www.bittensor.com/docs/errors/chain/AddStakeBurnRateLimitExceeded"
 },
 "AdminActionProhibitedDuringWeightsWindow": {
  "pallet": "SubtensorModule",
  "code": "too_early",
  "description": "An owner or admin hyperparameter change was attempted inside the protected freeze window just before the subnet's epoch runs. Check `AdminFreezeWindow` and the blocks remaining until the next epoch (subnet tempo), then retry after the epoch fires.",
  "source": "pallets/subtensor/src/macros/errors.rs#L245",
  "docs": "https://www.bittensor.com/docs/errors/chain/AdminActionProhibitedDuringWeightsWindow"
 },
 "AllNetworksInImmunity": {
  "pallet": "SubtensorModule",
  "code": "too_early",
  "description": "Creating a new subnet required pruning an existing one, but every candidate subnet is still inside its network immunity period so none can be dissolved. Check `NetworkImmunityPeriod` and each subnet's `NetworkRegisteredAt`, and retry once a subnet leaves immunity.",
  "source": "pallets/subtensor/src/macros/errors.rs#L112",
  "docs": "https://www.bittensor.com/docs/errors/chain/AllNetworksInImmunity"
 },
 "AlphaHighTooLow": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The `alpha_high` argument to set liquid-alpha values was below the minimum of roughly 0.025 (1638/65535 in u16 units). Raise `alpha_high` in the `sudo_set_alpha_values` call; current values are in the `AlphaValues` storage per netuid.",
  "source": "pallets/subtensor/src/macros/errors.rs#L137",
  "docs": "https://www.bittensor.com/docs/errors/chain/AlphaHighTooLow"
 },
 "AlphaLowOutOfRange": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The `alpha_low` argument to set liquid-alpha values was below the ~0.025 minimum (1638/65535) or greater than `alpha_high`. Choose alpha_low within that range and not exceeding alpha_high; current settings are in the `AlphaValues` storage for the netuid.",
  "source": "pallets/subtensor/src/macros/errors.rs#L139",
  "docs": "https://www.bittensor.com/docs/errors/chain/AlphaLowOutOfRange"
 },
 "AlreadyApproved": {
  "pallet": "Multisig",
  "code": "already_exists",
  "description": "The sender has already approved this multisig call, so a repeat approval is redundant. Check the `Multisigs` entry for the call hash: the sender's account already appears in its `approvals` list.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/AlreadyApproved"
 },
 "AlreadyDeposited": {
  "pallet": "SafeMode",
  "code": "already_exists",
  "description": "The account calling safe-mode `enter` or `extend` already has a safe-mode deposit on hold, so another cannot be placed. Check the account's `Deposits` entries and its balance held under the `EnterOrExtend` hold reason.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/AlreadyDeposited"
 },
 "AlreadyFinalized": {
  "pallet": "Crowdloan",
  "code": "already_exists",
  "description": "The crowdloan's `finalized` flag is already true, so withdraw, finalize, refund, dissolve, and the update calls are all rejected. Check the `finalized` field of the `Crowdloans` entry for the given `crowdloan_id`.",
  "source": "pallets/crowdloan/src/lib.rs#L267",
  "docs": "https://www.bittensor.com/docs/errors/chain/AlreadyFinalized"
 },
 "AlreadyFinalizing": {
  "pallet": "Crowdloan",
  "code": "already_exists",
  "description": "A `finalize` call was made while another finalization is still in progress, i.e. the dispatched call from a previous finalize has not cleared. Check that the `CurrentCrowdloanId` storage value is empty before retrying.",
  "source": "pallets/crowdloan/src/lib.rs#L269",
  "docs": "https://www.bittensor.com/docs/errors/chain/AlreadyFinalizing"
 },
 "AlreadyNoted": {
  "pallet": "Preimage",
  "code": "already_exists",
  "description": "The preimage for this hash has already been noted on-chain, so `note_preimage` has nothing to add. Check `RequestStatusFor` (or legacy `StatusFor`) for the hash before submitting the bytes again.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/AlreadyNoted"
 },
 "AlreadyStored": {
  "pallet": "Multisig",
  "code": "already_exists",
  "description": "The call data supplied for storage is already stored on-chain for this multisig operation. Check whether the call bytes were previously stored for this call hash before submitting them again.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/AlreadyStored"
 },
 "AmountTooLow": {
  "pallet": "SubtensorModule",
  "code": "limit_exceeded",
  "description": "A stake, unstake, move or swap amount was zero or its TAO equivalent fell below the minimum stake threshold after fees and slippage. Compare the amount against the `DefaultMinStake` storage item and the subnet's alpha price before retrying with a larger amount.",
  "source": "pallets/subtensor/src/macros/errors.rs#L190",
  "docs": "https://www.bittensor.com/docs/errors/chain/AmountTooLow"
 },
 "AnnouncedColdkeyHashDoesNotMatch": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The `new_coldkey` passed to `swap_coldkey_announced` (`btcli wallet swap-coldkey`) hashes to a different value than the hash committed in the earlier `announce_coldkey_swap` (`btcli wallet announce-coldkey-swap`). Use the same new coldkey you announced; check status with `btcli wallet swap-check`.",
  "source": "pallets/subtensor/src/macros/errors.rs#L162",
  "docs": "https://www.bittensor.com/docs/errors/chain/AnnouncedColdkeyHashDoesNotMatch"
 },
 "AnnouncementDepositInvariantViolated": {
  "pallet": "Proxy",
  "code": "internal",
  "description": "Internal invariant failure in `announce`: recomputing the announcement deposit returned nothing after the pending announcements were updated. Inspect the caller's `Announcements` entry and the announcement deposit constants; this indicates a pallet bug rather than bad input.",
  "source": "pallets/proxy/src/lib.rs#L814",
  "docs": "https://www.bittensor.com/docs/errors/chain/AnnouncementDepositInvariantViolated"
 },
 "ArithmeticOverflow": {
  "pallet": "LimitOrders",
  "code": "internal",
  "description": "Converting a TAO amount to alpha during batched order execution overflowed the fixed-point range, typically when the pool price is tiny relative to the batch's total buy TAO. Check the subnet's current alpha price against the batch's aggregate buy amounts.",
  "source": "pallets/limit-orders/src/lib.rs#L445",
  "docs": "https://www.bittensor.com/docs/errors/chain/ArithmeticOverflow"
 },
 "AuthorizationListTooLarge": {
  "pallet": "EVM",
  "code": "limit_exceeded",
  "description": "The EIP-7702 authorization list exceeds the maximum of 255 entries. Split the authorizations across transactions; oversized lists are rejected before signature recovery.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/AuthorizationListTooLarge"
 },
 "AutoEpochAlreadyImminent": {
  "pallet": "SubtensorModule",
  "code": "already_exists",
  "description": "`trigger_epoch` was called when the next automatic epoch is closer than the `AdminFreezeWindow`, so a manual trigger would have no effect. Check the subnet's tempo and blocks until the next epoch, and simply wait for it to fire.",
  "source": "pallets/subtensor/src/macros/errors.rs#L325",
  "docs": "https://www.bittensor.com/docs/errors/chain/AutoEpochAlreadyImminent"
 },
 "BadEncKeyLen": {
  "pallet": "MevShield",
  "code": "invalid_argument",
  "description": "The `enc_key` passed to `announce_next_key` is not the exact ML-KEM-768 encapsulation key length (1184 bytes). Check the byte length of the `enc_key` argument before announcing.",
  "source": "pallets/shield/src/lib.rs#L234",
  "docs": "https://www.bittensor.com/docs/errors/chain/BadEncKeyLen"
 },
 "BalanceLow": {
  "pallet": "EVM",
  "code": "insufficient_balance",
  "description": "The sender's mapped account cannot cover the transaction's value plus maximum gas fee, detected during validation or when withdrawing the fee. Check the account balance against `value` plus `gas_limit` times the effective gas price.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/BalanceLow"
 },
 "BalanceWithdrawalError": {
  "pallet": "SubtensorModule",
  "code": "insufficient_balance",
  "description": "The requested TAO could not be withdrawn from the coldkey's free balance, typically due to insufficient funds, the existential deposit, or frozen/reserved balance. Check the coldkey's balance with `btcli wallet balance` and reduce the amount or top up.",
  "source": "pallets/subtensor/src/macros/errors.rs#L43",
  "docs": "https://www.bittensor.com/docs/errors/chain/BalanceWithdrawalError"
 },
 "BasketConcentrationCapExceeded": {
  "pallet": "SubtensorModule",
  "code": "limit_exceeded",
  "description": "The `swap_basket` buy would leave the destination holding above the `BasketConcentrationCap` share of fund NAV (holdings marked at realizable value; the cap is u16-normalized, so 4096 means 1/16). Buy less, or spread the fund across more holdings, at the 1/16 cap a traded fund needs at least 16. Query `BasketConcentrationCap` for the live cap. Not enforced while the chain has fewer subnets than the cap demands.",
  "source": "pallets/subtensor/src/macros/errors.rs#L390",
  "docs": "https://www.bittensor.com/docs/errors/chain/BasketConcentrationCapExceeded"
 },
 "BasketDepositPending": {
  "pallet": "SubtensorModule",
  "code": "too_early",
  "description": "A queued root-dividend deposit on this validator could not be settled yet, so an operation that changes the hotkey's root claimant base was refused. No current dispatch raises it; if it appears, wait for the pending deposit to flush (the next claim or basket operation on the hotkey settles it) and retry.",
  "source": "pallets/subtensor/src/macros/errors.rs#L375",
  "docs": "https://www.bittensor.com/docs/errors/chain/BasketDepositPending"
 },
 "BasketHasNoWeights": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "Retired on current runtimes: a basket deposit into a fund with no holdings is held as the fund's root (TAO cash) slot instead of erroring, and root weight vectors no longer exist. Seeing this error means the chain is running an older runtime.",
  "source": "pallets/subtensor/src/macros/errors.rs#L350",
  "docs": "https://www.bittensor.com/docs/errors/chain/BasketHasNoWeights"
 },
 "BasketLiquidityCapExceeded": {
  "pallet": "SubtensorModule",
  "code": "limit_exceeded",
  "description": "The trade would leave the fund holding more of the destination subnet than `BasketLiquidityCap` allows as a share of that subnet's alpha reserve (u16-normalized, default 10%). This bounds the fund's exposure to any one pool's liquidity. Trade a smaller amount, or pick a deeper pool; query `validator_basket` for the current holding and `subnet` for the pool's alpha reserve.",
  "source": "pallets/subtensor/src/macros/errors.rs#L406",
  "docs": "https://www.bittensor.com/docs/errors/chain/BasketLiquidityCapExceeded"
 },
 "BasketMinOutNotMet": {
  "pallet": "SubtensorModule",
  "code": "insufficient_liquidity",
  "description": "The `swap_basket` buy leg credited less than the `min_amount_out` floor you set (destination alpha, or TAO when the destination is netuid 0), so the whole trade rolled back; nothing moved. The pool moved between your quote and execution, or the floor was set above what the trade could ever yield. Re-quote and retry, or widen `--max-slippage` (btcli) / lower `min_amount_out` (SDK). A floor of 0 disables this check; the 2% protocol band still applies.",
  "source": "pallets/subtensor/src/macros/errors.rs#L410",
  "docs": "https://www.bittensor.com/docs/errors/chain/BasketMinOutNotMet"
 },
 "BasketSameSubnet": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "`swap_basket` was called with the same origin and destination netuid. A basket trade sells one holding to buy another; pick two different subnets (netuid 0 is the fund's TAO cash slot).",
  "source": "pallets/subtensor/src/macros/errors.rs#L402",
  "docs": "https://www.bittensor.com/docs/errors/chain/BasketSameSubnet"
 },
 "BasketSwapBatchEmpty": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "`swap_basket_many` was submitted without any trade legs. Include at least one origin/destination/amount leg; one call accepts at most 128 legs.",
  "source": "pallets/subtensor/src/macros/errors.rs#L413",
  "docs": "https://www.bittensor.com/docs/errors/chain/BasketSwapBatchEmpty"
 },
 "BasketTradingDisabled": {
  "pallet": "SubtensorModule",
  "code": "disabled",
  "description": "`swap_basket` is switched off network-wide (`BasketTradingEnabled` is false). Governance opens it with `AdminUtils.sudo_set_basket_trading_enabled`. Deposits, claims, and dividend deployment are unaffected.",
  "source": "pallets/subtensor/src/macros/errors.rs#L392",
  "docs": "https://www.bittensor.com/docs/errors/chain/BasketTradingDisabled"
 },
 "BasketTradingFrozen": {
  "pallet": "SubtensorModule",
  "code": "disabled",
  "description": "Governance froze basket trading for this validator hotkey (`BasketTradingFrozen[hotkey]`), typically after a suspected key compromise. The fund still accepts deposits and pays claims; only `swap_basket` is refused until `AdminUtils.sudo_set_basket_trading_frozen(hotkey, false)`.",
  "source": "pallets/subtensor/src/macros/errors.rs#L395",
  "docs": "https://www.bittensor.com/docs/errors/chain/BasketTradingFrozen"
 },
 "BasketTurnoverBudgetExceeded": {
  "pallet": "SubtensorModule",
  "code": "rate_limited",
  "description": "The trade would push more TAO through the fund than its turnover bucket holds. The bucket's capacity is `BasketDailyTurnoverCap` (u16-normalized share of fund NAV, default 10%); it refills continuously over 7200 blocks and each swap takes the TAO through its middle out of it, so at most one capacity can be traded at any instant. Query `basket_trading_status` for the remaining budget, the capacity, and the refill rate; trade a smaller amount or wait for the bucket to refill.",
  "source": "pallets/subtensor/src/macros/errors.rs#L400",
  "docs": "https://www.bittensor.com/docs/errors/chain/BasketTurnoverBudgetExceeded"
 },
 "BeneficiaryDoesNotOwnHotkey": {
  "pallet": "SubtensorModule",
  "code": "not_authorized",
  "description": "When ending a subnet lease, the hotkey passed for the ownership handover is not owned by the lease's beneficiary coldkey. Check the `Owner` storage for that hotkey and pass a hotkey the beneficiary coldkey actually owns.",
  "source": "pallets/subtensor/src/macros/errors.rs#L241",
  "docs": "https://www.bittensor.com/docs/errors/chain/BeneficiaryDoesNotOwnHotkey"
 },
 "BetaBasketSeedInProgress": {
  "pallet": "SubtensorModule",
  "code": "too_early",
  "description": "The `migrate_seed_beta_basket_v2` seed has not completed (it normally finishes inside the upgrade block, so this only appears if that run was interrupted). Basket deposits, claims, coldkey / root-touching hotkey swaps, and root stake add/remove/transfer/swap are paused until it finishes. Wait until the migration cursor clears (`HasMigrationRun` for the seed) and retry.",
  "source": "pallets/subtensor/src/macros/errors.rs#L359",
  "docs": "https://www.bittensor.com/docs/errors/chain/BetaBasketSeedInProgress"
 },
 "BlockDurationTooLong": {
  "pallet": "Crowdloan",
  "code": "invalid_argument",
  "description": "The requested `end` block is more than `MaximumBlockDuration` blocks after the current block. Compare `end` minus the current block number against the `MaximumBlockDuration` pallet constant when calling `create` or `update_end`.",
  "source": "pallets/crowdloan/src/lib.rs#L251",
  "docs": "https://www.bittensor.com/docs/errors/chain/BlockDurationTooLong"
 },
 "BlockDurationTooShort": {
  "pallet": "Crowdloan",
  "code": "invalid_argument",
  "description": "The requested `end` block is fewer than `MinimumBlockDuration` blocks after the current block. Compare `end` minus the current block number against the `MinimumBlockDuration` pallet constant when calling `create` or `update_end`.",
  "source": "pallets/crowdloan/src/lib.rs#L249",
  "docs": "https://www.bittensor.com/docs/errors/chain/BlockDurationTooShort"
 },
 "BondsMovingAverageMaxReached": {
  "pallet": "AdminUtils",
  "code": "limit_exceeded",
  "description": "A subnet owner called `sudo_set_bonds_moving_average` with a value above 975000, the cap for owner-set values; root is exempt. Lower the `bonds_moving_average` argument or submit the call as root.",
  "source": "pallets/admin-utils/src/lib.rs#L202",
  "docs": "https://www.bittensor.com/docs/errors/chain/BondsMovingAverageMaxReached"
 },
 "BurnEmissionMustBeZero": {
  "pallet": "SubtensorModule",
  "code": "policy_violation",
  "description": "Slot 0 (burn) of the emission weight vector was set to a non-zero share. Burning alpha emission is reserved for a future runtime; in v1 the burn share must be 0 (or simply omitted).",
  "source": "pallets/subtensor/src/macros/errors.rs#L433",
  "docs": "https://www.bittensor.com/docs/errors/chain/BurnEmissionMustBeZero"
 },
 "CallDisabled": {
  "pallet": "SubtensorModule",
  "code": "disabled",
  "description": "The extrinsic has been switched off in the current runtime and cannot be dispatched. There is no active raise site in current code; if seen, check release notes for whether the call was re-enabled in a newer runtime version.",
  "source": "pallets/subtensor/src/macros/errors.rs#L200",
  "docs": "https://www.bittensor.com/docs/errors/chain/CallDisabled"
 },
 "CallFiltered": {
  "pallet": "System",
  "code": "not_authorized",
  "description": "The runtime's origin call filter (e.g. `BaseCallFilter` or a restricted origin) rejected this call before dispatch. Check whether the specific call is permitted for the origin you used, including any proxy or safe-mode filtering in effect.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/CallFiltered"
 },
 "CallUnavailable": {
  "pallet": "Crowdloan",
  "code": "not_found",
  "description": "During `finalize` the crowdloan's stored call could not be fetched from preimage storage, so nothing was dispatched. Check that the preimage referenced by the `call` field of the `Crowdloans` entry still exists in the preimage pallet.",
  "source": "pallets/crowdloan/src/lib.rs#L279",
  "docs": "https://www.bittensor.com/docs/errors/chain/CallUnavailable"
 },
 "CanNotSetRootNetworkWeights": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "`set_weights` was called with netuid 0, the root network, where weight setting is not allowed: root validators do not set weights at all. Use a non-root `netuid` argument.",
  "source": "pallets/subtensor/src/macros/errors.rs#L118",
  "docs": "https://www.bittensor.com/docs/errors/chain/CanNotSetRootNetworkWeights"
 },
 "CannotAddSelfAsDelegateDependency": {
  "pallet": "Contracts",
  "code": "invalid_argument",
  "description": "A contract called `lock_delegate_dependency` with its own code hash, which is not permitted. Check the code hash argument passed to the delegate dependency API against the contract's own code hash.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/CannotAddSelfAsDelegateDependency"
 },
 "CannotAffordLockCost": {
  "pallet": "SubtensorModule",
  "code": "insufficient_balance",
  "description": "The coldkey's free balance cannot cover the current dynamic subnet-creation lock cost. Compare `btcli subnets create-cost` (or `btcli query subnet-registration-cost`) against the coldkey balance from `btcli wallet balance` before registering a subnet.",
  "source": "pallets/subtensor/src/macros/errors.rs#L263",
  "docs": "https://www.bittensor.com/docs/errors/chain/CannotAffordLockCost"
 },
 "CannotBurnOrRecycleOnRootSubnet": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "`recycle_alpha` or `burn_alpha` was called with netuid 0, and TAO on the root subnet cannot be burned or recycled. Pass a non-root `netuid` argument for the subnet whose alpha you want to recycle or burn.",
  "source": "pallets/subtensor/src/macros/errors.rs#L208",
  "docs": "https://www.bittensor.com/docs/errors/chain/CannotBurnOrRecycleOnRootSubnet"
 },
 "CannotEndInPast": {
  "pallet": "Crowdloan",
  "code": "invalid_argument",
  "description": "The `end` block passed to `create` or `update_end` is not after the current block. Compare the `end` argument against the current block number; it must be strictly greater.",
  "source": "pallets/crowdloan/src/lib.rs#L247",
  "docs": "https://www.bittensor.com/docs/errors/chain/CannotEndInPast"
 },
 "CannotReleaseYet": {
  "pallet": "SafeMode",
  "code": "too_early",
  "description": "`release_deposit` was called too early: the current block must exceed the deposit's block plus `ReleaseDelay`, and safe-mode must be exited. Check the block key of the entry in `Deposits` against the `ReleaseDelay` config.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/CannotReleaseYet"
 },
 "CannotUseSystemAccount": {
  "pallet": "SubtensorModule",
  "code": "not_authorized",
  "description": "The hotkey supplied for registration, hotkey swap, or subnet-owner-hotkey assignment is a reserved subnet system account. Use a regular user-generated hotkey instead; system accounts are derived per-subnet and rejected by `is_subnet_account_id`.",
  "source": "pallets/subtensor/src/macros/errors.rs#L311",
  "docs": "https://www.bittensor.com/docs/errors/chain/CannotUseSystemAccount"
 },
 "CapNotRaised": {
  "pallet": "Crowdloan",
  "code": "too_early",
  "description": "`finalize` was called before the crowdloan's `raised` amount equals its `cap`. Compare the `raised` and `cap` fields of the `Crowdloans` entry; contribute the remainder or lower the cap with `update_cap` before finalizing.",
  "source": "pallets/crowdloan/src/lib.rs#L275",
  "docs": "https://www.bittensor.com/docs/errors/chain/CapNotRaised"
 },
 "CapRaised": {
  "pallet": "Crowdloan",
  "code": "limit_exceeded",
  "description": "A contribution was attempted on a crowdloan whose `raised` amount has already reached its `cap`, so no further contributions are accepted. Compare the `raised` and `cap` fields of the `Crowdloans` entry for the `crowdloan_id`.",
  "source": "pallets/crowdloan/src/lib.rs#L259",
  "docs": "https://www.bittensor.com/docs/errors/chain/CapRaised"
 },
 "CapTooLow": {
  "pallet": "Crowdloan",
  "code": "invalid_argument",
  "description": "On `create` the `cap` is not strictly greater than the initial `deposit`, or on `update_cap` the new cap is below the amount already raised. Compare the cap argument against the `deposit` or the `raised` field of the `Crowdloans` entry.",
  "source": "pallets/crowdloan/src/lib.rs#L243",
  "docs": "https://www.bittensor.com/docs/errors/chain/CapTooLow"
 },
 "ChainIdMismatch": {
  "pallet": "LimitOrders",
  "code": "invalid_argument",
  "description": "The order payload's `chain_id` field differs from this chain's configured EVM chain id, e.g. an order signed for testnet was submitted to mainnet. Compare the order's `chain_id` with the runtime's `pallet_evm_chain_id` value and re-sign if needed.",
  "source": "pallets/limit-orders/src/lib.rs#L439",
  "docs": "https://www.bittensor.com/docs/errors/chain/ChainIdMismatch"
 },
 "ChangePending": {
  "pallet": "Grandpa",
  "code": "already_exists",
  "description": "A GRANDPA authority-set change has already been signalled and is still pending, so a new change cannot be scheduled. Check the Grandpa `PendingChange` and `State` storage and wait for the pending change to be applied first.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/ChangePending"
 },
 "ChildParentInconsistency": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "A `set_children` or parent-delegation call would make the same hotkey appear as both a child and a parent, or referenced a child missing from the proposed mapping. Inspect the `ChildKeys` and `ParentKeys` storage for the hotkeys involved and remove the overlap.",
  "source": "pallets/subtensor/src/macros/errors.rs#L275",
  "docs": "https://www.bittensor.com/docs/errors/chain/ChildParentInconsistency"
 },
 "CodeInUse": {
  "pallet": "Contracts",
  "code": "invalid_argument",
  "description": "`remove_code` was refused because at least one contract instance still references the code hash. Check the code's reference count and terminate or `set_code` the contracts using it before removal.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/CodeInUse"
 },
 "CodeInfoNotFound": {
  "pallet": "Contracts",
  "code": "not_found",
  "description": "No `CodeInfoOf` entry exists for the supplied code hash, so its owner and deposit metadata cannot be read. Verify the code hash argument and that the code was uploaded and not since removed.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/CodeInfoNotFound"
 },
 "CodeNotFound": {
  "pallet": "Contracts",
  "code": "not_found",
  "description": "No uploaded WASM binary exists under the supplied code hash. Verify the `code_hash` argument used in instantiation, `set_code`, or a delegate call, and that the code was uploaded via `upload_code` and not removed.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/CodeNotFound"
 },
 "CodeRejected": {
  "pallet": "Contracts",
  "code": "invalid_argument",
  "description": "The uploaded WASM failed validation, most often because it imports a host API the node does not support, e.g. newer ink! against an older node. Rerun the node with `-lruntime::contracts=debug` to see the detailed rejection reason.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/CodeRejected"
 },
 "CodeTooLarge": {
  "pallet": "Contracts",
  "code": "limit_exceeded",
  "description": "The code blob passed to `instantiate_with_code` or `upload_code` exceeds the maximum code length in the pallet's schedule. Compare the WASM binary size against the schedule's code length limit and shrink the contract.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/CodeTooLarge"
 },
 "ColdKeyAlreadyAssociated": {
  "pallet": "SubtensorModule",
  "code": "already_exists",
  "description": "Retired error: coldkey swaps into an already-used destination now merge assets into that coldkey. Current runtimes never return this code; if you still see it, you are on a pre-merge runtime, upgrade, or use a destination without staking hotkeys on the older chain.",
  "source": "pallets/subtensor/src/macros/errors.rs#L142",
  "docs": "https://www.bittensor.com/docs/errors/chain/ColdKeyAlreadyAssociated"
 },
 "ColdkeyCollateralIncomplete": {
  "pallet": "SubtensorModule",
  "code": "internal",
  "description": "A coldkey swap could not fully migrate miner collateral: after migrating every indexed collateral hotkey, the old coldkey's ColdkeyMinerCollateral aggregate was still non-zero. This is a fail-closed invariant, retry after investigating orphaned MinerCollateral rows for that coldkey, or contact runtime maintainers.",
  "source": "pallets/subtensor/src/macros/errors.rs#L342",
  "docs": "https://www.bittensor.com/docs/errors/chain/ColdkeyCollateralIncomplete"
 },
 "ColdkeyCollateralPositionsFull": {
  "pallet": "SubtensorModule",
  "code": "limit_exceeded",
  "description": "This coldkey already has the maximum number of distinct hotkeys with miner collateral on the subnet. Drain or consolidate existing bonds before adding another collateral position.",
  "source": "pallets/subtensor/src/macros/errors.rs#L346",
  "docs": "https://www.bittensor.com/docs/errors/chain/ColdkeyCollateralPositionsFull"
 },
 "ColdkeySwapAlreadyDisputed": {
  "pallet": "SubtensorModule",
  "code": "already_exists",
  "description": "`dispute_coldkey_swap` was called for a coldkey whose pending swap announcement is already under dispute. Check the `ColdkeySwapDisputes` storage for the coldkey; no further dispute action is needed.",
  "source": "pallets/subtensor/src/macros/errors.rs#L164",
  "docs": "https://www.bittensor.com/docs/errors/chain/ColdkeySwapAlreadyDisputed"
 },
 "ColdkeySwapAnnounced": {
  "pallet": "SubtensorModule",
  "code": "disabled",
  "description": "The coldkey has a pending swap announcement, so all but a small allow-list of extrinsics are blocked until the swap completes or is cleared. Check status with `btcli wallet swap-check`, then finish with `btcli wallet swap-coldkey` or clear via `btcli tx clear-coldkey-swap-announcement`.",
  "source": "pallets/subtensor/src/macros/errors.rs#L293",
  "docs": "https://www.bittensor.com/docs/errors/chain/ColdkeySwapAnnounced"
 },
 "ColdkeySwapAnnouncementNotFound": {
  "pallet": "SubtensorModule",
  "code": "not_found",
  "description": "`swap_coldkey_announced`, `dispute_coldkey_swap`, or `clear_coldkey_swap_announcement` was called for a coldkey with no pending announcement. Announce first with `btcli wallet announce-coldkey-swap` (`btcli wallet swap-check` shows status).",
  "source": "pallets/subtensor/src/macros/errors.rs#L156",
  "docs": "https://www.bittensor.com/docs/errors/chain/ColdkeySwapAnnouncementNotFound"
 },
 "ColdkeySwapClearTooEarly": {
  "pallet": "SubtensorModule",
  "code": "too_early",
  "description": "The swap announcement cannot be cleared until the reannouncement delay after the announcement's execution block has passed. Compare the current block with the `when` stored in `ColdkeySwapAnnouncements` plus `ColdkeySwapReannouncementDelay` and retry later.",
  "source": "pallets/subtensor/src/macros/errors.rs#L297",
  "docs": "https://www.bittensor.com/docs/errors/chain/ColdkeySwapClearTooEarly"
 },
 "ColdkeySwapDestinationReservationNotFound": {
  "pallet": "SubtensorModule",
  "code": "not_found",
  "description": "No live coldkey-swap destination reservation exists for this account, so `release_own_coldkey_swap_destination_reservation` has nothing to free. Confirm the account is the reserved destination of an in-flight announcement.",
  "source": "pallets/subtensor/src/macros/errors.rs#L465",
  "docs": "https://www.bittensor.com/docs/errors/chain/ColdkeySwapDestinationReservationNotFound"
 },
 "ColdkeySwapDestinationReserved": {
  "pallet": "SubtensorModule",
  "code": "already_exists",
  "description": "This account is reserved as the destination of an in-flight coldkey-swap announcement, so it cannot be registered as a hotkey and another coldkey cannot announce to it until that announcement is executed, cleared, released by the destination, reset by root, or the reservation TTL expires. Wait for the reservation to clear, have the destination call `release_own_coldkey_swap_destination_reservation`, or choose a different account.",
  "source": "pallets/subtensor/src/macros/errors.rs#L463",
  "docs": "https://www.bittensor.com/docs/errors/chain/ColdkeySwapDestinationReserved"
 },
 "ColdkeySwapDisputed": {
  "pallet": "SubtensorModule",
  "code": "disabled",
  "description": "All extrinsics from this coldkey are blocked because its pending coldkey swap is under dispute. Check the `ColdkeySwapDisputes` storage for the coldkey; the dispute must be resolved by root before the account can transact.",
  "source": "pallets/subtensor/src/macros/errors.rs#L295",
  "docs": "https://www.bittensor.com/docs/errors/chain/ColdkeySwapDisputed"
 },
 "ColdkeySwapReannouncedTooEarly": {
  "pallet": "SubtensorModule",
  "code": "too_early",
  "description": "`announce_coldkey_swap` was called again before the reannouncement delay after the previous announcement's execution block elapsed. Compare the current block with the stored announcement time plus `ColdkeySwapReannouncementDelay` and retry later.",
  "source": "pallets/subtensor/src/macros/errors.rs#L160",
  "docs": "https://www.bittensor.com/docs/errors/chain/ColdkeySwapReannouncedTooEarly"
 },
 "ColdkeySwapTooEarly": {
  "pallet": "SubtensorModule",
  "code": "too_early",
  "description": "`swap_coldkey_announced` (`btcli wallet swap-coldkey`) was executed before the announcement delay had elapsed since `announce_coldkey_swap`. Check remaining blocks with `btcli wallet swap-check` and wait until then.",
  "source": "pallets/subtensor/src/macros/errors.rs#L158",
  "docs": "https://www.bittensor.com/docs/errors/chain/ColdkeySwapTooEarly"
 },
 "ColdkeySwapTooHeavy": {
  "pallet": "SubtensorModule",
  "code": "limit_exceeded",
  "description": "The coldkey stakes through more hotkeys, or holds more stake positions, than one coldkey swap can move. Unstake from or move stake off unused hotkeys and subnets to consolidate, then retry the swap.",
  "source": "pallets/subtensor/src/macros/errors.rs#L385",
  "docs": "https://www.bittensor.com/docs/errors/chain/ColdkeySwapTooHeavy"
 },
 "CollateralDrainRatioOutOfBounds": {
  "pallet": "AdminUtils",
  "code": "invalid_argument",
  "description": "`sudo_set_collateral_drain_ratio` was given a value that is zero, negative, or above `MaxCollateralDrainRatio` (10). The drain ratio must be strictly positive, with no other exit path for miner collateral, a ratio of zero would make locked collateral permanently unrecoverable. Pass a `drain_ratio` in the range (0, 10].",
  "source": "pallets/admin-utils/src/lib.rs#L226",
  "docs": "https://www.bittensor.com/docs/errors/chain/CollateralDrainRatioOutOfBounds"
 },
 "CollateralLockShareTooHigh": {
  "pallet": "AdminUtils",
  "code": "invalid_argument",
  "description": "`sudo_set_collateral_lock_share` was given a value above `MaxCollateralLockShare` (62258, ~95% of u16::MAX). The burned share of the registration price must stay strictly positive so re-registration always pays a nonzero, floating burn. Lower the `lock_share` argument to at most 62258.",
  "source": "pallets/admin-utils/src/lib.rs#L224",
  "docs": "https://www.bittensor.com/docs/errors/chain/CollateralLockShareTooHigh"
 },
 "CommitPayloadTooLarge": {
  "pallet": "SubtensorModule",
  "code": "limit_exceeded",
  "description": "The encrypted weight commit exceeds the subnet's consensus payload limit. Yuma accepts at most 5,000 bytes; Null accepts at most floor(32 KiB / mechanism_count). Reduce the submitted weight row or check the subnet's epoch_consensus setting.",
  "source": "pallets/subtensor/src/macros/errors.rs#L415",
  "docs": "https://www.bittensor.com/docs/errors/chain/CommitPayloadTooLarge"
 },
 "CommitQueueFull": {
  "pallet": "SubtensorModule",
  "code": "limit_exceeded",
  "description": "The subnet's Null timelock queue has reached its shared per-epoch limit of 64 KiB or 64 commits across emission mechanisms. Wait for the next epoch before submitting another commit; the leading eligible validator can preempt lower-priority rows.",
  "source": "pallets/subtensor/src/macros/errors.rs#L417",
  "docs": "https://www.bittensor.com/docs/errors/chain/CommitQueueFull"
 },
 "CommitRevealDisabled": {
  "pallet": "SubtensorModule",
  "code": "disabled",
  "description": "A weight commit or reveal was submitted on a subnet where commit-reveal is turned off. Check the `commit_reveal_weights_enabled` hyperparameter for the netuid (`btcli hparams get --netuid <n>`); use plain `set_weights` instead when it is disabled.",
  "source": "pallets/subtensor/src/macros/errors.rs#L133",
  "docs": "https://www.bittensor.com/docs/errors/chain/CommitRevealDisabled"
 },
 "CommitRevealEnabled": {
  "pallet": "SubtensorModule",
  "code": "disabled",
  "description": "Plain `set_weights` was called on a subnet where commit-reveal is enabled, which requires the commit/reveal flow instead. Check the `commit_reveal_weights_enabled` hyperparameter for the netuid and switch to `commit_weights`/`reveal_weights`.",
  "source": "pallets/subtensor/src/macros/errors.rs#L131",
  "docs": "https://www.bittensor.com/docs/errors/chain/CommitRevealEnabled"
 },
 "CommittingWeightsTooFast": {
  "pallet": "SubtensorModule",
  "code": "rate_limited",
  "description": "The neuron committed weights again before the per-UID rate limit elapsed since its last commit on that subnet. Compare blocks since the last commit against the `weights_rate_limit` hyperparameter (`btcli hparams get --netuid <n>`) and wait.",
  "source": "pallets/subtensor/src/macros/errors.rs#L188",
  "docs": "https://www.bittensor.com/docs/errors/chain/CommittingWeightsTooFast"
 },
 "ContractNotFound": {
  "pallet": "Contracts",
  "code": "not_found",
  "description": "No contract instance exists at the destination address; the account has no `ContractInfoOf` entry. Verify the `dest` address and that the contract was instantiated and has not been terminated.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/ContractNotFound"
 },
 "ContractReverted": {
  "pallet": "Contracts",
  "code": "internal",
  "description": "The contract ran to completion but returned with the REVERT flag set, rolling back its state changes; only extrinsics surface this as an error. Dry-run the call via RPC and decode the returned output data for the contract's error value.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/ContractReverted"
 },
 "ContractTrapped": {
  "pallet": "Contracts",
  "code": "internal",
  "description": "The contract aborted with a WASM trap, e.g. a panic, unreachable instruction, or memory violation, instead of returning normally. Dry-run the call with debug messages enabled and check the input data against the contract's expectations.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/ContractTrapped"
 },
 "ContributionPeriodEnded": {
  "pallet": "Crowdloan",
  "code": "expired",
  "description": "A contribution was made at or after the crowdloan's `end` block. Compare the `end` field of the `Crowdloans` entry with the current block number; the creator can extend it with `update_end` while the crowdloan is not finalized.",
  "source": "pallets/crowdloan/src/lib.rs#L261",
  "docs": "https://www.bittensor.com/docs/errors/chain/ContributionPeriodEnded"
 },
 "ContributionPeriodNotEnded": {
  "pallet": "Crowdloan",
  "code": "too_early",
  "description": "The operation requires the crowdloan's contribution period to be over, but the current block is still before the crowdloan's `end` block. Compare the `end` field of the `Crowdloans` entry for the `crowdloan_id` with the current block number.",
  "source": "pallets/crowdloan/src/lib.rs#L271",
  "docs": "https://www.bittensor.com/docs/errors/chain/ContributionPeriodNotEnded"
 },
 "ContributionTooLow": {
  "pallet": "Crowdloan",
  "code": "invalid_argument",
  "description": "The `amount` passed to `contribute` is below the crowdloan's configured minimum contribution. Check the `min_contribution` field of the `Crowdloans` entry for the `crowdloan_id` and contribute at least that amount.",
  "source": "pallets/crowdloan/src/lib.rs#L263",
  "docs": "https://www.bittensor.com/docs/errors/chain/ContributionTooLow"
 },
 "CreateOriginNotAllowed": {
  "pallet": "EVM",
  "code": "not_authorized",
  "description": "A CREATE, or a CALL that performs a nested CREATE, was attempted from an EVM address not permitted to deploy contracts. Check whether the deploying address is in the chain's allowed-deployers list.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/CreateOriginNotAllowed"
 },
 "CurrencyError": {
  "pallet": "SafeMode",
  "code": "internal",
  "description": "A balance hold, release, or burn inside pallet-safe-mode failed while managing an enter/extend deposit. Check the account's free balance and existing holds under the safe-mode `EnterOrExtend` hold reason.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/CurrencyError"
 },
 "DeadAccount": {
  "pallet": "Balances",
  "code": "not_found",
  "description": "The beneficiary account does not exist and this operation is not allowed to create it. Check `System.Account` for the destination: it must already hold at least the existential deposit before the operation runs.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/DeadAccount"
 },
 "DecodingFailed": {
  "pallet": "Contracts",
  "code": "invalid_argument",
  "description": "Input bytes passed to a contract API host function could not be SCALE-decoded into the expected type. Check the encoding of the call's input data or the argument bytes the contract passes to the runtime API.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/DecodingFailed"
 },
 "DelegateDependencyAlreadyExists": {
  "pallet": "Contracts",
  "code": "already_exists",
  "description": "The contract called `lock_delegate_dependency` for a code hash it has already locked. Check the contract's recorded delegate dependencies before adding, and unlock the old entry first if replacing it.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/DelegateDependencyAlreadyExists"
 },
 "DelegateDependencyNotFound": {
  "pallet": "Contracts",
  "code": "not_found",
  "description": "`unlock_delegate_dependency` was called for a code hash that is not among the contract's locked delegate dependencies. Check the code hash argument against the dependencies recorded in the contract's info.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/DelegateDependencyNotFound"
 },
 "DelegateTakeTooHigh": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The `take` argument exceeds the maximum delegate take allowed by the chain (18% by default). Compare the requested value against the `MaxDelegateTake` storage item and lower it.",
  "source": "pallets/subtensor/src/macros/errors.rs#L124",
  "docs": "https://www.bittensor.com/docs/errors/chain/DelegateTakeTooHigh"
 },
 "DelegateTakeTooLow": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The `take` argument was below the `MinDelegateTake` minimum, or `increase_take`/`decrease_take` was not strictly increasing/decreasing relative to the current take. Check the hotkey's current take in the `Delegates` storage and the `MinDelegateTake` storage item.",
  "source": "pallets/subtensor/src/macros/errors.rs#L122",
  "docs": "https://www.bittensor.com/docs/errors/chain/DelegateTakeTooLow"
 },
 "DelegateTxRateLimitExceeded": {
  "pallet": "SubtensorModule",
  "code": "rate_limited",
  "description": "The delegate changed its take again before the per-hotkey take-change rate limit elapsed. Compare blocks since the hotkey's last take transaction against the `TxDelegateTakeRateLimit` storage item and retry later.",
  "source": "pallets/subtensor/src/macros/errors.rs#L91",
  "docs": "https://www.bittensor.com/docs/errors/chain/DelegateTxRateLimitExceeded"
 },
 "DeltaZero": {
  "pallet": "Balances",
  "code": "invalid_argument",
  "description": "The issuance adjustment was called with a delta of zero, which is meaningless. Check the `delta` argument to `force_adjust_total_issuance` and pass a strictly positive amount.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/DeltaZero"
 },
 "DepositCannotBeWithdrawn": {
  "pallet": "Crowdloan",
  "code": "invalid_argument",
  "description": "The creator called `withdraw` but holds nothing above the initial deposit, which stays locked until the crowdloan is dissolved. Compare the creator's `Contributions` entry with the `deposit` field of the `Crowdloans` entry.",
  "source": "pallets/crowdloan/src/lib.rs#L283",
  "docs": "https://www.bittensor.com/docs/errors/chain/DepositCannotBeWithdrawn"
 },
 "DepositTooLow": {
  "pallet": "Crowdloan",
  "code": "invalid_argument",
  "description": "The `deposit` argument to `create` is below the pallet's required minimum. Check the `MinimumDeposit` pallet constant and create the crowdloan with at least that initial deposit.",
  "source": "pallets/crowdloan/src/lib.rs#L241",
  "docs": "https://www.bittensor.com/docs/errors/chain/DepositTooLow"
 },
 "Deprecated": {
  "pallet": "SubtensorModule",
  "code": "disabled",
  "description": "The extrinsic has been removed and always fails, e.g. `schedule_swap_coldkey`, the swap pallet's user-liquidity calls, `sudo_set_total_issuance`, or the owner-cut setters `sudo_set_subnet_owner_cut` / `sudo_set_owner_cut_enabled` (replaced by `sudo_set_subnet_emission_weights`, `btcli subnets emission`). Migrate to the replacement call noted in the deprecation (for coldkey swaps, `btcli wallet announce-coldkey-swap` then `btcli wallet swap-coldkey`).",
  "source": "pallets/subtensor/src/macros/errors.rs#L285",
  "docs": "https://www.bittensor.com/docs/errors/chain/Deprecated"
 },
 "DisabledTemporarily": {
  "pallet": "SubtensorModule",
  "code": "disabled",
  "description": "The operation has been temporarily switched off in the runtime, usually as a hotfix measure. There is no active raise site in current code; if encountered, check the runtime version and release notes for when the feature is re-enabled.",
  "source": "pallets/subtensor/src/macros/errors.rs#L299",
  "docs": "https://www.bittensor.com/docs/errors/chain/DisabledTemporarily"
 },
 "DrandConnectionFailure": {
  "pallet": "Drand",
  "code": "internal",
  "description": "Declared for failures reaching the drand HTTP API, but pulse fetching happens in the offchain worker, which logs errors instead of raising this. Check the node's offchain worker logs and outbound connectivity to the drand endpoints.",
  "source": "pallets/drand/src/lib.rs#L264",
  "docs": "https://www.bittensor.com/docs/errors/chain/DrandConnectionFailure"
 },
 "Duplicate": {
  "pallet": "Proxy",
  "code": "already_exists",
  "description": "This delegate is already registered as a proxy for the delegator with the same proxy type and delay. Check the delegator's `Proxies` entry before calling `add_proxy` with the same (delegate, proxy type, delay) tuple.",
  "source": "pallets/proxy/src/lib.rs#L806",
  "docs": "https://www.bittensor.com/docs/errors/chain/Duplicate"
 },
 "DuplicateChild": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The children list passed to `set_children` contains the same child hotkey more than once. Deduplicate the `children` argument; current relations are visible in the `ChildKeys` storage for the parent hotkey and netuid.",
  "source": "pallets/subtensor/src/macros/errors.rs#L148",
  "docs": "https://www.bittensor.com/docs/errors/chain/DuplicateChild"
 },
 "DuplicateContract": {
  "pallet": "Contracts",
  "code": "already_exists",
  "description": "Instantiation would create a contract at an address already occupied by an existing contract. Check the derived contract address and vary the `salt` argument to obtain a fresh address.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/DuplicateContract"
 },
 "DuplicateOffenceReport": {
  "pallet": "Grandpa",
  "code": "already_exists",
  "description": "The equivocation proof is valid but this offence has already been reported and recorded. Check whether an equivocation report for the same offender, session, and round was previously submitted before reporting again.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/DuplicateOffenceReport"
 },
 "DuplicateOrderInBatch": {
  "pallet": "LimitOrders",
  "code": "invalid_argument",
  "description": "Two entries in one `execute_batched_orders` call hash to the same order id, meaning the identical signed payload was included twice, which hard-fails the batch. Deduplicate by the blake2-256 hash of each SCALE-encoded `VersionedOrder`.",
  "source": "pallets/limit-orders/src/lib.rs#L447",
  "docs": "https://www.bittensor.com/docs/errors/chain/DuplicateOrderInBatch"
 },
 "DuplicateUids": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The `uids` vector passed to `set_weights` (or a reveal) contains the same UID more than once. Deduplicate the uids/values pairs before submitting; each target neuron may appear only once per weight vector.",
  "source": "pallets/subtensor/src/macros/errors.rs#L53",
  "docs": "https://www.bittensor.com/docs/errors/chain/DuplicateUids"
 },
 "DynamicTempoBlockedByCommitReveal": {
  "pallet": "SubtensorModule",
  "code": "disabled",
  "description": "`trigger_epoch` is refused while commit-reveal is enabled on the subnet, because an out-of-band epoch would desync the CRv3 reveal window from the Drand schedule and drop committed weights. Check the `commit_reveal_weights_enabled` hyperparameter; disable it before manually triggering epochs.",
  "source": "pallets/subtensor/src/macros/errors.rs#L329",
  "docs": "https://www.bittensor.com/docs/errors/chain/DynamicTempoBlockedByCommitReveal"
 },
 "EmissionWeightIndexDuplicated": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "`sudo_set_subnet_emission_weights` listed the same slot index twice in `uids`. Give each slot at most once per call.",
  "source": "pallets/subtensor/src/macros/errors.rs#L427",
  "docs": "https://www.bittensor.com/docs/errors/chain/EmissionWeightIndexDuplicated"
 },
 "EmissionWeightIndexOutOfRange": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "`sudo_set_subnet_emission_weights` named a slot index outside the five-slot emission weight vector. Valid indices are 0 = burn, 1 = recycle, 2 = owner, 3 = validator, 4 = miner; later slots (e.g. gamma buys) are reserved for a future runtime.",
  "source": "pallets/subtensor/src/macros/errors.rs#L425",
  "docs": "https://www.bittensor.com/docs/errors/chain/EmissionWeightIndexOutOfRange"
 },
 "EmissionWeightsDoNotSumToOne": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "After merging your update into the subnet's current emission weight vector, the five shares do not sum to exactly `u64::MAX` (1.0). Omitted slots keep their current value, so raising one slot requires lowering another in the same call. `btcli subnets emission set-value/increase/decrease` renormalise the other slots for you; with the raw call, pass a full `[0, 0, owner, validator, miner]` vector whose parts total 18446744073709551615.",
  "source": "pallets/subtensor/src/macros/errors.rs#L431",
  "docs": "https://www.bittensor.com/docs/errors/chain/EmissionWeightsDoNotSumToOne"
 },
 "EmissionWeightsLengthMismatch": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "`sudo_set_subnet_emission_weights` was given `uids` and `values` lists of different lengths. Each slot index in `uids` needs exactly one share in `values`; pass the two lists pairwise (e.g. `uids=[2, 3, 4]`, `values=[owner, validator, miner]`).",
  "source": "pallets/subtensor/src/macros/errors.rs#L422",
  "docs": "https://www.bittensor.com/docs/errors/chain/EmissionWeightsLengthMismatch"
 },
 "EmissionWeightsNotSettableOnRoot": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "`sudo_set_subnet_emission_weights` was called for netuid 0. The root network has no alpha emission to divide, so it carries no emission weight vector; pass a subnet netuid.",
  "source": "pallets/subtensor/src/macros/errors.rs#L457",
  "docs": "https://www.bittensor.com/docs/errors/chain/EmissionWeightsNotSettableOnRoot"
 },
 "Entered": {
  "pallet": "SafeMode",
  "code": "already_exists",
  "description": "Safe-mode is currently active, so `enter` or `force_enter` cannot activate it again and `release_deposit` is blocked until it exits. Check `EnteredUntil` for the block at which safe-mode disengages.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/Entered"
 },
 "EpochTriggerAlreadyPending": {
  "pallet": "SubtensorModule",
  "code": "already_exists",
  "description": "`trigger_epoch` was called while a previously triggered epoch is still queued for this subnet. Check the `PendingEpochAt` storage for the netuid and wait for the pending epoch to fire before triggering again.",
  "source": "pallets/subtensor/src/macros/errors.rs#L322",
  "docs": "https://www.bittensor.com/docs/errors/chain/EpochTriggerAlreadyPending"
 },
 "EvmKeyAssociateRateLimitExceeded": {
  "pallet": "SubtensorModule",
  "code": "rate_limited",
  "description": "`associate_evm_key` was called again before the per-UID rate limit since the last association elapsed. Compare blocks since the association recorded in the `AssociatedEvmAddress` storage against the `EvmKeyAssociateRateLimit` runtime constant and retry later.",
  "source": "pallets/subtensor/src/macros/errors.rs#L265",
  "docs": "https://www.bittensor.com/docs/errors/chain/EvmKeyAssociateRateLimitExceeded"
 },
 "EvmKeyAssociationLimitExceeded": {
  "pallet": "SubtensorModule",
  "code": "limit_exceeded",
  "description": "The EVM address is already associated with the maximum number of UIDs allowed on this subnet. Inspect the `AssociatedUidsByEvmAddress` storage for the (netuid, evm_key) pair and free a slot or use a different EVM address.",
  "source": "pallets/subtensor/src/macros/errors.rs#L267",
  "docs": "https://www.bittensor.com/docs/errors/chain/EvmKeyAssociationLimitExceeded"
 },
 "ExistentialDeposit": {
  "pallet": "Balances",
  "code": "insufficient_balance",
  "description": "The amount is too small to create the destination account: its resulting balance would sit below the existential deposit. Compare the transfer value plus the destination's current free balance against the `ExistentialDeposit` constant.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/ExistentialDeposit"
 },
 "ExistingVestingSchedule": {
  "pallet": "Balances",
  "code": "already_exists",
  "description": "A vesting schedule already exists for the target account and this call cannot add another. Check the account's `Vesting` storage entry before attempting to set a new vested transfer or schedule.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/ExistingVestingSchedule"
 },
 "Exited": {
  "pallet": "SafeMode",
  "code": "already_exists",
  "description": "Safe-mode is not currently active, so `extend`, `force_extend`, or `force_exit` have nothing to act on. Check that `EnteredUntil` contains a value before extending or exiting.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/Exited"
 },
 "ExpectedBeneficiaryOrigin": {
  "pallet": "SubtensorModule",
  "code": "not_authorized",
  "description": "A lease operation such as terminating a subnet lease was signed by an account other than the lease's beneficiary coldkey. Check the beneficiary recorded in the `SubnetLeases` storage for the lease id and sign with that coldkey.",
  "source": "pallets/subtensor/src/macros/errors.rs#L243",
  "docs": "https://www.bittensor.com/docs/errors/chain/ExpectedBeneficiaryOrigin"
 },
 "Expendability": {
  "pallet": "Balances",
  "code": "insufficient_balance",
  "description": "The transfer or payment would drop the sender below the existential deposit and kill the account while keep-alive semantics are required. Compare the sender's free balance minus the amount and fees against `ExistentialDeposit`, or use `transfer_allow_death` if reaping is acceptable.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/Expendability"
 },
 "ExpiredWeightCommit": {
  "pallet": "SubtensorModule",
  "code": "expired",
  "description": "The hash supplied to `reveal_weights` matches a commit whose reveal window has already passed, so it can no longer be revealed. Check the `commit_reveal_period` hyperparameter and reveal within the allowed epochs after committing; re-commit and reveal on time.",
  "source": "pallets/subtensor/src/macros/errors.rs#L182",
  "docs": "https://www.bittensor.com/docs/errors/chain/ExpiredWeightCommit"
 },
 "FailedToExtractRuntimeVersion": {
  "pallet": "System",
  "code": "invalid_argument",
  "description": "The new runtime code passed to `set_code` did not yield a readable version: calling `Core_version` or decoding `RuntimeVersion` failed. Check that the submitted blob is a valid, complete runtime wasm and not truncated or compressed incorrectly.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/FailedToExtractRuntimeVersion"
 },
 "FailedToSchedule": {
  "pallet": "Scheduler",
  "code": "internal",
  "description": "The scheduler could not place the call into the agenda, typically because the target block's agenda is full or the schedule parameters are unusable. Check `Agenda` at the target block against `MaxScheduledPerBlock` and pick a different block if it is saturated.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/FailedToSchedule"
 },
 "FaucetDisabled": {
  "pallet": "SubtensorModule",
  "code": "disabled",
  "description": "The `faucet` extrinsic was called on a runtime built without the pow-faucet feature, i.e. any real network. The faucet only works on local test chains compiled with that feature; use a funded wallet or testnet TAO instead.",
  "source": "pallets/subtensor/src/macros/errors.rs#L103",
  "docs": "https://www.bittensor.com/docs/errors/chain/FaucetDisabled"
 },
 "FeeOverflow": {
  "pallet": "EVM",
  "code": "internal",
  "description": "Fee arithmetic overflowed, either multiplying the fee per gas by `gas_limit` or converting the EVM fee into Substrate balance decimals. Check for absurdly large `gas_limit` or fee-per-gas values in the transaction.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/FeeOverflow"
 },
 "FeeRateTooHigh": {
  "pallet": "Swap",
  "code": "invalid_argument",
  "description": "`set_fee_rate` was called with a rate above the swap pallet's `MaxFeeRate` config constant. Compare the `rate` argument (u16-scaled fraction) against `MaxFeeRate` before submitting.",
  "source": "pallets/swap/src/pallet/mod.rs#L146",
  "docs": "https://www.bittensor.com/docs/errors/chain/FeeRateTooHigh"
 },
 "FirstEmissionBlockNumberAlreadySet": {
  "pallet": "SubtensorModule",
  "code": "already_exists",
  "description": "`btcli hparams start` was issued for a subnet whose emissions have already been started. Check with `btcli hparams check-start`; if the subnet is already emitting, no action is needed.",
  "source": "pallets/subtensor/src/macros/errors.rs#L202",
  "docs": "https://www.bittensor.com/docs/errors/chain/FirstEmissionBlockNumberAlreadySet"
 },
 "FundsNotSettled": {
  "pallet": "Crowdloan",
  "code": "policy_violation",
  "description": "`finalize` ran the configured `call`, but the raised funds were still in the crowdloan's funds account afterwards, so finalization was refused. This happens when the call does not spend the raised amount, or when a wrapper such as `Utility.batch` returns Ok after its inner call failed. Fix the finalization call so it consumes the full `raised` amount, then `finalize` again.",
  "source": "pallets/crowdloan/src/lib.rs#L295",
  "docs": "https://www.bittensor.com/docs/errors/chain/FundsNotSettled"
 },
 "GasLimitTooHigh": {
  "pallet": "EVM",
  "code": "invalid_argument",
  "description": "The transaction's `gas_limit` exceeds the block gas limit configured for the EVM. Compare the `gas_limit` argument against the chain's block gas limit and lower it.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/GasLimitTooHigh"
 },
 "GasLimitTooLow": {
  "pallet": "EVM",
  "code": "invalid_argument",
  "description": "The transaction's `gas_limit` is below the intrinsic gas required, or too small to cover the weight and proof-size base cost. Raise the `gas_limit` argument, comparing against an `eth_estimateGas` result.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/GasLimitTooLow"
 },
 "GasPriceTooLow": {
  "pallet": "EVM",
  "code": "invalid_argument",
  "description": "The offered fee cannot satisfy the current base fee: `max_fee_per_gas` is below the block base fee, the priority fee exceeds the max fee, or the fee inputs are inconsistent. Check `max_fee_per_gas` and `max_priority_fee_per_gas` against the chain's base fee.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/GasPriceTooLow"
 },
 "GrandpaChangeDelayMustBeZero": {
  "pallet": "AdminUtils",
  "code": "invalid_argument",
  "description": "`schedule_grandpa_change` was given a nonzero `in_blocks` delay. GRANDPA authority changes submitted through AdminUtils must activate at the end of the current block so the authority set and its set ID remain consistent. Pass `in_blocks=0`.",
  "source": "pallets/admin-utils/src/lib.rs#L228",
  "docs": "https://www.bittensor.com/docs/errors/chain/GrandpaChangeDelayMustBeZero"
 },
 "HotKeyAccountNotExists": {
  "pallet": "SubtensorModule",
  "code": "not_registered",
  "description": "The hotkey has no on-chain account, meaning it was never created through registration, so staking or delegation operations cannot reference it. Check the `Owner` storage for the hotkey or `btcli wallet registrations`; register the hotkey on a subnet first.",
  "source": "pallets/subtensor/src/macros/errors.rs#L21",
  "docs": "https://www.bittensor.com/docs/errors/chain/HotKeyAccountNotExists"
 },
 "HotKeyAlreadyDelegate": {
  "pallet": "SubtensorModule",
  "code": "already_exists",
  "description": "`become_delegate` was called for a hotkey that is already a delegate. Check the `Delegates` storage for the hotkey; if it has a take entry it is already delegating and no action is needed.",
  "source": "pallets/subtensor/src/macros/errors.rs#L79",
  "docs": "https://www.bittensor.com/docs/errors/chain/HotKeyAlreadyDelegate"
 },
 "HotKeyAlreadyRegisteredInSubNet": {
  "pallet": "SubtensorModule",
  "code": "already_exists",
  "description": "A registration or hotkey swap targeted a hotkey that already holds a UID on the subnet (or, for a swap without a netuid, on any subnet). Check the `Uids` storage for the (netuid, hotkey) pair or `btcli wallet registrations`; use a different hotkey or netuid.",
  "source": "pallets/subtensor/src/macros/errors.rs#L63",
  "docs": "https://www.bittensor.com/docs/errors/chain/HotKeyAlreadyRegisteredInSubNet"
 },
 "HotKeyNotRegisteredInNetwork": {
  "pallet": "SubtensorModule",
  "code": "not_registered",
  "description": "The hotkey is not registered on the relevant subnet, raised by `serve_axon`/`serve_prometheus` for the serving netuid or by identity calls requiring registration on any subnet. Verify registration with `btcli wallet registrations` (or `btcli query uid --netuid <n>` / `btcli query netuids-for-hotkey`) and register via `btcli subnets register` first.",
  "source": "pallets/subtensor/src/macros/errors.rs#L23",
  "docs": "https://www.bittensor.com/docs/errors/chain/HotKeyNotRegisteredInNetwork"
 },
 "HotKeyNotRegisteredInSubNet": {
  "pallet": "SubtensorModule",
  "code": "not_registered",
  "description": "The hotkey holds no UID on the given netuid, so weight setting, commits, or UID lookups fail there. Check the `Uids` storage for the (netuid, hotkey) pair or `btcli query uid --netuid <n>`; confirm the netuid argument and register the hotkey if needed.",
  "source": "pallets/subtensor/src/macros/errors.rs#L19",
  "docs": "https://www.bittensor.com/docs/errors/chain/HotKeyNotRegisteredInSubNet"
 },
 "HotKeySetTxRateLimitExceeded": {
  "pallet": "SubtensorModule",
  "code": "rate_limited",
  "description": "The coldkey attempted a hotkey set/swap before `TxRateLimit` blocks had passed since its last such transaction. Check the coldkey's last transaction block against the `TxRateLimit` storage value and wait the remaining blocks.",
  "source": "pallets/subtensor/src/macros/errors.rs#L93",
  "docs": "https://www.bittensor.com/docs/errors/chain/HotKeySetTxRateLimitExceeded"
 },
 "HotKeySwapOnSubnetIntervalNotPassed": {
  "pallet": "SubtensorModule",
  "code": "rate_limited",
  "description": "A hotkey swap on a subnet was attempted before `HotkeySwapOnSubnetInterval` blocks passed since the coldkey's last swap on that netuid. Compare `LastHotkeySwapOnNetuid` for the coldkey with the current block and retry after the interval.",
  "source": "pallets/subtensor/src/macros/errors.rs#L216",
  "docs": "https://www.bittensor.com/docs/errors/chain/HotKeySwapOnSubnetIntervalNotPassed"
 },
 "IncorrectCommitRevealVersion": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The `commit_reveal_version` argument does not match the chain's current commit-reveal weights version. Query the `CommitRevealWeightsVersion` storage item and upgrade or configure the client to commit with that version.",
  "source": "pallets/subtensor/src/macros/errors.rs#L251",
  "docs": "https://www.bittensor.com/docs/errors/chain/IncorrectCommitRevealVersion"
 },
 "IncorrectPartialFillAmount": {
  "pallet": "LimitOrders",
  "code": "invalid_argument",
  "description": "The `partial_fill` amount is zero or exceeds the order's remaining unfilled amount, or a full execution was submitted against an order already partially filled. Compare `partial_fill` with `order.amount` minus the filled amount recorded in `Orders`.",
  "source": "pallets/limit-orders/src/lib.rs#L435",
  "docs": "https://www.bittensor.com/docs/errors/chain/IncorrectPartialFillAmount"
 },
 "IncorrectWeightVersionKey": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The `version_key` supplied with set_weights is older than the subnet's required weights version. Compare it against the `WeightsVersionKey` hyperparameter (`btcli hparams get --netuid <n>`) and update the validator software or the key.",
  "source": "pallets/subtensor/src/macros/errors.rs#L83",
  "docs": "https://www.bittensor.com/docs/errors/chain/IncorrectWeightVersionKey"
 },
 "Indeterministic": {
  "pallet": "Contracts",
  "code": "invalid_argument",
  "description": "Code flagged as non-deterministic (e.g. using floating point) was used where determinism is enforced, such as on-chain instantiation or calls. Check the determinism mode the code was uploaded with and rebuild the contract deterministically.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/Indeterministic"
 },
 "InputForwarded": {
  "pallet": "Contracts",
  "code": "invalid_argument",
  "description": "The contract forwarded its input to a callee via `seal_call` with the FORWARD_INPUT flag and then tried to read or forward it again. Check the call flags used; use CLONE_INPUT when the input is still needed afterwards.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/InputForwarded"
 },
 "InputLengthsUnequal": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "A batch weights call passed vectors of different lengths, e.g. netuids vs commit hashes, or uids vs values, salts and version_keys in batch reveal. Check that every parallel vector argument in the batch extrinsic has the same length.",
  "source": "pallets/subtensor/src/macros/errors.rs#L186",
  "docs": "https://www.bittensor.com/docs/errors/chain/InputLengthsUnequal"
 },
 "InsufficientAlphaBalance": {
  "pallet": "SubtensorModule",
  "code": "insufficient_balance",
  "description": "A stake decrease asked to debit more alpha than the hotkey-coldkey pair holds on that subnet. Compare the requested amount against the pair's current stake on the netuid (`btcli stake list` or the `Alpha` storage entry).",
  "source": "pallets/subtensor/src/macros/errors.rs#L337",
  "docs": "https://www.bittensor.com/docs/errors/chain/InsufficientAlphaBalance"
 },
 "InsufficientBalance": {
  "pallet": "Balances",
  "code": "insufficient_balance",
  "description": "The caller's spendable balance is below what the operation needs, whether a plain transfer, a crowdloan deposit or contribution, or a swap. Compare the account's free balance in `System.Account` (net of holds, freezes, and fees) against the amount being moved.",
  "source": "pallets/crowdloan/src/lib.rs#L253",
  "docs": "https://www.bittensor.com/docs/errors/chain/InsufficientBalance"
 },
 "InsufficientInputAmount": {
  "pallet": "Swap",
  "code": "invalid_argument",
  "description": "Declared for swap inputs too small to execute, but no current code path raises it since the user-liquidity code was removed. If seen on an older runtime, check that the swap input amount is nonzero and large enough to produce output.",
  "source": "pallets/swap/src/pallet/mod.rs#L149",
  "docs": "https://www.bittensor.com/docs/errors/chain/InsufficientInputAmount"
 },
 "InsufficientLiquidity": {
  "pallet": "SubtensorModule",
  "code": "insufficient_liquidity",
  "description": "The pool cannot absorb the operation: the swap simulation failed, reserves are smaller than the payout, or the amount exceeds the pool's supported input. Check the subnet pool reserves `SubnetTAO`, `SubnetAlphaIn` and `SubnetAlphaOut` against the amount.",
  "source": "pallets/subtensor/src/macros/errors.rs#L192",
  "docs": "https://www.bittensor.com/docs/errors/chain/InsufficientLiquidity"
 },
 "InsufficientStakeForLock": {
  "pallet": "SubtensorModule",
  "code": "insufficient_balance",
  "description": "The requested lock amount exceeds the coldkey's total alpha stake on that subnet (existing locked mass included). Compare the amount against the coldkey's stake on the netuid, e.g. via `btcli stake list`, and lock less or add stake first.",
  "source": "pallets/subtensor/src/macros/errors.rs#L305",
  "docs": "https://www.bittensor.com/docs/errors/chain/InsufficientStakeForLock"
 },
 "InsufficientTaoBalance": {
  "pallet": "SubtensorModule",
  "code": "insufficient_balance",
  "description": "The coldkey's free TAO balance is below the amount a TAO-side operation needs: a transfer between coldkeys, a burn or recycle, or a subnet-registration lock. Check the coldkey's balance with `btcli wallet balance` against the amount being moved.",
  "source": "pallets/subtensor/src/macros/errors.rs#L225",
  "docs": "https://www.bittensor.com/docs/errors/chain/InsufficientTaoBalance"
 },
 "InvalidBatchLength": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "A per-subnet weight batch (`batch_set_weights`, `batch_commit_weights`, `batch_reveal_weights`) was empty or had more items than there are networks. Send at least one item and at most one per subnet.",
  "source": "pallets/subtensor/src/macros/errors.rs#L377",
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidBatchLength"
 },
 "InvalidCallFlags": {
  "pallet": "Contracts",
  "code": "invalid_argument",
  "description": "The flags bitmask given to `seal_call` or `seal_delegate_call` contains an unknown or disallowed combination; delegate calls accept only a restricted flag set. Check the flags argument against the supported `CallFlags` bit values.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidCallFlags"
 },
 "InvalidChainId": {
  "pallet": "EVM",
  "code": "invalid_argument",
  "description": "The EIP-155 chain id encoded in the signed transaction does not match this chain's configured chain id. Compare the transaction's chain id with the value returned by `eth_chainId` and re-sign the transaction.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidChainId"
 },
 "InvalidChild": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The children or parents list includes the pivot hotkey itself (a self-loop), including during a hotkey swap when the new hotkey is already a child or parent of the old one. Check the `children` argument and `ChildKeys`/`ParentKeys` for the hotkeys involved.",
  "source": "pallets/subtensor/src/macros/errors.rs#L146",
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidChild"
 },
 "InvalidChildkeyTake": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The childkey take is outside the allowed range for the subnet: below the effective minimum or above `MaxChildkeyTake`. Query `MinChildkeyTake` and `MaxChildkeyTake` and pick a `take` value within those bounds.",
  "source": "pallets/subtensor/src/macros/errors.rs#L168",
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidChildkeyTake"
 },
 "InvalidCrowdloanId": {
  "pallet": "Crowdloan",
  "code": "not_found",
  "description": "No crowdloan exists in the `Crowdloans` storage map for the given `crowdloan_id`; it was never created or has been dissolved. Check `Crowdloans` for the id and `NextCrowdloanId` for the range of ids ever issued.",
  "source": "pallets/crowdloan/src/lib.rs#L257",
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidCrowdloanId"
 },
 "InvalidDerivedAccount": {
  "pallet": "Utility",
  "code": "invalid_argument",
  "description": "Deriving the sub-account for `as_derivative` failed to decode into a valid account id from the (caller, index) entropy. Check the `index` argument and the caller account used for derivation.",
  "source": "pallets/utility/src/lib.rs#L171",
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidDerivedAccount"
 },
 "InvalidDerivedAccountId": {
  "pallet": "Proxy",
  "code": "invalid_argument",
  "description": "Deriving the pure proxy account id from the provided entropy failed to decode into a valid account. Check the spawner, `proxy_type`, and `index` arguments used with `create_pure` (or the equivalent lookup when destroying one).",
  "source": "pallets/proxy/src/lib.rs#L816",
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidDerivedAccountId"
 },
 "InvalidDifficulty": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The submitted proof-of-work hash does not meet the required difficulty (the faucet uses a fixed 1,000,000; PoW registration uses the subnet's difficulty). Check the `Difficulty` storage for the netuid and regenerate work against the current block.",
  "source": "pallets/subtensor/src/macros/errors.rs#L72",
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidDifficulty"
 },
 "InvalidEquivocationProof": {
  "pallet": "Grandpa",
  "code": "invalid_argument",
  "description": "The submitted GRANDPA equivocation proof does not demonstrate a real double-vote: the two votes may be identical, from different rounds or set ids, or badly signed. Verify the proof contains two distinct votes by the same authority in the same round and authority set.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidEquivocationProof"
 },
 "InvalidFinalizationConfig": {
  "pallet": "Crowdloan",
  "code": "invalid_argument",
  "description": "Exactly one of `call` or `target_address` must be set, but both or neither were provided to `create`, or the stored crowdloan holds an inconsistent pair at `finalize` time. Check those two fields on the `create` arguments or the `Crowdloans` entry.",
  "source": "pallets/crowdloan/src/lib.rs#L287",
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidFinalizationConfig"
 },
 "InvalidIdentity": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The submitted coldkey or subnet identity failed validation, typically a field exceeding its allowed byte length or malformed data. Check each identity field's length against the limits enforced by the chain before calling set_identity or set_subnet_identity.",
  "source": "pallets/subtensor/src/macros/errors.rs#L172",
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidIdentity"
 },
 "InvalidIpAddress": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The `ip` argument to serve_axon or serve_prometheus is not a valid address for the declared `ip_type` (prometheus additionally rejects the zero address). Verify the IP encodes correctly as IPv4 or IPv6 and matches the `ip_type` passed.",
  "source": "pallets/subtensor/src/macros/errors.rs#L15",
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidIpAddress"
 },
 "InvalidIpType": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The `ip_type` argument to serve_axon or serve_prometheus is not 4 or 6. Check the value being sent by the miner or client; only IPv4 (4) and IPv6 (6) are accepted.",
  "source": "pallets/subtensor/src/macros/errors.rs#L13",
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidIpType"
 },
 "InvalidKeyOwnershipProof": {
  "pallet": "Grandpa",
  "code": "invalid_argument",
  "description": "The key ownership proof does not establish that the offending GRANDPA key belonged to the claimed validator at that session. Regenerate the proof via the `generate_key_ownership_proof` runtime API for the exact set id and authority id in the report.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidKeyOwnershipProof"
 },
 "InvalidLeaseBeneficiary": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The account registering a leased network is not the creator of the crowdloan currently being finalized. Check the crowdloan's `creator` field in the crowdloan pallet storage and submit the call from that coldkey.",
  "source": "pallets/subtensor/src/macros/errors.rs#L227",
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidLeaseBeneficiary"
 },
 "InvalidLiquidityValue": {
  "pallet": "Swap",
  "code": "invalid_argument",
  "description": "Legacy error from the removed V3 user-liquidity code, raised when an added or removed liquidity amount was below the pallet's `MinimumLiquidity`. Not raised on current runtimes; on older ones compare the `liquidity` argument to `MinimumLiquidity`.",
  "source": "pallets/swap/src/pallet/mod.rs#L164",
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidLiquidityValue"
 },
 "InvalidNonce": {
  "pallet": "EVM",
  "code": "invalid_argument",
  "description": "The transaction nonce does not match the sender's current account nonce, being either too low (already used) or too high. Compare the transaction's `nonce` with the sender's on-chain nonce from `eth_getTransactionCount`.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidNonce"
 },
 "InvalidOrigin": {
  "pallet": "Crowdloan",
  "code": "not_authorized",
  "description": "The caller is not the crowdloan's creator, which is required for `finalize`, `refund`, `dissolve`, and the update calls. Compare the signing account with the `creator` field of the `Crowdloans` entry for the `crowdloan_id`.",
  "source": "pallets/crowdloan/src/lib.rs#L265",
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidOrigin"
 },
 "InvalidPort": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The `port` argument to serve_axon or serve_prometheus is 0, which is rejected. Check the miner or client axon configuration and serve on a non-zero port.",
  "source": "pallets/subtensor/src/macros/errors.rs#L17",
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidPort"
 },
 "InvalidRecoveredPublicKey": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The EVM key association signature recovered to a public key whose keccak hash does not equal the supplied `evm_key`. Verify the signature was produced by the claimed EVM key over the hotkey plus block hash message (EIP-191 format).",
  "source": "pallets/subtensor/src/macros/errors.rs#L212",
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidRecoveredPublicKey"
 },
 "InvalidRevealCommitHashNotMatch": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The revealed uids, values, salt and version_key hash to a value that matches none of the hotkey's pending non-expired commits. Check that the reveal parameters and salt exactly match what was committed, and inspect `WeightCommits` for the hotkey and netuid.",
  "source": "pallets/subtensor/src/macros/errors.rs#L129",
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidRevealCommitHashNotMatch"
 },
 "InvalidRevealRound": {
  "pallet": "SubtensorModule",
  "code": "expired",
  "description": "A timelocked weights commit specified a `reveal_round` older than the latest stored DRAND round, so it could be decrypted immediately. Query the drand pallet's `LastStoredRound` and commit with a future round number.",
  "source": "pallets/subtensor/src/macros/errors.rs#L253",
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidRevealRound"
 },
 "InvalidRootClaimThreshold": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The value passed to set the root claim threshold exceeds the chain's maximum allowed threshold. Check the `new_value` argument against the `MAX_ROOT_CLAIM_THRESHOLD` constant and the current `RootClaimableThreshold` for the netuid.",
  "source": "pallets/subtensor/src/macros/errors.rs#L277",
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidRootClaimThreshold"
 },
 "InvalidRoundNumber": {
  "pallet": "Drand",
  "code": "invalid_argument",
  "description": "A submitted drand pulse has an unacceptable round: the first pulse ever stored must have a round greater than zero, and each later pulse must be exactly `LastStoredRound` plus one. Compare the pulse round against `LastStoredRound`.",
  "source": "pallets/drand/src/lib.rs#L268",
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidRoundNumber"
 },
 "InvalidSchedule": {
  "pallet": "Contracts",
  "code": "invalid_argument",
  "description": "The pallet's schedule is misconfigured, e.g. a zero weight or zero `ref_time_by_fuel` for a basic operation, making gas conversion impossible. This is a runtime configuration issue; inspect the `Schedule` constant rather than call arguments.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidSchedule"
 },
 "InvalidSeal": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The seal hash recomputed from the supplied `block_number`, `nonce` and key does not equal the submitted `work`. Verify the PoW solver built the seal for the same key and block it submits, and that the work bytes were not corrupted in transit.",
  "source": "pallets/subtensor/src/macros/errors.rs#L74",
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidSeal"
 },
 "InvalidSignature": {
  "pallet": "Ethereum",
  "code": "invalid_argument",
  "description": "Signature verification failed: the sender of an Ethereum or EVM transaction could not be recovered from its signature, or a limit order's Sr25519 signature does not match the order payload and signer. Check the signing key, chain id, and the exact payload bytes that were signed.",
  "source": "pallets/limit-orders/src/lib.rs#L411",
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidSignature"
 },
 "InvalidSpecName": {
  "pallet": "System",
  "code": "invalid_argument",
  "description": "The new runtime's `spec_name` does not match the current runtime, so `set_code` refuses the upgrade. Check the `RuntimeVersion` embedded in the new wasm and ensure the spec name is identical to the chain's current one.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidSpecName"
 },
 "InvalidTickRange": {
  "pallet": "Swap",
  "code": "invalid_argument",
  "description": "Legacy error from the removed V3 user-liquidity code, raised when `tick_low` was not below `tick_high` or a tick failed to convert to a sqrt price. Not raised on current runtimes; check the tick range arguments on older ones.",
  "source": "pallets/swap/src/pallet/mod.rs#L161",
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidTickRange"
 },
 "InvalidValue": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "A generic out-of-range parameter on an admin or sudo call, e.g. mechanism counts, emission splits summing away from 65535, max UIDs or take bounds. Check the specific argument against the min/max storage items the extrinsic validates (e.g. `MinAllowedUids`, `MaxMechanismCount`).",
  "source": "pallets/subtensor/src/macros/errors.rs#L259",
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidValue"
 },
 "InvalidVotingPowerEmaAlpha": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The alpha passed to set the voting power EMA exceeds 10^18, which represents 1.0. Check the `alpha` argument to sudo_set_voting_power_ema_alpha; it must be at most 10^18, and the current value is in `VotingPowerEmaAlpha` per netuid.",
  "source": "pallets/subtensor/src/macros/errors.rs#L283",
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidVotingPowerEmaAlpha"
 },
 "InvalidWorkBlock": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The `block_number` in the proof-of-work submission is in the future or more than 3 blocks old, so the work is stale. Compare the submitted block number with the current chain height and regenerate the PoW against a fresh block.",
  "source": "pallets/subtensor/src/macros/errors.rs#L70",
  "docs": "https://www.bittensor.com/docs/errors/chain/InvalidWorkBlock"
 },
 "IssuanceDeactivated": {
  "pallet": "Balances",
  "code": "disabled",
  "description": "Total issuance cannot be adjusted because issuance has already been deactivated. Check the Balances `InactiveIssuance` state before calling `force_adjust_total_issuance` again.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/IssuanceDeactivated"
 },
 "KeepStakeBlockedByCollateral": {
  "pallet": "SubtensorModule",
  "code": "policy_violation",
  "description": "A hotkey swap with keep_stake=true was refused because the old hotkey still has standing miner registration collateral. keep_stake leaves stake on the old key while the UID moves, which would strand the bond. Retry with keep_stake=false so collateral migrates with the UID; on-chain hotkey lineage maps track the rename for blacklist continuity. Or drain the bond through earned emission first.",
  "source": "pallets/subtensor/src/macros/errors.rs#L221",
  "docs": "https://www.bittensor.com/docs/errors/chain/KeepStakeBlockedByCollateral"
 },
 "LeaseCannotEndInThePast": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The `end_block` supplied when registering a leased network is not after the current block. Check the current chain height and pass an `end_block` in the future, or omit it for a perpetual lease.",
  "source": "pallets/subtensor/src/macros/errors.rs#L229",
  "docs": "https://www.bittensor.com/docs/errors/chain/LeaseCannotEndInThePast"
 },
 "LeaseDoesNotExist": {
  "pallet": "SubtensorModule",
  "code": "not_found",
  "description": "The `lease_id` argument does not correspond to any stored lease. Query the `SubnetLeases` storage map to confirm the lease id and whether it was already terminated.",
  "source": "pallets/subtensor/src/macros/errors.rs#L233",
  "docs": "https://www.bittensor.com/docs/errors/chain/LeaseDoesNotExist"
 },
 "LeaseHasNoEndBlock": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The lease being terminated is perpetual (its `end_block` is None), so it can never be ended this way. Check the lease's `end_block` field in `SubnetLeases` for the given lease id.",
  "source": "pallets/subtensor/src/macros/errors.rs#L235",
  "docs": "https://www.bittensor.com/docs/errors/chain/LeaseHasNoEndBlock"
 },
 "LeaseHasNotEnded": {
  "pallet": "SubtensorModule",
  "code": "too_early",
  "description": "The lease termination was attempted before the lease's `end_block` was reached. Compare the current block height with the `end_block` stored in `SubnetLeases` for the lease id and retry after it passes.",
  "source": "pallets/subtensor/src/macros/errors.rs#L237",
  "docs": "https://www.bittensor.com/docs/errors/chain/LeaseHasNotEnded"
 },
 "LeaseNetuidNotFound": {
  "pallet": "SubtensorModule",
  "code": "not_found",
  "description": "After registering the leased network, no subnet owned by the lease's derived coldkey could be found, so the netuid lookup failed. Inspect `SubnetOwner` entries for the lease coldkey; this usually indicates the registration did not complete.",
  "source": "pallets/subtensor/src/macros/errors.rs#L231",
  "docs": "https://www.bittensor.com/docs/errors/chain/LeaseNetuidNotFound"
 },
 "LeasedSubnetOwnerCutBelowMinimum": {
  "pallet": "SubtensorModule",
  "code": "policy_violation",
  "description": "The subnet was created through a crowdloan lease, so slot 2 (owner) of its emission weight vector may not drop below the 18% launch default that lease contributors are paid from. Keep the owner share at or above 0.18 on lease-created subnets.",
  "source": "pallets/subtensor/src/macros/errors.rs#L442",
  "docs": "https://www.bittensor.com/docs/errors/chain/LeasedSubnetOwnerCutBelowMinimum"
 },
 "LimitOrdersDisabled": {
  "pallet": "LimitOrders",
  "code": "disabled",
  "description": "Order execution was attempted while the pallet's global switch is off. Check the `LimitOrdersEnabled` storage value; root must call `set_pallet_status` with true to enable the pallet.",
  "source": "pallets/limit-orders/src/lib.rs#L429",
  "docs": "https://www.bittensor.com/docs/errors/chain/LimitOrdersDisabled"
 },
 "LinkedAmountResolvedToZero": {
  "pallet": "LimitOrders",
  "code": "invalid_argument",
  "description": "The linked fraction floored to zero against the recorded output, so there is nothing to trade. Increase `pct` or wait for a larger provider output.",
  "source": "pallets/limit-orders/src/lib.rs#L462",
  "docs": "https://www.bittensor.com/docs/errors/chain/LinkedAmountResolvedToZero"
 },
 "LinkedOutputAssetMismatch": {
  "pallet": "LimitOrders",
  "code": "invalid_argument",
  "description": "The provider recorded a different asset than the linked order spends: sells record TAO for a later buy, buys record alpha on that `(netuid, hotkey)` for a later sell. Check the consumer's `order_type` and `hotkey` against the provider record's `asset`.",
  "source": "pallets/limit-orders/src/lib.rs#L458",
  "docs": "https://www.bittensor.com/docs/errors/chain/LinkedOutputAssetMismatch"
 },
 "LinkedOutputExpired": {
  "pallet": "LimitOrders",
  "code": "expired",
  "description": "The provider record's `expires_at` is in the past, so the output is no longer drawable. Compare `LinkedOutputs.expires_at` with the chain `Timestamp`; unused records can be pruned with `prune_linked_output`.",
  "source": "pallets/limit-orders/src/lib.rs#L460",
  "docs": "https://www.bittensor.com/docs/errors/chain/LinkedOutputExpired"
 },
 "LinkedOutputNotPrunable": {
  "pallet": "LimitOrders",
  "code": "invalid_argument",
  "description": "`prune_linked_output` was called by someone other than the record's signer before `expires_at`. The signer may prune at any time; anyone may prune only after expiry.",
  "source": "pallets/limit-orders/src/lib.rs#L468",
  "docs": "https://www.bittensor.com/docs/errors/chain/LinkedOutputNotPrunable"
 },
 "LinkedOutputSignerMismatch": {
  "pallet": "LimitOrders",
  "code": "invalid_argument",
  "description": "The linked order's signer is not the signer who recorded the named provider output. Only the same account can draw against a record; re-sign the consumer with that key.",
  "source": "pallets/limit-orders/src/lib.rs#L456",
  "docs": "https://www.bittensor.com/docs/errors/chain/LinkedOutputSignerMismatch"
 },
 "LiquidAlphaDisabled": {
  "pallet": "SubtensorModule",
  "code": "disabled",
  "description": "Setting `alpha_low`/`alpha_high` was attempted while liquid alpha is disabled on the subnet. Check the `LiquidAlphaOn` hyperparameter (`btcli hparams get --netuid <n>`) and have the subnet owner enable liquid alpha first.",
  "source": "pallets/subtensor/src/macros/errors.rs#L135",
  "docs": "https://www.bittensor.com/docs/errors/chain/LiquidAlphaDisabled"
 },
 "LiquidityRestrictions": {
  "pallet": "Balances",
  "code": "insufficient_balance",
  "description": "The withdrawal is blocked by locks or freezes on the account even though the raw balance looks sufficient. Check the account's `Locks` and `Freezes` entries and compare the frozen amount against what would remain after the withdrawal.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/LiquidityRestrictions"
 },
 "LockHotkeyMismatch": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "A conviction lock on this subnet is bound to a different hotkey than the one in the call. One coldkey may lock to only one hotkey per subnet: topping up `lock_stake` must reuse that hotkey (`btcli conviction move` to retarget), and a stake transfer that moves locked alpha must land on the receiver's existing lock hotkey (`btcli stake transfer --destination-hotkey <lock-hotkey>`). Check the lock with `btcli conviction show --netuid <n>` / `btcli stake list` (locked · free · lock → hotkey).",
  "source": "pallets/subtensor/src/macros/errors.rs#L303",
  "docs": "https://www.bittensor.com/docs/errors/chain/LockHotkeyMismatch"
 },
 "LockIdOverFlow": {
  "pallet": "SubtensorModule",
  "code": "limit_exceeded",
  "description": "The global network-registration lock id counter reached its u32 maximum while queueing a subnet registration, so no new lock could be created. Check the `NetworkRegistrationLockId` storage value; this indicates lock id exhaustion, not a balance problem.",
  "source": "pallets/subtensor/src/macros/errors.rs#L333",
  "docs": "https://www.bittensor.com/docs/errors/chain/LockIdOverFlow"
 },
 "MaxAllowedUIdsLessThanCurrentUIds": {
  "pallet": "AdminUtils",
  "code": "invalid_argument",
  "description": "`sudo_set_max_allowed_uids` was given a value below the number of neurons already registered on the subnet. Compare the `max_allowed_uids` argument against `SubnetworkN` for that netuid.",
  "source": "pallets/admin-utils/src/lib.rs#L200",
  "docs": "https://www.bittensor.com/docs/errors/chain/MaxAllowedUIdsLessThanCurrentUIds"
 },
 "MaxAllowedUidsGreaterThanDefaultMaxAllowedUids": {
  "pallet": "AdminUtils",
  "code": "invalid_argument",
  "description": "`sudo_set_max_allowed_uids` was given a value above the chain-wide ceiling. Compare the `max_allowed_uids` argument against the `DefaultMaxAllowedUids` storage value.",
  "source": "pallets/admin-utils/src/lib.rs#L214",
  "docs": "https://www.bittensor.com/docs/errors/chain/MaxAllowedUidsGreaterThanDefaultMaxAllowedUids"
 },
 "MaxAllowedUidsLessThanMinAllowedUids": {
  "pallet": "AdminUtils",
  "code": "invalid_argument",
  "description": "`sudo_set_max_allowed_uids` was given a value below the subnet's configured minimum. Compare the `max_allowed_uids` argument against `MinAllowedUids` for that netuid.",
  "source": "pallets/admin-utils/src/lib.rs#L212",
  "docs": "https://www.bittensor.com/docs/errors/chain/MaxAllowedUidsLessThanMinAllowedUids"
 },
 "MaxCallDepthReached": {
  "pallet": "Contracts",
  "code": "limit_exceeded",
  "description": "A nested contract call would exceed the maximum call stack depth defined in the pallet schedule. Inspect the cross-contract call chain for deep or unbounded recursion and flatten it or raise the configured depth.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/MaxCallDepthReached"
 },
 "MaxContributionReached": {
  "pallet": "Crowdloan",
  "code": "limit_exceeded",
  "description": "The contributor's cumulative contribution already equals the crowdloan's per-contributor cap, so further contributions are rejected. Compare their `Contributions` entry with the `MaxContributions` value for the `crowdloan_id`.",
  "source": "pallets/crowdloan/src/lib.rs#L289",
  "docs": "https://www.bittensor.com/docs/errors/chain/MaxContributionReached"
 },
 "MaxContributorsReached": {
  "pallet": "Crowdloan",
  "code": "limit_exceeded",
  "description": "The crowdloan already has the maximum number of distinct contributors, so accounts without an existing contribution are rejected. Compare the `contributors_count` field of the `Crowdloans` entry with the `MaxContributors` pallet constant.",
  "source": "pallets/crowdloan/src/lib.rs#L285",
  "docs": "https://www.bittensor.com/docs/errors/chain/MaxContributorsReached"
 },
 "MaxDelegateDependenciesReached": {
  "pallet": "Contracts",
  "code": "limit_exceeded",
  "description": "`lock_delegate_dependency` failed because the contract already holds the maximum number of delegate dependencies allowed by the runtime. Check the `MaxDelegateDependencies` config value and unlock unused dependencies first.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/MaxDelegateDependenciesReached"
 },
 "MaxValidatorsLargerThanMaxUIds": {
  "pallet": "AdminUtils",
  "code": "invalid_argument",
  "description": "`sudo_set_max_allowed_validators` was given a value exceeding the subnet's UID capacity. Compare the `max_allowed_validators` argument against `MaxAllowedUids` for that netuid.",
  "source": "pallets/admin-utils/src/lib.rs#L198",
  "docs": "https://www.bittensor.com/docs/errors/chain/MaxValidatorsLargerThanMaxUIds"
 },
 "MaxWeightExceeded": {
  "pallet": "SubtensorModule",
  "code": "limit_exceeded",
  "description": "After normalization, one of the submitted weights exceeds the subnet's maximum weight limit (self-weight is exempt). Check the `MaxWeightsLimit` hyperparameter (`btcli hparams get --netuid <n>`) and flatten the weight vector before setting.",
  "source": "pallets/subtensor/src/macros/errors.rs#L77",
  "docs": "https://www.bittensor.com/docs/errors/chain/MaxWeightExceeded"
 },
 "MaxWeightTooLow": {
  "pallet": "Multisig",
  "code": "invalid_argument",
  "description": "The `max_weight` argument supplied with the final multisig approval is lower than the actual weight of the call being dispatched. Compute the call's real dispatch weight and pass a `max_weight` at least that large to `as_multi`.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/MaxWeightTooLow"
 },
 "MaximumContributionTooLow": {
  "pallet": "Crowdloan",
  "code": "invalid_argument",
  "description": "The `new_max_contribution` passed to `set_max_contribution` is below the crowdloan's `min_contribution` or below the creator's existing contribution. Check both against the `Crowdloans` entry and the creator's `Contributions` entry.",
  "source": "pallets/crowdloan/src/lib.rs#L291",
  "docs": "https://www.bittensor.com/docs/errors/chain/MaximumContributionTooLow"
 },
 "MechanismDoesNotExist": {
  "pallet": "SubtensorModule",
  "code": "subnet_not_exists",
  "description": "The target subnet or its sub-mechanism does not exist: the netuid is unknown, the mechanism index is at or above `MechanismCountCurrent`, or a non-dynamic `mechid` was requested. Check the netuid with `btcli subnets list` and the mechanism count for that subnet.",
  "source": "pallets/subtensor/src/macros/errors.rs#L174",
  "docs": "https://www.bittensor.com/docs/errors/chain/MechanismDoesNotExist"
 },
 "MigrationInProgress": {
  "pallet": "Contracts",
  "code": "too_early",
  "description": "A multi-block storage migration of the contracts pallet is still running, so other extrinsics of the pallet are rejected until it completes. Check the migration status in storage and retry once done, or submit `migrate` calls to advance it.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/MigrationInProgress"
 },
 "MinAllowedUidsGreaterThanCurrentUids": {
  "pallet": "AdminUtils",
  "code": "invalid_argument",
  "description": "`sudo_set_min_allowed_uids` was given a value not strictly below the number of neurons currently registered on the subnet. Compare the `min_allowed_uids` argument against `SubnetworkN` for that netuid.",
  "source": "pallets/admin-utils/src/lib.rs#L208",
  "docs": "https://www.bittensor.com/docs/errors/chain/MinAllowedUidsGreaterThanCurrentUids"
 },
 "MinAllowedUidsGreaterThanMaxAllowedUids": {
  "pallet": "AdminUtils",
  "code": "invalid_argument",
  "description": "`sudo_set_min_allowed_uids` was given a value not strictly below the subnet's maximum UID capacity. Compare the `min_allowed_uids` argument against `MaxAllowedUids` for that netuid.",
  "source": "pallets/admin-utils/src/lib.rs#L210",
  "docs": "https://www.bittensor.com/docs/errors/chain/MinAllowedUidsGreaterThanMaxAllowedUids"
 },
 "MinerEmissionBelowMinimum": {
  "pallet": "SubtensorModule",
  "code": "policy_violation",
  "description": "Slot 4 (miner) of the emission weight vector is below the 33% floor. Miner incentive must receive at least 0.33 of block emission; raise the miner share (or lower the owner/validator shares that crowd it out).",
  "source": "pallets/subtensor/src/macros/errors.rs#L455",
  "docs": "https://www.bittensor.com/docs/errors/chain/MinerEmissionBelowMinimum"
 },
 "MinimumContributionTooHigh": {
  "pallet": "Crowdloan",
  "code": "invalid_argument",
  "description": "The `new_min_contribution` passed to `update_min_contribution` exceeds the crowdloan's configured per-contributor maximum. Compare it with the `MaxContributions` entry for the `crowdloan_id`.",
  "source": "pallets/crowdloan/src/lib.rs#L293",
  "docs": "https://www.bittensor.com/docs/errors/chain/MinimumContributionTooHigh"
 },
 "MinimumContributionTooLow": {
  "pallet": "Crowdloan",
  "code": "invalid_argument",
  "description": "The minimum contribution given to `create` or `update_min_contribution` is below the chain-wide floor. Check the `AbsoluteMinimumContribution` pallet constant and raise the `min_contribution` argument to at least that value.",
  "source": "pallets/crowdloan/src/lib.rs#L245",
  "docs": "https://www.bittensor.com/docs/errors/chain/MinimumContributionTooLow"
 },
 "MinimumThreshold": {
  "pallet": "Multisig",
  "code": "invalid_argument",
  "description": "The multisig `threshold` argument was below 2, which these calls do not accept. Pass a threshold of 2 or more, or use `as_multi_threshold_1` for the single-approval case.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/MinimumThreshold"
 },
 "MultiBlockMigrationsOngoing": {
  "pallet": "System",
  "code": "too_early",
  "description": "Runtime code replacement is blocked while a multi-block migration is still executing. Wait for the ongoing migrations to complete (check the multi-block migrations cursor) before retrying `set_code` or the authorized upgrade.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/MultiBlockMigrationsOngoing"
 },
 "Named": {
  "pallet": "Scheduler",
  "code": "invalid_argument",
  "description": "An unnamed scheduler function was used on a task that was scheduled with a name. Use the named variants (`cancel_named`, `schedule_named`) with the task's id, which you can find via the `Lookup` storage map.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/Named"
 },
 "NeedWaitingMoreBlocksToStarCall": {
  "pallet": "SubtensorModule",
  "code": "too_early",
  "description": "The subnet owner ran `btcli hparams start` before enough blocks had passed since the subnet was registered. Check readiness with `btcli hparams check-start` and retry once the window opens.",
  "source": "pallets/subtensor/src/macros/errors.rs#L204",
  "docs": "https://www.bittensor.com/docs/errors/chain/NeedWaitingMoreBlocksToStarCall"
 },
 "NegativeSigmoidSteepness": {
  "pallet": "AdminUtils",
  "code": "invalid_argument",
  "description": "A non-root caller (subnet owner) passed a negative value to `sudo_set_alpha_sigmoid_steepness`; negative steepness values are reserved for the root origin. Use a non-negative `steepness` or submit the call as root.",
  "source": "pallets/admin-utils/src/lib.rs#L204",
  "docs": "https://www.bittensor.com/docs/errors/chain/NegativeSigmoidSteepness"
 },
 "NetworkDissolveAlreadyQueued": {
  "pallet": "SubtensorModule",
  "code": "already_exists",
  "description": "The subnet is already in the dissolve cleanup queue, so it cannot be queued for dissolution again. Check the `DissolveCleanupQueue` storage value for the netuid before submitting another dissolve request.",
  "source": "pallets/subtensor/src/macros/errors.rs#L289",
  "docs": "https://www.bittensor.com/docs/errors/chain/NetworkDissolveAlreadyQueued"
 },
 "NetworkTxRateLimitExceeded": {
  "pallet": "SubtensorModule",
  "code": "rate_limited",
  "description": "The coldkey attempted register_network again before the network registration rate limit elapsed since its previous registration. Check the coldkey's last register-network block against the `NetworkRateLimit` storage value and wait the remaining blocks.",
  "source": "pallets/subtensor/src/macros/errors.rs#L89",
  "docs": "https://www.bittensor.com/docs/errors/chain/NetworkTxRateLimitExceeded"
 },
 "NeuronNoValidatorPermit": {
  "pallet": "SubtensorModule",
  "code": "not_authorized",
  "description": "The hotkey tried to set weights on other neurons without holding a validator permit on that subnet. Check `ValidatorPermit` for the neuron's uid (e.g. via the metagraph or `btcli subnets metagraph`) and whether its stake ranks it as a validator.",
  "source": "pallets/subtensor/src/macros/errors.rs#L48",
  "docs": "https://www.bittensor.com/docs/errors/chain/NeuronNoValidatorPermit"
 },
 "NewColdKeyIsHotkey": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The proposed new coldkey in a coldkey swap is already an existing hotkey account, which is not allowed. Check the `Owner` storage for the candidate key to confirm it is not registered as a hotkey, and pick a fresh coldkey.",
  "source": "pallets/subtensor/src/macros/errors.rs#L166",
  "docs": "https://www.bittensor.com/docs/errors/chain/NewColdKeyIsHotkey"
 },
 "NewHotKeyIsSameWithOld": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "swap_hotkey was called with `new_hotkey` equal to the current hotkey, so there is nothing to swap. Check the extrinsic arguments and supply a different destination hotkey.",
  "source": "pallets/subtensor/src/macros/errors.rs#L65",
  "docs": "https://www.bittensor.com/docs/errors/chain/NewHotKeyIsSameWithOld"
 },
 "NewHotKeyNotCleanForRootSwap": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The destination hotkey has pending root claimable dividends, non-zero root stake, or root-claimed history, so root accounting cannot merge safely. Check `RootClaimable` and root-subnet stake for the new hotkey; claim or clear them, or use a fresh hotkey.",
  "source": "pallets/subtensor/src/macros/errors.rs#L68",
  "docs": "https://www.bittensor.com/docs/errors/chain/NewHotKeyNotCleanForRootSwap"
 },
 "NoApprovalsNeeded": {
  "pallet": "Multisig",
  "code": "invalid_argument",
  "description": "The multisig call does not need any more approvals; it is only waiting for final execution with the full call data. Instead of another `approve_as_multi`, submit `as_multi` with the complete call to dispatch it.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/NoApprovalsNeeded"
 },
 "NoChainExtension": {
  "pallet": "Contracts",
  "code": "disabled",
  "description": "The contract invoked `call_chain_extension` but this runtime registers no chain extension; such code is normally rejected at upload. Check that the target chain provides the chain extension the contract was built against.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/NoChainExtension"
 },
 "NoContribution": {
  "pallet": "Crowdloan",
  "code": "not_found",
  "description": "The account has no contribution recorded for this crowdloan, so `withdraw` has nothing to pay out (or `dissolve` finds no creator contribution). Check the `Contributions` double map under the `crowdloan_id` for the account in question.",
  "source": "pallets/crowdloan/src/lib.rs#L273",
  "docs": "https://www.bittensor.com/docs/errors/chain/NoContribution"
 },
 "NoDeposit": {
  "pallet": "SafeMode",
  "code": "not_found",
  "description": "No safe-mode deposit exists for the given account and block combination, so nothing can be released or slashed. Check the `Deposits` storage map for an entry under that account and deposit block.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/NoDeposit"
 },
 "NoExistingLock": {
  "pallet": "SubtensorModule",
  "code": "not_found",
  "description": "move_lock was called but no conviction lock exists for the signing coldkey on that subnet. Check the lock storage for the coldkey and netuid, and create a lock before attempting to move it to another hotkey.",
  "source": "pallets/subtensor/src/macros/errors.rs#L307",
  "docs": "https://www.bittensor.com/docs/errors/chain/NoExistingLock"
 },
 "NoLinkedOutput": {
  "pallet": "LimitOrders",
  "code": "not_found",
  "description": "A linked order named a provider `order_id` that has no recorded output, it was never a provider, already drawn, or pruned. Check `LinkedOutputs` for that id, or execute the provider first via `execute_orders` rather than in the same batched call.",
  "source": "pallets/limit-orders/src/lib.rs#L454",
  "docs": "https://www.bittensor.com/docs/errors/chain/NoLinkedOutput"
 },
 "NoMigrationPerformed": {
  "pallet": "Contracts",
  "code": "invalid_argument",
  "description": "A `migrate` call ran but no migration step executed, either because no migration is pending or the supplied `weight_limit` is too small for one step. Check the in-progress migration status and increase the weight limit argument.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/NoMigrationPerformed"
 },
 "NoNeuronIdAvailable": {
  "pallet": "SubtensorModule",
  "code": "limit_exceeded",
  "description": "Registration could not obtain a uid: the subnet's `MaxAllowedUids` is 0, or the subnet is full and every neuron is immune from pruning. Check `SubnetworkN` versus `MaxAllowedUids` for the netuid and retry after immunity periods expire.",
  "source": "pallets/subtensor/src/macros/errors.rs#L120",
  "docs": "https://www.bittensor.com/docs/errors/chain/NoNeuronIdAvailable"
 },
 "NoPermission": {
  "pallet": "Proxy",
  "code": "not_authorized",
  "description": "The proxy pallet refused the action: the proxied call could escalate privileges, or the caller lacks authority over the pure proxy (e.g. `kill_pure` by a non-spawner). Check the proxy type's call filter and the original `create_pure` arguments.",
  "source": "pallets/proxy/src/lib.rs#L808",
  "docs": "https://www.bittensor.com/docs/errors/chain/NoPermission"
 },
 "NoSelfProxy": {
  "pallet": "Proxy",
  "code": "invalid_argument",
  "description": "An account attempted to register itself as its own proxy, which is not allowed. Check the `delegate` argument to `add_proxy` and ensure it differs from the calling (delegator) account.",
  "source": "pallets/proxy/src/lib.rs#L812",
  "docs": "https://www.bittensor.com/docs/errors/chain/NoSelfProxy"
 },
 "NoTimepoint": {
  "pallet": "Multisig",
  "code": "invalid_argument",
  "description": "No timepoint was supplied but this multisig operation is already underway, so the approval cannot be matched to it. Read the operation's `when` field from the `Multisigs` entry for the call hash and pass that height and index as `maybe_timepoint`.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/NoTimepoint"
 },
 "NoWeightsCommitFound": {
  "pallet": "SubtensorModule",
  "code": "not_found",
  "description": "A weights reveal was submitted but no pending (non-expired) commit exists for the hotkey and netuid, possibly because it already expired. Query the `WeightCommits` storage map for the hotkey and check the commit hasn't passed the reveal window.",
  "source": "pallets/subtensor/src/macros/errors.rs#L127",
  "docs": "https://www.bittensor.com/docs/errors/chain/NoWeightsCommitFound"
 },
 "NonAssociatedColdKey": {
  "pallet": "SubtensorModule",
  "code": "not_authorized",
  "description": "The signing coldkey does not own the hotkey it is trying to operate on (stake, swap, serve, children or take changes). Check the `Owner` storage entry for the hotkey, e.g. via `btcli wallet registrations`, and sign with the coldkey that registered it.",
  "source": "pallets/subtensor/src/macros/errors.rs#L26",
  "docs": "https://www.bittensor.com/docs/errors/chain/NonAssociatedColdKey"
 },
 "NonDefaultComposite": {
  "pallet": "System",
  "code": "invalid_argument",
  "description": "The account cannot be killed because its composite account data is not in the default state. Check the account's `System.Account` entry; all balance and data fields must be default before the account can be removed this way.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/NonDefaultComposite"
 },
 "NonZeroRefCount": {
  "pallet": "System",
  "code": "invalid_argument",
  "description": "The account cannot be purged because other pallets still reference it. Check the `consumers`, `providers`, and `sufficients` counters in the account's `System.Account` record; all references must be released first.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/NonZeroRefCount"
 },
 "NoneValue": {
  "pallet": "Drand",
  "code": "not_found",
  "description": "Template leftover in the drand pallet meaning a storage value was read before ever being set; no current code path raises it. If seen, inspect the drand pallet's storage items for missing initialization.",
  "source": "pallets/drand/src/lib.rs#L260",
  "docs": "https://www.bittensor.com/docs/errors/chain/NoneValue"
 },
 "NotAllowed": {
  "pallet": "EVM",
  "code": "not_authorized",
  "description": "Contract deployment was blocked because the source address is not in the `WhitelistedCreators` list while the whitelist check is enabled. Check the deployer address against `WhitelistedCreators` and the `DisableWhitelistCheck` storage value.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/NotAllowed"
 },
 "NotAuthorized": {
  "pallet": "Preimage",
  "code": "not_authorized",
  "description": "The caller is not permitted to manage this preimage; unnoting or unrequesting requires the pallet's manager origin or the account that originally deposited it. Check which origin noted or requested the preimage and use that origin or the configured `ManagerOrigin`.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/NotAuthorized"
 },
 "NotConfigured": {
  "pallet": "SafeMode",
  "code": "disabled",
  "description": "The permissionless safe-mode operation is disabled because its config option is `None`: `EnterDepositAmount` for `enter`, `ExtendDepositAmount` for `extend`, or `ReleaseDelay` for `release_deposit`. Check the runtime config or use the root-only force variants.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/NotConfigured"
 },
 "NotEnoughAlphaOutToRecycle": {
  "pallet": "SubtensorModule",
  "code": "insufficient_liquidity",
  "description": "A recycle or burn of alpha requested more than the subnet's outstanding alpha supply. Compare the amount against the `SubnetAlphaOut` storage value for the netuid and reduce the recycle amount.",
  "source": "pallets/subtensor/src/macros/errors.rs#L206",
  "docs": "https://www.bittensor.com/docs/errors/chain/NotEnoughAlphaOutToRecycle"
 },
 "NotEnoughBalanceToPaySwapColdKey": {
  "pallet": "SubtensorModule",
  "code": "insufficient_balance",
  "description": "The coldkey's free TAO balance cannot cover the coldkey swap cost, which is recycled when the swap executes. Check the balance with `btcli wallet balance` against the swap cost and top up before `btcli wallet swap-coldkey`.",
  "source": "pallets/subtensor/src/macros/errors.rs#L144",
  "docs": "https://www.bittensor.com/docs/errors/chain/NotEnoughBalanceToPaySwapColdKey"
 },
 "NotEnoughBalanceToPaySwapHotKey": {
  "pallet": "SubtensorModule",
  "code": "insufficient_balance",
  "description": "The coldkey's free TAO balance is below the hotkey swap cost (a per-subnet cost applies when swapping on a single netuid). Check `btcli wallet balance` against the key swap cost and fund the coldkey before retrying.",
  "source": "pallets/subtensor/src/macros/errors.rs#L114",
  "docs": "https://www.bittensor.com/docs/errors/chain/NotEnoughBalanceToPaySwapHotKey"
 },
 "NotEnoughBalanceToStake": {
  "pallet": "SubtensorModule",
  "code": "insufficient_balance",
  "description": "The coldkey's free balance is less than the TAO required, either the stake amount in add_stake or the burn cost of a registration. Check `btcli wallet balance` against the amount or the current registration burn (`Burn` storage for the netuid).",
  "source": "pallets/subtensor/src/macros/errors.rs#L40",
  "docs": "https://www.bittensor.com/docs/errors/chain/NotEnoughBalanceToStake"
 },
 "NotEnoughStake": {
  "pallet": "SubtensorModule",
  "code": "insufficient_balance",
  "description": "The caller's hotkey holds less stake than the action requires; a generic insufficient-stake failure on staking-related calls. Check the hotkey's stake on the relevant subnet, e.g. `btcli stake list`, against the amount the extrinsic needs.",
  "source": "pallets/subtensor/src/macros/errors.rs#L29",
  "docs": "https://www.bittensor.com/docs/errors/chain/NotEnoughStake"
 },
 "NotEnoughStakeToSetChildkeys": {
  "pallet": "SubtensorModule",
  "code": "insufficient_balance",
  "description": "Raised by `set_children` when the parent hotkey's total stake is below `StakeThreshold` and it is not the subnet owner hotkey. Compare the hotkey's total stake (`btcli stake list`) against the `StakeThreshold` storage value.",
  "source": "pallets/subtensor/src/macros/errors.rs#L37",
  "docs": "https://www.bittensor.com/docs/errors/chain/NotEnoughStakeToSetChildkeys"
 },
 "NotEnoughStakeToSetWeights": {
  "pallet": "SubtensorModule",
  "code": "insufficient_balance",
  "description": "Setting or committing weights failed because the hotkey's stake weight on the subnet is below `StakeThreshold` (the weights-min-stake floor); the subnet owner hotkey is exempt. Check the hotkey's stake on that netuid against `StakeThreshold`.",
  "source": "pallets/subtensor/src/macros/errors.rs#L35",
  "docs": "https://www.bittensor.com/docs/errors/chain/NotEnoughStakeToSetWeights"
 },
 "NotEnoughStakeToWithdraw": {
  "pallet": "SubtensorModule",
  "code": "insufficient_balance",
  "description": "An unstake, stake move, swap, or transfer requested more alpha than the hotkey-coldkey pair holds on that subnet. Compare the requested amount against that specific position (`btcli stake list`), conviction locks are coldkey-wide, so stake may sit on a different hotkey than the lock target; move stake onto the origin hotkey first or pass the hotkey that actually holds the balance.",
  "source": "pallets/subtensor/src/macros/errors.rs#L32",
  "docs": "https://www.bittensor.com/docs/errors/chain/NotEnoughStakeToWithdraw"
 },
 "NotFound": {
  "pallet": "Multisig",
  "code": "not_found",
  "description": "The referenced item does not exist in storage: no multisig operation for that call hash in `Multisigs`, no scheduled task at that slot or name in `Agenda`/`Lookup`, or no matching proxy registration in `Proxies`. Verify the identifier against current chain state.",
  "source": "pallets/proxy/src/lib.rs#L800",
  "docs": "https://www.bittensor.com/docs/errors/chain/NotFound"
 },
 "NotNoted": {
  "pallet": "Preimage",
  "code": "not_found",
  "description": "The preimage cannot be unnoted because no preimage was ever noted for this hash. Check `RequestStatusFor` (or legacy `StatusFor`) for the hash to confirm what, if anything, is stored.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/NotNoted"
 },
 "NotOwner": {
  "pallet": "Multisig",
  "code": "not_authorized",
  "description": "Only the account that opened the multisig operation (its depositor) may cancel it or adjust its deposit. Compare the sender against the `depositor` field stored in the `Multisigs` entry for this call hash.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/NotOwner"
 },
 "NotPermittedOnRootSubnet": {
  "pallet": "AdminUtils",
  "code": "invalid_argument",
  "description": "An admin-utils call that only applies to regular subnets (burn half-life, burn increase multiplier, owner-cut flags, or the subnet emission toggle) was targeted at the root network. Check that the `netuid` argument is not the root netuid 0.",
  "source": "pallets/admin-utils/src/lib.rs#L218",
  "docs": "https://www.bittensor.com/docs/errors/chain/NotPermittedOnRootSubnet"
 },
 "NotProxy": {
  "pallet": "Proxy",
  "code": "not_authorized",
  "description": "The sender is not registered as a proxy for the account it tried to act for. Check the `Proxies` entry of the `real` account and confirm the sender appears there with a proxy type and delay compatible with the call.",
  "source": "pallets/proxy/src/lib.rs#L802",
  "docs": "https://www.bittensor.com/docs/errors/chain/NotProxy"
 },
 "NotReadyToDissolve": {
  "pallet": "Crowdloan",
  "code": "too_early",
  "description": "`dissolve` was called while outside contributions remain: the crowdloan's `raised` amount still exceeds the creator's own contribution. Call `refund` until only the creator's `Contributions` entry remains and equals `raised` in the `Crowdloans` record.",
  "source": "pallets/crowdloan/src/lib.rs#L281",
  "docs": "https://www.bittensor.com/docs/errors/chain/NotReadyToDissolve"
 },
 "NotRequested": {
  "pallet": "Preimage",
  "code": "not_found",
  "description": "The preimage request cannot be removed because there are no outstanding requests for this hash. Check the request status for the hash in `RequestStatusFor` before calling `unrequest_preimage`.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/NotRequested"
 },
 "NotRootSubnet": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "A call that only operates on the root network, such as setting root network weights, was given a non-root netuid. Check the netuid argument; root operations must target netuid 0.",
  "source": "pallets/subtensor/src/macros/errors.rs#L116",
  "docs": "https://www.bittensor.com/docs/errors/chain/NotRootSubnet"
 },
 "NotSubnetOwner": {
  "pallet": "SubtensorModule",
  "code": "not_authorized",
  "description": "The signing coldkey is not the recorded owner of the subnet it tried to administer (e.g. setting subnet identity or owner-only hyperparameters). Compare the caller against the `SubnetOwner` storage entry for that netuid.",
  "source": "pallets/subtensor/src/macros/errors.rs#L105",
  "docs": "https://www.bittensor.com/docs/errors/chain/NotSubnetOwner"
 },
 "NothingAuthorized": {
  "pallet": "System",
  "code": "not_found",
  "description": "No code upgrade has been authorized, so `apply_authorized_upgrade` has nothing to apply. Check the `AuthorizedUpgrade` storage item in System; an authorization must be recorded before applying the new code.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/NothingAuthorized"
 },
 "OrderAlreadyProcessed": {
  "pallet": "LimitOrders",
  "code": "already_exists",
  "description": "The order id already has a terminal status: execution found it fulfilled, or `cancel_order` found any existing status for it. Check the `Orders` storage map under the blake2-256 hash of the SCALE-encoded `VersionedOrder`.",
  "source": "pallets/limit-orders/src/lib.rs#L413",
  "docs": "https://www.bittensor.com/docs/errors/chain/OrderAlreadyProcessed"
 },
 "OrderCancelled": {
  "pallet": "LimitOrders",
  "code": "expired",
  "description": "The order was previously cancelled via `cancel_order` and can never be executed. Check the `Orders` storage entry for the order id; a `Cancelled` status is terminal, so the signer must sign and submit a fresh order.",
  "source": "pallets/limit-orders/src/lib.rs#L415",
  "docs": "https://www.bittensor.com/docs/errors/chain/OrderCancelled"
 },
 "OrderExpired": {
  "pallet": "LimitOrders",
  "code": "expired",
  "description": "The current chain time is past the order's `expiry` field, which is a unix timestamp in milliseconds, so the order can no longer execute. Compare the `expiry` in the signed order payload with the chain's current `Timestamp` value.",
  "source": "pallets/limit-orders/src/lib.rs#L417",
  "docs": "https://www.bittensor.com/docs/errors/chain/OrderExpired"
 },
 "OrderNetUidMismatch": {
  "pallet": "LimitOrders",
  "code": "invalid_argument",
  "description": "An order inside an `execute_batched_orders` call has a `netuid` field different from the batch's `netuid` parameter, which hard-fails the entire batch. Check each order payload's `netuid` against the batch argument and split mismatched orders out.",
  "source": "pallets/limit-orders/src/lib.rs#L427",
  "docs": "https://www.bittensor.com/docs/errors/chain/OrderNetUidMismatch"
 },
 "OrderSignerFrozen": {
  "pallet": "LimitOrders",
  "code": "not_authorized",
  "description": "The order owner is temporarily prohibited from moving funds, so the order cannot be executed. Retry once the owner's freeze has lifted.",
  "source": "pallets/limit-orders/src/lib.rs#L470",
  "docs": "https://www.bittensor.com/docs/errors/chain/OrderSignerFrozen"
 },
 "OutOfBounds": {
  "pallet": "Contracts",
  "code": "invalid_argument",
  "description": "A pointer and length pair passed to a contract API host function references memory outside the contract's sandbox. Check the buffer pointers and lengths the contract passes to seal functions; this usually indicates a low-level contract bug.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/OutOfBounds"
 },
 "OutOfGas": {
  "pallet": "Contracts",
  "code": "limit_exceeded",
  "description": "The contract exhausted the gas limit supplied for this execution before completing. Increase the `gas_limit` argument on `call` or `instantiate`; dry-run the call via RPC to estimate the required weight.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/OutOfGas"
 },
 "OutOfTransientStorage": {
  "pallet": "Contracts",
  "code": "limit_exceeded",
  "description": "A write would exceed the per-execution byte limit for transient storage. Check how much data the contract places in transient storage during the call against the runtime's transient storage limit.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/OutOfTransientStorage"
 },
 "OutputBufferTooSmall": {
  "pallet": "Contracts",
  "code": "invalid_argument",
  "description": "The output buffer the contract supplied to an API call is smaller than the data the runtime needs to write back. Check the output length pointer the contract passes and enlarge the buffer; usually a contract-side bug.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/OutputBufferTooSmall"
 },
 "Overflow": {
  "pallet": "SubtensorModule",
  "code": "internal",
  "description": "A checked arithmetic operation overflowed, e.g. incrementing `NextSubnetLeaseId` when registering a leased network, or adding to a crowdloan's `raised` amount or contributor count. Internal guard; inspect the amounts involved as this should not occur with realistic values.",
  "source": "pallets/subtensor/src/macros/errors.rs#L239",
  "docs": "https://www.bittensor.com/docs/errors/chain/Overflow"
 },
 "OwnerEmissionAboveMaximum": {
  "pallet": "SubtensorModule",
  "code": "policy_violation",
  "description": "Slot 2 (owner) of the emission weight vector exceeds the 33% ceiling. The subnet owner may take at most 0.33 of block emission; lower the owner share (0 disables the owner cut entirely on subnets that were not created through a lease).",
  "source": "pallets/subtensor/src/macros/errors.rs#L438",
  "docs": "https://www.bittensor.com/docs/errors/chain/OwnerEmissionAboveMaximum"
 },
 "POWRegistrationDisabled": {
  "pallet": "AdminUtils",
  "code": "disabled",
  "description": "This legacy error is retained for older runtimes that disabled PoW registration. Upgraded runtimes let the subnet owner enable network_pow_registration_allowed; general registration must also be enabled. Root does not accept PoW registration.",
  "source": "pallets/admin-utils/src/lib.rs#L220",
  "docs": "https://www.bittensor.com/docs/errors/chain/POWRegistrationDisabled"
 },
 "PalletHotkeyNotRegistered": {
  "pallet": "LimitOrders",
  "code": "not_registered",
  "description": "Root tried to enable the pallet via `set_pallet_status` before its hotkey was registered to the pallet's intermediary account. Check that the `PalletHotkey` constant is registered for the pallet account, which genesis or the `on_runtime_upgrade` migration performs.",
  "source": "pallets/limit-orders/src/lib.rs#L443",
  "docs": "https://www.bittensor.com/docs/errors/chain/PalletHotkeyNotRegistered"
 },
 "PartialFillNotSupportedForLinkedAmount": {
  "pallet": "LimitOrders",
  "code": "invalid_argument",
  "description": "A `partial_fill` was submitted against a linked (consuming) order. Linked amounts must execute in one shot; omit `partial_fill` and execute the resolved amount in full.",
  "source": "pallets/limit-orders/src/lib.rs#L464",
  "docs": "https://www.bittensor.com/docs/errors/chain/PartialFillNotSupportedForLinkedAmount"
 },
 "PartialFillNotSupportedForProvider": {
  "pallet": "LimitOrders",
  "code": "invalid_argument",
  "description": "A `partial_fill` was submitted against a provider (`has_linked_order`). Provider output must be recorded from a single execution; omit `partial_fill` even if `partial_fills_enabled` is set.",
  "source": "pallets/limit-orders/src/lib.rs#L466",
  "docs": "https://www.bittensor.com/docs/errors/chain/PartialFillNotSupportedForProvider"
 },
 "PartialFillsNotEnabled": {
  "pallet": "LimitOrders",
  "code": "disabled",
  "description": "A `partial_fill` amount was supplied for an order whose signed payload has `partial_fills_enabled` set to false. Check that field in the order payload; partial execution requires the signer to have opted in when signing.",
  "source": "pallets/limit-orders/src/lib.rs#L433",
  "docs": "https://www.bittensor.com/docs/errors/chain/PartialFillsNotEnabled"
 },
 "PauseFailed": {
  "pallet": "Grandpa",
  "code": "invalid_argument",
  "description": "A GRANDPA pause was signalled while the authority set is not live, i.e. it is already paused or a pause is already pending. Check the Grandpa `State` storage before signalling a pause.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/PauseFailed"
 },
 "PaymentOverflow": {
  "pallet": "EVM",
  "code": "internal",
  "description": "Arithmetic overflowed while computing the total payment or refund for an EVM transaction, such as refunding remaining gas at the effective gas price. Check for extreme gas price or gas limit values in the transaction.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/PaymentOverflow"
 },
 "PreLogExists": {
  "pallet": "Ethereum",
  "code": "invalid_argument",
  "description": "An `ethereum.transact` extrinsic was submitted in a block that already carries a pre-log digest, meaning an Ethereum transaction is being injected by other means. Check the block's digest for a pre-runtime Ethereum log; transact is not allowed alongside it.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/PreLogExists"
 },
 "PriceConditionNotMet": {
  "pallet": "LimitOrders",
  "code": "too_early",
  "description": "The subnet's current alpha price does not satisfy the order's trigger: buys and stop-losses require price at or below `limit_price`, take-profits at or above it. Compare `current_alpha_price` for the order's `netuid`, scaled by 1e9, with the `limit_price` field.",
  "source": "pallets/limit-orders/src/lib.rs#L419",
  "docs": "https://www.bittensor.com/docs/errors/chain/PriceConditionNotMet"
 },
 "PriceLimitExceeded": {
  "pallet": "Swap",
  "code": "insufficient_liquidity",
  "description": "The `limit_price` given to a swap is not beyond the current pool price in the trade's direction, so the swap would immediately breach it. Compare the limit price argument against the subnet's current alpha price before submitting.",
  "source": "pallets/swap/src/pallet/mod.rs#L155",
  "docs": "https://www.bittensor.com/docs/errors/chain/PriceLimitExceeded"
 },
 "ProportionOverflow": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The child proportions passed to `set_children` sum to more than u64::MAX. Reduce the per-child proportion values so their total fits in a u64; each proportion is a fraction of u64::MAX.",
  "source": "pallets/subtensor/src/macros/errors.rs#L150",
  "docs": "https://www.bittensor.com/docs/errors/chain/ProportionOverflow"
 },
 "PulseVerificationError": {
  "pallet": "Drand",
  "code": "invalid_argument",
  "description": "BLS signature verification of a submitted drand pulse against the stored beacon configuration failed. Check the pulse's signature and round against the `BeaconConfig` storage (drand quicknet public key).",
  "source": "pallets/drand/src/lib.rs#L270",
  "docs": "https://www.bittensor.com/docs/errors/chain/PulseVerificationError"
 },
 "RandomSubjectTooLong": {
  "pallet": "Contracts",
  "code": "limit_exceeded",
  "description": "The subject buffer given to the deprecated `seal_random` API exceeds the schedule's `subject_len` limit. Shorten the randomness subject the contract passes or check the schedule's limits section.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/RandomSubjectTooLong"
 },
 "RecycleEmissionMustBeZero": {
  "pallet": "SubtensorModule",
  "code": "policy_violation",
  "description": "Slot 1 (recycle) of the emission weight vector was set to a non-zero share. Recycling alpha emission is reserved for a future runtime; in v1 the recycle share must be 0 (or simply omitted).",
  "source": "pallets/subtensor/src/macros/errors.rs#L435",
  "docs": "https://www.bittensor.com/docs/errors/chain/RecycleEmissionMustBeZero"
 },
 "ReentranceDenied": {
  "pallet": "Contracts",
  "code": "invalid_argument",
  "description": "A call tried to re-enter a contract already on the call stack without reentrancy being allowed, or contract code called back into the contracts pallet through the runtime. Check the callee address against the current call stack and the ALLOW_REENTRY call flag.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/ReentranceDenied"
 },
 "Reentrancy": {
  "pallet": "EVM",
  "code": "internal",
  "description": "EVM execution re-entered the pallet while another EVM execution was already in progress on the same thread, e.g. a precompile or runtime call dispatching back into the EVM. Inspect precompiles and runtime code that invoke the EVM from within an EVM call.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/Reentrancy"
 },
 "RegistrationNotPermittedOnRootSubnet": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "A neuron registration or child-hotkey operation (`register`, `burned_register`, `set_children`) was called with the root netuid, where these calls are invalid. Check the netuid argument; use a regular subnet, or `root_register` for root membership.",
  "source": "pallets/subtensor/src/macros/errors.rs#L107",
  "docs": "https://www.bittensor.com/docs/errors/chain/RegistrationNotPermittedOnRootSubnet"
 },
 "RegistrationPriceLimitExceeded": {
  "pallet": "SubtensorModule",
  "code": "limit_exceeded",
  "description": "`burned_register` with a price limit failed because the subnet's current registration burn cost exceeds the supplied `limit_price`. Check the current burn via `Burn` storage or `btcli subnets list` and raise the limit or wait for the cost to decay.",
  "source": "pallets/subtensor/src/macros/errors.rs#L301",
  "docs": "https://www.bittensor.com/docs/errors/chain/RegistrationPriceLimitExceeded"
 },
 "RelayerMissMatch": {
  "pallet": "LimitOrders",
  "code": "invalid_argument",
  "description": "The order's `relayer` allowlist is set but the account that submitted the execution transaction is not in it. Compare the extrinsic's signing account against the `relayer` list in the signed order payload.",
  "source": "pallets/limit-orders/src/lib.rs#L431",
  "docs": "https://www.bittensor.com/docs/errors/chain/RelayerMissMatch"
 },
 "RelayerRequiredForPartialFill": {
  "pallet": "LimitOrders",
  "code": "invalid_argument",
  "description": "A `partial_fill` was requested for an order whose `relayer` field is empty; partial fills are only permitted on orders that restrict who may execute them. Check the order payload and either set a relayer list or execute the full amount.",
  "source": "pallets/limit-orders/src/lib.rs#L437",
  "docs": "https://www.bittensor.com/docs/errors/chain/RelayerRequiredForPartialFill"
 },
 "Requested": {
  "pallet": "Preimage",
  "code": "invalid_argument",
  "description": "The preimage cannot be unnoted while there are still outstanding requests for it. Check the request count in the hash's request status; all requests must be cleared before the preimage can be removed.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/Requested"
 },
 "RequireSudo": {
  "pallet": "Sudo",
  "code": "not_authorized",
  "description": "The call requires the sudo key but was signed by a different account. Compare the sender against the account stored in the Sudo pallet's `Key` storage item.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/RequireSudo"
 },
 "RescheduleNoChange": {
  "pallet": "Scheduler",
  "code": "invalid_argument",
  "description": "The reschedule was rejected because the new dispatch time equals the task's currently scheduled time. Check the task's existing slot in `Agenda` and pass a genuinely different `when` block.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/RescheduleNoChange"
 },
 "ReservesOutOfBalance": {
  "pallet": "Swap",
  "code": "insufficient_liquidity",
  "description": "Swap balancer initialization failed because the subnet's TAO and alpha reserves produce an invalid ratio, for example both reserves are zero when an initial price is supplied. Inspect the subnet's TAO and alpha reserves and the `SwapBalancer` entry.",
  "source": "pallets/swap/src/pallet/mod.rs#L176",
  "docs": "https://www.bittensor.com/docs/errors/chain/ReservesOutOfBalance"
 },
 "ReservesTooLow": {
  "pallet": "Swap",
  "code": "insufficient_liquidity",
  "description": "The output-side reserve is below the swap pallet's `MinimumReserve`, or a swap step produced zero output for a nonzero input. Check the subnet's TAO and alpha reserves against `MinimumReserve` and reduce the trade size.",
  "source": "pallets/swap/src/pallet/mod.rs#L167",
  "docs": "https://www.bittensor.com/docs/errors/chain/ReservesTooLow"
 },
 "ResumeFailed": {
  "pallet": "Grandpa",
  "code": "invalid_argument",
  "description": "A GRANDPA resume was signalled while the authority set is not paused, i.e. it is live or already pending a resume. Check the Grandpa `State` storage before signalling a resume.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/ResumeFailed"
 },
 "RevealPeriodTooLarge": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "`set_reveal_period` was given a commit-reveal period above the compiled-in maximum number of epochs. Lower the `reveal_period` argument; the current setting is readable from `RevealPeriodEpochs` for the netuid.",
  "source": "pallets/subtensor/src/macros/errors.rs#L255",
  "docs": "https://www.bittensor.com/docs/errors/chain/RevealPeriodTooLarge"
 },
 "RevealPeriodTooSmall": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "`set_reveal_period` was given a commit-reveal period below the compiled-in minimum number of epochs. Raise the `reveal_period` argument; the current setting is readable from `RevealPeriodEpochs` for the netuid.",
  "source": "pallets/subtensor/src/macros/errors.rs#L257",
  "docs": "https://www.bittensor.com/docs/errors/chain/RevealPeriodTooSmall"
 },
 "RevealTooEarly": {
  "pallet": "SubtensorModule",
  "code": "too_early",
  "description": "A weight reveal was submitted before the commit's reveal window: the current epoch must equal the commit epoch plus the reveal period. Check the commit in `WeightCommits` and the subnet's `RevealPeriodEpochs`, then wait for the reveal epoch.",
  "source": "pallets/subtensor/src/macros/errors.rs#L184",
  "docs": "https://www.bittensor.com/docs/errors/chain/RevealTooEarly"
 },
 "RootClaimTooHeavy": {
  "pallet": "SubtensorModule",
  "code": "limit_exceeded",
  "description": "A root claim would process more than the fixed 256-unit admission envelope. Only root-relevant validator hotkeys and their stored basket rows count as claim work; classifying the staking-hotkey relationship vector is separately capped at 256, and the queued dividend credits plus weight-vector destinations the claim would flush first are capped at 512 across all validators claimed (one validator always fits). Unrelated subnet stakes are not multiplied by the total network count. Split a coldkey-wide claim by validator where that fits, and investigate or consolidate an individually oversized basket.",
  "source": "pallets/subtensor/src/macros/errors.rs#L368",
  "docs": "https://www.bittensor.com/docs/errors/chain/RootClaimTooHeavy"
 },
 "RootNetUidNotAllowed": {
  "pallet": "LimitOrders",
  "code": "invalid_argument",
  "description": "The order or batch targets the root subnet, netuid 0, which the limit orders pallet does not serve. Check the `netuid` field of the order payload or the `netuid` parameter of the batch call and target a non-root subnet.",
  "source": "pallets/limit-orders/src/lib.rs#L425",
  "docs": "https://www.bittensor.com/docs/errors/chain/RootNetUidNotAllowed"
 },
 "RootNetworkDoesNotExist": {
  "pallet": "SubtensorModule",
  "code": "subnet_not_exists",
  "description": "Root registration or root stake claiming found no root network in chain state, which only happens on misconfigured or freshly bootstrapped chains. Verify netuid 0 exists in `NetworksAdded`.",
  "source": "pallets/subtensor/src/macros/errors.rs#L11",
  "docs": "https://www.bittensor.com/docs/errors/chain/RootNetworkDoesNotExist"
 },
 "RootStakeLocked": {
  "pallet": "SubtensorModule",
  "code": "too_early",
  "description": "A root (netuid 0) exit was attempted before `RootStakeUnlockInterval` blocks elapsed since the coldkey/hotkey's last root stake add, remove, or claim. Applies to `remove_stake` and to move/swap/transfer off root. Check `LastColdkeyHotkeyStakeBlock` against the current block and wait out the hold window (or leave the interval at 0 via sudo if the lock is not intended).",
  "source": "pallets/subtensor/src/macros/errors.rs#L354",
  "docs": "https://www.bittensor.com/docs/errors/chain/RootStakeLocked"
 },
 "RootWeightCapExceeded": {
  "pallet": "SubtensorModule",
  "code": "limit_exceeded",
  "description": "Retired (kept for SCALE index stability on the 463 testnet/devnet runtime): one destination in a `set_root_weights` vector exceeded `RootWeightsCap`. That call is gone; the live guard is `BasketConcentrationCapExceeded` on `swap_basket`.",
  "source": "pallets/subtensor/src/macros/errors.rs#L372",
  "docs": "https://www.bittensor.com/docs/errors/chain/RootWeightCapExceeded"
 },
 "RootWeightSettingDisabled": {
  "pallet": "SubtensorModule",
  "code": "disabled",
  "description": "Retired on current runtimes: the `set_root_weights` extrinsic and its network-wide gate were removed. Funds have no target vector, dividends accumulate in place on their origin subnet and composition changes only through `swap_basket`. Seeing this error means the chain is running an older runtime.",
  "source": "pallets/subtensor/src/macros/errors.rs#L363",
  "docs": "https://www.bittensor.com/docs/errors/chain/RootWeightSettingDisabled"
 },
 "SameAutoStakeHotkeyAlreadySet": {
  "pallet": "SubtensorModule",
  "code": "already_exists",
  "description": "The coldkey tried to set its auto-stake destination on a subnet to the hotkey that is already configured. Read `AutoStakeDestination` for the coldkey and netuid before calling; only a different hotkey is accepted.",
  "source": "pallets/subtensor/src/macros/errors.rs#L269",
  "docs": "https://www.bittensor.com/docs/errors/chain/SameAutoStakeHotkeyAlreadySet"
 },
 "SameNetuid": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "A stake swap or move where coldkey, hotkey, and subnet are all unchanged, so `origin_netuid` equals `destination_netuid` with nothing to transition. Check the call arguments; at least the subnet or one of the keys must differ.",
  "source": "pallets/subtensor/src/macros/errors.rs#L223",
  "docs": "https://www.bittensor.com/docs/errors/chain/SameNetuid"
 },
 "SenderInSignatories": {
  "pallet": "Multisig",
  "code": "invalid_argument",
  "description": "The multisig sender was included in the `other_signatories` list, but that list must contain only the remaining signatories. Remove the sender's own account from `other_signatories` before resubmitting.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/SenderInSignatories"
 },
 "ServingRateLimitExceeded": {
  "pallet": "SubtensorModule",
  "code": "rate_limited",
  "description": "`serve_axon` or `serve_prometheus` was called again before enough blocks passed since the neuron's last serving update. Check the axon's last update block in `Axons` against the `ServingRateLimit` (serving_rate_limit hyperparameter) and wait.",
  "source": "pallets/subtensor/src/macros/errors.rs#L85",
  "docs": "https://www.bittensor.com/docs/errors/chain/ServingRateLimitExceeded"
 },
 "SettingWeightsTooFast": {
  "pallet": "SubtensorModule",
  "code": "rate_limited",
  "description": "The neuron set weights again before `WeightsSetRateLimit` blocks elapsed since its last weight update on that subnet. Check the weights_rate_limit hyperparameter and the neuron's `LastUpdate` entry, then wait the remaining blocks.",
  "source": "pallets/subtensor/src/macros/errors.rs#L81",
  "docs": "https://www.bittensor.com/docs/errors/chain/SettingWeightsTooFast"
 },
 "SignatoriesOutOfOrder": {
  "pallet": "Multisig",
  "code": "invalid_argument",
  "description": "The `other_signatories` list is not sorted in strictly ascending account order, which the multisig pallet requires for a canonical account derivation. Sort the list and remove duplicates before resubmitting.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/SignatoriesOutOfOrder"
 },
 "SlippageTooHigh": {
  "pallet": "SubtensorModule",
  "code": "insufficient_liquidity",
  "description": "A stake, unstake, or move would move the price past the slippage-protection limit (default 5% tolerance). Retry, raise `--rate-tolerance`, or disable protection with `--no-slippage-protection`; check the current price with `btcli subnets price`.",
  "source": "pallets/subtensor/src/macros/errors.rs#L194",
  "docs": "https://www.bittensor.com/docs/errors/chain/SlippageTooHigh"
 },
 "SpaceLimitExceeded": {
  "pallet": "Commitments",
  "code": "limit_exceeded",
  "description": "The commitment would push the account's byte quota for the current epoch over the cap; each `set_commitment` consumes at least 100 bytes. Check `UsedSpaceOf` for the netuid and account against `MaxSpace`, or wait for the next epoch to reset usage.",
  "source": "pallets/commitments/src/lib.rs#L134",
  "docs": "https://www.bittensor.com/docs/errors/chain/SpaceLimitExceeded"
 },
 "SpecVersionNeedsToIncrease": {
  "pallet": "System",
  "code": "invalid_argument",
  "description": "The new runtime's `spec_version` is not greater than the current one, so the upgrade is rejected. Check the `RuntimeVersion` in the new wasm and bump `spec_version` above the version currently on chain.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/SpecVersionNeedsToIncrease"
 },
 "StakeTooLowForRoot": {
  "pallet": "SubtensorModule",
  "code": "insufficient_balance",
  "description": "Retired. `root_register` used to raise this when the root network was full and the hotkey's netuid-0 stake did not exceed the lowest-staked root member; root admission is now burn-based (the coldkey pays the root burn price), so this error is no longer raised.",
  "source": "pallets/subtensor/src/macros/errors.rs#L110",
  "docs": "https://www.bittensor.com/docs/errors/chain/StakeTooLowForRoot"
 },
 "StakeUnavailable": {
  "pallet": "SubtensorModule",
  "code": "insufficient_balance",
  "description": "An unstake or same-subnet stake transfer would dip into stake that is still reserved: the requested alpha exceeds the coldkey's free balance on that subnet after subtracting conviction `Lock` and any miner registration collateral locked against hotkeys the coldkey owns. Check `Lock` and `MinerCollateral` for the netuid; only total stake minus those reservations can move.",
  "source": "pallets/subtensor/src/macros/errors.rs#L176",
  "docs": "https://www.bittensor.com/docs/errors/chain/StakeUnavailable"
 },
 "StakingRateLimitExceeded": {
  "pallet": "SubtensorModule",
  "code": "rate_limited",
  "description": "Staking operations (add_stake, remove_stake, and similar) were submitted faster than the per-block staking rate limit allows for the hotkey-coldkey pair. Space the transactions out and retry in a later block.",
  "source": "pallets/subtensor/src/macros/errors.rs#L95",
  "docs": "https://www.bittensor.com/docs/errors/chain/StakingRateLimitExceeded"
 },
 "StartCallNotReady": {
  "pallet": "SubtensorModule",
  "code": "too_early",
  "description": "`btcli hparams start` was run before `StartCallDelay` blocks elapsed since the subnet was registered. Check readiness with `btcli hparams check-start` and wait for the remainder.",
  "source": "pallets/subtensor/src/macros/errors.rs#L335",
  "docs": "https://www.bittensor.com/docs/errors/chain/StartCallNotReady"
 },
 "StateChangeDenied": {
  "pallet": "Contracts",
  "code": "not_authorized",
  "description": "The contract invoked a state-modifying host function, such as a storage write, transfer, or value-bearing call, while executing in read-only mode. Check whether the enclosing call was made with the read-only flag or from a static context.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/StateChangeDenied"
 },
 "StorageDepositLimitExhausted": {
  "pallet": "Contracts",
  "code": "limit_exceeded",
  "description": "The execution created more storage than the caller's `storage_deposit_limit` allows to be charged. Raise the `storage_deposit_limit` argument or reduce storage usage; a dry-run reports the required `storage_deposit`.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/StorageDepositLimitExhausted"
 },
 "StorageDepositNotEnoughFunds": {
  "pallet": "Contracts",
  "code": "insufficient_balance",
  "description": "The origin's free balance cannot cover the storage deposit limit specified or required for this call. Check the caller's withdrawable balance against the `storage_deposit_limit` argument and the dry-run's reported deposit.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/StorageDepositNotEnoughFunds"
 },
 "StorageOverflow": {
  "pallet": "Drand",
  "code": "internal",
  "description": "Template leftover in the drand pallet for a counter increment overflowing `u32::MAX`; no current code path raises it. If seen, inspect the drand pallet's stored counters for values near the u32 limit.",
  "source": "pallets/drand/src/lib.rs#L262",
  "docs": "https://www.bittensor.com/docs/errors/chain/StorageOverflow"
 },
 "SubNetRegistrationDisabled": {
  "pallet": "SubtensorModule",
  "code": "disabled",
  "description": "Neuron registration is switched off: either the subnet's `NetworkRegistrationAllowed` flag is false, the PoW-specific toggle is off for a pow_register call, or network creation has not opened yet (`NetworkRegistrationStartBlock` is in the future). Check the network_registration_allowed hyperparameter for the netuid.",
  "source": "pallets/subtensor/src/macros/errors.rs#L97",
  "docs": "https://www.bittensor.com/docs/errors/chain/SubNetRegistrationDisabled"
 },
 "SubnetBuybackRateLimitExceeded": {
  "pallet": "SubtensorModule",
  "code": "rate_limited",
  "description": "A subnet buyback operation (staking TAO and immediately burning the acquired alpha, e.g. via `add_stake_burn`) was repeated within its rate-limit window. Wait for the window to pass before retrying the buyback.",
  "source": "pallets/subtensor/src/macros/errors.rs#L287",
  "docs": "https://www.bittensor.com/docs/errors/chain/SubnetBuybackRateLimitExceeded"
 },
 "SubnetDoesNotExist": {
  "pallet": "AdminUtils",
  "code": "subnet_not_exists",
  "description": "The admin-utils call targets a netuid with no registered subnet. Verify the `netuid` argument against `NetworksAdded` (the set of existing subnets) before setting hyperparameters.",
  "source": "pallets/admin-utils/src/lib.rs#L196",
  "docs": "https://www.bittensor.com/docs/errors/chain/SubnetDoesNotExist"
 },
 "SubnetLimitReached": {
  "pallet": "SubtensorModule",
  "code": "limit_exceeded",
  "description": "`register_network` failed because the subnet count is at the network limit and no existing subnet is eligible to be pruned. Check the number of registered subnets (`btcli subnets list`) against the subnet limit and retry once a subnet becomes prunable.",
  "source": "pallets/subtensor/src/macros/errors.rs#L261",
  "docs": "https://www.bittensor.com/docs/errors/chain/SubnetLimitReached"
 },
 "SubnetNotExists": {
  "pallet": "SubtensorModule",
  "code": "subnet_not_exists",
  "description": "The netuid passed to the call does not correspond to a registered subnet. Verify the netuid argument against `NetworksAdded` or `btcli subnets list`; the subnet may also have been dissolved.",
  "source": "pallets/subtensor/src/macros/errors.rs#L178",
  "docs": "https://www.bittensor.com/docs/errors/chain/SubnetNotExists"
 },
 "SubtokenDisabled": {
  "pallet": "SubtensorModule",
  "code": "subtoken_disabled",
  "description": "The subnet's alpha token is not yet enabled, so staking, swapping, and trading on it are blocked until the owner runs `btcli hparams start` after registration. Check readiness with `btcli hparams check-start`.",
  "source": "pallets/subtensor/src/macros/errors.rs#L214",
  "docs": "https://www.bittensor.com/docs/errors/chain/SubtokenDisabled"
 },
 "SwapInputTooLarge": {
  "pallet": "Swap",
  "code": "insufficient_liquidity",
  "description": "The swap's net input after fees exceeds 1000 times the input-side reserve, the pallet's hard per-trade cap. Compare the input amount against the subnet's input-side reserve (TAO or alpha) and split the trade if needed.",
  "source": "pallets/swap/src/pallet/mod.rs#L179",
  "docs": "https://www.bittensor.com/docs/errors/chain/SwapInputTooLarge"
 },
 "SwapReturnedZero": {
  "pallet": "LimitOrders",
  "code": "insufficient_liquidity",
  "description": "The netted pool swap in `execute_batched_orders` produced zero output for a non-zero input, meaning the pool lacks liquidity or the derived price limit clamped the swap entirely. Check the subnet pool's reserves and the batch's tightest slippage-derived price limit.",
  "source": "pallets/limit-orders/src/lib.rs#L423",
  "docs": "https://www.bittensor.com/docs/errors/chain/SwapReturnedZero"
 },
 "SymbolAlreadyInUse": {
  "pallet": "SubtensorModule",
  "code": "already_exists",
  "description": "The token symbol requested for the subnet is already assigned to another subnet. Scan `TokenSymbol` across netuids and pick a symbol that is not taken.",
  "source": "pallets/subtensor/src/macros/errors.rs#L249",
  "docs": "https://www.bittensor.com/docs/errors/chain/SymbolAlreadyInUse"
 },
 "SymbolDoesNotExist": {
  "pallet": "SubtensorModule",
  "code": "not_found",
  "description": "The requested token symbol is not in the chain's predefined symbol table, so it cannot be assigned to a subnet. Check the symbol argument against the chain's built-in `SYMBOLS` list and choose a valid entry.",
  "source": "pallets/subtensor/src/macros/errors.rs#L247",
  "docs": "https://www.bittensor.com/docs/errors/chain/SymbolDoesNotExist"
 },
 "TargetBlockNumberInPast": {
  "pallet": "Scheduler",
  "code": "invalid_argument",
  "description": "The scheduler was given a dispatch block that is not in the future. Compare the `when` argument against the current block number and choose a strictly later block.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/TargetBlockNumberInPast"
 },
 "TempoOutOfBounds": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The subnet owner gave `sudo_set_tempo` a tempo outside the allowed MIN_TEMPO to MAX_TEMPO range (360-50,400 blocks). Check the tempo argument against those chain constants and pick a value inside the bounds; only root may set a tempo outside them.",
  "source": "pallets/subtensor/src/macros/errors.rs#L317",
  "docs": "https://www.bittensor.com/docs/errors/chain/TempoOutOfBounds"
 },
 "TerminatedInConstructor": {
  "pallet": "Contracts",
  "code": "internal",
  "description": "The contract called `seal_terminate` inside its constructor, self-destructing during instantiation, which is forbidden. Inspect the constructor logic; termination is only allowed in regular message calls.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/TerminatedInConstructor"
 },
 "TerminatedWhileReentrant": {
  "pallet": "Contracts",
  "code": "invalid_argument",
  "description": "`seal_terminate` was called on a contract that appears more than once on the call stack, so termination was refused. Check the call chain for reentrant calls into the contract being terminated.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/TerminatedWhileReentrant"
 },
 "TimelockRevealFailedNotAllowed": {
  "pallet": "Commitments",
  "code": "invalid_argument",
  "description": "The submitted commitment contains `TimelockRevealFailed`, a terminal audit state that only the runtime may create after an automatic reveal fails. Submit a `TimelockEncrypted` field instead.",
  "source": "pallets/commitments/src/lib.rs#L138",
  "docs": "https://www.bittensor.com/docs/errors/chain/TimelockRevealFailedNotAllowed"
 },
 "TooBig": {
  "pallet": "Preimage",
  "code": "limit_exceeded",
  "description": "The preimage exceeds the maximum size the pallet will store on-chain (4 MiB). Check the byte length of the preimage against the pallet's `MAX_SIZE` limit before noting it.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/TooBig"
 },
 "TooFew": {
  "pallet": "Preimage",
  "code": "invalid_argument",
  "description": "The bulk preimage upgrade was requested with zero hashes, so there is nothing to do. Pass at least one hash to `ensure_updated`.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/TooFew"
 },
 "TooFewSignatories": {
  "pallet": "Multisig",
  "code": "invalid_argument",
  "description": "The multisig signatory list is too short: `other_signatories` must contain at least one account besides the sender. Check the length of `other_signatories` against the threshold you are using.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/TooFewSignatories"
 },
 "TooMany": {
  "pallet": "Preimage",
  "code": "limit_exceeded",
  "description": "A limit was exceeded: more preimage hashes than `MAX_HASH_UPGRADE_BULK_COUNT` were passed to `ensure_updated`, or the account has hit its proxy or announcement cap. Check the account's `Proxies` and `Announcements` entries against `MaxProxies` and `MaxPending`.",
  "source": "pallets/proxy/src/lib.rs#L798",
  "docs": "https://www.bittensor.com/docs/errors/chain/TooMany"
 },
 "TooManyCalls": {
  "pallet": "Utility",
  "code": "limit_exceeded",
  "description": "The batch submitted to the utility pallet contains more calls than the batched-calls limit allows. Check the length of the `calls` vector and split the work across multiple smaller `batch`, `batch_all`, or `force_batch` submissions.",
  "source": "pallets/utility/src/lib.rs#L169",
  "docs": "https://www.bittensor.com/docs/errors/chain/TooManyCalls"
 },
 "TooManyChildren": {
  "pallet": "SubtensorModule",
  "code": "limit_exceeded",
  "description": "`set_children` was called with more than 5 child hotkeys for a parent on the subnet. Trim the children list to at most 5 entries.",
  "source": "pallets/subtensor/src/macros/errors.rs#L152",
  "docs": "https://www.bittensor.com/docs/errors/chain/TooManyChildren"
 },
 "TooManyFieldsInCommitmentInfo": {
  "pallet": "Commitments",
  "code": "limit_exceeded",
  "description": "The `CommitmentInfo` passed to `set_commitment` contains more entries in `fields` than the pallet's `MaxFields` config allows. Count the fields in the `info` argument and trim to the `MaxFields` limit.",
  "source": "pallets/commitments/src/lib.rs#L130",
  "docs": "https://www.bittensor.com/docs/errors/chain/TooManyFieldsInCommitmentInfo"
 },
 "TooManyFreezes": {
  "pallet": "Balances",
  "code": "limit_exceeded",
  "description": "The account already has the maximum number of balance freezes, so a new freeze cannot be added. Check the account's `Freezes` entry against the `MaxFreezes` constant; an existing freeze must be thawed first.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/TooManyFreezes"
 },
 "TooManyHolds": {
  "pallet": "Balances",
  "code": "limit_exceeded",
  "description": "The account already carries the maximum number of balance holds, one per hold reason variant. Check the account's `Holds` entry; an existing hold must be released before a new reason can place another.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/TooManyHolds"
 },
 "TooManyPendingExtrinsics": {
  "pallet": "MevShield",
  "code": "limit_exceeded",
  "description": "`store_encrypted` was rejected because the shield pallet's queue of encrypted extrinsics is already at capacity. Compare the `PendingExtrinsics` count against `MaxPendingExtrinsicsLimit` and wait for queued items to be processed or expire.",
  "source": "pallets/shield/src/lib.rs#L238",
  "docs": "https://www.bittensor.com/docs/errors/chain/TooManyPendingExtrinsics"
 },
 "TooManyRegistrationsThisBlock": {
  "pallet": "SubtensorModule",
  "code": "rate_limited",
  "description": "Registrations in the current block already reached the subnet's per-block cap (`MaxRegistrationsPerBlock`, the max_regs_per_block hyperparameter); root registration enforces the same cap on netuid 0. Retry in the next block.",
  "source": "pallets/subtensor/src/macros/errors.rs#L61",
  "docs": "https://www.bittensor.com/docs/errors/chain/TooManyRegistrationsThisBlock"
 },
 "TooManyRegistrationsThisInterval": {
  "pallet": "SubtensorModule",
  "code": "rate_limited",
  "description": "Registrations in the current interval reached the cap of three times `TargetRegistrationsPerInterval` for the subnet. Compare `RegistrationsThisInterval` against that hyperparameter and wait for the next interval to start.",
  "source": "pallets/subtensor/src/macros/errors.rs#L99",
  "docs": "https://www.bittensor.com/docs/errors/chain/TooManyRegistrationsThisInterval"
 },
 "TooManyReserves": {
  "pallet": "Balances",
  "code": "limit_exceeded",
  "description": "The account already has the maximum number of named reserves. Check the account's `Reserves` entry against the `MaxReserves` constant; a named reserve must be unreserved before adding another.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/TooManyReserves"
 },
 "TooManySignatories": {
  "pallet": "Multisig",
  "code": "limit_exceeded",
  "description": "The multisig signatory list exceeds the maximum allowed. Compare the length of `other_signatories` plus the sender against the pallet's `MaxSignatories` constant.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/TooManySignatories"
 },
 "TooManyStakingHotkeys": {
  "pallet": "SubtensorModule",
  "code": "limit_exceeded",
  "description": "The coldkey already stakes through the maximum number of hotkeys, either its own cap or the smaller cap that third-party stake transfers may fill. Stake to a hotkey the coldkey already stakes through, or unstake from unused hotkeys first.",
  "source": "pallets/subtensor/src/macros/errors.rs#L382",
  "docs": "https://www.bittensor.com/docs/errors/chain/TooManyStakingHotkeys"
 },
 "TooManyTopics": {
  "pallet": "Contracts",
  "code": "limit_exceeded",
  "description": "The number of topics passed to `seal_deposit_event` exceeds the schedule's `event_topics` limit. Reduce the number of indexed topics in the contract's event definition or compare against the schedule limit.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/TooManyTopics"
 },
 "TooManyUIDsPerMechanism": {
  "pallet": "SubtensorModule",
  "code": "limit_exceeded",
  "description": "Setting max UIDs or mechanism count would make max_uids times mechanism_count exceed the chain default of 256 UIDs per subnet. Check `MaxAllowedUids` and the subnet's mechanism count so their product stays within the limit.",
  "source": "pallets/subtensor/src/macros/errors.rs#L279",
  "docs": "https://www.bittensor.com/docs/errors/chain/TooManyUIDsPerMechanism"
 },
 "TooManyUnrevealedCommits": {
  "pallet": "SubtensorModule",
  "code": "limit_exceeded",
  "description": "`commit_weights` (or a CRv3 commit) failed because the hotkey already has 10 unrevealed commits queued on the subnet. Inspect `WeightCommits` for the hotkey and reveal or let old commits expire before committing again.",
  "source": "pallets/subtensor/src/macros/errors.rs#L180",
  "docs": "https://www.bittensor.com/docs/errors/chain/TooManyUnrevealedCommits"
 },
 "TooSoon": {
  "pallet": "Grandpa",
  "code": "rate_limited",
  "description": "A forced GRANDPA authority change was signalled too soon after the previous one. Check the Grandpa `NextForced` storage and wait until the current block passes it before signalling another forced change.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/TooSoon"
 },
 "TransactionMustComeFromEOA": {
  "pallet": "EVM",
  "code": "not_authorized",
  "description": "Rejected per EIP-3607: the sender address has contract code deployed, and transactions must originate from externally owned accounts. Check `eth_getCode` for the `source` address and sign with a plain EOA key instead.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/TransactionMustComeFromEOA"
 },
 "TransactorAccountShouldBeHotKey": {
  "pallet": "SubtensorModule",
  "code": "not_authorized",
  "description": "The extrinsic must be signed by the hotkey itself, but a different account (typically the coldkey) was the origin. Check which key signs the transaction; calls like axon serving expect the hotkey as origin.",
  "source": "pallets/subtensor/src/macros/errors.rs#L101",
  "docs": "https://www.bittensor.com/docs/errors/chain/TransactorAccountShouldBeHotKey"
 },
 "TransferDisallowed": {
  "pallet": "SubtensorModule",
  "code": "disabled",
  "description": "A stake transfer or cross-subnet move was attempted while the origin or destination subnet has stake transfers switched off. Check the `TransferToggle` storage for both netuids involved; the subnet owner must enable transfers first.",
  "source": "pallets/subtensor/src/macros/errors.rs#L196",
  "docs": "https://www.bittensor.com/docs/errors/chain/TransferDisallowed"
 },
 "TransferFailed": {
  "pallet": "Contracts",
  "code": "insufficient_balance",
  "description": "A balance transfer performed during the contract call failed, most likely because the sender lacks enough free balance. Check the transferring account's free balance against the `value` being sent, accounting for the existential deposit.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/TransferFailed"
 },
 "TrimmingWouldExceedMaxImmunePercentage": {
  "pallet": "SubtensorModule",
  "code": "limit_exceeded",
  "description": "Trimming the subnet's UIDs cannot proceed because immune neurons would make up at least the maximum immune share (80%) of the reduced slot count. Check neurons still in `ImmunityPeriod` and retry after their immunity lapses or with a higher max UID target.",
  "source": "pallets/subtensor/src/macros/errors.rs#L273",
  "docs": "https://www.bittensor.com/docs/errors/chain/TrimmingWouldExceedMaxImmunePercentage"
 },
 "TxChildkeyTakeRateLimitExceeded": {
  "pallet": "SubtensorModule",
  "code": "rate_limited",
  "description": "`set_childkey_take` was called again for the hotkey on this subnet before its rate-limit window elapsed. Check the block of the last childkey-take change against `TxChildkeyTakeRateLimit` and wait out the remainder.",
  "source": "pallets/subtensor/src/macros/errors.rs#L170",
  "docs": "https://www.bittensor.com/docs/errors/chain/TxChildkeyTakeRateLimitExceeded"
 },
 "TxRateLimitExceeded": {
  "pallet": "SubtensorModule",
  "code": "rate_limited",
  "description": "An owner or admin transaction (e.g. `set_children`, tempo or hyperparameter updates, setting the owner hotkey) was repeated within its rate-limit window for that key and subnet. Check when the same transaction type last succeeded and wait for the limit to pass.",
  "source": "pallets/subtensor/src/macros/errors.rs#L154",
  "docs": "https://www.bittensor.com/docs/errors/chain/TxRateLimitExceeded"
 },
 "UidMapCouldNotBeCleared": {
  "pallet": "SubtensorModule",
  "code": "internal",
  "description": "During a UID reshuffle or trim, clearing the subnet's `Uids` map left residual entries (the storage clear returned a cursor). Internal state inconsistency rather than a caller error; inspect the `Uids` storage for the netuid and report it.",
  "source": "pallets/subtensor/src/macros/errors.rs#L271",
  "docs": "https://www.bittensor.com/docs/errors/chain/UidMapCouldNotBeCleared"
 },
 "UidVecContainInvalidOne": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The weight submission includes a UID that is not registered on the subnet, i.e. at least one entry is not below `SubnetworkN`. Check the `uids` argument against the subnet's neuron count in the metagraph (`btcli subnets metagraph`).",
  "source": "pallets/subtensor/src/macros/errors.rs#L56",
  "docs": "https://www.bittensor.com/docs/errors/chain/UidVecContainInvalidOne"
 },
 "UidsLengthExceedUidsInSubNet": {
  "pallet": "SubtensorModule",
  "code": "limit_exceeded",
  "description": "The weight submission contains more UID entries than there are neurons registered on the subnet. Compare the length of the `uids` argument against `SubnetworkN` for the netuid and trim the vector.",
  "source": "pallets/subtensor/src/macros/errors.rs#L87",
  "docs": "https://www.bittensor.com/docs/errors/chain/UidsLengthExceedUidsInSubNet"
 },
 "UnableToRecoverPublicKey": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "While associating an EVM key, the secp256k1 public key recovered from the supplied signature could not be parsed. Check that the signature was produced by signing the expected EIP-191 message (hotkey plus block hash) with the EVM private key.",
  "source": "pallets/subtensor/src/macros/errors.rs#L210",
  "docs": "https://www.bittensor.com/docs/errors/chain/UnableToRecoverPublicKey"
 },
 "Unannounced": {
  "pallet": "Proxy",
  "code": "too_early",
  "description": "The proxied call was executed before its announcement matured, or no matching announcement exists at all. Check the proxy's `Announcements` entry for the call hash and the `delay` on the proxy registration; enough blocks must elapse between `announce` and `proxy_announced`.",
  "source": "pallets/proxy/src/lib.rs#L810",
  "docs": "https://www.bittensor.com/docs/errors/chain/Unannounced"
 },
 "Unauthorized": {
  "pallet": "System",
  "code": "not_authorized",
  "description": "In System, the code passed to `apply_authorized_upgrade` does not hash to the value in `AuthorizedUpgrade`. In LimitOrders, the caller is not the order's signer, who alone may cancel it. Check the code hash against the authorization, or the sender against the order's `signer`.",
  "source": "pallets/limit-orders/src/lib.rs#L421",
  "docs": "https://www.bittensor.com/docs/errors/chain/Unauthorized"
 },
 "Undefined": {
  "pallet": "EVM",
  "code": "internal",
  "description": "Catch-all EVM validation error for cases without a dedicated variant, such as a malformed EIP-7702 authorization list or an unknown validation failure. Inspect the raw transaction for unsupported fields and check the node logs.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/Undefined"
 },
 "Underflow": {
  "pallet": "Crowdloan",
  "code": "internal",
  "description": "A checked subtraction underflowed in crowdloan accounting, e.g. `raised` exceeding `cap` when computing remaining room, or a contributor count decrement, indicating inconsistent state. Inspect the `Crowdloans` and `Contributions` entries for the `crowdloan_id`.",
  "source": "pallets/crowdloan/src/lib.rs#L277",
  "docs": "https://www.bittensor.com/docs/errors/chain/Underflow"
 },
 "UnexpectedTimepoint": {
  "pallet": "Multisig",
  "code": "invalid_argument",
  "description": "A timepoint was supplied but no multisig operation is underway for this call hash; the first approval must open the operation with no timepoint. Pass `maybe_timepoint: None` on the opening call, or verify the call hash matches an existing `Multisigs` entry.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/UnexpectedTimepoint"
 },
 "UnexpectedUnreserveLeftover": {
  "pallet": "Commitments",
  "code": "internal",
  "description": "While lowering a commitment deposit, `Currency::unreserve` failed to return the full difference, leaving a leftover, which signals an internal inconsistency. Check the account's reserved balance against the deposit recorded in `CommitmentOf`.",
  "source": "pallets/commitments/src/lib.rs#L136",
  "docs": "https://www.bittensor.com/docs/errors/chain/UnexpectedUnreserveLeftover"
 },
 "UnlockAmountTooHigh": {
  "pallet": "SubtensorModule",
  "code": "insufficient_balance",
  "description": "An unlock requested more alpha than remains locked for the coldkey on that subnet. Check the lock's remaining decaying locked mass in the `Lock` storage entry and request at most that amount.",
  "source": "pallets/subtensor/src/macros/errors.rs#L313",
  "docs": "https://www.bittensor.com/docs/errors/chain/UnlockAmountTooHigh"
 },
 "Unproxyable": {
  "pallet": "Proxy",
  "code": "not_authorized",
  "description": "The attempted call is not permitted by the registered proxy type's call filter. Check which `proxy_type` the sender holds in the real account's `Proxies` entry and whether that type's `InstanceFilter` allows this specific call.",
  "source": "pallets/proxy/src/lib.rs#L804",
  "docs": "https://www.bittensor.com/docs/errors/chain/Unproxyable"
 },
 "Unreachable": {
  "pallet": "MevShield",
  "code": "internal",
  "description": "`announce_next_key` could not identify the current block author via the `FindAuthors` lookup, which should be impossible in a normally authored block. Check the block's author digest and the shield pallet's authorship wiring.",
  "source": "pallets/shield/src/lib.rs#L236",
  "docs": "https://www.bittensor.com/docs/errors/chain/Unreachable"
 },
 "UnverifiedPulse": {
  "pallet": "Drand",
  "code": "invalid_argument",
  "description": "Declared for drand pulses that fail validity checks, but current code raises `PulseVerificationError` for verification failures and silently skips unverified pulses. If seen on an older runtime, check the pulse signature against `BeaconConfig`.",
  "source": "pallets/drand/src/lib.rs#L266",
  "docs": "https://www.bittensor.com/docs/errors/chain/UnverifiedPulse"
 },
 "ValidatorEmissionAboveMaximum": {
  "pallet": "SubtensorModule",
  "code": "policy_violation",
  "description": "Slot 3 (validator) of the emission weight vector exceeds the 50% ceiling. Validator dividends may draw at most 0.50 of block emission; lower the validator share.",
  "source": "pallets/subtensor/src/macros/errors.rs#L445",
  "docs": "https://www.bittensor.com/docs/errors/chain/ValidatorEmissionAboveMaximum"
 },
 "ValidatorEmissionTooLowToPreserveRoot": {
  "pallet": "SubtensorModule",
  "code": "policy_violation",
  "description": "Slot 3 (validator) of the emission weight vector is at or below root's baseline share. Every block the chain pays root `min(V, r)` of the subnet's emission off the top of the validator slot, where `r = V0 * x / (x + A)` is what root would earn with the default validator share V0 (0.41) and the global TaoWeight (`x` = root TAO times that weight, `A` = the subnet's alpha issuance), recomputed from live state; alpha validators get `V - min(V, r)`. A set with `V <= r` would leave validators nothing, so it is rejected. `btcli subnets emission show --netuid <n>` prints the baseline and the floor for this block. Raise the validator share above it and resubmit.",
  "source": "pallets/subtensor/src/macros/errors.rs#L452",
  "docs": "https://www.bittensor.com/docs/errors/chain/ValidatorEmissionTooLowToPreserveRoot"
 },
 "ValueNotInBounds": {
  "pallet": "AdminUtils",
  "code": "invalid_argument",
  "description": "An admin-utils argument fell outside its allowed range: `min_burn` must be below `MinBurnUpperBound` and the subnet's max burn, `max_burn` above `MaxBurnLowerBound` and the min burn, and `max_epochs_per_block` at least 1. Check the argument against those bounds.",
  "source": "pallets/admin-utils/src/lib.rs#L206",
  "docs": "https://www.bittensor.com/docs/errors/chain/ValueNotInBounds"
 },
 "ValueTooLarge": {
  "pallet": "Contracts",
  "code": "limit_exceeded",
  "description": "A value written to contract storage or emitted as event data exceeds the `MaxValueSize` limit. Compare the size of the stored value or event payload against the runtime's maximum value size constant.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/ValueTooLarge"
 },
 "VestingBalance": {
  "pallet": "Balances",
  "code": "insufficient_balance",
  "description": "The account's balance is locked under a vesting schedule, leaving too little usable balance to send the requested value. Check the account's `Vesting` schedules and its lock in `Locks`, and compare the unvested (still locked) amount against what the transfer needs.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/VestingBalance"
 },
 "VotingPowerTrackingNotEnabled": {
  "pallet": "SubtensorModule",
  "code": "disabled",
  "description": "Disabling voting power tracking was requested on a subnet where tracking is not currently active. Check the `VotingPowerTrackingEnabled` storage flag for the netuid before calling the disable extrinsic.",
  "source": "pallets/subtensor/src/macros/errors.rs#L281",
  "docs": "https://www.bittensor.com/docs/errors/chain/VotingPowerTrackingNotEnabled"
 },
 "WaitingForDissolvedSubnetCleanup": {
  "pallet": "SubtensorModule",
  "code": "too_early",
  "description": "The operation is blocked while a dissolved subnet's storage is still being torn down in the background. Check the `DissolveCleanupQueue` and retry after the on-idle cleanup for that netuid completes.",
  "source": "pallets/subtensor/src/macros/errors.rs#L315",
  "docs": "https://www.bittensor.com/docs/errors/chain/WaitingForDissolvedSubnetCleanup"
 },
 "WeightExceedsAbsoluteMax": {
  "pallet": "MevShield",
  "code": "limit_exceeded",
  "description": "`set_on_initialize_weight` or `set_max_extrinsic_weight` was given a value above the shield pallet's hard cap of half the total block weight. Compare the `value` argument against the `MAX_ON_INITIALIZE_WEIGHT` constant.",
  "source": "pallets/shield/src/lib.rs#L240",
  "docs": "https://www.bittensor.com/docs/errors/chain/WeightExceedsAbsoluteMax"
 },
 "WeightVecLengthIsLow": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The weight submission has fewer entries than the subnet's minimum (setting only a self-weight is the one exception). Compare the vector length against the `MinAllowedWeights` (min_allowed_weights hyperparameter) for the netuid.",
  "source": "pallets/subtensor/src/macros/errors.rs#L58",
  "docs": "https://www.bittensor.com/docs/errors/chain/WeightVecLengthIsLow"
 },
 "WeightVecNotEqualSize": {
  "pallet": "SubtensorModule",
  "code": "invalid_argument",
  "description": "The `uids` and `values` vectors passed to a weight-setting call have different lengths, so they cannot be paired. Check the call arguments; both vectors must have exactly one value per UID.",
  "source": "pallets/subtensor/src/macros/errors.rs#L51",
  "docs": "https://www.bittensor.com/docs/errors/chain/WeightVecNotEqualSize"
 },
 "WithdrawFailed": {
  "pallet": "EVM",
  "code": "insufficient_balance",
  "description": "Withdrawing the transaction fee from the sender's mapped account failed even though the balance check passed, e.g. due to locks, holds, or existential deposit constraints. Check the account's locks and its free versus withdrawable balance.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/WithdrawFailed"
 },
 "WrongTimepoint": {
  "pallet": "Multisig",
  "code": "invalid_argument",
  "description": "The timepoint supplied does not match the one recorded when this multisig operation was opened. Read the correct `when` height and index from the `Multisigs` entry for the call hash and resubmit with that exact timepoint.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/WrongTimepoint"
 },
 "XCMDecodeFailed": {
  "pallet": "Contracts",
  "code": "invalid_argument",
  "description": "The bytes the contract passed to `xcm_execute` or `xcm_send` could not be decoded as a versioned XCM message. Check the XCM encoding and version the contract produces against what the runtime supports.",
  "source": null,
  "docs": "https://www.bittensor.com/docs/errors/chain/XCMDecodeFailed"
 },
 "ZeroBalanceAfterWithdrawn": {
  "pallet": "SubtensorModule",
  "code": "insufficient_balance",
  "description": "Withdrawing TAO from the coldkey (e.g. paying a registration burn or adding stake) would leave the account at zero, below what keeps it alive. Check the coldkey's free balance and leave at least the existential deposit after the amount withdrawn.",
  "source": "pallets/subtensor/src/macros/errors.rs#L46",
  "docs": "https://www.bittensor.com/docs/errors/chain/ZeroBalanceAfterWithdrawn"
 },
 "ZeroShareInBatch": {
  "pallet": "LimitOrders",
  "code": "invalid_argument",
  "description": "An order's pro-rata share of the batch output floored to zero, so the whole batch was rejected rather than consuming that order's input for no payout. Check the order's `amount` relative to the batch totals and retry it in a differently composed batch.",
  "source": "pallets/limit-orders/src/lib.rs#L452",
  "docs": "https://www.bittensor.com/docs/errors/chain/ZeroShareInBatch"
 }
};
