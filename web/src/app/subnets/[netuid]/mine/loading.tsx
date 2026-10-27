import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container>
      <div role="status" aria-label="Reading the subnet's economics" className="flex flex-col">
        <div className="flex flex-col gap-6 pt-8 pb-10 sm:pt-12">
          <Skeleton className="h-4 w-36" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-9 w-full max-w-xl" />
            <Skeleton className="h-5 w-full max-w-2xl" />
          </div>
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
        <Skeleton className="mt-6 h-72 rounded-xl" />
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
        <span className="sr-only">Reading the subnet&apos;s economics</span>
      </div>
    </Container>
  );
}
