import { ArrowUpRight, Bot, Braces, FileText, GitBranch, Sparkles, SquareTerminal } from "lucide-react";
import Link from "next/link";
import { MCP_INSTALL } from "@/lib/install";

function Tile({ icon: Icon, title, body, href, children, className = "" }: { icon: typeof Bot; title: string; body: string; href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={`group flex min-w-0 flex-col justify-between gap-6 rounded-3xl bg-[#f6f2ec] p-7 shadow-[0_0_0_1px_#ddd5c8] transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_#c9bfb0,0_24px_60px_-30px_rgb(23_25_30/0.35)] motion-reduce:transition-none ${className}`}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="grid size-10 place-items-center rounded-xl bg-[#17191e] text-[#9db0ff]">
            <Icon className="size-5" aria-hidden />
          </span>
          <ArrowUpRight className="size-5 text-[#6b6f78] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
        </div>
        <h3 className="mt-6 text-2xl font-normal tracking-[-0.03em] text-[#17191e]">{title}</h3>
        <p className="mt-2 max-w-[34ch] text-[15px] leading-6 text-pretty text-[#4a4f5a]">{body}</p>
      </div>
      {children}
    </Link>
  );
}

/** Every tool is also a chat command, a Claude tool, a terminal command and a CI step */
export function Everywhere() {
  return (
    <section aria-labelledby="everywhere-title" className="light bg-[#efeae2] text-[#17191e]">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <h2 id="everywhere-title" className="max-w-[16ch] text-[clamp(2.4rem,4.6vw,4.25rem)] leading-[1.02] font-light tracking-[-0.045em] text-balance">
          Wherever you <span className="font-serif font-normal tracking-[-0.01em] text-[#2f4fe0] italic">already</span> work
        </h2>
        <div className="mt-16 grid gap-4 md:grid-cols-6">
          <Tile icon={Bot} title="Telegram" body="Ask in a chat, or let it watch your miner and warn you before the next epoch cuts your pay." href="/bot" className="md:col-span-3 md:row-span-2">
            <div className="flex flex-col gap-2">
              <div className="max-w-[92%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-[14px] leading-6 text-[#17191e] shadow-[0_0_0_1px_#e4ddd2]">
                <p className="font-mono text-xs font-semibold text-[#2f4fe0]">EPOCH ALERT · SN19</p>
                <p className="mt-1 font-medium">UID 85 is set to drop to zero at the next epoch, block 9,392,129, in about 22 minutes</p>
                <p className="mt-1.5 text-[13px] text-[#4a4f5a]">No voting validator weights it any more</p>
              </div>
              <p className="mt-2 self-end rounded-2xl rounded-br-md bg-[#2f4fe0] px-4 py-2.5 font-mono text-[13px] text-white">/doctor 5EKtvz…Qmhq 64</p>
              <div className="max-w-[92%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-[14px] leading-6 text-[#17191e] shadow-[0_0_0_1px_#e4ddd2]">
                <p className="font-mono text-xs font-semibold text-[#c2541c]">BROKEN · 5EKtvz…Qmhq</p>
                <p className="mt-1 font-medium">UID 0 on SN64 earns nothing because no validator has scored it</p>
                <p className="mt-1.5 text-[13px] text-[#4a4f5a]">PF108 critical. Check that the axon is reachable and answers the subnet’s queries</p>
              </div>
              <p className="text-xs text-[#6b6f78]">What @PreflightAlertsbot sends, with real chain data from 30 October</p>
            </div>
          </Tile>
          <Tile icon={Sparkles} title="Your own Claude" body="Thirteen tools Claude can call to diagnose, explain, forecast and simulate." href="/guide#surfaces" className="md:col-span-3">
            <code className="block overflow-hidden rounded-xl bg-[#17191e] px-4 py-3 font-mono text-[12.5px] text-ellipsis whitespace-nowrap text-[#dfe5ff]">$ {MCP_INSTALL}</code>
          </Tile>
          <Tile icon={SquareTerminal} title="Terminal and CI" body="Gate a validator’s new scoring on real consensus before it ever sets weights." href="/guide#surfaces" className="md:col-span-3">
            <code className="block overflow-hidden rounded-xl bg-[#17191e] px-4 py-3 font-mono text-[12.5px] text-ellipsis whitespace-nowrap text-[#dfe5ff]">$ preflight epoch 64 --validator 12 --min-trust 0.9</code>
          </Tile>
          <Tile icon={GitBranch} title="GitHub Action" body="Boots a local chain and stops a broken neuron from shipping." href="https://github.com/Adwaitbytes/preflight" className="md:col-span-2">
            <code className="block rounded-xl bg-[#17191e] px-4 py-3 font-mono text-[12.5px] text-[#dfe5ff]">uses: Adwaitbytes/preflight@main</code>
          </Tile>
          <Tile icon={Braces} title="Open API" body="Typed, versioned and free. Put the reason next to every zero in your own app." href="/v1/docs" className="md:col-span-2">
            <code className="block rounded-xl bg-[#17191e] px-4 py-3 font-mono text-[12.5px] text-[#dfe5ff]">GET /v1/doctor/finney/…</code>
          </Tile>
          <Tile icon={FileText} title="For AI agents" body="A plain text map of every endpoint, written for language models." href="https://github.com/Adwaitbytes/preflight/blob/main/docs/llms.txt" className="md:col-span-2">
            <code className="block rounded-xl bg-[#17191e] px-4 py-3 font-mono text-[12.5px] text-[#dfe5ff]">/llms.txt</code>
          </Tile>
        </div>
      </div>
    </section>
  );
}
