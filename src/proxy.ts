import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_REALM, isAdminAuthorized } from "@/lib/admin/basic-auth";
import { updateSession } from "@/utils/supabase/middleware";

export async function proxy(request: NextRequest) {
  // /admin is protected by the browser's built-in password prompt (HTTP Basic Auth).
  // There are no user accounts: one shared password from ADMIN_PASSWORD.
  if (request.nextUrl.pathname === "/admin" || request.nextUrl.pathname.startsWith("/admin/")) {
    if (!isAdminAuthorized(request.headers.get("authorization"), process.env.ADMIN_PASSWORD)) {
      const configured = (process.env.ADMIN_PASSWORD ?? "").length >= 8;
      return new NextResponse(
        configured
          ? "Admin password required."
          : "Admin is disabled: set ADMIN_PASSWORD (8+ characters) in .env.local and restart the server.",
        {
          status: configured ? 401 : 503,
          headers: {
            ...(configured && { "WWW-Authenticate": `Basic realm="${ADMIN_REALM}", charset="UTF-8"` }),
            "Cache-Control": "no-store",
            "X-Robots-Tag": "noindex, nofollow",
          },
        },
      );
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    // Skip static files and images.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
