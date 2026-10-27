"use client";

import { FlaskConical } from "lucide-react";
import { useId, useState, useTransition } from "react";
import { useAppState } from "@/components/site/app-state";
import { Button } from "@/components/ui/button";
import { ApiErrorState } from "@/components/ui/state";
import type { ApiResult, SimAction } from "@/lib/api";
import { simulate } from "@/lib/client-calls";
import { NETWORK_LABEL, NETWORKS, parseNetwork, type NetworkId } from "@/lib/networks";
import type { SimRequest, SimResult } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SimResultView } from "./sim-result";

type Field = "coldkey" | "hotkey" | "netuid" | "amount" | "uids" | "weights" | "version_key" | "ip" | "port" | "balance_override_tao";

interface ActionSpec {
  id: SimAction;
  label: string;
  fields: Field[];
  hint: string;
}

const ACTIONS: ActionSpec[] = [
  { id: "burned_register", label: "Register (burn)", fields: ["coldkey", "hotkey", "netuid", "balance_override_tao"], hint: "Burns the current registration cost for a UID" },
  { id: "add_stake", label: "Add stake", fields: ["coldkey", "hotkey", "netuid", "amount"], hint: "Swaps TAO into the subnet pool; shows alpha received and slippage" },
  { id: "remove_stake", label: "Remove stake", fields: ["coldkey", "hotkey", "netuid", "amount"], hint: "Swaps alpha back to TAO through the pool" },
  { id: "set_weights", label: "Set weights", fields: ["hotkey", "netuid", "uids", "weights", "version_key"], hint: "Checks permit, rate limit, version key and weight limits" },
  { id: "serve_axon", label: "Serve axon", fields: ["hotkey", "netuid", "ip", "port"], hint: "Checks the address validators would see" },
  { id: "register_network", label: "Register subnet", fields: ["coldkey", "hotkey", "balance_override_tao"], hint: "Shows the lock cost and whether the cap replaces a subnet" },
  { id: "start_call", label: "Start call", fields: ["coldkey", "netuid"], hint: "Starts emissions on a subnet you own" },
];

const DEFAULT_ACTION: ActionSpec = { id: "burned_register", label: "Register (burn)", fields: ["coldkey", "hotkey", "netuid", "balance_override_tao"], hint: "" };

const LABEL: Record<Field, { label: string; placeholder: string; mono?: boolean; help?: string }> = {
  coldkey: { label: "Coldkey", placeholder: "5... signing coldkey", mono: true },
  hotkey: { label: "Hotkey", placeholder: "5... hotkey", mono: true },
  netuid: { label: "Netuid", placeholder: "64" },
  amount: { label: "Amount", placeholder: "1.5", help: "TAO for add stake, alpha for remove stake" },
  uids: { label: "UIDs", placeholder: "1, 59", mono: true, help: "Comma separated" },
  weights: { label: "Weights", placeholder: "32768, 32767", mono: true, help: "u16 values, same order as UIDs" },
  version_key: { label: "Version key", placeholder: "0" },
  ip: { label: "IP", placeholder: "203.0.113.7", mono: true },
  port: { label: "Port", placeholder: "8091" },
  balance_override_tao: { label: "Pretend balance", placeholder: "Optional, TAO", help: "Fork mode only: simulate as if the coldkey held this much" },
};

const EXAMPLES: Partial<Record<SimAction, Partial<Record<Field, string>>>> = {
  burned_register: { coldkey: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", hotkey: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", netuid: "64" },
  set_weights: { hotkey: "5EKtvzbEvYZPRJdo42ug7mWrHdt4AurCNMs5CAefuBHfQmhq", netuid: "64", uids: "1, 59", weights: "32768, 32767" },
};

const SS58 = /^[1-9A-HJ-NP-Za-km-z]{46,48}$/;

