import { OfferCard } from "@/components/offer-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAvailableOffersForActivity } from "@/lib/offers";

export async function OfferList({ activityId }: { activityId: string }) {
  const offers = await getAvailableOffersForActivity(activityId);

  return (
    <section aria-labelledby="offers-heading" className="space-y-4">
      <h2 id="offers-heading" className="text-2xl font-semibold tracking-tight">
        Offers {offers.length > 0 && <span className="text-muted-foreground">({offers.length})</span>}
      </h2>

      {offers.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          Booking requests are not available for this activity yet.
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Compare what each offer includes, not just the price.
          </p>
          <ul className="space-y-4">
            {offers.map((offer) => (
              <li key={offer.id}>
                <OfferCard offer={offer} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

export function OfferListSkeleton() {
  return (
    <section className="space-y-4" aria-busy="true" aria-label="Loading offers">
      <Skeleton className="h-8 w-32" />
      {Array.from({ length: 2 }, (_, i) => (
        <Card key={i}>
          <CardHeader className="gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
