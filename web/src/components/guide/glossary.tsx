"use client";

import { Search } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { GUIDE_SECTIONS } from "@/lib/guide";
import { GLOSSARY, glossaryAnchor } from "./glossary-terms";

const SECTION_NUMBER = new Map<string, number>(GUIDE_SECTIONS.map((s) => [s.id, s.number]));

export function Glossary() {
  const [query, setQuery] = useState("");
  const inputId = useId();
  const q = query.trim().toLowerCase();
  const shown = GLOSSARY.filter((t) => !q || [t.term, t.definition, ...(t.aka ?? [])].join(" ").toLowerCase().includes(q));

  // "In the glossary" links from the inline terms must land on their row even when a search hides it
  useEffect(() => {
    const timers: number[] = [];
    function reveal() {
      const id = window.location.hash.slice(1);
      if (!id.startsWith("term-")) return;
      setQuery("");
      timers.push(window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "center" }), 60));
    }
    window.addEventListener("hashchange", reveal);
    return () => {
      window.removeEventListener("hashchange", reveal);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  return (
    <div data-reveal className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label htmlFor={inputId} className="relative block w-full sm:max-w-sm">
          <span className="sr-only">Search the glossary</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-faint" aria-hidden />
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a term, e.g. kappa or burn"
            className="h-11 w-full rounded-xl bg-surface pr-4 pl-10 text-[15px] text-foreground shadow-[0_0_0_1px_var(--line-strong)] outline-none placeholder:text-faint focus-visible:shadow-[0_0_0_2px_var(--ring)]"
          />
        </label>
        <p className="text-xs text-faint" role="status" aria-live="polite">
          {shown.length === GLOSSARY.length ? `${GLOSSARY.length} terms` : `${shown.length} of ${GLOSSARY.length} terms`}
        </p>
      </div>
      {shown.length === 0 ? (
        <div className="panel px-6 py-12 text-center">
          <p className="text-[15px] font-medium text-foreground">No term matches &ldquo;{query.trim()}&rdquo;</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a shorter word, or search the rules in chapter 9</p>
        </div>
      ) : (
        <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-line shadow-[0_0_0_1px_var(--line)] md:grid-cols-2">
          {shown.map((t) => (
            <div key={t.term} id={glossaryAnchor(t.term)} className="flex min-w-0 scroll-mt-44 flex-col gap-1.5 bg-surface px-5 py-4 transition-colors duration-700 target:bg-accent-soft lg:scroll-mt-28">
              <dt className="flex items-baseline justify-between gap-3">
                <span className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">{t.term}</span>
                {t.section && (
                  <a href={`#${t.section}`} className="shrink-0 rounded font-mono text-[11px] text-faint transition-colors hover:text-accent-ink">
                    Chapter {String(SECTION_NUMBER.get(t.section) ?? "").padStart(2, "0")}
                  </a>
                )}
              </dt>
              <dd className="text-[13.5px] leading-[1.6] text-pretty text-muted-foreground">{t.definition}</dd>
            </div>
          ))}
          {shown.length % 2 === 1 && <div aria-hidden className="hidden bg-surface md:block" />}
        </dl>
      )}
    </div>
  );
}
