import type { Health } from "@/lib/types";
import { cn } from "@/lib/utils";

export const BAND_LABEL: Record<Health["band"], string> = { healthy: "Healthy", watch: "Watch", at_risk: "At risk" };
const BAND_STROKE: Record<Health["band"], string> = { healthy: "stroke-healthy", watch: "stroke-medium", at_risk: "stroke-critical" };
const BAND_TEXT: Record<Health["band"], string> = { healthy: "text-healthy", watch: "text-medium", at_risk: "text-critical" };

export function bandText(band: Health["band"]): string {
  return BAND_TEXT[band];
}

/**
 * 0 to 100 score as a ring. The arc draws in once; reduced motion skips straight to the end.
 * Without a score it is an empty track: pulsing while the score is computed, still otherwise.
 */
export function HealthRing({ health, size = 44, pending = false }: { health: Health | null; size?: number; pending?: boolean }) {
  const stroke = size >= 80 ? 6 : 4;
  const r = (size - stroke) / 2;
  const length = 2 * Math.PI * r;
  if (!health) {
    return (
      <div
        role="img"
        aria-label={pending ? "Health score loading" : "No health score yet"}
        className={cn("shrink-0", pending && "animate-pulse")}
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-surface-3" />
        </svg>
      </div>
    );
  }
  const score = Math.max(0, Math.min(100, Math.round(health.score)));
  return (
    <div role="img" aria-label={`Health ${score} of 100, ${BAND_LABEL[health.band]}`} className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-surface-3" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={length}
          strokeDashoffset={length * (1 - score / 100)}
          style={{ ["--ring-length" as string]: `${length}` }}
          className={cn("ring-draw", BAND_STROKE[health.band])}
        />
      </svg>
      <span
        aria-hidden
        className={cn("absolute inset-0 grid place-items-center font-mono font-semibold tracking-tight text-foreground", size >= 80 ? "text-2xl" : "text-[13px]")}
      >
        {score}
      </span>
    </div>
  );
}
