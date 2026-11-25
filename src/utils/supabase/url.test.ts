import { describe, expect, it } from "vitest";

import { normalizeSupabaseUrl } from "./url";

describe("normalizeSupabaseUrl", () => {
  it("strips a pasted REST endpoint and trailing slashes", () => {
    expect(normalizeSupabaseUrl("https://abc.supabase.co/rest/v1/")).toBe("https://abc.supabase.co");
    expect(normalizeSupabaseUrl("https://abc.supabase.co/rest/v1")).toBe("https://abc.supabase.co");
    expect(normalizeSupabaseUrl("https://abc.supabase.co/")).toBe("https://abc.supabase.co");
  });

  it("leaves a correct URL and missing values alone", () => {
    expect(normalizeSupabaseUrl("https://abc.supabase.co")).toBe("https://abc.supabase.co");
    expect(normalizeSupabaseUrl(undefined)).toBeUndefined();
  });
});
