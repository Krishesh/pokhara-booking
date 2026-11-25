import Link from "next/link";
import { Search, X } from "lucide-react";

import { FilterTabs } from "@/components/admin/filter-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STATUS_LABELS, type RequestStatus } from "@/lib/admin/requests";

const TABS: (RequestStatus | "all")[] = ["pending", "confirmed", "rejected", "cancelled", "all"];

function href(status: RequestStatus | "all", q: string) {
  const params = new URLSearchParams();
  if (status !== "pending") params.set("status", status);
  if (q) params.set("q", q);
  const qs = params.toString();
  return qs ? `/admin/requests?${qs}` : "/admin/requests";
}

/** Status tabs and search for the requests list. Plain links and a GET form, so no client JavaScript. */
export function RequestFilters({
  status,
  q,
  counts,
}: {
  status: RequestStatus | "all";
  q: string;
  counts: Record<RequestStatus | "all", number>;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-2.5 lg:flex-row lg:items-center lg:justify-between">
      <FilterTabs
        label="Filter by status"
        active={status}
        tabs={TABS.map((t) => ({
          key: t,
          label: t === "all" ? "All" : STATUS_LABELS[t],
          count: counts[t],
          href: href(t, q),
        }))}
      />
      <form role="search" action="/admin/requests" className="flex gap-2 lg:w-96">
        {status !== "pending" && <input type="hidden" name="status" value={status} />}
        <label htmlFor="request-search" className="sr-only">
          Search requests
        </label>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="request-search"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Reference, name, phone or email"
            className="h-10 pl-9"
          />
        </div>
        {q && (
          <Button variant="ghost" size="icon" nativeButton={false} render={<Link href={href(status, "")} />} aria-label="Clear search">
            <X aria-hidden="true" />
          </Button>
        )}
      </form>
    </div>
  );
}
