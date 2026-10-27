/**
 * The guide's chapters and the Doctor's rule catalog. Rule ids, slugs and declared severities
 * match the `Rule(...)` lists in src/preflight/core/doctor/rules_*.py; the one line summaries
 * restate each rule's trigger in plain words, and `docs` is the page the rule's finding cites.
 */

import type { Severity } from "./types";

export const GUIDE_SECTIONS = [
  {
    id: "basics",
    number: 1,
    title: "Bittensor in two minutes",
    takeaway: "Subnets are competitions: miners do the work, validators score it, and every tempo the chain pays both in the subnet's own token",
    keywords: ["subnet", "miner", "validator", "tao", "alpha", "uid", "hotkey", "coldkey", "tempo", "basics", "newbie"],
  },
  {
    id: "miner",
    number: 2,
    title: "The life of a miner",
    takeaway: "A miner pays to register, gets a grace period to be noticed, earns only once validators score it, and is replaced if it earns the least",
    keywords: ["register", "burn", "immunity", "pruning", "deregistered", "lifecycle"],
  },
  {
    id: "earns-zero",
    number: 3,
    title: "Why your miner earns zero",
    takeaway: "Zero almost always comes down to one of five causes, and the Doctor checks every one of them against a single block",
    keywords: ["zero", "incentive", "axon", "not scored", "earning nothing"],
  },
  {
    id: "consensus",
    number: 4,
    title: "How consensus clips weights",
    takeaway: "A weight only counts as far as validators holding kappa of the stake agree with it, so one validator alone cannot make a miner earn",
    keywords: ["kappa", "yuma", "clipping", "trust", "consensus"],
  },
  {
    id: "validator",
    number: 5,
    title: "The life of a validator",
    takeaway: "A validator needs enough stake for a permit, must set weights often enough to stay active and no faster than the rate limit",
    keywords: ["permit", "stake", "set_weights", "rate limit", "activity cutoff", "commit reveal"],
  },
  {
    id: "failed-tx",
    number: 6,
    title: "Reading a failed transaction",
    takeaway: "Every failed extrinsic names the pallet and the error that stopped it; the rest is reading the chain state it was checked against",
    keywords: ["extrinsic", "transaction", "error", "TooManyUnrevealedCommits", "events"],
  },
  {
    id: "simulate",
    number: 7,
    title: "Try before you pay",
    takeaway: "The simulator runs your extrinsic against a copy of mainnet, so you see the exact error before you spend a single rao",
    keywords: ["simulator", "fork", "chopsticks", "dry run", "predicted"],
  },
  {
    id: "launch",
    number: 8,
    title: "Launching a subnet",
    takeaway: "A subnet costs a TAO lock that doubles after each registration and decays back, and at 128 subnets a new one replaces another",
    keywords: ["lock cost", "register_network", "start_call", "subnet cap", "128"],
  },
  {
    id: "rules",
    number: 9,
    title: "Rule reference",
    takeaway: "27 rules, each a small pure function over one block of chain state, grouped by who they are for",
    keywords: ["rules", "PF101", "PF201", "PF301", "reference"],
  },
  {
    id: "surfaces",
    number: 10,
    title: "Use it everywhere",
    takeaway: "One engine answers the CLI, the website, the HTTP API, your own Claude, CI and Telegram, with the same JSON",
    keywords: ["cli", "api", "mcp", "claude", "github action", "telegram", "alerts"],
  },
  {
    id: "glossary",
    number: 11,
    title: "Glossary",
    takeaway: "Every term on this page in a sentence or two",
    keywords: ["glossary", "terms", "definitions"],
  },
] as const;

export type GuideSection = (typeof GUIDE_SECTIONS)[number];
export type GuideSectionId = GuideSection["id"];

export type RuleAudience = "miner" | "validator" | "subnet";

export interface RuleInfo {
  id: string;
  slug: string;
  /** The severity the rule is declared with; some findings come out lower, e.g. PF108 during immunity */
  severity: Severity;
  name: string;
  line: string;
  audience: RuleAudience;
  /** The chapter that explains it; `rules` means its own row in the reference */
  section: GuideSectionId;
  docs: string | null;
}

