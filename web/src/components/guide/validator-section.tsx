import { ArrowRight, RotateCw } from "lucide-react";
import { FindingList } from "@/components/doctor/finding-list";
import { formatInt } from "@/lib/format";
import { cn } from "@/lib/utils";
import { AFTER_LANDING, SET_WEIGHTS_GATES, SN26_FRESHNESS } from "./content";
import { Prose, RuleChip, SourceNote, SubHeading } from "./primitives";
import { HOTKEYS, sampleFindings } from "./samples";

const LOOP = [
  { label: "Stake", text: "Alpha staked to the hotkey, plus discounted TAO", rules: ["PF204"] },
  { label: "Permit", text: "Top stake weight on the subnet, recomputed each epoch", rules: ["PF201"] },
  { label: "Set weights", text: "Score miners, then set_weights or commit them", rules: ["PF203", "PF206"] },
  { label: "Stay active", text: "Fresh weights inside the activity cutoff", rules: ["PF202", "PF205"] },
];

function Loop() {
  return (
    <div className="flex flex-col gap-3">
      <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {LOOP.map((step, i) => (
          <li key={step.label} className="relative flex flex-col gap-2 rounded-xl bg-surface p-4 shadow-[0_0_0_1px_var(--line)]">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-accent-ink tnum">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[14px] font-semibold text-foreground">{step.label}</span>
              {i < LOOP.length - 1 && <ArrowRight className="ml-auto hidden size-3.5 text-faint lg:block" aria-hidden />}
            </div>
            <p className="flex-1 text-[13px] leading-5 text-muted-foreground">{step.text}</p>
            <div className="flex flex-wrap gap-1.5">
              {step.rules.map((id) => (
                <RuleChip key={id} id={id} />
              ))}
            </div>
          </li>
        ))}
      </ol>
      <p className="flex items-center gap-2 text-xs text-faint">
        <RotateCw className="size-3.5" aria-hidden />
        Steps 3 and 4 repeat for as long as the validator runs, no faster than the rate limit and no slower than the cutoff
      </p>
    </div>
  );
}

