"use client";

import { ArrowUp, ChevronRight, Pause, SearchX } from "lucide-react";
import Link from "next/link";
import { memo, type FocusEvent, type KeyboardEvent, type PointerEvent } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatInt, pluralize, truncateMiddle } from "@/lib/format";
import { errorName, summarySegments, type BlockView } from "@/lib/live";
import type { NetworkId } from "@/lib/networks";
import type { Activity, LiveBlock } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FAILED_TILE, KIND_META } from "./kinds";

const TIME = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

function clock(timestamp: string | null): string | null {
  if (!timestamp) return null;
  const at = Date.parse(timestamp);
  return Number.isFinite(at) ? TIME.format(at) : null;
}

const INNER_LINK = "pointer-events-auto relative z-10 rounded-[4px]";

function Sentence({ activity, network }: { activity: Activity; network: NetworkId }) {
  return (
    <>
      {summarySegments(activity.summary, activity.signer).map((segment, i) => {
        if (segment.kind === "text") return <span key={i}>{segment.text}</span>;
        if (!segment.address) {
          return (
            <span key={i} className="font-mono text-[0.92em] text-muted-foreground">
              {segment.text}
            </span>
          );
        }
        return (
          <Link
            prefetch={false}
            key={i}
            href={`/doctor/${network}/${segment.address}`}
            title={`Diagnose ${segment.address}`}
            className={cn(
              INNER_LINK,
              "font-mono text-[0.92em] text-foreground underline decoration-line-strong decoration-1 underline-offset-[3px] transition-colors hover:text-accent-ink hover:decoration-accent",
            )}
          >
            {segment.text}
          </Link>
        );
      })}
    </>
  );
}

function SubnetChip({ netuid }: { netuid: number }) {
  return (
    <Link
            prefetch={false}
      href={`/subnets/${netuid}`}
      title={`Open SN${netuid}`}
      className={cn(
        INNER_LINK,
        "inline-flex h-6 w-[3.25rem] shrink-0 items-center justify-center rounded-md bg-surface-2 px-1 font-mono text-xs font-medium text-muted-foreground shadow-[0_0_0_1px_var(--line)] transition-colors hover:bg-surface-3 hover:text-foreground",
      )}
    >
      SN{netuid}
    </Link>
  );
}

/** Fixed slots on wide screens, so amounts, subnets and times each line up in their own column */
function Meta({ activity, time, className }: { activity: Activity; time?: string | null; className?: string }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3 sm:justify-end", className)}>
      {activity.amount ? (
        <span className="truncate font-mono text-[13px] text-foreground tnum sm:w-28 sm:text-right">{activity.amount}</span>
      ) : (
        <span aria-hidden className="hidden w-28 sm:block" />
      )}
      {activity.netuid != null ? <SubnetChip netuid={activity.netuid} /> : <span aria-hidden className="hidden w-[3.25rem] sm:block" />}
      {time !== undefined && <span className="hidden w-[4.25rem] shrink-0 text-right font-mono text-xs text-faint tnum sm:block">{time}</span>}
    </div>
  );
}

