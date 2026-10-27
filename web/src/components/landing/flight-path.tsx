import { cn } from "@/lib/utils";

/**
 * The brand mark at hero scale: a dashed runway centreline along the ground, a checkpoint,
 * then a solid climb out behind the result card. Decorative, so it is hidden from assistive tech.
 */
export function FlightPath({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 760"
      preserveAspectRatio="xMidYMax slice"
      fill="none"
      className={cn("pointer-events-none", className)}
    >
      <defs>
        <linearGradient id="flight-climb" x1="760" y1="740" x2="1440" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.85" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 740H744"stroke="var(--line-strong)" strokeWidth="1.5" strokeDasharray="14 10" className="runway-in" />
      <path d="M760 740C960 740 1170 650 1440 330" stroke="url(#flight-climb)" strokeWidth="1.5" pathLength={1} className="path-draw" />
      <circle cx="760" cy="740" r="18" stroke="var(--accent)" strokeOpacity="0.5" className="node-pulse" />
      <circle cx="760" cy="740" r="11" fill="var(--accent-soft)" stroke="var(--accent)" strokeOpacity="0.35" className="node-pop" />
      <circle cx="760" cy="740" r="4.5" fill="var(--accent)" className="node-pop" />
    </svg>
  );
}
