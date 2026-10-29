"use client";

import { Link2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { track } from "@/lib/analytics";
import type { ApiError } from "@/lib/api";
import { shareReport } from "@/lib/client-calls";
import type { ShareKind } from "@/lib/schemas";
import type { DoctorReport, SimResult, TxReport } from "@/lib/types";

type ShareProps =
  | { kind: "doctor"; payload: DoctorReport }
  | { kind: "tx"; payload: TxReport }
  | { kind: "sim"; payload: SimResult };

/** Stores this exact result and hands back a permanent /d/<id> link. Nothing is shared until clicked */
export function ShareButton(props: ShareProps & { className?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [pending, startTransition] = useTransition();
  const kind: ShareKind = props.kind;

  function share() {
    setError(null);
    startTransition(async () => {
      const result = await shareReport(kind, props.payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      track("share", kind);
      const link = `${window.location.origin}/d/${result.data.id}`;
      setUrl(link);
      try {
        await navigator.clipboard.writeText(link);
      } catch {
        // Clipboard can be denied; the link stays visible with its own copy button
      }
    });
  }

  if (url) {
    return (
      <div className="flex h-8 max-w-full min-w-0 items-center gap-1 rounded-lg bg-surface-2 pr-0.5 pl-3 shadow-[0_0_0_1px_var(--line-strong)]" role="status">
        <span className="sr-only">Share link created and copied: </span>
        <a href={url} className="min-w-0 truncate font-mono text-xs text-accent-ink hover:underline hover:underline-offset-4">
          {url.replace(/^https?:\/\//, "")}
        </a>
        <CopyButton value={url} label="Copy share link" size="xs" />
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Button variant="secondary" size="sm" onClick={share} disabled={pending} className={props.className}>
        <Link2 className="size-3.5" aria-hidden />
        {pending ? "Creating link" : "Share"}
      </Button>
      {error && (
        <span role="alert" className="truncate text-xs text-faint" title={error.message}>
          {error.kind === "offline_miss" ? "Sharing is off in the offline demo" : "Could not create a link"}
        </span>
      )}
    </div>
  );
}
