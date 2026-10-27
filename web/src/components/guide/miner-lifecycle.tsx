"use client";

import { Tabs } from "radix-ui";
import { useState } from "react";
import { SeverityBadge } from "@/components/ui/badge";
import { ruleById } from "@/lib/guide";
import { cn } from "@/lib/utils";
import type { MinerStage } from "./content";
import { RuleChip } from "./primitives";

/**
 * The miner's path as a track of stages. Hovering, clicking or arrowing to a stage shows what
 * happens there, what goes wrong and the rule that catches it. Radix Tabs gives the roving focus
 * and the tab semantics, so it works the same with a keyboard and a screen reader
 */
export function MinerLifecycle({ stages }: { stages: MinerStage[] }) {
  const first = stages[0]?.id ?? "";
  const [value, setValue] = useState(first);
  const activeIndex = Math.max(0, stages.findIndex((s) => s.id === value));
  const lastIndex = stages.length - 1;

  return (
    <Tabs.Root value={value} onValueChange={setValue} className="panel overflow-hidden" data-reveal>
      <Tabs.List aria-label="Stages of a miner's life" className="relative grid grid-cols-5 border-b border-line px-2 pt-6 pb-4 sm:px-6 sm:pt-8 sm:pb-5">
        {/* The track behind the nodes: solid through the happy path, dashed into the pruned branch */}
        <span aria-hidden className="absolute top-[calc(1.5rem+19px)] right-[10%] left-[10%] h-px sm:top-[calc(2rem+19px)]">
          <span className="absolute inset-y-0 left-0 w-3/4 bg-line-strong" />
          <span className="absolute inset-y-0 right-0 w-1/4 border-t border-dashed border-critical/60" />
          <span
            className="absolute inset-y-0 left-0 bg-accent transition-[width] duration-500 ease-(--ease-out-quart)"
            style={{ width: `${(Math.min(activeIndex, lastIndex - 1) / lastIndex) * 100}%` }}
          />
        </span>
        {stages.map((stage, i) => {
          const pruned = i === lastIndex;
          const reached = i <= activeIndex && !(pruned && activeIndex !== lastIndex);
          const active = stage.id === value;
          return (
            <Tabs.Trigger
              key={stage.id}
              value={stage.id}
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") setValue(stage.id);
              }}
              className="group relative z-10 flex cursor-pointer flex-col items-center gap-2.5 rounded-xl px-1 py-1 text-center focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span
                className={cn(
                  "grid size-[30px] place-items-center rounded-full font-mono text-[12px] font-semibold transition-[background-color,color,box-shadow,transform] duration-300",
                  active && "scale-110",
                  pruned
                    ? active
                      ? "bg-critical text-background shadow-[0_0_0_4px_var(--critical-soft)]"
                      : "bg-surface text-critical shadow-[0_0_0_1px_color-mix(in_oklab,var(--critical)_45%,transparent)]"
                    : active
                      ? "bg-accent text-accent-contrast shadow-[0_0_0_4px_var(--accent-soft)]"
                      : reached
                        ? "bg-surface text-accent-ink shadow-[0_0_0_1px_var(--accent)]"
                        : "bg-surface text-faint shadow-[0_0_0_1px_var(--line-strong)] group-hover:text-foreground",
                )}
              >
                {pruned ? "or" : i + 1}
              </span>
              <span className={cn("text-[12px] font-medium transition-colors sm:text-[13px]", active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                {stage.label}
              </span>
            </Tabs.Trigger>
          );
        })}
      </Tabs.List>

      {/* Every panel sits in the same grid cell, so the tallest sets the height and hovering never shifts the page */}
      <div className="grid">
        {stages.map((stage) => (
          <Tabs.Content
            key={stage.id}
            value={stage.id}
            forceMount
            className="grid grid-cols-1 gap-8 px-5 py-6 [grid-area:1/1] focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-2 focus-visible:outline-ring data-[state=inactive]:pointer-events-none data-[state=inactive]:invisible data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1 data-[state=active]:duration-300 sm:px-7 sm:py-7 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-10"
          >
            <div className="flex min-w-0 flex-col gap-4">
              <h3 className="text-subtitle font-semibold text-balance">{stage.title}</h3>
              <p className="text-[16px] leading-[27px] text-pretty text-muted-foreground">{stage.happens}</p>
              <div className="mt-auto rounded-xl bg-surface-2/70 px-4 py-3 shadow-[0_0_0_1px_var(--line)]">
                <p className="eyebrow">{stage.fact.label}</p>
                <p className="mt-1 font-mono text-[13px] leading-5 text-foreground">{stage.fact.value}</p>
              </div>
            </div>
            <div className="min-w-0">
              <p className="eyebrow">What can go wrong, and what catches it</p>
              <ul className="mt-3 flex flex-col divide-y divide-line rounded-xl shadow-[0_0_0_1px_var(--line)]">
                {stage.risks.map((risk) => {
                  const rule = ruleById(risk.rule);
                  return (
                    <li key={risk.rule} className="flex flex-col gap-2 px-4 py-3.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <RuleChip id={risk.rule} />
                        {rule && <SeverityBadge severity={rule.severity} />}
                        {rule && <span className="text-[13px] font-medium text-foreground">{rule.name}</span>}
                      </div>
                      <p className="text-[13.5px] leading-5 text-muted-foreground">{risk.text}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Tabs.Content>
        ))}
      </div>
    </Tabs.Root>
  );
}
