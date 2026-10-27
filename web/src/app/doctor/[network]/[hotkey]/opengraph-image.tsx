import { truncateMiddle } from "@/lib/format";
import { isNetwork } from "@/lib/networks";
import { OG_SIZE, renderOg } from "@/lib/og";
import { summarizeDoctor } from "@/lib/report-summary";
import { classifyInput } from "@/lib/route-input";
import { getDoctor } from "@/lib/server-api";

export const alt = "Preflight Doctor diagnosis";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ network: string; hotkey: string }> }) {
  const { network, hotkey: raw } = await params;
  const hotkey = decodeURIComponent(raw);
  const valid = isNetwork(network) && network !== "local" && classifyInput(hotkey).kind === "hotkey";
  const result = valid ? await getDoctor(network, hotkey, null) : null;
  if (result?.ok) return renderOg(summarizeDoctor(result.data));
  return renderOg({ eyebrow: "Doctor", headline: "Why does this miner earn zero?", network, subject: truncateMiddle(hotkey, 6, 4) });
}
