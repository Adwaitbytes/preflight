import { RotateCw } from "lucide-react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { StatsDashboard } from "@/components/stats/stats-dashboard";
import { StatsLogin } from "@/components/stats/stats-login";
import { Container } from "@/components/ui/container";
import { StateView } from "@/components/ui/state";
import { getStats, parseRange } from "@/lib/stats-api";
import { sessionValid, STATS_COOKIE, statsEnabled } from "@/lib/stats-auth";

export const metadata: Metadata = {
  title: "Stats",
  robots: { index: false, follow: false, nocache: true },
};

export default async function StatsPage({ searchParams }: PageProps<"/stats">) {
  const signedIn = sessionValid((await cookies()).get(STATS_COOKIE)?.value);
  if (!signedIn) {
    return (
      <Container>
        <StatsLogin enabled={statsEnabled()} />
      </Container>
    );
  }
  const query = await searchParams;
  const range = parseRange(query.range);
  const automated = query.automated === "1";
  const result = await getStats(range, automated);
  return (
    <Container className="pb-16">
      {result.ok ? (
        <StatsDashboard report={result.report} range={range} automated={automated} />
      ) : (
        <StateView
          icon={RotateCw}
          title="Stats did not load"
          tone="critical"
          className="mt-12"
          action={
            <Link href={`/stats?range=${range}`} className="text-sm font-medium text-accent-ink hover:underline">
              Try again
            </Link>
          }
        >
          {result.message}
        </StateView>
      )}
    </Container>
  );
}
