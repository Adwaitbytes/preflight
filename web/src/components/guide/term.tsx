"use client";

import { ArrowRight } from "lucide-react";
import { Popover } from "radix-ui";
import type { ReactNode } from "react";
import { SeverityBadge } from "@/components/ui/badge";
import { GUIDE_SECTIONS, ruleAnchor, ruleById } from "@/lib/guide";
import { cn } from "@/lib/utils";
import { GLOSSARY, glossaryAnchor } from "./glossary-terms";

const CARD =
  "z-50 w-[min(18rem,calc(100vw-2rem))] rounded-xl bg-surface p-4 text-[13.5px] leading-[1.55] text-muted-foreground shadow-(--shadow-float) outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0";

const CARD_LINK = "inline-flex items-center gap-1 rounded text-xs font-medium text-accent-ink hover:underline hover:underline-offset-4";

/**
 * A glossary word defined where it is read. Opens on click, tap or Enter, so it works without a
 * mouse, unlike a hover tooltip. An unknown term fails the build instead of shipping a dead link
 */
export function Term({ name, children }: { name: string; children?: ReactNode }) {
  const entry = GLOSSARY.find((t) => t.term.toLowerCase() === name.toLowerCase());
  if (!entry) throw new Error(`No glossary entry for ${name}`);
  return (
    <Popover.Root>
      <Popover.Trigger className="cursor-help rounded-sm font-medium text-foreground underline decoration-faint decoration-dotted underline-offset-[5px] transition-colors hover:decoration-foreground data-[state=open]:decoration-accent">
        {children ?? entry.term}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content side="top" sideOffset={6} collisionPadding={16} className={CARD}>
          <p className="font-semibold text-foreground">{entry.term}</p>
          <p className="mt-1 text-pretty">{entry.definition}</p>
          <Popover.Close asChild>
            <a href={`#${glossaryAnchor(entry.term)}`} className={cn(CARD_LINK, "mt-2.5")}>
              In the glossary
              <ArrowRight className="size-3" aria-hidden />
            </a>
          </Popover.Close>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

const CHAPTER = new Map<string, string>(GUIDE_SECTIONS.map((s) => [s.id, `${String(s.number).padStart(2, "0")} ${s.title}`]));

/** A rule id that previews the rule in place, with a way into the reference and its chapter */
export function RuleChip({ id, className }: { id: string; className?: string }) {
  const rule = ruleById(id);
  const chip = cn(
    "inline-flex h-6 shrink-0 cursor-pointer items-center rounded-md bg-surface-2 px-1.5 font-mono text-[12px] font-medium text-foreground shadow-[0_0_0_1px_var(--line)] transition-colors hover:bg-surface-3 data-[state=open]:bg-surface-3 data-[state=open]:shadow-[0_0_0_1px_var(--line-strong)]",
    className,
  );
  if (!rule) {
    return (
      <a href="#rules" className={chip}>
        {id}
      </a>
    );
  }
  return (
    <Popover.Root>
      <Popover.Trigger className={chip}>
        {id}
        <span className="sr-only">, {rule.name}</span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content side="top" sideOffset={6} collisionPadding={16} className={CARD}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[13px] font-semibold text-foreground">{rule.id}</span>
            <SeverityBadge severity={rule.severity} />
          </div>
          <p className="mt-2 font-semibold text-foreground">{rule.name}</p>
          <p className="mt-1 text-pretty">{rule.line}</p>
          <div className="mt-2.5 flex flex-col items-start gap-1.5">
            <Popover.Close asChild>
              <a href={`#${ruleAnchor(rule.id)}`} className={CARD_LINK}>
                Open in the rule reference
                <ArrowRight className="size-3" aria-hidden />
              </a>
            </Popover.Close>
            {rule.section !== "rules" && (
              <Popover.Close asChild>
                <a href={`#${rule.section}`} className={CARD_LINK}>
                  Chapter {CHAPTER.get(rule.section)}
                  <ArrowRight className="size-3" aria-hidden />
                </a>
              </Popover.Close>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
