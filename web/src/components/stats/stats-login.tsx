"use client";

import { ArrowRight, LockKeyhole } from "lucide-react";
import { useActionState } from "react";
import { login, type LoginState } from "@/app/stats/actions";
import { Button } from "@/components/ui/button";

export function StatsLogin({ enabled }: { enabled: boolean }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, { error: null });
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center py-20 sm:py-28">
      <div className="grid size-11 place-items-center rounded-xl bg-surface-2 text-muted-foreground shadow-[0_0_0_1px_var(--line-strong)]">
        <LockKeyhole className="size-5" aria-hidden />
      </div>
      <h1 className="mt-5 text-title font-semibold tracking-[-0.02em]">Private stats</h1>
      <p className="mt-2 text-center text-sm leading-6 text-pretty text-muted-foreground">
        Who uses Preflight, from where, for how long, and what they run. Anonymous: no IPs, hotkeys or cookies on the public site.
      </p>
      {enabled ? (
        <form action={action} className="mt-8 flex w-full flex-col gap-3">
          <label htmlFor="stats-password" className="text-[13px] font-medium">
            Password
          </label>
          <input
            id="stats-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            autoFocus
            aria-invalid={state.error ? true : undefined}
            aria-describedby={state.error ? "stats-error" : undefined}
            className="h-11 w-full rounded-lg bg-surface-2 px-3 text-[15px] shadow-[0_0_0_1px_var(--line-strong)] outline-none focus-visible:shadow-[0_0_0_2px_var(--ring)] aria-invalid:shadow-[0_0_0_1.5px_var(--critical)]"
          />
          {state.error && (
            <p id="stats-error" role="alert" className="text-sm text-critical">
              {state.error}
            </p>
          )}
          <Button type="submit" variant="primary" size="lg" disabled={pending} className="mt-1">
            {pending ? "Checking" : "Open stats"}
            {!pending && <ArrowRight className="size-4" aria-hidden />}
          </Button>
        </form>
      ) : (
        <p role="status" className="mt-8 rounded-lg bg-surface-2 px-4 py-3 text-center text-sm text-muted-foreground shadow-[0_0_0_1px_var(--line)]">
          Stats are switched off. Set <code className="font-mono text-[13px]">STATS_PASSWORD</code> on the server to turn them on.
        </p>
      )}
    </div>
  );
}
