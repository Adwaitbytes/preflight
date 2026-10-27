import { SourceLink } from "@/components/shared/source-link";
import { ArrowUpRight, XCircle } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { FixBlock } from "@/components/shared/fix-block";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { MonoValue } from "@/components/ui/mono-value";
import { formatInt } from "@/lib/format";
import { taostatsExtrinsic } from "@/lib/networks";
import { cn } from "@/lib/utils";
import { FAILED_TX as TX } from "./content";
import { Code, RuleChip } from "./primitives";
import { Term } from "./term";

interface Step {
  title: string;
  text: ReactNode;
  artifact: ReactNode;
}

function Frame({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0 overflow-hidden rounded-xl bg-surface shadow-[0_0_0_1px_var(--line)]", className)}>
      <p className="eyebrow border-b border-line bg-surface-2/50 px-4 py-2">{label}</p>
      <div className="px-4 py-3.5">{children}</div>
    </div>
  );
}

function steps(): Step[] {
  return [
    {
      title: "Find it",
      text: (
        <>
          Explorers name an extrinsic by its block and its position in that block. <Code>9376733-28</Code> is the 29th extrinsic in block 9,376,733, since the
          index starts at 0. Preflight takes that form, a 0x hash from the last 300 blocks, or the error text you were shown
        </>
      ),
      artifact: (
        <Frame label="Reference">
          <p className="flex items-end gap-1 font-mono text-[28px] leading-none font-semibold tracking-[-0.03em] text-foreground">
            <span className="flex flex-col items-center gap-2">
              <span>9376733</span>
              <span className="text-[11px] font-normal tracking-normal text-accent-ink">block</span>
            </span>
            <span className="pb-[21px] text-faint">-</span>
            <span className="flex flex-col items-center gap-2">
              <span>28</span>
              <span className="text-[11px] font-normal tracking-normal text-accent-ink">index</span>
            </span>
          </p>
          <div className="mt-4 flex min-w-0 items-center gap-2 border-t border-line pt-3 text-xs text-faint">
            <span className="shrink-0">Hash</span>
            <MonoValue value={TX.hash} label="extrinsic hash" head={10} tail={8} className="text-[12px] text-muted-foreground" />
          </div>
        </Frame>
      ),
    },
    {
      title: "Who sent what",
      text: (
        <>
          The signer is a validator&apos;s <Term name="Hotkey">hotkey</Term>, because weights are signed by the hotkey. The call is{" "}
          <Code>commit_timelocked_mechanism_weights</Code>: on a commit reveal subnet, validators commit weights encrypted until a future round instead of
          setting them in the open
        </>
      ),
      artifact: (
        <Frame label="Call">
          <Badge tone="critical" dot>
            Failed
          </Badge>
          <p className="mt-3 font-mono text-[14px] leading-6 break-words text-foreground">
            <span className="text-faint">{TX.pallet}.</span>
            {TX.call}
          </p>
          <div className="mt-3 flex min-w-0 items-center gap-2 text-xs text-faint">
            <span className="shrink-0">Signer</span>
            <MonoValue value={TX.signer} label="signer" head={8} tail={6} className="text-[12px] text-muted-foreground" />
          </div>
        </Frame>
      ),
    },
    {
      title: "Read the arguments",
      text: (
        <>
          Each argument is decoded from the raw call. The ones that matter here are the subnet, and the <Term name="drand" /> round that tells the chain when it
          may decrypt the commit
        </>
      ),
      artifact: (
        <Frame label="Decoded arguments">
          <dl className="flex flex-col divide-y divide-line">
            {TX.args.map((arg) => (
              <div key={arg.name} className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-3 gap-y-0.5 py-2 first:pt-0 last:pb-0">
                <dt className="font-mono text-[12.5px] text-muted-foreground">{arg.name}</dt>
                <dd className="min-w-0 truncate text-right font-mono text-[12.5px] text-foreground" title={arg.value}>
                  {arg.value}
                </dd>
                <dd className="col-span-2 text-xs leading-5 text-faint">{arg.note}</dd>
              </div>
            ))}
          </dl>
        </Frame>
      ),
    },
    {
      title: "Read the events in order",
      text: "The fee is charged first, then the runtime dispatches the call. ExtrinsicFailed carries the module error that stopped it. The fee was 0 TAO, so the only cost was a commit that never landed",
      artifact: (
        <Frame label="Events">
          <ol className="relative flex flex-col gap-4">
            {TX.events.map((event, i) => (
              <li key={event.index} className="relative flex gap-3">
                {i < TX.events.length - 1 && <span aria-hidden className="absolute top-5 -bottom-4 left-[9px] w-px bg-line-strong" />}
                <span
                  aria-hidden
                  className={cn(
                    "relative z-10 mt-0.5 grid size-[19px] shrink-0 place-items-center rounded-full bg-surface shadow-[0_0_0_1px_var(--line-strong)]",
                    event.fail && "text-critical",
                  )}
                >
                  {event.fail ? <XCircle className="size-[19px]" /> : <span className="size-1.5 rounded-full bg-faint" />}
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-[13px] break-words text-foreground">
                    <span className="text-faint">{event.pallet}.</span>
                    {event.name}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-5 break-words text-muted-foreground">{event.summary}</p>
                </div>
              </li>
            ))}
          </ol>
        </Frame>
      ),
    },
    {
      title: "Decode the error",
      text: (
        <>
          <Code>TooManyUnrevealedCommits</Code> comes from the official error catalog with its semantic code and the line in subtensor that raises it. The catalog
          says the limit: 10 unrevealed commits per hotkey on a subnet
        </>
      ),
      artifact: (
        <Frame label="Dispatch error">
          <p className="font-mono text-[14px] break-words text-critical">
            {TX.error.pallet}.{TX.error.name}
          </p>
          <dl className="mt-3 flex flex-col gap-2 text-[12.5px]">
            <div className="flex items-baseline gap-3">
              <dt className="w-16 shrink-0 text-faint">Code</dt>
              <dd className="font-mono text-foreground">{TX.error.code}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-faint">Raised at</dt>
              <dd className="min-w-0 text-foreground"><SourceLink source={TX.error.source} /></dd>
            </div>
          </dl>
        </Frame>
      ),
    },
    {
      title: "Explain it with its own numbers",
      text: (
        <>
          The debugger rereads the chain at the block before, so the explanation names this hotkey&apos;s queue, not a generic limit. Timelocked commits reveal
          themselves when their drand round arrives, so the answer is to wait, and commit less often. <RuleChip id="PF205" className="mx-0.5 h-5 align-[1px]" />{" "}
          shows the same queue in the Doctor before it fills
        </>
      ),
      artifact: (
        <div className="flex min-w-0 flex-col gap-3">
          <div className="rounded-xl bg-surface px-4 py-3.5 shadow-[0_0_0_1px_var(--line)]">
            <p className="eyebrow">Why it failed</p>
            <p className="mt-1.5 text-[15px] leading-6 font-medium text-pretty text-foreground">{TX.explanation}</p>
          </div>
          <FixBlock fix={TX.fix} />
        </div>
      ),
    },
  ];
}

