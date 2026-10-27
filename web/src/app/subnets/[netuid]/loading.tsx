import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container>
      <div role="status" aria-label="Loading subnet" className="flex flex-col gap-6 pt-10 sm:pt-14">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-5 w-full max-w-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    </Container>
  );
}
