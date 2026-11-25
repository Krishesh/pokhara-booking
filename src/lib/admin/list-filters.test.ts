import { describe, expect, it } from "vitest";

import { displayDomain, filterProviders, outingTabCounts, parseOutingTab } from "./list-filters";

const providers = [
  { name: "Blue Sky Paragliding", website_url: "https://www.bluesky.example", phone: "+977 9841000000", address: "Lakeside" },
  { name: "Lakeside Paddle Co.", website_url: null, phone: null, address: "Phewa" },
];

describe("filterProviders", () => {
  it("returns everything for an empty search", () => {
    expect(filterProviders(providers, "  ")).toHaveLength(2);
  });

  it("matches name, website, phone and address, ignoring case", () => {
    expect(filterProviders(providers, "BLUESKY").map((p) => p.name)).toEqual(["Blue Sky Paragliding"]);
    expect(filterProviders(providers, "9841").map((p) => p.name)).toEqual(["Blue Sky Paragliding"]);
    expect(filterProviders(providers, "lakeside").map((p) => p.name)).toEqual(["Blue Sky Paragliding", "Lakeside Paddle Co."]);
    expect(filterProviders(providers, "zzz")).toEqual([]);
  });
});

describe("displayDomain", () => {
  it("shows the bare host name", () => {
    expect(displayDomain("https://www.bluesky.example/about")).toBe("bluesky.example");
    expect(displayDomain("pokharaclub.com.np")).toBe("pokharaclub.com.np");
  });

  it("returns the input when it isn't a URL", () => {
    expect(displayDomain("not a url")).toBe("not a url");
  });
});

describe("outing tabs", () => {
  it("parses known tabs and falls back to all", () => {
    expect(parseOutingTab("draft")).toBe("draft");
    expect(parseOutingTab("x")).toBe("all");
  });

  it("counts states", () => {
    expect(outingTabCounts(["open", "open", "draft", "cancelled", "past"])).toEqual({
      all: 5,
      open: 2,
      draft: 1,
      cancelled: 1,
      past: 1,
    });
  });
});
