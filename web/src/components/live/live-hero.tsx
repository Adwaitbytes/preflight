"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { formatInt, formatShare } from "@/lib/format";
import { BLOCK_SECONDS, VISIBLE_BLOCKS, type BlockBar, type LiveStats } from "@/lib/live";
import { NETWORK_LABEL, type NetworkId } from "@/lib/networks";
import type { LiveBlock } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useNow } from "./use-now";

export type PulseState = "connecting" | "live" | "paused" | "failing" | "replay";

const PULSE_LABEL: Record<PulseState, string> = {
  connecting: "Connecting",
  live: "Live",
  paused: "Paused",
  failing: "Reconnecting",
  replay: "Replay",
};

const PULSE_DOT: Record<PulseState, string> = {
  connecting: "bg-faint",
  live: "bg-healthy",
  paused: "bg-medium",
  failing: "bg-critical",
  replay: "bg-accent",
};

export function PulseDot({ state, className }: { state: PulseState; className?: string }) {
  const beating = state === "live" || state === "replay";
  return (
    <span aria-hidden className={cn("relative inline-flex size-2", className)}>
      {beating && <span className={cn("live-ping absolute inset-0 rounded-full", PULSE_DOT[state])} />}
      <span className={cn("relative inline-flex size-2 rounded-full", PULSE_DOT[state])} />
    </span>
  );
}

function secondsSince(timestamp: string | null, now: number): number | null {
  if (!timestamp || now === 0) return null;
  const at = Date.parse(timestamp);
  return Number.isFinite(at) ? Math.max(0, Math.floor((now - at) / 1000)) : null;
}

function BlockClock({ newest, state }: { newest: LiveBlock; state: PulseState }) {
  const now = useNow();
  const elapsed = secondsSince(newest.timestamp, now);
  const progress = elapsed == null ? 0 : Math.min(1, elapsed / BLOCK_SECONDS);
  const late = elapsed != null && elapsed > BLOCK_SECONDS * 3;
  return (
    <>
      <p className="mt-4 flex h-12 items-baseline overflow-hidden font-sans text-[2.75rem] leading-[3rem] font-light tracking-[-0.05em] text-foreground sm:h-16 sm:text-[4rem] sm:leading-[4rem]">
        <span className="mr-0.5 font-normal text-faint">#</span>
        <span key={newest.number} className="live-tick tnum">
          {formatInt(newest.number)}
        </span>
      </p>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-1 w-full max-w-40 overflow-hidden rounded-full bg-surface-3">
          {/* Remounts per block, so the fill restarts from empty instead of sweeping backwards */}
          <div
            key={newest.number}
            className={cn(
              "h-full origin-left rounded-full transition-transform duration-1000 ease-linear",
              state === "paused" ? "bg-medium/60" : late ? "bg-medium" : "bg-accent",
            )}
            style={{ transform: `scaleX(${state === "paused" ? 1 : progress})` }}
          />
        </div>
        <span className={cn("shrink-0 text-[13px] leading-6 tnum", late ? "text-medium" : "text-muted-foreground")}>
          {elapsed == null ? "Waiting for a block" : late ? `${elapsed} s, the chain is slow` : `${elapsed} s since the last block`}
        </span>
      </div>
    </>
  );
}

function Stat({ label, short, value, caption, alert = false }: { label: string; short: string; value: string; caption: string; alert?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col bg-surface px-3 py-3 sm:px-5 sm:py-4">
      <dt className="eyebrow truncate">
        <span className="sm:hidden">{short}</span>
        <span className="hidden sm:inline">{label}</span>
      </dt>
      <dd className={cn("mt-1.5 text-xl leading-7 font-semibold tracking-[-0.025em] tnum sm:mt-2 sm:text-2xl sm:leading-8", alert && "text-critical")}>{value}</dd>
      <dd className="mt-0.5 truncate text-xs text-faint tnum">{caption}</dd>
    </div>
  );
}

const SLOT_GAP = 2;
const SLOT_WIDTH = `calc((100% - ${(VISIBLE_BLOCKS - 1) * SLOT_GAP}px) / ${VISIBLE_BLOCKS})`;

function ActivityBars({ bars }: { bars: BlockBar[] }) {
  const peak = Math.max(1, ...bars.map((b) => b.total));
  const busiest = bars.reduce<BlockBar | null>((best, b) => (best && best.total >= b.total ? best : b), null);
  const label = busiest
    ? `Activity per block over the last ${bars.length} blocks. Busiest was block ${formatInt(busiest.number)} with ${busiest.total} activities`
    : "Activity per block, waiting for blocks";
  return (
    // Slots are placed with transforms from the right edge: each new block slides the row along without a layout shift
    <div role="img" aria-label={label} className="relative h-12 overflow-hidden border-b border-line">
      {bars.map((bar, i) => {
        const height = Math.max(6, (bar.total / peak) * 100);
        const failedShare = bar.total ? bar.failed / bar.total : 0;
        return (
          <span
            key={bar.number}
            className="absolute right-0 bottom-0 flex h-full items-end transition-transform duration-500 ease-out"
            style={{ width: SLOT_WIDTH, transform: `translateX(calc(${bars.length - 1 - i} * (-100% - ${SLOT_GAP}px)))` }}
          >
            <span
              title={`Block ${formatInt(bar.number)}: ${bar.total} activities${bar.failed ? `, ${bar.failed} failed` : ""}`}
              className={cn(
                "live-bar-in flex w-full flex-col overflow-hidden rounded-t-[2px]",
                i === bars.length - 1 ? "bg-accent" : "bg-accent/35 dark:bg-accent/45",
              )}
              style={{ height: `${bar.total ? height : 6}%` }}
            >
              {bar.failed > 0 && <span className="w-full bg-critical" style={{ height: `${failedShare * 100}%` }} />}
            </span>
          </span>
        );
      })}
    </div>
  );
}

