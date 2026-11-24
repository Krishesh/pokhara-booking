import { BadgeCheck, CalendarCheck, Clock, Star } from "lucide-react";

import { BookingDialog } from "@/components/booking-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { isRequestableUnit } from "@/lib/booking";
import {
  formatCheckedDate,
  formatPrice,
  formatPricingUnit,
  formatRating,
} from "@/lib/offer-format";
import type { AvailableOffer } from "@/lib/types";

export function OfferCard({ offer, activityName }: { offer: AvailableOffer; activityName: string }) {
  const unit = formatPricingUnit(offer.pricing_unit);
  const rating = offer.provider
    ? formatRating(offer.provider.google_rating, offer.provider.google_review_count)
    : null;
  const checked = formatCheckedDate(offer.retrieved_at);
  const vendor = offer.provider?.name ?? `Listed on ${offer.source_domain}`;

  return (
    <Card>
      <CardHeader className="gap-1">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{vendor}</span>
          {rating && (
            <span className="flex items-center gap-1">
              <Star className="size-3.5 fill-current" aria-hidden="true" />
              {rating}
            </span>
          )}
        </p>
        <CardTitle>
          <h3 className="text-lg">{offer.package_name ?? "Standard package"}</h3>
        </CardTitle>
        {offer.duration && (
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="size-3.5" aria-hidden="true" />
            {offer.duration}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p>
            <span className="text-2xl font-bold tracking-tight">
              {formatPrice(offer.price, offer.currency)}
            </span>
            {unit && <span className="ml-1 text-muted-foreground">{unit}</span>}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {offer.verification_status === "verified" ? (
              <Badge>
                <BadgeCheck aria-hidden="true" />
                Verified
              </Badge>
            ) : (
              <Badge variant="outline">Unverified price</Badge>
            )}
            {checked && (
              <span className="flex items-center gap-1">
                <CalendarCheck className="size-3.5" aria-hidden="true" />
                Price checked {checked}
              </span>
            )}
          </div>
        </div>

        {offer.inclusions && <OfferDetail title="Included" text={offer.inclusions} />}
        {offer.booking_conditions && (
          <OfferDetail title="Conditions" text={offer.booking_conditions} />
        )}
      </CardContent>

      <CardFooter>
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
          <p className="text-sm text-muted-foreground">Online requests aren&apos;t available for this offer.</p>
        )}
      </CardFooter>
    </Card>
  );
}

function OfferDetail({ title, text }: { title: string; text: string }) {
  return (
    <div className="space-y-1">
      <h4 className="text-sm font-medium">{title}</h4>
      <p className="text-sm whitespace-pre-line text-muted-foreground">{text}</p>
    </div>
  );
}
