import { cn } from "@/lib/utils";

/** The mark: a check that lifts off its baseline, read as "cleared for takeoff" */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={cn("size-6", className)}>
      <rect x="0.5" y="0.5" width="23" height="23" rx="6.5" className="fill-foreground" />
      <path d="M6.5 12.5l3.2 3.2L17.5 7.5" className="stroke-background" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 18h11" className="stroke-background/45" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-[-0.02em]">Preflight</span>
    </span>
  );
}
