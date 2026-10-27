/**
 * The one TAO formatter for fees, balances and the TAO amounts the API writes into text, so a fee
 * reads the same in a header, a check and an event. Trailing zeros are trimmed and tiny values keep
 * a significant digit down to one rao instead of collapsing to 0.
 */

const ONE_RAO = 1e-9;
const BELOW_ONE = new Intl.NumberFormat("en-US", { maximumSignificantDigits: 3 });
const ONE_OR_MORE = new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 });

export function formatTaoAmount(value: number): string {
  if (!Number.isFinite(value)) return "n/a";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs < ONE_RAO) return value < 0 ? ">-0.000000001" : "<0.000000001";
  return abs >= 1 ? ONE_OR_MORE.format(value) : BELOW_ONE.format(value);
}

export function formatTaoFee(value: number | null | undefined): string {
  return value == null ? "n/a" : `${formatTaoAmount(value)} TAO`;
}

// A decimal written next to a TAO marker: "0.000000000 TAO", "τ0.000500000", "0.001071 fee", "0.0005 burn"
const AFTER_TAU = /τ\s?(-?\d[\d,]*\.\d+)/g;
const BEFORE_UNIT = /(-?\d[\d,]*\.\d+)(?=\s?(?:TAO\b|τ|fee\b|burn\b))/g;

function reformat(raw: string): string {
  const value = Number(raw.replace(/,/g, ""));
  return Number.isFinite(value) ? formatTaoAmount(value) : raw;
}

/** Rewrites the TAO amounts inside API prose with `formatTaoAmount`; every other number is left alone */
export function normalizeTaoText(text: string): string {
  return text.replace(AFTER_TAU, (_, raw: string) => `τ${reformat(raw)}`).replace(BEFORE_UNIT, (raw: string) => reformat(raw));
}
