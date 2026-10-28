import { ArrowUpRight, BellRing, ClipboardPaste, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { QrCode } from "@/components/shared/qr-code";
import { Button } from "@/components/ui/button";
import { Container, PageHeader } from "@/components/ui/container";
import { BOT_COMMANDS, BOT_URL, BOT_USERNAME } from "@/lib/bot";

export const metadata: Metadata = {
  title: "Telegram bot",
  description: "Every Preflight tool as a Telegram command: diagnose a hotkey, decode a failed transaction, see what is failing on chain, and get alerts when your neuron breaks",
  alternates: { canonical: "/bot" },
};

const POINTS = [
  { icon: ClipboardPaste, title: "Paste anything", body: "A hotkey runs the Doctor, a block-index or hash opens the debugger, an error name gets explained. No command needed" },
  { icon: BellRing, title: "Alerts in the same chat", body: "/watch a neuron and the bot messages you when it is deregistered, stops being scored or loses its permit, with the fix" },
  { icon: ShieldCheck, title: "Read only", body: "It reads public chain data. It never asks for keys, never signs and never submits. Add test to any command for testnet" },
] as const;

export default function BotPage() {
  return (
    <Container className="pb-16">
      <PageHeader
        eyebrow="Telegram"
        title="Preflight in your pocket"
        description={`@${BOT_USERNAME} answers the same questions as this site, from any phone: why a neuron earns zero, why a transaction failed, and what is breaking on chain right now`}
      />
      <section className="panel grid gap-8 p-5 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex flex-col gap-5">
          <h2 className="sr-only">What the bot does</h2>
          <ul className="flex flex-col gap-5">
            {POINTS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent-ink">
                  <Icon className="size-4" aria-hidden />
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold">{title}</h3>
                  <p className="mt-0.5 text-sm leading-6 text-pretty text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
          <div>
            <Button asChild variant="accent" size="lg">
              <a href={BOT_URL} target="_blank" rel="noopener noreferrer">
                Open @{BOT_USERNAME}
                <ArrowUpRight className="size-4" aria-hidden />
              </a>
            </Button>
          </div>
        </div>
        <figure className="hidden flex-col items-center gap-3 justify-self-center md:flex">
          <QrCode value={BOT_URL} label={`QR code that opens @${BOT_USERNAME} in Telegram`} className="size-44 p-2 shadow-[0_0_0_1px_var(--line)] sm:size-52" />
          <figcaption className="text-xs text-faint">Scan with your phone camera</figcaption>
        </figure>
      </section>

      <section aria-labelledby="bot-commands" className="mt-10 flex flex-col gap-4">
        <h2 id="bot-commands" className="text-title font-semibold">
          Commands
        </h2>
        <ul className="grid gap-px overflow-hidden rounded-xl bg-line shadow-[0_0_0_1px_var(--line)] sm:grid-cols-2">
          {BOT_COMMANDS.map((c) => (
            <li key={c.command} className="flex min-w-0 flex-col gap-1 bg-surface px-4 py-3.5 sm:px-5">
              <p className="font-mono text-[13px]">
                <span className="font-semibold text-accent-ink">{c.command}</span>
                {c.args && <span className="text-faint"> {c.args}</span>}
              </p>
              <p className="text-sm text-muted-foreground">{c.does}</p>
              <p className="truncate font-mono text-xs text-faint">e.g. {c.example}</p>
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
