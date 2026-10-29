import { ArrowUpRight, BookOpen, GitBranch, Globe } from "lucide-react";
import { ChainMeta } from "@/components/shared/chain-meta";
import { HyperparamTable } from "@/components/shared/hyperparam-table";
import { Badge } from "@/components/ui/badge";
import { MonoValue } from "@/components/ui/mono-value";
import { formatAmount, formatDuration, formatShare } from "@/lib/format";
import { taostatsSubnet } from "@/lib/networks";
import type { SubnetDetail } from "@/lib/types";
import { cn } from "@/lib/utils";
import { capabilityLabel, hasPublicApi } from "./capabilities";
import { BAND_LABEL, bandText, HealthRing } from "./health-ring";
import { subnetName } from "./subnet-card";
import { MineLink } from "./mine-link";
import { TryIt } from "./try-it";

function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="min-w-0 bg-surface px-4 py-3.5">
      <dt className="text-xs text-faint">{label}</dt>
      <dd className="mt-1 truncate font-mono text-[15px] font-medium text-foreground">{value}</dd>
      {hint && <dd className="mt-0.5 truncate text-xs text-faint">{hint}</dd>}
    </div>
  );
}

/** Factor scores arrive as 0..1; bars and colour bands work in whole percent */
const factorPercent = (score: number) => Math.max(0, Math.min(100, Math.round(score * 100)));
const FACTOR_BAR = (pct: number) => (pct >= 75 ? "bg-healthy" : pct >= 50 ? "bg-medium" : "bg-critical");

export function SubnetDetailView({ detail, network }: { detail: SubnetDetail; network: string }) {
  const { card, hyperparams, chain } = detail;
  const { catalog, live, health } = card;
  const name = subnetName(card);
  const explorer = taostatsSubnet(network, card.netuid);
  const links = [
    catalog?.website && { href: catalog.website, label: hostOf(catalog.website), icon: Globe },
    catalog?.github && { href: catalog.github, label: "GitHub", icon: GitBranch },
    catalog?.docs && { href: catalog.docs, label: "Docs", icon: BookOpen },
    explorer && { href: explorer, label: "Taostats", icon: ArrowUpRight },
  ].filter((l): l is { href: string; label: string; icon: typeof Globe } => !!l);

  return (
    <div className="flex flex-col gap-8">
      <header className="rise-in flex flex-col gap-6 pt-10 sm:pt-14">
        <p className="eyebrow">Subnet {card.netuid}</p>
        <div className="flex items-start gap-5">
          <div className="min-w-0 flex-1">
            <h1 className="text-[clamp(2.5rem,1.8rem+3vw,4rem)] leading-[1.02] font-light tracking-[-0.05em] text-balance">{name}</h1>
            <p className="mt-3 max-w-[64ch] text-[15px] leading-7 text-pretty text-muted-foreground">
              {catalog?.summary ?? "This subnet has no curated catalog entry yet. The numbers below are read live from chain"}
            </p>
            {catalog?.operator && <p className="mt-2 text-[13px] text-faint">Run by {catalog.operator}</p>}
          </div>
          <div className="hidden sm:block">
            <HealthRing health={health} size={96} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {catalog?.capabilities.map((cap) => (
            <Badge key={cap} tone="neutral">
              {capabilityLabel(cap)}
            </Badge>
          ))}
          {live && <Badge tone={live.registration_allowed ? "healthy" : "critical"}>{live.registration_allowed ? "Registration open" : "Registration closed"}</Badge>}
          <MineLink netuid={card.netuid} network={network} />
          {catalog?.api_example && <TryIt name={name} example={catalog.api_example} needsKey={!!catalog.api_needs_key} />}
        </div>
        {links.length > 0 && (
          <nav aria-label={`${name} links`} className="flex flex-wrap gap-x-5 gap-y-2 text-[13px]">
            {links.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded text-muted-foreground hover:text-foreground">
                <link.icon className="size-3.5" aria-hidden />
                {link.label}
              </a>
            ))}
          </nav>
        )}
        <ChainMeta chain={chain} />
      </header>

      {live && (
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-line shadow-[0_0_0_1px_var(--line)] sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Miners" value={String(live.miners)} hint={`of ${live.max_uids} seats`} />
          <Stat label="Validators" value={String(live.validators)} />
          <Stat label="Register cost" value={`${formatAmount(live.registration_cost_tao)} TAO`} hint="burned" />
          <Stat label="Tempo" value={String(live.tempo)} hint={`about ${formatDuration(live.tempo)}`} />
          <Stat label="Alpha price" value={live.price_tao != null ? `${formatAmount(live.price_tao)} TAO` : "n/a"} hint={live.symbol ?? undefined} />
          <Stat label="Emission share" value={live.emission_share != null ? formatShare(live.emission_share, 2) : "n/a"} />
        </dl>
      )}
      {live?.owner_coldkey && (
        <p className="-mt-4 flex min-w-0 items-center gap-1.5 text-xs text-faint">
          Owner coldkey
          <MonoValue value={live.owner_coldkey} label="owner coldkey" className="text-muted-foreground" />
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] *:min-w-0">
        <section aria-labelledby="health" className="panel flex flex-col gap-5 p-5">
          <div className="flex items-center gap-4">
            <div className="sm:hidden">
              <HealthRing health={health} size={56} />
            </div>
            <div>
              <h2 id="health" className="text-sm font-semibold">
                Health signals
              </h2>
              {health ? (
                <p className="mt-1 text-[13px] text-muted-foreground">
                  Score {Math.round(health.score)} of 100, <span className={cn("font-medium", bandText(health.band))}>{BAND_LABEL[health.band]}</span>
                </p>
              ) : (
                <p className="mt-1 text-[13px] text-muted-foreground">No score for this subnet yet</p>
              )}
            </div>
          </div>
          {health && (
            <ul className="flex flex-col gap-4">
              {health.factors.map((f) => {
                const pct = factorPercent(f.score);
                return (
                  <li key={f.id} className="flex flex-col gap-1.5">
                    <div className="flex items-baseline justify-between gap-3 text-[13px]">
                      <span className="font-medium text-foreground">{f.label}</span>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">{f.value}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-3" role="img" aria-label={`${f.label}: ${pct} of 100`}>
                      <div className={cn("h-full rounded-full", FACTOR_BAR(pct))} style={{ width: `${Math.max(2, pct)}%` }} />
                    </div>
                    <p className="text-xs leading-5 text-faint">{f.explanation}</p>
                  </li>
                );
              })}
            </ul>
          )}
          {catalog && catalog.sources.length > 0 && (
            <div className="border-t border-line pt-4">
              <h3 className="text-xs font-medium text-faint">Catalog sources</h3>
              <ul className="mt-2 flex flex-col gap-1">
                {catalog.sources.map((src) => (
                  <li key={src} className="min-w-0 truncate">
                    <a href={src} target="_blank" rel="noreferrer" className="rounded font-mono text-xs text-muted-foreground hover:text-foreground">
                      {src.replace(/^https?:\/\//, "")}
                    </a>
                  </li>
                ))}
              </ul>
              {!hasPublicApi(catalog.api) && <p className="mt-3 text-xs text-faint">No public API found in these sources</p>}
            </div>
          )}
        </section>

        <HyperparamTable params={hyperparams} caption="Hyperparameters" />
      </div>
    </div>
  );
}
