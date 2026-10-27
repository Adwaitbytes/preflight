import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { formatDuration, formatInt } from "@/lib/format";
import { cn } from "@/lib/utils";
import { LAUNCH as L } from "./content";
import { Prose, Snippet, SourceNote, SubHeading } from "./primitives";

function Stat({ label, value, unit, detail, tone }: { label: string; value: string; unit?: string; detail: string; tone?: "high" }) {
  return (
    <div className={cn("flex min-w-0 flex-col bg-surface p-5", tone === "high" && "bg-[color-mix(in_oklab,var(--high)_5%,var(--surface))]")}>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-3 font-mono text-[28px] leading-none font-semibold tracking-[-0.04em] text-foreground tnum">
        {value}
        {unit && <span className="ml-1.5 text-sm font-medium tracking-normal text-faint">{unit}</span>}
      </dd>
      <dd className={cn("mt-3 text-[13px] leading-5", tone === "high" ? "text-high" : "text-muted-foreground")}>{detail}</dd>
    </div>
  );
}

/**
 * The measured decay: from the cost at the read to the 1 TAO floor, falling about 0.0078 TAO a
 * block. Lines are drawn in a stretched SVG; text stays HTML so it never scales with the chart
 */
function LockCostChart() {
  const start = L.block;
  const end = L.floorAt + 6_000;
  const top = 380;
  const x = (block: number) => ((block - start) / (end - start)) * 100;
  const y = (tao: number) => 100 - (tao / top) * 100;
  const line = `M0,${y(L.lockCost)} L${x(L.floorAt)},${y(L.floor)} L100,${y(L.floor)}`;
  const area = `${line} L100,100 L0,100 Z`;
  const ticks = [0, 100, 200, 300];

  return (
    <figure data-reveal className="panel overflow-hidden">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-5 py-3.5">
        <span className="text-sm font-semibold text-foreground">Lock cost if nobody registers, from block {formatInt(L.block)}</span>
        <span className="text-xs text-faint">about {L.decayPerBlock} TAO less every block</span>
      </figcaption>
      <div className="px-5 pt-6 pb-4">
        <div className="relative ml-9 h-52 sm:h-60">
          {ticks.map((t) => (
            <div key={t} aria-hidden className="absolute inset-x-0 border-t border-line" style={{ top: `${y(t)}%` }}>
              <span className="absolute -left-9 w-7 -translate-y-1/2 text-right font-mono text-[10.5px] text-faint">{t}</span>
            </div>
          ))}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
            <defs>
              <linearGradient id="lock-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#lock-fill)" />
            <path d={line} fill="none" className="stroke-accent" strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </svg>
          {[
            { block: L.block, tao: L.lockCost, label: `${L.lockCost.toFixed(2)} TAO now`, align: "left" as const },
            { block: L.nextAllowed, tao: L.costAtNextAllowed, label: `${L.costAtNextAllowed.toFixed(2)} TAO at the next allowed block`, align: "left" as const, below: true },
            { block: L.floorAt, tao: L.floor, label: `floor, ${L.floor} TAO at block ${formatInt(L.floorAt)}`, align: "right" as const },
          ].map((p) => (
            <div key={p.block} aria-hidden className="absolute" style={{ left: `${x(p.block)}%`, top: `${y(p.tao)}%` }}>
              <span className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface shadow-[0_0_0_2px_var(--accent)]" />
              <span
                className={cn(
                  "absolute rounded-md bg-surface px-1.5 py-0.5 font-mono text-[11px] whitespace-nowrap text-foreground shadow-[0_0_0_1px_var(--line-strong)]",
                  p.align === "right" ? "right-3 -translate-y-[calc(100%+10px)]" : "left-3",
                  p.align === "left" && (p.below ? "translate-y-3" : "-translate-y-[calc(100%+2px)]"),
                )}
              >
                {p.label}
              </span>
            </div>
          ))}
        </div>
        <div aria-hidden className="mt-2 ml-9 flex justify-between font-mono text-[10.5px] text-faint">
          <span>#{formatInt(start)}</span>
          <span>#{formatInt(end)}</span>
        </div>
      </div>
      <p className="sr-only">
        At block {formatInt(L.block)} the lock cost was {L.lockCost} TAO. With no new registrations it falls about {L.decayPerBlock} TAO per block, to about{" "}
        {L.costAtNextAllowed} TAO at block {formatInt(L.nextAllowed)} and to the {L.floor} TAO floor at block {formatInt(L.floorAt)}
      </p>
      <div className="border-t border-line px-5 py-3">
        <SourceNote>
          From docs/demo-output/plan.txt. Each subnet registration doubles the cost for the next one, so on a live chain this line jumps back up every time someone
          registers, then decays again
        </SourceNote>
      </div>
    </figure>
  );
}

