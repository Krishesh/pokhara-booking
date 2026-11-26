import type { AvailableOffer, Currency, PricingUnit } from "./types";

// --- Reference generation ---

const REF_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // no 0/O/1/I/L

export function generateReference(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += REF_ALPHABET[Math.floor(Math.random() * REF_ALPHABET.length)];
  }
  return `PKR-${code}`;
}

// --- Requestable unit check ---

const REQUESTABLE_UNITS: PricingUnit[] = [
  "per_person",
  "per_group",
  "per_flight",
];

export type RequestablePricingUnit = "per_person" | "per_group" | "per_flight";

export type RequestableOffer = AvailableOffer & {
  pricing_unit: RequestablePricingUnit;
};

export function isRequestableUnit(
  unit: PricingUnit | null | undefined
): boolean {
  return unit !== null && unit !== undefined && REQUESTABLE_UNITS.includes(unit);
}

export function isRequestableOffer(
  offer: AvailableOffer
): offer is RequestableOffer {
  return isRequestableUnit(offer.pricing_unit);
}

// --- Date helpers ---

export function todayInTimeZone(tz: string = "Asia/Kathmandu"): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now); // YYYY-MM-DD
}

export function maxRequestDate(
  fromDate: string = todayInTimeZone()
): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fromDate);
  if (!match) {
    return fromDate;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const targetYear = year + 1;

  // 29 February becomes 28 February in the following non-leap year.
  const lastDayOfMonth = new Date(Date.UTC(targetYear, month, 0)).getUTCDate();
  const targetDay = Math.min(day, lastDayOfMonth);

  return `${targetYear}-${String(month).padStart(2, "0")}-${String(
    targetDay
  ).padStart(2, "0")}`;
}

// --- Phone & email ---

export function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, "");
}

function countDigits(s: string): number {
  return (s.match(/\d/g) || []).length;
}

export function isValidPhone(phone: string): boolean {
  const cleaned = normalizePhone(phone);
  if (!/^\+?[\d]+$/.test(cleaned)) return false;
  const digits = countDigits(cleaned);
  return digits >= 7 && digits <= 15;
}

export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// --- Validation ---

export type ContactType = "phone" | "email";

export interface BookingFormData {
  customerName: string;
  contactType: ContactType;
  contactValue: string;
  requestedDate: string;
  participantCount: number;
  website?: string; // honeypot
}

export interface BookingFormErrors {
  customerName?: string;
  contactValue?: string;
  requestedDate?: string;
  participantCount?: string;
}

export interface InterestFormData {
  customerName: string;
  contactType: ContactType;
  contactValue: string;
  participantCount: number;
  website?: string; // honeypot
}

export type InterestFormErrors = Pick<
  BookingFormErrors,
  "customerName" | "contactValue" | "participantCount"
>;

function validateCustomerName(name: string): string | undefined {
  const trimmed = name.trim();
  if (!trimmed) {
    return "Name is required.";
  }
  if (trimmed.length < 2) {
    return "Name must be at least 2 characters.";
  }
  if (trimmed.length > 100) {
    return "Name must be at most 100 characters.";
  }
  return undefined;
}

function validateContact(
  contactType: ContactType,
  contactValue: string
): string | undefined {
  const value = contactValue.trim();
  if (!value) {
    return contactType === "phone"
      ? "Phone number is required."
      : "Email address is required.";
  }
  if (contactType === "phone" && !isValidPhone(value)) {
    return "Enter a valid phone number with 7–15 digits.";
  }
  if (contactType === "email" && !isValidEmail(value)) {
    return "Enter a valid email address.";
  }
  return undefined;
}

function validateParticipantCount(count: number): string | undefined {
  if (!Number.isInteger(count) || count < 1 || count > 20) {
    return "Participants must be between 1 and 20.";
  }
  return undefined;
}

export function validateBookingForm(
  data: BookingFormData,
  today: string = todayInTimeZone()
): BookingFormErrors {
  const errors: BookingFormErrors = {};

  const customerName = validateCustomerName(data.customerName);
  if (customerName) {
    errors.customerName = customerName;
  }

  const contact = validateContact(data.contactType, data.contactValue);
  if (contact) {
    errors.contactValue = contact;
  }

  if (!data.requestedDate) {
    errors.requestedDate = "Date is required.";
  } else {
    const max = maxRequestDate(today);
    if (data.requestedDate < today) {
      errors.requestedDate = "Date must be today or later.";
    } else if (data.requestedDate > max) {
      errors.requestedDate = "Date must be within the next 12 months.";
    }
  }

  const participants = validateParticipantCount(data.participantCount);
  if (participants) {
    errors.participantCount = participants;
  }

  return errors;
}

export function validateInterestForm(
  data: InterestFormData
): InterestFormErrors {
  const errors: InterestFormErrors = {};

  const customerName = validateCustomerName(data.customerName);
  if (customerName) {
    errors.customerName = customerName;
  }

  const contact = validateContact(data.contactType, data.contactValue);
  if (contact) {
    errors.contactValue = contact;
  }

  const participants = validateParticipantCount(data.participantCount);
  if (participants) {
    errors.participantCount = participants;
  }

  return errors;
}

// --- Total calculation ---

export function calculateTotal(
  price: number,
  unit: PricingUnit,
  participantCount: number
): number {
  if (unit === "per_person") {
    return price * participantCount;
  }
  // per_group, per_flight: flat price
  return price;
}

// --- Offer change detection ---

export interface OfferForComparison {
  price: number | null;
  currency: Currency | null;
  pricing_unit: PricingUnit | null;
}

export function hasOfferChanged(
  submitted: OfferForComparison,
  current: OfferForComparison
): boolean {
  return (
    submitted.price !== current.price ||
    submitted.currency !== current.currency ||
    submitted.pricing_unit !== current.pricing_unit
  );
}

// --- Offer snapshot ---

export interface OfferSnapshot {
  activity_name: string;
  activity_slug: string;
  provider_name: string | null;
  source_domain: string;
  package_name: string;
  price: number;
  currency: Currency;
  pricing_unit: PricingUnit;
  duration: string | null;
  inclusions: string | null;
  booking_conditions: string | null;
  verification_status: string;
  retrieved_at: string | null;
}

export function buildOfferSnapshot(params: {
  activity: { name: string; slug: string };
  offer: AvailableOffer;
  providerName: string | null;
}): OfferSnapshot {
  const { activity, offer, providerName } = params;
  return {
    activity_name: activity.name,
    activity_slug: activity.slug,
    provider_name: providerName,
    source_domain: offer.source_domain,
    package_name: offer.package_name ?? "Standard package",
    price: offer.price,
    currency: offer.currency,
    pricing_unit: offer.pricing_unit!,
    duration: offer.duration,
    inclusions: offer.inclusions,
    booking_conditions: offer.booking_conditions,
    verification_status: offer.verification_status,
    retrieved_at: offer.retrieved_at,
  };
}
