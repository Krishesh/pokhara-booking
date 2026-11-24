"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STATUS_LABELS, type RequestStatus } from "@/lib/admin/requests";
import { cn } from "@/lib/utils";

const TABS: (RequestStatus | "all")[] = ["pending", "confirmed", "rejected", "cancelled", "all"];

export function RequestFilters({
  status,
  q,
  counts,
}: {
  status: RequestStatus | "all";
  q: string;
  counts: Record<RequestStatus | "all", number>;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const href = (nextStatus: RequestStatus | "all", nextQ: string) => {
    const params = new URLSearchParams();
    if (nextStatus !== "pending") params.set("status", nextStatus);
    if (nextQ) params.set("q", nextQ);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <div className="space-y-4">
      <nav aria-label="Filter by status" className="flex flex-wrap gap-1">
        {TABS.map((tab) => {
          const active = tab === status;
          return (
            <Link
              key={tab}
              href={href(tab, q)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-muted",
                active ? "border-foreground/20 bg-muted font-medium" : "text-muted-foreground",
              )}
            >
              {tab === "all" ? "All" : STATUS_LABELS[tab]}
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs tabular-nums",
                  tab === "pending" && counts.pending > 0 ? "bg-destructive/10 text-destructive" : "bg-muted-foreground/10",
                )}
              >
                {counts[tab]}
              </span>
            </Link>
          );
        })}
      </nav>

      <form
        role="search"
        className="flex max-w-md gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const value = String(new FormData(e.currentTarget).get("q") ?? "").trim();
          router.push(href(status, value));
        }}
      >
        <label htmlFor="request-search" className="sr-only">
          Search requests
        </label>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="request-search"
            name="q"
            defaultValue={q}
            placeholder="Reference, name, phone or email"
            className="pl-8"
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
        {q && (
          <Button variant="ghost" size="icon" nativeButton={false} render={<Link href={href(status, "")} />} aria-label="Clear search">
            <X aria-hidden="true" />
          </Button>
        )}
      </form>
    </div>
  );
}
