import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { CalendarDays, MapPin } from "lucide-react";

import { ActivityImage } from "@/components/activity-image";
import { OutingStateBadge } from "@/components/outing-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { todayInTimeZone } from "@/lib/booking";
import { formatOutingDate, outingState } from "@/lib/outings";
import { listPublicOutings } from "@/lib/outings-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Group outings",
  description: "Join hiking and travel groups from Pokhara. Register your interest and the organizer will contact you.",
};

export default function OutingsPage() {
  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Group outings</h1>
        <p className="text-muted-foreground">
          Hikes and trips with other travellers. Register your interest and the organizer will contact you.
        </p>
      </div>
      <Suspense fallback={<OutingGridSkeleton />}>
        <OutingGrid />
      </Suspense>
    </section>
  );
}

async function OutingGrid() {
  await connection();
  const outings = await listPublicOutings();
  const today = todayInTimeZone(new Date());

  if (outings.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
        No group outings planned yet. Check back soon.
      </p>
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {outings.map((o) => {
        const state = outingState(o, today);
        return (
          <li key={o.id}>
            <Link
              href={`/outings/${o.slug}`}
              className="block h-full rounded-xl transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Card className={cn("h-full pt-0", state === "cancelled" && "opacity-75")}>
                <ActivityImage src={o.image_url} alt={o.title} />
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle>
                      <h2>{o.title}</h2>
                    </CardTitle>
                    <OutingStateBadge state={state} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <CalendarDays className="size-4" aria-hidden="true" />
                    {formatOutingDate(o.outing_date)}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="size-4" aria-hidden="true" />
                    {o.destination}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function OutingGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading outings">
      {Array.from({ length: 3 }, (_, i) => (
        <Card key={i} className="pt-0">
          <Skeleton className="aspect-video w-full rounded-none" />
          <CardHeader>
            <Skeleton className="h-5 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
