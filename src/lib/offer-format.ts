import { CURRENCIES, type AvailableOffer, type Offer, type PricingUnit } from "./types";

/** An offer can be shown (and later requested) only if it isn't outdated and has a price and currency. */
export function isOfferAvailable(offer: Offer): offer is AvailableOffer {
  return (
    offer.verification_status !== "outdated" &&
    offer.price !== null &&
    Number.isFinite(offer.price) &&
    offer.price >= 0 &&
    offer.currency !== null
  );
}

const amountFormatter = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** "NPR 8,500", "NPR 12,48,500", "USD 95.50" (Nepali/Indian digit grouping, no decimals for whole amounts). */
export function formatPrice(price: number, currency: string): string {
  return `${currency} ${amountFormatter.format(price)}`;
}

const UNIT_LABELS: Record<PricingUnit, string | null> = {
  per_person: "per person",
  per_group: "per group",
  per_hour: "per hour",
  per_flight: "per flight",
  other: null,
};

/** "per person", or null when the unit is "other" or missing. */
export function formatPricingUnit(unit: PricingUnit | null): string | null {
  return unit ? UNIT_LABELS[unit] : null;
}

/** "4.7 · 312 Google reviews", "4.2 Google rating", or null without a rating. */
export function formatRating(rating: number | null, reviewCount: number | null): string | null {
  if (rating === null) return null;
  const score = rating.toFixed(1);
  if (reviewCount === null) return `${score} Google rating`;
  const reviews = `${amountFormatter.format(reviewCount)} Google ${reviewCount === 1 ? "review" : "reviews"}`;
  return `${score} · ${reviews}`;
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "2026-11-10" -> "10 Nov 2026". Returns null for missing or invalid dates. */
export function formatCheckedDate(isoDate: string | null): string | null {
  if (!isoDate) return null;
  const date = new Date(`${isoDate}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : dateFormatter.format(date);
}

/** Sort by currency (NPR, USD, INR, EUR), then price low to high, then package name. Returns a new array. */
export function sortOffers<T extends AvailableOffer>(offers: readonly T[]): T[] {
  return [...offers].sort(
    (a, b) =>
      CURRENCIES.indexOf(a.currency) - CURRENCIES.indexOf(b.currency) ||
      a.price - b.price ||
      (a.package_name ?? "").localeCompare(b.package_name ?? ""),
  );
}
