import { describe, expect, it } from "vitest";

import {
  domainFromUrl,
  offerVisibility,
  slugify,
  validateActivity,
  validateOffer,
  validateProvider,
} from "./validation";

const ACTIVITY_ID = "e0000000-0000-4000-8000-000000000001";
const PROVIDER_ID = "d0000000-0000-4000-8000-000000000001";

describe("slugify", () => {
  it("makes URL-safe slugs", () => {
    expect(slugify("Paragliding at Sarangkot")).toBe("paragliding-at-sarangkot");
    expect(slugify("  Boating & Kayaking!! ")).toBe("boating-and-kayaking");
    expect(slugify("Café Hike – Day 2")).toBe("cafe-hike-day-2");
    expect(slugify("!!!")).toBe("");
  });

  it("caps length at 80 without a trailing dash", () => {
    const slug = slugify("a ".repeat(100));
    expect(slug.length).toBeLessThanOrEqual(80);
    expect(slug.endsWith("-")).toBe(false);
  });
});

describe("domainFromUrl", () => {
  it("extracts a lowercase host without www", () => {
    expect(domainFromUrl("https://www.Example.com/path?q=1")).toBe("example.com");
    expect(domainFromUrl("http://demo.example.org")).toBe("demo.example.org");
  });

  it("rejects non-http links", () => {
    expect(domainFromUrl("ftp://example.com")).toBeNull();
    expect(domainFromUrl("example.com")).toBeNull();
    expect(domainFromUrl("javascript:alert(1)")).toBeNull();
  });
});

describe("validateActivity", () => {
  const base = {
    name: "Paragliding at Sarangkot",
    slug: "paragliding-sarangkot",
    category: "Paragliding",
    location: "Sarangkot",
    image_url: "https://images.example.com/p.jpg",
    description: "Fly.",
    is_published: "on",
  };

  it("accepts valid input and normalizes category", () => {
    const result = validateActivity(base);
    expect(result.ok && result.data).toMatchObject({ category: "paragliding", is_published: true });
  });

  it("treats a missing checkbox as unpublished and blanks as null", () => {
    const result = validateActivity({ ...base, is_published: "", location: " ", image_url: "", description: "" });
    expect(result.ok && result.data).toMatchObject({ is_published: false, location: null, image_url: null, description: null });
  });

  it("rejects bad slugs, missing fields and non-https images", () => {
    const result = validateActivity({ ...base, name: "", slug: "Bad Slug", category: "", image_url: "http://x.com/a.jpg" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.fieldErrors).sort()).toEqual(["category", "image_url", "name", "slug"]);
  });

  it("keeps a photo credit only when there is a photo", () => {
    const withPhoto = validateActivity({ ...base, image_credit: " Photo: Jane, CC BY-SA 4.0 " });
    expect(withPhoto.ok && withPhoto.data.image_credit).toBe("Photo: Jane, CC BY-SA 4.0");
    const noPhoto = validateActivity({ ...base, image_url: "", image_credit: "Photo: Jane" });
    expect(noPhoto.ok && noPhoto.data.image_credit).toBeNull();
  });

  it("rejects javascript: image links", () => {
    const result = validateActivity({ ...base, image_url: "javascript:alert(1)" });
    expect(result.ok ? null : result.fieldErrors.image_url).toBeTruthy();
  });
});

describe("validateProvider", () => {
  it("accepts a minimal provider", () => {
    const result = validateProvider({ name: "Demo Co." });
    expect(result.ok && result.data).toMatchObject({ name: "Demo Co.", google_rating: null, website_url: null });
  });

  it("parses rating and review count", () => {
    const result = validateProvider({ name: "Demo Co.", google_rating: "4.7", google_review_count: "1,520" });
    expect(result.ok && result.data).toMatchObject({ google_rating: 4.7, google_review_count: 1520 });
  });

  it("rejects out-of-range or malformed numbers", () => {
    for (const google_rating of ["5.1", "-1", "4.75", "four"]) {
      const result = validateProvider({ name: "Demo Co.", google_rating });
      expect(result.ok ? null : result.fieldErrors.google_rating).toBeTruthy();
    }
    const count = validateProvider({ name: "Demo Co.", google_rating: "4", google_review_count: "1.5" });
    expect(count.ok ? null : count.fieldErrors.google_review_count).toBeTruthy();
  });

  it("requires a rating when a review count is given", () => {
    const result = validateProvider({ name: "Demo Co.", google_review_count: "10" });
    expect(result.ok ? null : result.fieldErrors.google_rating).toBeTruthy();
  });

  it("rejects bad links and dates", () => {
    const result = validateProvider({ name: "Demo Co.", website_url: "demo.com", google_retrieved_at: "2026-13-01" });
    expect(result.ok ? null : Object.keys(result.fieldErrors).sort()).toEqual(["google_retrieved_at", "website_url"]);
  });
});

describe("validateOffer", () => {
  const base = {
    activity_id: ACTIVITY_ID,
    provider_id: PROVIDER_ID,
    package_name: "Standard tandem flight",
    price: "8500",
    currency: "NPR",
    pricing_unit: "per_person",
    source_url: "https://www.demo.example.com/tandem",
    source_domain: "",
    verification_status: "unverified",
    retrieved_at: "2026-11-24",
  };

  it("accepts valid input and fills source domain from the link", () => {
    const result = validateOffer(base);
    expect(result.ok && result.data).toMatchObject({ price: 8500, source_domain: "demo.example.com", provider_id: PROVIDER_ID });
  });

  it("allows no provider and no price (hidden offer)", () => {
    const result = validateOffer({ ...base, provider_id: "", price: "", currency: "", pricing_unit: "" });
    expect(result.ok && result.data).toMatchObject({ provider_id: null, price: null, currency: null, pricing_unit: null });
  });

  it("requires price and currency together", () => {
    const noCurrency = validateOffer({ ...base, currency: "" });
    expect(noCurrency.ok ? null : noCurrency.fieldErrors.currency).toBeTruthy();
    const noPrice = validateOffer({ ...base, price: "" });
    expect(noPrice.ok ? null : noPrice.fieldErrors.price).toBeTruthy();
  });

  it("rejects invalid values", () => {
    const result = validateOffer({
      ...base,
      activity_id: "x",
      price: "-5",
      currency: "GBP",
      pricing_unit: "per_day",
      source_url: "not a url",
      verification_status: "maybe",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.fieldErrors)).toEqual(
        expect.arrayContaining(["activity_id", "price", "currency", "pricing_unit", "source_url", "verification_status"]),
      );
    }
  });

  it("accepts prices with commas and two decimals", () => {
    const result = validateOffer({ ...base, price: "12,48,500.50" });
    expect(result.ok && result.data.price).toBe(1248500.5);
  });
});

describe("offerVisibility", () => {
  const visible = { price: 100, currency: "NPR", verification_status: "verified", activityPublished: true };

  it("explains why an offer is hidden", () => {
    expect(offerVisibility(visible)).toEqual({ visible: true, reason: "Visible on site" });
    expect(offerVisibility({ ...visible, verification_status: "outdated" }).reason).toMatch(/outdated/);
    expect(offerVisibility({ ...visible, price: null }).reason).toMatch(/no price/);
    expect(offerVisibility({ ...visible, activityPublished: false }).reason).toMatch(/not published/);
  });
});
