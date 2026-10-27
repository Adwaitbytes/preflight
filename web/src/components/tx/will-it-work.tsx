"use client";

import { ArrowRight, PlaneTakeoff } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Badge, VerdictBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { API_ERROR_TITLE, type ApiResult } from "@/lib/api";
import { recheck } from "@/lib/client-calls";
import { formatInt } from "@/lib/format";
import type { NetworkId } from "@/lib/networks";
import type { DoctorReport } from "@/lib/types";

/** Re-runs the Doctor at the current head for this transaction's hotkey and subnet */
export function WillItWork({ network, hotkey, netuid }: { network: NetworkId; hotkey: string; netuid: number | null }) {
  const [result, setResult] = useState<ApiResult<DoctorReport> | null>(null);
  const [pending, startTransition] = useTransition();
  const doctorHref = `/doctor/${network}/${hotkey}${netuid != null ? `?netuid=${netuid}` : ""}`;

  return (
    <div className="flex flex-col gap-3">
      <Button
        variant="accent"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setResult(await recheck(network, hotkey, netuid));
          })
        }
        className="self-start"
      >
        <PlaneTakeoff aria-hidden />
        {pending ? "Checking the current head" : "Will it work now"}
      </Button>
      <div aria-live="polite">
        {result?.ok && (
          <div className="rise-in flex flex-col gap-3 rounded-xl bg-surface-2 p-4 shadow-[0_0_0_1px_var(--line)]">
            <div className="flex flex-wrap items-center gap-2">
              <VerdictBadge verdict={result.data.verdict} size="sm" />
              <span className="text-xs text-faint">at block {formatInt(result.data.chain.block)}</span>
            </div>
            <p className="text-sm leading-6 text-foreground">
              {result.data.verdict === "healthy"
                ? "Nothing on chain blocks this hotkey right now. A retry should go through if the arguments are fixed"
                : result.data.headline}
            </p>
            <Link
              href={doctorHref}
              className="inline-flex items-center gap-1.5 self-start rounded text-[13px] font-medium text-accent-ink hover:underline hover:underline-offset-4"
            >
              Open the full diagnosis
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        )}
        {result && !result.ok && (
          <div className="rise-in flex flex-col gap-1 rounded-xl bg-surface-2 p-4 text-sm shadow-[0_0_0_1px_var(--line)]">
            <Badge tone={result.error.kind === "offline_miss" ? "medium" : "critical"} className="self-start">
              {API_ERROR_TITLE[result.error.kind]}
            </Badge>
            <p className="mt-1 text-muted-foreground">{result.error.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
