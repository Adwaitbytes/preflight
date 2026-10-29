"use client";

import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type MouseEvent, useSyncExternalStore } from "react";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import { useAppState } from "./app-state";
import { Logo } from "./logo";
import { MainNav } from "./main-nav";
import { MobileNav } from "./mobile-nav";
import { NetworkSwitch } from "./network-switch";
import { ThemeToggle } from "./theme-toggle";

function subscribeToScroll(onChange: () => void): () => void {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/** True once the page has moved, so the bar can gather into a capsule; false on the server */
function useScrolled(): boolean {
  return useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > 12,
    () => false,
  );
}

/**
 * The bar floats over the page: open and flush with the content at the top, then gathered into a
 * glass capsule once you scroll. The landing opens on a dark hero whatever the theme, so its bar
 * is dark too and the hero runs underneath it.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const { setPaletteOpen } = useAppState();
  const scrolled = useScrolled();
  const landing = pathname === "/";

  // On the landing the Doctor is already on screen, so the button takes you to its box
  const openDoctor = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!landing) return;
    event.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    document.getElementById("omnibox")?.focus({ preventScroll: true });
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-14 px-2 pt-1.5 text-foreground print:hidden sm:px-3",
        // Content passing under the bar softens into a blur instead of showing hard at its sides
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:-z-10 before:h-[4.5rem] before:opacity-0 before:backdrop-blur-[6px] before:transition-opacity before:duration-500 before:content-[''] before:[mask-image:linear-gradient(to_bottom,black_40%,transparent)]",
        scrolled && "before:opacity-100",
        landing && "dark",
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>
      <div
        className={cn(
          "mx-auto flex h-11 items-center rounded-2xl transition-[max-width,padding,background-color,box-shadow] duration-500 ease-(--ease-out-quart) motion-reduce:transition-none",
          scrolled
            ? "max-w-[62rem] bg-surface/85 pr-1.5 pl-3.5 shadow-[0_0_0_1px_var(--line-strong),0_18px_44px_-20px_rgb(0_0_0/0.5)] backdrop-blur-xl backdrop-saturate-150"
            : "max-w-[70rem] px-2 sm:px-4",
        )}
      >
        <Link href="/" className="shrink-0 rounded-lg py-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" aria-label="Preflight home">
          <Logo />
        </Link>

        <MainNav className="ml-6 hidden lg:block xl:ml-8" />

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full px-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none xl:pr-1.5 xl:pl-3 xl:shadow-[0_0_0_1px_var(--line)]"
            aria-label="Search or paste, opens the command menu"
            title="Search or paste (⌘K)"
          >
            <Search className="size-4" aria-hidden />
            <span className="hidden xl:inline">Search</span>
            <Kbd className="hidden xl:inline-flex">⌘K</Kbd>
          </button>
          <div className="hidden items-center gap-1 lg:flex">
            <NetworkSwitch />
            {/* The landing is pinned to its own colours, so a theme switch there would change nothing you can see */}
            {!landing && <ThemeToggle />}
          </div>
          <Link
            href="/"
            onClick={openDoctor}
            className={cn(
              "group ml-1 hidden h-9 items-center gap-1.5 rounded-full bg-foreground pr-3 pl-4 text-[13px] font-medium text-background transition-[background-color,transform] duration-200 hover:bg-foreground/85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none active:scale-[0.97]",
              // The landing's hero already holds the box, so the button joins the bar once you leave it
              landing && !scrolled ? "sm:hidden" : "sm:inline-flex",
            )}
          >
            Diagnose
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden />
          </Link>
          <div className="lg:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}
