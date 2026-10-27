import type { Finding, Severity, Verdict } from "./types";

export const SEVERITY_RANK: Record<Severity, number> = { critical: 3, high: 2, medium: 1, info: 0 };

export const SEVERITY_LABEL: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  info: "Info",
};

export const VERDICT_LABEL: Record<Verdict, string> = {
  healthy: "Healthy",
  warning: "Warning",
  broken: "Broken",
};

/** Highest severity first; rule id breaks ties so the order is stable across renders */
export function sortFindings(findings: readonly Finding[]): Finding[] {
  return [...findings].sort(
    (a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity] || a.id.localeCompare(b.id),
  );
}

export function countBySeverity(findings: readonly Finding[]): Record<Severity, number> {
  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, info: 0 };
  for (const finding of findings) counts[finding.severity] += 1;
  return counts;
}
