"use client";

import { ArrowUp, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface TocEntry {
  id: string;
  number: number;
  title: string;
  /** Lookup chapters, listed under their own label */
  reference?: boolean;
}

/** True for the first reference chapter, where the navigation prints the group label */
function startsReference(entries: TocEntry[], i: number): boolean {
  return Boolean(entries[i]?.reference) && !entries[i - 1]?.reference;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** How far below the viewport top a chapter must start to count as the one being read */
function readingLine(): number {
  if (window.innerWidth >= 1024) return 120;
  return window.innerWidth >= 768 ? 150 : 190;
}

/** The chapter whose top has scrolled past the reading line; the last one at the page bottom */
function useActiveSection(ids: readonly string[]): string | undefined {
  const key = ids.join(" ");
  const [active, setActive] = useState<string | undefined>(ids[0]);

  useEffect(() => {
    const list = key.split(" ");
    let frame = 0;
    const measure = () => {
      frame = 0;
      const line = readingLine();
      let current = list[0];
      for (const id of list) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) current = list[list.length - 1];
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [key]);

  return active;
}

/** Smooth scroll that respects reduced motion, keeps the hash in the URL and moves focus to the chapter */
function jumpTo(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  window.history.pushState(null, "", `#${id}`);
  target.focus({ preventScroll: true });
}

function onJump(event: React.MouseEvent<HTMLAnchorElement>, id: string, after?: () => void) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
  event.preventDefault();
  after?.();
  jumpTo(id);
}

/** Desktop: sticky chapter list with scroll spy */
export function GuideToc({ entries }: { entries: TocEntry[] }) {
  const active = useActiveSection(entries.map((e) => e.id));
  const activeIndex = Math.max(0, entries.findIndex((e) => e.id === active));
  return (
    <nav aria-label="Guide chapters" className="sticky top-24 flex max-h-[calc(100dvh-7rem)] flex-col pb-8">
      <p className="eyebrow">On this page</p>
      <div className="relative mt-4 min-h-0 overflow-y-auto [scrollbar-width:none]">
        <span aria-hidden className="absolute top-0 bottom-0 left-0 w-px bg-line-strong" />
        <span
          aria-hidden
          className="absolute top-0 left-0 w-px origin-top bg-accent transition-transform duration-500 ease-(--ease-out-quart)"
          style={{ height: "100%", transform: `scaleY(${(activeIndex + 1) / entries.length})` }}
        />
        <ol className="flex flex-col">
          {entries.map((entry, i) => {
            const current = entry.id === active;
            return (
              <li key={entry.id}>
                {startsReference(entries, i) && <p className="eyebrow mt-4 mb-1.5 pl-4">Reference</p>}
                <a
                  href={`#${entry.id}`}
                  onClick={(e) => onJump(e, entry.id)}
                  aria-current={current ? "location" : undefined}
                  className={cn(
                    "group relative flex gap-3 rounded-r-md py-1.5 pr-2 pl-4 text-[13px] leading-5 transition-colors",
                    current ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-1/2 left-0 size-[7px] -translate-x-[3px] -translate-y-1/2 rounded-full transition-[background-color,box-shadow,transform] duration-300",
                      current ? "scale-100 bg-accent shadow-[0_0_0_3px_var(--accent-soft)]" : "scale-0 bg-faint",
                    )}
                  />
                  <span className={cn("font-mono text-[11px] leading-5 tnum", current ? "text-accent-ink" : "text-faint")}>{pad(entry.number)}</span>
                  <span className="min-w-0">{entry.title}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
      <a
        href="#top"
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
          window.history.pushState(null, "", window.location.pathname);
        }}
        className="mt-6 inline-flex items-center gap-1.5 self-start rounded text-xs text-faint transition-colors hover:text-foreground"
      >
        <ArrowUp className="size-3.5" aria-hidden />
        Back to top
      </a>
    </nav>
  );
}

/** Below lg: a sticky bar naming the current chapter, opening a jump list */
export function GuideJumpMenu({ entries }: { entries: TocEntry[] }) {
  const active = useActiveSection(entries.map((e) => e.id));
  const [open, setOpen] = useState(false);
  const listId = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const index = Math.max(0, entries.findIndex((e) => e.id === active));
  const current = entries[index];

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (root.current && event.target instanceof Node && !root.current.contains(event.target)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={root} className="sticky top-[98px] z-30 -mx-4 border-b border-line bg-background/85 backdrop-blur-xl backdrop-saturate-150 sm:-mx-6 md:top-[57px] lg:hidden">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-full cursor-pointer items-center gap-3 px-4 text-left sm:px-6"
      >
        <span className="font-mono text-[11px] text-accent-ink tnum">{current ? pad(current.number) : ""}</span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
          <span className="sr-only">Chapter: </span>
          {current?.title}
        </span>
        <span className="text-xs text-faint tnum">
          {index + 1} of {entries.length}
        </span>
        <ChevronDown className={cn("size-4 text-faint transition-transform duration-200", open && "rotate-180")} aria-hidden />
      </button>
      <span aria-hidden className="absolute bottom-[-1px] left-0 h-px bg-accent transition-[width] duration-500 ease-(--ease-out-quart)" style={{ width: `${((index + 1) / entries.length) * 100}%` }} />
      <ol
        id={listId}
        hidden={!open}
        className="absolute inset-x-0 top-full max-h-[min(70dvh,520px)] overflow-y-auto border-b border-line bg-surface px-2 py-2 shadow-(--shadow-float)"
      >
        {entries.map((entry, i) => (
          <li key={entry.id}>
            {startsReference(entries, i) && <p className="eyebrow mt-2 mb-1 border-t border-line px-3 pt-3">Reference</p>}
            <a
              href={`#${entry.id}`}
              onClick={(e) => onJump(e, entry.id, () => setOpen(false))}
              aria-current={entry.id === active ? "location" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                entry.id === active ? "bg-surface-2 font-medium text-foreground" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
              )}
            >
              <span className="w-5 font-mono text-[11px] text-faint tnum">{pad(entry.number)}</span>
              {entry.title}
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Fades blocks in as they first scroll into view. Only blocks below the fold at load are hidden,
 * so nothing visible flashes, and nothing is hidden at all with reduced motion or without JS
 */
export function GuideReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const blocks = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const below = blocks.filter((el) => el.getBoundingClientRect().top > window.innerHeight);
    if (!below.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.reveal = "shown";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    for (const el of below) {
      el.dataset.reveal = "pending";
      observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);
  return null;
}
