import type { Metadata } from "next";
import { Simulator } from "@/components/sim/simulator";
import { Container, PageHeader } from "@/components/ui/container";
import { getApi } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Simulator",
  description: "Run a Bittensor transaction against real chain state and see whether it would succeed, the fee and the balance changes, before you spend a single rao",
  alternates: { canonical: "/sim" },
};

export default async function SimPage() {
  const health = await (await getApi()).health();
  const forkAvailable = health.ok && health.data.fork;
  return (
    <Container>
      <PageHeader
        eyebrow="Simulator"
        title="Try a transaction before you spend a single rao"
        accent="before"
        description="Pick an action and a signer. Preflight runs it against real chain state and reports whether it would succeed, the fee, the effects and the balance changes. Every result says honestly whether it executed on a fork or was predicted"
      />
      <Simulator forkAvailable={forkAvailable} />
    </Container>
  );
}
