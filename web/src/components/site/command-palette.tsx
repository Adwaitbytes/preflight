"use client";

import { Command } from "cmdk";
import {
  ArrowRight,
  Boxes,
  FileClock,
  FlaskConical,
  Home,
  Moon,
  Rocket,
  ScrollText,
  Stethoscope,
  Users,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import { Dialog, VisuallyHidden } from "radix-ui";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NETWORK_LABEL, NETWORKS } from "@/lib/networks";
import { classifyInput, describeInput, hrefForInput } from "@/lib/route-input";
import { useAppState } from "./app-state";
import { useSwitchNetwork } from "./network-switch";

const PAGES: { href: string; label: string; icon: LucideIcon; keywords: string[] }[] = [
  { href: "/", label: "Home", icon: Home, keywords: ["doctor", "landing"] },
  { href: "/sim", label: "Simulate a transaction", icon: FlaskConical, keywords: ["simulator", "dry run", "fork"] },
  { href: "/subnets", label: "Subnet directory", icon: Boxes, keywords: ["subnets", "health", "capabilities"] },
  { href: "/plan", label: "Launch planner", icon: Rocket, keywords: ["lock cost", "register network"] },
  { href: "/explain", label: "Explain an error", icon: ScrollText, keywords: ["error", "traceback"] },
  { href: "/changelog", label: "Changelog", icon: FileClock, keywords: ["commits"] },
  { href: "/house", label: "Builders House", icon: Users, keywords: ["counters"] },
];

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

const ITEM =
  "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground outline-none data-[selected=true]:bg-surface-2 data-[selected=true]:text-foreground";

export function CommandPalette() {
  const { paletteOpen: open, setPaletteOpen: setOpen, network, localAvailable } = useAppState();
  const switchNetwork = useSwitchNetwork();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(!open);
        return;
      }
      if (event.key === "/" && !isTypingTarget(event.target) && !open) {
        const omnibox = document.getElementById("omnibox");
        event.preventDefault();
        if (omnibox) omnibox.focus();
        else setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const routed = classifyInput(query);
  const pastedHref = routed.kind === "subnet_name" || routed.kind === "empty" ? null : hrefForInput(routed, network);

  function run(action: () => void) {
    setOpen(false);
    setQuery("");
    action();
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed top-[12vh] left-1/2 z-50 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl bg-surface shadow-(--shadow-float) data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98]">
          <VisuallyHidden.Root>
            <Dialog.Title>Command menu</Dialog.Title>
            <Dialog.Description>Navigate, paste a hotkey or hash, switch network or theme</Dialog.Description>
          </VisuallyHidden.Root>
          <Command label="Command menu" shouldFilter={!pastedHref} loop>
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Waypoints className="size-4 shrink-0 text-faint" aria-hidden />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Paste a hotkey, hash or error, or type a command"
                className="h-13 w-full min-w-0 bg-transparent text-[15px] text-foreground outline-none placeholder:text-faint"
              />
            </div>
            <Command.List className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
              <Command.Empty className="px-3 py-8 text-center text-sm text-faint">No matches</Command.Empty>
              {pastedHref && (
                <Command.Group heading="Pasted" className="cmdk-group">
                  <Command.Item value={`open ${query}`} onSelect={() => run(() => router.push(pastedHref))} className={ITEM}>
                    <Stethoscope className="size-4 text-accent" aria-hidden />
                    <span className="flex-1 truncate text-foreground">{describeInput(routed)}</span>
                    <ArrowRight className="size-3.5 text-faint" aria-hidden />
                  </Command.Item>
                </Command.Group>
              )}
              {!pastedHref && (
                <>
                  {routed.kind === "subnet_name" && (
                    <Command.Group heading="Search" className="cmdk-group">
                      <Command.Item
                        value={`search subnets ${query}`}
                        keywords={[query]}
                        onSelect={() => run(() => router.push(hrefForInput(routed, network) ?? "/subnets"))}
                        className={ITEM}
                      >
                        <Boxes className="size-4" aria-hidden />
                        <span className="flex-1 truncate">Search subnets for &ldquo;{query.trim()}&rdquo;</span>
                      </Command.Item>
                    </Command.Group>
                  )}
                  <Command.Group heading="Go to" className="cmdk-group">
                    {PAGES.map((page) => (
                      <Command.Item key={page.href} value={page.label} keywords={page.keywords} onSelect={() => run(() => router.push(page.href))} className={ITEM}>
                        <page.icon className="size-4" aria-hidden />
                        {page.label}
                      </Command.Item>
                    ))}
                  </Command.Group>
                  <Command.Group heading="Network" className="cmdk-group">
                    {NETWORKS.filter((n) => n !== "local" || localAvailable).map((n) => (
                      <Command.Item key={n} value={`Switch to ${NETWORK_LABEL[n]}`} onSelect={() => run(() => switchNetwork(n))} className={ITEM}>
                        <span aria-hidden className="grid size-4 place-items-center">
                          <span className="size-1.5 rounded-full bg-current" />
                        </span>
                        <span className="flex-1">Switch to {NETWORK_LABEL[n]}</span>
                        {n === network && <span className="text-xs text-faint">Current</span>}
                      </Command.Item>
                    ))}
                  </Command.Group>
                  <Command.Group heading="Theme" className="cmdk-group">
                    <Command.Item
                      value="Toggle theme light dark"
                      onSelect={() => run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))}
                      className={ITEM}
                    >
                      <Moon className="size-4" aria-hidden />
                      Toggle light and dark theme
                    </Command.Item>
                  </Command.Group>
                </>
              )}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