export function TxWalkthrough() {
  const list = steps();
  const explorer = taostatsExtrinsic("finney", TX.block, TX.index);
  return (
    <div className="flex flex-col gap-8">
      <ol className="flex flex-col gap-4">
        {list.map((step, i) => (
          <li
            key={step.title}
            className="grid grid-cols-1 gap-4 rounded-2xl bg-surface-2/40 p-4 shadow-[0_0_0_1px_var(--line)] sm:p-5 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] md:gap-8"
          >
            <div className="flex min-w-0 gap-3.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-surface font-mono text-[12px] font-semibold text-accent-ink shadow-[0_0_0_1.5px_var(--accent)]">
                {i + 1}
              </span>
              <div className="min-w-0 pt-0.5">
                <h3 className="text-subtitle font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1.5 text-[15px] leading-[26px] text-pretty text-muted-foreground">{step.text}</p>
              </div>
            </div>
            {step.artifact}
          </li>
        ))}
      </ol>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-faint">
          Read from finney at block {formatInt(TX.block)}, runtime {TX.runtime}. Recorded in docs/demo-output/tx-mainnet.json
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/tx/finney/${TX.ref}`} className={buttonVariants({ variant: "primary", size: "sm" })}>
            Open it in the debugger
          </Link>
          {explorer && (
            <a
              href={explorer}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Taostats
              <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
