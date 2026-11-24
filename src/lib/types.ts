// Hand-written types matching supabase/schema.sql. Keep in sync when the schema changes.

export type Activity = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  location: string | null;
  image_url: string | null;
  is_published: boolean;
};

export const CURRENCIES = ["NPR", "USD", "INR", "EUR"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const PRICING_UNITS = ["per_person", "per_group", "per_hour", "per_flight", "other"] as const;
export type PricingUnit = (typeof PRICING_UNITS)[number];

export type VerificationStatus = "verified" | "unverified" | "outdated";

/** Public fields of a provider, as shown on an offer card. */
export type OfferProvider = {
  id: string;
  name: string;
  google_rating: number | null;
  google_review_count: number | null;
};

/** Public fields of a price_listings row plus its provider. Private columns (notes, source_url, booking_url) are never selected. */
export type Offer = {
  id: string;
  package_name: string | null;
  price: number | null;
  currency: Currency | null;
  pricing_unit: PricingUnit | null;
  duration: string | null;
  inclusions: string | null;
  booking_conditions: string | null;
  verification_status: VerificationStatus;
  retrieved_at: string | null; // YYYY-MM-DD
  source_domain: string;
  provider: OfferProvider | null;
};

/** An offer that passed isOfferAvailable: price and currency are guaranteed. */
export type AvailableOffer = Offer & { price: number; currency: Currency };
