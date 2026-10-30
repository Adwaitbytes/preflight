import { CircleSlash } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { DoctorView } from "@/components/doctor/doctor-view";
import { LocalView } from "@/components/shared/local-view-loader";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ApiErrorState, StateView } from "@/components/ui/state";
import { truncateMiddle } from "@/lib/format";
import { isNetwork } from "@/lib/networks";
import { classifyInput } from "@/lib/route-input";
import { summarizeDoctor } from "@/lib/report-summary";
import { getDoctor } from "@/lib/server-api";

function parseNetuid(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw == null || !/^\d{1,5}$/.test(raw)) return null;
  return Number(raw);
}

export async function generateMetadata({ params, searchParams }: PageProps<"/doctor/[network]/[hotkey]">): Promise<Metadata> {
  const { network, hotkey: raw } = await params;
  const hotkey = decodeURIComponent(raw);
  const query = await searchParams;
  const netuid = parseNetuid(query.netuid);
  // Same arguments as the page, so React's cache shares one read between metadata and page.
  const fresh = query.fresh != null;
  const alternates = { canonical: `/doctor/${network}/${hotkey}${netuid == null ? "" : `?netuid=${netuid}`}` };
  const fallback: Metadata = {
    title: `Doctor ${truncateMiddle(hotkey, 6, 4)}`,
    description: "Why this hotkey earns what it earns, the cause and the exact command that fixes it",
    alternates,
  };
  if (!isNetwork(network) || network === "local" || classifyInput(hotkey).kind !== "hotkey") return fallback;
  const result = await getDoctor(network, hotkey, netuid, fresh);
  if (!result.ok) return fallback;
  const summary = summarizeDoctor(result.data);
  return {
    alternates,
    title: summary.title,
    description: summary.description,
    openGraph: { title: summary.title, description: summary.description },
    twitter: { card: "summary_large_image", title: summary.title, description: summary.description },
  };
}

export default async function DoctorPage({ params, searchParams }: PageProps<"/doctor/[network]/[hotkey]">) {
  const { network, hotkey: rawHotkey } = await params;
  if (!isNetwork(network)) notFound();
  const hotkey = decodeURIComponent(rawHotkey);
  const query = await searchParams;
  const netuid = parseNetuid(query.netuid);
  const fresh = query.fresh != null;

  if (classifyInput(hotkey).kind !== "hotkey") {
    return (
      <Container className="py-14">
        <StateView
          icon={CircleSlash}
          title="That is not an ss58 hotkey"
          action={
            <Button asChild variant="primary">
              <Link href="/">Paste another value</Link>
            </Button>
          }
        >
          <p>
            Hotkeys are 48 characters of base58 starting with 5, for example <code className="font-mono text-foreground">5DU1dv...S7ww</code>
          </p>
        </StateView>
      </Container>
    );
  }

  if (network === "local") {
    return (
      <Container>
        <LocalView request={{ kind: "doctor", hotkey, netuid }} />
      </Container>
    );
  }

  const result = await getDoctor(network, hotkey, netuid, fresh);
  // A coldkey, or a key with no UID anywhere, has nothing to diagnose: what it holds is the answer
  if (result.ok && netuid == null && result.data.diagnoses.length === 0 && result.data.verdict !== "healthy") {
    redirect(`/account/${network}/${hotkey}?from=doctor`);
  }
  return (
    <Container>
      {result.ok ? (
        <DoctorView report={result.data} network={network} />
      ) : (
        <div className="py-14">
          <ApiErrorState
            error={result.error}
            action={
              <Button asChild variant="secondary">
                <Link href="/">Back to Preflight</Link>
              </Button>
            }
          />
        </div>
      )}
    </Container>
  );
}
