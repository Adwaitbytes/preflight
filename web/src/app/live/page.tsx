import type { Metadata } from "next";
import { LiveExplorer } from "@/components/live/live-explorer";
import { Container, PageHeader } from "@/components/ui/container";
import { isOffline } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Live explorer",
  description:
    "Every Bittensor transaction as its block lands, decoded into a plain sentence: weights, registrations, stake, transfers and failures, with a debugger one click away",
  alternates: { canonical: "/live" },
};

export default function LivePage() {
  return (
    <Container>
      <PageHeader
        eyebrow="Live explorer"
        title="The chain, as it happens"
        description="Every signed transaction decoded into a plain sentence the moment its block lands. Open any row in the debugger, follow one wallet, or watch a single subnet"
      />
      <LiveExplorer offline={isOffline()} />
    </Container>
  );
}
