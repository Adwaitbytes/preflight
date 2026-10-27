import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const COLUMNS = ["Show", "Explain", "Fix", "Simulate"] as const;
type Column = (typeof COLUMNS)[number];

const ROWS: { name: string; href?: string; has: Column[] }[] = [
  { name: "Taostats", href: "https://taostats.io", has: ["Show"] },
  { name: "tao.app", href: "https://tao.app", has: ["Show"] },
  { name: "bittensor.ai", href: "https://bittensor.ai", has: ["Show"] },
  { name: "Metagraphed", href: "https://metagraphed.com", has: ["Show"] },
  { name: "Preflight", has: ["Show", "Explain", "Fix", "Simulate"] },
];

const MEANING: Record<Column, string> = {
  Show: "Chain data on a page",
  Explain: "Why, in plain words",
  Fix: "The exact command",
  Simulate: "Try before paying",
};

export function Comparison() {
  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left">
          <caption className="sr-only">What explorers do compared with Preflight</caption>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="w-[34%] px-5 py-4 text-xs font-medium text-faint sm:px-6">
                Tool
              </th>
              {COLUMNS.map((col) => (
                <th key={col} scope="col" className="px-3 py-4 text-center">
                  <span className="block text-[13px] font-semibold text-foreground">{col}</span>
                  <span className="mt-0.5 block text-[11.5px] font-normal text-faint">{MEANING[col]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const ours = !row.href;
              return (
                <tr key={row.name} className={cn("border-b border-line last:border-0", ours && "bg-accent-soft")}>
                  <th scope="row" className={cn("px-5 py-3.5 text-sm font-medium sm:px-6", ours ? "text-foreground" : "text-muted-foreground")}>
                    {row.href ? (
                      <a href={row.href} target="_blank" rel="noreferrer" className="rounded hover:text-foreground">
                        {row.name}
                      </a>
                    ) : (
                      row.name
                    )}
                  </th>
                  {COLUMNS.map((col) => {
                    const yes = row.has.includes(col);
                    return (
                      <td key={col} className="px-3 py-3.5 text-center">
                        {yes ? (
                          <Check className={cn("mx-auto size-4", ours ? "text-accent-ink" : "text-muted-foreground")} aria-label="Yes" />
                        ) : (
                          <Minus className="mx-auto size-4 text-faint/60" aria-label="No" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
