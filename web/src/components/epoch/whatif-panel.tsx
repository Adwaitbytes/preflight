"use client";

import { FlaskConical, Play, RotateCcw, X } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { formatShare } from "@/lib/format";
import type { WhatIfDraft } from "@/lib/epoch";
import { cn } from "@/lib/utils";

export function WhatIfPanel({
  draft,
  liveKappa,
  validatorUids,
  error,
  busy,
  applied,
  onChange,
  onRun,
  onReset,
}: {
  draft: WhatIfDraft;
  liveKappa: number;
  validatorUids: readonly number[];
  error: string | null;
  busy: boolean;
  applied: boolean;
  onChange: (draft: WhatIfDraft) => void;
  onRun: () => void;
  onReset: () => void;
}) {
  const id = useId();
  const kappaMoved = Math.abs(draft.kappa - liveKappa) > 1e-4;
  return (
    <section aria-labelledby={`${id}-title`} className="panel flex flex-col gap-5 p-4 sm:p-5 lg:sticky lg:top-20">
      <div>
        <h2 id={`${id}-title`} className="flex items-center gap-2 text-sm font-semibold">
          <FlaskConical className="size-4 text-accent-ink" aria-hidden />
          What if
        </h2>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">Change the inputs and recompute the same epoch. Nothing touches the chain.</p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor={`${id}-kappa`} className="text-[13px] font-medium">
            Kappa
          </label>
          <span className={cn("font-mono text-xs tnum", kappaMoved ? "font-semibold text-accent-ink" : "text-muted-foreground")}>
            {formatShare(draft.kappa, 0)}
            {kappaMoved && <span className="font-normal text-faint"> (live {formatShare(liveKappa, 0)})</span>}
          </span>
        </div>
        <input
          id={`${id}-kappa`}
          type="range"
          min={0.05}
          max={0.95}
          step={0.01}
          value={draft.kappa}
          onChange={(event) => onChange({ ...draft, kappa: Number(event.target.value) })}
          className="w-full accent-[var(--accent)]"
          aria-describedby={`${id}-kappa-hint`}
        />
        <p id={`${id}-kappa-hint`} className="text-xs leading-5 text-faint">
          The share of validator stake that must agree before a weight counts. Lower lets outliers through.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-medium">Validators offline</p>
        {draft.offline.length === 0 ? (
          <p className="text-xs leading-5 text-faint">None. Use Take offline on any validator to see the epoch without it.</p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {draft.offline.map((uid) => (
              <li key={uid}>
                <button
                  type="button"
                  onClick={() => onChange({ ...draft, offline: draft.offline.filter((u) => u !== uid) })}
                  className="inline-flex items-center gap-1 rounded-md bg-surface-2 px-2 py-1 font-mono text-xs shadow-[0_0_0_1px_var(--line)] hover:bg-surface-3 focus-visible:shadow-[0_0_0_2px_var(--ring)] focus-visible:outline-none"
                >
                  UID {uid}
                  <X className="size-3" aria-hidden />
                  <span className="sr-only">: bring back online</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-validator`} className="text-[13px] font-medium">
          Test a validator’s new weights
        </label>
        <select
          id={`${id}-validator`}
          value={draft.tested?.uid ?? ""}
          onChange={(event) => onChange({ ...draft, tested: event.target.value === "" ? null : { uid: Number(event.target.value), text: draft.tested?.text ?? "" } })}
          className="h-9 rounded-lg bg-surface-2 px-2.5 text-sm shadow-[0_0_0_1px_var(--line)] outline-none focus-visible:shadow-[0_0_0_2px_var(--ring)]"
        >
          <option value="">No validator</option>
          {validatorUids.map((uid) => (
            <option key={uid} value={uid}>
              UID {uid}
            </option>
          ))}
        </select>
        {draft.tested && (
          <>
            <label htmlFor={`${id}-weights`} className="sr-only">
              Weights for UID {draft.tested.uid}, one uid: weight per line or JSON
            </label>
            <textarea
              id={`${id}-weights`}
              rows={4}
              value={draft.tested.text}
              onChange={(event) => onChange({ ...draft, tested: draft.tested && { uid: draft.tested.uid, text: event.target.value } })}
              placeholder={"12: 0.4\n31: 0.6\nor {\"12\": 0.4, \"31\": 0.6}"}
              spellCheck={false}
              className="w-full resize-y rounded-lg bg-surface-2 px-3 py-2 font-mono text-[13px] leading-6 shadow-[0_0_0_1px_var(--line)] outline-none placeholder:text-faint focus-visible:shadow-[0_0_0_2px_var(--ring)]"
            />
            <p className="text-xs leading-5 text-faint">Paste what your validator would set. Any scale; each row is normalized. Its trust shows how much consensus would keep.</p>
          </>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-critical-soft px-3 py-2 text-xs leading-5 text-critical">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <Button variant="primary" className="flex-1" onClick={onRun} disabled={busy}>
          <Play className="size-3.5" aria-hidden />
          {busy ? "Computing" : "Run what-if"}
        </Button>
        <Button variant="secondary" onClick={onReset} disabled={busy || (!applied && !kappaMoved && draft.offline.length === 0 && !draft.tested)}>
          <RotateCcw className="size-3.5" aria-hidden />
          Reset
        </Button>
      </div>
    </section>
  );
}
