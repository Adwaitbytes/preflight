"use client";

import { ArrowRight, CornerDownLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { useAppState } from "@/components/site/app-state";
import { Kbd } from "@/components/ui/kbd";
import { truncateMiddle } from "@/lib/format";
import { classifyInput, describeInput, hrefForInput } from "@/lib/route-input";
import { cn } from "@/lib/utils";

export interface Example {
  label: string;
  value: string;
}

export function Omnibox({ examples }: { examples: Example[] }) {
  const router = useRouter();
  const { network } = useAppState();
  const hintId = useId();
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();
  const input = classifyInput(value);
  const href = hrefForInput(input, network);
  const invalid = input.kind === "invalid";

  function go(target: string | null) {
    if (!target) return;
    startTransition(() => router.push(target));
  }

  return (
    <div className="w-full">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          go(href);
        }}
        className={cn(
          "group relative flex items-center gap-2 rounded-2xl bg-surface p-2 pl-5 shadow-(--shadow-float) transition-shadow duration-200",
          "focus-within:shadow-[0_0_0_2px_var(--ring),0_24px_56px_-16px_rgb(0_0_0/0.4)]",
          invalid && "focus-within:shadow-[0_0_0_2px_var(--critical),0_24px_56px_-16px_rgb(0_0_0/0.4)]",
        )}
      >
        <label htmlFor="omnibox" className="sr-only">
          Paste a hotkey, extrinsic hash, block and index, error text, netuid or subnet name
        </label>
        <input
          id="omnibox"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Hotkey, tx hash, error or netuid"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-describedby={hintId}
          aria-invalid={invalid || undefined}
          className="h-12 min-w-0 flex-1 bg-transparent font-mono text-[15px] text-foreground outline-none placeholder:font-sans placeholder:text-faint sm:text-base"
        />
        <Kbd className="mr-1 hidden group-focus-within:hidden sm:inline-flex">/</Kbd>
        <button
          type="submit"
          disabled={!href || pending}
          className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background transition-[background-color,color,transform] active:translate-y-px disabled:cursor-default disabled:bg-surface-3 disabled:text-muted-foreground disabled:active:translate-y-0"
        >
          <span className="hidden sm:inline">{pending ? "Reading" : "Diagnose"}</span>
          {pending ? (
            <span className="size-4 animate-spin rounded-full border-2 border-background/30 border-t-background" aria-hidden />
          ) : (
            <CornerDownLeft className="size-4" aria-hidden />
          )}
          <span className="sr-only sm:hidden">Go</span>
        </button>
      </form>
      <p
        id={hintId}
        aria-live="polite"
        className={cn("mt-3 min-h-5 px-1 text-[13px] text-pretty", input.kind === "empty" ? "text-faint" : invalid ? "text-critical" : "text-accent-ink")}
      >
        {describeInput(input)}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs text-faint">Try</span>
        {examples.map((example) => (
          <button
            key={example.value}
            type="button"
            onClick={() => {
              setValue(example.value);
              go(hrefForInput(classifyInput(example.value), network));
            }}
            className="group/chip inline-flex h-8 max-w-full cursor-pointer items-center gap-2 rounded-full bg-surface px-3 text-[13px] text-muted-foreground shadow-[0_0_0_1px_var(--line-strong)] transition-[background-color,color] hover:bg-surface-2 hover:text-foreground"
          >
            <span className="shrink-0 font-medium text-foreground">{example.label}</span>
            <span className="truncate font-mono text-xs text-faint">{truncateMiddle(example.value, 9, 5)}</span>
            <ArrowRight className="size-3 shrink-0 opacity-0 transition-opacity group-hover/chip:opacity-100" aria-hidden />
          </button>
        ))}
      </div>
    </div>
  );
}
