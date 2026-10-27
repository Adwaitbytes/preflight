/** Smallest column a step's text needs, so a same block step still has room for its label */
const MIN_COLUMN = "9.5rem";

/** Share of the row for the segment that follows a step: log scaled, so 0, 361 and 431,639 blocks all read */
export function segmentWeight(gap: number | null): number {
  return Math.log10(Math.max(0, gap ?? 0) + 10);
}

/** A CSS grid template where each step's column is as wide as the gap to the next step, log scaled */
export function timelineColumns(blocks: readonly (number | null)[]): string {
  return blocks
    .map((block, i) => {
      const next = blocks[i + 1];
      const gap = next === undefined || block == null || next == null ? null : next - block;
      return `minmax(${MIN_COLUMN},${segmentWeight(gap).toFixed(3)}fr)`;
    })
    .join(" ");
}

/** The API writes a step's derivation as one clause list joined by semicolons; each clause reads better as a line */
export function detailClauses(detail: string): string[] {
  return detail
    .split(/;\s+/)
    .map((clause) => clause.trim())
    .filter(Boolean)
    .map((clause) => clause.charAt(0).toUpperCase() + clause.slice(1));
}
