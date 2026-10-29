import { ChevronRight } from "lucide-react";
import { ChainMeta } from "@/components/shared/chain-meta";
import { HyperparamTable } from "@/components/shared/hyperparam-table";
import { Badge } from "@/components/ui/badge";
import { formatAmount, formatDuration, formatInt } from "@/lib/format";
import { normalizeTaoText } from "@/lib/tao";
import { detailClauses, timelineColumns } from "@/lib/timeline";
import type { LaunchPlan, TimelineStep } from "@/lib/types";
import { cn } from "@/lib/utils";

function Panel({ eyebrow, children, className }: { eyebrow: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("panel flex flex-col gap-4 p-5 sm:p-6", className)}>
      <p className="eyebrow">{eyebrow}</p>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-line pt-2.5 text-[13px]">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono text-foreground">{value}</dd>
    </div>
  );
}

function gapLabel(from: TimelineStep, to: TimelineStep, blockSeconds: number): string | null {
  if (from.block == null || to.block == null) return null;
  const gap = to.block - from.block;
  if (gap <= 0) return "same block";
  return `+${formatInt(gap)} blocks, ${formatDuration(gap, blockSeconds)}`;
}

function Timeline({ plan }: { plan: LaunchPlan }) {
  const steps = plan.timeline;
  const head = plan.chain.block;
  return (
    <ol
      className="relative grid gap-0 lg:grid-cols-(--timeline-columns)"
      style={{ ["--timeline-columns" as string]: timelineColumns(steps.map((step) => step.block)) }}
    >
      {steps.map((step, i) => {
        const next = steps[i + 1];
        const gap = next ? gapLabel(step, next, plan.block_seconds) : null;
        const past = step.block != null && step.block <= head;
        const fromNow = step.block == null ? "When you choose" : step.block > head ? `in ${formatDuration(step.block - head, plan.block_seconds)}` : "Reached";
        return (
          <li key={`${step.label}-${i}`} className="relative flex gap-4 pb-7 lg:flex-col lg:gap-0 lg:pr-4 lg:pb-0">
            {next && (
              <span
                aria-hidden
                className="absolute top-3 bottom-0 left-[11px] w-px bg-line-strong lg:top-[11px] lg:right-0 lg:bottom-auto lg:left-6 lg:h-px lg:w-auto"
              />
            )}
            <span
              aria-hidden
              className={cn(
                "relative z-10 grid size-6 shrink-0 place-items-center rounded-full bg-surface shadow-[0_0_0_1px_var(--line-strong)]",
                i === 0 && "shadow-[0_0_0_1px_var(--accent)]",
              )}
            >
              <span className={cn("size-2 rounded-full", i === 0 ? "bg-accent" : past ? "bg-healthy" : "bg-faint")} />
            </span>
            <div className="min-w-0 lg:mt-4">
              <p className="text-sm font-medium text-foreground">{step.label}</p>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs leading-5">
                <dt className="text-faint">Block</dt>
                <dd className="font-mono text-accent-ink">{step.block != null ? `#${formatInt(step.block)}` : "Your choice"}</dd>
                <dt className="text-faint">When</dt>
                <dd className="text-muted-foreground">{fromNow}</dd>
                {gap && (
                  <>
                    <dt className="text-faint lg:hidden">Next</dt>
                    <dd className="font-mono text-muted-foreground lg:hidden">{gap}</dd>
                  </>
                )}
              </dl>
            </div>
            {gap && (
              <span className="absolute top-[-2px] left-10 hidden -translate-y-full font-mono text-[11px] whitespace-nowrap text-faint md:block lg:left-12">
                {gap}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function HowComputed({ steps }: { steps: TimelineStep[] }) {
  return (
    <details className="group mt-8 border-t border-line pt-4">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded text-[13px] font-medium text-muted-foreground transition-colors select-none hover:text-foreground [&::-webkit-details-marker]:hidden">
        <ChevronRight className="size-3.5 transition-transform duration-200 group-open:rotate-90 motion-reduce:transition-none" aria-hidden />
        How this is computed
      </summary>
      <ol className="mt-5 grid gap-x-10 gap-y-6 md:grid-cols-2">
        {steps.map((step, i) => (
          <li key={`${step.label}-${i}`} className="min-w-0">
            <p className="text-[13px] font-medium text-foreground">{step.label}</p>
            <ul className="mt-2 flex flex-col gap-1.5 text-xs leading-5 text-pretty text-muted-foreground">
              {detailClauses(normalizeTaoText(step.detail)).map((clause, j) => (
                <li key={j} className="flex gap-2.5">
                  <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-faint" />
                  <span className="min-w-0">{clause}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </details>
  );
}

export function PlanView({ plan }: { plan: LaunchPlan }) {
  const atCap = plan.subnet_count >= plan.subnet_limit;
  const openNow = plan.next_registration_block == null || plan.next_registration_block <= plan.chain.block;
  const waitBlocks = plan.next_registration_block != null ? plan.next_registration_block - plan.chain.block : 0;

  return (
    <div className="flex flex-col gap-6">
      <ChainMeta chain={plan.chain} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel eyebrow="Lock cost">
          <p className="text-[2.75rem] leading-none font-light tracking-[-0.05em] text-foreground tnum">
            {formatAmount(plan.lock_cost_tao)}
            <span className="ml-2 text-lg font-medium tracking-normal text-faint">TAO</span>
          </p>
          <p className="text-[13px] leading-5 text-muted-foreground">
            What registering a subnet costs at this block. It rises after each registration and decays back toward the minimum over{" "}
            {formatInt(plan.lock_reduction_interval)} blocks ({formatDuration(plan.lock_reduction_interval, plan.block_seconds)})
          </p>
          <dl className="mt-auto flex flex-col gap-2.5">
            <Row label="Last lock" value={`${formatAmount(plan.last_lock_tao)} TAO`} />
            <Row label="Minimum lock" value={`${formatAmount(plan.min_lock_tao)} TAO`} />
          </dl>
        </Panel>

        <Panel eyebrow="Rate limit">
          <div className="flex items-center gap-2">
            <Badge tone={openNow ? "healthy" : "medium"} dot size="md">
              {openNow ? "Open now" : "Rate limited"}
            </Badge>
          </div>
          <p className="text-[15px] leading-6 text-foreground">
            {openNow
              ? "A new subnet can register in the next block"
              : `The next subnet can register at block ${formatInt(plan.next_registration_block ?? 0)}, in ${formatDuration(waitBlocks, plan.block_seconds)}`}
          </p>
          <dl className="mt-auto flex flex-col gap-2.5">
            <Row label="NetworkRateLimit" value={`${formatInt(plan.rate_limit_blocks)} blocks`} />
            <Row label="About" value={formatDuration(plan.rate_limit_blocks, plan.block_seconds)} />
          </dl>
        </Panel>

        <Panel eyebrow="Subnet cap" className={cn(atCap && "shadow-[0_0_0_1px_color-mix(in_oklab,var(--high)_35%,transparent),0_6px_20px_-12px_rgb(0_0_0/0.25)]")}>
          <p className="text-[2.75rem] leading-none font-light tracking-[-0.05em] text-foreground tnum">
            {plan.subnet_count}
            <span className="ml-1 text-lg font-medium tracking-normal text-faint">/ {plan.subnet_limit}</span>
          </p>
          {atCap && plan.replaced_netuid != null ? (
            <p className="text-[13px] leading-5 text-muted-foreground">
              At the cap. Registering now would dissolve{" "}
              <span className="font-medium text-high">
                SN{plan.replaced_netuid}
                {plan.replaced_name ? ` ${plan.replaced_name}` : ""}
              </span>
              , the subnet the runtime picks to prune: the lowest by its pruning metric among those past immunity
            </p>
          ) : (
            <p className="text-[13px] leading-5 text-muted-foreground">Below the cap, so registering adds a subnet without replacing one</p>
          )}
          <dl className="mt-auto flex flex-col gap-2.5">
            <Row label="Network immunity" value={formatDuration(plan.network_immunity_blocks, plan.block_seconds)} />
          </dl>
        </Panel>
      </div>

      <section aria-labelledby="timeline" className="panel p-5 sm:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="timeline" className="text-sm font-semibold">
            Launch timeline, with real blocks
          </h2>
          <p className="text-xs text-faint">Head is block {formatInt(plan.chain.block)}</p>
        </div>
        <div className="mt-8 md:mt-12">
          <Timeline plan={plan} />
        </div>
        <HowComputed steps={plan.timeline} />
      </section>

      <HyperparamTable params={plan.defaults} caption="Hyperparameters a new subnet starts with" />
    </div>
  );
}
