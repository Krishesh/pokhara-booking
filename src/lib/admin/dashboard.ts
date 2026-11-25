// Pure helpers for the admin overview (task: dashboard). No I/O; unit-tested.

import { OVERDUE_HOURS } from "./requests";

export type OfferFlag = "no_price" | "outdated" | "unverified";

export const FLAG_LABELS: Record<OfferFlag, string> = {
  no_price: "No price",
  outdated: "Outdated",
  unverified: "Unverified",
};

/** Why an offer needs a look, most serious first, or null if it is fine. */
export function offerFlag(offer: {
  price: number | null;
  currency: string | null;
  verification_status: string;
}): OfferFlag | null {
  if (offer.verification_status === "outdated") return "outdated";
  if (offer.price === null || offer.currency === null) return "no_price";
  if (offer.verification_status === "unverified") return "unverified";
  return null;
}

const FLAG_ORDER: OfferFlag[] = ["no_price", "outdated", "unverified"];

/** Offers that need attention, most serious first, then oldest check first (never checked = oldest). */
export function flaggedOffers<
  T extends { price: number | null; currency: string | null; verification_status: string; retrieved_at: string | null },
>(offers: readonly T[]): (T & { flag: OfferFlag })[] {
  return offers
    .map((o) => ({ ...o, flag: offerFlag(o) }))
    .filter((o): o is T & { flag: OfferFlag } => o.flag !== null)
    .sort(
      (a, b) =>
        FLAG_ORDER.indexOf(a.flag) - FLAG_ORDER.indexOf(b.flag) ||
        (a.retrieved_at ?? "").localeCompare(b.retrieved_at ?? ""),
    );
}

/**
 * Requests received per day for the last `days` days, ending `today` (YYYY-MM-DD, Pokhara time).
 * `dayOf` turns a created_at timestamp into its YYYY-MM-DD day in the same time zone.
 */
export function requestsPerDay(
  createdAt: readonly string[],
  today: string,
  dayOf: (timestamp: string) => string,
  days = 7,
): { date: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const ts of createdAt) counts.set(dayOf(ts), (counts.get(dayOf(ts)) ?? 0) + 1);
  const end = new Date(`${today}T00:00:00Z`);
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(end);
    d.setUTCDate(end.getUTCDate() - (days - 1 - i));
    const date = d.toISOString().slice(0, 10);
    return { date, count: counts.get(date) ?? 0 };
  });
}

/** Pending count, how many are overdue, and how long the oldest one has waited (in whole days). */
export function pendingSummary(
  pending: readonly { created_at: string }[],
  now: Date,
): { count: number; overdue: number; oldestDays: number | null } {
  if (pending.length === 0) return { count: 0, overdue: 0, oldestDays: null };
  const ages = pending.map((r) => Math.max(0, (now.getTime() - new Date(r.created_at).getTime()) / 3_600_000));
  return {
    count: pending.length,
    overdue: ages.filter((h) => h >= OVERDUE_HOURS).length,
    oldestDays: Math.floor(Math.max(...ages) / 24),
  };
}
