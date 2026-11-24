import { describe, expect, it } from "vitest";

import {
  buildOfferSnapshot,
  calculateTotal,
  generateReference,
  hasOfferChanged,
  isRequestableUnit,
  isValidEmail,
  maxRequestDate,
  normalizePhone,
  REFERENCE_ALPHABET,
  todayInTimeZone,
  validateBookingForm,
  type BookingFormInput,
} from "./booking";

const TODAY = "2026-11-24";
const OFFER_ID = "e0000000-0000-4000-8000-000000000001";

function form(overrides: Partial<BookingFormInput> = {}): BookingFormInput {
  return {
    offerId: OFFER_ID,
    shownPrice: "8500",
    shownCurrency: "NPR",
    shownUnit: "per_person",
    customerName: "Sita Gurung",
    contactType: "phone",
    contactValue: "+977 980-000-0000",
    requestedDate: "2026-12-01",
    participantCount: "2",
    ...overrides,
  };
}

describe("isRequestableUnit / calculateTotal", () => {
  it("multiplies per_person by participants", () => {
    expect(calculateTotal(8500, "per_person", 3)).toBe(25500);
  });

  it("keeps per_group and per_flight flat", () => {
    expect(calculateTotal(1500, "per_group", 4)).toBe(1500);
    expect(calculateTotal(13000, "per_flight", 2)).toBe(13000);
  });

  it("rounds to 2 decimals", () => {
    expect(calculateTotal(0.1, "per_person", 3)).toBe(0.3);
    expect(calculateTotal(95.555, "per_person", 1)).toBe(95.56);
  });

  it("returns null for units that need a quote", () => {
    expect(calculateTotal(1000, "per_hour", 2)).toBeNull();
    expect(calculateTotal(1000, "other", 2)).toBeNull();
    expect(isRequestableUnit(null)).toBe(false);
  });
});

describe("dates", () => {
  it("uses Pokhara time for today", () => {
    // 20:00 UTC on 24 Nov is 01:45 on 25 Nov in Nepal (UTC+5:45).
    expect(todayInTimeZone(new Date("2026-11-24T20:00:00Z"))).toBe("2026-11-25");
    expect(todayInTimeZone(new Date("2026-11-24T10:00:00Z"))).toBe("2026-11-24");
  });

  it("allows up to 12 months ahead, clamping to month end", () => {
    expect(maxRequestDate("2026-11-24")).toBe("2027-11-24");
    expect(maxRequestDate("2027-02-28")).toBe("2028-02-28");
    expect(maxRequestDate("2028-02-29")).toBe("2029-02-28");
  });
});

describe("contact helpers", () => {
  it("normalizes phone numbers", () => {
    expect(normalizePhone("+977 980-000-0000")).toBe("+9779800000000");
    expect(normalizePhone("(061) 123 456")).toBe("061123456");
    expect(normalizePhone("12345")).toBeNull();
    expect(normalizePhone("98000abc00")).toBeNull();
  });

  it("checks email format", () => {
    expect(isValidEmail("sita@example.com")).toBe(true);
    expect(isValidEmail("sita@example")).toBe(false);
    expect(isValidEmail("sita example.com")).toBe(false);
  });
});

