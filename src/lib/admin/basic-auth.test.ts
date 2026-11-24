import { describe, expect, it } from "vitest";

import { isAdminAuthorized, passwordFromBasicAuth, safeEqual } from "./basic-auth";

const basic = (user: string, pass: string) => `Basic ${btoa(`${user}:${pass}`)}`;

describe("safeEqual", () => {
  it("compares strings", () => {
    expect(safeEqual("secret-pass", "secret-pass")).toBe(true);
    expect(safeEqual("secret-pass", "secret-pasS")).toBe(false);
    expect(safeEqual("short", "shorter")).toBe(false);
    expect(safeEqual("", "")).toBe(true);
  });
});

describe("passwordFromBasicAuth", () => {
  it("extracts the password and ignores the username", () => {
    expect(passwordFromBasicAuth(basic("staff", "pw:with:colons"))).toBe("pw:with:colons");
    expect(passwordFromBasicAuth(basic("", "only-password"))).toBe("only-password");
  });

  it("handles UTF-8 passwords", () => {
    const header = `Basic ${Buffer.from("admin:पोखरा-2026").toString("base64")}`;
    expect(passwordFromBasicAuth(header)).toBe("पोखरा-2026");
  });

  it("rejects missing or malformed headers", () => {
    expect(passwordFromBasicAuth(null)).toBeNull();
    expect(passwordFromBasicAuth("Bearer abc")).toBeNull();
    expect(passwordFromBasicAuth("Basic !!!")).toBeNull();
    expect(passwordFromBasicAuth(`Basic ${btoa("no-colon")}`)).toBeNull();
  });
});

describe("isAdminAuthorized", () => {
  const password = "correct-horse-battery";

  it("accepts the right password", () => {
    expect(isAdminAuthorized(basic("admin", password), password)).toBe(true);
  });

  it("rejects a wrong or missing password", () => {
    expect(isAdminAuthorized(basic("admin", "wrong-password"), password)).toBe(false);
    expect(isAdminAuthorized(null, password)).toBe(false);
  });

  it("locks admin when ADMIN_PASSWORD is unset or too short", () => {
    expect(isAdminAuthorized(basic("admin", ""), undefined)).toBe(false);
    expect(isAdminAuthorized(basic("admin", "short"), "short")).toBe(false);
  });
});
