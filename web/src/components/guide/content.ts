/**
 * Guide content. Every number here is a recorded read, cited next to it:
 * - web/src/data/samples/*.json: finney Doctor reports at blocks 9,376,730 and 9,376,731
 * - docs/demo-output/tx-mainnet.json: extrinsic 9376733-28
 * - docs/demo-output/plan.txt: the launch planner at block 9,377,485
 * - docs/decisions/001-simulator.md: simulator measurements
 * - SN64 hyperparameters from the recorded subnet detail in web/src/data/demo/subnets.ts
 * Bittensor facts follow https://www.bittensor.com/docs and the rule code in src/preflight/core/doctor
 */

export interface StageRisk {
  rule: string;
  text: string;
}

export interface MinerStage {
  id: string;
  label: string;
  title: string;
  happens: string;
  fact: { label: string; value: string };
  risks: StageRisk[];
}

export const MINER_STAGES: MinerStage[] = [
  {
    id: "register",
    label: "Register",
    title: "Register: burn TAO for a UID",
    happens:
      "Your coldkey pays the registration cost and your hotkey gets a UID, a numbered seat on the subnet. The TAO is recycled, not staked, so deregistering does not refund it. By default the price rises 1.26 times with each registration and halves every 360 quiet blocks",
    fact: { label: "SN64 at block 9,376,731", value: "0.0005 TAO to register, 256 of 256 seats in use" },
    risks: [
      { rule: "PF101", text: "The hotkey holds no UID on the subnet you are checking, often because it registered on another netuid" },
      { rule: "PF301", text: "Registration is switched off, or this block's or this interval's slots are already taken" },
      { rule: "PF302", text: "The burn spiked during a registration rush, so registering now pays a premium" },
    ],
  },
  {
    id: "immunity",
    label: "Immunity",
    title: "Immunity: a grace period to get noticed",
    happens:
      "For ImmunityPeriod blocks after registering, the neuron cannot be pruned. Validators use this time to find your axon and start scoring you, so zero rewards here are normal. What matters is being reachable and scored before it ends",
    fact: { label: "SN64 immunity period", value: "5,000 blocks, about 16.7 h" },
    risks: [
      { rule: "PF103", text: "Informational: how many blocks of immunity are left and the block it ends" },
      { rule: "PF105", text: "No axon on chain, on a subnet where earning miners publish one, so validators have nowhere to send queries" },
      { rule: "PF106", text: "The axon points at 127.0.0.1, a LAN address or 0.0.0.0, which validators cannot reach" },
    ],
  },
  {
    id: "scored",
    label: "Scored",
    title: "Scored: validators query you and set weights",
    happens:
      "Validators send your miner the subnet's task, score the answers and write the scores to the chain as weights. Only validators with a permit count, and only their latest weights",
    fact: { label: "SN64 UID 0 at block 9,376,730", value: "0 of 17 validators weighting it" },
    risks: [
      { rule: "PF108", text: "No permitted validator's latest weights include your UID" },
      { rule: "PF109", text: "Only validators past the activity cutoff score you, and the epoch ignores their weights" },
      { rule: "PF110", text: "You are weighted, but by less than kappa of the stake, so consensus clips you to zero" },
    ],
  },
  {
    id: "earning",
    label: "Earning",
    title: "Earning: incentive becomes emission every tempo",
    happens:
      "Every tempo the epoch turns weights into incentive, and your share of the miner emission is paid to your hotkey in the subnet's alpha. Pruning goes by emission, so staying above the weakest neurons is what keeps the seat",
    fact: { label: "SN64 UID 207 at block 9,376,730", value: "23.34 alpha per tempo" },
    risks: [
      { rule: "PF111", text: "Trust is low: validators disagree about you, so part of your weight is clipped away" },
      { rule: "PF104", text: "Out of immunity and among the lowest emission neurons on a full subnet" },
    ],
  },
  {
    id: "pruned",
    label: "Pruned",
    title: "Or pruned: replaced by a new registration",
    happens:
      "When a full subnet takes a new registration, the runtime removes the neuron with the lowest emission that is out of immunity, and the older registration goes first on a tie. The hotkey loses its UID and has to register, and pay, again",
    fact: { label: "SN64 at block 9,376,731", value: "256 of 256 seats taken, so every registration prunes one neuron" },
    risks: [
      { rule: "PF104", text: "Warns before it happens: shows the pruning rank and the emission of the next neuron up" },
      { rule: "PF102", text: "It already happened: the block it lost the seat and what it earned just before" },
    ],
  },
];

