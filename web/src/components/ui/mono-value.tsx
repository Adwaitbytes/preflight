import { truncateMiddle } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";

interface MonoValueProps {
  value: string;
  /** What the value is, for the copy button's accessible name */
  label: string;
  head?: number;
  tail?: number;
  /** Show the full value from this breakpoint up instead of truncating */
  fullFrom?: "sm" | "md" | "lg" | "never";
  copy?: boolean;
  className?: string;
}

/** Addresses and hashes: truncated in the middle so both ends stay checkable, with copy */
export function MonoValue({ value, label, head = 6, tail = 6, fullFrom = "never", copy = true, className }: MonoValueProps) {
  const short = truncateMiddle(value, head, tail);
  const showFull = { sm: "sm:inline", md: "md:inline", lg: "lg:inline", never: "" }[fullFrom];
  const hideShort = { sm: "sm:hidden", md: "md:hidden", lg: "lg:hidden", never: "" }[fullFrom];
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-0.5 font-mono", className)}>
      <span title={value} className="min-w-0 truncate">
        <span aria-hidden className={hideShort}>
          {short}
        </span>
        {fullFrom !== "never" && (
          <span aria-hidden className={cn("hidden", showFull)}>
            {value}
          </span>
        )}
        <span className="sr-only">{value}</span>
      </span>
      {copy && <CopyButton value={value} label={`Copy ${label}`} size="xs" />}
    </span>
  );
}
