import { CircleSlash, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FleetView } from "@/components/fleet/fleet-view";
import { HostedOnlyState } from "@/components/shared/hosted-only-state";
import { RefreshButton } from "@/components/shared/refresh-button";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ApiErrorState, StateView } from "@/components/ui/state";
import { formatInt, truncateMiddle } from "@/lib/format";
import { getFleet } from "@/lib/insights-api";
import { isNetwork, NETWORK_LABEL } from "@/lib/networks";
import { classifyInput } from "@/lib/route-input";

const isSs58 = (value: string) => classifyInput(value).kind === "hotkey";

export async function generateMetadata({ params }: PageProps<"/fleet/[network]/[coldkey]">): Promise<Metadata> {
  const { network, coldkey: raw } = await params;
  const coldkey = decodeURIComponent(raw);
  const title = `Fleet ${truncateMiddle(coldkey, 6, 4)}`;
  const fallback: Metadata = {
    title,
    description: "Every hotkey a coldkey owns, diagnosed on every subnet, worst first",
    alternates: { canonical: `/fleet/${network}/${coldkey}` },
  };
  if (!isNetwork(network) || network === "local" || !isSs58(coldkey)) return fallback;
  const result = await getFleet(network, coldkey);
  if (!result.ok) return fallback;
  return { ...fallback, description: result.data.headline, openGraph: { title, description: result.data.headline } };
}

export default async function FleetPage({ params }: PageProps<"/fleet/[network]/[coldkey]">) {
  const { network, coldkey: raw } = await params;
  if (!isNetwork(network)) notFound();
  const coldkey = decodeURIComponent(raw);
  const home = (
    <Button asChild variant="secondary">
      <Link href="/">Back to Preflight</Link>
    </Button>
  );

  if (!isSs58(coldkey)) {
    return (
      <Container className="py-14">
        <StateView icon={CircleSlash} title="That is not an ss58 coldkey" action={home}>
          <p>
            Coldkeys are 48 characters of base58 starting with 5, for example <code className="font-mono text-foreground">5FyBy1...pMB</code>
          </p>
        </StateView>
      </Container>
    );
  }

  if (network === "local") {
    return (
      <Container>
        <HostedOnlyState title="Run the fleet check from the CLI" command={`preflight fleet ${coldkey} --network local`} />
      </Container>
    );
  }

  const result = await getFleet(network, coldkey);
  if (!result.ok) {
    return (
      <Container className="py-14">
        <ApiErrorState
          error={result.error}
          action={
            <>
              {result.error.kind !== "invalid_input" && result.error.kind !== "offline_miss" && <RefreshButton label="Retry" />}
              {home}
            </>
          }
        />
      </Container>
    );
  }

  const report = result.data;
  if (report.hotkeys === 0) {
    return (
      <Container className="py-14">
        <StateView
          icon={Wallet}
          title="This coldkey owns no hotkeys"
          action={
            <>
              <Button asChild variant="primary">
                <Link href={`/doctor/${network}/${encodeURIComponent(coldkey)}`}>Open it in the Doctor</Link>
              </Button>
              {home}
            </>
          }
        >
          <p>
            No hotkey on {NETWORK_LABEL[network]} names <code className="font-mono text-foreground">{truncateMiddle(coldkey, 6, 4)}</code> as its owner at
            block {formatInt(report.chain.block)}. If this is a hotkey, the Doctor reads it directly
          </p>
        </StateView>
      </Container>
    );
  }

  return (
    <Container>
      <FleetView report={report} network={network} />
    </Container>
  );
}
