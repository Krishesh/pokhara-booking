import { OfferListSkeleton } from "@/components/offer-list";
import { Skeleton } from "@/components/ui/skeleton";

export default function ActivityDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-6">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="aspect-video w-full rounded-xl" />
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
