"use client";

import { ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { StateView } from "@/components/ui/state";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container className="py-16">
      <StateView
        icon={ServerCrash}
        tone="critical"
        title="Something broke while rendering this page"
        action={
          <Button variant="primary" onClick={reset}>
            Try again
          </Button>
        }
      >
        {error.digest ? `Reference ${error.digest}` : "Reload the page or go back"}
      </StateView>
    </Container>
  );
}
