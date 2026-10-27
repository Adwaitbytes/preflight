"use client";

import { Search, SearchX, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { StateView } from "@/components/ui/state";
import type { Health, SubnetCard as SubnetCardData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CAPABILITIES, type CapabilityId, hasPublicApi } from "./capabilities";
import { BAND_LABEL } from "./health-ring";
import { SubnetCard, subnetName } from "./subnet-card";

type BandFilter = "all" | Health["band"];

function matches(card: SubnetCardData, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase().replace(/^sn\s*/, "");
  if (String(card.netuid) === q) return true;
  const text = [subnetName(card), card.live?.name, card.catalog?.summary, card.catalog?.operator, ...(card.catalog?.capabilities ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return text.includes(query.toLowerCase());
}

const CHIP =
  "inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition-colors aria-pressed:bg-foreground aria-pressed:text-background";

export function Directory({ cards, network, initialQuery }: { cards: SubnetCardData[]; network: string; initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [caps, setCaps] = useState<CapabilityId[]>([]);
  const [apiOnly, setApiOnly] = useState(false);
  const [band, setBand] = useState<BandFilter>("all");
  const deferredQuery = useDeferredValue(query.trim());

  const visible = useMemo(
    () =>
      cards
        .filter((card) => matches(card, deferredQuery))
        .filter((card) => caps.every((cap) => card.catalog?.capabilities.some((c) => c.toLowerCase() === cap)))
        .filter((card) => !apiOnly || hasPublicApi(card.catalog?.api))
        .filter((card) => band === "all" || card.health?.band === band)
        .sort((a, b) => (b.health?.score ?? -1) - (a.health?.score ?? -1) || a.netuid - b.netuid),
    [cards, deferredQuery, caps, apiOnly, band],
  );

  const filtered = deferredQuery !== "" || caps.length > 0 || apiOnly || band !== "all";
  function reset() {
    setQuery("");
    setCaps([]);
    setApiOnly(false);
    setBand("all");
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <label className="relative block">
          <span className="sr-only">Search subnets</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-faint" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, netuid, operator or what it does"
            className="h-11 w-full rounded-xl bg-surface pr-4 pl-10 text-[15px] text-foreground shadow-[0_0_0_1px_var(--line-strong)] outline-none placeholder:text-faint focus-visible:shadow-[0_0_0_2px_var(--ring)]"
          />
        </label>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div role="group" aria-label="Capabilities" className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
            {CAPABILITIES.map((cap) => {
              const on = caps.includes(cap.id);
              return (
                <button
                  key={cap.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setCaps((prev) => (on ? prev.filter((c) => c !== cap.id) : [...prev, cap.id]))}
                  className={cn(CHIP, "bg-surface text-muted-foreground shadow-[0_0_0_1px_var(--line)] hover:text-foreground")}
                >
                  {cap.label}
                </button>
              );
            })}
            <span aria-hidden className="mx-1 hidden h-8 w-px shrink-0 bg-line sm:block" />
            <button
              type="button"
              aria-pressed={apiOnly}
              onClick={() => setApiOnly((v) => !v)}
              className={cn(CHIP, "bg-surface text-muted-foreground shadow-[0_0_0_1px_var(--line)] hover:text-foreground")}
            >
              Has API
            </button>
          </div>
          <div role="radiogroup" aria-label="Health band" className="flex shrink-0 gap-0.5 self-start rounded-lg bg-surface-2 p-0.5 shadow-[0_0_0_1px_var(--line)]">
            {(["all", "healthy", "watch", "at_risk"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={band === value}
                onClick={() => setBand(value)}
                className="h-7 cursor-pointer rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground aria-checked:bg-surface aria-checked:text-foreground aria-checked:shadow-[0_0_0_1px_var(--line),0_1px_2px_rgb(0_0_0/0.1)]"
              >
                {value === "all" ? "All" : BAND_LABEL[value]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-faint" aria-live="polite">
        <span>
          {visible.length} of {cards.length} subnets
        </span>
        {filtered && (
          <button type="button" onClick={reset} className="inline-flex cursor-pointer items-center gap-1 rounded text-muted-foreground hover:text-foreground">
            <X className="size-3" aria-hidden />
            Clear filters
          </button>
        )}
      </div>

      {visible.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((card) => (
            <SubnetCard key={card.netuid} card={card} network={network} />
          ))}
        </div>
      ) : (
        <StateView
          icon={SearchX}
          title="No subnet matches these filters"
          action={
            <Button variant="secondary" onClick={reset}>
              Clear filters
            </Button>
          }
        >
          Capabilities come from the curated catalog, so subnets without a catalog entry only match by name or netuid
        </StateView>
      )}
    </div>
  );
}
