"use client";

import { ArrowDown, ArrowRight, ArrowUp, ArrowUpDown, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { SeverityBadge } from "@/components/ui/badge";
import { MonoValue } from "@/components/ui/mono-value";
import { pluralize } from "@/lib/format";
import {
  countVerdicts,
  DEFAULT_FLEET_SORT,
  filterFleet,
  fleetDoctorHref,
  nextSort,
  partitionFleet,
  sortFleet,
  type FleetFilter,
  type FleetSort,
  type FleetSortKey,
} from "@/lib/fleet";
import { formatPerDay } from "@/lib/insights-format";
import type { NetworkId } from "@/lib/networks";
import { VERDICT_LABEL } from "@/lib/severity";
import type { FleetRow, Verdict } from "@/lib/types";
import { cn } from "@/lib/utils";

const VERDICT_DOT: Record<Verdict, string> = { healthy: "bg-healthy", warning: "bg-medium", broken: "bg-critical" };
const ROLE_LABEL: Record<FleetRow["role"], string> = { miner: "Miner", validator: "Validator", unregistered: "No seat" };

const FILTERS: { value: FleetFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "broken", label: "Broken" },
  { value: "warning", label: "To watch" },
  { value: "healthy", label: "Healthy" },
];

const EMPTY_FILTER: Record<Verdict, string> = { broken: "No seat is broken", warning: "No seat needs watching", healthy: "No seat is healthy" };

// The link's ::after covers its row or card, so the whole surface opens the Doctor with one tab stop
const STRETCHED_LINK =
  "outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:shadow-[inset_0_0_0_2px_var(--ring)]";

function rowKey(row: FleetRow): string {
  return `${row.hotkey}:${row.netuid ?? "none"}`;
}

function TaoPerDay({ row, unit = false }: { row: FleetRow; unit?: boolean }) {
  const value = row.tao_per_day ?? 0;
  const alpha = row.alpha_per_day ?? 0;
  return (
    <span title={`${formatPerDay(alpha)} alpha a day`} className={cn("font-mono tnum", value === 0 ? "text-faint" : "text-foreground")}>
      {formatPerDay(value)}
      {unit && <span className="ml-1 font-sans text-xs text-faint">TAO a day</span>}
    </span>
  );
}

function Worst({ row, wrap = false }: { row: FleetRow; wrap?: boolean }) {
  if (!row.worst) {
    return (
      <span className="inline-flex items-center gap-1.5 text-faint">
        <CheckCircle2 className="size-3.5 text-healthy" aria-hidden />
        No findings
      </span>
    );
  }
  return (
    <span className={cn("flex min-w-0 gap-2.5", wrap ? "items-start" : "items-center")}>
      <SeverityBadge severity={row.worst.severity} />
      <span title={row.worst.title} className={cn("min-w-0 text-foreground", wrap ? "pt-0.5 leading-5" : "truncate")}>
        {row.worst.title}
      </span>
    </span>
  );
}

function SortHeader({
  column,
  label,
  sort,
  onSort,
  className,
  alignEnd = false,
}: {
  column: FleetSortKey;
  label: string;
  sort: FleetSort;
  onSort: (column: FleetSortKey) => void;
  className?: string;
  alignEnd?: boolean;
}) {
  const active = sort.key === column;
  const Icon = !active ? ArrowUpDown : sort.direction === "asc" ? ArrowUp : ArrowDown;
  return (
    <th
      scope="col"
      aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
      className={cn("px-3 py-2.5 font-medium", alignEnd && "text-right", className)}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          "group/sort -mx-1 inline-flex cursor-pointer items-center gap-1 rounded px-1 transition-colors hover:text-foreground",
          active && "text-foreground",
          alignEnd && "flex-row-reverse",
        )}
      >
        {label}
        <Icon className={cn("size-3 transition-opacity", active ? "opacity-100" : "opacity-40 group-hover/sort:opacity-100")} aria-hidden />
      </button>
    </th>
  );
}

