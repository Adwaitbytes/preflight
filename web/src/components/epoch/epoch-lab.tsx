"use client";

import { CircleCheck, CircleDashed, RotateCw, Search, TriangleAlert, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useAppState } from "@/components/site/app-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiErrorState } from "@/components/ui/state";
import { buildWhatIf, consensusCut, countdown, epochDelta, epochHref, type WhatIfDraft } from "@/lib/epoch";
import { formatInt, formatShare, truncateMiddle } from "@/lib/format";
import { NETWORK_LABEL, type NetworkId } from "@/lib/networks";
import { classifyInput } from "@/lib/route-input";
import type { EpochCheck, EpochPreview, EpochWhatIf } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DeltaBadge, MinersTable, ValidatorsTable } from "./epoch-tables";
import { useEpochCheck, useEpochPreview, type Loaded } from "./use-epoch";
import { WhatIfPanel } from "./whatif-panel";

function Stat({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <div className="flex min-w-0 flex-col bg-surface px-4 py-3.5 sm:px-5 sm:py-4">
      <dt className="eyebrow truncate">{label}</dt>
      <dd className="mt-1.5 text-xl leading-7 font-semibold tracking-[-0.025em] tnum sm:text-2xl sm:leading-8">{value}</dd>
      <dd className="mt-0.5 truncate text-xs text-faint tnum">{caption}</dd>
    </div>
  );
}

function Verified({ check }: { check: Loaded<EpochCheck> }) {
  if (check.status === "loading") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted-foreground shadow-[0_0_0_1px_var(--line)]">
        <CircleDashed className="size-3.5 animate-spin [animation-duration:2.4s] motion-reduce:animate-none" aria-hidden />
        Checking the last epoch against the chain
      </span>
    );
  }
  if (check.status === "failed") return null;
  const c = check.data;
  return (
    <span
      title={c.headline}
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", c.matched ? "bg-healthy-soft text-healthy" : "bg-medium-soft text-medium")}
    >
      {c.matched ? <CircleCheck className="size-3.5" aria-hidden /> : <TriangleAlert className="size-3.5" aria-hidden />}
      {c.matched ? `Last epoch matched the chain: ${formatInt(c.uids)} of ${formatInt(c.uids)} UIDs exact` : `Last epoch: ${formatInt(c.exact)} of ${formatInt(c.uids)} UIDs exact, ${formatShare(c.total_error, 2)} off`}
      <span className="sr-only">. {c.headline}</span>
    </span>
  );
}

function Hero({ preview, check, network }: { preview: EpochPreview; check: Loaded<EpochCheck>; network: NetworkId }) {
  const voting = preview.validators.filter((v) => v.status === "voting").length;
  return (
    <section aria-label="Next epoch" className="panel overflow-hidden">
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p className="eyebrow">
            {NETWORK_LABEL[network]} · SN{preview.netuid} {preview.name}
          </p>
          <Verified check={check} />
        </div>
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-sans leading-none font-semibold tracking-[-0.045em]">
          <span className="text-[2.5rem] sm:text-[3.25rem]">{countdown(preview.seconds_until)}</span>
          <span className="text-title font-medium tracking-[-0.015em] text-muted-foreground">next epoch, block {formatInt(preview.epoch_block)}</span>
        </p>
        <h2 className="max-w-[70ch] text-[15px] leading-7 text-pretty text-muted-foreground">{preview.headline}</h2>
      </div>
      <dl className="grid grid-cols-2 gap-px border-t border-line bg-line sm:grid-cols-4">
        <Stat label="Earning next" value={formatInt(preview.earners_next)} caption={`${formatInt(preview.earners_now)} earn now`} />
        <Stat label="Validators voting" value={`${voting} of ${preview.validators.length}`} caption="with a permit" />
        <Stat label="Consensus cuts" value={formatShare(consensusCut(preview), 1)} caption="of all weight" />
        <Stat label="Kappa" value={formatShare(preview.kappa, 0)} caption="stake that must agree" />
      </dl>
    </section>
  );
}

function Focus({ preview }: { preview: EpochPreview }) {
  const focus = preview.focus;
  if (!focus) {
    return (
      <div role="status" className="panel px-5 py-4 text-sm text-muted-foreground">
        {preview.headline}
      </div>
    );
  }
  return (
    <section aria-label={`UID ${focus.uid}`} className="panel flex flex-col gap-3 border-l-2 border-l-accent p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
      <div className="flex items-center gap-3">
        <DeltaBadge delta={epochDelta(focus)} />
        <p className="font-mono text-sm font-semibold">UID {focus.uid}</p>
      </div>
      <p className="font-mono text-[15px] tnum">
        <span className="text-faint">{formatShare(focus.incentive_now, 3)}</span>
        <span className="mx-2 text-faint">→</span>
        <span className="font-semibold">{formatShare(focus.incentive_next, 3)}</span>
      </p>
      <p className="min-w-0 text-sm leading-6 text-pretty text-muted-foreground sm:flex-1">{focus.reason}</p>
    </section>
  );
}

