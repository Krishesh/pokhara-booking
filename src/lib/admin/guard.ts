import "server-only";

import { headers } from "next/headers";

import { createAdminClient } from "@/utils/supabase/admin";
import { isAdminAuthorized } from "./basic-auth";

export class AdminUnauthorizedError extends Error {
  constructor() {
    super("Admin access denied");
    this.name = "AdminUnauthorizedError";
  }
}

/**
 * Checks the admin password on the current request, then returns a service-role Supabase client.
 * Call this at the top of every admin Server Action and admin data read: Server Actions can be
 * POSTed to any URL, so the /admin proxy check alone does not protect them.
 */
export async function requireAdmin() {
  const authorization = (await headers()).get("authorization");
  if (!isAdminAuthorized(authorization, process.env.ADMIN_PASSWORD)) {
    throw new AdminUnauthorizedError();
  }
  return createAdminClient();
}
