export interface Activity {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  location: string | null;
  image_url: string | null;
  is_published: boolean;
}

export type Currency = "NPR" | "USD" | "INR" | "EUR";

export type PricingUnit =
  | "per_person"
  | "per_group"
  | "per_hour"
  | "per_flight"
  | "other";

export type VerificationStatus = "verified" | "unverified" | "outdated";

export interface OfferProvider {
  id: string;
  name: string;
  google_rating: number | null;
  google_review_count: number | null;
}

export interface Offer {
  id: string;
  activity_id: string;
  provider_id: string | null;
  package_name: string | null;
  price: number | null;
  currency: Currency | null;
  pricing_unit: PricingUnit | null;
  duration: string | null;
  inclusions: string | null;
  booking_conditions: string | null;
  verification_status: VerificationStatus;
  retrieved_at: string | null;
  source_domain: string;
  provider: OfferProvider | null;
}

export interface AvailableOffer extends Offer {
  price: number;
  currency: Currency;
  verification_status: Exclude<VerificationStatus, "outdated">;
}
