import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { AlertCircle, ChevronRight } from "lucide-react";

import { RequestFilters } from "@/components/admin/request-filters";
import { RequestStatusBadge } from "@/components/admin/request-status-badge";
import { TableSkeleton } from "@/components/admin/table-skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
        <p className="text-muted-foreground">
          Requests from visitors. Check with the provider, contact the customer, then record the outcome.
        </p>
      </div>
      <Suspense fallback={<TableSkeleton />}>
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

  return (
    <div className="space-y-4">
      <RequestFilters status={status} q={q} counts={counts} />

      {requests.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-input bg-card/60 p-10 text-center text-muted-foreground">
          {q
            ? `No requests match “${q}”.`
            : status === "pending"
              ? "No pending requests. You're all caught up."
              : status === "all"
                ? "No booking requests yet."
                : `No ${STATUS_LABELS[status].toLowerCase()} requests.`}
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-card border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Date · people</TableHead>
                <TableHead className="hidden sm:table-cell">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>
                  <span className="sr-only">Open</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => {
                const age = requestAge(r.created_at, r.status, now);
                return (
                  <TableRow key={r.id} className={cn(age.overdue && "bg-sunrise-soft/60")}>
                    <TableCell className="max-w-64 whitespace-normal">
                      <Link href={`/admin/requests/${r.id}`} className="font-semibold tracking-wide text-primary tabular-nums hover:underline">
                        {r.reference}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {r.offer_snapshot.activity.name} · {r.offer_snapshot.vendor}
                      </div>
                    </TableCell>
                    <TableCell>{r.customer_name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatCheckedDate(r.requested_date)} · {r.participant_count}
                    </TableCell>
                    <TableCell className="hidden tabular-nums sm:table-cell">{formatPrice(r.total_price, r.currency)}</TableCell>
                    <TableCell>
                      <RequestStatusBadge status={r.status} />
                    </TableCell>
                    <TableCell>
                      <span className={cn("flex items-center gap-1 text-sm", age.overdue ? "font-medium" : "text-muted-foreground")}>
                        {age.overdue && <AlertCircle className="size-4 text-destructive" aria-label="Waiting over 2 days" />}
                        {age.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/requests/${r.id}`}
                        className="flex justify-end text-muted-foreground hover:text-foreground"
                        aria-label={`Open ${r.reference}`}
                      >
                        <ChevronRight className="size-4" aria-hidden="true" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
