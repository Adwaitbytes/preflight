"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { DeltaBadge } from "@/components/shared/delta-badge";
import { useAppState } from "@/components/site/app-state";
import { useEpochPreview } from "@/components/epoch/use-epoch";
import { Skeleton } from "@/components/ui/skeleton";
import { countdown, epochDelta, epochHref } from "@/lib/epoch";
import { formatInt, formatShare } from "@/lib/format";
import type { NetworkId } from "@/lib/networks";

/** What the next epoch pays this miner, read after the diagnosis renders so it never delays it */
export function NextEpoch({ network, hotkey, netuid }: { network: NetworkId; hotkey: string; netuid: number }) {
  const { offline } = useAppState();
  const state = useEpochPreview(network, netuid, hotkey, null, offline, !offline);
  if (offline || state.status === "failed") return null;

  return (
    <section aria-labelledby="next-epoch-title" className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 id="next-epoch-title" className="text-xs font-medium text-muted-foreground">
            Next epoch
          </h3>
          <p className="text-xs text-faint">Computed from live weights before the chain runs it</p>
        </div>
        <Link href={epochHref(network, netuid, hotkey)} className="inline-flex items-center gap-1 rounded-md text-xs font-medium text-accent-ink hover:underline">
          Open in Epoch Lab
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </div>
      {state.status === "loading" ? (
        <div className="panel flex flex-col gap-3 p-4 sm:p-5" aria-busy>
          <span className="sr-only" role="status">
            Computing the next epoch
          </span>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
        </div>
      ) : (
        (() => {
          const p = state.data;
          const focus = p.focus;
          return (
            <div className="panel flex flex-col gap-3 p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                {focus && <DeltaBadge delta={epochDelta(focus)} />}
                {focus && (
                  <p className="font-mono text-[15px] tnum">
                    <span className="text-faint">{formatShare(focus.incentive_now, 3)}</span>
                    <span className="mx-2 text-faint">→</span>
                    <span className="font-semibold">{formatShare(focus.incentive_next, 3)}</span>
                  </p>
                )}
                <span className="text-xs text-faint tnum">{countdown(p.seconds_until)}, block {formatInt(p.epoch_block)}</span>
              </div>
              <p className="text-sm leading-6 text-pretty text-muted-foreground">{focus ? focus.reason : p.headline}</p>
            </div>
          );
        })()
      )}
    </section>
  );
}
