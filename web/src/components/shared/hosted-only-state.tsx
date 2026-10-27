import { SquareTerminal, Terminal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { StateView } from "@/components/ui/state";

/** Views the server reads from the hosted API only: on a local chain the CLI prints the same report */
export function HostedOnlyState({ title, command }: { title: string; command: string }) {
  return (
    <div className="py-14">
      <StateView
        icon={SquareTerminal}
        title={title}
        action={
          <Button asChild variant="secondary">
            <Link href="/">Back to Preflight</Link>
          </Button>
        }
      >
        <p>This page reads finney and test. For a local chain, the CLI prints the same report from your machine</p>
        <div className="mt-5 overflow-hidden rounded-xl bg-background text-left shadow-[0_0_0_1px_var(--line-strong)]">
          <div className="flex items-center gap-2 border-b border-line px-3.5 py-2">
            <Terminal className="size-3.5 text-faint" aria-hidden />
            <span className="eyebrow">In your terminal</span>
            <CopyButton value={command} label="Copy command" className="-mr-1.5 ml-auto" size="xs" />
          </div>
          <pre className="overflow-x-auto px-3.5 py-3 font-mono text-[13px] leading-6 text-foreground">
            <code>
              <span aria-hidden className="text-faint select-none">
                ${" "}
              </span>
              {command}
            </code>
          </pre>
        </div>
      </StateView>
    </div>
  );
}
