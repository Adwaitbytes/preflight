"use client";

import { useId, useState } from "react";
import { barWidth } from "@/lib/stats";
import { cn } from "@/lib/utils";

export interface Column {
  key: string;
  /** Axis and tooltip title, like "14:00" or "30 Oct" */
  label: string;
  value: number;
  /** Extra tooltip lines, like "4 sessions" */
  lines?: string[];
}

/**
 * One measure over a sequence: single-hue columns with rounded data ends, a 2px gap, a quiet
 * baseline and max line, and a tooltip on hover or keyboard focus. A table carries the same
 * numbers for screen readers.
 */
export function ColumnChart({ title, unit, columns, height = 148, everyNth }: { title: string; unit: string; columns: Column[]; height?: number; everyNth?: number }) {
  const id = useId();
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...columns.map((c) => c.value), 0);
  const step = everyNth ?? Math.max(1, Math.ceil(columns.length / 6));
  const hovered = active !== null ? columns[active] : undefined;
  return (
    <figure className="flex min-w-0 flex-col gap-3">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-xs text-faint tnum">
          peak {max.toLocaleString("en-US")} {unit}
        </span>
      </figcaption>
      <div className="relative" style={{ height }} onMouseLeave={() => setActive(null)}>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-line" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-line-strong" />
        <div className="absolute inset-0 flex items-end gap-[2px]" role="group" aria-label={`${title}, one column per period; the table below lists every value`}>
          {columns.map((c, i) => (
            <button
              key={c.key}
              type="button"
              tabIndex={0}
              aria-label={`${c.label}: ${c.value} ${unit}`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="group relative flex h-full min-w-0 flex-1 items-end focus-visible:outline-none"
            >
              <span
                className={cn(
                  "block w-full rounded-t-[4px] transition-colors duration-150 motion-reduce:transition-none",
                  c.value > 0 ? (active === i ? "bg-accent" : "bg-accent/70") : "bg-transparent",
                  "group-focus-visible:shadow-[0_0_0_2px_var(--ring)]",
                )}
                style={{ height: c.value > 0 ? `${Math.max(3, (c.value / Math.max(max, 1)) * 100)}%` : 0 }}
              />
            </button>
          ))}
        </div>
        {hovered && active !== null && (
          <div
            role="status"
            className="pointer-events-none absolute -top-2 z-10 min-w-36 -translate-y-full rounded-lg bg-surface px-3 py-2 text-xs shadow-[0_0_0_1px_var(--line-strong),0_8px_24px_rgb(0_0_0/0.18)]"
            style={{ left: `clamp(0px, calc(${((active + 0.5) / columns.length) * 100}% - 4.5rem), calc(100% - 9rem))` }}
          >
            <p className="font-medium">{hovered.label}</p>
            <p className="mt-0.5 tnum">
              <span className="font-semibold">{hovered.value.toLocaleString("en-US")}</span> {unit}
            </p>
            {hovered.lines?.map((line) => (
              <p key={line} className="text-muted-foreground tnum">
                {line}
              </p>
            ))}
          </div>
        )}
      </div>
      <div aria-hidden className="flex justify-between gap-1 font-mono text-[11px] text-faint tnum">
        {columns.map((c, i) => (
          <span key={c.key} className={cn("min-w-0 flex-1 truncate", i % step === 0 ? "" : "invisible")}>
            {c.label}
          </span>
        ))}
      </div>
      <table id={`${id}-table`} className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {columns.map((c) => (
            <tr key={c.key}>
              <th scope="row">{c.label}</th>
              <td>
                {c.value} {unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export interface BarRow {
  key: string;
  label: React.ReactNode;
  value: number;
  /** Shown after the value, like "52 s avg" */
  hint?: string;
  title?: string;
}

/** Ranked magnitudes: a single hue, the value in text ink beside each bar */
export function BarList({ rows, empty = "Nothing in this range", max: limit = 8 }: { rows: BarRow[]; empty?: string; max?: number }) {
  const [all, setAll] = useState(false);
  if (rows.length === 0) return <p className="py-2 text-sm text-faint">{empty}</p>;
  const top = Math.max(...rows.map((r) => r.value));
  const shown = all ? rows : rows.slice(0, limit);
  return (
    <div className="flex flex-col">
      <ol className="flex flex-col gap-2">
        {shown.map((r) => (
          <li key={r.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1" title={r.title}>
            <div className="relative min-w-0 overflow-hidden rounded-md py-1 pl-2">
              <span aria-hidden className="absolute inset-y-0 left-0 rounded-md bg-accent/15" style={{ width: `${barWidth(r.value, top)}%` }} />
              <span className="relative block truncate text-[13px]">{r.label}</span>
            </div>
            <span className="text-right font-mono text-xs whitespace-nowrap tnum">
              {r.value.toLocaleString("en-US")}
              {r.hint && <span className="ml-1.5 text-faint">{r.hint}</span>}
            </span>
          </li>
        ))}
      </ol>
      {rows.length > limit && (
        <button type="button" onClick={() => setAll((v) => !v)} aria-expanded={all} className="mt-2 self-start rounded text-xs font-medium text-accent-ink hover:underline focus-visible:shadow-[0_0_0_2px_var(--ring)] focus-visible:outline-none">
          {all ? `Show the top ${limit}` : `Show all ${rows.length}`}
        </button>
      )}
    </div>
  );
}
