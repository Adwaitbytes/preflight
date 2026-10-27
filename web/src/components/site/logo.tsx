import { MARK_SMALL_NODE, MARK_SMALL_PATH, MARK_SMALL_STROKE, MARK_VIEWBOX } from "@/lib/brand";
import { cn } from "@/lib/utils";

/**
 * The mark at interface sizes (the small optical cut from lib/brand; the full runway mark is for icons and cards).
 * Inherits the text colour; the checkpoint takes the accent unless `mono` asks for one colour.
 */
export function LogoMark({ className, mono = false }: { className?: string; mono?: boolean }) {
  return (
    <svg viewBox={MARK_VIEWBOX} fill="none" aria-hidden className={cn("size-6 shrink-0", className)}>
      <path d={MARK_SMALL_PATH} stroke="currentColor" strokeWidth={MARK_SMALL_STROKE} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={MARK_SMALL_NODE.cx} cy={MARK_SMALL_NODE.cy} r={MARK_SMALL_NODE.r} className={mono ? "fill-current" : "fill-accent"} />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className="size-6" />
      <span className="text-[15px] leading-none font-semibold tracking-[-0.025em]">Preflight</span>
    </span>
  );
}
