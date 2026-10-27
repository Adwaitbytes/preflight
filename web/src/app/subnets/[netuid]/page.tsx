import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocalView } from "@/components/shared/local-view-loader";
import { SubnetDetailView } from "@/components/subnets/subnet-detail-view";
import { Container } from "@/components/ui/container";
import { ApiErrorState } from "@/components/ui/state";
import { parseNetwork } from "@/lib/networks";
import { getApi } from "@/lib/server-api";

function parseNetuid(raw: string): number | null {
  return /^\d{1,5}$/.test(raw) ? Number(raw) : null;
}

export async function generateMetadata({ params }: PageProps<"/subnets/[netuid]">): Promise<Metadata> {
  const { netuid } = await params;
  return {
    title: `SN${netuid}`,
    description: `What SN${netuid} does, its live chain numbers, health score and hyperparameters, read at one block`,
    alternates: { canonical: `/subnets/${netuid}` },
  };
}

export default async function SubnetPage({ params, searchParams }: PageProps<"/subnets/[netuid]">) {
  const netuid = parseNetuid((await params).netuid);
  if (netuid == null) notFound();
  const network = parseNetwork((await searchParams).network);

  if (network === "local") {
    return (
      <Container>
        <LocalView request={{ kind: "subnet", netuid }} />
      </Container>
    );
  }

  const result = await (await getApi()).subnet(network, netuid);
  return (
    <Container>
      {result.ok ? (
        <SubnetDetailView detail={result.data} network={network} />
      ) : (
        <div className="py-14">
          <ApiErrorState error={result.error} />
        </div>
      )}
    </Container>
  );
}