function toList(value: string): number[] | null {
  const parts = value.split(/[\s,]+/).filter(Boolean);
  const numbers = parts.map(Number);
  return numbers.every((n) => Number.isInteger(n) && n >= 0 && n <= 65535) ? numbers : null;
}

/** Builds the request and reports the first problem in words, so the API never sees junk */
export function buildRequest(action: SimAction, fields: Field[], values: Partial<Record<Field, string>>): { request: SimRequest } | { error: string; field: Field } {
  const request: SimRequest = { action };
  for (const field of fields) {
    const raw = (values[field] ?? "").trim();
    const optional = field === "balance_override_tao" || field === "version_key";
    if (!raw) {
      if (optional) continue;
      return { error: `${LABEL[field].label} is required`, field };
    }
    switch (field) {
      case "coldkey":
      case "hotkey":
        if (!SS58.test(raw)) return { error: `${LABEL[field].label} is not an ss58 address`, field };
        request[field] = raw;
        break;
      case "netuid":
      case "port":
      case "version_key": {
        const n = Number(raw);
        if (!Number.isInteger(n) || n < 0) return { error: `${LABEL[field].label} must be a whole number`, field };
        request[field] = n;
        break;
      }
      case "amount":
      case "balance_override_tao": {
        const n = Number(raw);
        if (!Number.isFinite(n) || n < 0) return { error: `${LABEL[field].label} must be a positive number`, field };
        request[field] = n;
        break;
      }
      case "uids":
      case "weights": {
        const list = toList(raw);
        if (!list) return { error: `${LABEL[field].label} must be whole numbers from 0 to 65535`, field };
        request[field] = list;
        break;
      }
      case "ip":
        request.ip = raw;
        break;
    }
  }
  if (request.uids && request.weights && request.uids.length !== request.weights.length) {
    return { error: "UIDs and weights must have the same length", field: "weights" };
  }
  return { request };
}

const INPUT =
  "h-10 w-full min-w-0 rounded-lg bg-surface-2 px-3 text-sm text-foreground shadow-[0_0_0_1px_var(--line)] outline-none placeholder:text-faint focus-visible:shadow-[0_0_0_2px_var(--ring)] aria-invalid:shadow-[0_0_0_1.5px_var(--critical)]";

