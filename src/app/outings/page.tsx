import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, CalendarDays, Handshake, MapPin, PhoneCall, UserPlus, Users, Wallet } from "lucide-react";

import { ActivityImage } from "@/components/activity-image";
import { Container } from "@/components/container";
import { OutingStateBadge } from "@/components/outing-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { todayInTimeZone } from "@/lib/booking";
import { formatOutingDate, groupOutingsByMonth, outingDateParts, outingState, type PublicOuting } from "@/lib/outings";
import { listPublicOutings } from "@/lib/outings-data";
import { cn } from "@/lib/utils";
import dawnImage from "../../../public/images/pokhara-dawn.jpg";

export const metadata: Metadata = {
  title: "Group outings",
  description: "Join hiking and travel groups from Pokhara. Register your interest and the organizer will contact you.",
};

const STEPS = [
  { icon: UserPlus, title: "Register your interest", text: "Leave your name, contact and group size. It takes a minute." },
  { icon: PhoneCall, title: "The organizer contacts you", text: "They confirm the plan, the meeting point and the cost." },
  { icon: Handshake, title: "Join the group", text: "Pay the organizer directly. Nothing is charged on this site." },
];

export default function OutingsPage() {
  return (
    <>
      <section aria-labelledby="outings-heading" className="px-2 sm:px-4">
        <div className="relative isolate flex min-h-[420px] flex-col justify-end overflow-hidden rounded-3xl bg-ink text-white sm:min-h-[480px] sm:rounded-[2rem]">
          <Image
            src={dawnImage}
            alt="Machhapuchhre and the Annapurna range at dawn, reflected in still water at Pokhara"
            fill
            priority
            placeholder="blur"
            sizes="100vw"
            className="-z-10 object-cover object-[50%_40%]"
          />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/40" />
          <Container className="space-y-4 pb-8 sm:pb-12">
            <h1 id="outings-heading" className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Group outings
            </h1>
            <p className="max-w-[52ch] text-base text-white/90 sm:text-lg">
              Hikes and trips with other travellers, run by local organizers. Pick a date, register your interest and
              the organizer contacts you.
            </p>
            <Suspense fallback={<div className="h-9" />}>
              <HeroStats />
            </Suspense>
          </Container>
        </div>
      </section>

      <Container>
        <section aria-labelledby="steps-heading" className="pt-10">
          <h2 id="steps-heading" className="sr-only">
            How group outings work
          </h2>
          <ol className="grid gap-3 sm:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <Suspense fallback={<OutingsSkeleton />}>
          <OutingsList />
        </Suspense>
      </Container>
    </>
  );
}

async function HeroStats() {
  await connection();
  const today = todayInTimeZone(new Date());
  const open = (await listPublicOutings()).filter((o) => outingState(o, today) === "open");
  const organizers = new Set(open.map((o) => o.organizer_name)).size;
  if (open.length === 0) return null;
  return (
    <p className="flex flex-wrap gap-2 pt-1 text-sm font-medium">
      <span className="rounded-full bg-white/15 px-3 py-1.5">
        {open.length} upcoming {open.length === 1 ? "outing" : "outings"}
      </span>
      <span className="rounded-full bg-white/15 px-3 py-1.5">
        {organizers} local {organizers === 1 ? "organizer" : "organizers"}
      </span>
    </p>
  );
}

