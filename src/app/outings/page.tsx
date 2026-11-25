import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, MapPin, Users } from "lucide-react";

import { ActivityImage } from "@/components/activity-image";
import { Container } from "@/components/container";
import { OutingStateBadge } from "@/components/outing-status-badge";
import { Reveal } from "@/components/reveal";
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
    <>
      <Container>
        <div className="grid gap-6 pt-6 pb-10 sm:pt-12 lg:grid-cols-12 lg:items-end">
          <h1 className="text-[clamp(3rem,8vw,7rem)] leading-[0.9] font-extrabold tracking-[-0.045em] motion-safe:animate-rise lg:col-span-7">
            Group outings
          </h1>
          <p className="max-w-[40ch] text-lg leading-relaxed text-muted-foreground motion-safe:animate-rise motion-safe:[animation-delay:100ms] lg:col-span-4 lg:col-start-9">
            Hikes and trips with other travellers, run by local organizers. Register your interest and the organizer
            contacts you. Nothing is paid here.
          </p>
        </div>
      </Container>

      <div className="px-2 sm:px-4">
        <figure className="relative h-[42svh] min-h-[280px] overflow-hidden rounded-[2rem] bg-ink sm:rounded-[2.5rem]">
          <Image
            src={dawnImage}
            alt="Machhapuchhre and the Annapurna range at dawn, reflected in still water at Pokhara"
            fill
            priority
            placeholder="blur"
            sizes="100vw"
            className="object-cover object-[50%_40%] motion-safe:animate-drift"
          />
          <figcaption className="absolute right-5 bottom-4 text-sm text-white/90 sm:right-8 sm:bottom-6">
            Pokhara at dawn
          </figcaption>
        </figure>
      </div>

      <Container className="pt-16 sm:pt-24">
        <h2 className="pb-8 text-3xl font-extrabold tracking-tight sm:text-4xl">Coming up</h2>
        <Suspense fallback={<OutingListSkeleton />}>
          <OutingList />
        </Suspense>
      </Container>
    </>
  );
}

async function OutingList() {
  await connection();
  const outings = await listPublicOutings();
  const today = todayInTimeZone(new Date());

  if (outings.length === 0) {
    return (
      <div className="rounded-3xl bg-card px-6 py-14 text-center">
        <p className="text-lg font-semibold">No group outings planned yet</p>
        <p className="pt-1 text-base text-muted-foreground">New hikes and trips are added often. Check back soon.</p>
      </div>
    );
  }

  return (
    <ul className="-mx-3 grid gap-2">
      {outings.map((o, i) => {
        const state = outingState(o, today);
        const date = outingDateParts(o.outing_date);
        return (
          <Reveal as="li" key={o.id} delay={(i % 3) as 0 | 1 | 2}>
            <Link
              href={`/outings/${o.slug}`}
              className={cn(
                "group grid grid-cols-[4.5rem_1fr] items-center gap-x-4 gap-y-3 rounded-3xl p-3 transition-colors hover:bg-card focus-visible:bg-card focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:grid-cols-[6.5rem_1fr_12rem_auto] sm:gap-x-8",
                state === "cancelled" && "text-muted-foreground",
              )}
            >
              <div className="text-center">
                {date ? (
                  <>
                    <p className="text-[2.75rem] leading-none font-extrabold tracking-tight tabular-nums sm:text-6xl">{date.day}</p>
                    <p className="pt-1 text-sm font-semibold">
                      {date.month} {date.year}
                    </p>
                    <p className="text-sm text-primary">{date.weekday}</p>
                  </>
                ) : (
                  <p className="text-sm leading-tight font-semibold text-primary">Date to be confirmed</p>
                )}
              </div>
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h3 className="text-[22px] leading-tight font-bold tracking-tight sm:text-[clamp(1.5rem,2.6vw,2.25rem)]">
                    {o.title}
                  </h3>
                  <OutingStateBadge state={state} />
                </div>
                <p className="flex flex-wrap gap-x-5 gap-y-1 text-base text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-4" aria-hidden="true" />
                    {o.destination}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="size-4" aria-hidden="true" />
                    {o.organizer_name}
                  </span>
                </p>
              </div>
              <ActivityImage
                src={o.image_url}
                alt={o.title}
                sizes="192px"
                className={cn(
                  "col-span-2 hidden aspect-[3/2] rounded-2xl sm:col-span-1 sm:block",
                  state === "cancelled" && "grayscale",
                )}
              />
              <span
                aria-hidden="true"
                className="hidden size-12 place-items-center rounded-full bg-card text-primary transition-[background-color,color,transform] duration-300 group-hover:translate-x-1 group-hover:bg-primary group-hover:text-primary-foreground sm:grid"
              >
                <ArrowRight className="size-5" />
              </span>
            </Link>
          </Reveal>
        );
      })}
    </ul>
  );
}

function OutingListSkeleton() {
  return (
    <div className="grid gap-2" aria-busy="true" aria-label="Loading outings">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="grid grid-cols-[4.5rem_1fr] items-center gap-4 p-3 sm:grid-cols-[6.5rem_1fr_12rem] sm:gap-8">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="hidden aspect-[3/2] w-full rounded-2xl sm:block" />
        </div>
      ))}
    </div>
  );
}
