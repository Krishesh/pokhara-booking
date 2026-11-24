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
    <nav aria-label="Admin" className="flex flex-wrap items-center gap-1 border-b pb-3">
      <span className="mr-2 rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
        Admin
      </span>
      {LINKS.map(({ href, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted",
              active ? "bg-muted font-medium text-foreground" : "text-muted-foreground",
            )}
          >
            {label}
            {href === "/admin/requests" && pendingCount > 0 && (
              <span className="ml-1.5 rounded-full bg-destructive/10 px-1.5 text-xs font-medium text-destructive tabular-nums">
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
        className="ml-auto flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
      >
        View site
        <ExternalLink className="size-3.5" aria-hidden="true" />
      </Link>
    </nav>
  );
}
