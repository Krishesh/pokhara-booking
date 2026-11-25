import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { AlertCircle, ArrowRight, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminOverview } from "@/lib/admin/data";
import { requestAge } from "@/lib/admin/requests";
import { listAdminRequests } from "@/lib/admin/requests-data";
import { formatCheckedDate, formatPrice } from "@/lib/offer-format";
import { cn } from "@/lib/utils";

export default function AdminOverviewPage() {
  return (
    <section className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Overview</h1>
        <p className="text-muted-foreground">What visitors see, what needs checking, and who is waiting for a reply.</p>
      </div>
      <Suspense fallback={<OverviewSkeleton />}>
        <OverviewFigures />
      </Suspense>
      <Suspense fallback={<Skeleton className="h-72 rounded-3xl" />}>
        <PendingTriage />
      </Suspense>
    </section>
  );
}

async function OverviewFigures() {
  const o = await getAdminOverview();
  const offerIssues = [
    { count: o.offers.unverified, label: "unverified" },
    { count: o.offers.outdated, label: "outdated" },
    { count: o.offers.unpriced, label: "without price" },
  ];

  const figures = [
    {
      href: "/admin/requests",
      title: "Pending requests",
      value: String(o.pendingRequests),
      detail: o.pendingRequests > 0 ? "waiting for a reply" : "all caught up",
      urgent: o.pendingRequests > 0,
    },
    {
      href: "/admin/activities",
      title: "Activities",
      value: `${o.activities.published} of ${o.activities.total}`,
      detail: "published",
    },
    {
      href: "/admin/offers",
      title: "Offers",
      value: String(o.offers.total),
      detail: offerIssues.filter((i) => i.count > 0).map((i) => `${i.count} ${i.label}`).join(", ") || "all verified",
      warn: offerIssues.some((i) => i.count > 0),
    },
    {
      href: "/admin/providers",
      title: "Providers",
      value: String(o.providers),
      detail: "local companies",
    },
  ];

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {figures.map(({ href, title, value, detail, urgent, warn }) => (
        <li key={title}>
          <Link
            href={href}
            className={cn(
              "group flex h-full flex-col gap-6 rounded-3xl p-6 border transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              urgent
                ? "bg-ink border-ink text-white hover:bg-ink/90"
                : "bg-card border-border hover:bg-white hover:border-primary/40",
            )}
          >
            <span className="flex items-center justify-between text-[15px] font-semibold">
              {title}
              <ArrowRight
                className={cn("size-4 transition-transform group-hover:translate-x-0.5", urgent ? "text-mist" : "text-primary")}
                aria-hidden="true"
              />
            </span>
            <span className="mt-auto space-y-1">
              <span className="block text-5xl font-extrabold tracking-tight tabular-nums">{value}</span>
              <span
                className={cn(
                  "block text-sm",
                  urgent ? "text-mist/80" : warn ? "font-medium text-sunrise" : "text-muted-foreground",
                )}
              >
                {detail}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

async function PendingTriage() {
  await connection();
  const requests = (await listAdminRequests({ status: "pending" })).slice(0, 5);
  const now = new Date();

  return (
    <section aria-labelledby="triage-heading" className="rounded-3xl bg-card p-6 border border-border sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <div>
          <h2 id="triage-heading" className="text-xl font-bold tracking-tight">
            Oldest pending requests
          </h2>
          <p className="text-sm text-muted-foreground">Reply to these first. Over 2 days old is marked.</p>
        </div>
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/admin/requests" />}>
          All requests
        </Button>
      </div>

      {requests.length === 0 ? (
        <p className="rounded-2xl bg-mist p-8 text-center text-muted-foreground">No pending requests. You&apos;re all caught up.</p>
      ) : (
        <ul className="grid gap-2">
          {requests.map((r) => {
            const age = requestAge(r.created_at, r.status, now);
            return (
              <li key={r.id}>
                <Link
                  href={`/admin/requests/${r.id}`}
                  className={cn(
                    "group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 rounded-2xl p-4 transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:grid-cols-[9rem_1fr_auto_auto]",
                    age.overdue ? "bg-sunrise-soft hover:bg-sunrise-soft/70" : "bg-mist hover:bg-muted",
                  )}
                >
                  <span className="font-semibold tracking-wide text-primary tabular-nums">{r.reference}</span>
                  <span className="order-3 col-span-2 min-w-0 sm:order-none sm:col-span-1">
                    <span className="block truncate font-semibold">
                      {r.customer_name}, {r.offer_snapshot.activity.name}
                    </span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {formatCheckedDate(r.requested_date)}, {r.participant_count}{" "}
                      {r.participant_count === 1 ? "person" : "people"}, {formatPrice(r.total_price, r.currency)}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "flex items-center gap-1 text-sm",
                      age.overdue ? "font-semibold text-sunrise" : "text-muted-foreground",
                    )}
                  >
                    {age.overdue && <AlertCircle className="size-4" aria-label="Waiting over 2 days" />}
                    {age.label}
                  </span>
                  <ChevronRight className="hidden size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 sm:block" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function OverviewSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Loading overview">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-44 rounded-3xl" />
      ))}
    </div>
  );
}
