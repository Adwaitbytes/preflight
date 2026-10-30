"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useAppState } from "@/components/site/app-state";
import { NETWORK_LABEL, type NetworkId } from "@/lib/networks";
import { cn } from "@/lib/utils";

const SS58 = /^[1-9A-HJ-NP-Za-km-z]{46,48}$/;
const CHOICES: NetworkId[] = ["finney", "test"];

/** Paste any address and pick the network; testnet works too */
export function AccountLookup() {
  const router = useRouter();
  const { network: current } = useAppState();
  const [network, setNetwork] = useState<NetworkId>(current === "local" ? "finney" : current);
  const [value, setValue] = useState("");
  const [pending, startTransition] = useTransition();
  const address = value.trim();
  const valid = SS58.test(address);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (valid) startTransition(() => router.push(`/account/${network}/${address}`));
      }}
      className="flex w-full max-w-3xl flex-col gap-4"
    >
      <div role="radiogroup" aria-label="Network" className="inline-flex w-fit rounded-full bg-surface-2 p-1 shadow-[0_0_0_1px_var(--line)]">
        {CHOICES.map((id) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={network === id}
            onClick={() => setNetwork(id)}
            className={cn(
              "h-9 cursor-pointer rounded-full px-4 text-sm font-medium transition-colors",
              network === id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {id === "finney" ? "Mainnet" : NETWORK_LABEL[id]}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-2xl bg-surface p-2 pl-5 shadow-(--shadow-float) focus-within:shadow-[0_0_0_2px_var(--ring)]">
        <label htmlFor="account-address" className="sr-only">
          Coldkey or hotkey address
        </label>
        <input
          id="account-address"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Coldkey or hotkey address, 5…"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-invalid={(address.length > 0 && !valid) || undefined}
          className="h-12 min-w-0 flex-1 bg-transparent font-mono text-[15px] outline-none placeholder:font-sans placeholder:text-faint"
        />
        <button
          type="submit"
          disabled={!valid || pending}
          className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-foreground px-4 text-sm font-medium text-background transition-colors disabled:cursor-default disabled:bg-surface-3 disabled:text-muted-foreground"
        >
          {pending ? "Reading" : "Look up"}
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
      <p className="min-h-5 px-1 text-[13px] text-critical">{address.length > 0 && !valid ? "That does not look like a Bittensor address" : ""}</p>
    </form>
  );
}
