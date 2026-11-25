import { Inbox } from "lucide-react";

import { OfferCard } from "@/components/offer-card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, summarizeOffers } from "@/lib/offer-format";
import { getAvailableOffersForActivity } from "@/lib/offers";

export async function OfferList({ activityId, activityName }: { activityId: string; activityName: string }) {
  const offers = await getAvailableOffersForActivity(activityId);
  const summary = summarizeOffers(offers.map((o) => ({ activity_id: activityId, price: o.price, currency: o.currency }))).get(
    activityId,
  );

  return (
    <section id="offers" aria-labelledby="offers-heading" className="scroll-mt-6 space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <div className="space-y-1">
          <h2 id="offers-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
            Compare offers
          </h2>
          {offers.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Look at what each one includes, not just the price.
            </p>
          )}
        </div>
        {summary && (
          <p className="text-sm text-muted-foreground">
            {summary.count} {summary.count === 1 ? "offer" : "offers"} from{" "}
            <span className="font-semibold text-sunrise tabular-nums">{formatPrice(summary.fromPrice, summary.fromCurrency)}</span>
          </p>
        )}
      </div>

      {offers.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-card px-6 py-12 text-center">
          <Inbox className="size-7 text-primary" aria-hidden="true" />
          <p className="text-base font-semibold">No offers to compare yet</p>
          <p className="max-w-[44ch] text-sm text-muted-foreground">
            Booking requests open once a local company lists a price for this activity. Try another activity meanwhile.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3">
          {offers.map((offer) => (
            <li key={offer.id}>
              <OfferCard offer={offer} activityName={activityName} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function OfferListSkeleton() {
  return (
    <section className="space-y-5" aria-busy="true" aria-label="Loading offers">
      <Skeleton className="h-8 w-56" />
      {Array.from({ length: 2 }, (_, i) => (
        <div key={i} className="grid gap-6 rounded-2xl bg-card p-5 sm:p-6 lg:grid-cols-[1fr_16rem]">
          <div className="space-y-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      ))}
    </section>
  );
}
