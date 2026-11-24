import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client with the service-role key. Bypasses Row Level Security.
 * Server-only: importing this from a Client Component fails the build.
 * Use only in Server Actions / Server Components that validate their input first.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
