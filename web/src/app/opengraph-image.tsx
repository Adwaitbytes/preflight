import { OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Preflight, the Bittensor debugger";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return renderOg({
    eyebrow: "Bittensor debugger",
    headline: "Why does my miner earn zero? Paste a hotkey, a transaction or a netuid and get the cause and the fix",
    network: "finney",
  });
}
