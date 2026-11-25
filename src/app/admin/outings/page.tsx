import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { ExternalLink, Pencil, Plus } from "lucide-react";

import { TableSkeleton } from "@/components/admin/table-skeleton";
import { OutingStateBadge } from "@/components/outing-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAdminOutings } from "@/lib/admin/outings-data";
import { todayInTimeZone } from "@/lib/booking";
import { formatOutingDate, outingState } from "@/lib/outings";

export const metadata: Metadata = { title: "Group outings" };

export default function AdminOutingsPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Group outings</h1>
          <p className="text-muted-foreground">
            Hikes and trips visitors can register interest in. Interest doesn&apos;t reserve a place.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/outings/new" />}>
          <Plus aria-hidden="true" />
          New outing
        </Button>
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <OutingsTable />
      </Suspense>
    </section>
  );
}

async function OutingsTable() {
  await connection();
  const outings = await listAdminOutings();
  const today = todayInTimeZone(new Date());

  if (outings.length === 0) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-input bg-card/60 p-10 text-center text-muted-foreground">
        No outings yet. Click <strong>New outing</strong> to plan the first one.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-card border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Outing</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Interested</TableHead>
            <TableHead className="text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {outings.map((o) => {
            const state = outingState(o, today);
            const visible = o.status !== "draft";
            return (
              <TableRow key={o.id}>
                <TableCell className="max-w-72 whitespace-normal">
                  <Link href={`/admin/outings/${o.id}`} className="font-medium hover:underline">
                    {o.title}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    {o.destination} · {o.organizer_name}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatOutingDate(o.outing_date)}</TableCell>
                <TableCell>
                  {state === "open" ? <Badge>Published</Badge> : <OutingStateBadge state={state} />}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  <Link href={`/admin/outings/${o.id}#interested`} className="hover:underline">
                    {o.interest_count}
                    {o.people_count > o.interest_count && (
                      <span className="text-muted-foreground"> ({o.people_count} people)</span>
                    )}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    {visible && (
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
    </div>
  );
}
