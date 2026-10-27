import type { Metadata } from "next";
import { PlanView } from "@/components/plan/plan-view";
import { LocalView } from "@/components/shared/local-view";
import { Container, PageHeader } from "@/components/ui/container";
import { ApiErrorState } from "@/components/ui/state";
import { parseNetwork } from "@/lib/networks";
import { getApi } from "@/lib/server-api";

export const metadata: Metadata = { title: "Launch planner" };

export default async function PlanPage({ searchParams }: PageProps<"/plan">) {
  const network = parseNetwork((await searchParams).network);
  return (
    <Container>
      <PageHeader
        eyebrow="Launch planner"
        title="What a subnet costs today, and when it starts earning"
        description="Lock cost, the registration rate limit, which subnet the cap would replace and the launch timeline, all read from the runtime at one block"
      />
      {network === "local" ? <LocalView request={{ kind: "plan" }} /> : <PlanResult network={network} />}
    </Container>
  );
}

async function PlanResult({ network }: { network: "finney" | "test" }) {
  const result = await (await getApi()).plan(network);
  return result.ok ? <PlanView plan={result.data} /> : <ApiErrorState error={result.error} />;
}
