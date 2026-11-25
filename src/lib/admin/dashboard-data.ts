import "server-only";

import { todayInTimeZone } from "../booking";
import type { OfferSnapshot } from "../booking";
import type { Currency } from "../types";
import { flaggedOffers, pendingSummary, requestsPerDay, type OfferFlag } from "./dashboard";
import { requireAdmin } from "./guard";

// One read for the admin overview. Uses the service-role client via requireAdmin().

export type DashboardPendingRequest = {
  id: string;
  reference: string;
  customer_name: string;
  requested_date: string;
  participant_count: number;
  total_price: number;
  currency: Currency;
  created_at: string;
  offer_snapshot: Pick<OfferSnapshot, "activity" | "vendor" | "package_name">;
};

export type DashboardFlaggedOffer = {
  id: string;
  package_name: string | null;
  retrieved_at: string | null;
  flag: OfferFlag;
  activityName: string;
  providerName: string | null;
};

export type Dashboard = {
  activities: { total: number; published: number };
  offers: { total: number; flagged: DashboardFlaggedOffer[]; counts: Record<OfferFlag, number> };
  providers: { total: number; withOffers: number };
  requests: {
    pending: ReturnType<typeof pendingSummary>;
    latestPending: DashboardPendingRequest[];
    perDay: { date: string; count: number }[];
    lastSevenDays: { received: number; confirmed: number; rejected: number };
  };
  outings: {
    upcoming: number;
    drafts: number;
    interestsLastSevenDays: number;
    next: { id: string; title: string; outing_date: string | null } | null;
  };
};

function fail(what: string, error: { message: string }): never {
  console.error(`admin: failed to load ${what}`, error);
  throw new Error(`Failed to load ${what}`);
}

export async function getDashboard(now: Date = new Date()): Promise<Dashboard> {
  const supabase = await requireAdmin();
  const today = todayInTimeZone(now);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 3_600_000).toISOString();

  const [activities, offers, providers, pending, recent, outings, interests] = await Promise.all([
    supabase.from("activities").select("is_published"),
    supabase
      .from("price_listings")
      .select("id, provider_id, package_name, price, currency, verification_status, retrieved_at, activity:activities(name), provider:providers(name)"),
    supabase.from("providers").select("id", { count: "exact", head: true }),
    supabase
      .from("booking_requests")
      .select("id, reference, customer_name, requested_date, participant_count, total_price, currency, created_at, offer_snapshot")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    supabase.from("booking_requests").select("status, created_at").gte("created_at", weekAgo),
    supabase.from("group_outings").select("id, title, outing_date, status"),
    supabase.from("group_interests").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
  ]);
  for (const [what, res] of [
    ["activities", activities],
    ["offers", offers],
    ["providers", providers],
    ["pending requests", pending],
    ["recent requests", recent],
    ["outings", outings],
    ["interests", interests],
  ] as const) {
    if (res.error) fail(what, res.error);
  }

  type OfferRow = {
    id: string;
    provider_id: string | null;
    package_name: string | null;
    price: number | string | null;
    currency: string | null;
    verification_status: string;
    retrieved_at: string | null;
    activity: { name: string } | null;
    provider: { name: string } | null;
  };
  const offerRows = ((offers.data ?? []) as unknown as OfferRow[]).map((o) => ({
    ...o,
    price: o.price === null ? null : Number(o.price),
  }));
  const flagged = flaggedOffers(offerRows);
  const counts: Record<OfferFlag, number> = { no_price: 0, outdated: 0, unverified: 0 };
  for (const o of flagged) counts[o.flag] += 1;

  const pendingRows = (pending.data ?? []) as unknown as (DashboardPendingRequest & { total_price: number | string })[];
  const recentRows = (recent.data ?? []) as { status: string; created_at: string }[];
  const outingRows = (outings.data ?? []) as { id: string; title: string; outing_date: string | null; status: string }[];
  const upcoming = outingRows
    .filter((o) => o.status === "published" && (o.outing_date === null || o.outing_date >= today))
    .sort((a, b) => (a.outing_date ?? "9999").localeCompare(b.outing_date ?? "9999"));

  return {
    activities: {
      total: activities.data?.length ?? 0,
      published: (activities.data ?? []).filter((a) => a.is_published).length,
    },
    offers: {
      total: offerRows.length,
      counts,
      flagged: flagged.slice(0, 5).map((o) => ({
        id: o.id,
        package_name: o.package_name,
        retrieved_at: o.retrieved_at,
        flag: o.flag,
        activityName: o.activity?.name ?? "Unknown activity",
        providerName: o.provider?.name ?? null,
      })),
    },
    providers: {
      total: providers.count ?? 0,
      withOffers: new Set(offerRows.map((o) => o.provider_id).filter(Boolean)).size,
    },
    requests: {
      pending: pendingSummary(pendingRows, now),
      latestPending: pendingRows.slice(0, 5).map((r) => ({ ...r, total_price: Number(r.total_price) })),
      perDay: requestsPerDay(
        recentRows.map((r) => r.created_at),
        today,
        (ts) => todayInTimeZone(new Date(ts)),
      ),
      lastSevenDays: {
        received: recentRows.length,
        confirmed: recentRows.filter((r) => r.status === "confirmed").length,
        rejected: recentRows.filter((r) => r.status === "rejected").length,
      },
    },
    outings: {
      upcoming: upcoming.length,
      drafts: outingRows.filter((o) => o.status === "draft").length,
      interestsLastSevenDays: interests.count ?? 0,
      next: upcoming[0] ? { id: upcoming[0].id, title: upcoming[0].title, outing_date: upcoming[0].outing_date } : null,
    },
  };
}
