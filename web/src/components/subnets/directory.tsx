"use client";

import { Search, SearchX, X } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useAppState } from "@/components/site/app-state";
import { Button } from "@/components/ui/button";
import { StateView } from "@/components/ui/state";
import type { ApiResult } from "@/lib/api";
import { scores } from "@/lib/client-calls";
import { formatInt, pluralize } from "@/lib/format";
import type { NetworkId } from "@/lib/networks";
import type { Health, HealthScores, SubnetCard as SubnetCardData } from "@/lib/types";
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

const NO_SCORES: Record<string, Health> = {};

type ScoreStatus = "ready" | "scoring" | "unavailable";

/**
 * Cards render at once; `/v1/scores` fills the rings when it lands, which takes about 40 s on a
 * cold cache. The offline demo never fetches: its recorded cards already carry health.
 */
function useHealthScores(cards: SubnetCardData[], network: NetworkId, offline: boolean) {
  const [loaded, setLoaded] = useState<{ network: NetworkId; result: ApiResult<HealthScores> } | null>(null);

  useEffect(() => {
    if (offline) return;
    let cancelled = false;
    const settle = (result: ApiResult<HealthScores>) => {
      if (!cancelled) setLoaded({ network, result });
    };
    scores(network).then(settle, () => settle({ ok: false, error: { kind: "network", status: null, message: "Health scores did not load" } }));
    return () => {
      cancelled = true;
    };
  }, [network, offline]);

  const result = loaded?.network === network ? loaded.result : null;
  const fetched = result?.ok ? result.data.scores : NO_SCORES;
  const merged = useMemo(() => cards.map((card) => ({ ...card, health: fetched[String(card.netuid)] ?? card.health })), [cards, fetched]);
  const missing = merged.filter((card) => !card.health).length;
  const status: ScoreStatus = missing === 0 || result?.ok ? "ready" : offline || result ? "unavailable" : "scoring";
  return { cards: merged, status, missing, block: result?.ok ? result.data.chain.block : null };
}

const CHIP =
  "inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium transition-colors aria-pressed:bg-foreground aria-pressed:text-background";

export function Directory({ cards: initialCards, network, initialQuery }: { cards: SubnetCardData[]; network: NetworkId; initialQuery: string }) {
  const { offline } = useAppState();
  const { cards, status, missing, block } = useHealthScores(initialCards, network, offline);
  const [query, setQuery] = useState(initialQuery);
  const [caps, setCaps] = useState<CapabilityId[]>([]);
  const [apiOnly, setApiOnly] = useState(false);
  const [band, setBand] = useState<BandFilter>("all");
  const deferredQuery = useDeferredValue(query.trim());

  const unbanded = useMemo(
    () =>
      cards
        .filter((card) => matches(card, deferredQuery))
        .filter((card) => caps.every((cap) => card.catalog?.capabilities.some((c) => c.toLowerCase() === cap)))
        .filter((card) => !apiOnly || hasPublicApi(card.catalog?.api)),
    [cards, deferredQuery, caps, apiOnly],
  );
  const visible = useMemo(
    () =>
      unbanded
        .filter((card) => band === "all" || card.health?.band === band)
        // Sorted by emission share, which is known at first paint: sorting by health would
        // reorder every card when the scores arrive seconds later (measured CLS 0.32 at 375 px).
        .sort((a, b) => (b.live?.emission_share ?? -1) - (a.live?.emission_share ?? -1) || a.netuid - b.netuid),
    [unbanded, band],
  );

  const scoring = status === "scoring";
  const scoringLabel = `Scoring ${pluralize(missing, "subnet")}`;
  const bandsUsable = cards.some((card) => card.health);
  const bandsDisabled = scoring || !bandsUsable;
  const bandsHint = scoring ? scoringLabel : bandsUsable ? undefined : "Health scores are not available right now";
  const emptyBand = band !== "all" && visible.length === 0 && unbanded.length > 0 ? band : null;

  const narrowed = deferredQuery !== "" || caps.length > 0 || apiOnly;
  const filtered = narrowed || band !== "all";
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
          <div
            role="radiogroup"
            aria-label="Health band"
            aria-disabled={bandsDisabled || undefined}
            title={bandsDisabled ? bandsHint : undefined}
            className="flex shrink-0 gap-0.5 self-start rounded-lg bg-surface-2 p-0.5 shadow-[0_0_0_1px_var(--line)]"
          >
            {(["all", "healthy", "watch", "at_risk"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={band === value}
                disabled={bandsDisabled && value !== "all"}
                onClick={() => setBand(value)}
                className="h-7 cursor-pointer rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:text-muted-foreground aria-checked:bg-surface aria-checked:text-foreground aria-checked:shadow-[0_0_0_1px_var(--line),0_1px_2px_rgb(0_0_0/0.1)]"
              >
                {value === "all" ? "All" : BAND_LABEL[value]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-faint" aria-live="polite">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>
            {visible.length} of {cards.length} subnets
          </span>
          {scoring && (
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-accent" />
              {scoringLabel}
            </span>
          )}
          {status === "unavailable" && <span>Health scores unavailable</span>}
        </span>
        {filtered && (
          <button type="button" onClick={reset} className="inline-flex cursor-pointer items-center gap-1 rounded text-muted-foreground hover:text-foreground">
            <X className="size-3" aria-hidden />
            Clear filters
          </button>
        )}
      </div>

      <h2 className="sr-only">Subnets</h2>
      {visible.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((card) => (
            <SubnetCard key={card.netuid} card={card} network={network} scoring={scoring} />
          ))}
        </div>
      ) : emptyBand ? (
        <StateView
          icon={SearchX}
          title={`No ${narrowed ? "matching subnet" : "subnet"} scored ${BAND_LABEL[emptyBand]} ${block != null ? `at block ${formatInt(block)}` : "right now"}`}
          action={
            <Button variant="secondary" onClick={() => setBand("all")}>
              Show every band
            </Button>
          }
        >
          Every subnet is scored with the same rules the Doctor runs. Pick another band to see where they landed
        </StateView>
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
