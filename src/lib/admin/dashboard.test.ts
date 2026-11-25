import { describe, expect, it } from "vitest";

import { flaggedOffers, offerFlag, pendingSummary, requestsPerDay } from "./dashboard";

const offer = (o: Partial<{ price: number | null; currency: string | null; verification_status: string; retrieved_at: string | null }>) => ({
  price: 100,
  currency: "NPR",
  verification_status: "verified",
  retrieved_at: "2026-11-01",
  ...o,
});

describe("offerFlag", () => {
  it("flags outdated, missing price and unverified offers", () => {
    expect(offerFlag(offer({ verification_status: "outdated" }))).toBe("outdated");
    expect(offerFlag(offer({ price: null }))).toBe("no_price");
    expect(offerFlag(offer({ currency: null }))).toBe("no_price");
    expect(offerFlag(offer({ verification_status: "unverified" }))).toBe("unverified");
  });

  it("returns null for a verified, priced offer", () => {
    expect(offerFlag(offer({}))).toBeNull();
  });
});

describe("flaggedOffers", () => {
  it("sorts no price first, then outdated, then unverified, oldest check first", () => {
    const result = flaggedOffers([
      { id: "u", ...offer({ verification_status: "unverified", retrieved_at: "2026-10-01" }) },
      { id: "ok", ...offer({}) },
      { id: "o", ...offer({ verification_status: "outdated" }) },
      { id: "n2", ...offer({ price: null, retrieved_at: "2026-09-01" }) },
      { id: "n1", ...offer({ price: null, retrieved_at: null }) },
    ]);
    expect(result.map((o) => o.id)).toEqual(["n1", "n2", "o", "u"]);
  });
});

describe("requestsPerDay", () => {
  it("counts requests for each of the last days, including empty days", () => {
    const dayOf = (ts: string) => ts.slice(0, 10);
    const result = requestsPerDay(
      ["2026-11-25T08:00:00Z", "2026-11-25T09:00:00Z", "2026-11-23T10:00:00Z", "2026-11-10T10:00:00Z"],
      "2026-11-25",
      dayOf,
      3,
    );
    expect(result).toEqual([
      { date: "2026-11-23", count: 1 },
      { date: "2026-11-24", count: 0 },
      { date: "2026-11-25", count: 2 },
    ]);
  });
});

describe("pendingSummary", () => {
  const now = new Date("2026-11-25T12:00:00Z");

  it("counts overdue requests and the oldest wait in days", () => {
    expect(
      pendingSummary(
        [{ created_at: "2026-11-25T10:00:00Z" }, { created_at: "2026-11-21T12:00:00Z" }, { created_at: "2026-11-23T11:00:00Z" }],
        now,
      ),
    ).toEqual({ count: 3, overdue: 2, oldestDays: 4 });
  });

  it("handles no pending requests", () => {
    expect(pendingSummary([], now)).toEqual({ count: 0, overdue: 0, oldestDays: null });
  });
});
