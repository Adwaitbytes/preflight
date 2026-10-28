"use client";

import { ArrowDownRight, ArrowRight, ArrowUpRight, RotateCw } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useAppState } from "@/components/site/app-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApiError } from "@/lib/api";
import {
  DEFAULT_EPOCHS,
  EPOCH_OPTIONS,
  epochHint,
  formatRank,
  formatSharePercent,
  formatSignificant,
  incentiveDelta,
  longerOptions,
  measuredEpochBlocks,
  rankDelta,
  reasonSentence,
  sinceUpdate,
  supportBars,
  windowLabel,
  type Delta,
  type Direction,
} from "@/lib/change";
import { truncateMiddle } from "@/lib/format";
import type { NetworkId } from "@/lib/networks";
import type { IncentiveChange as Change } from "@/lib/types";
import { cn } from "@/lib/utils";

type State = { status: "loading" } | { status: "ready"; change: Change } | { status: "failed"; error: ApiError };
type Settled = { key: string; state: State };

const TONE: Record<Direction, string> = {
  up: "bg-healthy-soft text-healthy",
  down: "bg-critical-soft text-critical",
  flat: "bg-surface-3 text-muted-foreground",
};

const ICON = { up: ArrowUpRight, down: ArrowDownRight, flat: ArrowRight } as const;

function DeltaBadge({ delta, className }: { delta: Delta; className?: string }) {
  const Icon = ICON[delta.direction];
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold tnum", TONE[delta.direction], className)}>
      <Icon className="size-3.5" aria-hidden />
      <span aria-hidden>{delta.label}</span>
      <span className="sr-only">{delta.spoken}</span>
    </span>
  );
}

function Point({ label, before, after, delta }: { label: string; before: string; after: string; delta: Delta | null }) {
  return (
    <div className="flex min-w-0 flex-col bg-surface px-4 py-3 sm:px-5">
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[15px] tnum">
        <span className="text-faint">{before}</span>
        <ArrowRight className="size-3.5 text-faint" aria-label="to" />
        <span className="font-semibold text-foreground">{after}</span>
        {delta && <DeltaBadge delta={delta} className="ml-1" />}
      </dd>
    </div>
  );
}

/** A diverging bar: support gained grows right of the centre line, support lost grows left */
function SupportBar({ direction, width }: { direction: Direction; width: number }) {
  return (
    <div aria-hidden className="relative h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
      <span className="absolute inset-y-0 left-1/2 w-px bg-line-strong" />
      {direction !== "flat" && (
        <span
          className={cn("absolute inset-y-0 rounded-full", direction === "up" ? "left-1/2 bg-healthy" : "right-1/2 bg-critical")}
          style={{ width: `${Math.max(2, width * 50)}%` }}
        />
      )}
    </div>
  );
}