export interface ValidatorGate {
  check: string;
  param: string;
  value: string;
  error: string;
  rule: string;
  what: string;
}

/** Checks a set_weights call has to pass. SN64 values are from the recorded subnet detail */
export const SET_WEIGHTS_GATES: ValidatorGate[] = [
  {
    check: "Permit",
    param: "MaxAllowedValidators",
    value: "64 permits on SN64",
    error: "NeuronNoValidatorPermit",
    rule: "PF201",
    what: "Each epoch the top neurons by stake weight get a permit. Without one, weights on other UIDs are refused",
  },
  {
    check: "Stake",
    param: "StakeThreshold",
    value: "about 1,000 TAO equivalent on mainnet",
    error: "NotEnoughStakeToSetWeights",
    rule: "PF204",
    what: "The hotkey's stake weight must reach the threshold. The subnet owner's hotkey is exempt",
  },
  {
    check: "Version",
    param: "WeightsVersionKey",
    value: "0 on SN64, so not enforced",
    error: "IncorrectWeightVersionKey",
    rule: "PF113",
    what: "When the owner sets a version key, validators must send at least that version",
  },
  {
    check: "Rate limit",
    param: "WeightsSetRateLimit",
    value: "100 blocks on SN64, about 20 min",
    error: "SettingWeightsTooFast",
    rule: "PF203",
    what: "A validator must wait this many blocks after its last weights before sending new ones",
  },
  {
    check: "Shape",
    param: "MinAllowedWeights, MaxWeightsLimit",
    value: "1 UID and 100% on SN64",
    error: "WeightVecLengthIsLow, MaxWeightExceeded",
    rule: "PF206",
    what: "Weights must cover enough UIDs and keep each single weight under the cap",
  },
];

export interface AfterLanding {
  check: string;
  value: string;
  rule: string;
  what: string;
}

export const AFTER_LANDING: AfterLanding[] = [
  {
    check: "Activity cutoff",
    value: "5,000 blocks on SN64, about 16.7 h",
    rule: "PF202",
    what: "No error, which is why this one hurts: weights older than the cutoff are silently ignored and earn no dividends",
  },
  {
    check: "Commit reveal",
    value: "Off on SN64; up to 10 unrevealed commits per hotkey where it is on",
    rule: "PF205",
    what: "Weights are encrypted to a future drand round and only count once the chain reveals them",
  },
  {
    check: "Self weighting",
    value: "Half or more of the weight to its own coldkey",
    rule: "PF207",
    what: "Looks like self mining. A signal, never a verdict",
  },
  {
    check: "Copier signature",
    value: "Correlation above 0.98 with last epoch's consensus",
    rule: "PF208",
    what: "Looks like weight copying, which commit reveal exists to stop. A statistical signal only",
  },
];

/** SN26 validators from the PF108 evidence in doctor_multi_subnet.json, block 9,376,730 */
export const SN26_FRESHNESS = {
  block: 9_376_730,
  staleAfter: 720,
  rows: [
    { uid: 143, stake: "209,026 alpha", blocks: 26, ago: "about 5 min" },
    { uid: 0, stake: "1,403,238 alpha", blocks: 88, ago: "about 18 min" },
    { uid: 152, stake: "168,774 alpha", blocks: 49_757, ago: "about 6.9 days" },
    { uid: 45, stake: "5,059 alpha", blocks: 955_951, ago: "about 132.8 days" },
    { uid: 36, stake: "5,016 alpha", blocks: 1_003_768, ago: "about 139.4 days" },
  ],
};

