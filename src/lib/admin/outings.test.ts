import { describe, expect, it } from "vitest";

import { contactsText, outingTemplates, validateOuting } from "./outings";

describe("validateOuting", () => {
  const base = {
    title: "Poon Hill sunrise weekend",
    slug: "poon-hill-sunrise-weekend",
    destination: "Ghorepani",
    organizer_name: "Demo Hiking Club",
    status: "published",
  };

  it("accepts a minimal outing with date and cost to be confirmed", () => {
    const result = validateOuting(base);
    expect(result.ok && result.data).toMatchObject({ outing_date: null, cost_info: null, status: "published" });
  });

  it("defaults status to draft", () => {
    const result = validateOuting({ ...base, status: "" });
    expect(result.ok && result.data.status).toBe("draft");
  });

  it("rejects missing fields, bad slug, bad date, non-https image and unknown status", () => {
    const result = validateOuting({
      title: "",
      slug: "Bad Slug",
      destination: "",
      organizer_name: "",
      outing_date: "2026-02-30",
      image_url: "http://x.com/a.jpg",
      status: "archived",
    });
    expect(result.ok ? null : Object.keys(result.fieldErrors).sort()).toEqual(
      ["destination", "image_url", "organizer_name", "outing_date", "slug", "status", "title"].sort(),
    );
  });

  it("drops the photo credit when there is no photo", () => {
    const result = validateOuting({ ...base, image_credit: "Photo: X" });
    expect(result.ok && result.data.image_credit).toBeNull();
  });
});

describe("outingTemplates", () => {
  const outing = {
    title: "Poon Hill sunrise weekend",
    destination: "Ghorepani",
    organizer_name: "Demo Hiking Club",
    outing_date: "2026-12-13",
    meeting_details: "6:30 am, Lakeside bus park",
    cost_info: "Around NPR 6,500 per person",
  };

  it("fills in the outing details", () => {
    const details = outingTemplates(outing).find((t) => t.key === "details")!.text;
    expect(details).toContain("on Sun, 13 Dec 2026");
    expect(details).toContain("Meeting: 6:30 am, Lakeside bus park");
    expect(details).toContain("Cost: Around NPR 6,500 per person");
  });

  it("handles a date to be confirmed", () => {
    const thanks = outingTemplates({ ...outing, outing_date: null, cost_info: null })[0].text;
    expect(thanks).toContain("(date to be confirmed)");
    expect(outingTemplates({ ...outing, cost_info: null })[1].text).toContain("Cost: to be confirmed");
  });
});

describe("contactsText", () => {
  it("lists one contact per line", () => {
    expect(
      contactsText([
        { customer_name: "Hari", contact_value: "+9779801112222" },
        { customer_name: "Sita", contact_value: "sita@example.com" },
      ]),
    ).toBe("Hari: +9779801112222\nSita: sita@example.com");
  });
});
