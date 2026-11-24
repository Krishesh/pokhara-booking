// Pure logic for reviewing booking requests (task 05). No I/O; unit-tested.

import { formatCheckedDate, formatPrice, formatPricingUnit } from "../offer-format";
import type { OfferSnapshot } from "../booking";
import type { Currency, PricingUnit } from "../types";

export const REQUEST_STATUSES = ["pending", "confirmed", "rejected", "cancelled"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export const NOTE_MAX = 1000;
export const STAFF_NAME_MAX = 80;
export const OVERDUE_HOURS = 48;

const TRANSITIONS: Record<RequestStatus, readonly RequestStatus[]> = {
  pending: ["confirmed", "rejected", "cancelled"],
  confirmed: ["cancelled"],
  rejected: [],
  cancelled: [],
};

export function isRequestStatus(value: string): value is RequestStatus {
  return (REQUEST_STATUSES as readonly string[]).includes(value);
}

/** Statuses a request can move to from `from`. Rejected and cancelled are final. */
export function allowedNextStatuses(from: RequestStatus): readonly RequestStatus[] {
  return TRANSITIONS[from];
}

export function canTransition(from: RequestStatus, to: RequestStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

/** Rejecting or cancelling needs a reason (PRD); confirming doesn't. */
export function noteRequired(to: RequestStatus): boolean {
  return to === "rejected" || to === "cancelled";
}

export type StatusChangeField = "status" | "staff_note" | "staff_name";
export type StatusChange = { from: RequestStatus; to: RequestStatus; note: string | null; staffName: string };

export function validateStatusChange(values: {
  from: string;
  to: string;
  note: string;
  staffName: string;
}): { ok: true; data: StatusChange } | { ok: false; fieldErrors: Partial<Record<StatusChangeField, string>>; formError?: string } {
  if (!isRequestStatus(values.from)) {
    return { ok: false, fieldErrors: {}, formError: "Something went wrong. Please reload the page." };
  }
  const errors: Partial<Record<StatusChangeField, string>> = {};
  const from = values.from;

  let to: RequestStatus | null = null;
  if (!isRequestStatus(values.to)) errors.status = "Choose a new status.";
  else if (!canTransition(from, values.to)) {
    errors.status =
      allowedNextStatuses(from).length === 0
        ? `A ${STATUS_LABELS[from].toLowerCase()} request can't be changed.`
        : `A ${STATUS_LABELS[from].toLowerCase()} request can't become ${STATUS_LABELS[values.to].toLowerCase()}.`;
  } else to = values.to;

  const note = values.note.trim();
  if (note.length > NOTE_MAX) errors.staff_note = `Keep the note under ${NOTE_MAX} characters.`;
  else if (to && noteRequired(to) && note.length < 3) errors.staff_note = "Add a short reason for the customer and the team.";

  const staffName = values.staffName.trim().replace(/\s+/g, " ");
  if (staffName.length < 2) errors.staff_name = "Enter your name so the team knows who made this change.";
  else if (staffName.length > STAFF_NAME_MAX) errors.staff_name = `Name must be ${STAFF_NAME_MAX} characters or fewer.`;

  if (Object.keys(errors).length > 0 || !to) return { ok: false, fieldErrors: errors };
  return { ok: true, data: { from, to, note: note || null, staffName } };
}

/** "Today", "1 day", "5 days"; overdue when still pending after OVERDUE_HOURS. */
export function requestAge(createdAt: string, status: RequestStatus, now: Date): { label: string; overdue: boolean } {
  const hours = Math.max(0, (now.getTime() - new Date(createdAt).getTime()) / 3_600_000);
  const days = Math.floor(hours / 24);
  const label = days === 0 ? "Today" : days === 1 ? "1 day" : `${days} days`;
  return { label, overdue: status === "pending" && hours >= OVERDUE_HOURS };
}

/** Links for contacting the customer. WhatsApp only for phone numbers with a country code or Nepali mobiles. */
export function contactLinks(type: string, value: string): { label: string; href: string }[] {
  if (type === "email") return [{ label: "Email", href: `mailto:${encodeURIComponent(value)}` }];
  if (type !== "phone") return [];
  const digits = value.replace(/[^\d+]/g, "");
  const links = [{ label: "Call", href: `tel:${digits}` }];
  let international: string | null = null;
  if (digits.startsWith("+")) international = digits.slice(1);
  else if (/^9[78]\d{8}$/.test(digits)) international = `977${digits}`; // Nepali mobile without country code
  if (international) links.push({ label: "WhatsApp", href: `https://wa.me/${international}` });
  return links;
}

/**
 * Turns a search box value into a safe PostgREST ilike pattern, or null if empty.
 * Phone-like input ("980 111 2222") is compacted to digits so it matches stored numbers.
 */
export function normalizeRequestSearch(query: string): string | null {
  const trimmed = query.trim();
  if (!trimmed) return null;
  const phoneLike = /^[+\d\s\-().]+$/.test(trimmed) && /\d{3,}/.test(trimmed.replace(/\D/g, ""));
  const cleaned = phoneLike ? trimmed.replace(/[^\d+]/g, "") : trimmed.replace(/[^\p{L}\p{N}@.\-_ ]/gu, "");
  const collapsed = cleaned.replace(/\s+/g, " ").trim().slice(0, 60);
  return collapsed.length >= 2 ? collapsed : null;
}

export type SnapshotLike = Pick<OfferSnapshot, "price" | "currency" | "pricing_unit"> & Partial<OfferSnapshot>;

/** Differences between what the customer saw and the offer now, for staff calling the vendor. */
export function offerChanges(
  snapshot: SnapshotLike,
  current: {
    price: number | null;
    currency: Currency | null;
    pricing_unit: PricingUnit | null;
    verification_status: string;
    activityPublished: boolean;
  } | null,
): string[] {
  if (!current) return ["The offer no longer exists."];
  const changes: string[] = [];
  if (current.verification_status === "outdated") changes.push("The offer is now marked outdated.");
  if (!current.activityPublished) changes.push("The activity is now hidden from the website.");
  if (current.price === null || current.currency === null) changes.push("The offer no longer has a price.");
  else if (
    Math.round(current.price * 100) !== Math.round(snapshot.price * 100) ||
    current.currency !== snapshot.currency ||
    current.pricing_unit !== snapshot.pricing_unit
  ) {
    const unit = (u: PricingUnit | null) => (formatPricingUnit(u) ? ` ${formatPricingUnit(u)}` : "");
    changes.push(
      `The price is now ${formatPrice(current.price, current.currency)}${unit(current.pricing_unit)} ` +
        `(the customer saw ${formatPrice(snapshot.price, snapshot.currency)}${unit(snapshot.pricing_unit)}).`,
    );
  }
  return changes;
}

export type TemplateRequest = {
  reference: string;
  customer_name: string;
  requested_date: string;
  participant_count: number;
  total_price: number;
  currency: Currency;
  staff_note: string | null;
  offer_snapshot: Pick<OfferSnapshot, "activity" | "package_name" | "vendor">;
};

/** Ready-to-send customer messages. Staff copy and send them over WhatsApp, SMS or email. */
export function messageTemplates(r: TemplateRequest): { key: string; title: string; text: string }[] {
  const firstName = r.customer_name.split(" ")[0] || r.customer_name;
  const date = formatCheckedDate(r.requested_date) ?? r.requested_date;
  const people = `${r.participant_count} ${r.participant_count === 1 ? "person" : "people"}`;
  const what = `${r.offer_snapshot.activity.name}${r.offer_snapshot.package_name ? ` (${r.offer_snapshot.package_name})` : ""}`;
  const total = formatPrice(r.total_price, r.currency);
  const reason = r.staff_note ? `\nReason: ${r.staff_note}` : "";
  const sign = "\n\n– Pokhara Booking";

  return [
    {
      key: "received",
      title: "We're checking",
      text: `Namaste ${firstName}, thank you for your booking request ${r.reference} for ${what} on ${date} for ${people}. We're checking availability with ${r.offer_snapshot.vendor} and will get back to you soon. Your place is not reserved yet.${sign}`,
    },
    {
      key: "confirmed",
      title: "Confirmed",
      text: `Namaste ${firstName}, good news: your booking ${r.reference} is confirmed.\n${what} with ${r.offer_snapshot.vendor}\nDate: ${date}\nPeople: ${r.participant_count}\nTotal: ${total}\nWe'll send meeting time and place details shortly.${sign}`,
    },
    {
      key: "rejected",
      title: "Can't confirm",
      text: `Namaste ${firstName}, sorry, we couldn't confirm your request ${r.reference} for ${what} on ${date}.${reason}\nYou're welcome to choose another date or offer on our website.${sign}`,
    },
    {
      key: "cancelled",
      title: "Cancelled",
      text: `Namaste ${firstName}, your booking ${r.reference} for ${what} on ${date} has been cancelled.${reason}\nPlease reply to this message if you have any questions.${sign}`,
    },
  ];
}
