import { Users } from "lucide-react";
import type { Metadata } from "next";
import { HouseBoard } from "@/components/house/house-board";
import { Container, PageHeader } from "@/components/ui/container";
import { StateView } from "@/components/ui/state";
import { getApi } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Builders House",
  description: "How many diagnoses, error explanations and simulations Preflight ran for builders at the Builders House. Counters only",
  alternates: { canonical: "/house" },
};

export default async function HousePage() {
  const result = await (await getApi()).house();
  return (
    <Container>
      <PageHeader
        eyebrow="Builders House"
        title="Builders helped at the House"
        description="Live counters from the Preflight API. They count runs, never who ran them: no keys, hotkeys or addresses are stored"
      />
      {result.ok ? (
        <HouseBoard initial={result.data} />
      ) : (
        <StateView icon={Users} title="Counters are not available right now">
          {result.error.kind === "offline_miss" ? result.error.message : "The counter store did not answer. The numbers come back when it does"}
        </StateView>
      )}
    </Container>
  );
}
