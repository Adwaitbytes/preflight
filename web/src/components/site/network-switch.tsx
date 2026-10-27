"use client";

import { Check, ChevronDown } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { usePathname, useRouter } from "next/navigation";
import { NETWORK_LABEL, NETWORKS, type NetworkId } from "@/lib/networks";
import { cn } from "@/lib/utils";
import { useAppState } from "./app-state";

const ROUTE_WITH_NETWORK = /^\/(doctor|tx)\/(finney|test|local)(\/.*)$/;

const DOT: Record<NetworkId, string> = { finney: "bg-healthy", test: "bg-medium", local: "bg-accent" };

/** Rewrites the network segment of the current route, so switching on a result page re-runs it */
export function useSwitchNetwork(): (next: NetworkId) => void {
  const { setNetwork } = useAppState();
  const pathname = usePathname();
  const router = useRouter();
  return (next) => {
    setNetwork(next);
    const match = ROUTE_WITH_NETWORK.exec(pathname);
    if (match) router.push(`/${match[1]}/${next}${match[3]}`);
  };
}

export function NetworkSwitch() {
  const { network, localAvailable } = useAppState();
  const pathname = usePathname();
  const switchNetwork = useSwitchNetwork();
  const routeNetwork = ROUTE_WITH_NETWORK.exec(pathname)?.[2] as NetworkId | undefined;
  const current = routeNetwork ?? network;
  const options = NETWORKS.filter((n) => n !== "local" || localAvailable || current === "local");

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-[13px] font-medium text-muted-foreground shadow-[0_0_0_1px_var(--line)] transition-colors hover:bg-surface-2 hover:text-foreground data-[state=open]:bg-surface-2"
        aria-label={`Network: ${NETWORK_LABEL[current]}. Change network`}
      >
        <span aria-hidden className={cn("size-1.5 rounded-full", DOT[current])} />
        {NETWORK_LABEL[current]}
        <ChevronDown className="size-3.5 text-faint" aria-hidden />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-48 rounded-xl bg-surface p-1 shadow-(--shadow-float) data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <DropdownMenu.Label className="px-2.5 pt-1.5 pb-1 text-2xs font-medium text-faint uppercase tracking-[0.08em]">Network</DropdownMenu.Label>
          {options.map((n) => (
            <DropdownMenu.Item
              key={n}
              onSelect={() => switchNetwork(n)}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm outline-none data-highlighted:bg-surface-2"
            >
              <span aria-hidden className={cn("size-1.5 rounded-full", DOT[n])} />
              <span className="flex-1">{NETWORK_LABEL[n]}</span>
              {n === current && <Check className="size-3.5 text-muted-foreground" aria-hidden />}
            </DropdownMenu.Item>
          ))}
          {localAvailable === false && (
            <p className="px-2.5 pt-1.5 pb-2 text-xs leading-5 text-faint">
              Run <code className="font-mono text-muted-foreground">preflight serve</code> to add Local
            </p>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
