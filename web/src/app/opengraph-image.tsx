import { OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Preflight, the Bittensor debugger";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return renderOg({
    eyebrow: "The debugger for Bittensor",
    headline: "Stop flying blind on Bittensor",
    detail: "Paste an address, a transaction or an error. It explains, predicts and warns before it costs you TAO",
    network: "finney",
    subject: "Explains · Predicts · Warns",
  });
}
