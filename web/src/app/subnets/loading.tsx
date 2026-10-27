import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container>
      <div role="status" aria-label="Loading subnets" className="flex flex-col gap-5 pt-10 sm:pt-14">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full max-w-xl" />
        <Skeleton className="mt-6 h-11 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      </div>
    </Container>
  );
}
