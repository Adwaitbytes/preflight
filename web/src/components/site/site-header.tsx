"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";
import { useAppState } from "./app-state";
import { Logo } from "./logo";
import { NetworkSwitch } from "./network-switch";
import { ThemeToggle } from "./theme-toggle";

export const NAV = [
  { href: "/live", label: "Live" },
  { href: "/weather", label: "Weather" },
  { href: "/epoch", label: "Epoch" },
  { href: "/sim", label: "Simulate" },
  { href: "/subnets", label: "Subnets" },
  { href: "/plan", label: "Launch" },
  { href: "/guide", label: "Guide" },
] as const;

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Live carries a small beating dot, so the stream reads as running from anywhere on the site */
function NavLabel({ href, label }: { href: string; label: string }) {
  if (href !== "/live") return label;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden className="relative inline-flex size-1.5">
        <span className="live-ping absolute inset-0 rounded-full bg-healthy" />
        <span className="relative size-1.5 rounded-full bg-healthy" />
      </span>
      {label}
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { setPaletteOpen } = useAppState();
  return (
    <header className="sticky top-0 z-40 print:hidden border-b border-line bg-background/80 backdrop-blur-xl backdrop-saturate-150">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="-ml-1 rounded-lg px-1 py-1" aria-label="Preflight home">
          <Logo />
        </Link>
        <nav aria-label="Main" className="ml-3 hidden min-w-0 items-center gap-0.5 md:flex lg:ml-5">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
                  active ? "bg-surface-2 text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <NavLabel href={item.href} label={item.label} />
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-[13px] text-muted-foreground shadow-[0_0_0_1px_var(--line)] transition-colors hover:bg-surface-2 hover:text-foreground sm:w-52 sm:pr-1.5 md:w-auto md:pr-2.5 lg:w-52 lg:pr-1.5"
            aria-label="Search or paste, opens the command menu"
            title="Search or paste (⌘K)"
          >
            <Search className="size-3.5" aria-hidden />
            <span className="hidden flex-1 text-left sm:inline md:hidden lg:inline">Search or paste</span>
            <Kbd className="hidden sm:inline-flex md:hidden lg:inline-flex">⌘K</Kbd>
          </button>
          <NetworkSwitch />
          <ThemeToggle />
        </div>
      </div>
      <nav aria-label="Main, compact" className="border-t border-line md:hidden">
        <div className="mx-auto flex h-10 max-w-6xl items-center gap-1 overflow-x-auto px-3 [scrollbar-width:none] sm:px-5">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-8 shrink-0 items-center rounded-lg px-3 text-[13px] font-medium transition-colors",
                  active ? "bg-surface-2 text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <NavLabel href={item.href} label={item.label} />
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
