"use client";

import { ArrowDownRight, ArrowRight, ArrowUpRight, FlaskConical, PowerOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { epochDelta, type Direction, type EpochDelta } from "@/lib/epoch";
import { formatShare, truncateMiddle } from "@/lib/format";
import type { EpochMiner, EpochValidator } from "@/lib/types";
import { cn } from "@/lib/utils";

const TONE: Record<Direction, string> = {
  up: "bg-healthy-soft text-healthy",
  down: "bg-critical-soft text-critical",
  flat: "bg-surface-3 text-muted-foreground",
};
const ICON = { up: ArrowUpRight, down: ArrowDownRight, flat: ArrowRight } as const;
const FIRST_ROWS = 12;

export function DeltaBadge({ delta, className }: { delta: EpochDelta; className?: string }) {
  const Icon = ICON[delta.direction];
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap tnum", TONE[delta.direction], className)}>
      <Icon className="size-3.5" aria-hidden />
      <span aria-hidden>{delta.label}</span>
      <span className="sr-only">{delta.spoken}</span>
    </span>
  );
}

function share(value: number): string {
  return formatShare(value, value > 0 && value < 0.001 ? 3 : value < 0.1 ? 2 : 1);
}

export function MinersTable({ miners, focusUid, baseline }: { miners: readonly EpochMiner[]; focusUid: number | null; baseline: ReadonlyMap<number, number> | null }) {
  const [all, setAll] = useState(false);
  const top = Math.max(...miners.map((m) => m.incentive_next), 1e-9);
  const shown = all ? miners : miners.slice(0, FIRST_ROWS);
  return (
    <section aria-labelledby="epoch-miners" className="panel overflow-hidden">
      <div className="flex items-baseline justify-between gap-3 px-4 pt-4 pb-3 sm:px-5">
        <h2 id="epoch-miners" className="text-sm font-semibold">
          Miners next epoch
        </h2>
        <p className="text-xs text-faint">{baseline ? "What-if against live" : "Last epoch → next epoch"}</p>
      </div>
      {miners.length === 0 ? (
        <p className="border-t border-line px-5 py-6 text-sm text-muted-foreground">No miner earns at the next epoch: no voting validator weights any UID.</p>
      ) : (
        <ol className="border-t border-line">
          {shown.map((m) => {
            const delta = epochDelta(baseline ? { incentive_now: baseline.get(m.uid) ?? 0, incentive_next: m.incentive_next, change: changeAgainst(baseline.get(m.uid) ?? 0, m.incentive_next) } : m);
            const focused = m.uid === focusUid;
            return (
              <li key={m.uid} className={cn("grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1 border-b border-line px-4 py-3 last:border-b-0 sm:grid-cols-[5rem_minmax(0,1fr)_7.5rem_auto] sm:px-5", focused && "bg-accent-soft/50")}>
                <div className="flex flex-col">
                  <span className={cn("font-mono text-[13px]", focused ? "font-semibold text-accent-ink" : "font-medium")}>UID {m.uid}</span>
                  <span className="truncate font-mono text-[11px] text-faint" title={m.hotkey}>
                    {truncateMiddle(m.hotkey, 5, 4)}
                  </span>
                </div>
                <div className="flex min-w-0 flex-col gap-1.5 pt-0.5">
                  <span aria-hidden className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                    <span className={cn("block h-full rounded-full", m.incentive_next > 0 ? "bg-accent" : "bg-transparent")} style={{ width: `${Math.max(m.incentive_next > 0 ? 2 : 0, (m.incentive_next / top) * 100)}%` }} />
                  </span>
                  <p className="text-xs leading-5 text-pretty text-muted-foreground">
                    {m.reason}
                    {m.clipped >= 0.01 && <span className="ml-1.5 rounded bg-medium-soft px-1.5 py-px font-medium text-medium">cut {formatShare(m.clipped, 0)}</span>}
                  </p>
                </div>
                <p className="col-start-2 font-mono text-xs text-faint tnum sm:col-start-auto sm:pt-0.5 sm:text-right">
                  {share(baseline ? (baseline.get(m.uid) ?? 0) : m.incentive_now)} → <span className="font-semibold text-foreground">{share(m.incentive_next)}</span>
                </p>
                <div className="col-start-3 row-start-1 sm:col-start-auto sm:row-start-auto">
                  <DeltaBadge delta={delta} />
                </div>
              </li>
            );
          })}
        </ol>
      )}
      {miners.length > FIRST_ROWS && (
        <div className="border-t border-line px-4 py-2.5 sm:px-5">
          <Button size="sm" variant="ghost" onClick={() => setAll((v) => !v)} aria-expanded={all}>
            {all ? "Show the top 12" : `Show all ${miners.length}`}
          </Button>
        </div>
      )}
    </section>
  );
}

