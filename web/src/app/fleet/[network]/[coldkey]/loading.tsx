import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container>
      <div role="status" aria-label="Reading every seat" className="flex flex-col">
        <div className="flex flex-col gap-6 pt-10 pb-10 sm:pt-14">
          <Skeleton className="h-4 w-72 max-w-full" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-9 w-full max-w-xl" />
            <Skeleton className="h-5 w-full max-w-2xl" />
            <Skeleton className="h-5 w-2/3 max-w-lg" />
          </div>
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl sm:grid-cols-5">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className={i === 4 ? "col-span-2 h-[88px] rounded-none sm:col-span-1" : "h-[88px] rounded-none"} />
          ))}
        </div>
        <div className="mt-8 flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-16" />
          <div className="hidden gap-1.5 sm:flex">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-px overflow-hidden rounded-xl">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-[52px] rounded-none" />
          ))}
        </div>
        <span className="sr-only">Reading every seat</span>
      </div>
    </Container>
  );
}
