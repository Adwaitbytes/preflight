/**
 * Runtime schemas for data that crosses a file or network boundary as untyped JSON.
 * Each schema is checked against the generated contract type, so drift fails the typecheck.
 */

import { z } from "zod";
import type { DoctorReport } from "./types";

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

export const changelogSchema = z.array(z.object({ date: z.string(), sha: z.string(), subject: z.string() }));
export type ChangelogEntry = z.infer<typeof changelogSchema>[number];
