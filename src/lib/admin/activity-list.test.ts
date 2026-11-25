import { describe, expect, it } from "vitest";

import { activityTabCounts, filterActivities, parseActivityTab } from "./activity-list";

const list = [
  { name: "Paragliding at Sarangkot", slug: "paragliding-sarangkot", category: "paragliding", location: "Sarangkot", is_published: true },
  { name: "Boating on Phewa Lake", slug: "boating-phewa-lake", category: "boating", location: "Lakeside", is_published: true },
  { name: "Bungee Jump", slug: "bungee-hemja", category: "bungee", location: null, is_published: false },
];

describe("parseActivityTab", () => {
  it("accepts known tabs and falls back to all", () => {
    expect(parseActivityTab("live")).toBe("live");
    expect(parseActivityTab("hidden")).toBe("hidden");
    expect(parseActivityTab("nope")).toBe("all");
    expect(parseActivityTab(undefined)).toBe("all");
  });
});

describe("activityTabCounts", () => {
  it("counts all, live and hidden", () => {
    expect(activityTabCounts(list)).toEqual({ all: 3, live: 2, hidden: 1 });
  });
});

describe("filterActivities", () => {
  it("filters by tab", () => {
    expect(filterActivities(list, "live", "").map((a) => a.slug)).toEqual(["paragliding-sarangkot", "boating-phewa-lake"]);
    expect(filterActivities(list, "hidden", "").map((a) => a.slug)).toEqual(["bungee-hemja"]);
  });

  it("searches name, slug, category and location, ignoring case and spaces", () => {
    expect(filterActivities(list, "all", "  LAKESIDE ").map((a) => a.slug)).toEqual(["boating-phewa-lake"]);
    expect(filterActivities(list, "all", "hemja").map((a) => a.slug)).toEqual(["bungee-hemja"]);
    expect(filterActivities(list, "live", "bungee")).toEqual([]);
  });
});
