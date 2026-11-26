import { describe, expect, it } from "vitest";

import {
  buildOfferSnapshot,
  calculateTotal,
  generateReference,
  hasOfferChanged,
  isRequestableUnit,
  isValidEmail,
  isValidPhone,
  maxRequestDate,
  normalizePhone,
  todayInTimeZone,
  validateBookingForm,
  validateInterestForm,
} from "./booking";
import type { AvailableOffer } from "./types";

describe("generateReference", () => {
  it("produces PKR- followed by 6 uppercase alphanumeric characters", () => {
    for (let i = 0; i < 20; i++) {
      const ref = generateReference();
      expect(ref).toMatch(/^PKR-[A-Z0-9]{6}$/);
    }
  });

  it("never includes 0, O, 1, I, or L", () => {
    for (let i = 0; i < 50; i++) {
      const ref = generateReference();
      expect(ref).not.toMatch(/[01OIL]/);
    }
  });
});

describe("isRequestableUnit", () => {
  it("returns true for per_person, per_group, per_flight", () => {
    expect(isRequestableUnit("per_person")).toBe(true);
    expect(isRequestableUnit("per_group")).toBe(true);
    expect(isRequestableUnit("per_flight")).toBe(true);
  });

  it("returns false for per_hour, other, null, undefined", () => {
    expect(isRequestableUnit("per_hour")).toBe(false);
    expect(isRequestableUnit("other")).toBe(false);
    expect(isRequestableUnit(null)).toBe(false);
    expect(isRequestableUnit(undefined)).toBe(false);
  });
});

