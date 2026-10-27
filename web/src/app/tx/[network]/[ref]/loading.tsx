import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Container>
      <div role="status" aria-label="Decoding the extrinsic" className="flex flex-col gap-6 pt-10 sm:pt-14">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-9 w-full max-w-lg" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      </div>
    </Container>
  );
}
