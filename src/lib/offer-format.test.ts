import { describe, expect, it } from "vitest";

import {
  formatCheckedDate,
  formatPrice,
  formatPricingUnit,
  formatRating,
  isOfferAvailable,
  sortOffers,
  summarizeOffers,
} from "./offer-format";
import type { AvailableOffer, Offer } from "./types";

function offer(overrides: Partial<Offer> = {}): Offer {
  return {
    id: "1",
    package_name: "Standard",
    price: 8500,
    currency: "NPR",
    pricing_unit: "per_person",
    duration: null,
    inclusions: null,
    booking_conditions: null,
    verification_status: "verified",
    retrieved_at: null,
    source_domain: "example.com",
    provider: null,
    ...overrides,
  };
}

describe("isOfferAvailable", () => {
  it("accepts verified and unverified offers with a price and currency", () => {
    expect(isOfferAvailable(offer())).toBe(true);
    expect(isOfferAvailable(offer({ verification_status: "unverified" }))).toBe(true);
  });

  it("accepts a free offer", () => {
    expect(isOfferAvailable(offer({ price: 0 }))).toBe(true);
  });

  it("rejects outdated offers", () => {
    expect(isOfferAvailable(offer({ verification_status: "outdated" }))).toBe(false);
  });

  it("rejects offers without a price or currency", () => {
    expect(isOfferAvailable(offer({ price: null }))).toBe(false);
    expect(isOfferAvailable(offer({ currency: null }))).toBe(false);
  });

  it("rejects negative or non-finite prices", () => {
    expect(isOfferAvailable(offer({ price: -1 }))).toBe(false);
    expect(isOfferAvailable(offer({ price: Number.NaN }))).toBe(false);
  });
});

describe("formatPrice", () => {
  it("uses Nepali digit grouping", () => {
    expect(formatPrice(8500, "NPR")).toBe("NPR 8,500");
    expect(formatPrice(1248500, "NPR")).toBe("NPR 12,48,500");
  });

  it("drops decimals for whole amounts and keeps them otherwise", () => {
    expect(formatPrice(95, "USD")).toBe("USD 95");
    expect(formatPrice(95.5, "USD")).toBe("USD 95.5");
    expect(formatPrice(95.25, "USD")).toBe("USD 95.25");
  });

  it("formats zero", () => {
    expect(formatPrice(0, "NPR")).toBe("NPR 0");
  });
});

describe("formatPricingUnit", () => {
  it("labels known units", () => {
    expect(formatPricingUnit("per_person")).toBe("per person");
    expect(formatPricingUnit("per_group")).toBe("per group");
    expect(formatPricingUnit("per_hour")).toBe("per hour");
    expect(formatPricingUnit("per_flight")).toBe("per flight");
  });

  it("returns null for other or missing units", () => {
    expect(formatPricingUnit("other")).toBeNull();
    expect(formatPricingUnit(null)).toBeNull();
  });
});

describe("formatRating", () => {
  it("shows rating and review count", () => {
    expect(formatRating(4.7, 312)).toBe("4.7 · 312 Google reviews");
    expect(formatRating(4.7, 1520)).toBe("4.7 · 1,520 Google reviews");
  });

  it("uses singular for one review", () => {
    expect(formatRating(5, 1)).toBe("5.0 · 1 Google review");
  });

  it("shows rating alone without a count", () => {
    expect(formatRating(4.2, null)).toBe("4.2 Google rating");
  });

  it("returns null without a rating", () => {
    expect(formatRating(null, 100)).toBeNull();
  });
});

describe("formatCheckedDate", () => {
  it("formats an ISO date without shifting the day", () => {
    expect(formatCheckedDate("2026-11-10")).toBe("10 Nov 2026");
    expect(formatCheckedDate("2026-01-01")).toBe("1 Jan 2026");
  });

  it("returns null for missing or invalid dates", () => {
    expect(formatCheckedDate(null)).toBeNull();
    expect(formatCheckedDate("not-a-date")).toBeNull();
  });
});

describe("sortOffers", () => {
  const a = offer({ id: "a", currency: "USD", price: 95 }) as AvailableOffer;
  const b = offer({ id: "b", currency: "NPR", price: 11000 }) as AvailableOffer;
  const c = offer({ id: "c", currency: "NPR", price: 8500 }) as AvailableOffer;
  const d = offer({ id: "d", currency: "EUR", price: 10 }) as AvailableOffer;
  const e = offer({ id: "e", currency: "INR", price: 500 }) as AvailableOffer;

  it("sorts by currency order, then price", () => {
    expect(sortOffers([a, b, c, d, e]).map((o) => o.id)).toEqual(["c", "b", "a", "e", "d"]);
  });

  it("breaks price ties by package name", () => {
    const x = offer({ id: "x", package_name: "Beta" }) as AvailableOffer;
    const y = offer({ id: "y", package_name: "Alpha" }) as AvailableOffer;
    expect(sortOffers([x, y]).map((o) => o.id)).toEqual(["y", "x"]);
  });

  it("does not mutate the input", () => {
    const input = [a, c];
    sortOffers(input);
    expect(input.map((o) => o.id)).toEqual(["a", "c"]);
  });
});

describe("summarizeOffers", () => {
  it("counts offers and takes the lowest price per activity", () => {
    const s = summarizeOffers([
      { activity_id: "a", price: 9000, currency: "NPR" },
      { activity_id: "a", price: 8500, currency: "NPR" },
      { activity_id: "b", price: 40, currency: "USD" },
    ]);
    expect(s.get("a")).toEqual({ count: 2, fromPrice: 8500, fromCurrency: "NPR" });
    expect(s.get("b")).toEqual({ count: 1, fromPrice: 40, fromCurrency: "USD" });
  });

  it("prefers NPR over a lower number in another currency", () => {
    const s = summarizeOffers([
      { activity_id: "a", price: 95, currency: "USD" },
      { activity_id: "a", price: 8500, currency: "NPR" },
      { activity_id: "a", price: 60, currency: "USD" },
    ]);
    expect(s.get("a")).toEqual({ count: 3, fromPrice: 8500, fromCurrency: "NPR" });
  });

  it("returns nothing for activities without offers", () => {
    expect(summarizeOffers([]).size).toBe(0);
  });
});
