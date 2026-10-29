"use client";

import { ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { track } from "@/lib/analytics";
import { NETWORK_LABEL, NETWORKS, type NetworkId } from "@/lib/networks";
import { cn } from "@/lib/utils";
import { useAppState } from "./app-state";

const ROUTE_WITH_NETWORK = /^\/(doctor|tx|fleet)\/(finney|test|local)(\/.*)$/;

export const NETWORK_DOT: Record<NetworkId, string> = { finney: "bg-healthy", test: "bg-medium", local: "bg-accent" };

export const NETWORK_TRIGGER_CLASS =
  "inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-[13px] font-medium text-muted-foreground shadow-[0_0_0_1px_var(--line)] transition-[background-color,color] hover:bg-surface-2 hover:text-foreground data-[state=open]:bg-surface-2";

/** Rewrites the network segment of the current route, so switching on a result page re-runs it */
export function useSwitchNetwork(): (next: NetworkId) => void {
  const { setNetwork } = useAppState();
  const pathname = usePathname();
  const router = useRouter();
  return (next) => {
    track("network", next);
    setNetwork(next);
    const match = ROUTE_WITH_NETWORK.exec(pathname);
    if (match) router.push(`/${match[1]}/${next}${match[3]}`);
  };
}

/** The network a result page is pinned to, else the one the user picked, and the ones they can switch to */
export function useNetworkChoice(): { current: NetworkId; options: NetworkId[] } {
  const { network, localAvailable } = useAppState();
  const pathname = usePathname();
  const routeNetwork = ROUTE_WITH_NETWORK.exec(pathname)?.[2] as NetworkId | undefined;
  const current = routeNetwork ?? network;
  return { current, options: NETWORKS.filter((n) => n !== "local" || localAvailable || current === "local") };
}

export function NetworkTriggerContent({ network }: { network: NetworkId }) {
  return (
    <>
      <span aria-hidden className={cn("size-1.5 rounded-full", NETWORK_DOT[network])} />
      {NETWORK_LABEL[network]}
      <ChevronDown className="size-3.5 text-faint" aria-hidden />
    </>
  );
}

export function networkTriggerLabel(network: NetworkId): string {
  return `Network: ${NETWORK_LABEL[network]}. Change network`;
}

/** Same markup as the menu trigger, painted on the server and until the menu code arrives */
function NetworkTriggerPlaceholder() {
  const { current } = useNetworkChoice();
  return (
    <button type="button" aria-haspopup="menu" aria-expanded={false} aria-label={networkTriggerLabel(current)} className={NETWORK_TRIGGER_CLASS}>
      <NetworkTriggerContent network={current} />
    </button>
  );
}

// The Radix menu loads after hydration so it stays out of the first paint
export const NetworkSwitch = dynamic(() => import("./network-menu").then((m) => m.NetworkMenu), {
  ssr: false,
  loading: NetworkTriggerPlaceholder,
});
