import { formatAmount, formatInt, formatRatio } from "@/lib/format";
import type { Diagnosis } from "@/lib/types";
import { cn } from "@/lib/utils";

function Stat({ label, value, hint, tone, wrap }: { label: string; value: string; hint?: string; tone?: "zero" | "good"; wrap?: boolean }) {
  return (
    <div className={cn("min-w-0 bg-surface px-4 py-3.5", wrap && "col-span-2 lg:col-span-1")}>
      <dt className="text-xs text-faint">{label}</dt>
      <dd className={cn("mt-1 font-mono text-[15px] font-medium tracking-tight", wrap ? "text-[13px] leading-5 break-all" : "truncate", tone === "zero" ? "text-critical" : "text-foreground")}>{value}</dd>
      {hint && <dd className="mt-0.5 truncate text-xs text-faint">{hint}</dd>}
    </div>
  );
}

export function NeuronStats({ diagnosis }: { diagnosis: Diagnosis }) {
  const n = diagnosis.neuron;
  if (!n) {
    return (
      <div className="rounded-xl bg-surface-2 px-4 py-3.5 text-sm text-muted-foreground shadow-[0_0_0_1px_var(--line)]">
        No UID on SN{diagnosis.netuid} at block {formatInt(diagnosis.chain.block)}, so there are no neuron stats to show
      </div>
    );
  }
  const axon = n.axon && n.axon.ip && n.axon.ip !== "0.0.0.0" ? `${n.axon.ip}:${n.axon.port}` : "Not served";
  const isValidator = n.validator_permit;
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-line shadow-[0_0_0_1px_var(--line)] sm:grid-cols-4 lg:grid-cols-7">
      <Stat label="UID" value={String(n.uid)} hint={`since block ${formatInt(n.block_at_registration)}`} />
      <Stat label="Role" value={isValidator ? "Validator" : "Miner"} hint={isValidator ? "permit held" : "no permit"} />
      <Stat label="Stake" value={formatAmount(n.stake)} hint="alpha" />
      <Stat
        label={isValidator ? "Dividends" : "Incentive"}
        value={formatRatio(isValidator ? n.dividends : n.incentive)}
        tone={(isValidator ? n.dividends : n.incentive) === 0 ? "zero" : "good"}
      />
      <Stat label="Trust" value={formatRatio(n.trust)} />
      <Stat label="Emission" value={formatAmount(n.emission)} hint="alpha per tempo" tone={n.emission === 0 ? "zero" : "good"} />
      <Stat label="Axon" wrap value={axon} hint={n.axon?.ip_type ? `IPv${n.axon.ip_type}` : undefined} />
    </dl>
  );
}
