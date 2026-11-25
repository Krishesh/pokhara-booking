import { cookies } from "next/headers";

import { createClient } from "@/utils/supabase/server";
import { isOfferAvailable, sortOffers, summarizeOffers, type OfferSummary } from "@/lib/offer-format";
import type { AvailableOffer, Offer } from "@/lib/types";

// Public columns only. notes, source_url and booking_url are never selected.
const OFFER_COLUMNS = `
  id, package_name, price, currency, pricing_unit, duration, inclusions,
  booking_conditions, verification_status, retrieved_at, source_domain,
  provider:providers ( id, name, google_rating, google_review_count )
`;

/**
 * Offers that can be shown for an activity, sorted for comparison.
 * The database (RLS) already hides outdated offers; the query and isOfferAvailable filter again
 * so the rule holds even if policies change.
 */
export async function getAvailableOffersForActivity(activityId: string): Promise<AvailableOffer[]> {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from("price_listings")
    .select(OFFER_COLUMNS)
    .eq("activity_id", activityId)
    .neq("verification_status", "outdated")
    .not("price", "is", null)
    .not("currency", "is", null);

  if (error) throw new Error(`Failed to load offers: ${error.message}`);

  const offers = (data as unknown as Offer[]).map(normalizeNumbers);
  return sortOffers(offers.filter(isOfferAvailable));
}

/** Postgres numeric can arrive as a string; make sure prices and ratings are numbers. */
function normalizeNumbers(offer: Offer): Offer {
  return {
    ...offer,
    price: offer.price === null ? null : Number(offer.price),
    provider: offer.provider && {
      ...offer.provider,
      google_rating:
        offer.provider.google_rating === null ? null : Number(offer.provider.google_rating),
    },
  };
}

/** Offer count and lowest "from" price for every published activity, keyed by activity id. */
export async function getOfferSummaries(): Promise<Map<string, OfferSummary>> {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from("price_listings")
    .select("activity_id, price, currency")
    .neq("verification_status", "outdated")
    .not("price", "is", null)
    .not("currency", "is", null);

  if (error) throw new Error(`Failed to load offer prices: ${error.message}`);
  const rows = (data as { activity_id: string; price: number | string; currency: string }[])
    .map((r) => ({ ...r, price: Number(r.price) }))
    .filter((r) => Number.isFinite(r.price) && r.price >= 0);
  return summarizeOffers(rows);
}