function Gates() {
  return (
    <div data-reveal className="panel overflow-hidden">
      <div className="hidden grid-cols-[7rem_minmax(0,1.3fr)_minmax(0,1fr)_4.5rem] gap-4 border-b border-line bg-surface-2/60 px-5 py-2.5 text-xs font-medium text-faint md:grid">
        <span>Check</span>
        <span>Hyperparameter, value</span>
        <span>Chain error when it fails</span>
        <span className="text-right">Rule</span>
      </div>
      <ol className="divide-y divide-line">
        {SET_WEIGHTS_GATES.map((gate) => (
          <li key={gate.check} className="grid grid-cols-1 gap-x-4 gap-y-2 px-5 py-4 md:grid-cols-[7rem_minmax(0,1.3fr)_minmax(0,1fr)_4.5rem] md:items-start">
            <div className="flex items-center justify-between gap-3 md:block">
              <p className="text-[14px] font-semibold text-foreground">{gate.check}</p>
              <RuleChip id={gate.rule} className="md:hidden" />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[12.5px] break-words text-foreground">{gate.param}</p>
              <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">{gate.value}</p>
              <p className="mt-1.5 text-[13px] leading-5 text-faint">{gate.what}</p>
            </div>
            <p className="min-w-0 font-mono text-[12.5px] leading-5 break-words text-critical">{gate.error}</p>
            <div className="hidden justify-end md:flex">
              <RuleChip id={gate.rule} />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function AfterLanding() {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {AFTER_LANDING.map((item) => (
        <li key={item.check} className="flex flex-col gap-2 rounded-xl bg-surface p-4 shadow-[0_0_0_1px_var(--line)]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[14px] font-semibold text-foreground">{item.check}</p>
            <RuleChip id={item.rule} />
          </div>
          <p className="text-[13px] leading-5 font-medium text-foreground">{item.value}</p>
          <p className="text-[13px] leading-5 text-muted-foreground">{item.what}</p>
        </li>
      ))}
    </ul>
  );
}

/** Log scale: the values span 26 blocks to a million, and the point is which side of 720 they fall */
function FreshnessChart() {
  const { rows, staleAfter, block } = SN26_FRESHNESS;
  const ceiling = Math.log10(Math.max(...rows.map((r) => r.blocks)) * 1.6);
  const x = (blocks: number) => (Math.log10(Math.max(blocks, 1)) / ceiling) * 100;
  const stale = rows.filter((r) => r.blocks > staleAfter).length;
  const ticks = [
    { at: 10, label: "10" },
    { at: 100, label: "100" },
    { at: 1_000, label: "1k" },
    { at: 10_000, label: "10k" },
    { at: 100_000, label: "100k" },
    { at: 1_000_000, label: "1M" },
  ];
  const cols = "grid-cols-[3.75rem_minmax(0,1fr)] sm:grid-cols-[5rem_minmax(0,1fr)]";
  return (
    <figure data-reveal className="panel overflow-hidden">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-5 py-3.5">
        <span className="text-sm font-semibold text-foreground">What stale looks like: SN26 validators</span>
        <span className="text-xs text-faint">
          {stale} of {rows.length} past the 720 block line, so PF305 fires
        </span>
      </figcaption>
      <div className="px-5 pt-9 pb-4">
        <div className="relative">
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 left-[3.75rem] sm:left-[5rem]">
            <span className="absolute -top-7 -translate-x-1/2 rounded bg-surface-3 px-1.5 py-px font-mono text-[10.5px] whitespace-nowrap text-muted-foreground" style={{ left: `${x(staleAfter)}%` }}>
              720 blocks
            </span>
            <span className="absolute -top-1.5 -bottom-1.5 w-px border-l border-dashed border-foreground/40" style={{ left: `${x(staleAfter)}%` }} />
          </div>
          <ul className="flex flex-col gap-3">
            {rows.map((row) => {
              const isStale = row.blocks > staleAfter;
              const inside = x(row.blocks) > 62;
              const label = `${formatInt(row.blocks)} blocks, ${row.ago}`;
              return (
                <li key={row.uid} className={cn("grid items-center gap-x-0 gap-y-1", cols)}>
                  <span className="font-mono text-[12.5px] text-foreground">UID {row.uid}</span>
                  <div className="relative h-7">
                    <span className={cn("absolute inset-y-1 left-0 rounded-r-md", isStale ? "bg-critical" : "bg-healthy")} style={{ width: `${x(row.blocks)}%` }} />
                    <span
                      className={cn(
                        "absolute top-1/2 hidden -translate-y-1/2 font-mono text-[11.5px] whitespace-nowrap sm:block",
                        inside ? "pr-2 text-background" : "ml-1.5 rounded bg-surface px-1 text-muted-foreground",
                      )}
                      style={inside ? { right: `${100 - x(row.blocks)}%` } : { left: `${x(row.blocks)}%` }}
                    >
                      {label}
                    </span>
                  </div>
                  <span className="col-start-2 font-mono text-[11px] text-muted-foreground sm:hidden">{label}</span>
                </li>
              );
            })}
          </ul>
          <div aria-hidden className={cn("mt-2 grid", cols)}>
            <span />
            <div className="relative h-4">
              {ticks.map((t) => (
                <span key={t.at} className="absolute -translate-x-1/2 font-mono text-[10.5px] text-faint" style={{ left: `${x(t.at)}%` }}>
                  {t.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-line px-5 py-3">
        <SourceNote>
          Blocks since each permitted validator last set weights, read at block {formatInt(block)} (the PF108 evidence for UID 82 on SN26), on a log scale. PF305
          calls a validator stale after max(2 tempos, rate limit plus a tempo), here 720 blocks or about 2.4 h
        </SourceNote>
      </div>
    </figure>
  );
}

export function ValidatorBody() {
  const rateLimited = sampleFindings(HOTKEYS.validator, 64, ["PF203"]);
  return (
    <>
      <Loop />
      <div className="flex flex-col gap-4">
        <SubHeading>Five checks every set_weights call must pass</SubHeading>
        <Gates />
        <SourceNote>
          SN64 values from its hyperparameters as recorded at block 9,376,750. The stake threshold is from the{" "}
          <a href="https://www.bittensor.com/docs/guides/validating" target="_blank" rel="noreferrer" className="underline decoration-line-strong underline-offset-4 hover:text-foreground">
            validating guide
          </a>
        </SourceNote>
      </div>
      <div className="flex flex-col gap-4">
        <SubHeading>After they land: what decides whether weights count</SubHeading>
        <AfterLanding />
      </div>
      <div className="flex flex-col gap-3">
        <SubHeading>A healthy validator with a finding: UID 1 on SN64 must wait 82 blocks</SubHeading>
        <Prose>
          <p>
            This validator set weights 18 blocks before the read. The rate limit on SN64 is 100 blocks, so a new call would fail with SettingWeightsTooFast until
            block 9,376,812. That is information, not a fault: the fix is to wait, and retrying in a tight loop only burns time
          </p>
        </Prose>
        <FindingList findings={rateLimited.findings} block={rateLimited.block} learn={false} defaultOpen={false} />
      </div>
      <FreshnessChart />
    </>
  );
}
