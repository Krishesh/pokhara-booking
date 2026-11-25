import "server-only";

import { createClient } from "@supabase/supabase-js";

import { normalizeSupabaseUrl } from "./url";

/**
 * Supabase client with the service-role key. Bypasses Row Level Security.
 * Server-only: importing this from a Client Component fails the build.
 * Use only in Server Actions / Server Components that validate their input first.
 */
export function createAdminClient() {
  const url = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      !url
        ? "NEXT_PUBLIC_SUPABASE_URL is empty in .env.local."
        : "SUPABASE_SERVICE_ROLE_KEY is empty in .env.local. Copy the secret (service_role) key from Supabase → Settings → API Keys, then restart npm run dev.",
    );
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
