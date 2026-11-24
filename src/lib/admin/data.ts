import "server-only";

import { requireAdmin } from "./guard";
import type { Currency, PricingUnit, VerificationStatus } from "../types";

// Admin reads use the service-role client (sees unpublished and outdated rows) and always
// go through requireAdmin() first.

export type AdminActivity = {
  id: string;
  name: string;
  slug: string;
  category: string;
  location: string | null;
  image_url: string | null;
  image_credit: string | null;
  description: string | null;
  is_published: boolean;
  offer_count: number;
};

export type AdminProvider = {
  id: string;
  name: string;
  website_url: string | null;
  phone: string | null;
  address: string | null;
  google_maps_url: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  google_retrieved_at: string | null;
  notes: string | null;
  offer_count: number;
};

export type AdminOffer = {
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
  source_url: string;
  source_domain: string;
  booking_url: string | null;
  retrieved_at: string | null;
  verification_status: VerificationStatus;
  notes: string | null;
  activity: { name: string; slug: string; is_published: boolean } | null;
  provider: { name: string } | null;
};

export type Option = { id: string; name: string };
export type ActivityOption = Option & { is_published: boolean };

function fail(what: string, error: { message: string }): never {
  console.error(`admin: failed to load ${what}`, error);
  throw new Error(`Failed to load ${what}`);
}

const num = (value: unknown) => (value === null || value === undefined ? null : Number(value));
const countOf = (rel: unknown) => (Array.isArray(rel) && rel[0] ? Number((rel[0] as { count: number }).count) : 0);

export async function getAdminOverview() {
  const supabase = await requireAdmin();
  const [activities, offers, providers, pending] = await Promise.all([
    supabase.from("activities").select("is_published"),
    supabase.from("price_listings").select("verification_status, price, currency"),
    supabase.from("providers").select("id", { count: "exact", head: true }),
    supabase.from("booking_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  for (const [what, res] of [
    ["activities", activities],
    ["offers", offers],
    ["providers", providers],
    ["booking requests", pending],
  ] as const) {
    if (res.error) fail(what, res.error);
  }

  const offerRows = offers.data ?? [];
  return {
    activities: {
      total: activities.data?.length ?? 0,
      published: (activities.data ?? []).filter((a) => a.is_published).length,
    },
    offers: {
      total: offerRows.length,
      outdated: offerRows.filter((o) => o.verification_status === "outdated").length,
      unpriced: offerRows.filter((o) => o.verification_status !== "outdated" && (o.price === null || o.currency === null))
        .length,
      unverified: offerRows.filter((o) => o.verification_status === "unverified").length,
    },
    providers: providers.count ?? 0,
    pendingRequests: pending.count ?? 0,
  };
}

export async function listAdminActivities(): Promise<AdminActivity[]> {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("activities")
    .select("id, name, slug, category, location, image_url, image_credit, description, is_published, price_listings(count)")
    .order("name");
  if (error) fail("activities", error);
  return data.map(({ price_listings, ...a }) => ({ ...a, offer_count: countOf(price_listings) }));
}

export async function getAdminActivity(id: string): Promise<AdminActivity | null> {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("activities")
    .select("id, name, slug, category, location, image_url, image_credit, description, is_published, price_listings(count)")
    .eq("id", id)
    .maybeSingle();
  if (error) fail("activity", error);
  if (!data) return null;
  const { price_listings, ...a } = data;
  return { ...a, offer_count: countOf(price_listings) };
}

export async function listAdminProviders(): Promise<AdminProvider[]> {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("providers")
    .select(
      "id, name, website_url, phone, address, google_maps_url, google_rating, google_review_count, google_retrieved_at, notes, price_listings(count)",
    )
    .order("name");
  if (error) fail("providers", error);
  return data.map(({ price_listings, ...p }) => ({
    ...p,
    google_rating: num(p.google_rating),
    offer_count: countOf(price_listings),
  }));
}

export async function getAdminProvider(id: string): Promise<AdminProvider | null> {
  const supabase = await requireAdmin();
  const { data, error } = await supabase
    .from("providers")
    .select(
      "id, name, website_url, phone, address, google_maps_url, google_rating, google_review_count, google_retrieved_at, notes, price_listings(count)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) fail("provider", error);
  if (!data) return null;
  const { price_listings, ...p } = data;
  return { ...p, google_rating: num(p.google_rating), offer_count: countOf(price_listings) };
}

const OFFER_COLUMNS = `id, activity_id, provider_id, package_name, price, currency, pricing_unit, duration,
  inclusions, booking_conditions, source_url, source_domain, booking_url, retrieved_at,
  verification_status, notes,
  activity:activities ( name, slug, is_published ),
  provider:providers ( name )`;

function toOffer(row: unknown): AdminOffer {
  const o = row as AdminOffer;
  return { ...o, price: num(o.price) };
}

export async function listAdminOffers(filters: { activityId?: string; status?: string }): Promise<AdminOffer[]> {
  const supabase = await requireAdmin();
  let query = supabase.from("price_listings").select(OFFER_COLUMNS);
  if (filters.activityId) query = query.eq("activity_id", filters.activityId);
  if (filters.status) query = query.eq("verification_status", filters.status);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) fail("offers", error);
  return data
    .map(toOffer)
    .sort(
      (a, b) =>
        (a.activity?.name ?? "").localeCompare(b.activity?.name ?? "") ||
        (a.package_name ?? "").localeCompare(b.package_name ?? ""),
    );
}

export async function getAdminOffer(id: string): Promise<AdminOffer | null> {
  const supabase = await requireAdmin();
  const { data, error } = await supabase.from("price_listings").select(OFFER_COLUMNS).eq("id", id).maybeSingle();
  if (error) fail("offer", error);
  return data ? toOffer(data) : null;
}

export async function getOfferFormOptions(): Promise<{ activities: ActivityOption[]; providers: Option[] }> {
  const supabase = await requireAdmin();
  const [activities, providers] = await Promise.all([
    supabase.from("activities").select("id, name, is_published").order("name"),
    supabase.from("providers").select("id, name").order("name"),
  ]);
  if (activities.error) fail("activities", activities.error);
  if (providers.error) fail("providers", providers.error);
  return { activities: activities.data, providers: providers.data };
}

