// Pure booking-request logic (task 03): validation, totals, references and offer snapshots.
// No I/O here so everything is unit-tested; the Server Action wires it to Supabase.

import { CURRENCIES, PRICING_UNITS, type Currency, type PricingUnit } from "./types";

export const MAX_PARTICIPANTS = 20;
export const MAX_MONTHS_AHEAD = 12;
export const BOOKING_TIME_ZONE = "Asia/Kathmandu";

export const CONTACT_TYPES = ["phone", "email"] as const;
export type ContactType = (typeof CONTACT_TYPES)[number];

/** Units we can total online. per_hour and "other" need a quote from staff. */
const REQUESTABLE_UNITS: readonly PricingUnit[] = ["per_person", "per_group", "per_flight"];

export function isRequestableUnit(unit: PricingUnit | null): unit is PricingUnit {
  return unit !== null && REQUESTABLE_UNITS.includes(unit);
}

/** Total for a request, rounded to 2 decimals. per_person multiplies; per_group and per_flight are flat. */
export function calculateTotal(price: number, unit: PricingUnit, participants: number): number | null {
  if (!isRequestableUnit(unit)) return null;
  const total = unit === "per_person" ? price * participants : price;
  return Math.round(total * 100) / 100;
}

/** Today's date (YYYY-MM-DD) in Pokhara, regardless of the server's or visitor's timezone. */
export function todayInTimeZone(now: Date, timeZone: string = BOOKING_TIME_ZONE): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Latest allowed date: same day, MAX_MONTHS_AHEAD months later (clamped to month end). */
export function maxRequestDate(today: string): string {
  const [y, m, d] = today.split("-").map(Number);
  const targetMonthIndex = m - 1 + MAX_MONTHS_AHEAD;
  const year = y + Math.floor(targetMonthIndex / 12);
  const month = targetMonthIndex % 12; // 0-based
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const day = Math.min(d, lastDay);
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** Strips spaces, dashes, dots and brackets; returns null unless 7–15 digits with an optional leading +. */
export function normalizePhone(value: string): string | null {
  const compact = value.trim().replace(/[\s\-().]/g, "");
  return /^\+?\d{7,15}$/.test(compact) ? compact : null;
}

export function isValidEmail(value: string): boolean {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export type BookingFormInput = {
  offerId: string;
  shownPrice: string;
  shownCurrency: string;
  shownUnit: string;
  customerName: string;
  contactType: string;
  contactValue: string;
  requestedDate: string;
  participantCount: string;
};

export type BookingField = "customerName" | "contactType" | "contactValue" | "requestedDate" | "participantCount";
export type FieldErrors = Partial<Record<BookingField, string>>;

export type ValidBooking = {
  offerId: string;
  shown: { price: number; currency: Currency; pricing_unit: PricingUnit };
  customerName: string;
  contactType: ContactType;
  contactValue: string;
  requestedDate: string;
  participantCount: number;
};

export type ValidationResult =
  | { ok: true; data: ValidBooking }
  | { ok: false; fieldErrors: FieldErrors; formError?: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Validates raw form values. `today` is YYYY-MM-DD in Pokhara time. */
export function validateBookingForm(input: BookingFormInput, today: string): ValidationResult {
  const fieldErrors: FieldErrors = {};

  // Hidden offer fields: tampering or a broken page, not something the visitor can fix field by field.
  const shownPrice = Number(input.shownPrice);
  const offerOk =
    UUID_RE.test(input.offerId) &&
    input.shownPrice.trim() !== "" &&
    Number.isFinite(shownPrice) &&
    shownPrice >= 0 &&
    (CURRENCIES as readonly string[]).includes(input.shownCurrency) &&
    (PRICING_UNITS as readonly string[]).includes(input.shownUnit);
  if (!offerOk) {
    return { ok: false, fieldErrors: {}, formError: "Something went wrong with this offer. Please reload the page." };
  }

  const customerName = input.customerName.trim().replace(/\s+/g, " ");
  if (customerName.length < 2) fieldErrors.customerName = "Enter your name.";
  else if (customerName.length > 100) fieldErrors.customerName = "Name must be 100 characters or fewer.";

  let contactType: ContactType | null = null;
  let contactValue = input.contactValue.trim();
  if (input.contactType === "phone" || input.contactType === "email") {
    contactType = input.contactType;
  } else {
    fieldErrors.contactType = "Choose phone or email.";
  }
  if (contactType === "phone") {
    const phone = normalizePhone(contactValue);
    if (!phone) fieldErrors.contactValue = "Enter a phone number with 7–15 digits, e.g. +977 9800000000.";
    else contactValue = phone;
  } else if (contactType === "email") {
    if (!isValidEmail(contactValue)) fieldErrors.contactValue = "Enter a valid email address.";
  }

  const requestedDate = input.requestedDate.trim();
  const latest = maxRequestDate(today);
  if (!isValidIsoDate(requestedDate)) fieldErrors.requestedDate = "Choose a date.";
  else if (requestedDate < today) fieldErrors.requestedDate = "Choose today or a later date.";
  else if (requestedDate > latest) fieldErrors.requestedDate = `Choose a date up to ${MAX_MONTHS_AHEAD} months ahead.`;

  const countText = input.participantCount.trim();
  const participantCount = Number(countText);
  if (!/^\d+$/.test(countText) || participantCount < 1 || participantCount > MAX_PARTICIPANTS) {
    fieldErrors.participantCount = `Enter a number from 1 to ${MAX_PARTICIPANTS}.`;
  }

  if (Object.keys(fieldErrors).length > 0 || !contactType) return { ok: false, fieldErrors };

  return {
    ok: true,
    data: {
      offerId: input.offerId,
      shown: {
        price: shownPrice,
        currency: input.shownCurrency as Currency,
        pricing_unit: input.shownUnit as PricingUnit,
      },
      customerName,
      contactType,
      contactValue,
      requestedDate,
      participantCount,
    },
  };
}

/** True if price, currency or unit differ from what the visitor saw. */
export function hasOfferChanged(
  shown: { price: number; currency: string; pricing_unit: string },
  current: { price: number; currency: string; pricing_unit: string | null },
): boolean {
  return (
    Math.round(shown.price * 100) !== Math.round(current.price * 100) ||
    shown.currency !== current.currency ||
    shown.pricing_unit !== current.pricing_unit
  );
}

// No 0/O, 1/I/L, so references are easy to read over the phone.
export const REFERENCE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** "PKR-7F3K2Q". `randomIndex(n)` returns an integer in [0, n); defaults to crypto randomness. */
export function generateReference(randomIndex: (n: number) => number = cryptoRandomIndex): string {
  let code = "";
  for (let i = 0; i < 6; i++) code += REFERENCE_ALPHABET[randomIndex(REFERENCE_ALPHABET.length)];
  return `PKR-${code}`;
}

function cryptoRandomIndex(n: number): number {
  // Rejection sampling avoids modulo bias.
  const limit = Math.floor(256 / n) * n;
  const byte = new Uint8Array(1);
  do crypto.getRandomValues(byte);
  while (byte[0] >= limit);
  return byte[0] % n;
}

export type OfferSnapshot = {
  activity: { name: string; slug: string };
  vendor: string;
  provider_name: string | null;
  source_domain: string;
  package_name: string | null;
  price: number;
  currency: Currency;
  pricing_unit: PricingUnit;
  duration: string | null;
  inclusions: string | null;
  booking_conditions: string | null;
  verification_status: string;
  retrieved_at: string | null;
};

/** Frozen copy of what the visitor saw, stored with the request and never updated. */
export function buildOfferSnapshot(
  listing: {
    package_name: string | null;
    price: number;
    currency: Currency;
    pricing_unit: PricingUnit;
    duration: string | null;
    inclusions: string | null;
    booking_conditions: string | null;
    verification_status: string;
    retrieved_at: string | null;
    source_domain: string;
  },
  activity: { name: string; slug: string },
  providerName: string | null,
): OfferSnapshot {
  return {
    activity: { name: activity.name, slug: activity.slug },
    vendor: providerName ?? `Listed on ${listing.source_domain}`,
    provider_name: providerName,
    source_domain: listing.source_domain,
    package_name: listing.package_name,
    price: listing.price,
    currency: listing.currency,
    pricing_unit: listing.pricing_unit,
    duration: listing.duration,
    inclusions: listing.inclusions,
    booking_conditions: listing.booking_conditions,
    verification_status: listing.verification_status,
    retrieved_at: listing.retrieved_at,
  };
}
