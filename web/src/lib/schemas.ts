/**
 * Runtime schemas for data that crosses a file or network boundary as untyped JSON.
 * Each schema is checked against the generated contract type, so drift fails the typecheck.
 */

import { z } from "zod";
import type { DoctorReport, SimResult, TxReport } from "./types";

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