function ChangeBody({ change, epochs, onPick }: { change: Change; epochs: number; onPick: (epochs: number) => void }) {
  const delta = incentiveDelta(change.before, change.after, change.change);
  const rank = rankDelta(change.before, change.after);
  const bars = supportBars(change.drivers);
  const moved = change.drivers.filter((d) => d.support_after !== d.support_before);

  return (
    <div className="rise-in flex flex-col gap-4">
      <div className="panel flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <DeltaBadge delta={delta} className="mt-0.5" />
          <p className="min-w-0 text-[15px] leading-7 text-pretty">{change.headline}</p>
        </div>
        <dl className="grid gap-px overflow-hidden rounded-xl bg-line shadow-[0_0_0_1px_var(--line)] sm:grid-cols-2">
          <Point label="Incentive" before={formatSignificant(change.before.incentive)} after={formatSignificant(change.after.incentive)} delta={null} />
          <Point label="Rank by emission" before={formatRank(change.before)} after={formatRank(change.after)} delta={rank} />
        </dl>
        <p className="font-mono text-xs text-faint tnum">{windowLabel(change)}</p>
      </div>

      {moved.length > 0 ? (
        <section aria-label="Validators that moved it" className="flex flex-col gap-2">
          <h4 className="text-xs font-medium text-muted-foreground">Validators that moved it, largest first</h4>
          <ol className="overflow-hidden rounded-xl bg-line shadow-[0_0_0_1px_var(--line)]">
            {change.drivers.map((d, i) => {
              const bar = bars[i] ?? { direction: "flat" as const, width: 0 };
              const stale = d.reason.includes("has not set weights");
              return (
                <li key={d.uid} className={cn("grid gap-x-5 gap-y-2 bg-surface px-4 py-3.5 sm:grid-cols-[9rem_1fr_11rem] sm:items-center sm:px-5", i > 0 && "mt-px")}>
                  <div className="flex items-baseline gap-2 sm:flex-col sm:gap-0.5">
                    <span className="font-semibold">UID {d.uid}</span>
                    <span className="text-xs text-faint tnum">{formatSharePercent(d.stake_share_after || d.stake_share_before)} of stake</span>
                  </div>
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <p className="text-sm leading-6 text-pretty text-muted-foreground">{reasonSentence(d.reason)}</p>
                    {stale && <p className="text-xs text-medium">Last set weights {sinceUpdate(d.blocks_since_update)}</p>}
                    <span className="truncate font-mono text-[11px] text-faint" title={d.hotkey}>
                      {truncateMiddle(d.hotkey, 8, 6)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <SupportBar direction={bar.direction} width={bar.width} />
                    <p className="text-right font-mono text-xs text-faint tnum">
                      weight {formatSharePercent(d.weight_before)} → <span className="text-foreground">{formatSharePercent(d.weight_after)}</span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ) : (
        <div className="panel flex flex-col gap-3 px-5 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>No validator’s support for this UID moved in this window.</p>
          {longerOptions(epochs).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {longerOptions(epochs).map((option) => (
                <Button key={option.epochs} size="sm" variant="secondary" onClick={() => onPick(option.epochs)}>
                  Compare {option.label} back
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {change.notes.length > 0 && (
        <ul className="flex flex-col gap-1.5 text-xs leading-5 text-faint">
          {change.notes.map((note) => (
            <li key={note} className="text-pretty">
              {note}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ChangeSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy>
      <div className="panel flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Skeleton className="h-6 w-16" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
        <Skeleton className="h-[4.5rem] w-full rounded-xl" />
        <Skeleton className="h-3 w-56" />
      </div>
      <Skeleton className="h-44 w-full rounded-xl" />
      <span className="sr-only" role="status">
        Comparing this UID across epochs
      </span>
    </div>
  );
}

/**
 * Why did this UID's incentive move? Read after the diagnosis renders, so it never delays the
 * answer. Compares the UID now against 1, 5 or 20 epochs ago and lists the validators whose stake
 * weighted support moved it.
 */
export function IncentiveChange({ network, hotkey, netuid }: { network: NetworkId; hotkey: string; netuid: number }) {
  const { offline } = useAppState();
  const [epochs, setEpochs] = useState(DEFAULT_EPOCHS);
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled | null>(null);
  // Tempo varies by subnet (360 on most, 7,200 on some), so the hints use the length the first read measured
  const [epochBlocks, setEpochBlocks] = useState<number | undefined>(undefined);
  const groupId = useId();
  // Each request has a key; until its answer lands, whatever was shown before reads as loading
  const key = `${network}:${hotkey}:${netuid}:${epochs}:${attempt}`;
  const state: State = settled?.key === key ? settled.state : { status: "loading" };

  useEffect(() => {
    if (offline) return;
    const controller = new AbortController();
    import("@/lib/browser-api")
      .then((m) => m.browserApi(network).change(network, hotkey, netuid, epochs, controller.signal))
      .then((result) => {
        if (controller.signal.aborted) return;
        if (result.ok) setEpochBlocks(measuredEpochBlocks(result.data, epochs) ?? undefined);
        setSettled({ key, state: result.ok ? { status: "ready", change: result.data } : { status: "failed", error: result.error } });
      });
    return () => controller.abort();
  }, [offline, network, hotkey, netuid, epochs, key]);

  if (offline) return null;

  return (
    <section aria-labelledby={`${groupId}-title`} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div>
          <h3 id={`${groupId}-title`} className="text-sm font-semibold">
            What changed
          </h3>
          <p className="text-xs text-faint">The validators behind this UID’s incentive, now against earlier</p>
        </div>
        <div role="radiogroup" aria-label="Compare against" className="inline-flex rounded-lg bg-surface-2 p-0.5 shadow-[0_0_0_1px_var(--line)]">
          {EPOCH_OPTIONS.map((option) => {
            const active = option.epochs === epochs;
            return (
              <button
                key={option.epochs}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setEpochs(option.epochs)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
                  active ? "bg-surface text-foreground shadow-[0_0_0_1px_var(--line-strong)]" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
                <span className="ml-1 font-normal text-faint">{epochHint(option.epochs, epochBlocks)}</span>
              </button>
            );
          })}
        </div>
      </div>
      {state.status === "loading" && <ChangeSkeleton />}
      {state.status === "ready" && <ChangeBody change={state.change} epochs={epochs} onPick={setEpochs} />}
      {state.status === "failed" && (
        <div role="alert" className="panel flex flex-col gap-3 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Could not compare epochs.</span> {state.error.message}
          </p>
          <Button size="sm" variant="secondary" onClick={() => setAttempt((n) => n + 1)}>
            <RotateCw className="size-3.5" aria-hidden />
            Retry
          </Button>
        </div>
      )}
    </section>
  );
}
