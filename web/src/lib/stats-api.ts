import "server-only";

import { statsReportSchema } from "./schemas";
import { sameOrigin } from "./server-api";
import type { StatsReport } from "./types";

export type StatsRange = StatsReport["range"];
export const STATS_RANGES: readonly StatsRange[] = ["24h", "7d", "30d"];

export function parseRange(value: string | string[] | undefined): StatsRange {
  const raw = Array.isArray(value) ? value[0] : value;
  return STATS_RANGES.find((r) => r === raw) ?? "7d";
}

export type StatsResult = { ok: true; report: StatsReport } | { ok: false; message: string };

/** Server to server only: the stats key never reaches a browser */
export async function getStats(range: StatsRange, automated: boolean): Promise<StatsResult> {
  const key = process.env.STATS_PASSWORD ?? "";
  const base = process.env.PREFLIGHT_API_URL?.trim() || (await sameOrigin());
  const url = `${base.replace(/\/+$/, "")}/v1/stats?range=${range}${automated ? "&automated=true" : ""}`;
  let response: Response;
  try {
    response = await fetch(url, { headers: { "x-stats-key": key, accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(30_000) });
  } catch {
    return { ok: false, message: "The API did not answer. Retry in a moment" };
  }
  if (response.status === 503) return { ok: false, message: "Analytics needs the database, and it did not answer. Retry in a moment" };
  if (!response.ok) return { ok: false, message: `The API answered ${response.status}. Check that STATS_PASSWORD is set on the API too` };
  const parsed = statsReportSchema.safeParse(await response.json().catch(() => null));
  return parsed.success ? { ok: true, report: parsed.data } : { ok: false, message: "The API answered with an unexpected shape" };
}
