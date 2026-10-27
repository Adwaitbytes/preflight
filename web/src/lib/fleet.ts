/** Sorting, filtering and grouping for the fleet table. Pure, so the order is testable and stable */

import type { NetworkId } from "./networks";
import { SEVERITY_RANK } from "./severity";
import type { FleetRow, Verdict } from "./types";

export type FleetFilter = Verdict | "all";
export type FleetSortKey = "verdict" | "subnet" | "uid" | "tao";
export type SortDirection = "asc" | "desc";

export interface FleetSort {
  key: FleetSortKey;
  direction: SortDirection;
}

/** The API's own order: worst first */
export const DEFAULT_FLEET_SORT: FleetSort = { key: "verdict", direction: "asc" };

/** Where a column starts when first clicked: worst, lowest netuid and UID, and biggest earner first */
const FIRST_DIRECTION: Record<FleetSortKey, SortDirection> = { verdict: "asc", subnet: "asc", uid: "asc", tao: "desc" };

const VERDICT_RANK: Record<Verdict, number> = { broken: 0, warning: 1, healthy: 2 };

const tao = (row: FleetRow) => row.tao_per_day ?? 0;
const severity = (row: FleetRow) => (row.worst ? SEVERITY_RANK[row.worst.severity] : -1);

function worstFirst(a: FleetRow, b: FleetRow): number {
  return VERDICT_RANK[a.verdict] - VERDICT_RANK[b.verdict] || severity(b) - severity(a) || tao(b) - tao(a);
}

/** Final tiebreak so equal rows never swap between renders */
function position(a: FleetRow, b: FleetRow): number {
  return (a.netuid ?? Infinity) - (b.netuid ?? Infinity) || (a.uid ?? Infinity) - (b.uid ?? Infinity) || a.hotkey.localeCompare(b.hotkey);
}

const PRIMARY: Record<FleetSortKey, (a: FleetRow, b: FleetRow) => number> = {
  verdict: worstFirst,
  subnet: (a, b) => (a.netuid ?? 0) - (b.netuid ?? 0) || (a.uid ?? 0) - (b.uid ?? 0),
  uid: (a, b) => (a.uid ?? 0) - (b.uid ?? 0) || (a.netuid ?? 0) - (b.netuid ?? 0),
  tao: (a, b) => tao(a) - tao(b),
};

const MISSING: Record<FleetSortKey, (row: FleetRow) => boolean> = {
  verdict: () => false,
  subnet: (row) => row.netuid == null,
  uid: (row) => row.uid == null,
  tao: () => false,
};

export function sortFleet(rows: readonly FleetRow[], sort: FleetSort): FleetRow[] {
  const sign = sort.direction === "asc" ? 1 : -1;
  const primary = PRIMARY[sort.key];
  const missing = MISSING[sort.key];
  return [...rows].sort((a, b) => {
    // Rows without the value sort last whichever way the column points
    const gap = Number(missing(a)) - Number(missing(b));
    if (gap !== 0) return gap;
    return sign * (primary(a, b) || worstFirst(a, b) || position(a, b));
  });
}

export function nextSort(current: FleetSort, key: FleetSortKey): FleetSort {
  if (current.key !== key) return { key, direction: FIRST_DIRECTION[key] };
  return { key, direction: current.direction === "asc" ? "desc" : "asc" };
}

/** Seats hold a UID; hotkeys registered nowhere are grouped apart at the bottom of the view */
export function partitionFleet(rows: readonly FleetRow[]): { seats: FleetRow[]; unregistered: FleetRow[] } {
  const seats: FleetRow[] = [];
  const unregistered: FleetRow[] = [];
  for (const row of rows) (row.netuid == null ? unregistered : seats).push(row);
  return { seats, unregistered };
}

export function filterFleet(rows: readonly FleetRow[], filter: FleetFilter): FleetRow[] {
  return filter === "all" ? [...rows] : rows.filter((row) => row.verdict === filter);
}

export function countVerdicts(rows: readonly FleetRow[]): Record<Verdict, number> {
  const counts: Record<Verdict, number> = { broken: 0, warning: 0, healthy: 0 };
  for (const row of rows) counts[row.verdict] += 1;
  return counts;
}

/** The Doctor on the row's subnet, or across every subnet for a hotkey registered nowhere */
export function fleetDoctorHref(network: NetworkId, row: FleetRow): string {
  const path = `/doctor/${network}/${encodeURIComponent(row.hotkey)}`;
  return row.netuid == null ? path : `${path}?netuid=${row.netuid}`;
}
