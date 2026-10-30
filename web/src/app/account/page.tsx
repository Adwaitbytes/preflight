import type { Metadata } from "next";
import { AccountLookup } from "@/components/account/account-lookup";
import { Container, PageHeader } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Account",
  description: "Balance, stakes and keys of any Bittensor address, on mainnet or testnet",
  alternates: { canonical: "/account" },
};

export default function AccountIndex() {
  return (
    <Container>
      <div className="pb-24">
        <PageHeader eyebrow="Account" title="Any address, any network" accent="any network" description="Balance, stakes and the keys it owns. Testnet too." />
        <AccountLookup />
      </div>
    </Container>
  );
}
