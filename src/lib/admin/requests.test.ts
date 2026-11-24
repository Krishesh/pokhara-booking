import { describe, expect, it } from "vitest";

import {
  allowedNextStatuses,
  canTransition,
  contactLinks,
  messageTemplates,
  normalizeRequestSearch,
  offerChanges,
  requestAge,
  validateStatusChange,
} from "./requests";

describe("status transitions", () => {
  it("lets pending go anywhere and confirmed only to cancelled", () => {
    expect(allowedNextStatuses("pending")).toEqual(["confirmed", "rejected", "cancelled"]);
    expect(allowedNextStatuses("confirmed")).toEqual(["cancelled"]);
    expect(canTransition("confirmed", "rejected")).toBe(false);
  });

  it("treats rejected and cancelled as final", () => {
    expect(allowedNextStatuses("rejected")).toEqual([]);
    expect(allowedNextStatuses("cancelled")).toEqual([]);
    expect(canTransition("cancelled", "pending")).toBe(false);
  });
});

describe("validateStatusChange", () => {
  const base = { from: "pending", to: "confirmed", note: "", staffName: "Sita" };

  it("accepts a confirmation without a note", () => {
    expect(validateStatusChange(base)).toEqual({
      ok: true,
      data: { from: "pending", to: "confirmed", note: null, staffName: "Sita" },
    });
  });

  it("requires a reason to reject or cancel", () => {
    const result = validateStatusChange({ ...base, to: "rejected" });
    expect(result.ok ? null : result.fieldErrors.staff_note).toBeTruthy();
    expect(validateStatusChange({ ...base, to: "cancelled", note: "Vendor fully booked" }).ok).toBe(true);
  });

  it("requires a staff name and trims it", () => {
    const missing = validateStatusChange({ ...base, staffName: " " });
    expect(missing.ok ? null : missing.fieldErrors.staff_name).toBeTruthy();
    const trimmed = validateStatusChange({ ...base, staffName: "  Ram   Thapa " });
    expect(trimmed.ok && trimmed.data.staffName).toBe("Ram Thapa");
  });

  it("rejects disallowed or unknown transitions", () => {
    const final = validateStatusChange({ ...base, from: "rejected", to: "confirmed" });
    expect(final.ok ? null : final.fieldErrors.status).toMatch(/can't be changed/);
    const wrong = validateStatusChange({ ...base, from: "confirmed", to: "rejected" });
    expect(wrong.ok ? null : wrong.fieldErrors.status).toMatch(/can't become rejected/);
    const unknown = validateStatusChange({ ...base, to: "maybe" });
    expect(unknown.ok ? null : unknown.fieldErrors.status).toBeTruthy();
  });

  it("returns a form error for a tampered current status", () => {
    const result = validateStatusChange({ ...base, from: "archived" });
    expect(result.ok ? null : result.formError).toBeTruthy();
  });

  it("limits note length", () => {
    const result = validateStatusChange({ ...base, note: "x".repeat(1001) });
    expect(result.ok ? null : result.fieldErrors.staff_note).toBeTruthy();
  });
});

describe("requestAge", () => {
  const now = new Date("2026-11-24T12:00:00Z");

  it("labels age in days", () => {
    expect(requestAge("2026-11-24T08:00:00Z", "pending", now)).toEqual({ label: "Today", overdue: false });
    expect(requestAge("2026-11-23T08:00:00Z", "pending", now)).toEqual({ label: "1 day", overdue: false });
    expect(requestAge("2026-11-19T12:00:00Z", "pending", now).label).toBe("5 days");
  });

  it("flags pending requests older than 48 hours only", () => {
    expect(requestAge("2026-11-22T11:00:00Z", "pending", now).overdue).toBe(true);
    expect(requestAge("2026-11-22T11:00:00Z", "confirmed", now).overdue).toBe(false);
  });
});

describe("contactLinks", () => {
  it("builds call and WhatsApp links for phones", () => {
    expect(contactLinks("phone", "+9779801112222")).toEqual([
      { label: "Call", href: "tel:+9779801112222" },
      { label: "WhatsApp", href: "https://wa.me/9779801112222" },
    ]);
  });

  it("adds Nepal's country code to local mobiles", () => {
    expect(contactLinks("phone", "9801112222")[1]).toEqual({ label: "WhatsApp", href: "https://wa.me/9779801112222" });
  });

  it("only offers a call for landlines without a country code", () => {
    expect(contactLinks("phone", "061123456")).toEqual([{ label: "Call", href: "tel:061123456" }]);
  });

  it("builds a mailto link for email", () => {
    expect(contactLinks("email", "sita@example.com")).toEqual([{ label: "Email", href: "mailto:sita%40example.com" }]);
  });
});

describe("normalizeRequestSearch", () => {
  it("compacts phone-like input", () => {
    expect(normalizeRequestSearch(" 980 111-2222 ")).toBe("9801112222");
    expect(normalizeRequestSearch("+977 980")).toBe("+977980");
  });

  it("keeps references, names and emails, stripping PostgREST syntax", () => {
    expect(normalizeRequestSearch("PKR-7EV5GB")).toBe("PKR-7EV5GB");
    expect(normalizeRequestSearch("sita@example.com")).toBe("sita@example.com");
    expect(normalizeRequestSearch("a,b),or(x")).toBe("aborx");
    expect(normalizeRequestSearch("Sītā Gurung")).toBe("Sītā Gurung");
  });

  it("ignores empty or 1-character queries", () => {
    expect(normalizeRequestSearch("   ")).toBeNull();
    expect(normalizeRequestSearch("a")).toBeNull();
  });
});

describe("offerChanges", () => {
  const snapshot = { price: 8500, currency: "NPR" as const, pricing_unit: "per_person" as const };
  const same = { ...snapshot, verification_status: "verified", activityPublished: true };

  it("is empty when nothing changed", () => {
    expect(offerChanges(snapshot, same)).toEqual([]);
  });

  it("reports price, status, visibility and deletion changes", () => {
    expect(offerChanges(snapshot, { ...same, price: 9000 })[0]).toBe(
      "The price is now NPR 9,000 per person (the customer saw NPR 8,500 per person).",
    );
    expect(offerChanges(snapshot, { ...same, verification_status: "outdated", activityPublished: false })).toEqual([
      "The offer is now marked outdated.",
      "The activity is now hidden from the website.",
    ]);
    expect(offerChanges(snapshot, { ...same, price: null })).toEqual(["The offer no longer has a price."]);
    expect(offerChanges(snapshot, null)).toEqual(["The offer no longer exists."]);
  });
});

describe("messageTemplates", () => {
  const request = {
    reference: "PKR-7EV5GB",
    customer_name: "Sita Gurung",
    requested_date: "2026-12-05",
    participant_count: 3,
    total_price: 25500,
    currency: "NPR" as const,
    staff_note: null,
    offer_snapshot: {
      activity: { name: "Paragliding at Sarangkot", slug: "paragliding-sarangkot" },
      package_name: "Standard tandem flight",
      vendor: "Demo Paragliding Co.",
    },
  };

  it("fills in the request details", () => {
    const confirmed = messageTemplates(request).find((t) => t.key === "confirmed")!.text;
    expect(confirmed).toContain("Namaste Sita");
    expect(confirmed).toContain("PKR-7EV5GB");
    expect(confirmed).toContain("Paragliding at Sarangkot (Standard tandem flight)");
    expect(confirmed).toContain("5 Dec 2026");
    expect(confirmed).toContain("NPR 25,500");
  });

  it("includes the reason when there is a note", () => {
    const rejected = messageTemplates({ ...request, staff_note: "Fully booked that day" }).find(
      (t) => t.key === "rejected",
    )!.text;
    expect(rejected).toContain("Reason: Fully booked that day");
  });

  it("uses singular for one person", () => {
    const received = messageTemplates({ ...request, participant_count: 1 })[0].text;
    expect(received).toContain("for 1 person");
  });
});