function HotkeyForm({ network, netuid, hotkey }: { network: NetworkId; netuid: number; hotkey: string | null }) {
  const router = useRouter();
  const [value, setValue] = useState(hotkey ?? "");
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="flex flex-col gap-1.5"
      onSubmit={(event) => {
        event.preventDefault();
        const text = value.trim();
        if (text && classifyInput(text).kind !== "hotkey") {
          setError("That is not an ss58 hotkey");
          return;
        }
        setError(null);
        router.push(epochHref(network, netuid, text || null));
      }}
    >
      <div className="flex gap-2">
        <label htmlFor="epoch-hotkey" className="sr-only">
          Your hotkey
        </label>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint" aria-hidden />
          <input
            id="epoch-hotkey"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Lead with your hotkey, 5…"
            spellCheck={false}
            autoComplete="off"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "epoch-hotkey-error" : undefined}
            className="h-10 w-full rounded-lg bg-surface pr-3 pl-9 font-mono text-sm shadow-[0_0_0_1px_var(--line-strong)] outline-none placeholder:font-sans placeholder:text-faint focus-visible:shadow-[0_0_0_2px_var(--ring)]"
          />
        </div>
        <Button type="submit" variant="secondary" className="h-10">
          Show
        </Button>
      </div>
      {error && (
        <p id="epoch-hotkey-error" className="text-xs text-critical">
          {error}
        </p>
      )}
    </form>
  );
}

function LabSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy>
      <span className="sr-only" role="status">
        Computing the next epoch from live state
      </span>
      <Skeleton className="h-[15.5rem] w-full rounded-xl" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}

export function EpochLab({ network, netuid, hotkey }: { network: NetworkId; netuid: number; hotkey: string | null }) {
  const { offline } = useAppState();
  const live = useEpochPreview(network, netuid, hotkey, null, offline);
  const check = useEpochCheck(network, netuid, offline, live.status === "ready");
  const [draft, setDraft] = useState<WhatIfDraft | null>(null);
  const [applied, setApplied] = useState<EpochWhatIf | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);
  const tried = useEpochPreview(network, netuid, hotkey, applied, offline, applied !== null && !offline);

  const baseline = live.status === "ready" ? live.data : null;
  const liveNext = useMemo(() => (baseline ? new Map(baseline.miners.map((m) => [m.uid, m.incentive_next])) : null), [baseline]);

  if (live.status === "loading") return <LabSkeleton />;
  if (live.status === "failed") {
    return (
      <ApiErrorState
        error={live.error}
        action={
          <Button onClick={live.retry}>
            <RotateCw className="size-3.5" aria-hidden />
            Retry
          </Button>
        }
      />
    );
  }

  const preview = live.data;
  const current: WhatIfDraft = draft ?? { kappa: preview.kappa, offline: [], tested: null };
  const showing = applied && tried.status === "ready" ? tried.data : preview;
  const busy = applied !== null && tried.status === "loading";

  const run = () => {
    if (offline) {
      setDraftError("What-ifs compute live; turn offline mode off to run one");
      return;
    }
    const built = buildWhatIf(current, preview.kappa);
    if (!built.ok) {
      setDraftError(built.error);
      return;
    }
    setDraftError(null);
    setApplied(built.whatif);
  };
  const reset = () => {
    setDraft(null);
    setApplied(null);
    setDraftError(null);
  };
  const toggleOffline = (uid: number) =>
    setDraft({ ...current, offline: current.offline.includes(uid) ? current.offline.filter((u) => u !== uid) : [...current.offline, uid] });
  const test = (uid: number) => {
    setDraft({ ...current, tested: current.tested?.uid === uid ? null : { uid, text: current.tested?.text ?? "" } });
    document.getElementById("epoch-whatif")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="rise-in flex flex-col gap-4">
      <Hero preview={showing} check={check} network={network} />
      {applied && (
        <div role="status" className="flex flex-col gap-3 rounded-xl bg-accent-soft px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-pretty">
            <span className="font-semibold text-accent-ink">What-if: </span>
            {tried.status === "ready" ? (tried.data.whatif ?? []).join("; ") : tried.status === "failed" ? tried.error.message : "computing"}
          </p>
          <Button size="sm" variant="secondary" onClick={reset}>
            <Undo2 className="size-3.5" aria-hidden />
            Back to live
          </Button>
        </div>
      )}
      {hotkey ? <Focus preview={showing} /> : <HotkeyForm network={network} netuid={netuid} hotkey={hotkey} />}
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <MinersTable miners={showing.miners} focusUid={showing.focus?.uid ?? null} baseline={applied && tried.status === "ready" ? liveNext : null} />
          <ValidatorsTable
            validators={preview.validators.map((v) => showing.validators.find((s) => s.uid === v.uid) ?? v)}
            offline={new Set(current.offline)}
            tested={current.tested?.uid ?? null}
            onToggleOffline={toggleOffline}
            onTest={test}
          />
        </div>
        <div id="epoch-whatif" className="scroll-mt-20">
          <WhatIfPanel
            draft={current}
            liveKappa={preview.kappa}
            validatorUids={preview.validators.map((v) => v.uid)}
            error={draftError ?? (applied && tried.status === "failed" ? tried.error.message : null)}
            busy={busy}
            applied={applied !== null}
            onChange={setDraft}
            onRun={run}
            onReset={reset}
          />
        </div>
      </div>
      <ul className="flex flex-col gap-1.5 text-xs leading-5 text-faint">
        {showing.notes.map((note) => (
          <li key={note} className="text-pretty">
            {note}
          </li>
        ))}
        {hotkey && (
          <li>
            Showing UID for {truncateMiddle(hotkey, 6, 4)}.{" "}
            <a href={epochHref(network, netuid)} className="underline underline-offset-2 hover:text-foreground">
              Show the whole subnet
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}
