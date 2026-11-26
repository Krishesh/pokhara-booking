import { OfferCard } from "@/components/offer-card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatPrice, sortOffers } from "@/lib/offer-format"
import type { AvailableOffer } from "@/lib/types"

interface OfferListProps {
  offers: AvailableOffer[]
  activityName: string
}

export function OfferList({ offers, activityName }: OfferListProps) {
  const sorted = sortOffers(offers)
  const fromOffer = sorted[0]

  return (
    <section
      id="offers"
      aria-labelledby="offers-heading"
      className="scroll-mt-24 space-y-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            Offers
          </p>
          <h2
            id="offers-heading"
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Compare offers
          </h2>
          <p className="text-sm text-muted-foreground">
            Look at what each one includes, not just the price.
          </p>
        </div>
        {fromOffer ? (
          <p className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
            {offers.length} offers from{" "}
            <span className="font-bold text-primary tabular-nums">
              {formatPrice(fromOffer.price, fromOffer.currency)}
            </span>
          </p>
        ) : null}
      </div>

      {offers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Booking requests are not available for this activity yet.
        </div>
      ) : (
        <ul className="grid gap-4">
          {sorted.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              activityName={activityName}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

export function OfferListSkeleton() {
  return (
    <section className="space-y-5" aria-label="Loading offers">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
      </div>

      <div className="grid gap-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="grid gap-0 overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-[1fr_14rem]"
          >
            <div className="space-y-4 p-5">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
            <div className="space-y-3 border-t border-border bg-muted/40 p-5 lg:border-t-0 lg:border-l">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-6 w-28 rounded-lg" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
