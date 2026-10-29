"use client";

import { ArrowRight, ArrowUpRight, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog, VisuallyHidden } from "radix-ui";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAppState } from "./app-state";
import { Logo } from "./logo";
import { GUIDE, NAV_GROUPS, type NavItem, isCurrent, isExternal } from "./nav-items";
import { NetworkSwitch } from "./network-switch";
import { ThemeToggle } from "./theme-toggle";

function Row({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const pathname = usePathname();
  const Icon = item.icon;
  const current = isCurrent(pathname, item.href);
  const external = isExternal(item.href);
  const className = cn("flex items-center gap-3.5 rounded-2xl px-3 py-2.5 transition-colors active:bg-surface-2", current && "bg-surface-2");
  const body = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-muted-foreground shadow-[0_0_0_1px_var(--line)]">
        <Icon className="size-[18px]" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-medium tracking-[-0.01em] text-foreground">{item.label}</span>
        <span className="block truncate text-[13px] text-muted-foreground">{item.description}</span>
      </span>
      {external && <ArrowUpRight className="size-4 shrink-0 text-faint" aria-hidden />}
    </>
  );
  return external ? (
    <a href={item.href} className={className} onClick={onNavigate} {...(item.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>
      {body}
    </a>
  ) : (
    <Link href={item.href} className={className} onClick={onNavigate} aria-current={current ? "page" : undefined}>
      {body}
    </Link>
  );
}

/** Two bars that fold into a cross, so the button says what it will do next */
function MenuGlyph({ open }: { open: boolean }) {
  return (
    <span aria-hidden className="relative block h-3 w-4">
      <span className={cn("absolute left-0 h-[1.5px] w-4 rounded-full bg-current transition-transform duration-300 ease-(--ease-out-quart) motion-reduce:transition-none", open ? "top-[5px] rotate-45" : "top-0.5")} />
      <span className={cn("absolute left-0 h-[1.5px] w-4 rounded-full bg-current transition-transform duration-300 ease-(--ease-out-quart) motion-reduce:transition-none", open ? "top-[5px] -rotate-45" : "top-[8.5px]")} />
    </span>
  );
}

/** The phone menu: one full screen sheet with every page, the network and the theme, under the thumb */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { setPaletteOpen } = useAppState();
  const close = () => setOpen(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className="grid size-9 cursor-pointer place-items-center rounded-full text-foreground transition-colors hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label="Open menu"
      >
        <MenuGlyph open={open} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain bg-background text-foreground data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2 motion-reduce:animate-none">
          <VisuallyHidden.Root>
            <Dialog.Title>Menu</Dialog.Title>
            <Dialog.Description>Every Preflight page, the network and the theme</Dialog.Description>
          </VisuallyHidden.Root>
          <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between bg-background/90 px-5 backdrop-blur-xl">
            <Link href="/" onClick={close} aria-label="Preflight home" className="rounded-lg">
              <Logo />
            </Link>
            <Dialog.Close className="grid size-9 cursor-pointer place-items-center rounded-full transition-colors hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" aria-label="Close menu">
              <X className="size-[18px]" aria-hidden />
            </Dialog.Close>
          </div>

          <div className="flex flex-1 flex-col px-3 pb-8">
            <button
              type="button"
              onClick={() => {
                close();
                setPaletteOpen(true);
              }}
              className="mx-2 mt-2 flex h-12 cursor-pointer items-center gap-3 rounded-2xl bg-surface-2 px-4 text-left text-[15px] text-muted-foreground shadow-[0_0_0_1px_var(--line)]"
            >
              <Search className="size-4" aria-hidden />
              Search, or paste a hotkey or hash
            </button>

            {NAV_GROUPS.map((group) => (
              <nav key={group.title} aria-label={group.title} className="mt-7">
                <p className="px-3 font-mono text-[11px] tracking-[0.16em] text-faint uppercase">{group.title}</p>
                <ul className="mt-2 flex flex-col gap-0.5">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Row item={item} onNavigate={close} />
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
            <ul className="mt-4 flex flex-col">
              <li>
                <Row item={GUIDE} onNavigate={close} />
              </li>
            </ul>

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-line px-3 pt-5">
              <span className="text-[13px] text-muted-foreground">Network and theme</span>
              <span className="flex items-center gap-1.5">
                <NetworkSwitch />
                <ThemeToggle />
              </span>
            </div>
            <Link
              href="/"
              onClick={close}
              className="mx-2 mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground text-[15px] font-medium text-background"
            >
              Diagnose a miner
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
