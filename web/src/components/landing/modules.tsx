import { ArrowUpRight, Boxes, FlaskConical, Receipt, Stethoscope, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { HealthRing } from "@/components/subnets/health-ring";
import { subnetName } from "@/components/subnets/subnet-card";
import { Badge, SeverityBadge, VerdictBadge } from "@/components/ui/badge";
import { formatAmount, formatBlockIndex, formatInt, truncateMiddle } from "@/lib/format";
import { sortFindings } from "@/lib/severity";
import type { DoctorReport, LaunchPlan, SimResult, SubnetCard, TxReport } from "@/lib/types";

function Module({
  icon: Icon,
  name,
  question,
  href,
  cta,
  children,
}: {
  icon: LucideIcon;
  name: string;
  question: string;
  href: string;
  cta: string;
  children: React.ReactNode;
}) {
  return (
    <article className="panel group flex min-w-0 flex-col overflow-hidden">
      <div className="flex items-start gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-foreground shadow-[0_0_0_1px_var(--line)]">
          <Icon className="size-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold tracking-[-0.01em]">{name}</h3>
          <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">{question}</p>
        </div>
      </div>
      <div className="mx-3 mt-5 flex-1 rounded-xl bg-background/60 p-4 shadow-[inset_0_0_0_1px_var(--line)] sm:mx-4">{children}</div>
      <Link
        href={href}
        className="mx-3 my-3 inline-flex items-center justify-between rounded-lg px-2 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground sm:mx-4"
      >
        {cta}
        <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-px group-hover:-translate-y-px" aria-hidden />
      </Link>
    </article>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[12.5px] text-foreground">{children}</span>;
}

export function DoctorPreview({ report }: { report: DoctorReport }) {
  const diagnosis = report.diagnoses[0];
  const finding = diagnosis ? sortFindings(diagnosis.findings)[0] : undefined;
  return (
    <Module icon={Stethoscope} name="Doctor" question="Why does my miner earn zero?" href={`/doctor/finney/${report.hotkey}`} cta="Open this diagnosis">
      <div className="flex flex-wrap items-center gap-2">
        <VerdictBadge verdict={report.verdict} size="sm" />
        <span className="font-mono text-xs text-faint">{truncateMiddle(report.hotkey, 6, 4)}</span>
      </div>
      <p className="mt-3 text-[15px] leading-6 font-medium tracking-[-0.01em] text-foreground">{report.headline}</p>
      {finding && (
        <div className="mt-4 flex flex-col gap-2 border-t border-line pt-3">
          <div className="flex items-center gap-2">
            <SeverityBadge severity={finding.severity} />
            <span className="font-mono text-xs text-faint">{finding.id}</span>
          </div>
          <dl className="flex flex-col gap-1.5 text-[13px]">
            {finding.evidence.slice(0, 3).map((e) => (
              <div key={e.label} className="flex justify-between gap-3">
                <dt className="shrink-0 text-muted-foreground">{e.label}</dt>
                <dd className="min-w-0 truncate text-right font-mono text-xs text-foreground">{e.value.split(", last")[0]}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </Module>
  );
}

export function TxPreview({ tx }: { tx: TxReport }) {
  return (
    <Module
      icon={Receipt}
      name="Transaction debugger"
      question="Why did this extrinsic fail, and what do I run instead?"
      href={`/tx/finney/${formatBlockIndex(tx.block, tx.index)}`}
      cta="Open this transaction"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={tx.success ? "healthy" : "critical"} dot>
          {tx.success ? "Succeeded" : "Failed"}
        </Badge>
        <Mono>{formatBlockIndex(tx.block, tx.index)}</Mono>
      </div>
      <p className="mt-3 font-mono text-[13px] text-foreground">
        <span className="text-faint">{tx.pallet}.</span>
        {tx.call}
      </p>
      {tx.failure && <p className="mt-1 font-mono text-[12.5px] text-critical">{tx.failure.error}</p>}
      {tx.explanation && (
        <>
          <p className="mt-3 text-[15px] leading-6 font-medium text-foreground">{tx.explanation.title}</p>
          {tx.explanation.fix && (
            <p className="mt-3 truncate rounded-lg bg-surface-2 px-3 py-2 font-mono text-xs text-muted-foreground shadow-[0_0_0_1px_var(--line)]">
              <span className="text-faint">$ </span>
              {tx.explanation.fix.text}
            </p>
          )}
        </>
      )}
    </Module>
  );
}

export function SimPreview({ sim }: { sim: SimResult }) {
  return (
    <Module icon={FlaskConical} name="Simulator" question="Will this work, before I pay for it?" href="/sim" cta="Simulate a transaction">
      <Badge tone="accent">{sim.mode === "fork" ? "Executed on a fork" : "Predicted"}</Badge>
      <p className="mt-3 font-mono text-[13px] text-foreground">
        {sim.action}
        <span className="text-faint"> on SN64, coldkey with 0 TAO</span>
      </p>
      <p className="mt-3 text-[15px] leading-6 font-medium text-foreground">{sim.would_succeed ? "Would succeed" : `Would fail: ${sim.explanation?.title ?? sim.failure?.error}`}</p>
      <dl className="mt-4 flex flex-col gap-1.5 border-t border-line pt-3 text-[13px]">
        {(sim.checks ?? []).slice(0, 3).map((c) => (
          <div key={c.label} className="flex justify-between gap-3">
            <dt className="truncate text-muted-foreground">{c.label}</dt>
            <dd className="min-w-0 truncate text-right font-mono text-xs text-foreground">{c.value.replace(/^(pass|fail):\s*/, "")}</dd>
          </div>
        ))}
      </dl>
    </Module>
  );
}

export function DirectoryPreview({ plan, subnets }: { plan: LaunchPlan; subnets: SubnetCard[] }) {
  return (
    <Module icon={Boxes} name="Directory and launch planner" question="What does each subnet do, and what does launching one cost?" href="/subnets" cta="Browse subnets">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-faint">Subnet lock cost now</p>
          <p className="mt-1 font-mono text-2xl font-semibold tracking-[-0.03em] text-foreground">
            {formatAmount(plan.lock_cost_tao)} <span className="text-sm font-medium text-faint">TAO</span>
          </p>
        </div>
        <p className="text-right text-xs leading-5 text-muted-foreground">
          {plan.subnet_count} of {plan.subnet_limit} slots
          <br />
          replaces SN{plan.replaced_netuid}
        </p>
      </div>
      <ul className="mt-4 flex flex-col gap-2.5 border-t border-line pt-3">
        {subnets.map((card) => (
          <li key={card.netuid} className="flex items-center gap-3">
            <HealthRing health={card.health} size={32} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-foreground">
                <span className="font-mono text-faint">SN{card.netuid}</span> {subnetName(card)}
              </p>
              <p className="truncate text-xs text-faint">{card.live ? `${card.live.miners} miners, register ${formatAmount(card.live.registration_cost_tao)} TAO` : "No live data"}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-faint">Read at block {formatInt(plan.chain.block)}</p>
    </Module>
  );
}
