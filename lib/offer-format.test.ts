import { describe, expect, it } from "vitest";

import {
  formatCheckedDate,
  formatPrice,
  formatPricingUnit,
  formatRating,
  isOfferAvailable,
  sortOffers,
} from "./offer-format";
import type { AvailableOffer, Offer } from "./types";

function makeOffer(overrides: Partial<Offer> = {}): Offer {
  return {
    id: "offer-1",
    activity_id: "activity-1",
    provider_id: "provider-1",
    package_name: "Standard Tandem",
    price: 8500,
    currency: "NPR",
    pricing_unit: "per_person",
    duration: "30 minutes",
    inclusions: null,
    booking_conditions: null,
    verification_status: "verified",
    retrieved_at: "2026-11-10",
    source_domain: "example.com",
    provider: null,
    ...overrides,
  };
}

describe("isOfferAvailable", () => {
  it("returns true for verified and unverified offers with price and currency", () => {
    expect(isOfferAvailable(makeOffer({ verification_status: "verified" }))).toBe(
      true
    );
    expect(
      isOfferAvailable(makeOffer({ verification_status: "unverified" }))
    ).toBe(true);
  });

  it("returns false for outdated offers", () => {
    expect(isOfferAvailable(makeOffer({ verification_status: "outdated" }))).toBe(
      false
    );
  });

  it("returns false when price or currency is missing or invalid", () => {
    expect(isOfferAvailable(makeOffer({ price: null }))).toBe(false);
    expect(isOfferAvailable(makeOffer({ currency: null }))).toBe(false);
    expect(isOfferAvailable(makeOffer({ price: -100 }))).toBe(false);
  });
});

describe("formatPricingUnit", () => {
  it("formats known units and returns empty string for other or null", () => {
    expect(formatPricingUnit("per_person")).toBe("per person");
    expect(formatPricingUnit("per_group")).toBe("per group");
    expect(formatPricingUnit("per_hour")).toBe("per hour");
    expect(formatPricingUnit("per_flight")).toBe("per flight");
    expect(formatPricingUnit("other")).toBe("");
    expect(formatPricingUnit(null)).toBe("");
  });
});

describe("formatPrice", () => {
  it("uses Nepali digit grouping and omits decimals for whole numbers", () => {
    expect(formatPrice(8500, "NPR", "per_person")).toBe(
      "NPR 8,500 per person"
    );
    expect(formatPrice(1248500, "NPR")).toBe("NPR 12,48,500");
    expect(formatPrice(1500, "NPR", "per_group")).toBe("NPR 1,500 per group");
    expect(formatPrice(13000, "NPR", "per_flight")).toBe(
      "NPR 13,000 per flight"
    );
    expect(formatPrice(95, "USD", "other")).toBe("USD 95");
  });

  it("keeps two decimals for fractional amounts", () => {
    expect(formatPrice(95.5, "USD", "per_person")).toBe(
      "USD 95.50 per person"
    );
  });
});

describe("formatRating", () => {
  it("formats rating with review count or fallback label", () => {
    expect(formatRating(4.7, 312)).toBe("★ 4.7 · 312 Google reviews");
    expect(formatRating(4.9, 1)).toBe("★ 4.9 · 1 Google review");
    expect(formatRating(4.2, null)).toBe("★ 4.2 Google rating");
    expect(formatRating(4.2, 0)).toBe("★ 4.2 Google rating");
  });

  it("returns null when rating is missing", () => {
    expect(formatRating(null, 10)).toBeNull();
    expect(formatRating(undefined, undefined)).toBeNull();
  });
});

describe("formatCheckedDate", () => {
  it("formats ISO dates cleanly in UTC", () => {
    expect(formatCheckedDate("2026-11-10")).toBe("Price checked 10 Nov 2026");
    expect(formatCheckedDate("2026-01-05")).toBe("Price checked 5 Jan 2026");
  });

  it("returns null for empty or invalid dates", () => {
    expect(formatCheckedDate(null)).toBeNull();
    expect(formatCheckedDate("")).toBeNull();
    expect(formatCheckedDate("2026-02-30")).toBeNull();
  });
});

describe("sortOffers", () => {
  it("sorts by currency order (NPR, USD, INR, EUR), then price ascending, then package name", () => {
    const offers = [
      makeOffer({ id: "eur", currency: "EUR", price: 50, package_name: "A" }),
      makeOffer({ id: "usd", currency: "USD", price: 95, package_name: "Intl" }),
      makeOffer({ id: "inr", currency: "INR", price: 3000, package_name: "B" }),
      makeOffer({
        id: "npr-high",
        currency: "NPR",
        price: 11000,
        package_name: "XC",
      }),
      makeOffer({
        id: "npr-tie-b",
        currency: "NPR",
        price: 8500,
        package_name: "Zebra",
      }),
      makeOffer({
        id: "npr-tie-a",
        currency: "NPR",
        price: 8500,
        package_name: "Alpha",
      }),
    ] as AvailableOffer[];

    const sorted = sortOffers(offers);
    expect(sorted.map((o) => o.id)).toEqual([
      "npr-tie-a",
      "npr-tie-b",
      "npr-high",
      "usd",
      "inr",
      "eur",
    ]);
    // Does not mutate input array
    expect(offers[0].id).toBe("eur");
  });
});
