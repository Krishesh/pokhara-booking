import { OfferListSkeleton } from "@/components/offer-list";
import { Skeleton } from "@/components/ui/skeleton";

export default function ActivityDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-5 pt-8 sm:px-8 lg:px-10">
      <div className="space-y-6">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-20 rounded-4xl" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>

      <OfferListSkeleton />
    </div>
  );
}
