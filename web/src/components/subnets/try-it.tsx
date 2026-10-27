"use client";

import { Play, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { JsonView } from "@/components/ui/json-view";

const URL_IN_CURL = /https?:\/\/[^\s"']+/;
const KEY_VAR = /\$[A-Z][A-Z0-9_]*/g;

type RunState = { status: "idle" } | { status: "running" } | { status: "done"; code: number; body: string; ms: number } | { status: "failed"; message: string };
const MAX_BODY = 2_000_000;

/**
 * Shows a subnet's public API example. A key typed here lives only in this component's state:
 * it is substituted into the command and sent straight from the browser, never to Preflight.
 */
export function TryIt({ name, example, needsKey }: { name: string; example: string; needsKey: boolean }) {
  const keyId = useId();
  const [key, setKey] = useState("");
  const [run, setRun] = useState<RunState>({ status: "idle" });
  const command = key ? example.replace(KEY_VAR, key) : example;
  const url = URL_IN_CURL.exec(example)?.[0] ?? null;
  const isGet = !/\s-X\s*(POST|PUT|DELETE|PATCH)|\s(-d|--data)\s/.test(example);
  const canRun = !!url && isGet && (!needsKey || key.length > 0);

  async function send() {
    if (!url) return;
    setRun({ status: "running" });
    const started = performance.now();
    try {
      const response = await fetch(url, {
        headers: needsKey && key ? { Authorization: `Bearer ${key}` } : undefined,
        signal: AbortSignal.timeout(15_000),
      });
      const text = await response.text();
      setRun({ status: "done", code: response.status, body: text.slice(0, MAX_BODY), ms: Math.round(performance.now() - started) });
    } catch {
      setRun({ status: "failed", message: "The request did not complete. The API may block calls from browsers (CORS); run the command in a terminal instead" });
    }
  }

  return (
    <Dialog.Root onOpenChange={(open) => !open && setRun({ status: "idle" })}>
      <Dialog.Trigger asChild>
        <Button variant="accent" size="sm">
          <Play className="size-3.5" aria-hidden />
          Try it
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-surface shadow-(--shadow-float) data-[state=open]:animate-in data-[state=open]:slide-in-from-right">
          <div className="flex items-start gap-3 border-b border-line px-5 py-4">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-[15px] font-semibold">Try the {name} API</Dialog.Title>
              <Dialog.Description className="mt-1 text-[13px] text-muted-foreground">
                The example from the catalog. Run it in a terminal, or send it from this browser
              </Dialog.Description>
            </div>
            <Dialog.Close className="grid size-8 cursor-pointer place-items-center rounded-lg text-faint hover:bg-surface-2 hover:text-foreground" aria-label="Close">
              <X className="size-4" aria-hidden />
            </Dialog.Close>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
            {needsKey && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor={keyId} className="text-[13px] font-medium">
                  Your API key
                </label>
                <input
                  id={keyId}
                  type="password"
                  autoComplete="off"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Paste a key to fill the command"
                  className="h-9 rounded-lg bg-surface-2 px-3 font-mono text-[13px] shadow-[0_0_0_1px_var(--line)] outline-none focus-visible:shadow-[0_0_0_2px_var(--ring)]"
                />
                <p className="text-xs text-faint">Kept in this tab only. Preflight never receives or stores it</p>
              </div>
            )}
            <div className="overflow-hidden rounded-xl bg-background shadow-[0_0_0_1px_var(--line-strong)]">
              <div className="flex items-center border-b border-line px-3.5 py-2">
                <span className="text-xs font-medium text-muted-foreground">Request</span>
                <CopyButton value={command} label="Copy request" size="xs" className="ml-auto -mr-1.5" />
              </div>
              <pre className="overflow-x-auto px-3.5 py-3 font-mono text-[12.5px] leading-6 whitespace-pre">{key ? command.replace(key, "•".repeat(8)) : command}</pre>
            </div>
            {url && isGet && (
              <Button variant="primary" onClick={send} disabled={!canRun || run.status === "running"} className="self-start">
                {run.status === "running" ? "Sending" : "Send from browser"}
              </Button>
            )}
            <div aria-live="polite">
              {run.status === "done" && <JsonView body={run.body} status={run.code} elapsedMs={run.ms} />}
              {run.status === "failed" && <p className="text-[13px] text-muted-foreground">{run.message}</p>}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
