"use client";

import { ArrowUpRight, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { SeverityBadge } from "@/components/ui/badge";
import { GUIDE_SECTIONS, RULES, ruleAnchor, type RuleAudience } from "@/lib/guide";
import { cn } from "@/lib/utils";

type Filter = "all" | RuleAudience;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "miner", label: "Miner" },
  { value: "validator", label: "Validator" },
  { value: "subnet", label: "Subnet" },
];

const COUNT: Record<Filter, number> = {
  all: RULES.length,
  miner: RULES.filter((r) => r.audience === "miner").length,
  validator: RULES.filter((r) => r.audience === "validator").length,
  subnet: RULES.filter((r) => r.audience === "subnet").length,
};

const CHAPTER = new Map<string, string>(GUIDE_SECTIONS.map((s) => [s.id, `${String(s.number).padStart(2, "0")} ${s.title}`]));

export function RuleReference() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  // :target does not match a row that mounts after the jump, so the jump highlights it by hand
  const [flash, setFlash] = useState<string | null>(null);
  const q = query.trim().toLowerCase();
  const shown = RULES.filter(
    (r) => (filter === "all" || r.audience === filter) && (!q || `${r.id} ${r.slug} ${r.name} ${r.line}`.toLowerCase().includes(q)),
  );

  // A link like #pf108 must land on its row even when a filter hides it. The first load needs
  // nothing: no filter is set yet, so the browser's own jump finds the row
  useEffect(() => {
    const timers: number[] = [];
    function reveal() {
      const id = window.location.hash.slice(1);
      if (!/^pf\d{3}$/.test(id)) return;
      setFilter("all");
      setQuery("");
      setFlash(id);
      // After React has rendered the unfiltered list
      timers.push(window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "center" }), 60));
      timers.push(window.setTimeout(() => setFlash(null), 2400));
    }
    window.addEventListener("hashchange", reveal);
    return () => {
      window.removeEventListener("hashchange", reveal);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  return (
    <div data-reveal className="panel overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-line px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div role="group" aria-label="Filter rules by who they are for" className="flex gap-1 overflow-x-auto rounded-lg bg-surface-2 p-1 shadow-[0_0_0_1px_var(--line)] [scrollbar-width:none]">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium transition-[background-color,color,box-shadow] duration-150",
                filter === f.value ? "bg-surface text-foreground shadow-[0_0_0_1px_var(--line-strong),0_1px_2px_rgb(0_0_0/0.08)]" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
              <span className="font-mono text-[11px] text-faint tnum">{COUNT[f.value]}</span>
            </button>
          ))}
        </div>
        <label className="relative block sm:w-60">
          <span className="sr-only">Search rules</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-faint" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search, e.g. axon or PF203"
            className="h-9 w-full rounded-lg bg-surface-2 pr-3 pl-8 text-[13px] text-foreground shadow-[0_0_0_1px_var(--line)] outline-none placeholder:text-faint focus-visible:shadow-[0_0_0_2px_var(--ring)]"
          />
        </label>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {shown.length} {shown.length === 1 ? "rule" : "rules"} shown
      </p>

      {shown.length === 0 ? (
        <p className="px-5 py-12 text-center text-sm text-faint">No rule matches &ldquo;{query}&rdquo;</p>
      ) : (
        <ul className="divide-y divide-line">
          {shown.map((rule) => (
            <li
              key={rule.id}
              id={ruleAnchor(rule.id)}
              className={cn(
                "grid grid-cols-1 scroll-mt-40 gap-x-5 gap-y-2 px-4 py-4 transition-colors duration-700 target:bg-accent-soft sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:px-5 lg:scroll-mt-24",
                flash === ruleAnchor(rule.id) && "bg-accent-soft",
              )}
            >
              <div className="flex items-center gap-2 sm:block">
                <a href={`#${ruleAnchor(rule.id)}`} className="rounded font-mono text-[13px] font-semibold text-foreground hover:text-accent-ink">
                  {rule.id}
                </a>
                <span className="sm:hidden">
                  <SeverityBadge severity={rule.severity} />
                </span>
              </div>
              <div className="min-w-0">
                <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-[14px] font-medium text-foreground">{rule.name}</span>
                  <span className="font-mono text-[11.5px] text-faint">{rule.slug}</span>
                </p>
                <p className="mt-1 text-[13.5px] leading-5 text-pretty text-muted-foreground">{rule.line}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                  {rule.section !== "rules" && (
                    <a href={`#${rule.section}`} className="rounded text-muted-foreground underline decoration-line-strong underline-offset-4 hover:text-foreground">
                      {CHAPTER.get(rule.section)}
                    </a>
                  )}
                  {rule.docs && (
                    <a
                      href={rule.docs}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-0.5 rounded text-muted-foreground underline decoration-line-strong underline-offset-4 hover:text-foreground"
                    >
                      Bittensor docs
                      <ArrowUpRight className="size-3" aria-hidden />
                    </a>
                  )}
                </div>
              </div>
              <div className="hidden sm:block">
                <SeverityBadge severity={rule.severity} />
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="border-t border-line bg-surface-2/50 px-4 py-2.5 text-xs leading-5 text-faint sm:px-5">
        Severity is what each rule is declared with. Some findings come out lower, such as PF108 while a miner is still in immunity
      </p>
    </div>
  );
}
