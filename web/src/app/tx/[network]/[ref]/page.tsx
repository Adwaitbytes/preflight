import { CircleSlash } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LocalView } from "@/components/shared/local-view-loader";
import { TxView } from "@/components/tx/tx-view";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ApiErrorState, StateView } from "@/components/ui/state";
import { truncateMiddle } from "@/lib/format";
import { isNetwork } from "@/lib/networks";
import { classifyInput } from "@/lib/route-input";
import { summarizeTx } from "@/lib/report-summary";
import { getTx } from "@/lib/server-api";

function parseRef(raw: string): string | null {
  const input = classifyInput(decodeURIComponent(raw));
  return input.kind === "extrinsic" ? input.hash : input.kind === "block_index" ? input.ref : null;
}

export async function generateMetadata({ params }: PageProps<"/tx/[network]/[ref]">): Promise<Metadata> {
  const { network, ref: raw } = await params;
  const ref = parseRef(raw);
  const alternates = { canonical: `/tx/${network}/${ref ?? raw}` };
  const fallback: Metadata = {
    title: `Transaction ${truncateMiddle(decodeURIComponent(raw), 10, 4)}`,
    description: "Decoded call, events, the error in plain words and the command to run instead",
    alternates,
  };
  if (!ref || !isNetwork(network) || network === "local") return fallback;
  const result = await getTx(network, ref);
  if (!result.ok) return fallback;
  const summary = summarizeTx(result.data);
  return {
    alternates,
    title: summary.title,
    description: summary.description,
    openGraph: { title: summary.title, description: summary.description },
    twitter: { card: "summary_large_image", title: summary.title, description: summary.description },
  };
}

export default async function TxPage({ params }: PageProps<"/tx/[network]/[ref]">) {
  const { network, ref: rawRef } = await params;
  if (!isNetwork(network)) notFound();
  const ref = parseRef(rawRef);

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

  const result = await getTx(network, ref);
  // A block hash pasted where a transaction goes: open that block and say so
  if (!result.ok && result.error.block != null) redirect(`/block/${network}/${result.error.block}?from=hash`);
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
