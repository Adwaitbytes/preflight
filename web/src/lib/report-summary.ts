/**
 * One sentence summaries of each result kind, shared by page titles, meta descriptions and
 * Open Graph cards so a shared link previews exactly what the page says.
 */

import { formatInt, truncateMiddle } from "./format";
import { VERDICT_LABEL } from "./severity";
import type { DoctorReport, SimResult, TxReport, Verdict } from "./types";

export type SummaryTone = "critical" | "medium" | "healthy" | "neutral";

export interface Summary {
  title: string;
  description: string;
  eyebrow: string;
  headline: string;
  badge: { label: string; tone: SummaryTone };
  network: string;
  subject: string;
  block: number;
}

const VERDICT_TONE: Record<Verdict, SummaryTone> = { healthy: "healthy", warning: "medium", broken: "critical" };

export function summarizeDoctor(report: DoctorReport): Summary {
  const subject = truncateMiddle(report.hotkey, 6, 4);
  return {
    title: report.headline,
    description: `Preflight Doctor for ${subject} on ${report.chain.network}, read at block ${formatInt(report.chain.block)}: ${report.headline}`,
    eyebrow: "Doctor",
    headline: report.headline,
    badge: { label: VERDICT_LABEL[report.verdict], tone: VERDICT_TONE[report.verdict] },
    network: report.chain.network,
    subject,
    block: report.chain.block,
  };
}

export function summarizeTx(tx: TxReport): Summary {
  const call = `${tx.pallet}.${tx.call}`;
  const headline = tx.success
    ? `${call} succeeded`
    : tx.explanation?.title ?? (tx.failure ? `${call} failed with ${tx.failure.error}` : `${call} failed`);
  const cause = tx.failure ? ` with ${tx.failure.pallet}.${tx.failure.error}` : "";
  return {
    title: `${tx.success ? "Succeeded" : "Failed"}: ${call} ${tx.ref}`,
    description: tx.success
      ? `${call} at ${tx.ref} on ${tx.chain.network} succeeded. Decoded call and events by Preflight`
      : `${call} at ${tx.ref} on ${tx.chain.network} failed${cause}. ${tx.explanation?.title ?? "Decoded by Preflight"}`,
    eyebrow: `Transaction · ${call}`,
    headline,
    badge: { label: tx.success ? "Succeeded" : "Failed", tone: tx.success ? "healthy" : "critical" },
    network: tx.chain.network,
    subject: tx.ref,
    block: tx.block,
  };
}

export function summarizeSim(sim: SimResult): Summary {
  const outcome = sim.would_succeed ? "would succeed" : "would fail";
  const headline = sim.would_succeed ? `${sim.action} would succeed` : `${sim.action} would fail: ${sim.explanation?.title ?? sim.failure?.error ?? "rejected"}`;
  return {
    title: `Simulated ${sim.action}: ${outcome}`,
    description: `${headline}. ${sim.mode_label}`,
    eyebrow: sim.mode === "fork" ? "Simulation · executed on a fork" : "Simulation · predicted",
    headline,
    badge: { label: sim.would_succeed ? "Would succeed" : "Would fail", tone: sim.would_succeed ? "healthy" : "critical" },
    network: sim.chain.network,
    subject: truncateMiddle(sim.signer, 6, 4),
    block: sim.chain.block,
  };
}
