"use server";

import {
  buildOfferSnapshot,
  calculateTotal,
  generateReference,
  hasOfferChanged,
  isRequestableUnit,
  normalizePhone,
  todayInTimeZone,
  validateBookingForm,
  type BookingFormData,
  type BookingFormErrors,
  type OfferSnapshot,
} from "@/lib/booking";
import type { AvailableOffer, Currency, PricingUnit } from "@/lib/types";
import { createAdminSupabaseClient } from "@/utils/supabase/admin";

export type BookingActionResult =
  | {
      status: "success";
      reference: string;
      snapshot: OfferSnapshot;
      totalPrice: number;
      currency: Currency;
      participantCount: number;
      requestedDate: string;
    }
  | {
      status: "validation_error";
      errors: BookingFormErrors;
    }
  | {
      status: "offer_unavailable";
    }
  | {
      status: "offer_changed";
      newPrice: number;
      newCurrency: Currency;
      newPricingUnit: PricingUnit;
    }
  | {
      status: "error";
      message: string;
    };

export async function submitBookingRequest(
  offerId: string,
  submittedPrice: number,
  submittedCurrency: Currency,
  submittedPricingUnit: PricingUnit,
  formData: BookingFormData
): Promise<BookingActionResult> {
  // --- Honeypot check ---
  if (formData.website && formData.website.trim() !== "") {
    // Bot filled the hidden field — return fake success
    return {
      status: "success",
      reference: generateReference(),
      snapshot: {
        activity_name: "Activity",
        activity_slug: "activity",
        provider_name: null,
        source_domain: "example.com",
        package_name: "Standard package",
        price: submittedPrice,
        currency: submittedCurrency,
        pricing_unit: submittedPricingUnit,
        duration: null,
        inclusions: null,
        booking_conditions: null,
        verification_status: "unverified",
        retrieved_at: null,
      },
      totalPrice: submittedPrice,
      currency: submittedCurrency,
      participantCount: formData.participantCount,
      requestedDate: formData.requestedDate,
    };
  }

  // --- Validate form data ---
  const today = todayInTimeZone();
  const errors = validateBookingForm(formData, today);
  if (Object.keys(errors).length > 0) {
    return { status: "validation_error", errors };
  }

  try {
    const supabase = createAdminSupabaseClient();

    // --- Re-read the offer with service-role key ---
    const { data: offerRow, error: offerError } = await supabase
      .from("price_listings")
      .select(
        `
        id,
        activity_id,
        provider_id,
        package_name,
        price,
        currency,
        pricing_unit,
        duration,
        inclusions,
        booking_conditions,
        verification_status,
        retrieved_at,
        source_domain,
        activities!inner (
          name,
          slug,
          is_published
        ),
        providers (
          name
        )
      `
      )
      .eq("id", offerId)
      .maybeSingle();

    if (offerError) {
      throw new Error(`Failed to re-check offer: ${offerError.message}`);
    }

    // --- Apply visibility rules ---
    if (!offerRow) {
      return { status: "offer_unavailable" };
    }

    const activity = Array.isArray(offerRow.activities)
      ? offerRow.activities[0]
      : offerRow.activities;
    const provider = Array.isArray(offerRow.providers)
      ? offerRow.providers[0]
      : offerRow.providers;

    if (!activity || !activity.is_published) {
      return { status: "offer_unavailable" };
    }

    if (offerRow.verification_status === "outdated") {
      return { status: "offer_unavailable" };
    }

    if (
      offerRow.price === null ||
      offerRow.price === undefined ||
      offerRow.currency === null
    ) {
      return { status: "offer_unavailable" };
    }

    if (!isRequestableUnit(offerRow.pricing_unit as PricingUnit)) {
      return { status: "offer_unavailable" };
    }

    // --- Check if offer terms changed ---
    const currentPrice = Number(offerRow.price);
    const currentCurrency = offerRow.currency as Currency;
    const currentUnit = offerRow.pricing_unit as PricingUnit;

    if (
      hasOfferChanged(
        {
          price: submittedPrice,
          currency: submittedCurrency,
          pricing_unit: submittedPricingUnit,
        },
        {
          price: currentPrice,
          currency: currentCurrency,
          pricing_unit: currentUnit,
        }
      )
    ) {
      return {
        status: "offer_changed",
        newPrice: currentPrice,
        newCurrency: currentCurrency,
        newPricingUnit: currentUnit,
      };
    }

    // --- Build the offer for snapshot ---
    const availableOffer: AvailableOffer = {
      id: offerRow.id,
      activity_id: offerRow.activity_id,
      provider_id: offerRow.provider_id,
      package_name: offerRow.package_name,
      price: currentPrice,
      currency: currentCurrency,
      pricing_unit: currentUnit,
      duration: offerRow.duration,
      inclusions: offerRow.inclusions,
      booking_conditions: offerRow.booking_conditions,
      verification_status: offerRow.verification_status as "verified" | "unverified",
      retrieved_at: offerRow.retrieved_at,
      source_domain: offerRow.source_domain,
      provider: provider ? { id: "", name: provider.name, google_rating: null, google_review_count: null } : null,
    };

    const snapshot = buildOfferSnapshot({
      activity: { name: activity.name, slug: activity.slug },
      offer: availableOffer,
      providerName: provider?.name ?? null,
    });

    // --- Calculate total ---
    const total = calculateTotal(
      currentPrice,
      currentUnit,
      formData.participantCount
    );

    // --- Normalize contact ---
    const contactValue =
      formData.contactType === "phone"
        ? normalizePhone(formData.contactValue.trim())
        : formData.contactValue.trim();

    // --- Generate reference and insert (with retry for duplicate) ---
    let attempts = 0;
    const MAX_ATTEMPTS = 5;
    while (attempts < MAX_ATTEMPTS) {
      const reference = generateReference();
      const { error: insertError } = await supabase
        .from("booking_requests")
        .insert({
          reference,
          price_listing_id: offerId,
          customer_name: formData.customerName.trim(),
          contact_type: formData.contactType,
          contact_value: contactValue,
          requested_date: formData.requestedDate,
          participant_count: formData.participantCount,
          offer_snapshot: snapshot,
          total_price: total,
          currency: currentCurrency,
          status: "pending",
        });

      if (!insertError) {
        return {
          status: "success",
          reference,
          snapshot,
          totalPrice: total,
          currency: currentCurrency,
          participantCount: formData.participantCount,
          requestedDate: formData.requestedDate,
        };
      }

      // Check if it's a unique constraint violation on reference
      if (insertError.code === "23505" && insertError.message?.includes("reference")) {
        attempts++;
        continue;
      }

      throw new Error(`Failed to save booking request: ${insertError.message}`);
    }

    throw new Error("Could not generate a unique reference after multiple attempts.");
  } catch (err) {
    console.error("submitBookingRequest error:", err);
    return {
      status: "error",
      message: "We couldn't send your request. Please try again.",
    };
  }
}
