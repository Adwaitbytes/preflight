import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { FindingList } from "@/components/doctor/finding-list";
import { FixBlock } from "@/components/shared/fix-block";
import { formatInt } from "@/lib/format";
import type { Finding, Fix } from "@/lib/types";
import { InternalLink, Prose, RuleChip } from "./primitives";
import { Term } from "./term";
import { HOTKEYS, sampleFindings } from "./samples";

type Evidence =
  | { kind: "finding"; caption: string; findings: Finding[]; block: number; open: boolean }
  | { kind: "fix"; caption: ReactNode; fix: Fix };

interface Cause {
  gate: string;
  title: string;
  body: ReactNode;
  rules: string[];
  evidence: Evidence;
}

function causes(): Cause[] {
  const unregistered = sampleFindings(HOTKEYS.unregistered, 64, ["PF101"]);
  const unscored = sampleFindings(HOTKEYS.brokenMiner, 64, ["PF108"]);
  const quietSubnet = sampleFindings(HOTKEYS.multiSubnet, 26, ["PF305", "PF304"]);
  return [
    {
      gate: "Registered",
      title: "It is not registered on the subnet you are checking",
      body: (
        <>
          No <Term name="UID" /> means no validator can score it. It happens more often than you would think: the hotkey registered on another netuid, or lost its
          seat to <Term name="Pruning">pruning</Term>, which PF102 catches. The fix is to register, and the Doctor fills the command in with the live cost
        </>
      ),
      rules: ["PF101", "PF102"],
      evidence: { kind: "finding", caption: `a hotkey with no UID on SN64, block ${formatInt(unregistered.block)}`, open: true, ...unregistered },
    },
    {
      gate: "Reachable",
      title: "Validators cannot reach it",
      body: (
        <>
          Validators find miners through the <Term name="Axon">axon</Term> address on chain. No address, 127.0.0.1, a LAN address or 0.0.0.0 all mean their queries
          never arrive. Not every subnet uses axons: on SN64 most earning miners publish none, so the Doctor only raises PF105 where earning miners do
        </>
      ),
      rules: ["PF105", "PF106", "PF107"],
      evidence: {
        kind: "fix",
        caption: "The command PF105 hands you, with your netuid filled in",
        fix: {
          kind: "command",
          text: "btcli axon set --netuid <netuid> --ip <public-ip> --port 8091 --network finney",
          note: "Use the public address validators can reach; the miner process must listen on that port",
        },
      },
    },
    {
      gate: "Scored",
      title: "No validator has scored it",
      body: (
        <>
          The most common answer. The miner is registered and may well be reachable, but none of the permitted validators&apos; latest{" "}
          <Term name="Weights">weights</Term> include it. The evidence lists the biggest validators and when each last set weights, so you can tell a quiet subnet
          from a miner that is being skipped
        </>
      ),
      rules: ["PF108", "PF109"],
      evidence: { kind: "finding", caption: `UID 0 on SN64, block ${formatInt(unscored.block)}`, open: true, ...unscored },
    },
    {
      gate: "Above kappa",
      title: "It is scored, but consensus clips it to zero",
      body: (
        <>
          Some validators weight it, but together they hold less than <Term name="Kappa">kappa</Term> of the stake, so Yuma Consensus throws the weight away.{" "}
          <InternalLink href="#consensus">Chapter 4</InternalLink> lets you try it with real SN64 stakes
        </>
      ),
      rules: ["PF110", "PF111"],
      evidence: {
        kind: "fix",
        caption: "What PF110 tells you to do",
        fix: { kind: "info", text: "More of the large validators need to score this UID; check it answers their queries" },
      },
    },
    {
      gate: "Subnet pays",
      title: "The subnet itself is not paying miners",
      body: "Sometimes the miner is fine and the subnet is not. On SN26 at this block, three of its five validators had stopped setting weights and the owner's burn UID took all of the miner incentive, so a new miner there had nothing to win. Preflight reports these as signals about the subnet, never as verdicts",
      rules: ["PF304", "PF305", "PF306"],
      evidence: { kind: "finding", caption: `SN26, block ${formatInt(quietSubnet.block)}`, open: false, ...quietSubnet },
    },
  ];
}

