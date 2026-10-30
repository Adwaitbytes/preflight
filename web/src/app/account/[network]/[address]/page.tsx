import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AccountView, isEmptyAccount } from "@/components/account/account-view";
import { Container } from "@/components/ui/container";
import { ApiErrorState } from "@/components/ui/state";
import { truncateMiddle } from "@/lib/format";
import { isNetwork, NETWORK_LABEL, type NetworkId } from "@/lib/networks";
import { getAccount } from "@/lib/server-api";

const SS58 = /^[1-9A-HJ-NP-Za-km-z]{46,48}$/;

export async function generateMetadata({ params }: PageProps<"/account/[network]/[address]">): Promise<Metadata> {
  const { network, address } = await params;
  const label = isNetwork(network) ? NETWORK_LABEL[network] : network;
  const title = `${truncateMiddle(address, 6, 4)} on ${label}`;
  let description = "Balance, stakes and keys of a Bittensor address, read at one block";
  // Same arguments as the page, so React's cache shares one read between metadata and page
  const result = isNetwork(network) && network !== "local" && SS58.test(address) ? await getAccount(network, address) : null;
  if (result?.ok) {
    const tao = new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 });
    const report = result.data;
    description = `Holds ${tao.format(report.total_tao)} TAO on ${label}: ${tao.format(report.balance.free)} free, ${tao.format(report.staked_tao)} staked${report.owned_hotkeys_total > 0 ? `, ${report.owned_hotkeys_total} hotkeys` : ""}. Read at block ${report.chain.block.toLocaleString("en-US")}`;
  }
  return {
    title,
    description,
    alternates: { canonical: `/account/${network}/${address}` },
    openGraph: { title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function AccountPage({ params, searchParams }: PageProps<"/account/[network]/[address]">) {
  const { network, address } = await params;
  const { from } = await searchParams;
  if (!isNetwork(network) || !SS58.test(address)) notFound();
  const result = await getAccount(network, address);

  // An address that holds nothing here often holds something on the other public network
  let elsewhere: { network: NetworkId; total: number } | undefined;
  if (result.ok && isEmptyAccount(result.data) && network !== "local") {
    const other: NetworkId = network === "finney" ? "test" : "finney";
    const second = await getAccount(other, address);
    if (second.ok && !isEmptyAccount(second.data)) elsewhere = { network: other, total: second.data.total_tao };
  }
  // Pasted into the search box on the wrong network: go where the funds are
  if (elsewhere && from === "doctor") redirect(`/account/${elsewhere.network}/${address}?from=switched`);

  return (
    <Container>
      {result.ok ? (
        <AccountView report={result.data} network={network} note={from === "doctor" ? "doctor" : from === "switched" ? "switched" : undefined} elsewhere={elsewhere} />
      ) : (
        <div className="py-14">
          <ApiErrorState error={result.error} />
        </div>
      )}
    </Container>
  );
}
