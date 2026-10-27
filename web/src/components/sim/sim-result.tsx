import { Check, CheckCircle2, Cpu, FlaskConical, Minus, X, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { ChainMeta } from "@/components/shared/chain-meta";
import { FixBlock } from "@/components/shared/fix-block";
import { RichText } from "@/components/shared/rich-text";
import { SourceLink } from "@/components/shared/source-link";
import { MonoValue } from "@/components/ui/mono-value";
import { formatTaoFee, normalizeTaoText } from "@/lib/tao";
import type { Evidence, SimResult } from "@/lib/types";
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

type CheckStatus = "pass" | "fail" | "info";

/** The engine prefixes each ported pallet check with "pass: " or "fail: " (core/sim/rules.py) */
export function parseCheck(check: Evidence): { status: CheckStatus; detail: string } {
  const match = /^(pass|fail):\s*(.*)$/s.exec(check.value);
  if (!match) return { status: "info", detail: check.value };
  return { status: match[1] === "pass" ? "pass" : "fail", detail: match[2] ?? "" };
}

const CHECK_ICON = {
  pass: <Check className="size-3.5" aria-hidden />,
  fail: <X className="size-3.5" aria-hidden />,
  info: <Minus className="size-3.5" aria-hidden />,
};

function CheckList({ checks }: { checks: Evidence[] }) {
  const parsed = checks.map((c) => ({ check: c, ...parseCheck(c) }));
  const failed = parsed.filter((p) => p.status === "fail").length;
  const passed = parsed.filter((p) => p.status === "pass").length;
  return (
    <section className="flex flex-col gap-3" aria-labelledby="checks-heading">
      <div className="flex items-baseline justify-between gap-3">
        <h3 id="checks-heading" className="text-sm font-semibold text-foreground">
          Runtime checks
        </h3>
        {passed + failed > 0 && (
          <p className="text-xs text-faint">
            {passed} passed{failed > 0 && <span className="text-critical">, {failed} failed</span>}
          </p>
        )}
      </div>
      <ol className="flex flex-col divide-y divide-line overflow-hidden rounded-xl shadow-[0_0_0_1px_var(--line)]">
        {parsed.map(({ check, status, detail }) => (
          <li key={check.label} className={cn("flex gap-3 px-3.5 py-3", status === "fail" && "bg-critical-soft")}>
            <span
              className={cn(
                "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                status === "pass" && "bg-healthy-soft text-healthy",
                status === "fail" && "bg-critical text-background",
                status === "info" && "bg-surface-3 text-faint",
              )}
            >
              {CHECK_ICON[status]}
              <span className="sr-only">{status === "info" ? "read" : status === "pass" ? "passed" : "failed"}</span>
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn("text-[13px] font-medium", status === "fail" ? "text-critical" : "text-foreground")}>{check.label}</p>
              <p className="mt-0.5 font-mono text-[12.5px] break-words text-muted-foreground">
                {SS58.test(detail) ? <MonoValue value={detail} label={check.label} /> : normalizeTaoText(detail)}
              </p>
              {check.source && (
                <p className="mt-1 flex min-w-0 text-[11px] text-faint">
                  <SourceLink source={check.source} />
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ModeBanner({ result }: { result: SimResult }) {
  const fork = result.mode === "fork";
  const Icon = fork ? Cpu : FlaskConical;
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl px-4 py-3",
        fork ? "bg-accent-soft shadow-[inset_2px_0_0_var(--accent)]" : "bg-surface-2 shadow-[inset_2px_0_0_var(--line-strong)]",
      )}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", fork ? "text-accent-ink" : "text-muted-foreground")} aria-hidden />
      <div className="min-w-0">
        <p className={cn("eyebrow", fork && "text-accent-ink")}>{fork ? "Executed, real runtime" : "Predicted, not executed"}</p>
        <p className="mt-1 text-[15px] leading-6 font-medium text-pretty text-foreground">
          <RichText text={result.mode_label} />
        </p>
      </div>
    </div>
  );
}

export function SimResultView({ result, actions }: { result: SimResult; actions?: ReactNode }) {
  const ok = result.would_succeed;
  const Icon = ok ? CheckCircle2 : XCircle;
  const changes = result.balance_changes ?? [];
  const checks = result.checks ?? [];
  const overrides = result.overrides ?? [];
  return (
    <div className="panel rise-in flex flex-col gap-6 p-5 sm:p-6">
      <ModeBanner result={result} />
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
          <p className="font-mono text-sm text-foreground">{formatTaoFee(result.fee_tao)}</p>
        </div>
      </div>

      {result.explanation && (
        <div className="flex flex-col gap-3">
          <p className="text-[15px] font-medium text-foreground">{result.explanation.title}</p>
          <p className="max-w-[70ch] text-sm leading-6 text-pretty text-muted-foreground">
            <RichText text={normalizeTaoText(result.explanation.explanation)} />
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
                <span className="min-w-0 break-words">{normalizeTaoText(effect)}</span>
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

      {checks.length > 0 && <CheckList checks={checks} />}

      {overrides.length > 0 && (
        <Section title="Storage overrides on the fork">
          <ul className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
            {overrides.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </Section>
      )}

      <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
        <ChainMeta chain={result.chain} elapsedMs={result.elapsed_ms} />
        {actions && <div className="flex min-w-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