export function LiveHero({
  network,
  state,
  newest,
  stats,
  blockCount,
  selectedNetuid,
  onPickSubnet,
}: {
  network: NetworkId;
  state: PulseState;
  newest: LiveBlock | null;
  stats: LiveStats | null;
  blockCount: number;
  selectedNetuid: number | null;
  onPickSubnet: (netuid: number) => void;
}) {
  const where = state === "replay" ? "Recorded Finney" : NETWORK_LABEL[network];
  return (
    <section aria-label="Chain pulse" className="panel overflow-hidden">
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:items-center lg:gap-10">
        <div className="min-w-0">
          {/* The network leads and the changing state word trails, so a state change never moves other text */}
          <p className="eyebrow flex items-center gap-2.5">
            <span>{where}</span>
            <span aria-hidden className="h-3 w-px bg-line-strong" />
            <PulseDot state={state} />
            <span className="text-muted-foreground">{PULSE_LABEL[state]}</span>
          </p>
          {newest ? (
            <BlockClock newest={newest} state={state} />
          ) : (
            <>
              <Skeleton className="mt-4 h-12 w-64 max-w-full sm:h-14" />
              <Skeleton className="mt-4 h-6 w-56 max-w-full" />
            </>
          )}
        </div>
        <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-line shadow-[0_0_0_1px_var(--line)]">
          {stats ? (
            <>
              <Stat
                label="Tx per minute"
                short="Tx per min"
                value={stats.txPerMinute == null ? "0" : formatInt(stats.txPerMinute)}
                caption={`across ${blockCount} blocks`}
              />
              <Stat
                label="Failure rate"
                short="Failed"
                value={stats.failureRate == null ? "0%" : formatShare(stats.failureRate)}
                caption={`${formatInt(stats.failed)} of ${formatInt(stats.activities)}`}
                alert={stats.failed > 0}
              />
              <Stat label="Wallets" short="Wallets" value={formatInt(stats.signers)} caption="signed recently" />
            </>
          ) : (
            Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="min-w-0 bg-surface px-3 py-3 sm:px-5 sm:py-4">
                <Skeleton className="h-4 w-full max-w-20" />
                <Skeleton className="mt-1.5 h-7 w-14 sm:mt-2 sm:h-8 sm:w-16" />
                <Skeleton className="mt-0.5 h-4 w-full max-w-28" />
              </div>
            ))
          )}
        </dl>
      </div>
      <div className="grid gap-5 border-t border-line px-5 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:items-end lg:gap-10">
        <div className="min-w-0">
          <p id="busiest-subnets" className="eyebrow">
            Busiest subnets
          </p>
          <div role="group" aria-labelledby="busiest-subnets" className="-mx-1 mt-2.5 flex h-9 items-center gap-1 overflow-x-auto px-1 [scrollbar-width:none] [mask-image:linear-gradient(to_right,transparent,#000_6px,#000_calc(100%-24px),transparent)]">
            {stats ? (
              stats.topSubnets.length ? (
                stats.topSubnets.map(({ netuid, count }) => {
                  const active = selectedNetuid === netuid;
                  return (
                    <button
                      key={netuid}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onPickSubnet(netuid)}
                      title={active ? `Show every subnet again` : `Show only SN${netuid}`}
                      className={cn(
                        "inline-flex h-7 w-[5rem] shrink-0 cursor-pointer items-center justify-between gap-1.5 rounded-full px-2 font-mono text-xs font-medium transition-[background-color,color,box-shadow] duration-150",
                        active
                          ? "bg-foreground text-background"
                          : "bg-surface-2 text-foreground shadow-[0_0_0_1px_var(--line)] hover:bg-surface-3",
                      )}
                    >
                      SN{netuid}
                      <span className={cn("tnum", active ? "text-background/70" : "text-faint")}>{count}</span>
                    </button>
                  );
                })
              ) : (
                <span className="text-[13px] leading-7 text-faint">No subnet activity yet</span>
              )
            ) : (
              Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-7 w-[5rem] shrink-0 rounded-full" />)
            )}
          </div>
        </div>
        <div className="min-w-0">
          <p className="eyebrow flex items-center justify-between gap-3">
            <span>Activity per block</span>
            <span className="flex items-center gap-1.5 normal-case tracking-normal">
              <span aria-hidden className="size-1.5 rounded-full bg-critical" />
              Failed
            </span>
          </p>
          <div className="mt-2.5">
            <ActivityBars bars={stats?.bars ?? []} />
          </div>
        </div>
      </div>
    </section>
  );
}