const TIMELINE = [
  {
    label: "Register and start_call",
    block: L.nextAllowed,
    detail: `The first block the ${formatInt(L.rateLimit)} block rate limit allows. Registering locks the cost and makes you owner; on finney start_call can follow at once`,
  },
  { label: "First emissions", block: L.firstEmissions, detail: `Paid by the first epoch after start_call, within one tempo of ${L.tempo} blocks` },
  { label: "Immunity ends", block: L.immunityEnds, detail: "From here the subnet can be replaced when a new one registers at the cap" },
];

function Timeline() {
  return (
    <ol className="panel grid grid-cols-1 gap-0 p-5 sm:p-6 md:grid-cols-3 md:gap-6 md:pt-10">
      {TIMELINE.map((step, i) => {
        const next = TIMELINE[i + 1];
        const gap = next ? next.block - step.block : null;
        const gapLabel = gap != null ? `+${formatInt(gap)} blocks, ${formatDuration(gap)}` : null;
        return (
          <li key={step.label} className="relative flex gap-4 pb-6 last:pb-0 md:flex-col md:gap-3 md:pb-0">
            {next && (
              <span aria-hidden className="absolute top-3 bottom-0 left-[11px] w-px bg-line-strong md:top-[11px] md:right-[-1.5rem] md:bottom-auto md:left-7 md:h-px md:w-auto" />
            )}
            {gapLabel && (
              <span className="absolute top-[-6px] left-1/2 hidden -translate-x-1/2 -translate-y-full font-mono text-[11px] whitespace-nowrap text-faint md:block lg:left-[55%]">
                {gapLabel}
              </span>
            )}
            <span
              aria-hidden
              className={cn(
                "relative z-10 grid size-6 shrink-0 place-items-center rounded-full bg-surface shadow-[0_0_0_1px_var(--line-strong)]",
                i === 0 && "shadow-[0_0_0_1px_var(--accent)]",
              )}
            >
              <span className={cn("size-2 rounded-full", i === 0 ? "bg-accent" : "bg-faint")} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{step.label}</p>
              <p className="mt-1 font-mono text-[13px] text-accent-ink">#{formatInt(step.block)}</p>
              <p className="mt-2 text-[13px] leading-5 text-muted-foreground">{step.detail}</p>
              {gapLabel && <p className="mt-2 font-mono text-[11px] text-faint md:hidden">then {gapLabel}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function LaunchBody() {
  return (
    <>
      <dl data-reveal className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-line shadow-[0_0_0_1px_var(--line)] sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Lock cost" value={L.lockCost.toFixed(2)} unit="TAO" detail={`Last paid ${L.lastLock} TAO; never below the ${L.floor} TAO floor`} />
        <Stat label="Rate limit" value={formatInt(L.rateLimit)} unit="blocks" detail={`One subnet per ${formatDuration(L.rateLimit)}. Next allowed at #${formatInt(L.nextAllowed)}`} />
        <Stat label="Subnet cap" value={`${L.subnets}`} unit={`/ ${L.cap}`} detail={`At the cap: registering would dissolve ${L.replaced}`} tone="high" />
        <Stat label="Network immunity" value={formatDuration(L.immunity).replace(" days", "")} unit="days" detail={`${formatInt(L.immunity)} blocks before a new subnet can be replaced`} />
      </dl>
      <LockCostChart />
      <div className="flex flex-col gap-4">
        <SubHeading>From registration to first emissions, with real blocks</SubHeading>
        <Timeline />
        <Prose>
          <p>
            At 128 subnets, a new registration dissolves the subnet with the lowest moving alpha price among those past their immunity. At this block that was{" "}
            {L.replaced}. The planner names it before you pay, along with the exact block the rate limit lifts
          </p>
        </Prose>
      </div>
      <Snippet
        title="Launch from the CLI"
        code={"# What it costs and when you can register\npreflight plan --network finney\nbtcli subnets create-cost\n# After registering, start emissions (owner coldkey only)\nbtcli hparams start --netuid <netuid> --network finney"}
      />
      <Link href="/plan" className={cn(buttonVariants({ variant: "primary", size: "sm" }), "self-start")}>
        Open the launch planner
      </Link>
    </>
  );
}