async function OutingsList() {
  await connection();
  const outings = await listPublicOutings();
  const today = todayInTimeZone(new Date());

  if (outings.length === 0) {
    return (
      <div className="mt-12 flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-input bg-card/60 px-6 py-14 text-center">
        <CalendarDays className="size-8 text-primary" aria-hidden="true" />
        <p className="text-base font-semibold">No group outings planned yet</p>
        <p className="max-w-[44ch] text-sm text-muted-foreground">
          New hikes and trips are added often. Meanwhile, browse activities you can book on your own.
        </p>
        <Link href="/" className="pt-1 text-sm font-semibold text-primary hover:underline">
          Browse activities
        </Link>
      </div>
    );
  }

  const next = outings.find((o) => outingState(o, today) === "open");
  const rest = outings.filter((o) => o !== next);
  const groups = groupOutingsByMonth(rest);

  return (
    <>
      {next && (
        <section aria-labelledby="next-heading" className="pt-14">
          <h2 id="next-heading" className="pb-5 text-2xl font-bold tracking-tight sm:text-3xl">
            Next outing
          </h2>
          <FeaturedOuting outing={next} />
        </section>
      )}

      {groups.map((group, gi) => (
        <section key={group.key} aria-labelledby={`month-${group.key}`} className="pt-14">
          <div className="flex items-baseline justify-between gap-4 border-b border-border pb-4">
            <h2 id={`month-${group.key}`} className="text-xl font-bold tracking-tight sm:text-2xl">
              {group.label}
            </h2>
            <p className="text-sm text-muted-foreground">
              {group.outings.length} {group.outings.length === 1 ? "outing" : "outings"}
            </p>
          </div>
          <ul className="grid grid-cols-1 gap-6 pt-6 md:grid-cols-2 lg:grid-cols-3">
            {group.outings.map((o, i) => (
              <li key={o.id}>
                <OutingCard outing={o} state={outingState(o, today)} priority={gi === 0 && i < 3} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

function FeaturedOuting({ outing }: { outing: PublicOuting }) {
  const date = outingDateParts(outing.outing_date);
  return (
    <Link
      href={`/outings/${outing.slug}`}
      className="group grid overflow-hidden rounded-2xl border border-border bg-card transition-[box-shadow,border-color] duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none lg:grid-cols-[1.2fr_1fr]"
    >
      <div className="relative">
        <ActivityImage
          src={outing.image_url}
          alt={outing.title}
          priority
          sizes="(min-width: 1024px) 660px, 100vw"
          aspect="none"
          className="aspect-video lg:aspect-auto lg:h-full lg:min-h-[340px] [&_img]:transition-transform [&_img]:duration-700 group-hover:[&_img]:scale-105 motion-reduce:[&_img]:transition-none"
        />
        {date && <DateBadge date={date} className="absolute top-4 left-4" />}
      </div>
      <div className="flex flex-col gap-5 p-6 sm:p-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold tracking-tight transition-colors group-hover:text-primary">{outing.title}</h3>
          {outing.description && (
            <p className="line-clamp-3 text-base leading-relaxed text-muted-foreground">{outing.description}</p>
          )}
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <Fact icon={CalendarDays} label="Date" value={formatOutingDate(outing.outing_date)} />
          <Fact icon={MapPin} label="Destination" value={outing.destination} />
          <Fact icon={Users} label="Organizer" value={outing.organizer_name} />
          <Fact icon={Wallet} label="Cost" value={outing.cost_info ?? "To be confirmed"} />
        </dl>
        <span className="mt-auto inline-flex items-center gap-1.5 self-start rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors group-hover:bg-accent-foreground">
          See details and register
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

function OutingCard({
  outing,
  state,
  priority,
}: {
  outing: PublicOuting;
  state: ReturnType<typeof outingState>;
  priority: boolean;
}) {
  const date = outingDateParts(outing.outing_date);
  const cancelled = state === "cancelled";
  return (
    <Link
      href={`/outings/${outing.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-[transform,box-shadow,border-color] duration-300 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        cancelled
          ? "opacity-75"
          : "hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 motion-reduce:hover:translate-y-0",
      )}
    >
      <div className="relative">
        <ActivityImage
          src={outing.image_url}
          alt={outing.title}
          priority={priority}
          sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
          aspect="none"
          className={cn(
            "aspect-video [&_img]:transition-transform [&_img]:duration-700 motion-reduce:[&_img]:transition-none",
            cancelled ? "grayscale" : "group-hover:[&_img]:scale-105",
          )}
        />
        {date && <DateBadge date={date} className="absolute top-3 left-3" />}
        {cancelled && (
          <span className="absolute top-3 right-3">
            <OutingStateBadge state={state} />
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-4 p-5">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
            {outing.title}
          </h3>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
            {outing.destination}
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="size-4 shrink-0 text-primary" aria-hidden="true" />
            {outing.organizer_name}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border pt-3 text-sm">
          <span className="line-clamp-1 text-muted-foreground">
            {cancelled ? "Not taking interest" : (outing.cost_info ?? "Cost to be confirmed")}
          </span>
          <span className="flex shrink-0 items-center gap-1 font-semibold text-primary">
            Details
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

function DateBadge({
  date,
  className,
}: {
  date: NonNullable<ReturnType<typeof outingDateParts>>;
  className?: string;
}) {
  return (
    <span className={cn("flex w-14 flex-col items-center rounded-xl bg-white/95 py-1.5 text-ink", className)}>
      <span className="text-xs leading-none font-semibold text-sunrise">{date.month}</span>
      <span className="text-xl leading-tight font-bold tabular-nums">{date.day}</span>
      <span className="text-xs leading-none font-medium text-muted-foreground">{date.weekday}</span>
    </span>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="font-medium">{value}</dd>
      </div>
    </div>
  );
}

function OutingsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading outings" className="pt-14">
      <Skeleton className="mb-5 h-8 w-40" />
      <div className="grid overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-[1.2fr_1fr]">
        <Skeleton className="aspect-video w-full rounded-none lg:aspect-auto lg:h-[340px]" />
        <div className="space-y-3 p-8">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="mt-6 h-10 w-48 rounded-full" />
        </div>
      </div>
      <Skeleton className="mt-14 mb-6 h-7 w-48" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="space-y-2 p-5">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
