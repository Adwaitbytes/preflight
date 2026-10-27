import { Clock, Info, Terminal } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import type { Fix } from "@/lib/types";
import { cn } from "@/lib/utils";

/** The fix is the product: commands get a terminal block with copy, waits and advice get a callout */
export function FixBlock({ fix, className }: { fix: Fix; className?: string }) {
  if (fix.kind === "command" || fix.kind === "code") {
    return (
      <div className={cn("overflow-hidden rounded-xl bg-background shadow-[0_0_0_1px_var(--line-strong)]", className)}>
        <div className="flex items-center gap-2 border-b border-line px-3.5 py-2">
          <Terminal className="size-3.5 text-faint" aria-hidden />
          <span className="eyebrow text-accent-ink">{fix.kind === "command" ? "Fix, run this" : "Fix, change this"}</span>
          <CopyButton value={fix.text} label="Copy fix" className="ml-auto -mr-1.5" size="xs" />
        </div>
        <pre className="overflow-x-auto px-3.5 py-3 font-mono text-[13px] leading-6 text-foreground">
          <code>
            {fix.kind === "command" && (
              <span aria-hidden className="text-faint select-none">
                ${" "}
              </span>
            )}
            {fix.text}
          </code>
        </pre>
        {fix.note && <p className="border-t border-line px-3.5 py-2 text-xs leading-5 text-muted-foreground">{fix.note}</p>}
      </div>
    );
  }
  const Icon = fix.kind === "wait" ? Clock : Info;
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl bg-accent-soft px-4 py-3.5 shadow-[inset_2px_0_0_var(--accent),0_0_0_1px_color-mix(in_oklab,var(--accent)_20%,transparent)]",
        className,
      )}
    >
      <Icon className="mt-[22px] size-4 shrink-0 text-accent-ink" aria-hidden />
      <div className="min-w-0 leading-6">
        <p className="eyebrow mb-1 text-accent-ink">{fix.kind === "wait" ? "Wait" : "Fix"}</p>
        <p className="text-[15px] font-medium text-foreground">{fix.text}</p>
        {fix.note && <p className="mt-1 text-muted-foreground">{fix.note}</p>}
      </div>
    </div>
  );
}
