"use client";

import { Fragment, useMemo } from "react";
import { CopyButton } from "@/components/ui/copy-button";

const MAX_LINES = 400;
const TOKEN = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

type Shape = { pretty: string; json: boolean; summary: string | null };

function shape(body: string): Shape {
  try {
    const value: unknown = JSON.parse(body);
    return { pretty: JSON.stringify(value, null, 2), json: true, summary: describe(value) };
  } catch {
    return { pretty: body, json: false, summary: null };
  }
}

function describe(value: unknown): string | null {
  if (Array.isArray(value)) return `${value.length} items`;
  if (value && typeof value === "object") {
    const lists = Object.entries(value).filter((entry): entry is [string, unknown[]] => Array.isArray(entry[1]));
    const [only] = lists;
    if (lists.length === 1 && only) return `${only[1].length} ${only[0]}`;
    return `${Object.keys(value).length} fields`;
  }
  return null;
}

function bytes(n: number): string {
  return n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/** Highlights one line of pretty-printed JSON without a parser: strings, keys, literals, numbers. */
function Line({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN)) {
    const at = match.index ?? 0;
    if (at > last) parts.push(text.slice(last, at));
    const [whole, str, colon, literal, num] = match;
    if (str) {
      parts.push(
        <span key={at} className={colon ? "text-foreground" : "text-healthy"}>
          {str}
        </span>,
      );
      if (colon) parts.push(colon);
    } else if (literal) {
      parts.push(<span key={at} className="text-accent-ink">{literal}</span>);
    } else if (num) {
      parts.push(<span key={at} className="text-medium">{num}</span>);
    } else {
      parts.push(whole);
    }
    last = at + whole.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

export function JsonView({ body, status, elapsedMs }: { body: string; status: number; elapsedMs: number | null }) {
  const { pretty, json, summary } = useMemo(() => shape(body), [body]);
  const lines = pretty.split("\n");
  const shown = lines.slice(0, MAX_LINES);
  const ok = status >= 200 && status < 300;
  const meta = [summary, bytes(new TextEncoder().encode(body).length), elapsedMs !== null ? `${elapsedMs} ms` : null].filter(Boolean);

  return (
    <div className="overflow-hidden rounded-xl bg-background shadow-[0_0_0_1px_var(--line-strong)]">
      <div className="flex items-center gap-2 border-b border-line px-3.5 py-2">
        <span className={`inline-flex items-center gap-1.5 font-mono text-xs font-medium ${ok ? "text-healthy" : "text-critical"}`}>
          <span className={`size-1.5 rounded-full ${ok ? "bg-healthy" : "bg-critical"}`} aria-hidden />
          HTTP {status}
        </span>
        <span className="truncate font-mono text-xs text-faint">{meta.join("  ·  ")}</span>
        <CopyButton value={pretty} label="Copy response" size="xs" className="ml-auto -mr-1.5" />
      </div>
      {body ? (
        <pre className="max-h-[28rem] overflow-auto py-3 font-mono text-[12px] leading-5 text-muted-foreground">
          <code className="grid min-w-max grid-cols-[auto_1fr]">
            {shown.map((line, i) => (
              <Fragment key={i}>
                <span className="select-none pr-3 pl-3.5 text-right text-faint/60 tabular-nums">{i + 1}</span>
                <span className="pr-4 whitespace-pre">{json ? <Line text={line} /> : line}</span>
              </Fragment>
            ))}
          </code>
        </pre>
      ) : (
        <p className="px-3.5 py-3 text-[13px] text-muted-foreground">Empty body</p>
      )}
      {lines.length > MAX_LINES && (
        <p className="border-t border-line px-3.5 py-2 text-xs text-faint">
          Showing the first {MAX_LINES} of {lines.length.toLocaleString()} lines. Copy the response for all of it
        </p>
      )}
    </div>
  );
}
