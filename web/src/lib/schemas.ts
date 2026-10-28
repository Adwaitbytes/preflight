/**
 * Runtime schemas for data that crosses a file or network boundary as untyped JSON.
 * Each schema is checked against the generated contract type, so drift fails the typecheck.
 */

import { z } from "zod";
import type { DoctorReport, EpochCheck, EpochPreview, IncentiveChange, LiveFeed, SimResult, TxReport, Weather } from "./types";

const severity = z.enum(["critical", "high", "medium", "info"]);
const verdict = z.enum(["healthy", "warning", "broken"]);

const chainRef = z.object({
  network: z.enum(["local", "test", "finney", "custom"]),
  endpoint: z.string(),
  block: z.number().int(),
  block_hash: z.string(),
  runtime_spec: z.number().int().nullish(),
});

const evidence = z.object({ label: z.string(), value: z.string(), source: z.string().nullish() });
const fix = z.object({ kind: z.enum(["command", "code", "wait", "info"]), text: z.string(), note: z.string().nullish() });

const finding = z.object({
  id: z.string(),
  rule: z.string(),
  severity,
  title: z.string(),
  evidence: z.array(evidence),
  explanation: z.string(),
  fix: fix.nullish(),
  docs: z.string().nullish(),
});

const neuron = z.object({
  uid: z.number().int(),
  hotkey: z.string(),
  coldkey: z.string(),
  active: z.boolean(),
  validator_permit: z.boolean(),
  stake: z.number(),
  incentive: z.number(),
  trust: z.number(),
  consensus: z.number(),
  dividends: z.number(),
  emission: z.number(),
  last_update: z.number().int(),
  block_at_registration: z.number().int(),
  axon: z.object({ ip: z.string(), port: z.number().int(), ip_type: z.number().int().optional() }).nullish(),
});

const diagnosis = z.object({
  hotkey: z.string(),
  netuid: z.number().int(),
  subnet_name: z.string().nullish(),
  chain: chainRef,
  verdict,
  headline: z.string(),
  findings: z.array(finding),
  neuron: neuron.nullish(),
  role: z.enum(["miner", "validator", "unregistered"]),
  rules_run: z.number().int(),
});

export const doctorReportSchema = z.object({
  hotkey: z.string(),
  chain: chainRef,
  diagnoses: z.array(diagnosis),
  verdict,
  headline: z.string(),
  elapsed_ms: z.number(),
}) satisfies z.ZodType<DoctorReport>;

const decodedArg = z.object({ name: z.string(), value: z.string(), raw: z.string().nullish() });
const dispatchFailure = z.object({
  pallet: z.string(),
  error: z.string(),
  code: z.string().nullish(),
  description: z.string().nullish(),
  docs: z.string().nullish(),
});
const errorExplanation = z.object({
  error: z.string(),
  pallet: z.string().nullish(),
  code: z.string().nullish(),
  title: z.string(),
  explanation: z.string(),
  fix: fix.nullish(),
  trap: z.string().nullish(),
  source: z.string().nullish(),
  docs: z.string().nullish(),
  found: z.boolean().optional(),
});

export const txReportSchema = z.object({
  chain: chainRef,
  ref: z.string(),
  extrinsic_hash: z.string().nullable(),
  block: z.number().int(),
  index: z.number().int(),
  signer: z.string().nullable(),
  pallet: z.string(),
  call: z.string(),
  args: z.array(decodedArg),
  success: z.boolean(),
  fee_tao: z.number().nullable(),
  events: z.array(z.object({ index: z.number().int(), pallet: z.string(), name: z.string(), summary: z.string() })),
  failure: dispatchFailure.nullish(),
  explanation: errorExplanation.nullish(),
  hotkey: z.string().nullish(),
  netuid: z.number().int().nullish(),
}) satisfies z.ZodType<TxReport>;

export const simResultSchema = z.object({
  chain: chainRef,
  action: z.enum(["burned_register", "add_stake", "remove_stake", "set_weights", "serve_axon", "register_network", "start_call"]),
  signer: z.string(),
  args: z.array(decodedArg),
  mode: z.enum(["fork", "predicted"]),
  mode_label: z.string(),
  would_succeed: z.boolean(),
  failure: dispatchFailure.nullish(),
  explanation: errorExplanation.nullish(),
  fee_tao: z.number().nullish(),
  effects: z.array(z.string()),
  balance_changes: z.array(z.object({ account: z.string(), label: z.string(), before: z.string(), after: z.string(), delta: z.string() })).optional(),
  checks: z.array(evidence).optional(),
  overrides: z.array(z.string()).optional(),
  elapsed_ms: z.number(),
}) satisfies z.ZodType<SimResult>;

const sharedBase = { id: z.string(), network: z.string(), subject: z.string(), block: z.number().int(), created_at: z.string() };

/** GET /v1/reports/{id}: the payload is re-validated by kind, since it round trips through the store */
export const sharedReportSchema = z.discriminatedUnion("kind", [
  z.object({ ...sharedBase, kind: z.literal("doctor"), payload: doctorReportSchema }),
  z.object({ ...sharedBase, kind: z.literal("tx"), payload: txReportSchema }),
  z.object({ ...sharedBase, kind: z.literal("sim"), payload: simResultSchema }),
]);
export type SharedReport = z.infer<typeof sharedReportSchema>;
export type ShareKind = SharedReport["kind"];

/** GET /v1/history/{network}/{hotkey}. Mirrors NeuronHistory in core/models.py until types.ts is regenerated */
export const neuronHistorySchema = z.object({
  chain: chainRef,
  hotkey: z.string(),
  netuid: z.number().int(),
  points: z.array(
    z.object({
      block: z.number().int(),
      uid: z.number().int().nullish(),
      incentive: z.number(),
      trust: z.number(),
      emission: z.number(),
      weighted_by: z.number().int(),
    }),
  ),
});
export type NeuronHistory = z.infer<typeof neuronHistorySchema>;
export type HistoryPoint = NeuronHistory["points"][number];