describe("todayInTimeZone", () => {
  it("returns a date in YYYY-MM-DD format", () => {
    const today = todayInTimeZone("Asia/Kathmandu");
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("maxRequestDate", () => {
  it("returns a date 1 year from the given date", () => {
    expect(maxRequestDate("2026-11-25")).toBe("2027-11-25");
    expect(maxRequestDate("2024-02-29")).toBe("2025-02-28"); // non-leap
  });
});

describe("normalizePhone", () => {
  it("removes spaces, dashes, and brackets", () => {
    expect(normalizePhone("+977 980-000 0000")).toBe("+9779800000000");
    expect(normalizePhone("(01) 555-1234")).toBe("015551234");
  });
});

describe("isValidPhone", () => {
  it("accepts valid phone numbers", () => {
    expect(isValidPhone("+9779800000000")).toBe(true);
    expect(isValidPhone("9800000000")).toBe(true);
    expect(isValidPhone("+1 234 567 8901")).toBe(true);
  });

  it("rejects invalid phone numbers", () => {
    expect(isValidPhone("123")).toBe(false); // too few digits
    expect(isValidPhone("abcdefghij")).toBe(false); // letters
    expect(isValidPhone("")).toBe(false);
  });
});

describe("isValidEmail", () => {
  it("accepts valid emails", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("a@b.co")).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(isValidEmail("")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
    expect(isValidEmail("user")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
    expect(isValidEmail("a".repeat(255))).toBe(false);
  });
});

describe("validateBookingForm", () => {
  const validData = {
    customerName: "John Doe",
    contactType: "phone" as const,
    contactValue: "+9779800000000",
    requestedDate: "2026-12-01",
    participantCount: 3,
  };

  it("returns no errors for valid data", () => {
    const errors = validateBookingForm(validData, "2026-11-25");
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it("returns errors for empty fields", () => {
    const errors = validateBookingForm(
      {
        customerName: "",
        contactType: "email",
        contactValue: "",
        requestedDate: "",
        participantCount: 0,
      },
      "2026-11-25"
    );
    expect(errors.customerName).toBeDefined();
    expect(errors.contactValue).toBeDefined();
    expect(errors.requestedDate).toBeDefined();
    expect(errors.participantCount).toBeDefined();
  });

  it("validates name length bounds", () => {
    expect(
      validateBookingForm({ ...validData, customerName: "A" }, "2026-11-25")
        .customerName
    ).toBeDefined();
    expect(
      validateBookingForm(
        { ...validData, customerName: "A".repeat(101) },
        "2026-11-25"
      ).customerName
    ).toBeDefined();
  });

  it("rejects past dates and dates more than 12 months ahead", () => {
    expect(
      validateBookingForm(
        { ...validData, requestedDate: "2026-11-24" },
        "2026-11-25"
      ).requestedDate
    ).toBeDefined();
    expect(
      validateBookingForm(
        { ...validData, requestedDate: "2027-11-26" },
        "2026-11-25"
      ).requestedDate
    ).toBeDefined();
  });

  it("rejects participants outside 1–20", () => {
    expect(
      validateBookingForm({ ...validData, participantCount: 21 }, "2026-11-25")
        .participantCount
    ).toBeDefined();
    expect(
      validateBookingForm({ ...validData, participantCount: 0 }, "2026-11-25")
        .participantCount
    ).toBeDefined();
  });
});

describe("validateInterestForm", () => {
  const validData = {
    customerName: "Jane Doe",
    contactType: "email" as const,
    contactValue: "jane@example.com",
    participantCount: 2,
  };

  it("returns no errors for valid data", () => {
    expect(Object.keys(validateInterestForm(validData))).toHaveLength(0);
  });

  it("validates name, contact and group size without a date", () => {
    const errors = validateInterestForm({
      customerName: "A",
      contactType: "phone",
      contactValue: "123",
      participantCount: 21,
    });
    expect(errors.customerName).toBeDefined();
    expect(errors.contactValue).toBeDefined();
    expect(errors.participantCount).toBeDefined();
    expect(errors).not.toHaveProperty("requestedDate");
  });
});

describe("calculateTotal", () => {
  it("multiplies by participants for per_person", () => {
    expect(calculateTotal(8500, "per_person", 3)).toBe(25500);
  });

  it("returns flat price for per_group", () => {
    expect(calculateTotal(1500, "per_group", 4)).toBe(1500);
  });

  it("returns flat price for per_flight", () => {
    expect(calculateTotal(13000, "per_flight", 2)).toBe(13000);
  });
});

describe("hasOfferChanged", () => {
  it("returns false when price, currency, and unit match", () => {
    const a = { price: 8500, currency: "NPR" as const, pricing_unit: "per_person" as const };
    expect(hasOfferChanged(a, a)).toBe(false);
  });

  it("returns true when price changes", () => {
    const sub = { price: 8500, currency: "NPR" as const, pricing_unit: "per_person" as const };
    const cur = { price: 9000, currency: "NPR" as const, pricing_unit: "per_person" as const };
    expect(hasOfferChanged(sub, cur)).toBe(true);
  });

  it("returns true when currency changes", () => {
    const sub = { price: 95, currency: "USD" as const, pricing_unit: "per_person" as const };
    const cur = { price: 95, currency: "NPR" as const, pricing_unit: "per_person" as const };
    expect(hasOfferChanged(sub, cur)).toBe(true);
  });
});

describe("buildOfferSnapshot", () => {
  it("creates a complete snapshot with all fields", () => {
    const offer: AvailableOffer = {
      id: "offer-1",
      activity_id: "act-1",
      provider_id: "prov-1",
      package_name: "Standard Tandem Flight",
      price: 8500,
      currency: "NPR",
      pricing_unit: "per_person",
      duration: "30 minutes",
      inclusions: "Pilot\nHelmet",
      booking_conditions: "Weather dependent",
      verification_status: "verified",
      retrieved_at: "2026-11-10",
      source_domain: "example.com",
      provider: { id: "prov-1", name: "Demo Sunrise", google_rating: 4.7, google_review_count: 312 },
    };

    const snapshot = buildOfferSnapshot({
      activity: { name: "Paragliding at Sarangkot", slug: "paragliding-sarangkot" },
      offer,
      providerName: "Demo Sunrise",
    });

    expect(snapshot.activity_name).toBe("Paragliding at Sarangkot");
    expect(snapshot.activity_slug).toBe("paragliding-sarangkot");
    expect(snapshot.provider_name).toBe("Demo Sunrise");
    expect(snapshot.price).toBe(8500);
    expect(snapshot.currency).toBe("NPR");
    expect(snapshot.pricing_unit).toBe("per_person");
    expect(snapshot.package_name).toBe("Standard Tandem Flight");
  });

  it("falls back to 'Standard package' when package_name is null", () => {
    const offer: AvailableOffer = {
      id: "o-1",
      activity_id: "a-1",
      provider_id: null,
      package_name: null,
      price: 6000,
      currency: "NPR",
      pricing_unit: "per_person",
      duration: null,
      inclusions: null,
      booking_conditions: null,
      verification_status: "unverified",
      retrieved_at: null,
      source_domain: "example.com",
      provider: null,
    };

    const snapshot = buildOfferSnapshot({
      activity: { name: "Zipline", slug: "zipline-sarangkot" },
      offer,
      providerName: null,
    });

    expect(snapshot.package_name).toBe("Standard package");
    expect(snapshot.provider_name).toBeNull();
  });
});