const ActivityRow = memo(function ActivityRow({ activity, network, time }: { activity: Activity; network: NetworkId; time: string | null }) {
  const meta = KIND_META[activity.kind];
  const Icon = meta.icon;
  const failed = !activity.success;
  const error = errorName(activity.error);
  const href = `/tx/${network}/${activity.ref}`;
  return (
    <li className="group relative grid grid-cols-[1.75rem_minmax(0,1fr)] items-start gap-x-3 px-3.5 py-3 transition-colors duration-150 hover:bg-surface-2/70 has-[[data-row]:focus-visible]:bg-surface-2/70 sm:grid-cols-[1.75rem_minmax(0,1fr)_auto] sm:items-center sm:px-4">
      <span aria-hidden className={cn("pointer-events-none grid size-7 place-items-center rounded-lg", failed ? FAILED_TILE : meta.tile)}>
        <Icon className="size-3.5" />
      </span>
      <div className="pointer-events-none min-w-0 sm:py-0.5">
        <p className={cn("text-[14px] leading-[1.35rem] text-pretty [overflow-wrap:anywhere]", meta.quiet && !failed ? "text-muted-foreground" : "text-foreground")}>
          <span className="sr-only">{failed ? `Failed ${meta.noun.toLowerCase()}: ` : `${meta.noun}: `}</span>
          <Sentence activity={activity} network={network} />
        </p>
        {failed && (
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span className="font-mono text-critical [overflow-wrap:anywhere]" title={activity.error ?? undefined}>
              {error ?? "Failed"}
            </span>
            <Link
            prefetch={false}
              href={href}
              className={cn(INNER_LINK, "inline-flex items-center gap-0.5 font-medium text-muted-foreground underline-offset-[3px] hover:text-foreground hover:underline")}
            >
              Why
              <span className="sr-only"> did {activity.ref} fail</span>
              <ChevronRight className="size-3" aria-hidden />
            </Link>
          </p>
        )}
        {/* The block header owns the time on small screens */}
        {(activity.netuid != null || activity.amount) && <Meta activity={activity} className="mt-2 sm:hidden" />}
      </div>
      <div className="pointer-events-none hidden items-center gap-2 sm:flex">
        <Meta activity={activity} time={time} />
        <ChevronRight className="size-4 text-faint opacity-0 transition-opacity duration-150 group-hover:opacity-100" aria-hidden />
      </div>
      {/* The whole row opens the debugger; the links inside sit above this layer */}
      <Link
            prefetch={false}
        href={href}
        data-row
        className="absolute inset-0 z-0 outline-offset-[-2px] focus-visible:outline-2"
      >
        <span className="sr-only">Debug transaction {activity.ref}</span>
      </Link>
    </li>
  );
});

function BlockHeader({ block, id }: { block: LiveBlock; id: string }) {
  const time = clock(block.timestamp);
  return (
    <div className="flex min-w-0 items-center gap-2.5 px-1 pb-2.5 font-mono text-xs text-faint">
      <h3 id={id} className="shrink-0 font-medium text-muted-foreground tnum">
        <span className="font-sans font-normal text-faint">Block </span>
        {formatInt(block.number)}
      </h3>
      {time && <span className="shrink-0 tnum">{time}</span>}
      <span className="hidden truncate sm:inline" title={block.hash}>
        {truncateMiddle(block.hash, 6, 4)}
      </span>
      <span aria-hidden className="h-px min-w-4 flex-1 bg-line" />
      <span className="shrink-0 font-sans">{pluralize(block.system_calls, "system call")}</span>
    </div>
  );
}

const BlockGroup = memo(function BlockGroup({ view, network, filtered }: { view: BlockView; network: NetworkId; filtered: boolean }) {
  const { block, activities, missingBelow } = view;
  const headingId = `block-${block.number}`;
  const time = clock(block.timestamp);
  return (
    <li aria-labelledby={headingId} className="live-row-in pt-6 first:pt-0">
      <BlockHeader block={block} id={headingId} />
      {activities.length > 0 ? (
        <ol aria-label={`${pluralize(activities.length, filtered ? "matching activity" : "activity", filtered ? "matching activities" : "activities")}`} className="panel divide-y divide-line overflow-hidden">
          {activities.map((activity) => (
            <ActivityRow key={activity.index} activity={activity} network={network} time={time} />
          ))}
        </ol>
      ) : (
        <p className="rounded-xl px-4 py-3 text-[13px] text-faint shadow-[inset_0_0_0_1px_var(--line)]">No signed transactions, only the chain&rsquo;s own housekeeping</p>
      )}
      {missingBelow > 0 && (
        <p className="flex items-center gap-3 pt-6 text-xs text-faint">
          <span aria-hidden className="h-px flex-1 border-t border-dashed border-line-strong" />
          {pluralize(missingBelow, "block")} not loaded, the tab was away or the feed skipped ahead
          <span aria-hidden className="h-px flex-1 border-t border-dashed border-line-strong" />
        </p>
      )}
    </li>
  );
});

