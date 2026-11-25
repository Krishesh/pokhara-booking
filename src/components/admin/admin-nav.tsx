"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "lucide-react";

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
      className="flex items-center gap-1 overflow-x-auto rounded-2xl bg-card p-1.5 border border-border"
    >
      <span className="mr-1 hidden shrink-0 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white sm:block">
        Staff admin
      </span>
      {LINKS.map(({ href, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center rounded-xl px-3.5 py-2 text-sm font-medium transition-colors hover:bg-mist focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              active ? "bg-muted font-semibold text-foreground" : "text-muted-foreground",
            )}
          >
            {label}
            {href === "/admin/requests" && pendingCount > 0 && (
              <span className="ml-2 rounded-full bg-sunrise-soft px-2 py-0.5 text-xs font-bold text-sunrise tabular-nums">
                <span className="sr-only">, pending: </span>
                {pendingCount}
              </span>
            )}
          </Link>
        );
      })}
      <Link
        href="/"
        target="_blank"
        className="ml-auto flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium text-primary hover:bg-mist focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        View site
        <ExternalLink className="size-3.5" aria-hidden="true" />
      </Link>
    </nav>
  );
}
