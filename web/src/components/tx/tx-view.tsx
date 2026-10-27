import { CheckCircle2, ExternalLink, XCircle } from "lucide-react";
import { ChainMeta } from "@/components/shared/chain-meta";
import { FixBlock } from "@/components/shared/fix-block";
import { RichText } from "@/components/shared/rich-text";
import { Badge } from "@/components/ui/badge";
import { MonoValue } from "@/components/ui/mono-value";
import { formatBlockIndex, formatInt, formatTao } from "@/lib/format";
import { NETWORK_LABEL, taostatsExtrinsic, type NetworkId } from "@/lib/networks";
import type { TxEvent, TxReport } from "@/lib/types";
import { cn } from "@/lib/utils";
import { WillItWork } from "./will-it-work";

const SS58 = /^5[1-9A-HJ-NP-Za-km-z]{46,47}$/;

function eventTone(event: TxEvent): "fail" | "ok" | "plain" {
  if (event.name === "ExtrinsicFailed") return "fail";
  if (event.name === "ExtrinsicSuccess") return "ok";
  return "plain";
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="text-xs text-faint">{label}</dt>
      <dd className="min-w-0 text-sm text-foreground">{children}</dd>
    </div>
  );
}

export function TxView({ report, network }: { report: TxReport; network: NetworkId }) {
  const explorer = taostatsExtrinsic(network, report.block, report.index);
  const explanation = report.explanation;
  return (
    <div className="flex flex-col gap-8">
      <header className="rise-in flex flex-col gap-6 pt-10 sm:pt-14">
        <p className="eyebrow">Transaction · {NETWORK_LABEL[network]}</p>
        <div className="flex flex-col gap-4">
          <Badge tone={report.success ? "healthy" : "critical"} dot size="md" className="self-start">
            {report.success ? "Succeeded" : "Failed"}
          </Badge>
          <h1 className="min-w-0 font-mono text-[clamp(1.25rem,1rem+1.4vw,2rem)] leading-tight font-medium tracking-[-0.02em] break-words">
            <span className="text-faint">{report.pallet}.</span>
            {report.call}
          </h1>
          {report.failure && (
            <p className="text-[15px] text-muted-foreground">
              Failed with{" "}
              <span className="font-mono text-critical">
                {report.failure.pallet}.{report.failure.error}
              </span>
            </p>
          )}
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl bg-surface px-4 py-4 shadow-[0_0_0_1px_var(--line)] sm:grid-cols-4 sm:px-5">
          <Meta label="Extrinsic">
            <span className="font-mono">{formatBlockIndex(report.block, report.index)}</span>
          </Meta>
          <Meta label="Fee">
            <span className="font-mono">{report.fee_tao == null ? "n/a" : formatTao(report.fee_tao)}</span>
          </Meta>
          <Meta label="Signer">{report.signer ? <MonoValue value={report.signer} label="signer" /> : <span className="text-faint">Unsigned</span>}</Meta>
          <Meta label="Hash">{report.extrinsic_hash ? <MonoValue value={report.extrinsic_hash} label="extrinsic hash" /> : <span className="text-faint">n/a</span>}</Meta>
        </dl>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ChainMeta chain={report.chain} />
          {explorer && (
            <a
              href={explorer}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 self-start rounded text-[13px] font-medium text-muted-foreground hover:text-foreground"
            >
              Open on Taostats
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          )}
        </div>
      </header>

      {explanation && (
        <section aria-labelledby="why" className="panel flex flex-col gap-5 p-5 sm:p-7">
          <div className="flex flex-col gap-2">
            <p className="eyebrow">Why it failed</p>
            <h2 id="why" className="text-title font-semibold text-balance">
              {explanation.title}
            </h2>
          </div>
          <p className="max-w-[72ch] text-[15px] leading-7 text-pretty text-muted-foreground">
            <RichText text={explanation.explanation} />
          </p>
          {explanation.fix && <FixBlock fix={explanation.fix} />}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-faint">
            {explanation.code && <span className="font-mono">{explanation.code}</span>}
            {explanation.source && <span className="font-mono">{explanation.source}</span>}
            {explanation.docs && (
              <a href={explanation.docs} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded text-muted-foreground hover:text-foreground">
                Docs
                <ExternalLink className="size-3" aria-hidden />
              </a>
            )}
          </div>
          {report.hotkey && (
            <div className="border-t border-line pt-5">
              <WillItWork network={network} hotkey={report.hotkey} netuid={report.netuid ?? null} />
            </div>
          )}
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section aria-labelledby="call" className="panel overflow-hidden">
          <h2 id="call" className="border-b border-line px-5 py-3.5 text-sm font-semibold">
            Decoded call
          </h2>
          <dl className="divide-y divide-line">
            {report.args.map((arg) => (
              <div key={arg.name} className="grid gap-1 px-5 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
                <dt className="text-[13px] text-muted-foreground">{arg.name}</dt>
                <dd className="min-w-0 font-mono text-[13px] text-foreground">
                  {SS58.test(arg.value) ? <MonoValue value={arg.value} label={arg.name} head={10} tail={10} /> : <span className="break-words">{arg.value}</span>}
                  {arg.raw && arg.raw !== arg.value && <span className="mt-0.5 block font-mono text-xs text-faint">raw {arg.raw}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="events" className="panel overflow-hidden">
          <h2 id="events" className="border-b border-line px-5 py-3.5 text-sm font-semibold">
            Events, in order
          </h2>
          <ol className="relative px-5 py-4">
            {report.events.map((event, i) => {
              const tone = eventTone(event);
              const last = i === report.events.length - 1;
              return (
                <li key={event.index} className="relative flex gap-3.5 pb-5 last:pb-1">
                  {!last && <span aria-hidden className="absolute top-5 bottom-0 left-[9px] w-px bg-line-strong" />}
                  <span
                    aria-hidden
                    className={cn(
                      "relative z-10 mt-0.5 grid size-[19px] shrink-0 place-items-center rounded-full bg-surface shadow-[0_0_0_1px_var(--line-strong)]",
                      tone === "fail" && "text-critical",
                      tone === "ok" && "text-healthy",
                    )}
                  >
                    {tone === "fail" ? (
                      <XCircle className="size-[19px]" />
                    ) : tone === "ok" ? (
                      <CheckCircle2 className="size-[19px]" />
                    ) : (
                      <span className="size-1.5 rounded-full bg-faint" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono text-[13px] text-foreground">
                      <span className="text-faint">{event.pallet}.</span>
                      {event.name}
                    </p>
                    <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">{event.summary}</p>
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="border-t border-line px-5 py-2.5 text-xs text-faint">Block {formatInt(report.block)}, extrinsic {report.index}</p>
        </section>
      </div>
    </div>
  );
}
