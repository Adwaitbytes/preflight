import { useId } from "react";
import { formatInt } from "@/lib/format";
import { formatPerDay, sparkPath, sparkPoints } from "@/lib/insights-format";

const SPARK_W = 240;
const SPARK_H = 40;
const SPARK_PAD = 4;

/** The burn across recent adjustment intervals. Scaled to its own range, so the label carries the size of any move */
export function BurnSparkline({ history, label }: { history: readonly (readonly [number, number])[]; label: string }) {
  const gradientId = useId();
  const values = history.map(([, tao]) => tao);
  const points = sparkPoints(values, SPARK_W, SPARK_H, SPARK_PAD);
  const end = points[points.length - 1];
  if (!end) return null;
  const line = sparkPath(values, SPARK_W, SPARK_H, SPARK_PAD);
  const area = `${line} L${end[0].toFixed(1)},${SPARK_H} L${SPARK_PAD},${SPARK_H} Z`;
  const last = values[values.length - 1] ?? 0;
  return (
    <div role="img" aria-label={`Registration burn ${label.toLowerCase()}, now ${formatPerDay(last)} TAO`} className="relative h-10 w-full">
      <svg viewBox={`0 0 ${SPARK_W} ${SPARK_H}`} preserveAspectRatio="none" aria-hidden className="size-full overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradientId})`} />
        <path d={line} fill="none" className="stroke-accent" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* An HTML dot stays round however far the stretched SVG scales */}
      <span
        aria-hidden
        className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_3px_var(--accent-soft)]"
        style={{ left: `${((end[0] / SPARK_W) * 100).toFixed(2)}%`, top: `${((end[1] / SPARK_H) * 100).toFixed(2)}%` }}
      />
    </div>
  );
}

const CELL = 6;
const STEP = 8;
// Past this a unit chart stops reading as individual miners, so it becomes a plain bar
const MAX_UNITS = 512;

/** One square per miner, earners first: "84 of 246" as something you can see */
export function EarningGrid({ earning, total }: { earning: number; total: number }) {
  if (total <= 0) return null;
  const label = `${formatInt(earning)} of ${formatInt(total)} miners earn`;
  if (total > MAX_UNITS) {
    return (
      <div role="img" aria-label={label} className="h-2 overflow-hidden rounded-full bg-surface-3">
        <div className="h-full rounded-full bg-accent" style={{ width: `${((earning / total) * 100).toFixed(2)}%` }} />
      </div>
    );
  }
  const cols = total > 128 ? 32 : 16;
  const rows = Math.ceil(total / cols);
  const width = cols * STEP - (STEP - CELL);
  const height = rows * STEP - (STEP - CELL);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} className="h-auto w-full" style={{ maxWidth: `${Math.round(width * 1.35)}px` }}>
      {Array.from({ length: total }, (_, i) => (
        <rect
          key={i}
          x={(i % cols) * STEP}
          y={Math.floor(i / cols) * STEP}
          width={CELL}
          height={CELL}
          rx={1.5}
          className={i < earning ? "fill-accent" : "fill-surface-3"}
        />
      ))}
    </svg>
  );
}
