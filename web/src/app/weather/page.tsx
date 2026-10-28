import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/ui/container";
import { WeatherView } from "@/components/weather/weather-view";

export const metadata: Metadata = {
  title: "Network weather",
  description:
    "What is failing on Bittensor right now: failed transactions over the last 60 blocks, about 12 minutes, grouped by error, with the subnets they hit, what each means and the fix",
  alternates: { canonical: "/weather" },
};

export default function WeatherPage() {
  return (
    <Container className="pb-16">
      <PageHeader
        eyebrow="Network weather"
        title="What is failing on chain right now"
        description="The last 60 blocks, about 12 minutes, read and decoded. Failures are grouped by error with the subnets they hit, what the error means and how to fix it, and each opens in the debugger"
      />
      <WeatherView />
    </Container>
  );
}
