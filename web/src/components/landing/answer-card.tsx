import { ArrowRight, Stethoscope } from "lucide-react";
import Link from "next/link";
import { Badge, SeverityBadge, VerdictBadge } from "@/components/ui/badge";
import { formatInt, truncateMiddle } from "@/lib/format";
import { sortFindings } from "@/lib/severity";
import type { DoctorReport } from "@/lib/types";

/** The hero's answer to its own question: one recorded Doctor read, shown the way the Doctor shows it */
export function AnswerCard({ report }: { report: DoctorReport }) {
  const diagnosis = report.diagnoses[0];
  if (!diagnosis) return null;
  const finding = sortFindings(diagnosis.findings)[0];
  const role = diagnosis.role === "validator" ? "Validator" : diagnosis.role === "unregistered" ? "Not registered" : "Miner";
  const href = `/doctor/${report.chain.network}/${report.hotkey}?netuid=${diagnosis.netuid}`;

  return (
    <article aria-labelledby="answer-headline" className="answer-in relative min-w-0 rounded-2xl bg-surface shadow-(--shadow-float)">
      <header className="flex items-center gap-2.5 border-b border-line px-5 py-3.5">
        <span className="grid size-6 shrink-0 place-items-center rounded-md bg-surface-2 shadow-[0_0_0_1px_var(--line)]">
          <Stethoscope className="size-3.5" aria-hidden />
        </span>
        <span className="text-[13px] font-medium">Doctor</span>
        <span className="min-w-0 truncate font-mono text-xs text-faint">{truncateMiddle(report.hotkey, 6, 4)}</span>
        <span className="ml-auto shrink-0 font-mono text-xs text-faint">block {formatInt(report.chain.block)}</span>
      </header>

      <div className="px-5 pt-5">
        <div className="flex flex-wrap items-center gap-2">
          <VerdictBadge verdict={diagnosis.verdict} size="sm" />
          <Badge>
            SN{diagnosis.netuid} {diagnosis.subnet_name}
          </Badge>
          <Badge>{role}</Badge>
        </div>
        <p id="answer-headline" className="mt-4 text-title font-semibold text-pretty">
          {report.headline}
        </p>
      </div>

      {finding && (
        <div className="mx-5 mt-5 rounded-xl bg-background/60 p-4 shadow-[inset_0_0_0_1px_var(--line)]">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={finding.severity} />
            <span className="font-mono text-xs text-faint">{finding.id}</span>
          </div>
          <p className="mt-2.5 text-sm font-medium">{finding.title}</p>
          <dl className="mt-3 flex flex-col gap-1.5 text-[13px]">
            {finding.evidence.slice(0, 1).map((e) => (
              <div key={e.label} className="flex justify-between gap-4">
                <dt className="shrink-0 text-muted-foreground">{e.label}</dt>
                <dd className="min-w-0 truncate text-right font-mono text-xs leading-5 text-foreground">{e.value}</dd>
              </div>
            ))}
          </dl>
          {finding.fix && (
            <p className="mt-3 border-t border-line pt-3 text-[13px] leading-5 text-muted-foreground">
              <span className="font-medium text-foreground">Next step </span>
              {finding.fix.text}
            </p>
          )}
        </div>
      )}

      <footer className="mt-4 flex items-center justify-between gap-3 border-t border-line px-5 py-3">
        <span className="text-xs text-faint">
          {diagnosis.rules_run} rules, {(report.elapsed_ms / 1000).toFixed(1)} s, read only
        </span>
        <Link
          href={href}
          className="group/open -mr-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] font-medium text-accent-ink transition-[color,background-color] hover:bg-accent-soft"
        >
          Open the full report
          <ArrowRight className="size-3.5 transition-transform group-hover/open:translate-x-0.5" aria-hidden />
        </Link>
      </footer>
    </article>
  );
}
