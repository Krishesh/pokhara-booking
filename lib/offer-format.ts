import type { AvailableOffer, Currency, Offer, PricingUnit } from "./types";

const CURRENCY_ORDER: Record<Currency, number> = {
  NPR: 0,
  USD: 1,
  INR: 2,
  EUR: 3,
};

const PRICING_UNIT_LABELS: Record<PricingUnit, string> = {
  per_person: "per person",
  per_group: "per group",
  per_hour: "per hour",
  per_flight: "per flight",
  other: "",
};

export function isOfferAvailable(offer: Offer): offer is AvailableOffer {
  return (
    offer.verification_status !== "outdated" &&
    offer.price !== null &&
    Number.isFinite(offer.price) &&
    offer.price >= 0 &&
    offer.currency !== null &&
    offer.currency in CURRENCY_ORDER
  );
}

export function formatPricingUnit(unit: PricingUnit | null | undefined): string {
  if (!unit) {
    return "";
  }
  return PRICING_UNIT_LABELS[unit] ?? "";
}

export function formatPrice(
  price: number,
  currency: Currency,
  unit?: PricingUnit | null
): string {
  const isWhole = Number.isInteger(price);
  const formattedNumber = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: isWhole ? 0 : 2,
  }).format(price);

  const unitLabel = formatPricingUnit(unit);
  return unitLabel
    ? `${currency} ${formattedNumber} ${unitLabel}`
    : `${currency} ${formattedNumber}`;
}

export function formatRating(
  rating: number | null | undefined,
  reviewCount: number | null | undefined
): string | null {
  if (rating === null || rating === undefined || !Number.isFinite(rating)) {
    return null;
  }

  const formattedRating = rating.toFixed(1);
  if (
    reviewCount !== null &&
    reviewCount !== undefined &&
    Number.isFinite(reviewCount) &&
    reviewCount > 0
  ) {
    const label = reviewCount === 1 ? "Google review" : "Google reviews";
    return `★ ${formattedRating} · ${reviewCount} ${label}`;
  }

  return `★ ${formattedRating} Google rating`;
}

export function formatRatingLabel(
  rating: number | null | undefined,
  reviewCount: number | null | undefined
): string | null {
  return formatRating(rating, reviewCount)?.replace(/^★\s*/, "") ?? null;
}

export function formatCheckedDate(
  retrievedAt: string | null | undefined
): string | null {
  if (!retrievedAt) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(retrievedAt.trim());
  let date: Date;

  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    date = new Date(Date.UTC(year, month - 1, day));
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      return null;
    }
  } else {
    date = new Date(retrievedAt);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
  }

  const formatted = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);

  return `Price checked ${formatted}`;
}

export function formatCheckedDateShort(
  retrievedAt: string | null | undefined
): string | null {
  return formatCheckedDate(retrievedAt)?.replace("Price checked ", "Checked ") ?? null;
}

export function formatDateLabel(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const date = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  );
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function sortOffers<T extends AvailableOffer>(offers: T[]): T[] {
  return [...offers].sort((a, b) => {
    const currencyDiff =
      CURRENCY_ORDER[a.currency] - CURRENCY_ORDER[b.currency];
    if (currencyDiff !== 0) {
      return currencyDiff;
    }

    const priceDiff = a.price - b.price;
    if (priceDiff !== 0) {
      return priceDiff;
    }

    const nameA = a.package_name ?? "Standard package";
    const nameB = b.package_name ?? "Standard package";
    return nameA.localeCompare(nameB);
  });
}
