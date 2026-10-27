import type { Metadata } from "next";
import { LocalView } from "@/components/shared/local-view";
import { Directory } from "@/components/subnets/directory";
import { Container, PageHeader } from "@/components/ui/container";
import { ApiErrorState } from "@/components/ui/state";
import { parseNetwork } from "@/lib/networks";
import { getApi } from "@/lib/server-api";

export const metadata: Metadata = { title: "Subnet directory" };

export default async function SubnetsPage({ searchParams }: PageProps<"/subnets">) {
  const sp = await searchParams;
  const network = parseNetwork(sp.network);
  const query = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";

  return (
    <Container>
      <PageHeader
        eyebrow="Directory"
        title="What each subnet does, and whether it is healthy"
        description="Curated catalog entries with a cited source for every claim, joined to live chain numbers and a 0 to 100 health score built from the same rules the Doctor runs"
      />
      {network === "local" ? (
        <LocalView request={{ kind: "subnets", query }} />
      ) : (
        <SubnetsResult network={network} query={query} />
      )}
    </Container>
  );
}

async function SubnetsResult({ network, query }: { network: "finney" | "test"; query: string }) {
  const result = await (await getApi()).subnets(network);
  if (!result.ok) return <ApiErrorState error={result.error} />;
  return <Directory cards={result.data} network={network} initialQuery={query} />;
}
