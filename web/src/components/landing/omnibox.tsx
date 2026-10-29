"use client";

import { CornerDownLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { useAppState } from "@/components/site/app-state";
import { Kbd } from "@/components/ui/kbd";
import { track } from "@/lib/analytics";
import { truncateMiddle } from "@/lib/format";
import { classifyInput, describeInput, hrefForInput } from "@/lib/route-input";
import { cn } from "@/lib/utils";

export interface Example {
  label: string;
  value: string;
}

/** `hero` is the large glass pill on the landing; the `/` shortcut focuses the input whose id is "omnibox" */
export function Omnibox({
  examples,
  variant = "default",
  inputId = "omnibox",
  align = "start",
}: {
  examples: Example[];
  variant?: "default" | "hero";
  inputId?: string;
  align?: "start" | "center";
}) {
  const hero = variant === "hero";
  const router = useRouter();
  const { network } = useAppState();
  const hintId = useId();
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();
  const input = classifyInput(value);
  const href = hrefForInput(input, network);
  const invalid = input.kind === "invalid";
  // An empty hero box runs the first real example, so the main button is never a dead end
  const fallback = hero && input.kind === "empty" ? examples[0]?.value : undefined;

  function go(target: string | null) {
    if (!target) return;
    track("search", input.kind);
    startTransition(() => router.push(target));
  }

  return (
    <div className="w-full">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          if (fallback) {
            setValue(fallback);
            go(hrefForInput(classifyInput(fallback), network));
            return;
          }
          go(href);
        }}
        className={cn(
          "group relative flex items-center gap-2 transition-shadow duration-200",
          hero
            ? "rounded-full bg-white/[0.07] p-2 pl-6 shadow-[0_0_0_1px_rgb(255_255_255/0.16),0_30px_80px_-20px_rgb(76_110_255/0.45)] backdrop-blur-xl"
            : "rounded-2xl bg-surface p-2 pl-5 shadow-(--shadow-float)",
          "focus-within:shadow-[0_0_0_2px_var(--ring),0_24px_56px_-16px_rgb(0_0_0/0.4)]",
          invalid && "focus-within:shadow-[0_0_0_2px_var(--critical),0_24px_56px_-16px_rgb(0_0_0/0.4)]",
        )}
      >
        <label htmlFor={inputId} className="sr-only">
          Paste a hotkey, extrinsic hash, block and index, error text, netuid or subnet name
        </label>
        <input
          id={inputId}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Hotkey, tx hash, error or netuid"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-describedby={hintId}
          aria-invalid={invalid || undefined}
          className={cn(
            "min-w-0 flex-1 bg-transparent font-mono text-foreground outline-none placeholder:font-sans placeholder:text-faint",
            hero ? "h-14 text-base sm:text-lg" : "h-12 text-[15px] sm:text-base",
          )}
        />
        <Kbd className="mr-1 hidden group-focus-within:hidden sm:inline-flex">/</Kbd>
        <button
          type="submit"
          disabled={pending || (!href && !fallback)}
          className={cn(
            "inline-flex shrink-0 cursor-pointer items-center gap-2 text-sm font-medium transition-[background-color,color,transform] active:translate-y-px disabled:cursor-default disabled:active:translate-y-0",
            hero
              ? cn(
                  "h-12 rounded-full bg-[#4360ff] px-6 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.22),0_10px_30px_-10px_rgb(67_96_255/0.9)] hover:bg-[#3a57f5]",
                  !pending && "disabled:bg-white/10 disabled:text-white/50 disabled:shadow-none",
                )
              : "h-11 rounded-xl bg-foreground px-4 text-background disabled:bg-surface-3 disabled:text-muted-foreground",
          )}
        >
          <span className="hidden sm:inline">{pending ? "Reading" : "Diagnose"}</span>
          {pending ? (
            <span className={cn("size-4 animate-spin rounded-full border-2", hero ? "border-white/30 border-t-white" : "border-background/30 border-t-background")} aria-hidden />
          ) : (
            <CornerDownLeft className="size-4" aria-hidden />
          )}
          <span className="sr-only sm:hidden">Go</span>
        </button>
      </form>
      <p
        id={hintId}
        aria-live="polite"
        className={cn("mt-3 min-h-5 px-1 text-[13px] text-pretty", align === "center" && "text-center", input.kind === "empty" ? "text-faint" : invalid ? "text-critical" : "text-accent-ink")}
      >
        {describeInput(input)}
      </p>
      <div className={cn("mt-4 flex flex-wrap items-center gap-2", align === "center" && "justify-center")}>
        <span className="mr-1 text-xs text-faint">Try</span>
        {examples.map((example) => (
          <button
            key={example.value}
            type="button"
            onClick={() => {
              setValue(example.value);
              go(hrefForInput(classifyInput(example.value), network));
            }}
            className={cn(
              "group/chip inline-flex h-8 max-w-full cursor-pointer items-center gap-2 rounded-full px-3 text-[13px] text-muted-foreground transition-[background-color,color] hover:text-foreground",
              hero ? "bg-white/[0.05] shadow-[0_0_0_1px_rgb(255_255_255/0.12)] backdrop-blur-md hover:bg-white/10" : "bg-surface shadow-[0_0_0_1px_var(--line-strong)] hover:bg-surface-2",
            )}
          >
            <span className="shrink-0 font-medium text-foreground">{example.label}</span>
            <span className="truncate font-mono text-xs text-faint">{truncateMiddle(example.value, 6, 4)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
