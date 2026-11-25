import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Building2, Pencil, Phone, Plus, Search, Star, X } from "lucide-react";

import { TableSkeleton } from "@/components/admin/table-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAdminProviders } from "@/lib/admin/data";
import { displayDomain, filterProviders } from "@/lib/admin/list-filters";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Providers" };

export default function AdminProvidersPage({ searchParams }: PageProps<"/admin/providers">) {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Providers</h1>
          <p className="max-w-2xl text-muted-foreground">
            Local companies that run activities. Visitors see the name and Google rating; phone, address and notes stay
            private.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/providers/new" />}>
          <Plus aria-hidden="true" />
          Add provider
        </Button>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <ProvidersSection searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function ProvidersSection({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.slice(0, 80) : "";
  const all = await listAdminProviders();
  const providers = filterProviders(all, q);

  if (all.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-input bg-card/60 px-6 py-14 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-accent text-primary">
          <Building2 className="size-6" aria-hidden="true" />
        </span>
        <p className="font-semibold">No providers yet</p>
        <p className="max-w-[44ch] text-sm text-muted-foreground">
          Add the local companies you work with, then link their prices to activities as offers.
        </p>
        <Button nativeButton={false} render={<Link href="/admin/providers/new" />}>
          <Plus aria-hidden="true" />
          Add provider
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="size-5 text-primary" aria-hidden="true" />
          <h2 className="font-semibold">Local companies</h2>
          <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground tabular-nums">
            {all.length}
          </span>
        </div>
        <form role="search" action="/admin/providers" className="flex gap-2 sm:w-80">
          <label htmlFor="provider-search" className="sr-only">
            Search providers
          </label>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id="provider-search"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Name, website, phone or address"
              className="h-10 pl-9"
            />
          </div>
          {q && (
            <Button variant="ghost" size="icon" nativeButton={false} render={<Link href="/admin/providers" />} aria-label="Clear search">
              <X aria-hidden="true" />
            </Button>
          )}
        </form>
      </div>

      {providers.length === 0 ? (
        <p className="p-10 text-center text-muted-foreground">
          No providers match “{q}”.{" "}
          <Link href="/admin/providers" className="font-semibold text-primary hover:underline">
            Show all
          </Link>
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name and website</TableHead>
              <TableHead>Google rating</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead>Offers</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="whitespace-normal">
                  <Link href={`/admin/providers/${p.id}`} className="font-semibold hover:text-primary hover:underline">
                    {p.name}
                  </Link>
                  {p.website_url && /^https?:\/\//i.test(p.website_url) && (
                    <a
                      href={p.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-fit text-xs text-primary hover:underline"
                    >
                      {displayDomain(p.website_url)}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  )}
                </TableCell>
                <TableCell>
                  {p.google_rating !== null ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sunrise-soft px-2.5 py-1 text-xs font-semibold text-sunrise tabular-nums">
                      <Star className="size-3.5 fill-current" aria-hidden="true" />
                      {p.google_rating.toFixed(1)}
                      {p.google_review_count !== null && (
                        <span className="font-medium">({p.google_review_count.toLocaleString("en-IN")})</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">No rating</span>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {p.phone ? (
                    <a href={`tel:${p.phone.replace(/\s+/g, "")}`} className="flex items-center gap-1.5 text-sm tabular-nums hover:text-primary">
                      <Phone className="size-3.5 text-muted-foreground" aria-hidden="true" />
                      {p.phone}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
                      p.offer_count > 0 ? "bg-mist" : "bg-sunrise-soft text-sunrise",
                    )}
                  >
                    {p.offer_count === 0 ? "No offers" : `${p.offer_count} ${p.offer_count === 1 ? "offer" : "offers"}`}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/admin/providers/${p.id}`} />}>
                      <Pencil aria-hidden="true" />
                      Edit
                      <span className="sr-only"> {p.name}</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {providers.length > 0 && (
        <p className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
          Showing {providers.length} of {all.length} {all.length === 1 ? "provider" : "providers"}
        </p>
      )}
    </div>
  );
}
