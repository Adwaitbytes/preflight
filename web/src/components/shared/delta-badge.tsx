import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type Direction = "up" | "down" | "flat";

export interface BadgeDelta {
  direction: Direction;
  /** Short, for the badge: "+45%", "Steady", "Drops to zero" */
  label: string;
  /** The same in words, for screen readers */
  spoken: string;
}

const TONE: Record<Direction, string> = {
  up: "bg-healthy-soft text-healthy",
  down: "bg-critical-soft text-critical",
  flat: "bg-surface-3 text-muted-foreground",
};

const ICON = { up: ArrowUpRight, down: ArrowDownRight, flat: ArrowRight } as const;

/** A signed change, coloured by direction: incentive between epochs, rank, the next epoch */
export function DeltaBadge({ delta, className }: { delta: BadgeDelta; className?: string }) {
  const Icon = ICON[delta.direction];
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold whitespace-nowrap tnum", TONE[delta.direction], className)}>
      <Icon className="size-3.5" aria-hidden />
      <span aria-hidden>{delta.label}</span>
      <span className="sr-only">{delta.spoken}</span>
    </span>
  );
}
