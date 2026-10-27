import { CircleSlash } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LocalView } from "@/components/shared/local-view";
import { TxView } from "@/components/tx/tx-view";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ApiErrorState, StateView } from "@/components/ui/state";
import { truncateMiddle } from "@/lib/format";
import { isNetwork } from "@/lib/networks";
import { classifyInput } from "@/lib/route-input";
import { getApi } from "@/lib/server-api";

export async function generateMetadata({ params }: PageProps<"/tx/[network]/[ref]">): Promise<Metadata> {
  const { ref } = await params;
  return { title: `Transaction ${truncateMiddle(decodeURIComponent(ref), 10, 4)}` };
}

export default async function TxPage({ params }: PageProps<"/tx/[network]/[ref]">) {
  const { network, ref: rawRef } = await params;
  if (!isNetwork(network)) notFound();
  const input = classifyInput(decodeURIComponent(rawRef));
  const ref = input.kind === "extrinsic" ? input.hash : input.kind === "block_index" ? input.ref : null;

  if (!ref) {
    return (
      <Container className="py-14">
        <StateView
          icon={CircleSlash}
          title="That is not a transaction reference"
          action={
            <Button asChild variant="primary">
              <Link href="/">Paste another value</Link>
            </Button>
          }
        >
          <p>
            Use an extrinsic hash (<code className="font-mono text-foreground">0x</code> and 64 hex characters) or a block and index such as{" "}
            <code className="font-mono text-foreground">9376703-0022</code>
          </p>
        </StateView>
      </Container>
    );
  }

  if (network === "local") {
    return (
      <Container>
        <LocalView request={{ kind: "tx", ref }} />
      </Container>
    );
  }

  const result = await (await getApi()).tx(network, ref);
  return (
    <Container>
      {result.ok ? (
        <TxView report={result.data} network={network} />
      ) : (
        <div className="py-14">
          <ApiErrorState error={result.error} />
        </div>
      )}
    </Container>
  );
}
