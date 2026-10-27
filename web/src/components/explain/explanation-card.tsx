import { SourceLink } from "@/components/shared/source-link";
import { ExternalLink, SearchX } from "lucide-react";
import { FixBlock } from "@/components/shared/fix-block";
import { RichText } from "@/components/shared/rich-text";
import { Badge } from "@/components/ui/badge";
import type { ErrorExplanation } from "@/lib/types";

export function ExplanationCard({ explanation }: { explanation: ErrorExplanation }) {
  if (explanation.found === false) {
    return (
      <div className="panel flex gap-4 p-5 sm:p-6">
        <SearchX className="mt-0.5 size-5 shrink-0 text-faint" aria-hidden />
        <div>
          <h2 className="text-[15px] font-semibold">{explanation.title}</h2>
          <p className="mt-1.5 max-w-[64ch] text-sm leading-6 text-muted-foreground">{explanation.explanation}</p>
        </div>
      </div>
    );
  }
  return (
    <article className="panel rise-in flex flex-col gap-5 p-5 sm:p-7">
      <div className="flex flex-wrap items-center gap-2">
        {explanation.code && <Badge tone="accent">{explanation.code.replaceAll("_", " ")}</Badge>}
        {explanation.trap && <Badge tone="medium">Known trap</Badge>}
      </div>
      <div>
        <p className="font-mono text-[13px] break-words text-critical">
          {explanation.pallet ? `${explanation.pallet}.` : ""}
          {explanation.error}
        </p>
        <h2 className="mt-2 text-title font-semibold text-balance">{explanation.title}</h2>
      </div>
      <p className="max-w-[72ch] text-[15px] leading-7 text-pretty text-muted-foreground">
        <RichText text={explanation.explanation} />
      </p>
      {explanation.fix && <FixBlock fix={explanation.fix} />}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-faint">
        {explanation.source && <SourceLink source={explanation.source} className="min-w-0 max-w-full" />}
        {explanation.docs && (
          <a href={explanation.docs} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded text-muted-foreground hover:text-foreground">
            Docs
            <ExternalLink className="size-3" aria-hidden />
          </a>
        )}
      </div>
    </article>
  );
}