/** docs/demo-output/tx-mainnet.json, read from finney at block 9,376,733 */
export const FAILED_TX = {
  ref: "9376733-28",
  block: 9_376_733,
  index: 28,
  hash: "0xec72cb3b448c58cfbdb44325844e166979996d42b8f24704f72ebaa1a08bdcbf",
  blockHash: "0x9e97be11369d9a9b18e0153ab07e85ee757182bc4b87d763d10bffe459b14faf",
  runtime: 486,
  signer: "5FLoWCDovMPeH3Gv4syQSZ8TuKcMv6N27g8diDU8zJSeRv8m",
  pallet: "SubtensorModule",
  call: "commit_timelocked_mechanism_weights",
  args: [
    { name: "netuid", value: "SN28", note: "The subnet, SayGM in the directory" },
    { name: "mecid", value: "0", note: "Mechanism id. A subnet can run more than one incentive mechanism; 0 is the first" },
    { name: "commit", value: "0xa7ef6501... (869 bytes)", note: "The weights, encrypted so nobody can read or copy them yet" },
    { name: "reveal_round", value: "33441416", note: "The drand round whose pulse lets the chain decrypt them" },
    { name: "commit_reveal_version", value: "4", note: "The commit format version" },
  ],
  events: [
    { index: 0, pallet: "TransactionPayment", name: "TransactionFeePaid", summary: "Fee paid 0.000000000 TAO", fail: false },
    { index: 1, pallet: "System", name: "ExtrinsicFailed", summary: "Failed with SubtensorModule.TooManyUnrevealedCommits", fail: true },
  ],
  error: { pallet: "SubtensorModule", name: "TooManyUnrevealedCommits", code: "limit_exceeded", source: "pallets/subtensor/src/macros/errors.rs#L180" },
  explanation: "Before this block the hotkey already had 10 unrevealed commits queued on the subnet, so the runtime refused another",
  fix: {
    kind: "wait" as const,
    text: "Let the queued commits reveal (timelocked commits reveal on their drand round) before committing again",
  },
  docs: "https://www.bittensor.com/docs/errors/chain/TooManyUnrevealedCommits",
};

/** docs/decisions/001-simulator.md: the SDK's plan() said ok, the chain said no */
export const PLAN_VS_CHAIN = [
  { intent: "BurnedRegister from a coldkey with 0 TAO", chain: "Rejected: cannot pay fees" },
  { intent: "SetWeights signed by a miner hotkey with no permit", chain: "NeuronNoValidatorPermit" },
  { intent: "StartCall on SN64 from a stranger", chain: "NotSubnetOwner or FirstEmissionBlockNumberAlreadySet" },
];

/** docs/decisions/001-simulator.md, measured on a fork of finney block 9,376,889, all on SN64 */
export const FORK_RESULTS = [
  { action: "burned_register", setup: "Coldkey with 0 TAO", result: "Err(Invalid(Payment))", ok: false, time: "10.8 s, first use" },
  { action: "burned_register", setup: "Balance overridden to 10 TAO", result: "Ok", ok: true, time: "222 s cold, about 2 s once cached" },
  { action: "burned_register", setup: "Balance overridden to 0.0001 TAO", result: "Err(Invalid(Payment))", ok: false, time: "1.8 s" },
  { action: "serve_axon", setup: "Axon at 127.0.0.1", result: "InvalidIpAddress", ok: false, time: "9.0 s" },
  { action: "start_call", setup: "A stranger with 0 TAO", result: "Err(Invalid(Payment))", ok: false, time: "4.5 s" },
];

/** docs/demo-output/sim-zero-tao.txt, predicted at block 9,377,481 */
export const ZERO_TAO_CHECKS = [
  { label: "Balance covers the fee", pass: false, value: "0.000000 TAO free for a 0.001071 fee" },
  { label: "Registration open", pass: true, value: "NetworkRegistrationAllowed is True" },
  { label: "Per block cap", pass: true, value: "0 of 1 used this block" },
  { label: "Per interval cap", pass: true, value: "0 of 3 used this interval" },
  { label: "Hotkey not already registered", pass: true, value: "no UID yet" },
  { label: "Balance covers burn and fee", pass: false, value: "0.0000 TAO free, needs 0.0005 burn + 0.001071 fee" },
];

/** docs/demo-output/plan.txt, finney at block 9,377,485 */
export const LAUNCH = {
  block: 9_377_485,
  lockCost: 346.366,
  floor: 1,
  lastLock: 224.64,
  decayPerBlock: 0.0078,
  floorAt: 9_421_762,
  nextAllowed: 9_378_690,
  costAtNextAllowed: 336.9668,
  rateLimit: 14_400,
  subnets: 128,
  cap: 128,
  replaced: "SN16 Zero Hour",
  firstEmissions: 9_379_051,
  immunity: 432_000,
  immunityEnds: 9_810_690,
  tempo: 360,
};

/** The first lines of docs/demo-output/doctor-mainnet.txt, a real run against finney */
export const DOCTOR_OUTPUT = [
  " BROKEN   UID 0 on SN64 earns nothing because no validator has scored it",
  "finney at block 9,377,476, runtime 486  4,451 ms",
  "",
  " CRITICAL PF108 No validator has scored this UID",
  "  Validators weighting this UID  0 of 17",
  "  UID 1 (5DU1dv...S7ww)          stake 1,385,572 alpha, last set weights 163 blocks (about 33 min) ago",
  "  UID 252 (5E2LP6...eZ5u)        stake 908,518 alpha, last set weights 164 blocks (about 33 min) ago",
];
