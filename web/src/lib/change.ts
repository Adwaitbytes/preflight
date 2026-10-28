/**
 * The Doctor's "What changed" section: the windows it offers and every number it prints.
 * Pure, so the component only lays out what these return.
 */

import { formatDuration, formatInt } from "./format";
import type { ChangeDriver, IncentiveChange, NeuronPoint } from "./types";

/** The API accepts 1 to 48 epochs back */
export const MAX_EPOCHS = 48;

/** One epoch is tempo + 1 blocks: 361 on most subnets, until a read measures this subnet's own */
export const DEFAULT_EPOCH_BLOCKS = 361;

/** The API calls a move under 5% steady; the badge uses the same bar so it never contradicts the headline */
const STEADY = 0.05;

export interface EpochOption {
  epochs: number;
  label: string;
}

/** One epoch, about six hours and about a day on a 360 block tempo */
export const EPOCH_OPTIONS: readonly EpochOption[] = [
  { epochs: 1, label: "1 epoch" },
  { epochs: 5, label: "5 epochs" },
  { epochs: 20, label: "20 epochs" },
];

export const DEFAULT_EPOCHS = 1;

export function clampEpochs(epochs: number): number {
  if (!Number.isFinite(epochs)) return DEFAULT_EPOCHS;
  return Math.min(MAX_EPOCHS, Math.max(1, Math.trunc(epochs)));
}

/** This subnet's epoch length as a read measured it, or null when the window is empty */
export function measuredEpochBlocks(change: Pick<IncentiveChange, "from_block" | "to_block">, epochs: number): number | null {
  const span = change.to_block - change.from_block;
  if (epochs <= 0 || span <= 0) return null;
  return span / epochs;
}

/** "~1.2 h" for one epoch of 361 blocks, "~24 h" for 20 */
export function epochHint(epochs: number, epochBlocks = DEFAULT_EPOCH_BLOCKS): string {
  return `~${formatDuration(epochs * epochBlocks)}`;
}

/** The longer windows to suggest when this one shows no movement */
export function longerOptions(epochs: number): EpochOption[] {
  return EPOCH_OPTIONS.filter((option) => option.epochs > epochs);
}

const SIGNIFICANT = new Intl.NumberFormat("en-US", { maximumSignificantDigits: 3 });
const GROUPED = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** Three significant digits, as the API's sentences write them, so 0.000916 never prints as 0.0009 */
export function formatSignificant(value: number): string {
  if (!Number.isFinite(value)) return "n/a";
  if (value === 0) return "0";
  return Math.abs(value) >= 1000 ? GROUPED.format(value) : SIGNIFICANT.format(value);
}

/** A 0..1 share as a percentage with three significant digits: 0.000992 reads 0.0992% */
export function formatSharePercent(value: number): string {
  if (!Number.isFinite(value)) return "n/a";
  if (value === 0) return "0%";
  return `${SIGNIFICANT.format(value * 100)}%`;
}

export type Direction = "up" | "down" | "flat";

export interface Delta {
  direction: Direction;
  /** Short, signed, for a badge: "+45%", "-30%", "From zero", "Steady" */
  label: string;
  /** The same in words, for screen readers */
  spoken: string;
}

function percent(ratio: number): string {
  const pct = Math.abs(ratio) * 100;
  return pct < 10 ? pct.toFixed(1).replace(/\.0$/, "") : GROUPED.format(pct);
}

/** How incentive moved between the two reads, on the API's own terms */
export function incentiveDelta(before: NeuronPoint, after: NeuronPoint, change: number): Delta {
  if (before.uid != null && after.uid == null) return { direction: "down", label: "Seat lost", spoken: "lost its seat" };
  if (before.incentive === 0 && after.incentive === 0) return { direction: "flat", label: "Zero at both", spoken: "zero at both blocks" };
  if (before.incentive === 0) return { direction: "up", label: "From zero", spoken: "up from zero" };
  if (!Number.isFinite(change) || Math.abs(change) < STEADY) return { direction: "flat", label: "Steady", spoken: "steady" };
  const amount = percent(change);
  return change > 0
    ? { direction: "up", label: `+${amount}%`, spoken: `up ${amount}%` }
    : { direction: "down", label: `-${amount}%`, spoken: `down ${amount}%` };
}

/** Rank by emission, where 1 is the best paid miner; climbing means a smaller number */
export function rankDelta(before: NeuronPoint, after: NeuronPoint): Delta | null {
  if (before.rank_by_emission == null || after.rank_by_emission == null) return null;
  const moved = before.rank_by_emission - after.rank_by_emission;
  if (moved === 0) return { direction: "flat", label: "Same", spoken: "unchanged" };
  const places = `${formatInt(Math.abs(moved))} ${Math.abs(moved) === 1 ? "place" : "places"}`;
  return moved > 0 ? { direction: "up", label: `Up ${formatInt(moved)}`, spoken: `up ${places}` } : { direction: "down", label: `Down ${formatInt(-moved)}`, spoken: `down ${places}` };
}

export function formatRank(point: NeuronPoint): string {
  return point.rank_by_emission == null ? "Unranked" : `#${formatInt(point.rank_by_emission)}`;
}

export interface SupportBar {
  direction: Direction;
  /** Share of one half of the track, 0..1, scaled to the largest move in the list */
  width: number;
}

/** Diverging bars for each validator's change in support, all on one scale */
export function supportBars(drivers: readonly Pick<ChangeDriver, "support_before" | "support_after">[]): SupportBar[] {
  const deltas = drivers.map((d) => d.support_after - d.support_before);
  const largest = Math.max(0, ...deltas.map(Math.abs));
  return deltas.map((delta) => {
    if (largest === 0 || delta === 0) return { direction: "flat", width: 0 };
    return { direction: delta > 0 ? "up" : "down", width: Math.abs(delta) / largest };
  });
}

/** The API's reason is a clause ("raised its weight..."); on its own line it reads as a sentence */
export function reasonSentence(reason: string): string {
  const text = reason.trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

/** "2,909 blocks ago, ~9.7 h" */
export function sinceUpdate(blocks: number): string {
  if (blocks <= 0) return "this block";
  return `${formatInt(blocks)} ${blocks === 1 ? "block" : "blocks"} ago, ~${formatDuration(blocks)}`;
}

/** "Blocks 9,366,277 to 9,380,679, ~2 days apart" */
export function windowLabel(change: Pick<IncentiveChange, "from_block" | "to_block">): string {
  const span = Math.max(0, change.to_block - change.from_block);
  return `Blocks ${formatInt(change.from_block)} to ${formatInt(change.to_block)}, ~${formatDuration(span)} apart`;
}
