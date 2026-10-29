import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlockView } from "@/components/tx/block-view";
import { Container } from "@/components/ui/container";
import { ApiErrorState } from "@/components/ui/state";
import { formatInt } from "@/lib/format";
import { isNetwork } from "@/lib/networks";
import { getBlock } from "@/lib/server-api";

const REF = /^(\d+|0x[0-9a-fA-F]{64})$/;

export async function generateMetadata({ params }: PageProps<"/block/[network]/[ref]">): Promise<Metadata> {
  const { network, ref } = await params;
  const title = /^\d+$/.test(ref) ? `Block ${formatInt(Number(ref))}` : "Block";
  return { title, description: "Every extrinsic in this block, whether it failed, and a link to debug each one", alternates: { canonical: `/block/${network}/${ref}` } };
}

export default async function BlockPage({ params, searchParams }: PageProps<"/block/[network]/[ref]">) {
  const { network, ref } = await params;
  const { from } = await searchParams;
  if (!isNetwork(network) || network === "local" || !REF.test(ref)) notFound();
  const result = await getBlock(network, ref);
  return (
    <Container>
      {result.ok ? (
        <BlockView report={result.data} network={network} fromHash={from === "hash"} />
      ) : (
        <div className="py-14">
          <ApiErrorState error={result.error} />
        </div>
      )}
    </Container>
  );
}
