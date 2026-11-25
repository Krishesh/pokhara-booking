import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 rounded-2xl bg-card p-4" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-5 w-1/3" />
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex gap-4">
          <Skeleton className="h-8 flex-[3]" />
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="hidden h-8 flex-1 md:block" />
        </div>
      ))}
    </div>
  );
}
