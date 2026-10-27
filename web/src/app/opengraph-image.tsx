import { OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Preflight, the Bittensor debugger";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return renderOg({
    eyebrow: "Bittensor debugger",
    headline: "Why does my miner earn zero?",
    detail: "Paste a hotkey, a transaction or a netuid. Get the cause, the fix, and a dry run before you pay",
    network: "finney",
    subject: "Doctor, tx debugger, simulator, subnets",
  });
}
