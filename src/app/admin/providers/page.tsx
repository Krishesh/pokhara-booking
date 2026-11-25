import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus, Star } from "lucide-react";

import { TableSkeleton } from "@/components/admin/table-skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAdminProviders } from "@/lib/admin/data";
import { formatRating } from "@/lib/offer-format";

export const metadata: Metadata = { title: "Providers" };

export default function AdminProvidersPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Providers</h1>
          <p className="text-muted-foreground">
            Companies that run activities. Visitors see the name and Google rating; contact details stay private.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/providers/new" />}>
          <Plus aria-hidden="true" />
          New provider
        </Button>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <ProvidersTable />
      </Suspense>
    </section>
  );
}

async function ProvidersTable() {
  const providers = await listAdminProviders();

  if (providers.length === 0) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-input bg-card/60 p-10 text-center text-muted-foreground">
        No providers yet. Click <strong>New provider</strong> to add one.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-card border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provider</TableHead>
            <TableHead>Google rating</TableHead>
            <TableHead className="hidden md:table-cell">Phone</TableHead>
            <TableHead className="text-right">Offers</TableHead>
            <TableHead className="text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providers.map((p) => {
            const rating = formatRating(p.google_rating, p.google_review_count);
            return (
              <TableRow key={p.id}>
                <TableCell>
                  <Link href={`/admin/providers/${p.id}`} className="font-medium hover:underline">
                    {p.name}
                  </Link>
                  {p.website_url && <div className="text-xs text-muted-foreground">{p.website_url}</div>}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {rating ? (
                    <span className="flex items-center gap-1">
                      <Star className="size-3.5 fill-current" aria-hidden="true" />
                      {rating}
                    </span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">{p.phone ?? "—"}</TableCell>
                <TableCell className="text-right tabular-nums">{p.offer_count}</TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      nativeButton={false} render={<Link href={`/admin/providers/${p.id}`} />}
                      aria-label={`Edit ${p.name}`}
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
  );
}
