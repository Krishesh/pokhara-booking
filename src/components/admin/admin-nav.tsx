"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/activities", label: "Activities" },
  { href: "/admin/offers", label: "Offers" },
  { href: "/admin/providers", label: "Providers" },
  { href: "/admin/outings", label: "Outings" },
  { href: "/admin/requests", label: "Requests" },
];

export function AdminNav({ pendingCount }: { pendingCount?: number }) {
  return <AdminNavView pathname={usePathname()} pendingCount={pendingCount} />;
}

/** Nav without the active highlight; used as the Suspense fallback. */
export function AdminNavView({ pathname, pendingCount = 0 }: { pathname: string; pendingCount?: number }) {
  return (
    <nav
      aria-label="Admin"
      className="relative flex items-center gap-1 overflow-x-auto rounded-2xl [scrollbar-width:none] border border-border bg-card p-1.5"
    >
      {LINKS.map(({ href, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center rounded-xl px-3.5 py-2 text-sm font-medium transition-colors hover:bg-mist focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              active ? "bg-primary font-semibold text-primary-foreground hover:bg-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
            {href === "/admin/requests" && pendingCount > 0 && (
              <span
                className={cn(
                  "ml-2 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
                  active ? "bg-white/20 text-white" : "bg-sunrise-soft text-sunrise",
                )}
              >
                <span className="sr-only">, pending: </span>
                {pendingCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
