import { truncateMiddle } from "@/lib/format";
import { isNetwork, NETWORK_LABEL } from "@/lib/networks";
import { OG_SIZE, renderOg } from "@/lib/og";
import { getAccount } from "@/lib/server-api";

export const alt = "A Bittensor address on Preflight: its balance, stakes and keys";
export const size = OG_SIZE;
export const contentType = "image/png";

const TAO = new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 });

export default async function Image({ params }: { params: Promise<{ network: string; address: string }> }) {
  const { network, address } = await params;
  const short = truncateMiddle(address, 6, 4);
  if (!isNetwork(network)) return renderOg({ eyebrow: "Account", headline: `What ${short} holds`, network: "finney", subject: address });
  // The badge on the card reads Finney or Testnet; "finney" keeps its green dot
  const label = network === "finney" ? "finney" : NETWORK_LABEL[network];
  const result = network === "local" ? null : await getAccount(network, address);
  if (!result?.ok) return renderOg({ eyebrow: "Account", headline: `What ${short} holds on ${NETWORK_LABEL[network]}`, network: label, subject: address });

  const report = result.data;
  const hotkeys = report.owned_hotkeys_total;
  const parts = [`Free ${TAO.format(report.balance.free)} TAO`, `staked ${TAO.format(report.staked_tao)} TAO`];
  if (hotkeys > 0) parts.push(`${hotkeys} hotkey${hotkeys === 1 ? "" : "s"}`);
  if (report.hotkey_owner) parts.push(`a hotkey on ${report.seats.length} subnet${report.seats.length === 1 ? "" : "s"}`);
  return renderOg({
    eyebrow: `Account · ${NETWORK_LABEL[network]}`,
    headline: `${short} holds ${TAO.format(report.total_tao)} TAO`,
    detail: parts.join(" · "),
    network: label,
    subject: address,
    block: report.chain.block,
  });
}
