import type { Metadata } from "next";
import { LogoMark } from "@/components/site/logo";
import { QrCode } from "@/components/shared/qr-code";
import { BOT_URL, BOT_USERNAME } from "@/lib/bot";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Poster",
  description: "A printable Preflight poster for the Builders House: scan to diagnose your neuron",
  robots: { index: false },
};

const PROMISES = [
  { lead: "Why your miner earns zero.", rest: "27 rules read your hotkey from chain and name the fix." },
  { lead: "Why your transaction failed.", rest: "Decoded and explained with its own numbers." },
  { lead: "Simulate before you pay.", rest: "The real runtime, on a fork of mainnet. Nothing is broadcast." },
] as const;

/** One sheet, A4 or Letter. Light on paper whatever the site theme, and the site chrome hides when printing */
export default function PosterPage() {
  const home = siteUrl();
  const host = home.host;
  return (
    <div className="flex justify-center px-4 py-10 print:p-0">
      <p className="sr-only">Use your browser’s print command to print this poster on one page.</p>
      <article className="flex aspect-[210/297] w-full max-w-[794px] flex-col justify-between rounded-2xl bg-[#fbfbfc] p-[6%] text-[#121316] shadow-[0_0_0_1px_var(--line),0_24px_64px_rgb(0_0_0/0.12)] print:aspect-auto print:h-[100vh] print:w-[100vw] print:max-w-none print:rounded-none print:shadow-none">
        <header className="flex items-center gap-3">
          <LogoMark mono className="size-9 text-[#1f6feb]" />
          <span className="text-2xl font-semibold tracking-[-0.03em]">Preflight</span>
          <span className="ml-auto text-sm font-medium tracking-[0.12em] text-[#5b616d] uppercase">Builders House</span>
        </header>

        <div className="flex flex-col gap-[5%]">
          <h1 className="text-[clamp(2rem,6.4vw,3.6rem)] leading-[1.02] font-semibold tracking-[-0.04em] text-balance">
            Scan it. Paste your hotkey. <span className="text-[#1f6feb]">Know why.</span>
          </h1>
          <ul className="flex flex-col gap-4">
            {PROMISES.map((p) => (
              <li key={p.lead} className="border-l-2 border-[#1f6feb] pl-4 text-[clamp(1rem,2.4vw,1.35rem)] leading-snug">
                <span className="font-semibold">{p.lead}</span> <span className="text-[#4a4f5a]">{p.rest}</span>
              </li>
            ))}
          </ul>
        </div>

        <footer className="flex items-end gap-[6%]">
          <figure className="flex flex-col gap-2">
            <QrCode value={home.toString()} label={`QR code that opens ${host}`} className="size-[clamp(9rem,30vw,15rem)] bg-white" />
            <figcaption className="font-mono text-sm font-medium">{host}</figcaption>
          </figure>
          <figure className="ml-auto flex flex-col items-end gap-2 text-right">
            <QrCode value={BOT_URL} label={`QR code that opens @${BOT_USERNAME} in Telegram`} className="size-[clamp(5rem,15vw,7.5rem)] bg-white" />
            <figcaption className="text-sm text-[#4a4f5a]">
              Or ask the bot
              <br />
              <span className="font-mono font-medium text-[#121316]">@{BOT_USERNAME}</span>
            </figcaption>
          </figure>
        </footer>
      </article>
    </div>
  );
}
