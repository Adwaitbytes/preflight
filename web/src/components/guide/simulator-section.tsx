import { CheckCircle2, ChevronDown, Cpu, Globe, XCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FORK_RESULTS, PLAN_VS_CHAIN, ZERO_TAO_CHECKS } from "./content";
import { Code, Prose, Snippet, SourceNote, SubHeading } from "./primitives";

const MODES = [
  {
    icon: Cpu,
    name: "Fork",
    label: "Executed on a fork of block N with the real runtime",
    how: "Preflight copies mainnet at one block onto your machine and runs your transaction through the chain's own code. You get exactly the answer the chain would give, and then the copy is thrown away, so nothing is ever sent",
    where: "The CLI, the MCP server and preflight serve on your machine",
    hood: "A Chopsticks fork, the runtime's BlockBuilder_apply_extrinsic, and a mock signature so any address works",
  },
  {
    icon: Globe,
    name: "Predicted",
    label: "Predicted from live state and runtime rules",
    how: "Preflight reads the live numbers that decide the outcome, such as the burn, your balance and the registration limits, and runs the same checks the chain runs, copied from its source code",
    where: "The hosted site, which cannot keep a fork running",
    hood: "Pallet checks ported from subtensor, each cited by file and line",
  },
];

function Modes() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {MODES.map((mode) => (
        <article key={mode.name} className="panel flex min-w-0 flex-col gap-4 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-surface-2 text-foreground shadow-[0_0_0_1px_var(--line-strong)]">
              <mode.icon className="size-4" aria-hidden />
            </span>
            <h3 className="text-subtitle font-semibold text-foreground">{mode.name}</h3>
          </div>
          <Badge tone="accent" className="h-auto self-start py-1 whitespace-normal">
            {mode.label}
          </Badge>
          <p className="text-[15px] leading-[26px] text-pretty text-muted-foreground">{mode.how}</p>
          <dl className="mt-auto flex flex-col gap-2 border-t border-line pt-3 text-[13px] leading-5">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-faint">Runs in</dt>
              <dd className="text-foreground">{mode.where}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-faint">Under the hood</dt>
              <dd className="text-muted-foreground">{mode.hood}</dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  );
}

function PlanVsChain() {
  return (
    <div data-reveal className="panel overflow-hidden">
      <div className="hidden grid-cols-[minmax(0,1fr)_7rem_minmax(0,1.2fr)] border-b border-line bg-surface-2/60 text-xs font-medium text-faint sm:grid">
        <span className="px-4 py-2.5 sm:px-5">Intent on SN64</span>
        <span className="hidden px-4 py-2.5 sm:block">SDK plan()</span>
        <span className="px-4 py-2.5">What the chain does</span>
      </div>
      <ul className="divide-y divide-line">
        {PLAN_VS_CHAIN.map((row) => (
          <li key={row.intent} className="grid grid-cols-1 items-start py-2 sm:grid-cols-[minmax(0,1fr)_7rem_minmax(0,1.2fr)] sm:py-0">
            <div className="flex flex-col gap-1.5 px-4 pt-2 sm:px-5 sm:py-3.5">
              <span className="text-[13.5px] leading-5 text-foreground">{row.intent}</span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[12px] text-healthy sm:hidden">
                <CheckCircle2 className="size-3.5" aria-hidden />
                plan().ok = true
              </span>
            </div>
            <span className="hidden items-center gap-1.5 px-4 py-3.5 font-mono text-[12.5px] text-healthy sm:flex">
              <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />
              ok: true
            </span>
            <span className="flex items-start gap-1.5 px-4 pt-1.5 pb-2 font-mono text-[12.5px] leading-5 text-critical sm:py-3.5">
              <XCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <span className="min-w-0 [overflow-wrap:anywhere]">
                <span className="font-sans text-faint sm:hidden">The chain says </span>
                {row.chain.split(" or ").map((part, i) => (
                  <span key={part} className="block">
                    {i > 0 && <span className="font-sans text-faint">or </span>}
                    {part}
                  </span>
                ))}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ForkResults() {
  const cols = "md:grid-cols-[9rem_minmax(0,1fr)_minmax(0,1fr)_10.5rem]";
  return (
    <div className="overflow-hidden rounded-xl shadow-[0_0_0_1px_var(--line)]">
      <div className={cn("hidden gap-4 border-b border-line bg-surface-2/60 px-5 py-2.5 text-xs font-medium text-faint md:grid", cols)}>
        <span>Action on SN64</span>
        <span>Setup</span>
        <span>Fork result</span>
        <span className="text-right">Time</span>
      </div>
      <ul className="divide-y divide-line" aria-label="Simulations measured on a fork of finney block 9,376,889">
        {FORK_RESULTS.map((row) => (
          <li key={`${row.action}-${row.setup}`} className={cn("grid grid-cols-1 gap-x-4 gap-y-1 px-5 py-3 md:items-baseline", cols)}>
            <span className="font-mono text-[12.5px] text-foreground">{row.action}</span>
            <span className="text-[13px] text-muted-foreground">{row.setup}</span>
            <span className={cn("font-mono text-[12.5px]", row.ok ? "text-healthy" : "text-critical")}>{row.result}</span>
            <span className="font-mono text-[12px] text-faint md:text-right">{row.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ZeroTaoChecks() {
  return (
    <div data-reveal className="panel overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3.5">
        <Badge tone="critical" dot>
          Would fail
        </Badge>
        <span className="font-mono text-[13px] text-foreground">burned_register</span>
        <span className="text-xs text-faint">on SN64, from a coldkey with 0 TAO</span>
      </div>
      <ul className="divide-y divide-line">
        {ZERO_TAO_CHECKS.map((check) => (
          <li key={check.label} className="flex items-start gap-3 px-5 py-2.5">
            {check.pass ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-healthy" aria-label="Pass" />
            ) : (
              <XCircle className="mt-0.5 size-4 shrink-0 text-critical" aria-label="Fail" />
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <span className="text-[13.5px] text-foreground">{check.label}</span>
              <span className="font-mono text-[12px] break-words text-muted-foreground sm:text-right">{check.value}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SimulatorBody() {
  return (
    <>
      <div className="flex flex-col gap-4">
        <SubHeading>A real run: registering on SN64 with zero TAO</SubHeading>
        <Prose>
          <p>
            Each line is one condition the chain tests, with the value it read at block 9,377,481. Two fail, so the chain would reject the call before it runs and
            nothing would be spent
          </p>
        </Prose>
        <ZeroTaoChecks />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Snippet title="Try it from the CLI" code={"preflight sim burned_register --netuid 64 --coldkey <ss58> --hotkey <ss58>"} className="min-w-0 flex-1" />
          <Link href="/sim" className={cn(buttonVariants({ variant: "primary", size: "md" }), "self-start sm:self-center")}>
            Open the simulator
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <SubHeading>Two ways to run it, always labelled</SubHeading>
        <Modes />
      </div>
      <div className="flex flex-col gap-4">
        <SubHeading>Why not the SDK&apos;s dry run: plan() says ok, the chain says no</SubHeading>
        <Prose>
          <p>
            The bittensor SDK has <Code>client.plan()</Code>, which returns fees and effects. It never runs the call, so it said ok to all three of these. Preflight
            uses it for fee and effect text only, never for the verdict
          </p>
        </Prose>
        <PlanVsChain />
      </div>
      <details className="group panel overflow-hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-surface-2/50 [&::-webkit-details-marker]:hidden">
          <span>
            <span className="block text-[15px] font-semibold text-foreground">What the fork returned on finney, with timings</span>
            <span className="mt-0.5 block text-[13px] text-muted-foreground">Five measured runs from docs/decisions/001-simulator.md</span>
          </span>
          <ChevronDown className="size-4 shrink-0 text-faint transition-transform duration-200 group-open:rotate-180" aria-hidden />
        </summary>
        <div className="flex flex-col gap-3 border-t border-line p-4 sm:p-5">
          <ForkResults />
          <SourceNote>
            Fork of finney block 9,376,889. The first call on a new path fetches storage lazily, which is why it can take minutes; requests fall back to the
            prediction after 20 s while the fork warms
          </SourceNote>
        </div>
      </details>
    </>
  );
}
