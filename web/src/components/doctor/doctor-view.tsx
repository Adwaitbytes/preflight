"use client";

import { CheckCircle2, ExternalLink } from "lucide-react";
import { Tabs } from "radix-ui";
import { ChainMeta } from "@/components/shared/chain-meta";
import { RefreshButton } from "@/components/shared/refresh-button";
import { ShareButton } from "@/components/shared/share-button";
import { Badge, VerdictBadge } from "@/components/ui/badge";
import { MonoValue } from "@/components/ui/mono-value";
import { NETWORK_LABEL, taostatsAccount, type NetworkId } from "@/lib/networks";
import { countBySeverity } from "@/lib/severity";
import type { Diagnosis, DoctorReport, Verdict } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FindingList } from "./finding-list";
import { NeuronHistory } from "./neuron-history";
import { NeuronStats } from "./neuron-stats";

const VERDICT_DOT: Record<Verdict, string> = { healthy: "bg-healthy", warning: "bg-medium", broken: "bg-critical" };

function subnetLabel(d: Diagnosis): string {
  return d.subnet_name ? `SN${d.netuid} ${d.subnet_name}` : `SN${d.netuid}`;
}

interface PanelProps {
  diagnosis: Diagnosis;
  showHeadline: boolean;
  network: NetworkId;
  live: boolean;
}

function DiagnosisPanel({ diagnosis, showHeadline, network, live }: PanelProps) {
  const counts = countBySeverity(diagnosis.findings);
  const issues = counts.critical + counts.high + counts.medium;
  return (
    <section aria-label={subnetLabel(diagnosis)} className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2 className="text-title font-semibold">{subnetLabel(diagnosis)}</h2>
        <VerdictBadge verdict={diagnosis.verdict} size="sm" />
        <Badge tone="neutral">{diagnosis.role === "unregistered" ? "Not registered" : diagnosis.role === "validator" ? "Validator" : "Miner"}</Badge>
        <span className="ml-auto text-xs text-faint">
          {diagnosis.rules_run} rules run, {issues === 0 ? "no issues" : `${issues} ${issues === 1 ? "issue" : "issues"}`}
          {counts.info > 0 && `, ${counts.info} info`}
        </span>
      </div>
      {showHeadline && <p className="max-w-[72ch] text-[15px] leading-7 text-pretty text-muted-foreground">{diagnosis.headline}</p>}
      <NeuronStats diagnosis={diagnosis} />
      {live && diagnosis.neuron && <NeuronHistory network={network} hotkey={diagnosis.hotkey} netuid={diagnosis.netuid} />}
      {diagnosis.findings.length > 0 ? (
        <FindingList findings={diagnosis.findings} block={diagnosis.chain.block} />
      ) : (
        <div className="panel flex items-center gap-3 px-5 py-4 text-sm text-muted-foreground">
          <CheckCircle2 className="size-4 shrink-0 text-healthy" aria-hidden />
          All {diagnosis.rules_run} rules passed on {subnetLabel(diagnosis)}
        </div>
      )}
    </section>
  );
}

/** `shared` renders a stored report: no live re-reads, no history fetch, no second share */
export function DoctorView({ report, network, shared = false }: { report: DoctorReport; network: NetworkId; shared?: boolean }) {
  const live = !shared;
  const explorer = taostatsAccount(network, report.hotkey);
  const multiple = report.diagnoses.length > 1;
  const first = report.diagnoses[0];

  return (
    <div className="flex flex-col">
      <header className="rise-in flex flex-col gap-6 pt-10 pb-10 sm:pt-14">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="eyebrow">Doctor · {NETWORK_LABEL[network]}</p>
          <span aria-hidden className="h-3 w-px bg-line-strong" />
          <div className="flex min-w-0 items-center gap-1 text-[13px] text-muted-foreground">
            <span className="text-faint">Hotkey</span>
            <MonoValue value={report.hotkey} label="hotkey" head={8} tail={8} fullFrom="lg" />
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div className="self-start">
            <VerdictBadge verdict={report.verdict} />
          </div>
          <h1 className={cn("max-w-[30ch] font-semibold text-balance", report.headline.length > 90 ? "text-[clamp(1.5rem,1.15rem+1.2vw,2rem)] leading-tight tracking-[-0.025em]" : "text-headline")}>
            {report.headline}
          </h1>
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
            {live && <ShareButton kind="doctor" payload={report} />}
            {live && <RefreshButton />}
          </div>
        </div>
      </header>

      {report.diagnoses.length === 0 && (
        <div className="panel px-5 py-8 text-center text-sm text-muted-foreground">This hotkey is not registered on any subnet at this block</div>
      )}

      {!multiple && first && <DiagnosisPanel diagnosis={first} showHeadline={first.headline !== report.headline} network={network} live={live} />}

      {multiple && first && (
        <Tabs.Root defaultValue={String(first.netuid)} className="flex flex-col gap-8">
          <Tabs.List
            aria-label="Subnets this hotkey is registered on"
            className="-mx-4 flex gap-1 overflow-x-auto border-b border-line px-4 [scrollbar-width:none] sm:mx-0 sm:px-0"
          >
            {report.diagnoses.map((d) => (
              <Tabs.Trigger
                key={d.netuid}
                value={String(d.netuid)}
                className={cn(
                  "relative -mb-px inline-flex shrink-0 cursor-pointer items-center gap-2 border-b-2 border-transparent px-3 pt-2 pb-3 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground",
                  "data-[state=active]:border-foreground data-[state=active]:font-semibold data-[state=active]:text-foreground",
                )}
              >
                <span aria-hidden className={cn("size-1.5 rounded-full", VERDICT_DOT[d.verdict])} />
                {subnetLabel(d)}
                <span className="sr-only">, {d.verdict}</span>
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          {report.diagnoses.map((d) => (
            <Tabs.Content key={d.netuid} value={String(d.netuid)} className="rounded-xl focus-visible:outline-offset-8">
              <DiagnosisPanel diagnosis={d} showHeadline={d.headline !== report.headline} network={network} live={live} />
            </Tabs.Content>
          ))}
        </Tabs.Root>
      )}
    </div>
  );
}