export function Simulator({ forkAvailable }: { forkAvailable: boolean }) {
  const { network: preferred, localAvailable } = useAppState();
  const formId = useId();
  const [action, setAction] = useState<SimAction>("burned_register");
  const [network, setNetwork] = useState<NetworkId | null>(null);
  const [values, setValues] = useState<Partial<Record<Field, string>>>(EXAMPLES.burned_register ?? {});
  const [problem, setProblem] = useState<{ error: string; field: Field } | null>(null);
  const [result, setResult] = useState<ApiResult<SimResult> | null>(null);
  const [pending, startTransition] = useTransition();

  const selected = ACTIONS.find((a) => a.id === action) ?? DEFAULT_ACTION;
  const activeNetwork = network ?? (preferred === "local" && !localAvailable ? "finney" : preferred);
  const networks = NETWORKS.filter((n) => n !== "local" || localAvailable);

  function pick(next: SimAction) {
    setAction(next);
    setValues(EXAMPLES[next] ?? {});
    setProblem(null);
    setResult(null);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const built = buildRequest(action, selected.fields, values);
    if ("error" in built) {
      setProblem(built);
      document.getElementById(`${formId}-${built.field}`)?.focus();
      return;
    }
    setProblem(null);
    startTransition(async () => {
      setResult(await simulate(activeNetwork, built.request));
    });
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
      <form onSubmit={submit} className="panel flex flex-col gap-5 p-5 sm:p-6" noValidate aria-describedby={`${formId}-mode`}>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-xs font-medium text-faint">Action</legend>
          <div className="grid grid-cols-2 gap-1.5">
            {ACTIONS.map((a) => (
              <label
                key={a.id}
                className={cn(
                  "flex h-9 cursor-pointer items-center justify-center rounded-lg px-2 text-[13px] font-medium text-muted-foreground shadow-[0_0_0_1px_var(--line)] transition-colors hover:text-foreground has-checked:bg-surface-3 has-checked:text-foreground has-checked:shadow-[0_0_0_1px_var(--line-strong)] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring",
                )}
              >
                <input type="radio" name="action" value={a.id} checked={action === a.id} onChange={() => pick(a.id)} className="sr-only" />
                {a.label}
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs leading-5 text-faint">{selected.hint}</p>
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${formId}-network`} className="text-xs font-medium text-faint">
            Network
          </label>
          <select
            id={`${formId}-network`}
            value={activeNetwork}
            onChange={(e) => setNetwork(parseNetwork(e.target.value))}
            className={cn(INPUT, "cursor-pointer appearance-none")}
          >
            {networks.map((n) => (
              <option key={n} value={n}>
                {NETWORK_LABEL[n]}
              </option>
            ))}
          </select>
        </div>

        {selected.fields.map((field) => {
          const meta = LABEL[field];
          const id = `${formId}-${field}`;
          const invalid = problem?.field === field;
          return (
            <div key={field} className="flex flex-col gap-1.5">
              <label htmlFor={id} className="text-xs font-medium text-faint">
                {meta.label}
              </label>
              <input
                id={id}
                value={values[field] ?? ""}
                onChange={(e) => setValues((prev) => ({ ...prev, [field]: e.target.value }))}
                placeholder={meta.placeholder}
                inputMode={field === "netuid" || field === "port" || field === "version_key" ? "numeric" : field === "amount" || field === "balance_override_tao" ? "decimal" : undefined}
                spellCheck={false}
                autoComplete="off"
                aria-invalid={invalid || undefined}
                aria-describedby={invalid ? `${formId}-problem` : meta.help ? `${id}-help` : undefined}
                className={cn(INPUT, meta.mono && "font-mono text-[13px]")}
              />
              {meta.help && !invalid && (
                <p id={`${id}-help`} className="text-xs text-faint">
                  {meta.help}
                </p>
              )}
              {invalid && (
                <p id={`${formId}-problem`} className="text-xs text-critical">
                  {problem.error}
                </p>
              )}
            </div>
          );
        })}

        <Button type="submit" variant="accent" size="lg" disabled={pending}>
          <FlaskConical aria-hidden />
          {pending ? "Simulating" : "Simulate"}
        </Button>
        <p id={`${formId}-mode`} className="text-xs leading-5 text-faint">
          {activeNetwork === "local" || forkAvailable
            ? "This network has a Chopsticks fork, so the real runtime executes the call. Nothing is broadcast"
            : "Nothing is broadcast. Each result says whether it ran on a fork or was predicted from live state and runtime rules"}
        </p>
      </form>

      <div aria-live="polite" className="min-w-0">
        {!result && !pending && (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-xl px-6 py-12 text-center shadow-[inset_0_0_0_1px_var(--line-strong)] [background-image:radial-gradient(var(--line)_1px,transparent_1px)] [background-size:16px_16px]">
            <FlaskConical className="size-5 text-faint" aria-hidden />
            <p className="mt-3 text-sm font-medium text-foreground">Try it before you pay for it</p>
            <p className="mt-1 max-w-[40ch] text-[13px] leading-5 text-muted-foreground">
              The example is a coldkey with 0 TAO registering on SN64. Press Simulate to see why it would fail before a rao moves
            </p>
          </div>
        )}
        {pending && (
          <div className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-xl shadow-[inset_0_0_0_1px_var(--line-strong)]">
            <span className="size-5 animate-spin rounded-full border-2 border-line-strong border-t-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">Executing against chain state</p>
          </div>
        )}
        {result && !pending && (result.ok ? <SimResultView result={result.data} /> : <ApiErrorState error={result.error} />)}
      </div>
    </div>
  );
}
