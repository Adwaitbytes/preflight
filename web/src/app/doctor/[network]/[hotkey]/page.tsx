import { CircleSlash } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DoctorView } from "@/components/doctor/doctor-view";
import { LocalView } from "@/components/shared/local-view";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ApiErrorState, StateView } from "@/components/ui/state";
import { truncateMiddle } from "@/lib/format";
import { isNetwork } from "@/lib/networks";
import { classifyInput } from "@/lib/route-input";
import { getApi } from "@/lib/server-api";

function parseNetuid(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw == null || !/^\d{1,5}$/.test(raw)) return null;
  return Number(raw);
}

export async function generateMetadata({ params }: PageProps<"/doctor/[network]/[hotkey]">): Promise<Metadata> {
  const { hotkey } = await params;
  return { title: `Doctor ${truncateMiddle(decodeURIComponent(hotkey), 6, 4)}` };
}

export default async function DoctorPage({ params, searchParams }: PageProps<"/doctor/[network]/[hotkey]">) {
  const { network, hotkey: rawHotkey } = await params;
  if (!isNetwork(network)) notFound();
  const hotkey = decodeURIComponent(rawHotkey);
  const netuid = parseNetuid((await searchParams).netuid);

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

  const api = await getApi();
  const result = await api.doctor(network, hotkey, { netuid });
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
