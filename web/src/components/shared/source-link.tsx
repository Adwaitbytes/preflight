import { ExternalLink } from "lucide-react";
import { parseSource } from "@/lib/source";
import { cn } from "@/lib/utils";

/** A source reference that never widens its row: a short file label that truncates, the full URL on hover */
export function SourceLink({ source, className }: { source: string; className?: string }) {
  const { href, label } = parseSource(source);
  if (!href) {
    return (
      <span title={label} className={cn("block min-w-0 truncate font-mono", className)}>
        {label}
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={href}
      aria-label={`Source ${label}`}
      className={cn(
        "inline-flex max-w-full min-w-0 items-center gap-1 rounded font-mono underline decoration-line-strong underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground",
        className,
      )}
    >
      <span className="min-w-0 truncate">{label}</span>
      <ExternalLink className="size-3 shrink-0" aria-hidden />
    </a>
  );
}
