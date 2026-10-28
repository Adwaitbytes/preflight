import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EpochLab } from "@/components/epoch/epoch-lab";
import { Container, PageHeader } from "@/components/ui/container";
import { isNetwork } from "@/lib/networks";
import { classifyInput } from "@/lib/route-input";

function parseNetuid(raw: string): number | null {
  return /^\d{1,4}$/.test(raw) && Number(raw) <= 1024 ? Number(raw) : null;
}

function parseHotkey(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw && classifyInput(raw).kind === "hotkey" ? raw : null;
}

export async function generateMetadata({ params }: PageProps<"/epoch/[network]/[netuid]">): Promise<Metadata> {
  const { network, netuid } = await params;
  const title = `SN${netuid} next epoch`;
  const description = `What SN${netuid}'s next epoch pays each miner, and why, computed from live ${network} state with Yuma consensus's own math before the chain runs it`;
  return { title, description, alternates: { canonical: `/epoch/${network}/${netuid}` }, openGraph: { title, description } };
}

export default async function EpochPage({ params, searchParams }: PageProps<"/epoch/[network]/[netuid]">) {
  const { network, netuid: raw } = await params;
  const netuid = parseNetuid(raw);
  if (!isNetwork(network) || netuid === null) notFound();
  const hotkey = parseHotkey((await searchParams).hotkey);
  return (
    <Container className="pb-16">
      <PageHeader
        eyebrow="Epoch Lab"
        title={`SN${netuid}: the next epoch, before it runs`}
        description="Yuma consensus's own incentive math, run on live chain state. See what each miner will be paid and why, then change kappa, take a validator offline or test new weights and recompute"
      />
      <EpochLab network={network} netuid={netuid} hotkey={hotkey} />
    </Container>
  );
}
