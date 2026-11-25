import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ExternalLink, MapPin, Mountain, Pencil, Plus, Search, X } from "lucide-react";

import { ActivityImage } from "@/components/activity-image";
import { FilterTabs } from "@/components/admin/filter-tabs";
import { PublishSwitch } from "@/components/admin/publish-switch";
import { TableSkeleton } from "@/components/admin/table-skeleton";
import { categoryIcon, sentenceCase } from "@/components/category-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { activityTabCounts, filterActivities, parseActivityTab, type ActivityTab } from "@/lib/admin/activity-list";
import { listAdminActivities } from "@/lib/admin/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Activities" };

export default function AdminActivitiesPage({ searchParams }: PageProps<"/admin/activities">) {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Activities</h1>
          <p className="max-w-2xl text-muted-foreground">
            What visitors can browse. Only activities switched to Live appear on the website, with their offers.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/activities/new" />}>
          <Plus aria-hidden="true" />
          Add activity
        </Button>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <ActivitiesSection searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

const TAB_LABELS: Record<ActivityTab, string> = { all: "All", live: "Live", hidden: "Hidden" };

async function ActivitiesSection({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  const params = await searchParams;
  const tab = parseActivityTab(params.show);
  const q = typeof params.q === "string" ? params.q.slice(0, 80) : "";

  const all = await listAdminActivities();
  const counts = activityTabCounts(all);
  const activities = filterActivities(all, tab, q);

  const href = (nextTab: ActivityTab, nextQ = q) => {
    const p = new URLSearchParams();
    if (nextTab !== "all") p.set("show", nextTab);
    if (nextQ) p.set("q", nextQ);
    const qs = p.toString();
    return qs ? `/admin/activities?${qs}` : "/admin/activities";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-2.5 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          label="Filter activities"
          active={tab}
          tabs={(Object.keys(TAB_LABELS) as ActivityTab[]).map((t) => ({
            key: t,
            label: TAB_LABELS[t],
            count: counts[t],
            href: href(t),
          }))}
        />
        <form role="search" action="/admin/activities" className="flex gap-2 sm:w-80">
          {tab !== "all" && <input type="hidden" name="show" value={tab} />}
          <label htmlFor="activity-search" className="sr-only">
            Search activities
          </label>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              id="activity-search"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Name, slug, category or place"
              className="h-10 pl-9"
            />
          </div>
          {q && (
            <Button variant="ghost" size="icon" nativeButton={false} render={<Link href={href(tab, "")} />} aria-label="Clear search">
              <X aria-hidden="true" />
            </Button>
          )}
        </form>
      </div>

      {all.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-input bg-card/60 px-6 py-14 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-accent text-primary">
            <Mountain className="size-6" aria-hidden="true" />
          </span>
          <p className="font-semibold">No activities yet</p>
          <p className="max-w-[44ch] text-sm text-muted-foreground">
            Add your first activity, then add offers with prices from local companies.
          </p>
          <Button nativeButton={false} render={<Link href="/admin/activities/new" />}>
            <Plus aria-hidden="true" />
            Add activity
          </Button>
        </div>
      ) : activities.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-input bg-card/60 p-10 text-center text-muted-foreground">
          {q ? `No ${tab === "all" ? "" : `${TAB_LABELS[tab].toLowerCase()} `}activities match “${q}”.` : `No ${TAB_LABELS[tab].toLowerCase()} activities.`}{" "}
          <Link href={href("all", "")} className="font-semibold text-primary hover:underline">
            Show all
          </Link>
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead>Offers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((a) => {
                const Icon = categoryIcon(a.category);
                return (
                  <TableRow key={a.id}>
                    <TableCell className="whitespace-normal">
                      <div className="flex items-center gap-3">
                        <ActivityImage
                          src={a.image_url}
                          alt=""
                          sizes="48px"
                          aspect="none"
                          className="size-12 shrink-0 rounded-lg"
                        />
                        <div className="min-w-0">
                          <Link href={`/admin/activities/${a.id}`} className="font-semibold hover:text-primary hover:underline">
                            {a.name}
                          </Link>
                          <div className="truncate text-xs text-muted-foreground">/{a.slug}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
                        <Icon className="size-3.5" aria-hidden="true" />
                        {sentenceCase(a.category)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {a.location ? (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="size-3.5" aria-hidden="true" />
                          {a.location}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/offers?activity=${a.id}`}
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums transition-colors",
                          a.offer_count > 0
                            ? "bg-mist text-foreground hover:bg-accent"
                            : "bg-sunrise-soft text-sunrise hover:bg-sunrise-soft/70",
                        )}
                      >
                        {a.offer_count === 0 ? "No offers" : `${a.offer_count} ${a.offer_count === 1 ? "offer" : "offers"}`}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <PublishSwitch id={a.id} name={a.name} published={a.is_published} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {a.is_published && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            nativeButton={false}
                            render={<Link href={`/activities/${a.slug}`} target="_blank" />}
                            aria-label={`View ${a.name} on the website`}
                          >
                            <ExternalLink aria-hidden="true" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          nativeButton={false}
                          render={<Link href={`/admin/activities/${a.id}`} />}
                          aria-label={`Edit ${a.name}`}
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
            Showing {activities.length} of {all.length} {all.length === 1 ? "activity" : "activities"}
          </p>
        </div>
      )}
    </div>
  );
}
