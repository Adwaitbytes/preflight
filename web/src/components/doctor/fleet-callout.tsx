import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { pluralize } from "@/lib/format";
import type { NetworkId } from "@/lib/networks";

interface FleetCalloutProps {
  /** `owned_hotkeys` from the Doctor report: set only when the pasted address is a coldkey */
  ownedHotkeys: number | null | undefined;
  /** The address the Doctor was asked about, which is the coldkey */
  address: string;
  network: NetworkId;
}

/** A pasted coldkey has no seat of its own; this points at the view that checks all of its hotkeys */
export function FleetCallout({ ownedHotkeys, address, network }: FleetCalloutProps) {
  if (ownedHotkeys == null) return null;
  const owns = ownedHotkeys > 0;
  return (
    <section aria-label="Coldkey" className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-balance">
          This is a coldkey that owns {owns ? pluralize(ownedHotkeys, "hotkey") : "no hotkeys"}
        </h2>
        <p className="mt-1.5 max-w-[62ch] text-sm leading-6 text-pretty text-muted-foreground">
          {owns
            ? "A coldkey holds no seat itself. The fleet view checks every hotkey it owns, on every subnet, worst first"
            : "A coldkey holds no seat itself, and no hotkey names this one as its owner. Paste a hotkey to diagnose a seat"}
        </p>
      </div>
      {owns && (
        <Button asChild variant="primary" className="self-start sm:self-auto">
          <Link href={`/fleet/${network}/${encodeURIComponent(address)}`}>
            {ownedHotkeys === 1 ? "Check its hotkey" : `Check all ${ownedHotkeys} hotkeys`}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </Button>
      )}
    </section>
  );
}
