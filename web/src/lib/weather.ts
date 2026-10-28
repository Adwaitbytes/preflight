/**
 * Network weather: how a window of blocks reads at a glance. Pure, so the views only lay out
 * what these return.
 */

import { CloudLightning, CloudSun, Sun } from "lucide-react";
import { ACTIVITY_KINDS, type ActivityKind } from "./live";
import type { Weather } from "./types";

export type Sky = "clear" | "unsettled" | "stormy";

/** Under 2% failing is ordinary chain life; 8% and up means something is broadly wrong */
export function sky(failureRate: number): Sky {
  if (!Number.isFinite(failureRate) || failureRate < 0.02) return "clear";
  return failureRate < 0.08 ? "unsettled" : "stormy";
}

export const SKY_LABEL: Record<Sky, string> = { clear: "Clear", unsettled: "Unsettled", stormy: "Stormy" };
export const SKY_ICON = { clear: Sun, unsettled: CloudSun, stormy: CloudLightning } as const;
export const SKY_TONE: Record<Sky, string> = {
  clear: "bg-healthy-soft text-healthy",
  unsettled: "bg-medium-soft text-medium",
  stormy: "bg-critical-soft text-critical",
};

export interface KindShare {
  kind: ActivityKind;
  count: number;
  share: number;
}

/** Every known kind that occurred, largest first, as shares of the whole window */
export function kindMix(byKind: Weather["by_kind"]): KindShare[] {
  const total = Object.values(byKind).reduce((sum, n) => sum + n, 0);
  if (total === 0) return [];
  return ACTIVITY_KINDS.flatMap((kind) => {
    const count = byKind[kind] ?? 0;
    return count > 0 ? [{ kind, count, share: count / total }] : [];
  }).sort((a, b) => b.count - a.count);
}

/** "12 minutes" for 60 blocks of 12 s */
export function windowMinutes(blocks: number, blockSeconds = 12): number {
  return Math.max(0, Math.round((blocks * blockSeconds) / 60));
}

/** Bars for a ranked subnet list, scaled to the first */
export function subnetBars(pairs: readonly (readonly [number, number])[]): { netuid: number; count: number; width: number }[] {
  const peak = Math.max(1, ...pairs.map(([, count]) => count));
  return pairs.map(([netuid, count]) => ({ netuid, count, width: count / peak }));
}

export const WEATHER_REFRESH_MS = 60_000;
