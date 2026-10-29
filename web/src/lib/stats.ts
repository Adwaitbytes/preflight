import type { StatsReport } from "./types";

const regions = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["en"], { type: "region" }) : null;

/** "DE" to "Germany"; unknown or missing codes read as "Unknown" */
export function countryName(code: string | null): string {
  if (!code) return "Unknown";
  try {
    return regions?.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

/** Seconds as a person says them: "8 s", "52 s", "3 min 10 s", "1 h 4 min" */
export function formatSeconds(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds)) return "n/a";
  const s = Math.round(seconds);
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return s % 60 ? `${m} min ${s % 60} s` : `${m} min`;
  const h = Math.floor(m / 60);
  return m % 60 ? `${h} h ${m % 60} min` : `${h} h`;
}

export function formatMs(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms)) return "n/a";
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(ms < 10_000 ? 2 : 1)} s`;
}

/** A Core Web Vital in its own unit: CLS is a score, the rest are times */
export function formatVital(metric: string, value: number): string {
  return metric === "CLS" ? value.toFixed(3) : formatMs(value);
}

export const VITAL_NAMES: Record<string, string> = {
  LCP: "Largest paint",
  INP: "Responsiveness",
  CLS: "Layout shift",
  FCP: "First paint",
  TTFB: "Server response",
};

/** A bucket start as an axis label: an hour for the day view, a date for longer ranges */
export function bucketLabel(iso: string, range: StatsReport["range"]): string {
  const d = new Date(iso);
  return range === "24h"
    ? d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
}

export function timeAgo(iso: string, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 45) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86_400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86_400)} d ago`;
}

export const TOOL_LABEL: Record<string, string> = {
  doctor: "Doctor",
  tx: "Transaction debugger",
  simulate: "Simulator",
  epoch: "Epoch Lab",
  "epoch-whatif": "Epoch what-if",
  "epoch-check": "Epoch accuracy check",
  why: "What changed",
  fleet: "Fleet",
  mine: "Should I mine here?",
  explain: "Error explainer",
  plan: "Launch planner",
  find: "Find a subnet",
  ask: "Ask box",
  share: "Share a report",
  "share-open": "Open a shared report",
  watch: "Watch (alerts)",
  history: "Neuron history",
  subnet: "Subnet page",
  "house-join": "Join the House",
};

export const CLIENT_LABEL: Record<string, string> = {
  site: "Website, server side",
  browser: "Website, in the browser",
  curl: "curl",
  python: "Python scripts",
  node: "Node scripts",
  other: "Other",
  telegram: "Telegram bot",
};

/** One line for a recent event, in words */
export function describeEvent(e: StatsReport["recent"][number]): string {
  switch (e.kind) {
    case "view":
      return `Opened ${e.name}`;
    case "leave":
      return `Spent ${formatSeconds((e.value ?? 0) / 1000)} on ${e.name}`;
    case "action":
      return `Used ${e.name}${e.detail ? ` (${e.detail})` : ""}`;
    case "api":
      return `Ran ${TOOL_LABEL[e.name] ?? e.name}${e.value !== null ? ` in ${formatMs(e.value)}` : ""}${e.status && e.status >= 400 ? `, status ${e.status}` : ""}`;
    case "bot":
      return `Telegram ${e.name}`;
    default:
      return e.name;
  }
}

/** Share of the largest value, for a bar's length; never zero for a non-zero value */
export function barWidth(value: number, max: number): number {
  if (max <= 0 || value <= 0) return 0;
  return Math.max(2, (value / max) * 100);
}