describe("validateBookingForm", () => {
  it("accepts a valid phone request and normalizes values", () => {
    const result = validateBookingForm(form({ customerName: "  Sita   Gurung " }), TODAY);
    expect(result).toEqual({
      ok: true,
      data: {
        offerId: OFFER_ID,
        shown: { price: 8500, currency: "NPR", pricing_unit: "per_person" },
        customerName: "Sita Gurung",
        contactType: "phone",
        contactValue: "+9779800000000",
        requestedDate: "2026-12-01",
        participantCount: 2,
      },
    });
  });

  it("accepts a valid email request", () => {
    const result = validateBookingForm(form({ contactType: "email", contactValue: " sita@example.com " }), TODAY);
    expect(result.ok && result.data.contactValue).toBe("sita@example.com");
  });

  it("accepts today and the last allowed day", () => {
    expect(validateBookingForm(form({ requestedDate: TODAY }), TODAY).ok).toBe(true);
    expect(validateBookingForm(form({ requestedDate: "2027-11-24" }), TODAY).ok).toBe(true);
  });

  it("reports each invalid field", () => {
    const result = validateBookingForm(
      form({
        customerName: "S",
        contactType: "email",
        contactValue: "not-an-email",
        requestedDate: "2026-11-23",
        participantCount: "0",
      }),
      TODAY,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.fieldErrors).sort()).toEqual(
        ["contactValue", "customerName", "participantCount", "requestedDate"].sort(),
      );
    }
  });

  it("rejects dates too far ahead or invalid", () => {
    for (const requestedDate of ["2027-11-25", "2026-02-30", "", "tomorrow"]) {
      const result = validateBookingForm(form({ requestedDate }), TODAY);
      expect(result.ok ? null : result.fieldErrors.requestedDate).toBeTruthy();
    }
  });

  it("rejects bad participant counts", () => {
    for (const participantCount of ["21", "1.5", "-1", "", "two"]) {
      const result = validateBookingForm(form({ participantCount }), TODAY);
      expect(result.ok ? null : result.fieldErrors.participantCount).toBeTruthy();
    }
  });

  it("requires a contact type", () => {
    const result = validateBookingForm(form({ contactType: "whatsapp" }), TODAY);
    expect(result.ok ? null : result.fieldErrors.contactType).toBeTruthy();
  });

  it("returns a form error for tampered offer fields", () => {
    for (const bad of [
      { offerId: "not-a-uuid" },
      { shownPrice: "" },
      { shownPrice: "-5" },
      { shownCurrency: "GBP" },
      { shownUnit: "per_day" },
    ]) {
      const result = validateBookingForm(form(bad), TODAY);
      expect(result.ok ? null : result.formError).toBeTruthy();
    }
  });
});

describe("hasOfferChanged", () => {
  const shown = { price: 8500, currency: "NPR", pricing_unit: "per_person" };

  it("is false when nothing changed (including float noise)", () => {
    expect(hasOfferChanged(shown, { ...shown })).toBe(false);
    expect(hasOfferChanged({ ...shown, price: 0.1 + 0.2 }, { ...shown, price: 0.3 })).toBe(false);
  });

  it("detects price, currency or unit changes", () => {
    expect(hasOfferChanged(shown, { ...shown, price: 9000 })).toBe(true);
    expect(hasOfferChanged(shown, { ...shown, currency: "USD" })).toBe(true);
    expect(hasOfferChanged(shown, { ...shown, pricing_unit: "per_group" })).toBe(true);
  });
});

describe("generateReference", () => {
  it("has the PKR- format and only unambiguous characters", () => {
    for (let i = 0; i < 200; i++) {
      const ref = generateReference();
      expect(ref).toMatch(/^PKR-[A-Z0-9]{6}$/);
      expect(ref.slice(4)).not.toMatch(/[01OIL]/);
    }
  });

  it("uses the supplied random source", () => {
    expect(generateReference(() => 0)).toBe(`PKR-${REFERENCE_ALPHABET[0].repeat(6)}`);
  });
});

describe("buildOfferSnapshot", () => {
  const listing = {
    package_name: "Standard tandem flight",
    price: 8500,
    currency: "NPR" as const,
    pricing_unit: "per_person" as const,
    duration: "30 minutes",
    inclusions: "Pilot",
    booking_conditions: null,
    verification_status: "verified",
    retrieved_at: "2026-11-10",
    source_domain: "demo.example.com",
  };
  const activity = { name: "Paragliding", slug: "paragliding" };

  it("copies offer, activity and provider", () => {
    const snap = buildOfferSnapshot(listing, activity, "Demo Co.");
    expect(snap).toMatchObject({ vendor: "Demo Co.", provider_name: "Demo Co.", price: 8500, activity });
  });

  it("falls back to the source domain without a provider", () => {
    expect(buildOfferSnapshot(listing, activity, null).vendor).toBe("Listed on demo.example.com");
  });
});
