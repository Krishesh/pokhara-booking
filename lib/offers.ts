import "server-only";

import { isOfferAvailable, sortOffers } from "@/lib/offer-format";
import type {
  AvailableOffer,
  Currency,
  Offer,
  OfferProvider,
  PricingUnit,
  VerificationStatus,
} from "@/lib/types";
import { createServerSupabaseClient } from "@/utils/supabase/server";

const OFFER_COLUMNS = `
  id,
  activity_id,
  provider_id,
  package_name,
  price,
  currency,
  pricing_unit,
  duration,
  inclusions,
  booking_conditions,
  verification_status,
  retrieved_at,
  source_domain,
  provider:providers (
    id,
    name,
    google_rating,
    google_review_count
  )
`;

interface RawProviderRow {
  id: string;
  name: string;
  google_rating: number | string | null;
  google_review_count: number | string | null;
}

interface RawOfferRow {
  id: string;
  activity_id: string;
  provider_id: string | null;
  package_name: string | null;
  price: number | string | null;
  currency: Currency | null;
  pricing_unit: PricingUnit | null;
  duration: string | null;
  inclusions: string | null;
  booking_conditions: string | null;
  verification_status: VerificationStatus;
  retrieved_at: string | null;
  source_domain: string;
  provider: RawProviderRow | RawProviderRow[] | null;
}

function toNullableNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function normalizeProvider(
  raw: RawProviderRow | RawProviderRow[] | null
): OfferProvider | null {
  const row = Array.isArray(raw) ? raw[0] : raw;
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    google_rating: toNullableNumber(row.google_rating),
    google_review_count: toNullableNumber(row.google_review_count),
  };
}

function normalizeOffer(row: RawOfferRow): Offer {
  return {
    id: row.id,
    activity_id: row.activity_id,
    provider_id: row.provider_id,
    package_name: row.package_name,
    price: toNullableNumber(row.price),
    currency: row.currency,
    pricing_unit: row.pricing_unit,
    duration: row.duration,
    inclusions: row.inclusions,
    booking_conditions: row.booking_conditions,
    verification_status: row.verification_status,
    retrieved_at: row.retrieved_at,
    source_domain: row.source_domain,
    provider: normalizeProvider(row.provider),
  };
}

export async function getAvailableOffersForActivity(
  activityId: string
): Promise<AvailableOffer[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("price_listings")
    .select(OFFER_COLUMNS)
    .eq("activity_id", activityId)
    .neq("verification_status", "outdated")
    .not("price", "is", null)
    .not("currency", "is", null);

  if (error) {
    throw new Error(`Failed to fetch offers: ${error.message}`);
  }

  const normalized = ((data ?? []) as unknown as RawOfferRow[]).map(
    normalizeOffer
  );
  const available = normalized.filter(isOfferAvailable);
  return sortOffers(available);
}
