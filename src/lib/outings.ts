// Pure logic for group outings (task 06). No I/O; unit-tested.

import { isValidEmail, MAX_PARTICIPANTS, normalizePhone, type ContactType } from "./booking";

export const OUTING_STATUSES = ["draft", "published", "cancelled"] as const;
export type OutingStatus = (typeof OUTING_STATUSES)[number];

/** Columns visitors may see (organizer_contact is staff-only). */
export type PublicOuting = {
  id: string;
  slug: string;
  title: string;
  destination: string;
  organizer_name: string;
  description: string | null;
  outing_date: string | null; // YYYY-MM-DD, null = to be confirmed
  meeting_details: string | null;
  cost_info: string | null;
  image_url: string | null;
  image_credit: string | null;
  status: OutingStatus;
};

export type OutingState = "open" | "cancelled" | "past" | "draft";

/** Whether visitors can register interest. `today` is YYYY-MM-DD in Pokhara time. */
export function outingState(outing: { status: OutingStatus; outing_date: string | null }, today: string): OutingState {
  if (outing.status === "draft") return "draft";
  if (outing.status === "cancelled") return "cancelled";
  if (outing.outing_date !== null && outing.outing_date < today) return "past";
  return "open";
}

/** Shown in the public list: published or cancelled, and not yet past. */
export function isListed(outing: { status: OutingStatus; outing_date: string | null }, today: string): boolean {
  const state = outingState(outing, today);
  return state === "open" || (state === "cancelled" && (outing.outing_date === null || outing.outing_date >= today));
}

/** Dated outings soonest first, then "to be confirmed" ones by title. */
export function sortOutings<T extends { outing_date: string | null; title: string }>(outings: readonly T[]): T[] {
  return [...outings].sort((a, b) => {
    if (a.outing_date && b.outing_date) return a.outing_date.localeCompare(b.outing_date) || a.title.localeCompare(b.title);
    if (a.outing_date) return -1;
    if (b.outing_date) return 1;
    return a.title.localeCompare(b.title);
  });
}

const outingDateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "Sat, 13 Dec 2026", or "Date to be confirmed". */
export function formatOutingDate(date: string | null): string {
  if (!date) return "Date to be confirmed";
  const d = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? "Date to be confirmed" : outingDateFormatter.format(d);
}

/** Parts for a calendar-style date block: { day: "13", month: "Dec", weekday: "Sat", year: "2026" }, or null. */
export function outingDateParts(date: string | null): { day: string; month: string; weekday: string; year: string } | null {
  if (!date) return null;
  const d = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-GB", { ...options, timeZone: "UTC" }).format(d);
  return {
    day: part({ day: "numeric" }),
    month: part({ month: "short" }),
    weekday: part({ weekday: "short" }),
    year: part({ year: "numeric" }),
  };
}

/**
 * Groups already-sorted outings by calendar month for the public list:
 * [{ key: "2026-12", label: "December 2026", outings }], with undated outings last
 * under "Date to be confirmed". Keeps the input order inside each group.
 */
export function groupOutingsByMonth<T extends { outing_date: string | null }>(
  outings: readonly T[],
): { key: string; label: string; outings: T[] }[] {
  const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  const groups = new Map<string, { key: string; label: string; outings: T[] }>();
  const undated: T[] = [];
  for (const o of outings) {
    const d = o.outing_date ? new Date(`${o.outing_date}T00:00:00Z`) : null;
    if (!d || Number.isNaN(d.getTime())) {
      undated.push(o);
      continue;
    }
    const key = o.outing_date!.slice(0, 7);
    if (!groups.has(key)) groups.set(key, { key, label: monthLabel.format(d), outings: [] });
    groups.get(key)!.outings.push(o);
  }
  const result = [...groups.values()];
  if (undated.length > 0) result.push({ key: "tbc", label: "Date to be confirmed", outings: undated });
  return result;
}

export type InterestField = "customerName" | "contactType" | "contactValue" | "participantCount";
export type ValidInterest = {
  outingId: string;
  customerName: string;
  contactType: ContactType;
  contactValue: string;
  participantCount: number;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateInterestForm(input: {
  outingId: string;
  customerName: string;
  contactType: string;
  contactValue: string;
  participantCount: string;
}):
  | { ok: true; data: ValidInterest }
  | { ok: false; fieldErrors: Partial<Record<InterestField, string>>; formError?: string } {
  if (!UUID_RE.test(input.outingId)) {
    return { ok: false, fieldErrors: {}, formError: "Something went wrong with this outing. Please reload the page." };
  }
  const errors: Partial<Record<InterestField, string>> = {};

  const customerName = input.customerName.trim().replace(/\s+/g, " ");
  if (customerName.length < 2) errors.customerName = "Enter your name.";
  else if (customerName.length > 100) errors.customerName = "Name must be 100 characters or fewer.";

  let contactType: ContactType | null = null;
  let contactValue = input.contactValue.trim();
  if (input.contactType === "phone" || input.contactType === "email") contactType = input.contactType;
  else errors.contactType = "Choose phone or email.";
  if (contactType === "phone") {
    const phone = normalizePhone(contactValue);
    if (!phone) errors.contactValue = "Enter a phone number with 7–15 digits, e.g. +977 9800000000.";
    else contactValue = phone;
  } else if (contactType === "email") {
    if (!isValidEmail(contactValue)) errors.contactValue = "Enter a valid email address.";
    else contactValue = contactValue.toLowerCase();
  }

  const countText = input.participantCount.trim() || "1";
  const participantCount = Number(countText);
  if (!/^\d+$/.test(countText) || participantCount < 1 || participantCount > MAX_PARTICIPANTS) {
    errors.participantCount = `Enter a number from 1 to ${MAX_PARTICIPANTS}.`;
  }

  if (Object.keys(errors).length > 0 || !contactType) return { ok: false, fieldErrors: errors };
  return { ok: true, data: { outingId: input.outingId, customerName, contactType, contactValue, participantCount } };
}
