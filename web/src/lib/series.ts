/** The value a series holds at every point, or null when it moves (or is empty) */
export function constantValue(values: readonly number[]): number | null {
  const [first, ...rest] = values;
  if (first === undefined) return null;
  return rest.every((v) => v === first) ? first : null;
}

/**
 * Tailwind classes for a gap-px tile grid of `count` tiles: two columns on phones, up to four on
 * wide screens, and an odd last tile spans the row so no empty cell shows through.
 */
export function tileGrid(count: number): { grid: string; lastTile: string } {
  if (count <= 1) return { grid: "grid-cols-1", lastTile: "" };
  const wide = count >= 4 ? "lg:grid-cols-4" : count === 3 ? "lg:grid-cols-3" : "";
  return { grid: `grid-cols-2 ${wide}`.trim(), lastTile: count % 2 === 1 ? "col-span-2 lg:col-span-1" : "" };
}
