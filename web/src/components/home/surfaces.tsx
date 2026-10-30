"use client";

import { Bot, Braces, GitBranch, Globe, Sparkles, SquareTerminal } from "lucide-react";
import Image from "next/image";
import { Tabs } from "radix-ui";
import { MCP_INSTALL } from "@/lib/install";
import { cn } from "@/lib/utils";

const HOTKEY = "5EKtvzbEvYZPRJdo42ug7mWrHdt4AurCNMs5CAefuBHfQmhq";
const HEADLINE = "UID 0 on SN64 earns nothing because no validator has scored it";
const FIX = "Check that the axon is reachable and that the miner answers the subnet’s queries in the format validators expect";

const SURFACES = [
  { id: "web", label: "Website", icon: Globe },
  { id: "cli", label: "Terminal", icon: SquareTerminal },
  { id: "claude", label: "Claude", icon: Sparkles },
  { id: "telegram", label: "Telegram", icon: Bot },
  { id: "api", label: "API", icon: Braces },
  { id: "ci", label: "CI", icon: GitBranch },
] as const;

function Window({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl bg-[#0b0c10] shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_40px_100px_-40px_rgb(23_25_30/0.6)]", className)}>
      <div className="flex h-10 items-center gap-1.5 border-b border-white/10 px-4">
        <span aria-hidden className="size-2.5 rounded-full bg-white/15" />
        <span aria-hidden className="size-2.5 rounded-full bg-white/15" />
        <span aria-hidden className="size-2.5 rounded-full bg-white/15" />
        <span className="ml-3 truncate font-mono text-xs text-white/45">{title}</span>
      </div>
      {children}
    </div>
  );
}

function Mono({ children, className }: { children: React.ReactNode; className?: string }) {
  return <pre className={cn("overflow-x-auto p-5 font-mono text-[13px] leading-6 whitespace-pre text-[#dfe5ff] [scrollbar-width:none] sm:p-6", className)}>{children}</pre>;
}

/** One real Doctor answer, the same in every place it can be asked */
export function Surfaces() {
  return (
    <section aria-labelledby="surfaces-title" className="light bg-[#efeae2] text-[#17191e]">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 id="surfaces-title" className="max-w-[15ch] text-[clamp(2.4rem,4.6vw,4.25rem)] leading-[1.02] font-light tracking-[-0.045em] text-balance">
            One answer, wherever you <span className="font-serif font-normal tracking-[-0.01em] text-[#2f4fe0] italic">already</span> work
          </h2>
          <p className="max-w-[26rem] text-[15px] leading-7 text-pretty text-[#4a4f5a]">
            The same engine answers the site, your terminal, your own Claude, a Telegram chat, your code and your CI. This is one real answer from mainnet, in all six.
          </p>
        </div>

        <Tabs.Root defaultValue="web" className="mt-14">
          <Tabs.List aria-label="Where to ask" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
            {SURFACES.map(({ id, label, icon: Icon }) => (
              <Tabs.Trigger
                key={id}
                value={id}
                className="group inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-[#f6f2ec] px-4 text-[14px] font-medium text-[#4a4f5a] shadow-[0_0_0_1px_#ddd5c8] transition-colors outline-none hover:text-[#17191e] focus-visible:ring-2 focus-visible:ring-[#2f4fe0] data-[state=active]:bg-[#17191e] data-[state=active]:text-white data-[state=active]:shadow-none"
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <div className="mt-6">
            <Tabs.Content value="web" className="surface-in outline-none">
              <Window title="preflight-lemon.vercel.app / doctor / SN64 / UID 0">
                <Image src="/shots/doctor-sn64.png" alt={`The Doctor on the website: ${HEADLINE}`} width={2360} height={1476} sizes="(min-width: 1152px) 1088px, 100vw" className="block h-auto w-full" />
              </Window>
            </Tabs.Content>

            <Tabs.Content value="cli" className="surface-in outline-none">
              <Window title="zsh">
                <Mono>
                  <span className="text-[#7c93ff]">$</span> preflight doctor {HOTKEY} --netuid 64{"\n\n"}
                  <span className="rounded bg-[#ff7b72] px-1.5 font-semibold text-[#0b0c10]"> BROKEN </span> {HEADLINE}
                  {"\n"}
                  <span className="text-white/45">finney at block 9,395,595, runtime 486  3,306 ms</span>
                  {"\n\n"}
                  <span className="text-white">SN64 Chutes</span><span className="text-white/45">  ·  19 rules run, 1 issue</span>
                  {"\n"}
                  <span className="text-white/60">UID 0  miner  stake 0.40  incentive 0.0000  trust 0.000  axon none</span>
                  {"\n\n"}
                  <span className="font-semibold text-[#ff7b72]">CRITICAL</span> PF108 No validator has scored this UID
                  {"\n"}
                  {"  "}<span className="text-white/60">Validators weighting this UID</span>  <span className="text-[#ff7b72]">0</span> of 17
                  {"\n"}
                  {"  "}<span className="text-[#a9b8ff]">Next step</span>  {FIX.replace("’", "'")}
                </Mono>
              </Window>
            </Tabs.Content>

            <Tabs.Content value="claude" className="surface-in outline-none">
              <Window title="Claude">
                <div className="flex flex-col gap-4 p-5 sm:p-6">
                  <p className="font-mono text-[13px] text-white/55">
                    <span className="text-[#7c93ff]">$</span> {MCP_INSTALL}
                  </p>
                  <p className="self-end rounded-2xl rounded-br-md bg-white/[0.08] px-4 py-3 text-[15px] text-white">Why does 5EKtvz…Qmhq earn nothing on SN64?</p>
                  <p className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#7c93ff]/12 px-3 py-1.5 font-mono text-[12.5px] text-[#a9b8ff] shadow-[0_0_0_1px_rgb(124_147_255/0.25)]">
                    <Sparkles className="size-3.5" aria-hidden /> preflight · diagnose_neuron(hotkey, netuid=64)
                  </p>
                  <div className="max-w-[46rem] text-[15px] leading-7 text-white/85">
                    <p>
                      <b className="font-semibold text-white">{HEADLINE}.</b> None of the 17 permitted validators’ latest weights include it, read at block 9,395,595.
                    </p>
                    <p className="mt-2 text-white/65">Fix: {FIX}.</p>
                  </div>
                  <p className="text-xs text-white/40">Thirteen tools, from diagnose_neuron to preview_epoch and simulate. Claude answers from the tool’s real result.</p>
                </div>
              </Window>
            </Tabs.Content>

            <Tabs.Content value="telegram" className="surface-in outline-none">
              <Window title="@PreflightAlertsbot">
                <div className="flex flex-col gap-3 p-5 sm:p-6">
                  <p className="self-end rounded-2xl rounded-br-md bg-[#2f4fe0] px-4 py-2.5 font-mono text-[13px] text-white">/doctor 5EKtvz…Qmhq 64</p>
                  <div className="max-w-[40rem] rounded-2xl rounded-bl-md bg-white/[0.07] px-4 py-3.5 text-[14px] leading-6 text-white/85">
                    <p className="font-semibold text-white">🔴 BROKEN · 5EKtvz...Qmhq</p>
                    <p className="font-semibold text-white">{HEADLINE}</p>
                    <p className="mt-2">• <b className="text-white">PF108</b> critical: No validator has scored this UID</p>
                    <p className="text-white/65">{FIX.replace("’", "'")}</p>
                    <p className="mt-2 text-[#a9b8ff]">Full report · block 9,392,401</p>
                  </div>
                  <p className="mt-2 max-w-[40rem] rounded-2xl rounded-bl-md bg-white/[0.07] px-4 py-3 text-[14px] leading-6 text-white/85">
                    <b className="text-white">Preflight:</b> UID 85 on SN19 is set to drop to zero at the next epoch, block 9,392,129 (in about 0.4 h)
                  </p>
                  <p className="text-xs text-white/40">Both are real messages: a /doctor reply, and a watch alert sent before the epoch cut the pay.</p>
                </div>
              </Window>
            </Tabs.Content>

            <Tabs.Content value="api" className="surface-in outline-none">
              <Window title="curl">
                <Mono>
                  <span className="text-[#7c93ff]">$</span> curl -s https://preflight-lemon.vercel.app/v1/doctor/finney/{HOTKEY}?netuid=64 | jq{"\n\n"}
                  {"{\n"}
                  {"  "}<span className="text-[#a9b8ff]">&quot;verdict&quot;</span>: <span className="text-[#ffb58f]">&quot;broken&quot;</span>,{"\n"}
                  {"  "}<span className="text-[#a9b8ff]">&quot;headline&quot;</span>: <span className="text-[#ffb58f]">&quot;{HEADLINE}&quot;</span>,{"\n"}
                  {"  "}<span className="text-[#a9b8ff]">&quot;chain&quot;</span>: {"{ "}<span className="text-[#a9b8ff]">&quot;network&quot;</span>: <span className="text-[#ffb58f]">&quot;finney&quot;</span>, <span className="text-[#a9b8ff]">&quot;block&quot;</span>: 9395608, <span className="text-[#a9b8ff]">&quot;runtime_spec&quot;</span>: 486 {"}"},{"\n"}
                  {"  "}<span className="text-[#a9b8ff]">&quot;elapsed_ms&quot;</span>: 2197,{"\n"}
                  {"  "}<span className="text-[#a9b8ff]">&quot;diagnoses&quot;</span>: [ … ]{"\n"}
                  {"}"}
                </Mono>
              </Window>
            </Tabs.Content>

            <Tabs.Content value="ci" className="surface-in outline-none">
              <div className="grid gap-4 lg:grid-cols-2">
                <Window title=".github/workflows/ci.yml">
                  <Mono>
                    <span className="text-white/45"># boots a localnet subnet, fails on findings</span>{"\n"}
                    - <span className="text-[#a9b8ff]">uses</span>: Adwaitbytes/preflight@main{"\n"}
                    {"  "}<span className="text-[#a9b8ff]">with</span>:{"\n"}
                    {"    "}<span className="text-[#a9b8ff]">fail-on</span>: high{"\n"}
                    {"    "}<span className="text-[#a9b8ff]">network</span>: local
                  </Mono>
                </Window>
                <Window title="epoch-gate">
                  <Mono>
                    <span className="text-[#7c93ff]">$</span> preflight epoch 64 --validator 252 --min-trust 0.995{"\n\n"}
                    <span className="text-white/55">SN64&apos;s next epoch pays 18 UIDs</span>{"\n"}
                    <span className="text-[#ff7b72]">UID 252 keeps 99.4% of its weight, under --min-trust 99.5%</span>{"\n"}
                    <span className="text-[#ff7b72]">exit 1</span>
                  </Mono>
                </Window>
              </div>
            </Tabs.Content>
          </div>
        </Tabs.Root>
      </div>
    </section>
  );
}
