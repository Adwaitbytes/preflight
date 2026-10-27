import { Skeleton } from "@/components/ui/skeleton";

export function DoctorSkeleton() {
  return (
    <div role="status" aria-label="Reading the chain" className="flex flex-col">
      <div className="flex flex-col gap-6 pt-10 pb-10 sm:pt-14">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-7 w-24 rounded-full" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-9 w-full max-w-2xl" />
          <Skeleton className="h-9 w-3/4 max-w-xl" />
        </div>
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-7 w-48" />
      <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl sm:grid-cols-4 lg:grid-cols-7">
        {Array.from({ length: 7 }, (_, i) => (
          <Skeleton key={i} className="h-[74px] rounded-none" />
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-3">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
      <span className="sr-only">Reading the chain</span>
    </div>
  );
}
