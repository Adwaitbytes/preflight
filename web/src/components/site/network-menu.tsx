"use client";

import { Check } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { NETWORK_LABEL } from "@/lib/networks";
import { cn } from "@/lib/utils";
import { useAppState } from "./app-state";
import { NETWORK_DOT, NETWORK_TRIGGER_CLASS, NetworkTriggerContent, networkTriggerLabel, useNetworkChoice, useSwitchNetwork } from "./network-switch";

export function NetworkMenu() {
  const { localAvailable } = useAppState();
  const { current, options } = useNetworkChoice();
  const switchNetwork = useSwitchNetwork();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className={NETWORK_TRIGGER_CLASS} aria-label={networkTriggerLabel(current)}>
        <NetworkTriggerContent network={current} />
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
              <span aria-hidden className={cn("size-1.5 rounded-full", NETWORK_DOT[n])} />
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
