/** Display formatting. Pure functions, no locale surprises: everything renders en-US. */

const NUMBER = new Intl.NumberFormat("en-US");

export function formatInt(value: number): string {
  return NUMBER.format(Math.round(value));
}

/** "0.0001" for 4 decimals, built as text: 10 ** -4 prints as 0.00009999... on some runtimes */
export function smallestStep(decimals: number): string {
  return decimals <= 0 ? "1" : `0.${"0".repeat(decimals - 1)}1`;
}

/** Fixed significant digits for small values, grouped thousands for large ones */
export function formatAmount(value: number, maxDecimals = 4): string {
  if (!Number.isFinite(value)) return "n/a";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1000) return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
  if (abs >= 1) return new Intl.NumberFormat("en-US", { maximumFractionDigits: Math.min(maxDecimals, 3) }).format(value);
  if (abs < Number(smallestStep(maxDecimals))) return value < 0 ? `>-${smallestStep(maxDecimals)}` : `<${smallestStep(maxDecimals)}`;
  return new Intl.NumberFormat("en-US", { maximumSignificantDigits: 3, maximumFractionDigits: maxDecimals }).format(value);
}

export function formatTao(value: number): string {
  return `${formatAmount(value)} TAO`;
}

export function formatAlpha(value: number): string {
  return `${formatAmount(value)} alpha`;
}

/** A 0..1 share as a percentage; tiny non zero shares stay visible instead of rounding to 0 */
export function formatShare(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "n/a";
  if (value === 0) return "0%";
  const pct = value * 100;
  if (Math.abs(pct) < Number(smallestStep(digits))) return `<${smallestStep(digits)}%`;
  return `${pct.toFixed(digits)}%`;
}

/** 0..1 consensus style values with fixed precision */
export function formatRatio(value: number): string {
  if (value === 0) return "0";
  return value.toFixed(4);
}

/** Truncates the middle so both ends of an address or hash stay checkable */
export function truncateMiddle(value: string, head = 6, tail = 4): string {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}

/** Block count to a short human duration, given the chain's block time */
export function formatDuration(blocks: number, blockSeconds = 12): string {
  const seconds = Math.max(0, Math.round(blocks * blockSeconds));
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = seconds / 3600;
  if (hours < 48) return `${hours < 10 ? hours.toFixed(1).replace(/\.0$/, "") : Math.round(hours)} h`;
  const days = hours / 24;
  return `${days < 10 ? days.toFixed(1).replace(/\.0$/, "") : Math.round(days)} days`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${formatInt(count)} ${count === 1 ? singular : plural}`;
}

export function formatMs(ms: number): string {
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1)} s`;
}

/** `9376574-0003` style reference used by explorers */
export function formatBlockIndex(block: number, index: number): string {
  return `${block}-${String(index).padStart(4, "0")}`;
}
