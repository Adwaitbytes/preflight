import type { Metadata } from "next";
import { Suspense } from "react";
import { LocalView } from "@/components/shared/local-view-loader";
import { Directory } from "@/components/subnets/directory";
import { Container, PageHeader } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiErrorState } from "@/components/ui/state";
import { parseNetwork } from "@/lib/networks";
import { getApi } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Subnet directory",
  description: "What each Bittensor subnet does and whether it is healthy: curated entries with a cited source for every claim, live chain numbers and a 0 to 100 health score",
  alternates: { canonical: "/subnets" },
};

export default async function SubnetsPage({ searchParams }: PageProps<"/subnets">) {
  const sp = await searchParams;
  const network = parseNetwork(sp.network);
  const query = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";

  return (
    <Container>
      <PageHeader
        eyebrow="Directory"
        title="What each subnet does, and whether it is healthy"
        accent="healthy"
        description="Curated catalog entries with a cited source for every claim, joined to live chain numbers and a 0 to 100 health score built from the same rules the Doctor runs"
      />
      {network === "local" ? (
        <LocalView request={{ kind: "subnets", query }} />
      ) : (
        // The header paints at once; only the chain read streams in behind it
        <Suspense fallback={<DirectorySkeleton />}>
          <SubnetsResult network={network} query={query} />
        </Suspense>
      )}
    </Container>
  );
}

function DirectorySkeleton() {
  return (
    <div role="status" aria-label="Loading subnets" className="flex flex-col gap-5">
      <Skeleton className="h-11 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-52 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

async function SubnetsResult({ network, query }: { network: "finney" | "test"; query: string }) {
  const result = await (await getApi()).subnets(network);
  if (!result.ok) return <ApiErrorState error={result.error} />;
  return <Directory cards={result.data} network={network} initialQuery={query} />;
}