export function StreamSkeleton() {
  return (
    <div role="status" aria-label="Waiting for the first blocks" className="flex flex-col gap-6">
      {[4, 3, 2].map((rows, g) => (
        <div key={g}>
          <div className="flex items-center gap-2.5 px-1 pb-2.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16" />
            <span aria-hidden className="h-px flex-1 bg-line" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="panel divide-y divide-line overflow-hidden">
            {Array.from({ length: rows }, (_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                <Skeleton className="size-7 shrink-0 rounded-lg" />
                <Skeleton className={cn("h-4", ["w-3/5", "w-2/5", "w-1/2", "w-2/3"][i % 4])} />
                <Skeleton className="ml-auto hidden h-6 w-24 sm:block" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function StreamEmpty({ blocks, onClear }: { blocks: number; onClear: () => void }) {
  return (
    <div className="panel flex flex-col items-center px-6 py-14 text-center">
      <div className="grid size-11 place-items-center rounded-xl bg-surface-2 text-muted-foreground shadow-[0_0_0_1px_var(--line-strong)]">
        <SearchX className="size-5" aria-hidden />
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-[-0.015em]">Nothing matches yet</h3>
      <p className="mt-2 max-w-[46ch] text-sm leading-6 text-pretty text-muted-foreground">
        None of the last {pluralize(blocks, "block")} match these filters. Matching activity appears here the moment its block lands
      </p>
      <Button variant="secondary" className="mt-6" onClick={onClear}>
        Clear filters
      </Button>
    </div>
  );
}

function moveFocus(event: KeyboardEvent<HTMLElement>) {
  const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
  if (!keys.includes(event.key)) return;
  const target = event.target as HTMLElement;
  if (!target.matches("[data-row]")) return;
  const rows = [...event.currentTarget.querySelectorAll<HTMLElement>("[data-row]")];
  const at = rows.indexOf(target);
  const next = event.key === "Home" ? 0 : event.key === "End" ? rows.length - 1 : at + (event.key === "ArrowDown" ? 1 : -1);
  const row = rows[next];
  if (!row) return;
  event.preventDefault();
  row.focus();
}

export function LiveStream({
  views,
  network,
  filtered,
  pending,
  held,
  onShowPending,
  onHold,
}: {
  views: BlockView[];
  network: NetworkId;
  filtered: boolean;
  pending: { activities: number; blocks: number };
  /** Why the stream is still, shown where the reader is looking rather than only in the heading */
  held: "paused" | "reading" | null;
  onShowPending: () => void;
  /** The stream holds still while the pointer or keyboard focus is in it */
  onHold: (source: "pointer" | "focus", held: boolean) => void;
}) {
  const waiting = pending.activities > 0 || (!filtered && pending.blocks > 0);
  const label =
    pending.activities > 0
      ? `${pluralize(pending.activities, filtered ? "new match" : "new activity", filtered ? "new matches" : "new activities")}`
      : pluralize(pending.blocks, "new block");

  return (
    <div
      onPointerEnter={(e: PointerEvent) => e.pointerType === "mouse" && onHold("pointer", true)}
      // The stream can mount under a resting cursor, where no enter event fires; the first move engages the hold
      onPointerMove={(e: PointerEvent) => e.pointerType === "mouse" && onHold("pointer", true)}
      onPointerLeave={(e: PointerEvent) => e.pointerType === "mouse" && onHold("pointer", false)}
      onFocus={() => onHold("focus", true)}
      onBlur={(e: FocusEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onHold("focus", false);
      }}
      onKeyDown={moveFocus}
    >
      {/* Takes no height, so the pill never pushes a row */}
      <div className="pointer-events-none sticky top-[6.75rem] z-20 h-0 md:top-[4.25rem]">
        {held != null && !waiting && (
          <div className="flex justify-center">
            <p className="live-row-in -mt-1 inline-flex h-8 items-center gap-1.5 rounded-full bg-surface-2 pr-3.5 pl-3 text-[13px] font-medium text-muted-foreground shadow-[0_0_0_1px_var(--line-strong)]">
              <Pause className="size-3.5" aria-hidden />
              {held === "paused" ? "Paused" : "Holding while you read"}
            </p>
          </div>
        )}
        {waiting && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onShowPending}
              className="live-row-in pointer-events-auto -mt-1 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-foreground pr-3.5 pl-3 text-[13px] font-medium text-background shadow-(--shadow-float) transition-transform duration-150 hover:-translate-y-px"
            >
              <ArrowUp className="size-3.5" aria-hidden />
              {label}
            </button>
          </div>
        )}
      </div>
      <ol aria-label="Recent blocks, newest first" className="flex flex-col">
        {views.map((view) => (
          <BlockGroup key={view.block.number} view={view} network={network} filtered={filtered} />
        ))}
      </ol>
    </div>
  );
}