function EvidenceBlock({ evidence }: { evidence: Evidence }) {
  if (evidence.kind === "fix") {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-faint">{evidence.caption}</p>
        <FixBlock fix={evidence.fix} />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-2 text-xs text-faint">
        <span aria-hidden className="size-1.5 rounded-full bg-healthy" />
        Recorded finding, {evidence.caption}
      </p>
      <FindingList findings={evidence.findings} block={evidence.block} learn={false} defaultOpen={evidence.open} />
    </div>
  );
}

/** The five gates as a track, each a jump to its cause below */
function GateStrip({ gates }: { gates: string[] }) {
  return (
    <nav aria-label="The five causes, in order" data-reveal className="panel px-2 pt-5 pb-4 sm:px-6">
      <p className="px-2 text-[13px] text-muted-foreground sm:px-1">A miner earns only when it passes all five, in this order. Tap one to jump to it</p>
      <ol className="relative mt-5 grid grid-cols-5">
        <span aria-hidden className="absolute top-[15px] right-[10%] left-[10%] h-px bg-line-strong" />
        {gates.map((gate, i) => (
          <li key={gate} className="relative z-10 flex justify-center">
            <a href={`#cause-${i + 1}`} className="group flex flex-col items-center gap-2 rounded-lg px-1 text-center">
              <span className="grid size-[30px] place-items-center rounded-full bg-surface font-mono text-[12px] font-semibold text-accent-ink shadow-[0_0_0_1px_var(--accent)] transition-colors group-hover:bg-accent group-hover:text-accent-contrast">
                {i + 1}
              </span>
              <span className="text-[11px] leading-4 font-medium text-muted-foreground transition-colors group-hover:text-foreground sm:text-[13px]">{gate}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function ZeroCauses() {
  const list = causes();
  return (
    <div className="flex flex-col gap-10">
      <GateStrip gates={list.map((c) => c.gate)} />
      <ol className="flex flex-col">
        {list.map((cause, i) => (
          <li key={cause.title} id={`cause-${i + 1}`} className="relative grid scroll-mt-44 grid-cols-1 gap-5 pb-12 last:pb-0 sm:pl-14 lg:scroll-mt-24">
            <span
              aria-hidden
              className="absolute top-0 left-0 hidden size-8 place-items-center rounded-full bg-surface font-mono text-[13px] font-semibold text-foreground shadow-[0_0_0_1px_var(--line-strong)] sm:grid"
            >
              {i + 1}
            </span>
            {i < list.length - 1 && <span aria-hidden className="absolute top-10 bottom-2 left-4 hidden w-px bg-line sm:block" />}
            <div className="flex min-w-0 flex-col gap-3">
              <h3 className="flex gap-2.5 pt-0.5 text-subtitle font-semibold text-balance text-foreground">
                <span className="font-mono text-accent-ink sm:hidden" aria-hidden>
                  {i + 1}
                </span>
                <span>
                  <span className="sr-only">Cause {i + 1}: </span>
                  {cause.title}
                </span>
              </h3>
              <Prose>
                <p>{cause.body}</p>
              </Prose>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-xs text-faint">Caught by</span>
                {cause.rules.map((id) => (
                  <RuleChip key={id} id={id} />
                ))}
              </div>
            </div>
            <EvidenceBlock evidence={cause.evidence} />
          </li>
        ))}
      </ol>
      <aside className="flex gap-3 rounded-xl bg-surface-2/60 px-4 py-4 shadow-[0_0_0_1px_var(--line)] sm:px-5">
        <Info className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden />
        <p className="text-[15px] leading-[26px] text-muted-foreground">
          <span className="font-medium text-foreground">Not every zero is a problem.</span> For ImmunityPeriod blocks after registering, 5,000 on SN64 or about
          16.7 hours, earning nothing is normal while validators find you. <RuleChip id="PF103" className="mx-0.5 h-5 align-[1px]" /> tells you how much of
          that window is left
        </p>
      </aside>
    </div>
  );
}
