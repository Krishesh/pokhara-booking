import "server-only";

import { requireAdmin } from "./guard";
import { normalizeRequestSearch, REQUEST_STATUSES, type RequestStatus } from "./requests";
import type { OfferSnapshot } from "../booking";
import type { Currency, PricingUnit } from "../types";

export type AdminRequest = {
  id: string;
  reference: string;
  price_listing_id: string | null;
  customer_name: string;
  contact_type: "phone" | "email";
  contact_value: string;
  requested_date: string;
  participant_count: number;
  offer_snapshot: OfferSnapshot;
  total_price: number;
  currency: Currency;
  status: RequestStatus;
  staff_note: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CurrentOffer = {
  price: number | null;
  currency: Currency | null;
  pricing_unit: PricingUnit | null;
  verification_status: string;
  activityPublished: boolean;
};

const COLUMNS = `id, reference, price_listing_id, customer_name, contact_type, contact_value, requested_date,
  participant_count, offer_snapshot, total_price, currency, status, staff_note, updated_by, created_at, updated_at`;

function fail(what: string, error: { message: string }): never {
  console.error(`admin: failed to load ${what}`, error);
  throw new Error(`Failed to load ${what}`);
}

const toRequest = (row: unknown): AdminRequest => {
  const r = row as AdminRequest;
  return { ...r, total_price: Number(r.total_price), offer_snapshot: { ...r.offer_snapshot, price: Number(r.offer_snapshot.price) } };
};

/** Requests filtered by status (or all) and an optional search; pending oldest first, others newest first. */
export async function listAdminRequests(filters: { status: RequestStatus | "all"; q?: string }): Promise<AdminRequest[]> {
  const supabase = await requireAdmin();
  let query = supabase.from("booking_requests").select(COLUMNS);
  if (filters.status !== "all") query = query.eq("status", filters.status);

  const search = filters.q ? normalizeRequestSearch(filters.q) : null;
  if (search) {
    const pattern = `%${search}%`;
    query = query.or(`reference.ilike.${pattern},customer_name.ilike.${pattern},contact_value.ilike.${pattern}`);
  }

  const { data, error } = await query
    .order("created_at", { ascending: filters.status === "pending" })
    .limit(200);
  if (error) fail("booking requests", error);
  return data.map(toRequest);
}

export async function countRequestsByStatus(): Promise<Record<RequestStatus | "all", number>> {
  const supabase = await requireAdmin();
  const { data, error } = await supabase.from("booking_requests").select("status");
  if (error) fail("booking request counts", error);
  const counts = Object.fromEntries([...REQUEST_STATUSES, "all"].map((s) => [s, 0])) as Record<RequestStatus | "all", number>;
  for (const row of data) {
    counts[row.status as RequestStatus] += 1;
    counts.all += 1;
  }
  return counts;
}

export async function countPendingRequests(): Promise<number> {
  const supabase = await requireAdmin();
  const { count, error } = await supabase
    .from("booking_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  if (error) fail("pending requests", error);
  return count ?? 0;
}

/** One request plus the live state of its offer (null if the offer was deleted). */
export async function getAdminRequest(id: string): Promise<{ request: AdminRequest; current: CurrentOffer | null } | null> {
  const supabase = await requireAdmin();
  const { data, error } = await supabase.from("booking_requests").select(COLUMNS).eq("id", id).maybeSingle();
  if (error) fail("booking request", error);
  if (!data) return null;
  const request = toRequest(data);

  let current: CurrentOffer | null = null;
  if (request.price_listing_id) {
    const { data: offer, error: offerError } = await supabase
      .from("price_listings")
      .select("price, currency, pricing_unit, verification_status, activity:activities ( is_published )")
      .eq("id", request.price_listing_id)
      .maybeSingle();
    if (offerError) fail("offer", offerError);
    if (offer) {
      const activity = offer.activity as unknown as { is_published: boolean } | null;
      current = {
        price: offer.price === null ? null : Number(offer.price),
        currency: offer.currency as Currency | null,
        pricing_unit: offer.pricing_unit as PricingUnit | null,
        verification_status: offer.verification_status,
        activityPublished: Boolean(activity?.is_published),
      };
    }
  }
  return { request, current };
}
