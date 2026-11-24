import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Pencil, Plus } from "lucide-react";

import { PublishSwitch } from "@/components/admin/publish-switch";
import { TableSkeleton } from "@/components/admin/table-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAdminActivities } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Activities" };

export default function AdminActivitiesPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Activities</h1>
          <p className="text-muted-foreground">Only activities switched to Live appear on the website.</p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/activities/new" />}>
          <Plus aria-hidden="true" />
          New activity
        </Button>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <ActivitiesTable />
      </Suspense>
    </section>
  );
}

async function ActivitiesTable() {
  const activities = await listAdminActivities();

  if (activities.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
        No activities yet. Click <strong>New activity</strong> to add the first one.
      </p>
    );
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Activity</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="hidden md:table-cell">Location</TableHead>
            <TableHead className="text-right">Offers</TableHead>
            <TableHead>On website</TableHead>
            <TableHead className="text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((a) => (
            <TableRow key={a.id}>
              <TableCell>
                <Link href={`/admin/activities/${a.id}`} className="font-medium hover:underline">
                  {a.name}
                </Link>
                <div className="text-xs text-muted-foreground">/{a.slug}</div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="capitalize">
                  {a.category}
                </Badge>
              </TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">{a.location ?? "—"}</TableCell>
              <TableCell className="text-right">
                <Link href={`/admin/offers?activity=${a.id}`} className="tabular-nums hover:underline">
                  {a.offer_count}
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
                      nativeButton={false} render={<Link href={`/activities/${a.slug}`} target="_blank" />}
                      aria-label={`View ${a.name} on the website`}
                    >
                      <ExternalLink aria-hidden="true" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    nativeButton={false} render={<Link href={`/admin/activities/${a.id}`} />}
                    aria-label={`Edit ${a.name}`}
                  >
                    <Pencil aria-hidden="true" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
