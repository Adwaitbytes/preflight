import type { Metadata } from "next";
import { Closing } from "@/components/home/closing";
import { Contrast } from "@/components/home/contrast";
import { Hero } from "@/components/home/hero";
import { Numbers } from "@/components/home/numbers";
import { Proof } from "@/components/home/proof";
import { Surfaces } from "@/components/home/surfaces";
import { Tour } from "@/components/home/tour";
import type { Example } from "@/components/landing/omnibox";

export const metadata: Metadata = { alternates: { canonical: "/" } };

// Every value here is a real finney read, so the chips work offline and live
const EXAMPLES: Example[] = [
  { label: "Miner earning zero", value: "5EKtvzbEvYZPRJdo42ug7mWrHdt4AurCNMs5CAefuBHfQmhq" },
  { label: "Failed unstake", value: "9382178-8" },
  { label: "Error", value: "SubtensorModule.TooManyRegistrationsThisBlock" },
];

export default function Home() {
  return (
    <>
      <Hero examples={EXAMPLES} />
      <Numbers />
      <Tour />
      <Proof />
      <Surfaces />
      <Contrast />
      <Closing examples={EXAMPLES} />
    </>
  );
}
