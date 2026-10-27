import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container>
      <div role="status" aria-label="Reading launch costs" className="flex flex-col gap-6 pt-10 sm:pt-14">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-full max-w-xl" />
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-60 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </Container>
  );
}
