import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { ChevronRight, MapPin, Users } from "lucide-react";

import { ActivityImage } from "@/components/activity-image";
import { Container } from "@/components/container";
import { OutingStateBadge } from "@/components/outing-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { todayInTimeZone } from "@/lib/booking";
import { outingDateParts, outingState } from "@/lib/outings";
import { listPublicOutings } from "@/lib/outings-data";
import { cn } from "@/lib/utils";
import dawnImage from "../../../public/images/pokhara-dawn.jpg";

export const metadata: Metadata = {
  title: "Group outings",
  description: "Join hiking and travel groups from Pokhara. Register your interest and the organizer will contact you.",
};

export default function OutingsPage() {
  return (
    <Container>
      <header className="space-y-2 pt-4 pb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Group outings</h1>
        <p className="max-w-[60ch] text-base text-muted-foreground">
          Hikes and trips with other travellers, run by local organizers. Register your interest and the organizer
          contacts you. Nothing is paid here.
        </p>
      </header>

      <figure className="relative h-48 overflow-hidden rounded-2xl bg-ink sm:h-64">
        <Image
          src={dawnImage}
          alt="Machhapuchhre and the Annapurna range at dawn, reflected in still water at Pokhara"
          fill
          priority
          placeholder="blur"
          sizes="(min-width: 1280px) 1216px, 100vw"
          className="object-cover object-[50%_40%]"
        />
      </figure>

      <section aria-labelledby="upcoming-heading" className="pt-10">
        <h2 id="upcoming-heading" className="pb-4 text-xl font-semibold tracking-tight sm:text-2xl">
          Coming up
        </h2>
        <Suspense fallback={<OutingListSkeleton />}>
          <OutingList />
        </Suspense>
      </section>
    </Container>
  );
}

async function OutingList() {
  await connection();
  const outings = await listPublicOutings();
  const today = todayInTimeZone(new Date());

  if (outings.length === 0) {
    return (
      <div className="rounded-2xl bg-card px-6 py-12 text-center">
        <p className="text-base font-semibold">No group outings planned yet</p>
        <p className="pt-1 text-sm text-muted-foreground">New hikes and trips are added often. Check back soon.</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-3">
      {outings.map((o) => {
        const state = outingState(o, today);
        const date = outingDateParts(o.outing_date);
        return (
          <li key={o.id}>
            <Link
              href={`/outings/${o.slug}`}
              className={cn(
                "group grid grid-cols-[4rem_1fr_auto] items-center gap-4 rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:grid-cols-[9rem_4.5rem_1fr_auto] sm:gap-5",
                state === "cancelled" && "text-muted-foreground",
              )}
            >
              <ActivityImage
                src={o.image_url}
                alt={o.title}
                sizes="144px"
                aspect="none"
                className={cn("hidden aspect-[3/2] rounded-xl sm:block", state === "cancelled" && "grayscale")}
              />
              <div className="rounded-xl bg-mist py-2 text-center">
                {date ? (
                  <>
                    <p className="text-xs font-medium text-muted-foreground">{date.weekday}</p>
                    <p className="text-xl leading-tight font-bold tabular-nums">{date.day}</p>
                    <p className="text-xs font-medium">{date.month}</p>
                  </>
                ) : (
                  <p className="px-1 text-xs leading-tight font-medium text-muted-foreground">Date TBC</p>
                )}
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h3 className="text-base font-semibold group-hover:text-primary sm:text-lg">{o.title}</h3>
                  <OutingStateBadge state={state} />
                </div>
                <p className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5" aria-hidden="true" />
                    {o.destination}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="size-3.5" aria-hidden="true" />
                    {o.organizer_name}
                  </span>
                </p>
              </div>
              <ChevronRight
                className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function OutingListSkeleton() {
  return (
    <div className="grid gap-3" aria-busy="true" aria-label="Loading outings">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="grid grid-cols-[4rem_1fr] items-center gap-4 rounded-2xl border border-border bg-card p-3 sm:grid-cols-[9rem_4.5rem_1fr]">
          <Skeleton className="hidden aspect-[3/2] w-full rounded-xl sm:block" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}
