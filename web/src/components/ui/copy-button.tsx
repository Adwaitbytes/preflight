"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  label: string;
  className?: string;
  size?: "xs" | "sm" | "md";
}

export function CopyButton({ value, label, className, size = "sm" }: CopyButtonProps) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("failed");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1600);
  }

  const status = state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : label;
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={status}
      title={status}
      className={cn(
        "inline-grid shrink-0 cursor-pointer place-items-center rounded-md text-faint transition-colors hover:bg-surface-3 hover:text-foreground",
        size === "xs" ? "size-6" : size === "sm" ? "size-7" : "size-8",
        className,
      )}
    >
      {state === "copied" ? <Check className="size-3.5 text-healthy" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      <span className="sr-only" aria-live="polite">
        {state === "idle" ? "" : status}
      </span>
    </button>
  );
}
