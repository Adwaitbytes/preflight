import { SearchX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { StateView } from "@/components/ui/state";

export default function NotFound() {
  return (
    <Container className="py-16">
      <StateView
        icon={SearchX}
        title="This page does not exist"
        headingLevel={1}
        action={
          <Button asChild variant="primary">
            <Link href="/">Back to Preflight</Link>
          </Button>
        }
      >
        Paste a hotkey, extrinsic or netuid on the home page instead
      </StateView>
    </Container>
  );
}
