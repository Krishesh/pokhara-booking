import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Eye, EyeOff, Pencil, Plus } from "lucide-react";

import { OfferFilters } from "@/components/admin/offer-filters";
import { OfferStatusActions } from "@/components/admin/offer-status-actions";
import { TableSkeleton } from "@/components/admin/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getOfferFormOptions, listAdminOffers } from "@/lib/admin/data";
import { isUuid, offerVisibility, VERIFICATION_STATUSES } from "@/lib/admin/validation";
import { formatCheckedDate, formatPrice, formatPricingUnit } from "@/lib/offer-format";
import type { VerificationStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Offers" };

export default function AdminOffersPage({ searchParams }: PageProps<"/admin/offers">) {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Offers</h1>
          <p className="text-muted-foreground">
            Prices from providers. An offer shows on the website when it has a price, isn&apos;t outdated, and its
            activity is live.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/offers/new" />}>
          <Plus aria-hidden="true" />
          New offer
        </Button>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <OffersSection searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

const STATUS_BADGE: Record<VerificationStatus, { label: string; variant: "default" | "outline" | "secondary" }> = {
  verified: { label: "Verified", variant: "default" },
  unverified: { label: "Unverified", variant: "outline" },
  outdated: { label: "Outdated", variant: "secondary" },
};

async function OffersSection({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const activityParam = typeof params.activity === "string" && isUuid(params.activity) ? params.activity : "";
  const statusParam =
    typeof params.status === "string" && (VERIFICATION_STATUSES as readonly string[]).includes(params.status)
      ? params.status
      : "";

  const [{ activities }, offers] = await Promise.all([
    getOfferFormOptions(),
    listAdminOffers({ activityId: activityParam || undefined, status: statusParam || undefined }),
  ]);
  const filtered = Boolean(activityParam || statusParam);

  return (
    <div className="space-y-4">
      <OfferFilters activities={activities} activityId={activityParam} status={statusParam} />

      {offers.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          {filtered ? "No offers match these filters." : "No offers yet. Click New offer to add the first price."}
        </p>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Offer</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">On website</TableHead>
                <TableHead className="hidden lg:table-cell">Price checked</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((o) => {
                const label = o.package_name ?? "Untitled offer";
                const unit = formatPricingUnit(o.pricing_unit);
                const visibility = offerVisibility({
                  price: o.price,
                  currency: o.currency,
                  verification_status: o.verification_status,
                  activityPublished: Boolean(o.activity?.is_published),
                });
                const badge = STATUS_BADGE[o.verification_status];
                return (
                  <TableRow key={o.id}>
                    <TableCell className="max-w-72 whitespace-normal">
                      <Link href={`/admin/offers/${o.id}`} className="font-medium hover:underline">
                        {label}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {o.activity?.name ?? "Unknown activity"} · {o.provider?.name ?? `Listed on ${o.source_domain}`}
                      </div>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {o.price !== null && o.currency ? (
                        <>
                          <span className="font-medium">{formatPrice(o.price, o.currency)}</span>
                          {unit && <div className="text-xs text-muted-foreground">{unit}</div>}
                        </>
                      ) : (
                        <span className="text-muted-foreground">No price</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span
                        className={
                          visibility.visible
                            ? "flex items-center gap-1 text-sm"
                            : "flex items-center gap-1 text-sm text-muted-foreground"
                        }
                      >
                        {visibility.visible ? (
                          <Eye className="size-4" aria-hidden="true" />
                        ) : (
                          <EyeOff className="size-4" aria-hidden="true" />
                        )}
                        {visibility.reason}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {formatCheckedDate(o.retrieved_at) ?? "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <OfferStatusActions id={o.id} label={label} status={o.verification_status} />
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          nativeButton={false} render={<Link href={`/admin/offers/${o.id}`} />}
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
    </div>
  );
}
