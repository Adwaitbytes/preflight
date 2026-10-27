/**
 * Formatting for the fleet and mining economics views. Per day amounts are estimates from one
 * block, so they get the precision the API's own prose uses and never a false floor of zero.
 */

import { formatDuration } from "./format";

const GROUPED = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const TWO_DECIMALS = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const THREE_SIGNIFICANT = new Intl.NumberFormat("en-US", { maximumSignificantDigits: 3 });
const FLOOR = 0.0001;

/** TAO or alpha a day: grouped from 1,000, two decimals from 1, three significant digits below */
export function formatPerDay(value: number): string {
  if (!Number.isFinite(value)) return "n/a";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1000) return GROUPED.format(value);
  if (abs >= 1) return TWO_DECIMALS.format(value);
  if (abs < FLOOR) return value < 0 ? `>-${FLOOR}` : `<${FLOOR}`;
  return THREE_SIGNIFICANT.format(value);
}

function trimmedDecimal(value: number): string {
  return value.toFixed(1).replace(/\.0$/, "");
}

/** A count per day such as registrations: whole from 10, one decimal below */
export function formatRate(value: number): string {
  return Math.abs(value) >= 10 ? GROUPED.format(value) : trimmedDecimal(value);
}

/** Hours with one decimal, as the API's notes write them; minutes below an hour, days from two */
export function formatHours(hours: number): string {
  if (!Number.isFinite(hours)) return "n/a";
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  if (hours < 48) return `${trimmedDecimal(hours)} h`;
  return `${trimmedDecimal(hours / 24)} days`;
}

const SECONDS_PER_DAY = 86_400;

export function formatPayback(days: number | null): string {
  if (days == null || !Number.isFinite(days)) return "No estimate";
  if (days < 1) return "Under a day";
  return formatDuration(days * SECONDS_PER_DAY, 1);
}

export interface SplitHeadline {
  lead: string;
  rest: string | null;
}

// Below this a clause reads as a label, not a sentence, so the headline stays whole
const MIN_CLAUSE = 8;

/**
 * API headlines are one sentence of two clauses: the answer, then the reason. Splitting at the
 * first semicolon (or colon) lets the answer carry the page while the reason reads as a subline.
 */
export function splitHeadline(text: string): SplitHeadline {
  const trimmed = text.trim();
  const at = trimmed.includes("; ") ? trimmed.indexOf("; ") : trimmed.indexOf(": ");
  if (at < 0) return { lead: trimmed, rest: null };
  const lead = trimmed.slice(0, at).trim();
  const rest = trimmed.slice(at + 2).trim();
  if (lead.length < MIN_CLAUSE || rest.length < MIN_CLAUSE) return { lead: trimmed, rest: null };
  return { lead, rest: rest.charAt(0).toUpperCase() + rest.slice(1) };
}

export interface BurnTrend {
  first: number;
  last: number;
  /** Relative change from the first read to the last; null when the burn started at zero */
  change: number | null;
  /** Blocks between the first and the last read */
  blocks: number;
}

export function burnTrend(history: readonly (readonly [number, number])[]): BurnTrend | null {
  const start = history[0];
  const end = history[history.length - 1];
  if (!start || !end || history.length < 2) return null;
  const [firstBlock, first] = start;
  const [lastBlock, last] = end;
  return { first, last, change: first > 0 ? (last - first) / first : null, blocks: lastBlock - firstBlock };
}

function percent(ratio: number): string {
  const pct = Math.abs(ratio) * 100;
  return pct < 10 ? trimmedDecimal(pct) : String(Math.round(pct));
}

export function trendLabel(trend: BurnTrend): string {
  const window = `over ${formatDuration(trend.blocks)}`;
  if (trend.change == null) return trend.last > trend.first ? `Up from 0 ${window}` : `Flat ${window}`;
  if (trend.change === 0) return `Flat ${window}`;
  return `${trend.change > 0 ? "Up" : "Down"} ${percent(trend.change)}% ${window}`;
}

/** Chart coordinates for `values`, scaled to their own range; a flat series runs through the middle */
export function sparkPoints(values: readonly number[], width: number, height: number, pad: number): [number, number][] {
  const min = Math.min(...values);
  const span = Math.max(...values) - min;
  const step = (width - pad * 2) / Math.max(1, values.length - 1);
  return values.map((v, i) => [pad + i * step, span === 0 ? height / 2 : height - pad - ((v - min) / span) * (height - pad * 2)]);
}

export function sparkPath(values: readonly number[], width: number, height: number, pad: number): string {
  return sparkPoints(values, width, height, pad)
    .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
}

/** Each value as a share of the largest, for bars on one linear scale */
export function relativeWidths(values: readonly number[]): number[] {
  const max = Math.max(0, ...values);
  return values.map((v) => (max > 0 ? Math.max(0, v) / max : 0));
}
