import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowDownAZ,
  ArrowRight,
  CalendarDays,
  ExternalLink,
  MapPin,
  MessageCircle,
  Mountain,
  Search,
  ShieldCheck,
  Tags,
} from "lucide-react";

import { ActivityImage } from "@/components/activity-image";
import { categoryIcon, sentenceCase } from "@/components/category-icon";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getPublishedActivities } from "@/lib/activities";
import { todayInTimeZone } from "@/lib/booking";
import { formatPrice } from "@/lib/offer-format";
import { getOfferSummaries } from "@/lib/offers";
import { formatOutingDate, outingState } from "@/lib/outings";
import { listPublicOutings } from "@/lib/outings-data";
import heroImage from "../../public/images/phewa-machhapuchhre.jpg";

export default function HomePage() {
  return (
    <>
      <Hero />

      <section id="activities" aria-labelledby="activities-heading" className="scroll-mt-6 pt-14 sm:pt-20">
        <Container>
          <Suspense fallback={<ActivitiesSkeleton />}>
            <Activities />
          </Suspense>
        </Container>
      </section>

      <section aria-labelledby="outings-heading" className="pt-16 sm:pt-24">
        <Container>
          <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
            <NextOuting />
          </Suspense>
        </Container>
      </section>

      <HowItWorks />
    </>
  );
}

function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="px-2 sm:px-4">
      <div className="relative isolate flex h-[calc(100svh-4.5rem)] max-h-[900px] min-h-[560px] flex-col overflow-hidden rounded-3xl bg-ink text-white sm:rounded-[2rem]">
        <Image
          src={heroImage}
          alt="Phewa Lake below forested hills, with Machhapuchhre and the Annapurna range under a clear blue sky"
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="-z-10 object-cover object-[50%_35%]"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/25" />

        <Container className="grid gap-6 pt-6 sm:grid-cols-12 sm:pt-10">
          <div className="space-y-5 sm:col-span-7 lg:col-span-5">
            <p className="max-w-[36ch] text-base leading-snug font-medium text-white sm:text-lg">
              Paragliding, boating, ziplines and hikes around the lake. Compare offers from local companies and send a
              booking request.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" nativeButton={false} render={<a href="#activities" />} className="bg-white text-ink hover:bg-mist">
                Browse activities
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href="/outings" />}
                className="border-white/60 bg-transparent text-white hover:bg-white/15 hover:text-white"
              >
                Group outings
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<a href="https://machhapuchhre.ai.studio/" target="_blank" rel="noopener noreferrer" />}
                className="border-white/60 bg-transparent text-white hover:bg-white/15 hover:text-white"
              >
                View Machhapuchhre from Pokhara
                <ExternalLink data-icon="inline-end" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </Button>
            </div>
          </div>
          <p className="hidden self-start justify-self-end text-right text-sm leading-snug text-white sm:col-span-5 sm:block lg:col-span-4 lg:col-start-9">
            Machhapuchhre, 6,993 m,
            <br />
            above Phewa Lake
          </p>
        </Container>

        <Container className="mt-auto">
          <h1
            id="hero-heading"
            className="translate-y-[0.07em] text-[clamp(5rem,23vw,20.5rem)] leading-[0.8] font-extrabold tracking-[-0.055em]"
          >
            <span className="block pb-4 text-lg leading-tight font-semibold tracking-normal sm:pb-6 sm:text-2xl">
              Adventure activities in
            </span>
            Pokhara
          </h1>
        </Container>
      </div>
    </section>
  );
}

