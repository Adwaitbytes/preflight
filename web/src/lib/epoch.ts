import type { EpochMiner, EpochPreview, EpochWhatIf } from "./types";
import type { NetworkId } from "./networks";

/** Subnets worth a first look, offered as one-tap picks on the Epoch Lab landing page */
export const QUICK_SUBNETS: readonly number[] = [1, 4, 8, 19, 51, 64];

/** A what-if never asks for more rows than the API accepts */
export const MAX_WHATIF_ROWS = 8;

const STEADY = 0.01;

export type Direction = "up" | "down" | "flat";

export interface EpochDelta {
  direction: Direction;
  /** Short, for a badge: "+12%", "Drops to zero", "New", "Steady" */
  label: string;
  /** The same in words, for screen readers */
  spoken: string;
}

export function epochHref(network: NetworkId, netuid: number, hotkey?: string | null): string {
  return `/epoch/${network}/${netuid}${hotkey ? `?hotkey=${encodeURIComponent(hotkey)}` : ""}`;
}

/** How a miner's incentive moves from the last epoch to the next */
export function epochDelta(miner: Pick<EpochMiner, "incentive_now" | "incentive_next" | "change">): EpochDelta {
  const { incentive_now: now, incentive_next: next } = miner;
  if (now === 0 && next === 0) return { direction: "flat", label: "Zero", spoken: "zero at both epochs" };
  if (now > 0 && next === 0) return { direction: "down", label: "Drops to zero", spoken: "drops to zero" };
  if (now === 0) return { direction: "up", label: "New", spoken: "starts earning" };
  if (Math.abs(miner.change) < STEADY) return { direction: "flat", label: "Steady", spoken: "steady" };
  const pct = Math.abs(miner.change) * 100;
  const amount = pct < 10 ? pct.toFixed(1).replace(/\.0$/, "") : Math.round(pct).toLocaleString("en-US");
  return miner.change > 0
    ? { direction: "up", label: `+${amount}%`, spoken: `up ${amount}%` }
    : { direction: "down", label: `-${amount}%`, spoken: `down ${amount}%` };
}

/** Share of all stake weighted weight on the listed miners that consensus cuts */
export function consensusCut(preview: Pick<EpochPreview, "miners">): number {
  const support = preview.miners.reduce((sum, m) => sum + m.support, 0);
  if (support <= 0) return 0;
  const cut = preview.miners.reduce((sum, m) => sum + m.support * m.clipped, 0);
  return cut / support;
}

export type ParsedRow = { ok: true; row: Record<string, number>; uids: number } | { ok: false; error: string };

/**
 * A weight row typed by hand: JSON (`{"12": 0.4, "31": 0.6}`) or one `uid: weight` pair per
 * line or comma. Weights may be on any scale; the epoch normalizes each row.
 */
export function parseWeightRow(text: string): ParsedRow {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Add at least one uid: weight pair" };
  let pairs: [string, unknown][];
  if (trimmed.startsWith("{")) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return { ok: false, error: "The JSON must be an object of uid to weight" };
      pairs = Object.entries(parsed);
    } catch {
      return { ok: false, error: "That JSON does not parse" };
    }
  } else {
    pairs = [];
    for (const part of trimmed.split(/[\n,;]+/)) {
      const piece = part.trim();
      if (!piece) continue;
      const match = /^(\d{1,5})\s*[:=\s]\s*([0-9]*\.?[0-9]+(?:e-?\d+)?)$/i.exec(piece);
      if (!match) return { ok: false, error: `Read “${piece.slice(0, 24)}” as uid: weight, like 12: 0.4` };
      pairs.push([match[1] ?? "", Number(match[2])]);
    }
  }
  const row: Record<string, number> = {};
  for (const [uid, weight] of pairs) {
    if (!/^\d{1,5}$/.test(uid)) return { ok: false, error: `UID ${uid.slice(0, 12)} is not a number` };
    if (typeof weight !== "number" || !Number.isFinite(weight) || weight < 0) return { ok: false, error: `The weight for UID ${uid} must be a number of 0 or more` };
    if (weight > 0) row[String(Number(uid))] = weight;
  }
  const uids = Object.keys(row).length;
  return uids === 0 ? { ok: false, error: "Every weight is zero; give at least one UID a weight" } : { ok: true, row, uids };
}

export interface WhatIfDraft {
  kappa: number;
  offline: readonly number[];
  /** Validator UID whose weights are replaced, with the row as typed */
  tested: { uid: number; text: string } | null;
}

export type BuiltWhatIf = { ok: true; whatif: EpochWhatIf | null } | { ok: false; error: string };

/** The request for a draft, or null when the draft changes nothing from live state */
export function buildWhatIf(draft: WhatIfDraft, liveKappa: number): BuiltWhatIf {
  const whatif: EpochWhatIf = {};
  if (Math.abs(draft.kappa - liveKappa) > 1e-4) whatif.kappa = Math.round(draft.kappa * 10_000) / 10_000;
  if (draft.offline.length) whatif.drop_validators = [...draft.offline].sort((a, b) => a - b);
  if (draft.tested) {
    const parsed = parseWeightRow(draft.tested.text);
    if (!parsed.ok) return parsed;
    whatif.weights = { [String(draft.tested.uid)]: parsed.row };
  }
  return { ok: true, whatif: Object.keys(whatif).length ? whatif : null };
}

/** "in 23.5 h" style, from the API's seconds */
export function countdown(seconds: number): string {
  if (seconds < 60) return seconds <= 0 ? "now" : `in ${seconds} s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 90) return `in ${minutes} min`;
  const hours = seconds / 3600;
  if (hours < 48) return `in ${hours.toFixed(1).replace(/\.0$/, "")} h`;
  return `in ${(hours / 24).toFixed(1).replace(/\.0$/, "")} days`;
}
