import { ExternalLink, Info } from "lucide-react";
import { ChainMeta } from "@/components/shared/chain-meta";
import { RefreshButton } from "@/components/shared/refresh-button";
import { MonoValue } from "@/components/ui/mono-value";
import { formatInt } from "@/lib/format";
import { countVerdicts, partitionFleet } from "@/lib/fleet";
import { formatPerDay, splitHeadline } from "@/lib/insights-format";
import { NETWORK_LABEL, taostatsAccount, type NetworkId } from "@/lib/networks";
import type { FleetReport } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FleetTable } from "./fleet-table";

type TileTone = "critical" | "medium" | "healthy";

const TONE_TEXT: Record<TileTone, string> = { critical: "text-critical", medium: "text-medium", healthy: "text-healthy" };
const TONE_DOT: Record<TileTone, string> = { critical: "bg-critical", medium: "bg-medium", healthy: "bg-healthy" };

function Tile({ label, value, unit, hint, tone, className }: { label: string; value: number | string; unit?: string; hint?: string; tone?: TileTone; className?: string }) {
  const lit = tone && value !== 0;
  return (
    <div className={cn("min-w-0 bg-surface px-4 py-3.5 sm:px-5 sm:py-4", className)}>
      <dt className="flex items-center gap-1.5 text-xs text-faint">
        {tone && <span aria-hidden className={cn("size-1.5 rounded-full", lit ? TONE_DOT[tone] : "bg-faint/50")} />}
        {label}
      </dt>
      <dd className={cn("mt-1.5 font-mono text-2xl leading-none font-semibold tracking-[-0.03em] tnum", lit ? TONE_TEXT[tone] : "text-foreground")}>
        {value}
        {unit && <span className="ml-1.5 font-sans text-[13px] font-medium tracking-normal text-faint">{unit}</span>}
      </dd>
      {hint && <dd className="mt-1.5 truncate text-xs text-faint">{hint}</dd>}
    </div>
  );
}

export function FleetView({ report, network }: { report: FleetReport; network: NetworkId }) {
  const { lead, rest } = splitHeadline(report.headline);
  const { seats, unregistered } = partitionFleet(report.rows);
  const counts = countVerdicts(seats);
  const explorer = taostatsAccount(network, report.coldkey);
  const partial = report.checked < report.hotkeys;

  return (
    <div className="flex flex-col">
      <header className="rise-in flex flex-col gap-6 pt-10 pb-10 sm:pt-14">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="eyebrow">Fleet · {NETWORK_LABEL[network]}</p>
          <span aria-hidden className="h-3 w-px bg-line-strong" />
          <div className="flex min-w-0 items-center gap-1 text-[13px] text-muted-foreground">
            <span className="text-faint">Coldkey</span>
            <MonoValue value={report.coldkey} label="coldkey" head={8} tail={8} fullFrom="lg" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <h1 className="max-w-[24ch] text-[clamp(2rem,1.5rem+2.2vw,3.25rem)] leading-[1.06] font-light tracking-[-0.045em] text-balance">{lead}</h1>
          {rest && <p className="max-w-[68ch] text-[17px] leading-7 text-pretty text-muted-foreground">{rest}</p>}
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <ChainMeta chain={report.chain} elapsedMs={report.elapsed_ms} />
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {explorer && (
              <a
                href={explorer}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                Taostats
                <ExternalLink className="size-3.5" aria-hidden />
              </a>
            )}
            <RefreshButton />
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-line shadow-[0_0_0_1px_var(--line)] sm:grid-cols-5">
            <Tile
              label="Seats"
              value={seats.length}
              hint={unregistered.length ? `${formatInt(unregistered.length)} more hotkeys hold no seat` : `${formatInt(report.checked)} hotkeys`}
            />
            <Tile label="Broken" value={counts.broken} tone="critical" />
            <Tile label="To watch" value={counts.warning} tone="medium" />
            <Tile label="Healthy" value={counts.healthy} tone="healthy" />
            <Tile
              label="TAO a day"
              value={formatPerDay(report.tao_per_day)}
              unit="TAO"
              hint="Today, at today's alpha prices"
              className="col-span-2 sm:col-span-1"
            />
          </dl>
          {partial && (
            <p className="flex items-start gap-2.5 rounded-xl bg-medium-soft px-4 py-3 text-[13px] leading-5 text-foreground shadow-[0_0_0_1px_color-mix(in_oklab,var(--medium)_24%,transparent)]">
              <Info className="mt-0.5 size-4 shrink-0 text-medium" aria-hidden />
              <span>
                First {formatInt(report.checked)} of {formatInt(report.hotkeys)} hotkeys checked. The rest are not in this report, so the totals above leave them
                out
              </span>
            </p>
          )}
        </div>
        <FleetTable rows={report.rows} network={network} />
      </div>
    </div>
  );
}