export const houseStatsSchema = z.object({
  diagnoses: z.number().int().nonnegative(),
  errors: z.number().int().nonnegative(),
  simulations: z.number().int().nonnegative().default(0),
  builders: z.number().int().nonnegative(),
  since: z.string(),
});
export type HouseStats = z.infer<typeof houseStatsSchema>;

export const changelogSchema = z.array(z.object({ date: z.string(), sha: z.string(), subject: z.string() }));
export type ChangelogEntry = z.infer<typeof changelogSchema>[number];

const activity = z.object({
  block: z.number().int(),
  index: z.number().int(),
  ref: z.string(),
  hash: z.string().nullable(),
  kind: z.enum(["weights", "register", "stake", "unstake", "serve", "transfer", "commitment", "shielded", "evm", "subnet", "other"]),
  pallet: z.string(),
  call: z.string(),
  signer: z.string().nullable(),
  netuid: z.number().int().nullable(),
  summary: z.string(),
  success: z.boolean(),
  error: z.string().nullish(),
  amount: z.string().nullish(),
});

/** GET /v1/live/{network}: polled every few seconds, so a malformed block is rejected here rather than in the stream */
export const liveFeedSchema = z.object({
  chain: chainRef,
  head: z.number().int(),
  blocks: z.array(
    z.object({
      number: z.number().int(),
      hash: z.string(),
      timestamp: z.string().nullable(),
      activities: z.array(activity),
      system_calls: z.number().int(),
      failed: z.number().int(),
    }),
  ),
}) satisfies z.ZodType<LiveFeed>;

const neuronPoint = z.object({
  block: z.number().int(),
  uid: z.number().int().nullable(),
  incentive: z.number(),
  emission: z.number(),
  trust: z.number(),
  rank_by_emission: z.number().int().nullable(),
  miners: z.number().int(),
});

/** GET /v1/change/{network}/{hotkey}: read by the browser after the Doctor renders, so a malformed answer stops here */
export const incentiveChangeSchema = z.object({
  chain: chainRef,
  hotkey: z.string(),
  netuid: z.number().int(),
  from_block: z.number().int(),
  to_block: z.number().int(),
  before: neuronPoint,
  after: neuronPoint,
  change: z.number(),
  headline: z.string(),
  drivers: z.array(
    z.object({
      uid: z.number().int(),
      hotkey: z.string(),
      stake_share_before: z.number(),
      stake_share_after: z.number(),
      weight_before: z.number(),
      weight_after: z.number(),
      support_before: z.number(),
      support_after: z.number(),
      blocks_since_update: z.number().int(),
      reason: z.string(),
    }),
  ),
  notes: z.array(z.string()),
}) satisfies z.ZodType<IncentiveChange>;

const subnetCount = z.tuple([z.number().int(), z.number().int()]);

/** GET /v1/weather/{network}: polled every minute from the browser */
export const weatherSchema = z.object({
  chain: chainRef,
  from_block: z.number().int(),
  to_block: z.number().int(),
  blocks: z.number().int(),
  extrinsics: z.number().int(),
  failed: z.number().int(),
  failure_rate: z.number(),
  headline: z.string(),
  top_errors: z.array(
    z.object({
      error: z.string(),
      count: z.number().int(),
      subnets: z.array(z.number().int()),
      example_ref: z.string(),
      title: z.string(),
      meaning: z.string(),
      fix: z.string().nullish(),
    }),
  ),
  by_kind: z.record(z.string(), z.number().int()),
  busiest_subnets: z.array(subnetCount),
  failing_subnets: z.array(subnetCount),
}) satisfies z.ZodType<Weather>;

const epochMiner = z.object({
  uid: z.number().int(),
  hotkey: z.string(),
  incentive_now: z.number(),
  incentive_next: z.number(),
  change: z.number(),
  support: z.number(),
  clipped: z.number(),
  validators: z.number().int(),
  reason: z.string(),
});

/** GET or POST /v1/epoch/{network}/{netuid}: the next epoch, computed off-chain */
export const epochPreviewSchema = z.object({
  chain: chainRef,
  netuid: z.number().int(),
  name: z.string(),
  epoch_block: z.number().int(),
  blocks_until: z.number().int(),
  seconds_until: z.number().int(),
  kappa: z.number(),
  commit_reveal: z.boolean(),
  sealed_commits: z.number().int(),
  headline: z.string(),
  focus: epochMiner.nullish(),
  miners: z.array(epochMiner),
  validators: z.array(
    z.object({
      uid: z.number().int(),
      hotkey: z.string(),
      stake_share: z.number(),
      trust: z.number(),
      weighted_uids: z.number().int(),
      blocks_since_update: z.number().int(),
      status: z.enum(["voting", "inactive", "no_weights", "below_threshold"]),
      note: z.string(),
    }),
  ),
  earners_now: z.number().int(),
  earners_next: z.number().int(),
  whatif: z.array(z.string()),
  notes: z.array(z.string()),
}) satisfies z.ZodType<EpochPreview>;

/** GET /v1/epoch/{network}/{netuid}/check: the last epoch recomputed against the chain */
export const epochCheckSchema = z.object({
  chain: chainRef,
  netuid: z.number().int(),
  epoch_block: z.number().int(),
  uids: z.number().int(),
  exact: z.number().int(),
  max_error: z.number().int(),
  total_error: z.number(),
  matched: z.boolean(),
  headline: z.string(),
}) satisfies z.ZodType<EpochCheck>;
