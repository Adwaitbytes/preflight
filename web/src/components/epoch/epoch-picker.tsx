"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppState } from "@/components/site/app-state";
import { Button } from "@/components/ui/button";
import { epochHref, QUICK_SUBNETS } from "@/lib/epoch";
import { classifyInput } from "@/lib/route-input";

/** Pick a subnet, optionally lead with a hotkey, and open its Epoch Lab */
export function EpochPicker() {
  const router = useRouter();
  const { network } = useAppState();
  const [netuid, setNetuid] = useState("");
  const [hotkey, setHotkey] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="panel flex flex-col gap-5 p-5 sm:p-6">
      <form
        className="grid gap-3 sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          const number = Number(netuid);
          if (!/^\d{1,4}$/.test(netuid.trim()) || number > 1024) {
            setError("Enter a subnet number, like 19");
            return;
          }
          const key = hotkey.trim();
          if (key && classifyInput(key).kind !== "hotkey") {
            setError("The hotkey is not an ss58 address; leave it empty to see the whole subnet");
            return;
          }
          setError(null);
          router.push(epochHref(network, number, key || null));
        }}
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pick-netuid" className="text-[13px] font-medium">
            Subnet
          </label>
          <input
            id="pick-netuid"
            inputMode="numeric"
            value={netuid}
            onChange={(event) => setNetuid(event.target.value)}
            placeholder="19"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "pick-error" : undefined}
            className="h-11 rounded-lg bg-surface-2 px-3 font-mono text-[15px] shadow-[0_0_0_1px_var(--line-strong)] outline-none placeholder:text-faint focus-visible:shadow-[0_0_0_2px_var(--ring)]"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor="pick-hotkey" className="text-[13px] font-medium">
            Your hotkey <span className="font-normal text-faint">(optional)</span>
          </label>
          <input
            id="pick-hotkey"
            value={hotkey}
            onChange={(event) => setHotkey(event.target.value)}
            placeholder="5…"
            spellCheck={false}
            aria-invalid={error?.startsWith("The hotkey") ? true : undefined}
            aria-describedby={error?.startsWith("The hotkey") ? "pick-error" : undefined}
            autoComplete="off"
            className="h-11 w-full rounded-lg bg-surface-2 px-3 font-mono text-[15px] shadow-[0_0_0_1px_var(--line-strong)] outline-none placeholder:text-faint focus-visible:shadow-[0_0_0_2px_var(--ring)]"
          />
        </div>
        <Button type="submit" variant="primary" size="lg">
          Preview the epoch
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      </form>
      {error && (
        <p id="pick-error" role="alert" className="-mt-2 text-sm text-critical">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-faint">Try</span>
        {QUICK_SUBNETS.map((n) => (
          <Link
            key={n}
            href={epochHref(network, n)}
            className="rounded-md bg-surface-2 px-2.5 py-1 font-mono text-xs text-muted-foreground shadow-[0_0_0_1px_var(--line)] transition-colors hover:text-foreground focus-visible:shadow-[0_0_0_2px_var(--ring)] focus-visible:outline-none"
          >
            SN{n}
          </Link>
        ))}
      </div>
    </div>
  );
}
