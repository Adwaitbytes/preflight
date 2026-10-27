import { isNetwork } from "@/lib/networks";
import { OG_SIZE, renderOg } from "@/lib/og";
import { summarizeTx } from "@/lib/report-summary";
import { classifyInput } from "@/lib/route-input";
import { getTx } from "@/lib/server-api";

export const alt = "Preflight transaction debugger";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ network: string; ref: string }> }) {
  const { network, ref: raw } = await params;
  const input = classifyInput(decodeURIComponent(raw));
  const ref = input.kind === "extrinsic" ? input.hash : input.kind === "block_index" ? input.ref : null;
  const result = ref && isNetwork(network) && network !== "local" ? await getTx(network, ref) : null;
  if (result?.ok) return renderOg(summarizeTx(result.data));
  return renderOg({ eyebrow: "Transaction", headline: "Why did this extrinsic fail?", network, subject: ref ?? undefined });
}
