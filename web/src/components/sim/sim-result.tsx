import { CheckCircle2, Cpu, FlaskConical, XCircle } from "lucide-react";
import { ChainMeta } from "@/components/shared/chain-meta";
import { FixBlock } from "@/components/shared/fix-block";
import { RichText } from "@/components/shared/rich-text";
import { Badge } from "@/components/ui/badge";
import { MonoValue } from "@/components/ui/mono-value";
import { formatTao } from "@/lib/format";
import type { SimResult } from "@/lib/types";
import { cn } from "@/lib/utils";

const SS58 = /^5[1-9A-HJ-NP-Za-km-z]{46,47}$/;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-xs font-medium text-faint">{title}</h3>
      {children}
    </section>
  );
}

export function SimResultView({ result }: { result: SimResult }) {
  const ok = result.would_succeed;
  const Icon = ok ? CheckCircle2 : XCircle;
  const changes = result.balance_changes ?? [];
  const checks = result.checks ?? [];
  const overrides = result.overrides ?? [];
  return (
    <div className="panel rise-in flex flex-col gap-6 p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={result.mode === "fork" ? "accent" : "neutral"} size="md">
          {result.mode === "fork" ? <Cpu className="size-3.5" aria-hidden /> : <FlaskConical className="size-3.5" aria-hidden />}
          {result.mode_label}
        </Badge>
      </div>
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-1 size-6 shrink-0", ok ? "text-healthy" : "text-critical")} aria-hidden />
        <div className="min-w-0">
          <h2 className="text-title font-semibold">{ok ? "Would succeed" : "Would fail"}</h2>
          {result.failure && (
            <p className="mt-1 font-mono text-[13px] break-words text-critical">
              {result.failure.pallet}.{result.failure.error}
            </p>
          )}
        </div>
        <div className="ml-auto shrink-0 text-right">
          <p className="text-xs text-faint">Fee</p>
          <p className="font-mono text-sm text-foreground">{result.fee_tao == null ? "n/a" : formatTao(result.fee_tao)}</p>
        </div>
      </div>

      {result.explanation && (
        <div className="flex flex-col gap-3">
          <p className="text-[15px] font-medium text-foreground">{result.explanation.title}</p>
          <p className="max-w-[70ch] text-sm leading-6 text-pretty text-muted-foreground">
            <RichText text={result.explanation.explanation} />
          </p>
          {result.explanation.fix && <FixBlock fix={result.explanation.fix} />}
        </div>
      )}

      {result.effects.length > 0 && (
        <Section title="Effects">
          <ul className="flex flex-col gap-1.5 text-sm text-foreground">
            {result.effects.map((effect) => (
              <li key={effect} className="flex gap-2.5">
                <span aria-hidden className="mt-2.5 size-1 shrink-0 rounded-full bg-faint" />
                {effect}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {changes.length > 0 && (
        <Section title="Balance changes">
          <div className="overflow-x-auto rounded-xl shadow-[0_0_0_1px_var(--line)]">
            <table className="w-full min-w-[480px] text-left text-[13px]">
              <thead className="bg-surface-2 text-xs text-faint">
                <tr>
                  <th scope="col" className="px-3.5 py-2 font-medium">Account</th>
                  <th scope="col" className="px-3.5 py-2 text-right font-medium">Before</th>
                  <th scope="col" className="px-3.5 py-2 text-right font-medium">After</th>
                  <th scope="col" className="px-3.5 py-2 text-right font-medium">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {changes.map((c) => (
                  <tr key={`${c.account}-${c.label}`}>
                    <th scope="row" className="px-3.5 py-2.5 font-normal">
                      <span className="block text-foreground">{c.label}</span>
                      <MonoValue value={c.account} label="account" className="text-xs text-faint" copy={false} />
                    </th>
                    <td className="px-3.5 py-2.5 text-right font-mono text-muted-foreground">{c.before}</td>
                    <td className="px-3.5 py-2.5 text-right font-mono text-foreground">{c.after}</td>
                    <td className={cn("px-3.5 py-2.5 text-right font-mono", c.delta.startsWith("-") ? "text-critical" : "text-healthy")}>{c.delta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {checks.length > 0 && (
        <Section title="What was checked">
          <dl className="divide-y divide-line overflow-hidden rounded-xl shadow-[0_0_0_1px_var(--line)]">
            {checks.map((check) => (
              <div key={check.label} className="grid gap-1 px-3.5 py-2.5 text-[13px] sm:grid-cols-[1fr_auto] sm:gap-4">
                <dt className="text-muted-foreground">
                  {check.label}
                  {check.source && <span className="mt-0.5 block font-mono text-[11.5px] text-faint">{check.source}</span>}
                </dt>
                <dd className="font-mono text-foreground sm:text-right">{SS58.test(check.value) ? <MonoValue value={check.value} label={check.label} /> : check.value}</dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      {overrides.length > 0 && (
        <Section title="Storage overrides on the fork">
          <ul className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
            {overrides.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </Section>
      )}

      <div className="border-t border-line pt-4">
        <ChainMeta chain={result.chain} elapsedMs={result.elapsed_ms} />
      </div>
    </div>
  );
}
