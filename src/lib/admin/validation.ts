// Pure validation for the admin forms (task 04). Mirrors the checks in supabase/schema.sql
// so staff get a clear message before the database rejects anything.

import { CURRENCIES, PRICING_UNITS, type Currency, type PricingUnit, type VerificationStatus } from "../types";

export const VERIFICATION_STATUSES: readonly VerificationStatus[] = ["verified", "unverified", "outdated"];

export type FormValues = Record<string, string>;
export type FieldErrors<K extends string> = Partial<Record<K, string>>;
export type Validated<T, K extends string> = { ok: true; data: T } | { ok: false; fieldErrors: FieldErrors<K> };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: string) => UUID_RE.test(value);
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ---------- helpers ----------

/** "Paragliding at Sarangkot!" -> "paragliding-at-sarangkot" */
export function slugify(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** "https://www.Example.com/path" -> "example.com"; null if not an http(s) URL. */
export function domainFromUrl(value: string): string | null {
  const url = parseHttpUrl(value);
  return url ? url.hostname.toLowerCase().replace(/^www\./, "") : null;
}

function parseHttpUrl(value: string, httpsOnly = false): URL | null {
  try {
    const url = new URL(value.trim());
    if (httpsOnly ? url.protocol !== "https:" : url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.hostname.includes(".") ? url : null;
  } catch {
    return null;
  }
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

const clean = (value: string | undefined) => (value ?? "").trim();

function text<K extends string>(
  errors: FieldErrors<K>,
  key: K,
  value: string | undefined,
  { label, required = false, min = 1, max }: { label: string; required?: boolean; min?: number; max: number },
): string | null {
  const v = clean(value);
  if (!v) {
    if (required) errors[key] = `${label} is required.`;
    return null;
  }
  if (v.length < min) errors[key] = `${label} must be at least ${min} characters.`;
  else if (v.length > max) errors[key] = `${label} must be ${max} characters or fewer.`;
  return v;
}

function url<K extends string>(
  errors: FieldErrors<K>,
  key: K,
  value: string | undefined,
  { label, required = false, httpsOnly = false }: { label: string; required?: boolean; httpsOnly?: boolean },
): string | null {
  const v = clean(value);
  if (!v) {
    if (required) errors[key] = `${label} is required.`;
    return null;
  }
  if (v.length > 2000) {
    errors[key] = `${label} is too long.`;
    return null;
  }
  if (!parseHttpUrl(v, httpsOnly)) {
    errors[key] = httpsOnly
      ? `${label} must be a full link starting with https://`
      : `${label} must be a full link starting with https:// or http://`;
    return null;
  }
  return v;
}

function date<K extends string>(errors: FieldErrors<K>, key: K, value: string | undefined, label: string): string | null {
  const v = clean(value);
  if (!v) return null;
  if (!isValidIsoDate(v)) {
    errors[key] = `${label} must be a valid date.`;
    return null;
  }
  return v;
}

function decimal<K extends string>(
  errors: FieldErrors<K>,
  key: K,
  value: string | undefined,
  { label, min, max, decimals }: { label: string; min: number; max: number; decimals: number },
): number | null {
  const v = clean(value).replace(/,/g, "");
  if (!v) return null;
  const pattern = decimals === 0 ? /^\d+$/ : new RegExp(`^\\d+(\\.\\d{1,${decimals}})?$`);
  const n = Number(v);
  if (!pattern.test(v) || !Number.isFinite(n)) {
    errors[key] =
      decimals === 0 ? `${label} must be a whole number.` : `${label} must be a number with up to ${decimals} decimals.`;
    return null;
  }
  if (n < min || n > max) {
    errors[key] = `${label} must be between ${min} and ${max.toLocaleString("en-IN")}.`;
    return null;
  }
  return n;
}

const isOn = (value: string | undefined) => value === "on" || value === "true";

// ---------- activities ----------

export type ActivityField = "name" | "slug" | "category" | "location" | "image_url" | "image_credit" | "description";
export type ActivityInput = {
  name: string;
  slug: string;
  category: string;
  location: string | null;
  image_url: string | null;
  image_credit: string | null;
  description: string | null;
  is_published: boolean;
};

export function validateActivity(values: FormValues): Validated<ActivityInput, ActivityField> {
  const errors: FieldErrors<ActivityField> = {};
  const name = text(errors, "name", values.name, { label: "Name", required: true, min: 2, max: 100 });

  const slug = clean(values.slug).toLowerCase();
  if (!slug) errors.slug = "Slug is required.";
  else if (slug.length > 80) errors.slug = "Slug must be 80 characters or fewer.";
  else if (!SLUG_RE.test(slug)) errors.slug = "Use only lowercase letters, numbers and single dashes, e.g. paragliding-sarangkot.";

  const category = clean(values.category).toLowerCase();
  if (!category) errors.category = "Category is required.";
  else if (category.length > 40) errors.category = "Category must be 40 characters or fewer.";

  const location = text(errors, "location", values.location, { label: "Location", max: 100 });
  const image_url = url(errors, "image_url", values.image_url, { label: "Image URL", httpsOnly: true });
  const image_credit = text(errors, "image_credit", values.image_credit, { label: "Photo credit", max: 200 });
  const description = text(errors, "description", values.description, { label: "Description", max: 5000 });

  if (Object.keys(errors).length > 0) return { ok: false, fieldErrors: errors };
  return {
    ok: true,
    data: {
      name: name!,
      slug,
      category,
      location,
      image_url,
      image_credit: image_url ? image_credit : null,
      description,
      is_published: isOn(values.is_published),
    },
  };
}

// ---------- providers ----------

export type ProviderField =
  | "name"
  | "website_url"
  | "phone"
  | "address"
  | "google_maps_url"
  | "google_rating"
  | "google_review_count"
  | "google_retrieved_at"
  | "notes";
export type ProviderInput = {
  name: string;
  website_url: string | null;
  phone: string | null;
  address: string | null;
  google_maps_url: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  google_retrieved_at: string | null;
  notes: string | null;
};

export function validateProvider(values: FormValues): Validated<ProviderInput, ProviderField> {
  const errors: FieldErrors<ProviderField> = {};
  const name = text(errors, "name", values.name, { label: "Name", required: true, min: 2, max: 120 });
  const website_url = url(errors, "website_url", values.website_url, { label: "Website" });
  const phone = text(errors, "phone", values.phone, { label: "Phone", max: 40 });
  const address = text(errors, "address", values.address, { label: "Address", max: 200 });
  const google_maps_url = url(errors, "google_maps_url", values.google_maps_url, { label: "Google Maps link" });
  const google_rating = decimal(errors, "google_rating", values.google_rating, {
    label: "Google rating",
    min: 0,
    max: 5,
    decimals: 1,
  });
  const google_review_count = decimal(errors, "google_review_count", values.google_review_count, {
    label: "Review count",
    min: 0,
    max: 10_000_000,
    decimals: 0,
  });
  const google_retrieved_at = date(errors, "google_retrieved_at", values.google_retrieved_at, "Rating checked date");
  const notes = text(errors, "notes", values.notes, { label: "Notes", max: 2000 });

  if (google_review_count !== null && google_rating === null && !errors.google_rating) {
    errors.google_rating = "Add the rating too, or clear the review count.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, fieldErrors: errors };
  return {
    ok: true,
    data: {
      name: name!,
      website_url,
      phone,
      address,
      google_maps_url,
      google_rating,
      google_review_count,
      google_retrieved_at,
      notes,
    },
  };
}

// ---------- offers (price_listings) ----------

export type OfferField =
  | "activity_id"
  | "provider_id"
  | "package_name"
  | "price"
  | "currency"
  | "pricing_unit"
  | "duration"
  | "inclusions"
  | "booking_conditions"
  | "source_url"
  | "source_domain"
  | "booking_url"
  | "retrieved_at"
  | "verification_status"
  | "notes";
export type OfferInput = {
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
};

export function validateOffer(values: FormValues): Validated<OfferInput, OfferField> {
  const errors: FieldErrors<OfferField> = {};

  const activity_id = clean(values.activity_id);
  if (!UUID_RE.test(activity_id)) errors.activity_id = "Choose an activity.";

  const providerRaw = clean(values.provider_id);
  const provider_id = providerRaw ? providerRaw : null;
  if (provider_id && !UUID_RE.test(provider_id)) errors.provider_id = "Choose a provider or “No provider”.";

  const package_name = text(errors, "package_name", values.package_name, { label: "Package name", max: 120 });
  const price = decimal(errors, "price", values.price, { label: "Price", min: 0, max: 9_999_999_999.99, decimals: 2 });

  const currencyRaw = clean(values.currency);
  let currency: Currency | null = null;
  if (currencyRaw) {
    if ((CURRENCIES as readonly string[]).includes(currencyRaw)) currency = currencyRaw as Currency;
    else errors.currency = "Choose NPR, USD, INR or EUR.";
  }

  const unitRaw = clean(values.pricing_unit);
  let pricing_unit: PricingUnit | null = null;
  if (unitRaw) {
    if ((PRICING_UNITS as readonly string[]).includes(unitRaw)) pricing_unit = unitRaw as PricingUnit;
    else errors.pricing_unit = "Choose a pricing unit.";
  }

  if (price !== null && !currency && !errors.currency) errors.currency = "Choose a currency for this price.";
  if (currency && price === null && !errors.price) errors.price = "Enter a price, or clear the currency.";

  const duration = text(errors, "duration", values.duration, { label: "Duration", max: 80 });
  const inclusions = text(errors, "inclusions", values.inclusions, { label: "Included", max: 2000 });
  const booking_conditions = text(errors, "booking_conditions", values.booking_conditions, {
    label: "Conditions",
    max: 2000,
  });

  const source_url = url(errors, "source_url", values.source_url, { label: "Source link", required: true });
  let source_domain = clean(values.source_domain).toLowerCase().replace(/^www\./, "");
  if (!source_domain && source_url) source_domain = domainFromUrl(source_url) ?? "";
  if (!source_domain) {
    if (!errors.source_url) errors.source_domain = "Source website is required.";
  } else if (source_domain.length > 120 || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(source_domain)) {
    errors.source_domain = "Enter a website name like example.com.";
  }

  const booking_url = url(errors, "booking_url", values.booking_url, { label: "Vendor booking link" });
  const retrieved_at = date(errors, "retrieved_at", values.retrieved_at, "Price checked date");

  const statusRaw = clean(values.verification_status) || "unverified";
  let verification_status: VerificationStatus = "unverified";
  if ((VERIFICATION_STATUSES as readonly string[]).includes(statusRaw)) verification_status = statusRaw as VerificationStatus;
  else errors.verification_status = "Choose verified, unverified or outdated.";

  const notes = text(errors, "notes", values.notes, { label: "Notes", max: 2000 });

  if (Object.keys(errors).length > 0) return { ok: false, fieldErrors: errors };
  return {
    ok: true,
    data: {
      activity_id,
      provider_id,
      package_name,
      price,
      currency,
      pricing_unit,
      duration,
      inclusions,
      booking_conditions,
      source_url: source_url!,
      source_domain,
      booking_url,
      retrieved_at,
      verification_status,
      notes,
    },
  };
}

/** What visitors will see for an offer with these values; shown as a hint in the admin. */
export function offerVisibility(offer: {
  price: number | null;
  currency: string | null;
  verification_status: string;
  activityPublished: boolean;
}): { visible: boolean; reason: string } {
  if (offer.verification_status === "outdated") return { visible: false, reason: "Hidden: marked outdated" };
  if (offer.price === null || offer.currency === null) return { visible: false, reason: "Hidden: no price" };
  if (!offer.activityPublished) return { visible: false, reason: "Hidden: activity not published" };
  return { visible: true, reason: "Visible on site" };
}

