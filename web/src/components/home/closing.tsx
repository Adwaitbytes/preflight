"use client";

import { Omnibox, type Example } from "@/components/landing/omnibox";
import { SeatField } from "./seat-field";

/** The last word on the landing: the promise again, and the box to act on it */
export function Closing({ examples }: { examples: Example[] }) {
  return (
    <section aria-labelledby="closing-title" className="dark relative isolate overflow-hidden bg-[#040407] text-foreground">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <SeatField className="absolute inset-0 -z-10 size-full opacity-50 [mask-image:radial-gradient(70%_70%_at_50%_100%,black,transparent)]" />
      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 pt-20 pb-28 text-center sm:px-6 sm:pt-28 sm:pb-36 lg:px-8">
        <h2 id="closing-title" className="text-[clamp(2.6rem,5.8vw,5.25rem)] leading-[1] font-light tracking-[-0.05em] text-balance text-white">
          Every zero should come with a <span className="font-serif font-normal tracking-[-0.01em] text-[#9db0ff] italic">reason</span>
        </h2>
        <p className="mt-6 max-w-[34rem] text-lg leading-8 text-pretty text-white/60">Free, open source, and it only ever reads public chain data. Try it on your own hotkey now.</p>
        <div className="mt-10 w-full max-w-2xl text-left">
          <Omnibox examples={examples} variant="hero" inputId="omnibox-closing" align="center" />
        </div>
      </div>
    </section>
  );
}