const DOCS = "https://www.bittensor.com/docs";

export const RULES: readonly RuleInfo[] = [
  { id: "PF101", slug: "not_registered", severity: "critical", name: "Not registered", line: "The hotkey holds no UID on this subnet, so no validator can score it", audience: "miner", section: "miner", docs: `${DOCS}/errors/chain/HotKeyNotRegisteredInSubNet` },
  { id: "PF102", slug: "recently_deregistered", severity: "critical", name: "Recently deregistered", line: "It had a UID and lost it: it was the lowest earner out of immunity when someone registered on a full subnet", audience: "miner", section: "miner", docs: `${DOCS}/guides/mining` },
  { id: "PF103", slug: "in_immunity", severity: "info", name: "In immunity", line: "Registered less than ImmunityPeriod blocks ago, so low early rewards are normal and it cannot be pruned yet", audience: "miner", section: "miner", docs: null },
  { id: "PF104", slug: "near_pruning", severity: "high", name: "Near pruning", line: "Out of immunity and among the lowest emission neurons, so the next registration on a full subnet can remove it", audience: "miner", section: "miner", docs: `${DOCS}/guides/mining` },
  { id: "PF105", slug: "axon_not_served", severity: "high", name: "Axon not served", line: "No axon address on chain, on a subnet where most earning miners publish one", audience: "miner", section: "earns-zero", docs: `${DOCS}/guides/mining` },
  { id: "PF106", slug: "axon_bad_address", severity: "high", name: "Axon address unreachable", line: "The axon points at a loopback, private or unspecified address that validators cannot reach", audience: "miner", section: "earns-zero", docs: `${DOCS}/errors/chain/InvalidIpAddress` },
  { id: "PF107", slug: "axon_unreachable", severity: "high", name: "Axon did not answer", line: "A TCP connection to the advertised axon was refused or timed out. Runs only when you ask for a probe", audience: "miner", section: "earns-zero", docs: null },
  { id: "PF108", slug: "no_validator_weight", severity: "critical", name: "No validator weight", line: "No permitted validator's latest weights include this UID, so it earns nothing", audience: "miner", section: "earns-zero", docs: `${DOCS}/guides/mining` },
  { id: "PF109", slug: "weights_from_stale_validators_only", severity: "high", name: "Only stale validators score it", line: "Every validator that scores it is past the activity cutoff, and the epoch ignores their weights", audience: "miner", section: "earns-zero", docs: null },
  { id: "PF110", slug: "incentive_zero_but_weighted", severity: "high", name: "Weighted but clipped", line: "Validators weight it, but they hold less than kappa of the stake, so consensus clips it to zero", audience: "miner", section: "consensus", docs: `${DOCS}/internals/consensus` },
  { id: "PF111", slug: "low_trust", severity: "medium", name: "Low trust", line: "Trust is under half the median of earning miners, so validators disagree about it and part of its weight is clipped", audience: "miner", section: "consensus", docs: `${DOCS}/internals/consensus` },
  { id: "PF112", slug: "duplicate_coldkey_crowding", severity: "info", name: "Coldkey crowding", line: "Five or more UIDs on this subnet share its coldkey, a pattern owners look for. Plenty of honest operators run several", audience: "miner", section: "rules", docs: null },
  { id: "PF113", slug: "version_mismatch", severity: "info", name: "Weights version", line: "The subnet requires a minimum weights version key; validators on older code are rejected", audience: "miner", section: "validator", docs: `${DOCS}/errors/chain/IncorrectWeightVersionKey` },
  { id: "PF201", slug: "no_validator_permit", severity: "high", name: "No validator permit", line: "Has stake but no permit, so setting weights on other UIDs fails with NeuronNoValidatorPermit", audience: "validator", section: "validator", docs: `${DOCS}/errors/chain/NeuronNoValidatorPermit` },
  { id: "PF202", slug: "weights_stale", severity: "critical", name: "Weights stale", line: "Has not set weights within the activity cutoff, so its weights are ignored, or has missed at least an epoch", audience: "validator", section: "validator", docs: `${DOCS}/errors/chain/SettingWeightsTooFast` },
  { id: "PF203", slug: "rate_limited", severity: "info", name: "Rate limited", line: "Set weights less than WeightsSetRateLimit blocks ago, so a new call fails with SettingWeightsTooFast", audience: "validator", section: "validator", docs: `${DOCS}/errors/chain/SettingWeightsTooFast` },
  { id: "PF204", slug: "below_min_stake_for_weights", severity: "high", name: "Below weights minimum stake", line: "Stake weight is below StakeThreshold, so setting weights fails with NotEnoughStakeToSetWeights", audience: "validator", section: "validator", docs: `${DOCS}/errors/chain/NotEnoughStakeToSetWeights` },
  { id: "PF205", slug: "commit_pending_reveal", severity: "info", name: "Commit pending reveal", line: "Committed weights are waiting to be revealed, and they only count once they are", audience: "validator", section: "validator", docs: `${DOCS}/errors/chain/RevealTooEarly` },
  { id: "PF206", slug: "weights_too_few_uids", severity: "high", name: "Weight limits", line: "Its last weights cover fewer than MinAllowedWeights UIDs or put more than MaxWeightsLimit on one", audience: "validator", section: "validator", docs: `${DOCS}/errors/chain/WeightVecLengthIsLow` },
  { id: "PF207", slug: "self_weighting", severity: "medium", name: "Self weighting", line: "Half or more of its weight goes to UIDs under its own coldkey, which looks like self mining", audience: "validator", section: "validator", docs: null },
  { id: "PF208", slug: "copier_signature", severity: "info", name: "Copier signature", line: "Its weights track last epoch's consensus almost exactly, which looks like weight copying. A statistical signal only", audience: "validator", section: "validator", docs: `${DOCS}/guides/timelock` },
  { id: "PF301", slug: "registration_closed", severity: "critical", name: "Registration closed", line: "Registration is switched off, or this block's or this interval's registration slots are used up", audience: "subnet", section: "miner", docs: `${DOCS}/errors/chain/TooManyRegistrationsThisInterval` },
  { id: "PF302", slug: "burn_spiking", severity: "medium", name: "Burn spiking", line: "The registration cost is at least twice its recent average, so registering now pays a premium", audience: "subnet", section: "miner", docs: `${DOCS}/errors/chain/NotEnoughBalanceToStake` },
  { id: "PF303", slug: "emissions_not_started", severity: "high", name: "Emissions not started", line: "The owner has not called start_call yet, so nobody on the subnet earns and staking is blocked", audience: "subnet", section: "launch", docs: `${DOCS}/errors/chain/SubtokenDisabled` },
  { id: "PF304", slug: "near_full_burn", severity: "medium", name: "Near full burn", line: "90% or more of miner incentive goes to the owner's burn UID, so there is little left for real miners", audience: "subnet", section: "earns-zero", docs: `${DOCS}/concepts/emissions` },
  { id: "PF305", slug: "weights_mostly_stale", severity: "high", name: "Validators stale", line: "More than half of the permitted validators have stopped setting weights, so scores barely move", audience: "subnet", section: "earns-zero", docs: null },
  { id: "PF306", slug: "owner_self_mining", severity: "medium", name: "Owner self mining", line: "30% or more of miner incentive goes to other hotkeys under the owner's coldkey. Can be bootstrapping on a young subnet", audience: "subnet", section: "earns-zero", docs: `${DOCS}/concepts/emissions` },
];

const BY_ID = new Map(RULES.map((rule) => [rule.id, rule]));

export function ruleById(id: string): RuleInfo | undefined {
  return BY_ID.get(id);
}

/** Fragment id of a rule's row in the reference, e.g. `pf108` */
export function ruleAnchor(id: string): string {
  return id.toLowerCase();
}

/** Where a Doctor finding's "Learn" link goes: the chapter that explains the rule */
export function guideHref(ruleId: string): string {
  const rule = BY_ID.get(ruleId);
  if (!rule) return "/guide#rules";
  return rule.section === "rules" ? `/guide#${ruleAnchor(rule.id)}` : `/guide#${rule.section}`;
}
