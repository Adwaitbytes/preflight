import { Archive, CircleSlash, CloudOff, SearchX, ServerCrash, Timer, Unplug, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { API_ERROR_TITLE, type ApiError, type ApiErrorKind } from "@/lib/api";
import { cn } from "@/lib/utils";

const ICON: Record<ApiErrorKind, LucideIcon> = {
  invalid_input: CircleSlash,
  not_found: SearchX,
  unreachable: Unplug,
  rate_limited: Timer,
  server: ServerCrash,
  offline_miss: Archive,
  network: CloudOff,
};

const NEXT_STEP: Record<ApiErrorKind, string> = {
  invalid_input: "Check what you pasted and try again",
  not_found: "Check the network and the value, then try again",
  unreachable: "The RPC endpoint may be down or overloaded. Retry in a minute, or switch network",
  rate_limited: "Wait a moment, then retry",
  server: "Retry. If it keeps failing, the API logs have the cause",
  offline_miss: "Offline mode only serves recorded data",
  network: "Start the API with preflight serve, or set PREFLIGHT_API_URL",
};

export function StateView({
  icon: Icon,
  title,
  children,
  action,
  tone = "neutral",
  className,
}: {
  icon: LucideIcon;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  tone?: "neutral" | "critical";
  className?: string;
}) {
  return (
    <div role={tone === "critical" ? "alert" : "status"} className={cn("panel flex flex-col items-center px-6 py-14 text-center sm:py-20", className)}>
      <div
        className={cn(
          "grid size-11 place-items-center rounded-xl shadow-[0_0_0_1px_var(--line-strong)]",
          tone === "critical" ? "bg-critical-soft text-critical" : "bg-surface-2 text-muted-foreground",
        )}
      >
        <Icon className="size-5" aria-hidden />
      </div>
      <h2 className="mt-5 text-lg font-semibold tracking-[-0.015em] text-balance">{title}</h2>
      {children && <div className="mt-2 max-w-[52ch] text-sm leading-6 text-pretty text-muted-foreground">{children}</div>}
      {action && <div className="mt-6 flex flex-wrap items-center justify-center gap-2">{action}</div>}
    </div>
  );
}

export function ApiErrorState({ error, action, className }: { error: ApiError; action?: ReactNode; className?: string }) {
  const serious = error.kind === "unreachable" || error.kind === "server" || error.kind === "network";
  return (
    <StateView icon={ICON[error.kind]} title={API_ERROR_TITLE[error.kind]} tone={serious ? "critical" : "neutral"} action={action} className={className}>
      <p>{error.message}</p>
      <p className="mt-1 text-faint">
        {error.kind === "rate_limited" && error.retryAfter ? `Retry in ${error.retryAfter} s` : NEXT_STEP[error.kind]}
      </p>
    </StateView>
  );
}
