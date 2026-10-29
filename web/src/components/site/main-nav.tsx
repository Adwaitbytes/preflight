"use client";

import { ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavigationMenu } from "radix-ui";
import type { ReactNode } from "react";
import { useWeather } from "@/components/weather/use-weather";
import { CopyButton } from "@/components/ui/copy-button";
import { formatInt, formatShare } from "@/lib/format";
import { MCP_INSTALL } from "@/lib/install";
import { cn } from "@/lib/utils";
import { useAppState } from "./app-state";
import { GUIDE, NAV_GROUPS, type NavItem, isCurrent, isExternal } from "./nav-items";

const [TOOLS, NETWORK, BUILD] = NAV_GROUPS as [(typeof NAV_GROUPS)[number], (typeof NAV_GROUPS)[number], (typeof NAV_GROUPS)[number]];

const TRIGGER =
  "group/trigger inline-flex h-9 cursor-pointer items-center gap-1 rounded-full px-3.5 text-[13.5px] font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:text-foreground data-[state=open]:bg-surface-2/70 data-[state=open]:text-foreground";

// Panels slide in from the side of the trigger the pointer came from, so the menu reads as one surface
const CONTENT =
  "absolute top-0 left-0 p-2 data-[motion=from-end]:animate-[nav-from-right_240ms_var(--ease-out-quart)] data-[motion=from-start]:animate-[nav-from-left_240ms_var(--ease-out-quart)] data-[motion=to-end]:animate-[nav-to-right_200ms_ease-in] data-[motion=to-start]:animate-[nav-to-left_200ms_ease-in] motion-reduce:animate-none";

