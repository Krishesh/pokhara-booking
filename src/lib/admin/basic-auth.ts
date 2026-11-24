// Pure HTTP Basic Auth check for /admin. No I/O: used by src/proxy.ts and by every admin
// Server Action / data read (Server Actions can be invoked from any URL, so the proxy alone is not enough).

export const ADMIN_REALM = "Pokhara Booking admin";

/** Constant-time string comparison (length is not secret here; contents are). */
export function safeEqual(a: string, b: string): boolean {
  const length = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < length; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

/** Password from an `Authorization: Basic …` header, or null. The username is ignored. */
export function passwordFromBasicAuth(header: string | null): string | null {
  if (!header) return null;
  const match = /^Basic\s+([A-Za-z0-9+/=]+)\s*$/i.exec(header);
  if (!match) return null;
  let decoded: string;
  try {
    decoded = new TextDecoder().decode(Uint8Array.from(atob(match[1]), (c) => c.charCodeAt(0)));
  } catch {
    return null;
  }
  const colon = decoded.indexOf(":");
  return colon === -1 ? null : decoded.slice(colon + 1);
}

/**
 * True only when ADMIN_PASSWORD is configured (8+ characters) and the header carries it.
 * An unset or short password locks admin completely rather than leaving it open.
 */
export function isAdminAuthorized(header: string | null, adminPassword: string | undefined): boolean {
  if (!adminPassword || adminPassword.length < 8) return false;
  const supplied = passwordFromBasicAuth(header);
  return supplied !== null && safeEqual(supplied, adminPassword);
}
