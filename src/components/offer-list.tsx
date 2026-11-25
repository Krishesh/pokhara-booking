import { Inbox } from "lucide-react";

import { OfferCard } from "@/components/offer-card";
import { Reveal } from "@/components/reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, summarizeOffers } from "@/lib/offer-format";
import { getAvailableOffersForActivity } from "@/lib/offers";

export async function OfferList({ activityId, activityName }: { activityId: string; activityName: string }) {
  const offers = await getAvailableOffersForActivity(activityId);
  const summary = summarizeOffers(offers.map((o) => ({ activity_id: activityId, price: o.price, currency: o.currency }))).get(
    activityId,
  );

  return (
    <section id="offers" aria-labelledby="offers-heading" className="scroll-mt-6 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <div className="space-y-2">
          <h2 id="offers-heading" className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Compare offers
          </h2>
          {offers.length > 0 && (
            <p className="text-[17px] text-muted-foreground">
              Look at what each one includes, not just the price.
            </p>
          )}
        </div>
        {summary && (
          <p className="text-[17px]">
            {summary.count} {summary.count === 1 ? "offer" : "offers"} from{" "}
            <span className="font-bold text-sunrise tabular-nums">{formatPrice(summary.fromPrice, summary.fromCurrency)}</span>
          </p>
        )}
      </div>

      {offers.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-card px-6 py-14 text-center">
          <Inbox className="size-8 text-primary" aria-hidden="true" />
          <p className="text-lg font-semibold">No offers to compare yet</p>
          <p className="max-w-[44ch] text-base text-muted-foreground">
            Booking requests open once a local company lists a price for this activity. Try another activity meanwhile.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4">
          {offers.map((offer, i) => (
            <Reveal as="li" key={offer.id} delay={(i % 3) as 0 | 1 | 2}>
              <OfferCard offer={offer} activityName={activityName} />
            </Reveal>
          ))}
        </ul>
      )}
    </section>
  );
}

export function OfferListSkeleton() {
  return (
    <section className="space-y-8" aria-busy="true" aria-label="Loading offers">
      <Skeleton className="h-12 w-72" />
      {Array.from({ length: 2 }, (_, i) => (
        <div key={i} className="grid gap-6 rounded-3xl bg-card p-6 sm:p-8 lg:grid-cols-[1fr_18rem]">
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
