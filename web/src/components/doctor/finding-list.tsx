"use client";

import { ChevronDown, ExternalLink } from "lucide-react";
import { Accordion } from "radix-ui";
import { FixBlock } from "@/components/shared/fix-block";
import { RichText } from "@/components/shared/rich-text";
import { SeverityBadge } from "@/components/ui/badge";
import { formatInt } from "@/lib/format";
import { sortFindings } from "@/lib/severity";
import type { Finding } from "@/lib/types";

const READ_AT = "Read at block";

function EvidenceTable({ finding, block }: { finding: Finding; block: number }) {
  const rows = finding.evidence.filter((e) => e.label !== READ_AT);
  return (
    <div className="overflow-hidden rounded-xl shadow-[0_0_0_1px_var(--line)]">
      <table className="w-full text-left text-[13px]">
        <caption className="sr-only">Evidence for {finding.title}</caption>
        <thead className="bg-surface-2 text-xs text-faint">
          <tr>
            <th scope="col" className="px-3.5 py-2 font-medium">
              Evidence
            </th>
            <th scope="col" className="hidden px-3.5 py-2 font-medium sm:table-cell">
              Value
            </th>
            <th scope="col" className="hidden px-3.5 py-2 font-medium lg:table-cell">
              Source
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row, i) => (
            <tr key={`${row.label}-${i}`} className="align-top">
              <th scope="row" className="px-3.5 py-2.5 font-normal text-muted-foreground sm:w-[36%]">
                <span className="text-[13px] break-words">{row.label}</span>
                <span className="mt-1 block font-mono text-[12.5px] text-foreground sm:hidden">{row.value}</span>
                {row.source && <span className="mt-1 block font-mono text-[11.5px] text-faint lg:hidden">{row.source}</span>}
              </th>
              <td className="tnum hidden px-3.5 py-2.5 font-mono text-[12.5px] text-foreground sm:table-cell">{row.value}</td>
              <td className="hidden px-3.5 py-2.5 font-mono text-[11.5px] text-faint lg:table-cell">{row.source ?? "derived"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-line bg-surface-2/60 px-3.5 py-2 text-xs text-faint">
        All values read at block <span className="font-mono text-muted-foreground">{formatInt(block)}</span>
      </p>
    </div>
  );
}

export function FindingList({ findings, block }: { findings: Finding[]; block: number }) {
  const sorted = sortFindings(findings);
  const first = sorted[0];
  return (
    <Accordion.Root type="multiple" defaultValue={first ? [first.id] : []} className="flex flex-col gap-3">
      {sorted.map((finding) => (
        <Accordion.Item key={finding.id} value={finding.id} className="panel overflow-hidden">
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full cursor-pointer items-start gap-3 rounded-xl px-4 py-4 text-left transition-colors hover:bg-surface-2/50 sm:items-center sm:px-5">
              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <span className="self-start sm:self-auto">
                  <SeverityBadge severity={finding.severity} />
                </span>
                <span className="min-w-0 text-[15px] font-medium tracking-[-0.01em] text-foreground">{finding.title}</span>
              </div>
              <span className="mt-0.5 hidden font-mono text-xs text-faint sm:mt-0 sm:inline">{finding.id}</span>
              <ChevronDown
                className="mt-1 size-4 shrink-0 text-faint transition-transform duration-200 group-data-[state=open]:rotate-180 sm:mt-0"
                aria-hidden
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="flex flex-col gap-4 border-t border-line px-4 pt-4 pb-5 sm:px-5">
              {finding.fix && <FixBlock fix={finding.fix} />}
              <p className="max-w-[72ch] text-[15px] leading-7 text-pretty text-muted-foreground">
                <RichText text={finding.explanation} />
              </p>
              {finding.evidence.length > 0 && <EvidenceTable finding={finding} block={block} />}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-faint">
                <span className="font-mono sm:hidden">{finding.id}</span>
                <span className="font-mono">{finding.rule}</span>
                {finding.docs && (
                  <a
                    href={finding.docs}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded text-muted-foreground underline decoration-line-strong underline-offset-4 hover:text-foreground"
                  >
                    Docs
                    <ExternalLink className="size-3" aria-hidden />
                  </a>
                )}
              </div>
            </div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
