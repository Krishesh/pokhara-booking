"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import {
  buildOfferSnapshot,
  calculateTotal,
  generateReference,
  hasOfferChanged,
  isRequestableUnit,
  todayInTimeZone,
  validateBookingForm,
  type FieldErrors,
} from "@/lib/booking";
import { isOfferAvailable } from "@/lib/offer-format";
import type { Currency, Offer, PricingUnit } from "@/lib/types";

export type BookingSuccess = {
  reference: string;
  activityName: string;
  vendor: string;
  packageName: string | null;
  requestedDate: string;
  participantCount: number;
  total: number;
  currency: Currency;
};

export type BookingState =
  | { status: "idle" }
  | {
      status: "error";
      message?: string;
      fieldErrors?: FieldErrors;
      /** Set when the offer changed since the page loaded; the form shows these terms for review. */
      changedOffer?: { price: number; currency: Currency; pricing_unit: PricingUnit };
      /** The offer can no longer be requested at all. */
      unavailable?: boolean;
    }
  | { status: "success"; booking: BookingSuccess };

const UNAVAILABLE = "This offer is no longer available. Please reload the page to see current offers.";
const SAVE_FAILED = "We couldn't send your request. Please try again in a moment.";

type ListingRow = Omit<Offer, "provider"> & {
  activity: { name: string; slug: string; is_published: boolean } | null;
  provider: { name: string } | null;
};

export async function submitBookingRequest(_prev: BookingState, formData: FormData): Promise<BookingState> {
  const field = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };

  const validation = validateBookingForm(
    {
      offerId: field("offerId"),
      shownPrice: field("shownPrice"),
      shownCurrency: field("shownCurrency"),
      shownUnit: field("shownUnit"),
      customerName: field("customerName"),
      contactType: field("contactType"),
      contactValue: field("contactValue"),
      requestedDate: field("requestedDate"),
      participantCount: field("participantCount"),
    },
    todayInTimeZone(new Date()),
  );
  if (!validation.ok) {
    return { status: "error", fieldErrors: validation.fieldErrors, message: validation.formError };
  }
  const input = validation.data;

  const supabase = createAdminClient();

  // Re-read the offer: the service role bypasses RLS, so apply the same visibility rules here.
  const { data, error: readError } = await supabase
    .from("price_listings")
    .select(
      `id, package_name, price, currency, pricing_unit, duration, inclusions, booking_conditions,
       verification_status, retrieved_at, source_domain,
       activity:activities ( name, slug, is_published ),
       provider:providers ( name )`,
    )
    .eq("id", input.offerId)
    .maybeSingle();

  if (readError) {
    console.error("booking: failed to read offer", readError);
    return { status: "error", message: SAVE_FAILED };
  }

  const row = data as unknown as ListingRow | null;
  const listing = row && { ...row, price: row.price === null ? null : Number(row.price) };
  if (
    !listing ||
    !listing.activity?.is_published ||
    !isOfferAvailable({ ...listing, provider: null }) ||
    !isRequestableUnit(listing.pricing_unit)
  ) {
    return { status: "error", message: UNAVAILABLE, unavailable: true };
  }

  const current = { price: listing.price as number, currency: listing.currency as Currency, pricing_unit: listing.pricing_unit };
  if (hasOfferChanged(input.shown, current)) {
    return {
      status: "error",
      message: "This offer's price changed since you opened it. Please review the new price and submit again.",
      changedOffer: current,
    };
  }

  // Honeypot: bots fill the hidden field. Pretend success, save nothing.
  if (field("website").trim() !== "") {
    return { status: "success", booking: successFor(generateReference(), listing, input, 0) };
  }

  const total = calculateTotal(current.price, current.pricing_unit, input.participantCount);
  if (total === null) return { status: "error", message: UNAVAILABLE, unavailable: true };

  const snapshot = buildOfferSnapshot(
    { ...listing, price: current.price, currency: current.currency, pricing_unit: current.pricing_unit },
    listing.activity,
    listing.provider?.name ?? null,
  );

  // Retry on the rare reference collision (unique violation 23505).
  for (let attempt = 0; attempt < 3; attempt++) {
    const reference = generateReference();
    const { error: insertError } = await supabase.from("booking_requests").insert({
      reference,
      price_listing_id: listing.id,
      customer_name: input.customerName,
      contact_type: input.contactType,
      contact_value: input.contactValue,
      requested_date: input.requestedDate,
      participant_count: input.participantCount,
      offer_snapshot: snapshot,
      total_price: total,
      currency: current.currency,
    });

    if (!insertError) {
      return { status: "success", booking: successFor(reference, listing, input, total) };
    }
    if (insertError.code !== "23505") {
      console.error("booking: failed to insert request", insertError);
      return { status: "error", message: SAVE_FAILED };
    }
  }

  console.error("booking: could not generate a unique reference");
  return { status: "error", message: SAVE_FAILED };
}

function successFor(
  reference: string,
  listing: ListingRow,
  input: { requestedDate: string; participantCount: number },
  total: number,
): BookingSuccess {
  return {
    reference,
    activityName: listing.activity?.name ?? "",
    vendor: listing.provider?.name ?? `Listed on ${listing.source_domain}`,
    packageName: listing.package_name,
    requestedDate: input.requestedDate,
    participantCount: input.participantCount,
    total,
    currency: listing.currency as Currency,
  };
}
