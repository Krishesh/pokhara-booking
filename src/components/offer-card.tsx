import { BadgeCheck, CalendarCheck, Check, Clock, Info, Star } from "lucide-react";

import { BookingDialog } from "@/components/booking-dialog";
import { Badge } from "@/components/ui/badge";
import { isRequestableUnit } from "@/lib/booking";
import { formatCheckedDate, formatPrice, formatPricingUnit, formatRating } from "@/lib/offer-format";
import type { AvailableOffer } from "@/lib/types";

export function OfferCard({ offer, activityName }: { offer: AvailableOffer; activityName: string }) {
  const unit = formatPricingUnit(offer.pricing_unit);
  const rating = offer.provider
    ? formatRating(offer.provider.google_rating, offer.provider.google_review_count)
    : null;
  const checked = formatCheckedDate(offer.retrieved_at);
  const vendor = offer.provider?.name ?? `Listed on ${offer.source_domain}`;
  const verified = offer.verification_status === "verified";

  return (
    <article className="grid gap-5 rounded-2xl border border-border bg-card p-5 sm:p-6 lg:grid-cols-[1fr_16rem] lg:gap-8">
      <div className="min-w-0 space-y-4">
        <div className="space-y-1">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="font-semibold">{vendor}</span>
            {rating && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Star className="size-3.5 fill-sunrise text-sunrise" aria-hidden="true" />
                {rating}
              </span>
            )}
          </p>
          <h3 className="text-lg leading-snug font-semibold tracking-tight">
            {offer.package_name ?? "Standard package"}
          </h3>
          {offer.duration && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="size-3.5" aria-hidden="true" />
              {offer.duration}
            </p>
          )}
        </div>

        {offer.inclusions && (
          <div className="flex gap-3 rounded-xl bg-mist p-4">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Included</h4>
              <p className="text-sm leading-relaxed whitespace-pre-line">{offer.inclusions}</p>
            </div>
          </div>
        )}
        {offer.booking_conditions && (
          <div className="flex gap-3 px-4">
            <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Conditions</h4>
              <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {offer.booking_conditions}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="order-first flex flex-col gap-3 rounded-xl bg-mist p-5 lg:order-none">
        <p>
          <span className="block text-2xl leading-none font-bold tracking-tight text-sunrise tabular-nums">
            {formatPrice(offer.price, offer.currency)}
          </span>
          {unit && <span className="mt-1 block text-sm text-muted-foreground">{unit}</span>}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {verified ? (
            <Badge>
              <BadgeCheck aria-hidden="true" />
              Verified price
            </Badge>
          ) : (
            <Badge variant="outline">Unverified price</Badge>
          )}
          {checked && (
            <span className="flex items-center gap-1">
              <CalendarCheck className="size-3.5" aria-hidden="true" />
              Checked {checked}
            </span>
          )}
        </div>
        <div className="mt-auto pt-1">
          {isRequestableUnit(offer.pricing_unit) ? (
            <BookingDialog
              activityName={activityName}
              offer={{
                id: offer.id,
                price: offer.price,
                currency: offer.currency,
                pricing_unit: offer.pricing_unit,
                package_name: offer.package_name,
                vendor,
              }}
            />
          ) : (
            <p className="rounded-xl bg-card p-3 text-sm text-muted-foreground">
              Online requests aren&apos;t available for this offer. Contact the company directly.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
