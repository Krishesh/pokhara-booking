import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { CalendarDays, ExternalLink, Footprints, Pencil, Plus } from "lucide-react";

import { ActivityImage } from "@/components/activity-image";
import { FilterTabs } from "@/components/admin/filter-tabs";
import { TableSkeleton } from "@/components/admin/table-skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { outingTabCounts, parseOutingTab, type OutingTab } from "@/lib/admin/list-filters";
import { listAdminOutings } from "@/lib/admin/outings-data";
import { todayInTimeZone } from "@/lib/booking";
import { formatOutingDate, outingState, type OutingState } from "@/lib/outings";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Group outings" };

export default function AdminOutingsPage({ searchParams }: PageProps<"/admin/outings">) {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Group outings</h1>
          <p className="max-w-2xl text-muted-foreground">
            Hikes and trips visitors can register interest in. Interest doesn&apos;t reserve a place; the organizer
            confirms with each person.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/outings/new" />}>
          <Plus aria-hidden="true" />
          Create outing
        </Button>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <OutingsSection searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

const TAB_LABELS: Record<OutingTab, string> = {
  all: "All",
  open: "Published",
  draft: "Drafts",
  cancelled: "Cancelled",
  past: "Took place",
};

const STATE_STYLE: Record<OutingState, { label: string; className: string; dot: string }> = {
  open: { label: "Published", className: "bg-accent text-accent-foreground", dot: "bg-primary" },
  draft: { label: "Draft", className: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
  past: { label: "Took place", className: "bg-mist text-muted-foreground", dot: "bg-muted-foreground/60" },
};

async function OutingsSection({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  const params = await searchParams;
  const tab = parseOutingTab(params.show);
  const today = todayInTimeZone(new Date());
  const all = (await listAdminOutings()).map((o) => ({ ...o, state: outingState(o, today) }));
  const counts = outingTabCounts(all.map((o) => o.state));
  const outings = tab === "all" ? all : all.filter((o) => o.state === tab);

  if (all.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-input bg-card/60 px-6 py-14 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-accent text-primary">
          <Footprints className="size-6" aria-hidden="true" />
        </span>
        <p className="font-semibold">No outings yet</p>
        <p className="max-w-[44ch] text-sm text-muted-foreground">
          Plan a hike or trip. Save it as a draft first, then publish it when the details are ready.
        </p>
        <Button nativeButton={false} render={<Link href="/admin/outings/new" />}>
          <Plus aria-hidden="true" />
          Create outing
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-2.5">
        <FilterTabs
          label="Filter outings"
          active={tab}
          tabs={(Object.keys(TAB_LABELS) as OutingTab[])
            .filter((t) => t === "all" || counts[t] > 0 || t === tab)
            .map((t) => ({
              key: t,
              label: TAB_LABELS[t],
              count: counts[t],
              href: t === "all" ? "/admin/outings" : `/admin/outings?show=${t}`,
            }))}
        />
      </div>

      {outings.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-input bg-card/60 p-10 text-center text-muted-foreground">
          No {TAB_LABELS[tab].toLowerCase()} outings.{" "}
          <Link href="/admin/outings" className="font-semibold text-primary hover:underline">
            Show all
          </Link>
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Outing</TableHead>
                <TableHead className="hidden lg:table-cell">Destination and organizer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Interested</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {outings.map((o) => {
                const style = STATE_STYLE[o.state];
                return (
                  <TableRow key={o.id} className={cn(o.state === "past" && "text-muted-foreground")}>
                    <TableCell className="whitespace-normal">
                      <div className="flex items-center gap-3">
                        <ActivityImage
                          src={o.image_url}
                          alt=""
                          sizes="48px"
                          aspect="none"
                          className={cn("size-12 shrink-0 rounded-lg", o.state === "cancelled" && "grayscale")}
                        />
                        <div className="min-w-0">
                          <Link href={`/admin/outings/${o.id}`} className="font-semibold hover:text-primary hover:underline">
                            {o.title}
                          </Link>
                          <div className="text-xs text-muted-foreground lg:hidden">
                            {o.destination}, {o.organizer_name}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden whitespace-normal lg:table-cell">
                      <span className="text-muted-foreground">{o.destination}</span>
                      <span className="block text-sm font-medium">{o.organizer_name}</span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-sm tabular-nums">
                        <CalendarDays className="size-3.5 text-muted-foreground" aria-hidden="true" />
                        {formatOutingDate(o.outing_date)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", style.className)}>
                        <span className={cn("size-1.5 rounded-full", style.dot)} aria-hidden="true" />
                        {style.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/outings/${o.id}#interested`}
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums transition-colors",
                          o.interest_count > 0 ? "bg-accent text-accent-foreground hover:bg-accent/70" : "bg-mist text-muted-foreground",
                        )}
                      >
                        {o.interest_count === 0
                          ? "None yet"
                          : `${o.interest_count} ${o.interest_count === 1 ? "entry" : "entries"}, ${o.people_count} ${o.people_count === 1 ? "person" : "people"}`}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {o.status !== "draft" && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            nativeButton={false}
                            render={<Link href={`/outings/${o.slug}`} target="_blank" />}
                            aria-label={`View ${o.title} on the website`}
                          >
                            <ExternalLink aria-hidden="true" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          nativeButton={false}
                          render={<Link href={`/admin/outings/${o.id}`} />}
                          aria-label={`Edit ${o.title}`}
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
          <p className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
            Showing {outings.length} of {all.length} {all.length === 1 ? "outing" : "outings"}
          </p>
        </div>
      )}
    </div>
  );
}
