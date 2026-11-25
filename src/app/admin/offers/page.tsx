import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Eye, EyeOff, Pencil, Plus, Tags, X } from "lucide-react";

import { OfferFilters } from "@/components/admin/offer-filters";
import { OfferStatusActions } from "@/components/admin/offer-status-actions";
import { TableSkeleton } from "@/components/admin/table-skeleton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOfferFormOptions, listAdminOffers } from "@/lib/admin/data";
import { isUuid, offerVisibility, VERIFICATION_STATUSES } from "@/lib/admin/validation";
import { formatCheckedDate, formatPrice, formatPricingUnit } from "@/lib/offer-format";
import type { VerificationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Offers" };

export default function AdminOffersPage({ searchParams }: PageProps<"/admin/offers">) {
  return (
    <section className="space-y-6">
      <Suspense fallback={<OffersSkeleton />}>
        <OffersSection searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

const STATUS_STYLE: Record<VerificationStatus, { label: string; className: string }> = {
  verified: { label: "Verified", className: "bg-accent text-accent-foreground" },
  unverified: { label: "Unverified", className: "bg-sunrise-soft text-sunrise" },
  outdated: { label: "Outdated", className: "bg-muted text-muted-foreground" },
};

type StatusTab = VerificationStatus | "";

async function OffersSection({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  const params = await searchParams;
  const activityParam = typeof params.activity === "string" && isUuid(params.activity) ? params.activity : "";
  const statusParam: StatusTab =
    typeof params.status === "string" && (VERIFICATION_STATUSES as readonly string[]).includes(params.status)
      ? (params.status as VerificationStatus)
      : "";

  const [{ activities }, all] = await Promise.all([getOfferFormOptions(), listAdminOffers({})]);

  const withVisibility = all.map((o) => ({
    ...o,
    visibility: offerVisibility({
      price: o.price,
      currency: o.currency,
      verification_status: o.verification_status,
      activityPublished: Boolean(o.activity?.is_published),
    }),
  }));
  const visibleCount = withVisibility.filter((o) => o.visibility.visible).length;
  const inActivity = activityParam ? withVisibility.filter((o) => o.activity_id === activityParam) : withVisibility;
  const offers = statusParam ? inActivity.filter((o) => o.verification_status === statusParam) : inActivity;
  const statusCounts: Record<StatusTab, number> = {
    "": inActivity.length,
    verified: inActivity.filter((o) => o.verification_status === "verified").length,
    unverified: inActivity.filter((o) => o.verification_status === "unverified").length,
    outdated: inActivity.filter((o) => o.verification_status === "outdated").length,
  };
  const activityName = activities.find((a) => a.id === activityParam)?.name;

  const href = (status: StatusTab, activity = activityParam) => {
    const p = new URLSearchParams();
    if (activity) p.set("activity", activity);
    if (status) p.set("status", status);
    const qs = p.toString();
    return qs ? `/admin/offers?${qs}` : "/admin/offers";
  };

  return (
    <>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Offers</h1>
          <p className="max-w-2xl text-muted-foreground">
            Prices from local companies. An offer shows on the website when it has a price, isn&apos;t outdated, and its
            activity is live.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-border bg-card px-4 py-2">
            <p className="text-xs text-muted-foreground">On the website</p>
            <p className="text-sm font-semibold">
              <span className="text-primary tabular-nums">{visibleCount}</span> of {all.length} offers
            </p>
          </div>
          <Button nativeButton={false} render={<Link href="/admin/offers/new" />}>
            <Plus aria-hidden="true" />
            Add offer
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-2.5 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filter by status" className="flex flex-wrap gap-1">
          {(["", "verified", "unverified", "outdated"] as StatusTab[]).map((s) => {
            const active = s === statusParam;
            return (
              <Link
                key={s || "all"}
                href={href(s)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-mist hover:text-foreground",
                )}
              >
                {s ? STATUS_STYLE[s].label : "All"}
                <span
                  className={cn("rounded-full px-1.5 text-xs tabular-nums", active ? "bg-white/20" : "bg-muted text-muted-foreground")}
                >
                  {statusCounts[s]}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2 px-1.5 lg:px-0">
          <OfferFilters activities={activities} activityId={activityParam} status={statusParam} />
          {(activityParam || statusParam) && (
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/admin/offers" />}>
              <X aria-hidden="true" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {all.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-input bg-card/60 px-6 py-14 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-accent text-primary">
            <Tags className="size-6" aria-hidden="true" />
          </span>
          <p className="font-semibold">No offers yet</p>
          <p className="max-w-[44ch] text-sm text-muted-foreground">
            Add a price from a local company to an activity. Visitors can request it once it has a price.
          </p>
          <Button nativeButton={false} render={<Link href="/admin/offers/new" />}>
            <Plus aria-hidden="true" />
            Add offer
          </Button>
        </div>
      ) : offers.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-input bg-card/60 p-10 text-center text-muted-foreground">
          No {statusParam ? `${STATUS_STYLE[statusParam].label.toLowerCase()} ` : ""}offers
          {activityName ? ` for ${activityName}` : ""}.{" "}
          <Link href="/admin/offers" className="font-semibold text-primary hover:underline">
            Show all offers
          </Link>
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <h2 className="font-semibold">{activityName ?? "All activities"}</h2>
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground tabular-nums">
              {offers.length} {offers.length === 1 ? "offer" : "offers"}
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Offer</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">On website</TableHead>
                <TableHead className="hidden lg:table-cell">Price checked</TableHead>
                <TableHead className="text-right">Quick actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((o) => {
                const label = o.package_name ?? "Untitled offer";
                const unit = formatPricingUnit(o.pricing_unit);
                const status = STATUS_STYLE[o.verification_status];
                return (
                  <TableRow key={o.id} className={cn(!o.visibility.visible && "bg-mist/60")}>
                    <TableCell className="max-w-80 whitespace-normal">
                      <Link href={`/admin/offers/${o.id}`} className="font-semibold hover:text-primary hover:underline">
                        {label}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {o.activity?.name ?? "Unknown activity"}, {o.provider?.name ?? `listed on ${o.source_domain}`}
                      </div>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {o.price !== null && o.currency ? (
                        <>
                          <span className="font-semibold">{formatPrice(o.price, o.currency)}</span>
                          {unit && <span className="text-xs text-muted-foreground"> {unit}</span>}
                        </>
                      ) : (
                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                          No price
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", status.className)}>
                        {status.label}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span
                        className={cn(
                          "flex items-center gap-1.5 text-sm",
                          o.visibility.visible ? "font-medium text-primary" : "text-muted-foreground",
                        )}
                      >
                        {o.visibility.visible ? (
                          <Eye className="size-4" aria-hidden="true" />
                        ) : (
                          <EyeOff className="size-4" aria-hidden="true" />
                        )}
                        {o.visibility.reason}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground tabular-nums lg:table-cell">
                      {formatCheckedDate(o.retrieved_at) ?? "Never"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <OfferStatusActions id={o.id} label={label} status={o.verification_status} />
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          nativeButton={false}
                          render={<Link href={`/admin/offers/${o.id}`} />}
                          aria-label={`Edit ${label}`}
                        >
                          <Pencil aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

function OffersSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading offers">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="h-14 rounded-2xl" />
      <TableSkeleton />
    </div>
  );
}
