"use client";

import { useEffect, useId, useState } from "react";
import { history } from "@/lib/client-calls";
import { formatAmount, formatInt, formatRatio } from "@/lib/format";
import type { NetworkId } from "@/lib/networks";
import type { HistoryPoint } from "@/lib/schemas";
import { cn } from "@/lib/utils";

interface Series {
  key: "incentive" | "trust" | "emission" | "weighted_by";
  label: string;
  format: (v: number) => string;
}

const SERIES: Series[] = [
  { key: "incentive", label: "Incentive", format: formatRatio },
  { key: "trust", label: "Trust", format: formatRatio },
  { key: "emission", label: "Emission", format: (v) => `${formatAmount(v)} α` },
  { key: "weighted_by", label: "Validators weighting", format: (v) => String(v) },
];

const W = 240;
const H = 56;
const PAD = 3;

function Sparkline({ points, series, active, onHover }: { points: HistoryPoint[]; series: Series; active: number | null; onHover: (i: number | null) => void }) {
  const gradientId = useId();
  const values = points.map((p) => p[series.key]);
  const max = Math.max(...values);
  const min = Math.min(0, ...values);
  const span = max - min || 1;
  const x = (i: number) => PAD + (i * (W - PAD * 2)) / Math.max(1, points.length - 1);
  const y = (v: number) => H - PAD - ((v - min) / span) * (H - PAD * 2);
  const line = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(values.length - 1).toFixed(1)},${H} L${x(0).toFixed(1)},${H} Z`;
  const shown = active ?? values.length - 1;
  const current = values[shown] ?? 0;
  const flat = max === 0;

  return (
    <div className="min-w-0 bg-surface px-4 pt-3.5 pb-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs text-faint">{series.label}</p>
        <p className={cn("font-mono text-[13px] font-medium", flat ? "text-critical" : "text-foreground")}>{series.format(current)}</p>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="mt-2 h-14 w-full touch-none overflow-visible"
        aria-hidden
        onPointerMove={(e) => {
          const box = e.currentTarget.getBoundingClientRect();
          const i = Math.round(((e.clientX - box.left) / box.width) * (points.length - 1));
          onHover(Math.max(0, Math.min(points.length - 1, i)));
        }}
        onPointerLeave={() => onHover(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={0} x2={W} y1={H - PAD} y2={H - PAD} className="stroke-line-strong" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        {!flat && <path d={area} fill={`url(#${gradientId})`} />}
        <path
          d={line}
          fill="none"
          className={flat ? "stroke-critical" : "stroke-accent"}
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {active != null && <line x1={x(active)} x2={x(active)} y1={0} y2={H} className="stroke-line-strong" strokeWidth={1} vectorEffect="non-scaling-stroke" />}
      </svg>
    </div>
  );
}

/**
 * The last dozen epochs of one neuron. Fetched after the diagnosis renders, and hidden entirely
 * when the API has no history, so it never delays or clutters the answer.
 */
export function NeuronHistory({ network, hotkey, netuid }: { network: NetworkId; hotkey: string; netuid: number }) {
  const [points, setPoints] = useState<HistoryPoint[] | null>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    history(network, hotkey, netuid).then((result) => {
      if (!cancelled) setPoints(result.ok ? result.data.points : []);
    });
    return () => {
      cancelled = true;
    };
  }, [network, hotkey, netuid]);

  if (!points || points.length < 2) return null;
  const first = points[0];
  const last = points[points.length - 1];
  const hovered = active != null ? points[active] : undefined;

  return (
    <section aria-label={`Last ${points.length} epochs`} className="rise-in flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3 text-xs text-faint">
        <h3 className="font-medium text-muted-foreground">Last {points.length} epochs</h3>
        <span className="font-mono">
          {hovered ? `block ${formatInt(hovered.block)}` : first && last ? `blocks ${formatInt(first.block)} to ${formatInt(last.block)}` : null}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-line shadow-[0_0_0_1px_var(--line)] sm:grid-cols-2 lg:grid-cols-4">
        {SERIES.map((series) => (
          <Sparkline key={series.key} points={points} series={series} active={active} onHover={setActive} />
        ))}
      </div>
      <table className="sr-only">
        <caption>Neuron history, one row per epoch</caption>
        <thead>
          <tr>
            <th scope="col">Block</th>
            {SERIES.map((s) => (
              <th key={s.key} scope="col">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.block}>
              <th scope="row">{p.block}</th>
              {SERIES.map((s) => (
                <td key={s.key}>{s.format(p[s.key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