async function Activities() {
  const [activities, summaries] = await Promise.all([getPublishedActivities(), getOfferSummaries()]);
  const offerCount = [...summaries.values()].reduce((sum, s) => sum + s.count, 0);

  return (
    <>
      <div className="flex flex-col justify-between gap-6 border-b border-border pb-8 md:flex-row md:items-end">
        <div className="max-w-2xl space-y-3">
          <h2 id="activities-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
            Things to do in Pokhara
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
            Browse outdoor activities across the valley and the Annapurna foothills, then compare offers from local
            companies and send a request.
          </p>
        </div>
        <dl className="flex items-center gap-5 self-start rounded-2xl border border-border bg-card p-4 md:self-auto">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-accent text-primary">
              <Mountain className="size-5" aria-hidden="true" />
            </span>
            <div className="flex flex-col-reverse">
              <dt className="text-sm text-muted-foreground">Activities</dt>
              <dd className="text-lg leading-tight font-bold tabular-nums">{activities.length}</dd>
            </div>
          </div>
          <div aria-hidden="true" className="h-8 w-px bg-border" />
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-sunrise-soft text-sunrise">
              <Tags className="size-5" aria-hidden="true" />
            </span>
            <div className="flex flex-col-reverse">
              <dt className="text-sm text-muted-foreground">Offers to compare</dt>
              <dd className="text-lg leading-tight font-bold tabular-nums">{offerCount}</dd>
            </div>
          </div>
        </dl>
      </div>

      <p className="flex items-center gap-2 pt-6 pb-5 text-sm font-medium text-muted-foreground">
        <ArrowDownAZ className="size-4 text-primary" aria-hidden="true" />
        Showing {activities.length} {activities.length === 1 ? "activity" : "activities"}, A to Z
      </p>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-input bg-card/60 px-6 py-14 text-center">
          <Mountain className="size-8 text-primary" aria-hidden="true" />
          <p className="text-base font-semibold">No activities listed yet</p>
          <p className="max-w-[44ch] text-sm text-muted-foreground">
            Local companies are adding their offers. Check back soon, or see the group outings meanwhile.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity, i) => {
            const summary = summaries.get(activity.id);
            const Icon = categoryIcon(activity.category);
            return (
              <li key={activity.id}>
                <Link
                  href={`/activities/${activity.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <div className="relative">
                    <ActivityImage
                      src={activity.image_url}
                      alt={activity.name}
                      priority={i < 3}
                      sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
                      className="aspect-video [&_img]:transition-transform [&_img]:duration-700 group-hover:[&_img]:scale-105"
                      aspect="none"
                    />
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-primary">
                      <Icon className="size-3.5" aria-hidden="true" />
                      {sentenceCase(activity.category)}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col justify-between gap-4 p-5">
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
                        {activity.name}
                      </h3>
                      {activity.location && (
                        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="size-4 text-primary" aria-hidden="true" />
                          {activity.location}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-border pt-3 text-sm">
                      {summary ? (
                        <span className="text-muted-foreground">
                          From{" "}
                          <span className="font-semibold text-sunrise tabular-nums">
                            {formatPrice(summary.fromPrice, summary.fromCurrency)}
                          </span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">No offers yet</span>
                      )}
                      <span className="flex items-center gap-1 font-semibold text-primary">
                        {summary ? `Compare ${summary.count} ${summary.count === 1 ? "offer" : "offers"}` : "View"}
                        <ArrowRight
                          className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function ActivitiesSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading activities">
      <div className="flex flex-col justify-between gap-6 border-b border-border pb-8 md:flex-row md:items-end">
        <div className="w-full max-w-2xl space-y-3">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
        </div>
        <Skeleton className="h-[74px] w-80 rounded-2xl" />
      </div>
      <Skeleton className="mt-6 mb-5 h-4 w-56" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="space-y-2 p-5">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex justify-between pt-5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function NextOuting() {
  await connection();
  const today = todayInTimeZone(new Date());
  const open = (await listPublicOutings()).filter((o) => outingState(o, today) === "open");
  const [next, ...later] = open;

  if (!next) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-card p-6 sm:p-8">
        <div className="space-y-1">
          <h2 id="outings-heading" className="text-2xl font-bold tracking-tight">
            Group outings
          </h2>
          <p className="text-muted-foreground">No group outings are planned right now. Check back soon.</p>
        </div>
        <Button variant="outline" nativeButton={false} render={<Link href="/outings" />}>
          See group outings
        </Button>
      </div>
    );
  }

  return (
    <div className="grid overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-2">
      <ActivityImage
        src={next.image_url}
        alt={next.title}
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[400px]"
        aspect="none"
      />
      <div className="flex flex-col gap-6 p-6 sm:p-8">
        <div className="space-y-2">
          <h2 id="outings-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
            Join a group outing
          </h2>
          <p className="text-muted-foreground">
            Hikes and trips with other travellers, run by local organizers. Register your interest and they contact
            you.
          </p>
        </div>

        <div className="space-y-2 rounded-xl bg-mist p-4">
          <h3 className="text-lg font-semibold">{next.title}</h3>
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden="true" />
              {formatOutingDate(next.outing_date)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden="true" />
              {next.destination}
            </span>
          </p>
        </div>

        {later.length > 0 && (
          <div>
            <h3 className="pb-1 text-sm font-semibold">Also coming up</h3>
            <ul>
              {later.slice(0, 3).map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/outings/${o.slug}`}
                    className="flex items-baseline justify-between gap-4 rounded-md py-1.5 text-sm hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    <span className="font-medium">{o.title}</span>
                    <span className="shrink-0 text-muted-foreground tabular-nums">{formatOutingDate(o.outing_date)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-3">
          <Button nativeButton={false} render={<Link href={`/outings/${next.slug}`} />}>
            View outing
          </Button>
          <Button variant="outline" nativeButton={false} render={<Link href="/outings" />}>
            All group outings
          </Button>
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  { icon: Search, title: "Compare offers", text: "See each company's price, what's included and when it was checked." },
  { icon: MessageCircle, title: "Send a request", text: "Pick a date and group size. It takes about two minutes." },
  { icon: ShieldCheck, title: "We confirm with you", text: "We check with the company and contact you. Nothing is paid online." },
];

function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="pt-16 sm:pt-24">
      <Container>
        <h2 id="how-heading" className="pb-6 text-2xl font-bold tracking-tight sm:text-3xl">
          How booking works
        </h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="space-y-2 rounded-2xl bg-card p-6">
              <Icon className="size-6 text-primary" aria-hidden="true" />
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

