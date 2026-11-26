import {
  BadgeCheck,
  CalendarDays,
  Check,
  Clock,
  Info,
  Star,
} from "lucide-react"

import { BookingDialog } from "@/components/booking-dialog"
import { Badge } from "@/components/ui/badge"
import { isRequestableOffer } from "@/lib/booking"
import {
  formatCheckedDateShort,
  formatPricingUnit,
  formatPrice,
  formatRatingLabel,
} from "@/lib/offer-format"
import type { AvailableOffer } from "@/lib/types"

interface OfferCardProps {
  offer: AvailableOffer
  activityName: string
}

export function OfferCard({ offer, activityName }: OfferCardProps) {
  const vendorLabel = offer.provider
    ? offer.provider.name
    : `Listed on ${offer.source_domain}`
  const ratingLabel = formatRatingLabel(
    offer.provider?.google_rating,
    offer.provider?.google_review_count
  )
  const packageTitle = offer.package_name?.trim() || "Standard package"
  const unitLabel = formatPricingUnit(offer.pricing_unit)
  const checkedDateLabel = formatCheckedDateShort(offer.retrieved_at)
  const inclusions = offer.inclusions?.trim()
  const conditions = offer.booking_conditions?.trim()
  const requestable = isRequestableOffer(offer)

  return (
    <li>
      <article className="grid gap-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-[border-color,box-shadow] duration-300 hover:border-primary/40 hover:shadow-card">
        <div className="min-w-0 space-y-4 p-5 sm:p-6">
          <div className="space-y-1">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="font-semibold">{vendorLabel}</span>
              {ratingLabel ? (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Star
                    className="size-3.5 fill-sunrise text-sunrise"
                    aria-hidden="true"
                  />
                  {ratingLabel}
                </span>
              ) : null}
            </p>
            <h3 className="font-heading text-lg font-semibold tracking-tight">
              {packageTitle}
            </h3>
            {offer.duration ? (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="size-3.5" aria-hidden="true" />
                {offer.duration}
              </p>
            ) : null}
          </div>

          {inclusions ? (
            <div className="flex gap-3 border-l-2 border-primary/40 pl-4">
              <Check
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Included</h4>
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {inclusions}
                </p>
              </div>
            </div>
          ) : null}

          {conditions ? (
            <div className="flex gap-3 pl-4">
              <Info
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Conditions</h4>
                <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                  {conditions}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-border bg-mist p-5 lg:border-t-0 lg:border-l">
          <p>
            <span className="block text-2xl leading-none font-bold tracking-tight text-primary tabular-nums">
              {formatPrice(offer.price, offer.currency)}
            </span>
            {unitLabel ? (
              <span className="mt-1 block text-sm text-muted-foreground">
                {unitLabel}
              </span>
            ) : null}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {offer.verification_status === "verified" ? (
              <Badge className="h-6 border-transparent bg-accent px-2.5 py-0.5 text-[13px] text-accent-foreground [&>svg]:size-3.5">
                <BadgeCheck aria-hidden="true" />
                Verified price
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="h-6 border-border bg-card px-2.5 py-0.5 text-[13px] text-foreground"
              >
                Unverified price
              </Badge>
            )}
            {checkedDateLabel ? (
              <span className="flex items-center gap-1">
                <CalendarDays className="size-3.5" aria-hidden="true" />
                {checkedDateLabel}
              </span>
            ) : null}
          </div>

          <div className="mt-auto pt-1">
            {requestable ? (
              <BookingDialog offer={offer} activityName={activityName} />
            ) : (
              <p className="text-xs leading-relaxed text-muted-foreground">
                Online requests aren&apos;t available for this offer. Contact
                the company directly.
              </p>
            )}
          </div>
        </div>
      </article>
    </li>
  )
}
