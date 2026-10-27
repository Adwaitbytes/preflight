import type { ReactNode } from "react";
import { SEVERITY_LABEL, VERDICT_LABEL } from "@/lib/severity";
import type { Severity, Verdict } from "@/lib/types";
import { cn } from "@/lib/utils";

export type Tone = "critical" | "high" | "medium" | "healthy" | "info" | "accent" | "neutral";

const TONE: Record<Tone, string> = {
  critical: "bg-critical-soft text-critical shadow-[0_0_0_1px_color-mix(in_oklab,var(--critical)_22%,transparent)]",
  high: "bg-high-soft text-high shadow-[0_0_0_1px_color-mix(in_oklab,var(--high)_22%,transparent)]",
  medium: "bg-medium-soft text-medium shadow-[0_0_0_1px_color-mix(in_oklab,var(--medium)_24%,transparent)]",
  healthy: "bg-healthy-soft text-healthy shadow-[0_0_0_1px_color-mix(in_oklab,var(--healthy)_22%,transparent)]",
  info: "bg-info-soft text-info shadow-[0_0_0_1px_var(--line)]",
  accent: "bg-accent-soft text-accent-ink shadow-[0_0_0_1px_color-mix(in_oklab,var(--accent)_24%,transparent)]",
  neutral: "bg-surface-2 text-muted-foreground shadow-[0_0_0_1px_var(--line)]",
};

const DOT: Record<Tone, string> = {
  critical: "bg-critical",
  high: "bg-high",
  medium: "bg-medium",
  healthy: "bg-healthy",
  info: "bg-info",
  accent: "bg-accent",
  neutral: "bg-faint",
};

export function Badge({
  tone = "neutral",
  dot = false,
  size = "sm",
  className,
  children,
}: {
  tone?: Tone;
  dot?: boolean;
  size?: "sm" | "md";
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
        size === "sm" ? "h-6 px-2.5 text-xs" : "h-7 px-3 text-[13px]",
        TONE[tone],
        className,
      )}
    >
      {dot && <span aria-hidden className={cn("size-1.5 rounded-full", DOT[tone])} />}
      {children}
    </span>
  );
}

export const VERDICT_TONE: Record<Verdict, Tone> = { healthy: "healthy", warning: "medium", broken: "critical" };

export function VerdictBadge({ verdict, size = "md" }: { verdict: Verdict; size?: "sm" | "md" }) {
  return (
    <Badge tone={VERDICT_TONE[verdict]} dot size={size}>
      {VERDICT_LABEL[verdict]}
    </Badge>
  );
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <Badge tone={severity} dot>
      {SEVERITY_LABEL[severity]}
    </Badge>
  );
}
