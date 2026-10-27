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
  { href: "/sim", label: "Simulate" },
  { href: "/subnets", label: "Subnets" },
  { href: "/plan", label: "Launch" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const { setPaletteOpen } = useAppState();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/80 backdrop-blur-xl backdrop-saturate-150">
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
        <nav aria-label="Main" className="ml-5 hidden items-center gap-0.5 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
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
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-[13px] text-muted-foreground shadow-[0_0_0_1px_var(--line)] transition-colors hover:bg-surface-2 hover:text-foreground sm:w-52 sm:pr-1.5"
            aria-label="Open command menu"
          >
            <Search className="size-3.5" aria-hidden />
            <span className="hidden flex-1 text-left sm:inline">Search or paste</span>
            <Kbd className="hidden sm:inline-flex">⌘K</Kbd>
          </button>
          <NetworkSwitch />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
