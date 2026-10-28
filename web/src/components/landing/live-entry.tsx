import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/container";

/** The way from the landing page into the live explorer; static, so the landing page reads no chain data */
export function LiveEntry() {
  return (
    <section aria-label="Live explorer" className="relative -mt-6 pb-16 sm:-mt-12 sm:pb-20">
      <Container>
        <Link
          href="/live"
          className="group panel flex items-center gap-4 px-4 py-4 transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-px hover:shadow-(--shadow-float) sm:px-5"
        >
          <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-healthy-soft shadow-[0_0_0_1px_color-mix(in_oklab,var(--healthy)_22%,transparent)]">
            <span className="relative inline-flex size-2">
              <span className="live-ping absolute inset-0 rounded-full bg-healthy" />
              <span className="relative size-2 rounded-full bg-healthy" />
            </span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-medium tracking-[-0.01em] text-foreground">Watch the chain live</span>
            <span className="mt-0.5 block text-sm text-pretty text-muted-foreground">
              Every transaction on Finney decoded into a plain sentence as its block lands, failures and all
            </span>
          </span>
          <span className="hidden shrink-0 text-[13px] font-medium text-muted-foreground transition-colors group-hover:text-foreground sm:inline">Open the stream</span>
          <ArrowRight className="size-4 shrink-0 text-faint transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden />
        </Link>
      </Container>
    </section>
  );
}
