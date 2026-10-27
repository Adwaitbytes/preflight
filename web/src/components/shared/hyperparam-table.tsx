"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Hyperparam } from "@/lib/types";

const GROUPS: Hyperparam["group"][] = ["Registration", "Weights", "Consensus", "Emissions", "Commit reveal", "Other"];
const WHO: Record<Hyperparam["who"], string> = { owner: "Subnet owner", root: "Root", chain: "Chain" };

export function HyperparamTable({ params, caption }: { params: Hyperparam[]; caption: string }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const grouped = useMemo(() => {
    const hit = params.filter((p) => !q || `${p.name} ${p.meaning} ${p.group}`.toLowerCase().includes(q));
    return GROUPS.map((group) => ({ group, rows: hit.filter((p) => p.group === group) })).filter((g) => g.rows.length > 0);
  }, [params, q]);

  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-line px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <h2 className="text-sm font-semibold">{caption}</h2>
        <label className="relative block sm:w-64">
          <span className="sr-only">Filter hyperparameters</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-faint" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter, e.g. rate limit"
            className="h-8 w-full rounded-lg bg-surface-2 pr-3 pl-8 text-[13px] text-foreground shadow-[0_0_0_1px_var(--line)] outline-none placeholder:text-faint focus-visible:shadow-[0_0_0_2px_var(--ring)]"
          />
        </label>
      </div>
      {grouped.length === 0 && <p className="px-5 py-10 text-center text-sm text-faint">No hyperparameter matches &ldquo;{query}&rdquo;</p>}
      {grouped.map(({ group, rows }) => (
        <section key={group} aria-label={group}>
          <h3 className="eyebrow border-b border-line bg-surface-2/60 px-4 py-2 sm:px-5">{group}</h3>
          <dl className="divide-y divide-line">
            {rows.map((p) => (
              <div key={p.name} className="flex flex-col gap-1 px-4 py-3 sm:px-5">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="min-w-0 font-mono text-[13px] break-words text-foreground">{p.name}</dt>
                  <dd className="shrink-0 font-mono text-[13px] font-medium text-foreground">{p.value}</dd>
                </div>
                <dd className="max-w-[70ch] text-[13px] leading-5 text-muted-foreground">
                  {p.meaning}
                  <span className="text-faint">
                    {" "}
                    · {p.range ? `${p.range}, ` : ""}set by {WHO[p.who].toLowerCase()}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
