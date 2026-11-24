import { describe, expect, it } from "vitest";

import { formatOutingDate, isListed, outingState, sortOutings, validateInterestForm } from "./outings";

const TODAY = "2026-11-24";
const OUTING_ID = "f0000000-0000-4000-8000-000000000001";

describe("outingState / isListed", () => {
  it("is open for published outings today or later, or with no date", () => {
    expect(outingState({ status: "published", outing_date: "2026-12-13" }, TODAY)).toBe("open");
    expect(outingState({ status: "published", outing_date: TODAY }, TODAY)).toBe("open");
    expect(outingState({ status: "published", outing_date: null }, TODAY)).toBe("open");
  });

  it("is past after the date, and cancelled or draft by status", () => {
    expect(outingState({ status: "published", outing_date: "2026-11-23" }, TODAY)).toBe("past");
    expect(outingState({ status: "cancelled", outing_date: "2026-12-06" }, TODAY)).toBe("cancelled");
    expect(outingState({ status: "draft", outing_date: null }, TODAY)).toBe("draft");
  });

  it("lists open and upcoming cancelled outings only", () => {
    expect(isListed({ status: "published", outing_date: "2026-12-13" }, TODAY)).toBe(true);
    expect(isListed({ status: "cancelled", outing_date: "2026-12-06" }, TODAY)).toBe(true);
    expect(isListed({ status: "cancelled", outing_date: "2026-11-01" }, TODAY)).toBe(false);
    expect(isListed({ status: "published", outing_date: "2026-11-01" }, TODAY)).toBe(false);
    expect(isListed({ status: "draft", outing_date: "2026-12-13" }, TODAY)).toBe(false);
  });
});

describe("sortOutings", () => {
  it("puts dated outings first, soonest first, then undated by title", () => {
    const sorted = sortOutings([
      { title: "Zeta", outing_date: null },
      { title: "Later", outing_date: "2026-12-20" },
      { title: "Alpha", outing_date: null },
      { title: "Soon", outing_date: "2026-12-01" },
    ]);
    expect(sorted.map((o) => o.title)).toEqual(["Soon", "Later", "Alpha", "Zeta"]);
  });
});

describe("formatOutingDate", () => {
  it("formats dates with the weekday, without shifting the day", () => {
    expect(formatOutingDate("2026-12-13")).toBe("Sun, 13 Dec 2026");
  });

  it("says to be confirmed for missing dates", () => {
    expect(formatOutingDate(null)).toBe("Date to be confirmed");
  });
});

describe("validateInterestForm", () => {
  const base = {
    outingId: OUTING_ID,
    customerName: " Hari  Bahadur ",
    contactType: "phone",
    contactValue: "980-111 2222",
    participantCount: "2",
  };

  it("accepts and normalizes a phone interest", () => {
    expect(validateInterestForm(base)).toEqual({
      ok: true,
      data: { outingId: OUTING_ID, customerName: "Hari Bahadur", contactType: "phone", contactValue: "9801112222", participantCount: 2 },
    });
  });

  it("lowercases emails so duplicates match", () => {
    const result = validateInterestForm({ ...base, contactType: "email", contactValue: "Hari@Example.com" });
    expect(result.ok && result.data.contactValue).toBe("hari@example.com");
  });

  it("defaults an empty head count to 1", () => {
    const result = validateInterestForm({ ...base, participantCount: "" });
    expect(result.ok && result.data.participantCount).toBe(1);
  });

  it("reports invalid fields", () => {
    const result = validateInterestForm({ ...base, customerName: "H", contactValue: "12", participantCount: "25" });
    expect(result.ok ? null : Object.keys(result.fieldErrors).sort()).toEqual(["contactValue", "customerName", "participantCount"]);
  });

  it("returns a form error for a bad outing id", () => {
    const result = validateInterestForm({ ...base, outingId: "nope" });
    expect(result.ok ? null : result.formError).toBeTruthy();
  });
});