function SeatTable({ rows, network, sort, onSort }: { rows: FleetRow[]; network: NetworkId; sort: FleetSort; onSort: (key: FleetSortKey) => void }) {
  return (
    <div className="panel hidden overflow-hidden md:block">
      <table className="w-full table-fixed text-left text-[13px]">
        <caption className="sr-only">Seats this coldkey holds. Each row opens that seat in the Doctor</caption>
        <thead className="border-b border-line bg-surface-2/60 text-xs text-faint">
          <tr>
            <SortHeader column="subnet" label="Subnet" sort={sort} onSort={onSort} className="w-[26%] pl-5 lg:w-[22%]" />
            <SortHeader column="uid" label="UID" sort={sort} onSort={onSort} className="w-16" />
            <th scope="col" className="w-[23%] px-3 py-2.5 font-medium lg:w-[19%]">
              Hotkey
            </th>
            <th scope="col" className="hidden w-24 px-3 py-2.5 font-medium lg:table-cell">
              Role
            </th>
            <SortHeader column="tao" label="TAO a day" sort={sort} onSort={onSort} className="w-28" alignEnd />
            <SortHeader column="verdict" label="Worst finding" sort={sort} onSort={onSort} className="pr-5 pl-6" />
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="group relative transition-colors hover:bg-surface-2/60 has-[a:focus-visible]:bg-surface-2/60">
              <td className="py-3 pr-3 pl-5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span aria-hidden className={cn("size-2 shrink-0 rounded-full", VERDICT_DOT[row.verdict])} />
                  <Link href={fleetDoctorHref(network, row)} className={cn("min-w-0 truncate font-medium text-foreground", STRETCHED_LINK)}>
                    <span className="font-mono text-muted-foreground">SN{row.netuid}</span>
                    {row.subnet_name && <span className="ml-1.5">{row.subnet_name}</span>}
                    <span className="sr-only">, {VERDICT_LABEL[row.verdict]}</span>
                  </Link>
                </div>
              </td>
              <td className="px-3 py-3 font-mono text-muted-foreground tnum">{row.uid ?? "n/a"}</td>
              <td className="px-3 py-3">
                <MonoValue value={row.hotkey} label="hotkey" head={6} tail={6} className="relative z-10 max-w-full text-muted-foreground" />
              </td>
              <td className="hidden px-3 py-3 text-muted-foreground lg:table-cell">{ROLE_LABEL[row.role]}</td>
              <td className="px-3 py-3 text-right">
                <TaoPerDay row={row} />
              </td>
              <td className="py-3 pr-5 pl-6">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <Worst row={row} />
                  </div>
                  <ChevronRight
                    className="size-4 shrink-0 -translate-x-1 text-faint opacity-0 transition-[opacity,transform] duration-150 group-hover:translate-x-0 group-hover:opacity-100"
                    aria-hidden
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SeatCards({ rows, network }: { rows: FleetRow[]; network: NetworkId }) {
  return (
    <ul className="flex flex-col gap-2 md:hidden" aria-label="Seats this coldkey holds">
      {rows.map((row) => (
        <li key={rowKey(row)} className="panel relative flex flex-col gap-3 p-4 transition-colors has-[a:focus-visible]:bg-surface-2/60 active:bg-surface-2/60">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span aria-hidden className={cn("size-2 shrink-0 rounded-full", VERDICT_DOT[row.verdict])} />
              <Link href={fleetDoctorHref(network, row)} className={cn("min-w-0 truncate text-[15px] font-medium text-foreground after:rounded-xl", STRETCHED_LINK)}>
                <span className="font-mono text-muted-foreground">SN{row.netuid}</span>
                {row.subnet_name && <span className="ml-1.5">{row.subnet_name}</span>}
                <span className="sr-only">, {VERDICT_LABEL[row.verdict]}</span>
              </Link>
            </div>
            <span className="shrink-0 text-[13px]">
              <TaoPerDay row={row} unit />
            </span>
          </div>
          <div className="text-[13px]">
            <Worst row={row} wrap />
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-line pt-3 text-xs text-faint">
            <span className="shrink-0">
              UID <span className="font-mono text-muted-foreground">{row.uid ?? "n/a"}</span>
              <span aria-hidden className="mx-1.5">·</span>
              {ROLE_LABEL[row.role]}
            </span>
            <MonoValue value={row.hotkey} label="hotkey" head={6} tail={6} className="relative z-10 min-w-0 text-muted-foreground" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Unregistered({ rows, network, open, onToggle }: { rows: FleetRow[]; network: NetworkId; open: boolean; onToggle: () => void }) {
  const id = useId();
  return (
    <section aria-labelledby={`${id}-title`} className="panel overflow-hidden">
      <h3 id={`${id}-title`}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          onClick={onToggle}
          className="flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-2/50 sm:px-5"
        >
          <ChevronRight className={cn("size-4 shrink-0 text-faint transition-transform duration-200", open && "rotate-90")} aria-hidden />
          <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
            <span className="text-sm font-medium text-foreground">{pluralize(rows.length, "hotkey")} registered on no subnet</span>
            <span className="text-xs text-faint">Owned by this coldkey, holding no seat</span>
          </span>
        </button>
      </h3>
      {open && (
        <ul id={`${id}-list`} className="grid gap-px border-t border-line bg-line sm:grid-cols-2">
          {rows.map((row, i) => (
            <li
              key={rowKey(row)}
              className={cn(
                "group relative flex min-w-0 items-center justify-between gap-3 bg-surface px-4 py-2.5 transition-colors hover:bg-surface-2 has-[a:focus-visible]:bg-surface-2 sm:px-5",
                i === rows.length - 1 && i % 2 === 0 && "sm:col-span-2",
              )}
            >
              <MonoValue value={row.hotkey} label="hotkey" head={8} tail={8} className="relative z-10 min-w-0 text-[13px] text-muted-foreground" />
              <Link
                href={fleetDoctorHref(network, row)}
                className={cn("inline-flex shrink-0 items-center gap-1 text-xs font-medium text-faint transition-colors group-hover:text-foreground", STRETCHED_LINK)}
              >
                Doctor
                <ArrowRight className="size-3" aria-hidden />
                <span className="sr-only"> for this hotkey</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Seats worst first with sort and verdict filters; hotkeys holding no seat collapse at the bottom */
export function FleetTable({ rows, network }: { rows: FleetRow[]; network: NetworkId }) {
  const [filter, setFilter] = useState<FleetFilter>("all");
  const [sort, setSort] = useState<FleetSort>(DEFAULT_FLEET_SORT);
  const { seats, unregistered } = useMemo(() => partitionFleet(rows), [rows]);
  const counts = useMemo(() => countVerdicts(seats), [seats]);
  // With no seat to list, the hotkeys are the whole answer, so they start open
  const [idleOpen, setIdleOpen] = useState(seats.length === 0);

  const shownSeats = useMemo(() => sortFleet(filterFleet(seats, filter), sort), [seats, filter, sort]);

  return (
    <section aria-labelledby="fleet-seats" className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="fleet-seats" className="text-sm font-semibold">
          Seats
        </h2>
        <div
          role="group"
          aria-label="Filter seats by verdict"
          className="flex max-w-full gap-1 self-start overflow-x-auto rounded-lg bg-surface-2 p-1 shadow-[0_0_0_1px_var(--line)] [scrollbar-width:none] sm:self-auto"
        >
          {FILTERS.map(({ value, label }) => {
            const count = value === "all" ? seats.length : counts[value];
            const pressed = filter === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={pressed}
                disabled={count === 0 && !pressed}
                onClick={() => setFilter(value)}
                className={cn(
                  "inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2 text-[13px] sm:px-2.5 font-medium transition-[background-color,color,box-shadow] duration-150 disabled:pointer-events-none disabled:opacity-45",
                  pressed ? "bg-surface text-foreground shadow-[0_0_0_1px_var(--line-strong),0_1px_2px_rgb(0_0_0/0.08)]" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {value !== "all" && <span aria-hidden className={cn("size-1.5 rounded-full", VERDICT_DOT[value])} />}
                {label}
                <span className="font-mono text-[11px] text-faint tnum">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {shownSeats.length > 0 && (
        <>
          <SeatTable rows={shownSeats} network={network} sort={sort} onSort={(key) => setSort((current) => nextSort(current, key))} />
          <SeatCards rows={shownSeats} network={network} />
        </>
      )}
      {shownSeats.length === 0 && seats.length > 0 && filter !== "all" && (
        <p role="status" className="panel px-5 py-8 text-center text-sm text-muted-foreground">
          {EMPTY_FILTER[filter]}
        </p>
      )}
      {unregistered.length > 0 && <Unregistered rows={unregistered} network={network} open={idleOpen} onToggle={() => setIdleOpen((open) => !open)} />}
    </section>
  );
}