function changeAgainst(before: number, after: number): number {
  return before > 0 ? (after - before) / before : after > 0 ? 1 : 0;
}

const STATUS: Record<EpochValidator["status"], { label: string; tone: string }> = {
  voting: { label: "Voting", tone: "bg-healthy-soft text-healthy" },
  inactive: { label: "Stale", tone: "bg-medium-soft text-medium" },
  no_weights: { label: "No weights", tone: "bg-surface-3 text-muted-foreground" },
  below_threshold: { label: "Too little stake", tone: "bg-surface-3 text-muted-foreground" },
};

export function ValidatorsTable({
  validators,
  offline,
  tested,
  onToggleOffline,
  onTest,
}: {
  validators: readonly EpochValidator[];
  offline: ReadonlySet<number>;
  tested: number | null;
  onToggleOffline: (uid: number) => void;
  onTest: (uid: number) => void;
}) {
  const top = Math.max(...validators.map((v) => v.stake_share), 1e-9);
  return (
    <section aria-labelledby="epoch-validators" className="panel overflow-hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-4 pt-4 pb-3 sm:px-5">
        <h2 id="epoch-validators" className="text-sm font-semibold">
          Validators with a permit
        </h2>
        <p className="text-xs text-faint">Trust is the share of a validator’s weight that survives consensus</p>
      </div>
      <ol className="border-t border-line">
        {validators.map((v) => {
          const status = STATUS[v.status];
          const isOffline = offline.has(v.uid);
          return (
            <li key={v.uid} className={cn("grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 gap-y-2 border-b border-line px-4 py-3 last:border-b-0 sm:grid-cols-[5rem_8rem_4.5rem_minmax(0,1fr)_auto] sm:items-center sm:px-5", isOffline && "bg-surface-2")}>
              <div className="flex flex-col">
                <span className="font-mono text-[13px] font-medium">UID {v.uid}</span>
                <span className="truncate font-mono text-[11px] text-faint" title={v.hotkey}>
                  {truncateMiddle(v.hotkey, 5, 4)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs tnum">{formatShare(v.stake_share)} <span className="text-faint">of stake</span></span>
                <span aria-hidden className="h-1 overflow-hidden rounded-full bg-surface-3">
                  <span className="block h-full rounded-full bg-foreground/40" style={{ width: `${(v.stake_share / top) * 100}%` }} />
                </span>
              </div>
              <div className="col-start-2 flex items-center gap-2 sm:col-start-auto sm:flex-col sm:items-start sm:gap-0.5">
                <span className={cn("rounded px-1.5 py-px text-[11px] font-medium", status.tone)}>{status.label}</span>
                {v.status === "voting" && <span className={cn("font-mono text-xs tnum", v.trust < 0.95 ? "text-medium" : "text-muted-foreground")}>trust {formatShare(v.trust, 0)}</span>}
              </div>
              <p className="col-span-2 text-xs leading-5 text-pretty text-muted-foreground sm:col-span-1">{v.note}</p>
              <div className="col-span-2 flex gap-1.5 sm:col-span-1 sm:justify-end">
                <Button size="sm" variant={isOffline ? "outline" : "ghost"} aria-pressed={isOffline} onClick={() => onToggleOffline(v.uid)} className="h-7 px-2 text-xs">
                  <PowerOff className="size-3.5" aria-hidden />
                  {isOffline ? "Offline" : "Take offline"}
                </Button>
                <Button size="sm" variant={tested === v.uid ? "outline" : "ghost"} aria-pressed={tested === v.uid} onClick={() => onTest(v.uid)} className="h-7 px-2 text-xs">
                  <FlaskConical className="size-3.5" aria-hidden />
                  Test weights
                </Button>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
