import type { Metadata } from "next";
import { Suspense } from "react";
import { PlanView } from "@/components/plan/plan-view";
import { LocalView } from "@/components/shared/local-view-loader";
import { Container, PageHeader } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiErrorState } from "@/components/ui/state";
import { parseNetwork } from "@/lib/networks";
import { getApi } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Launch planner",
  description: "What a Bittensor subnet costs to launch today: lock cost, the registration rate limit, which subnet the cap would replace and the timeline, read at one block",
  alternates: { canonical: "/plan" },
};

export default async function PlanPage({ searchParams }: PageProps<"/plan">) {
  const network = parseNetwork((await searchParams).network);
  return (
    <Container>
      <PageHeader
        eyebrow="Launch planner"
        title="What a subnet costs today, and when it starts earning"
        accent="today"
        description="Lock cost, the registration rate limit, which subnet the cap would replace and the launch timeline, all read from the runtime at one block"
      />
      {network === "local" ? (
        <LocalView request={{ kind: "plan" }} />
      ) : (
        // The header paints at once; only the chain read streams in behind it
        <Suspense fallback={<PlanSkeleton />}>
          <PlanResult network={network} />
        </Suspense>
      )}
    </Container>
  );
}

function PlanSkeleton() {
  return (
    <div role="status" aria-label="Reading launch costs" className="flex flex-col gap-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-60 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

async function PlanResult({ network }: { network: "finney" | "test" }) {
  const result = await (await getApi()).plan(network);
  return result.ok ? <PlanView plan={result.data} /> : <ApiErrorState error={result.error} />;
}
