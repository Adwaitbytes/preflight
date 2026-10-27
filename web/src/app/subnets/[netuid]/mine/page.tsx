import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MineView } from "@/components/mine/mine-view";
import { HostedOnlyState } from "@/components/shared/hosted-only-state";
import { RefreshButton } from "@/components/shared/refresh-button";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ApiErrorState } from "@/components/ui/state";
import { getEconomics } from "@/lib/insights-api";
import { parseNetwork } from "@/lib/networks";
import { normalizeTaoText } from "@/lib/tao";

function parseNetuid(raw: string): number | null {
  return /^\d{1,5}$/.test(raw) ? Number(raw) : null;
}

export async function generateMetadata({ params, searchParams }: PageProps<"/subnets/[netuid]/mine">): Promise<Metadata> {
  const { netuid: raw } = await params;
  const title = `Should I mine SN${raw}?`;
  const fallback: Metadata = {
    title,
    description: `What miners on SN${raw} earn today, how many earn at all, what it takes to keep a seat and how long the registration takes to pay back`,
    alternates: { canonical: `/subnets/${raw}/mine` },
  };
  const netuid = parseNetuid(raw);
  const network = parseNetwork((await searchParams).network);
  if (netuid == null || network === "local") return fallback;
  const result = await getEconomics(network, netuid);
  if (!result.ok) return fallback;
  const description = normalizeTaoText(result.data.headline);
  return { ...fallback, description, openGraph: { title, description } };
}

export default async function MinePage({ params, searchParams }: PageProps<"/subnets/[netuid]/mine">) {
  const netuid = parseNetuid((await params).netuid);
  if (netuid == null) notFound();
  const network = parseNetwork((await searchParams).network);

  if (network === "local") {
    return (
      <Container>
        <HostedOnlyState title="Size up a local subnet from the CLI" command={`preflight mine ${netuid} --network local`} />
      </Container>
    );
  }

  const result = await getEconomics(network, netuid);
  if (!result.ok) {
    return (
      <Container className="py-14">
        <ApiErrorState
          error={result.error}
          action={
            <>
              {result.error.kind !== "invalid_input" && result.error.kind !== "not_found" && result.error.kind !== "offline_miss" && <RefreshButton label="Retry" />}
              <Button asChild variant="secondary">
                <Link href="/subnets">All subnets</Link>
              </Button>
            </>
          }
        />
      </Container>
    );
  }

  return (
    <Container>
      <MineView economics={result.data} network={network} />
    </Container>
  );
}
