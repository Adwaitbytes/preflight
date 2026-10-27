import type { Metadata } from "next";
import { ExplanationCard } from "@/components/explain/explanation-card";
import { Button } from "@/components/ui/button";
import { Container, PageHeader } from "@/components/ui/container";
import { ApiErrorState } from "@/components/ui/state";
import { getApi } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Explain an error",
  description: "Paste btcli output, an SDK traceback or a runtime error name and get the cause and the fix, with the Subtensor source line the error is raised from",
  alternates: { canonical: "/explain" },
};

const MAX_TEXT = 20_000;

export default async function ExplainPage({ searchParams }: PageProps<"/explain">) {
  const raw = (await searchParams).text;
  const text = (typeof raw === "string" ? raw : "").slice(0, MAX_TEXT).trim();
  const result = text ? await (await getApi()).explainError(text) : null;

  return (
    <Container className="max-w-4xl">
      <PageHeader
        eyebrow="Error explainer"
        title="Paste the error, get the cause and the fix"
        description="Works with btcli output, SDK tracebacks and bare runtime error names. Every Subtensor error is covered, with the source line it is raised from"
      />
      <div className="flex flex-col gap-6">
        <form action="/explain" method="get" className="panel flex flex-col gap-3 p-4 sm:p-5">
          <label htmlFor="error-text" className="text-xs font-medium text-faint">
            Error text
          </label>
          <textarea
            id="error-text"
            name="text"
            defaultValue={text}
            rows={5}
            maxLength={MAX_TEXT}
            spellCheck={false}
            placeholder={"SubtensorModule.TooManyRegistrationsThisBlock\n\nor a whole traceback"}
            className="w-full resize-y rounded-lg bg-surface-2 px-3.5 py-3 font-mono text-[13px] leading-6 text-foreground shadow-[0_0_0_1px_var(--line)] outline-none placeholder:text-faint focus-visible:shadow-[0_0_0_2px_var(--ring)]"
          />
          <Button type="submit" variant="primary" className="self-start">
            Explain
          </Button>
        </form>
        {result && (result.ok ? <ExplanationCard explanation={result.data} /> : <ApiErrorState error={result.error} />)}
      </div>
    </Container>
  );
}
