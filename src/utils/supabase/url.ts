/**
 * The project URL as the Supabase client expects it: no trailing slash and no `/rest/v1`.
 * The dashboard shows the REST endpoint ("https://ref.supabase.co/rest/v1/"); pasting that
 * makes every request go to /rest/v1/rest/v1 and fail with "Invalid path specified in request URL".
 */
export function normalizeSupabaseUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  return url.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
}