function ItemLink({ item, compact = false }: { item: NavItem; compact?: boolean }) {
  const pathname = usePathname();
  const Icon = item.icon;
  const external = isExternal(item.href);
  const body = (
    <>
      <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-surface-2 text-muted-foreground shadow-[0_0_0_1px_var(--line)] transition-colors group-hover/item:bg-accent-soft group-hover/item:text-accent-ink">
        <Icon className="size-[17px]" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-[13.5px] font-medium text-foreground">
          {item.label}
          {external && <ArrowUpRight className="size-3 text-faint" aria-hidden />}
        </span>
        {!compact && <span className="mt-0.5 block text-[12.5px] leading-[1.35] text-pretty text-muted-foreground">{item.description}</span>}
      </span>
    </>
  );
  const className = "group/item flex items-start gap-3 rounded-xl p-2.5 outline-none transition-colors hover:bg-surface-2 focus-visible:bg-surface-2 aria-[current=page]:bg-surface-2";
  return (
    <NavigationMenu.Link asChild active={isCurrent(pathname, item.href)}>
      {external ? (
        <a href={item.href} className={className} {...(item.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>
          {body}
        </a>
      ) : (
        <Link href={item.href} className={className}>
          {body}
        </Link>
      )}
    </NavigationMenu.Link>
  );
}

function Trigger({ items, children }: { items: NavItem[]; children: ReactNode }) {
  const pathname = usePathname();
  const active = items.some((item) => isCurrent(pathname, item.href));
  return (
    <NavigationMenu.Trigger className={TRIGGER} data-active={active}>
      {children}
      <ChevronDown className="size-3.5 text-faint transition-transform duration-200 group-data-[state=open]/trigger:rotate-180 motion-reduce:transition-none" aria-hidden />
    </NavigationMenu.Trigger>
  );
}

/** The Doctor is the front door, so it gets the large card: what you paste and what comes back */
function DoctorCard() {
  return (
    <NavigationMenu.Link asChild>
      <Link
        href="/"
        className="group/card relative isolate flex h-full flex-col justify-end overflow-hidden rounded-xl bg-[#07080d] p-4 text-white shadow-[0_0_0_1px_rgb(255_255_255/0.08)] outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(rgb(124_147_255/0.5)_1px,transparent_1.4px)] [background-size:11px_11px] [mask-image:radial-gradient(90%_70%_at_80%_0%,black,transparent)] opacity-70" />
        <span aria-hidden className="absolute -top-10 -right-10 -z-10 size-40 rounded-full bg-[#4c6bff]/35 blur-3xl transition-opacity group-hover/card:opacity-70" />
        <span className="font-mono text-[10.5px] tracking-[0.14em] text-[#9db0ff] uppercase">Doctor</span>
        <span className="mt-2 text-[17px] leading-snug font-medium tracking-[-0.02em]">Paste a hotkey. Know why it earns nothing.</span>
        <span className="mt-3 flex items-center justify-between rounded-lg bg-white/[0.06] px-2.5 py-2 font-mono text-[11.5px] text-white/60 shadow-[0_0_0_1px_rgb(255_255_255/0.1)]">
          5EKtvz…Qmhq
          <ArrowRight className="size-3.5 text-white/70 transition-transform group-hover/card:translate-x-0.5" aria-hidden />
        </span>
      </Link>
    </NavigationMenu.Link>
  );
}

/** Finney right now, read when the menu opens: the same numbers as the weather page */
function NetworkCard() {
  const { offline } = useAppState();
  const state = useWeather("finney", offline);
  const ready = state.status === "ready" ? state.weather : null;
  const rows = [
    { label: "Block", value: ready ? formatInt(ready.to_block) : "·····" },
    { label: "Failing now", value: ready ? formatShare(ready.failure_rate, 1) : "···" },
    { label: "Last 12 min", value: ready ? `${formatInt(ready.extrinsics)} tx` : "···" },
  ];
  return (
    <NavigationMenu.Link asChild>
      <Link href="/weather" className="group/card flex h-full flex-col rounded-xl bg-surface-2 p-4 shadow-[0_0_0_1px_var(--line)] outline-none transition-colors hover:bg-surface-3 focus-visible:ring-2 focus-visible:ring-ring">
        <span className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase">
          <span aria-hidden className="relative inline-flex size-1.5">
            <span className="live-ping absolute inset-0 rounded-full bg-healthy" />
            <span className="relative size-1.5 rounded-full bg-healthy" />
          </span>
          Finney right now
        </span>
        <span className="mt-4 flex flex-col gap-2.5">
          {rows.map((row) => (
            <span key={row.label} className="flex items-baseline justify-between gap-4 text-[13px]">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-mono text-foreground tnum">{row.value}</span>
            </span>
          ))}
        </span>
        <span className="mt-auto flex items-center gap-1 pt-4 text-[12.5px] font-medium text-accent-ink">
          Open the weather
          <ArrowRight className="size-3.5 transition-transform group-hover/card:translate-x-0.5" aria-hidden />
        </span>
      </Link>
    </NavigationMenu.Link>
  );
}

/**
 * The desktop menus: three panels that morph into each other in one shared surface, plus the Guide.
 * Radix handles hover intent, keyboard order and focus; the motion respects reduced motion.
 */
export function MainNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const guideActive = isCurrent(pathname, GUIDE.href);
  return (
    <NavigationMenu.Root aria-label="Main" className={cn("relative z-10", className)} delayDuration={80}>
      <NavigationMenu.List className="flex items-center gap-0.5">
        <NavigationMenu.Item>
          <Trigger items={TOOLS.items}>Tools</Trigger>
          <NavigationMenu.Content className={CONTENT}>
            <div className="grid w-[40rem] grid-cols-[13rem_minmax(0,1fr)] gap-2">
              <DoctorCard />
              <ul className="grid grid-cols-1 gap-0.5">
                {TOOLS.items.slice(1).map((item) => (
                  <li key={item.href}>
                    <ItemLink item={item} />
                  </li>
                ))}
              </ul>
            </div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <Trigger items={NETWORK.items}>Network</Trigger>
          <NavigationMenu.Content className={CONTENT}>
            <div className="grid w-[36rem] grid-cols-[minmax(0,1fr)_13rem] gap-2">
              <ul className="grid grid-cols-1 gap-0.5">
                {NETWORK.items.map((item) => (
                  <li key={item.href}>
                    <ItemLink item={item} />
                  </li>
                ))}
              </ul>
              <NetworkCard />
            </div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <Trigger items={BUILD.items}>Build</Trigger>
          <NavigationMenu.Content className={CONTENT}>
            <div className="w-[38rem]">
              <ul className="grid grid-cols-2 gap-0.5">
                {BUILD.items.map((item) => (
                  <li key={item.href}>
                    <ItemLink item={item} />
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-surface-2 py-1.5 pr-1.5 pl-3.5 shadow-[0_0_0_1px_var(--line)]">
                <span className="shrink-0 font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase">Add to Claude</span>
                <code className="min-w-0 flex-1 truncate font-mono text-[12px] text-foreground">{MCP_INSTALL}</code>
                <CopyButton value={MCP_INSTALL} label="Copy MCP install command" />
              </div>
            </div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link asChild active={guideActive}>
            <Link href={GUIDE.href} className={TRIGGER} data-active={guideActive}>
              {GUIDE.label}
            </Link>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      <div className="absolute top-full -left-2 flex pt-3">
        <NavigationMenu.Viewport className="relative h-(--radix-navigation-menu-viewport-height) w-(--radix-navigation-menu-viewport-width) origin-top overflow-hidden rounded-2xl bg-surface/95 shadow-(--shadow-float) backdrop-blur-xl transition-[width,height] duration-300 ease-(--ease-out-quart) data-[state=closed]:animate-[nav-out_160ms_ease-in] data-[state=open]:animate-[nav-in_220ms_var(--ease-out-quart)] motion-reduce:animate-none motion-reduce:transition-none" />
      </div>
    </NavigationMenu.Root>
  );
}
