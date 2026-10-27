import { Archive } from "lucide-react";

export function OfflineBanner() {
  return (
    <div role="status" className="border-b border-medium/25 bg-medium-soft text-medium">
      <div className="mx-auto flex max-w-6xl items-center gap-2.5 px-4 py-2 text-[13px] sm:px-6 lg:px-8">
        <Archive className="size-3.5 shrink-0" aria-hidden />
        <p className="flex min-w-0 flex-wrap gap-x-2">
          <span className="font-semibold">Offline demo</span>
          <span>Recorded finney data from blocks 9,376,574 to 9,376,750, no live reads</span>
        </p>
      </div>
    </div>
  );
}
