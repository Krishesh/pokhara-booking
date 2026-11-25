import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { CalendarDays, ChevronRight, Clock, Inbox, Users } from "lucide-react";

import { RequestFilters } from "@/components/admin/request-filters";
import { RequestStatusBadge } from "@/components/admin/request-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { isRequestStatus, requestAge, STATUS_LABELS, type RequestStatus } from "@/lib/admin/requests";
import { countRequestsByStatus, listAdminRequests } from "@/lib/admin/requests-data";
import { formatCheckedDate, formatPrice } from "@/lib/offer-format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Booking requests" };

export default function AdminRequestsPage({ searchParams }: PageProps<"/admin/requests">) {
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Booking requests</h1>
        <p className="max-w-2xl text-muted-foreground">
          Requests from visitors. Check the date with the company, contact the customer, then record the outcome.
        </p>
      </div>
      <Suspense fallback={<RequestsSkeleton />}>
        <RequestsSection searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function RequestsSection({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  const params = await searchParams;
  const status: RequestStatus | "all" =
    typeof params.status === "string" && (params.status === "all" || isRequestStatus(params.status))
      ? params.status
      : "pending";
  const q = typeof params.q === "string" ? params.q.slice(0, 80) : "";

  const [requests, counts] = await Promise.all([listAdminRequests({ status, q }), countRequestsByStatus()]);
  const now = new Date();
  const overdue = requests.filter((r) => requestAge(r.created_at, r.status, now).overdue).length;

  return (
    <div className="space-y-4">
      <RequestFilters status={status} q={q} counts={counts} />

      {requests.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-input bg-card/60 px-6 py-14 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-accent text-primary">
            <Inbox className="size-6" aria-hidden="true" />
          </span>
          <p className="font-semibold">
            {q
              ? `No requests match “${q}”`
              : status === "pending"
                ? "No pending requests"
                : status === "all"
                  ? "No booking requests yet"
                  : `No ${STATUS_LABELS[status].toLowerCase()} requests`}
          </p>
          <p className="max-w-[44ch] text-sm text-muted-foreground">
            {status === "pending" && !q
              ? "You're all caught up. New requests from the website will show here."
              : "Try another tab or clear the search."}
          </p>
        </div>
      ) : (
        <>
          <p className="flex flex-wrap items-center justify-between gap-2 px-1 text-sm text-muted-foreground">
            <span>
              {requests.length} {requests.length === 1 ? "request" : "requests"}
              {status === "pending" ? ", oldest first" : ", newest first"}
            </span>
            {overdue > 0 && (
              <span className="flex items-center gap-1.5 font-semibold text-sunrise">
                <Clock className="size-4" aria-hidden="true" />
                {overdue} waiting over 2 days
              </span>
            )}
          </p>
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-3">
            {requests.map((r) => {
              const age = requestAge(r.created_at, r.status, now);
              return (
                <li key={r.id}>
                  <Link
                    href={`/admin/requests/${r.id}`}
                    className={cn(
                      "group grid gap-3 rounded-2xl border bg-card p-4 transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5",
                      age.overdue ? "border-sunrise/40 hover:border-sunrise/70" : "border-border hover:border-primary/40",
                    )}
                  >
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold tracking-wide text-primary tabular-nums">{r.reference}</span>
                        <RequestStatusBadge status={r.status} />
                        <span
                          className={cn(
                            "flex items-center gap-1 text-xs",
                            age.overdue ? "font-semibold text-sunrise" : "text-muted-foreground",
                          )}
                        >
                          <Clock className="size-3.5" aria-hidden="true" />
                          {age.label === "Today" ? "Received today" : `${age.label} ago`}
                        </span>
                      </div>
                      <p className="truncate font-semibold">
                        {r.customer_name}
                        <span className="font-normal text-muted-foreground">, {r.offer_snapshot.activity.name}</span>
                      </p>
                      <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="size-3.5" aria-hidden="true" />
                          For {formatCheckedDate(r.requested_date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="size-3.5" aria-hidden="true" />
                          {r.participant_count} {r.participant_count === 1 ? "person" : "people"}
                        </span>
                        <span className="truncate">{r.offer_snapshot.vendor}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-t border-border pt-3 sm:justify-end sm:border-0 sm:pt-0">
                      <span className="text-base font-bold tabular-nums">{formatPrice(r.total_price, r.currency)}</span>
                      <ChevronRight
                        className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                        aria-hidden="true"
                      />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

function RequestsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading requests">
      <Skeleton className="h-14 rounded-2xl" />
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-28 rounded-2xl" />
      ))}
    </div>
  );
}
