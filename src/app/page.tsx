import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, MapPin } from "lucide-react";

import { ActivityImage } from "@/components/activity-image";
import { Container } from "@/components/container";
import { Reveal } from "@/components/reveal";
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

      <section id="activities" aria-labelledby="activities-heading" className="scroll-mt-6 pt-24 sm:pt-36">
        <Container>
          <Reveal className="grid gap-4 pb-8 sm:pb-12 lg:grid-cols-12 lg:items-end">
            <h2 id="activities-heading" className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:col-span-6">
              Activities, A to Z
            </h2>
            <p className="max-w-[46ch] text-[17px] leading-relaxed text-muted-foreground lg:col-span-5 lg:col-start-8">
              Each activity lists offers from local companies side by side, with what is included and when the price
              was last checked.
            </p>
          </Reveal>
          <Suspense fallback={<ActivityListSkeleton />}>
            <ActivityList />
          </Suspense>
        </Container>
      </section>

      <section aria-labelledby="outings-heading" className="pt-24 sm:pt-40">
        <Container>
          <Suspense fallback={<Skeleton className="h-[560px] w-full rounded-[2rem]" />}>
            <NextOutings />
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
      <div className="relative isolate flex h-[calc(100svh-5.5rem)] max-h-[960px] min-h-[600px] flex-col overflow-hidden rounded-[2rem] bg-ink text-white sm:rounded-[2.5rem]">
        <Image
          src={heroImage}
          alt="Phewa Lake below forested hills, with Machhapuchhre and the Annapurna range under a clear blue sky"
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="-z-10 object-cover object-[50%_35%] motion-safe:animate-drift"
        />
        {/* One flat neutral veil so white type reads on sky and forest. */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/25" />

        <Container className="grid gap-6 pt-6 sm:grid-cols-12 sm:pt-10">
          <div className="space-y-6 sm:col-span-7 lg:col-span-5">
            <p className="max-w-[34ch] text-lg leading-snug font-medium text-white motion-safe:animate-rise sm:text-xl">
              Paragliding, boating, ziplines and hikes around the lake. Compare offers from local companies and send a
              request in two minutes.
            </p>
            <div className="flex flex-wrap items-center gap-3 motion-safe:animate-rise motion-safe:[animation-delay:120ms]">
              <Button size="lg" nativeButton={false} render={<a href="#activities" />} className="bg-white text-ink hover:bg-mist">
                Browse activities
                <ArrowDown aria-hidden="true" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                nativeButton={false}
                render={<Link href="/outings" />}
                className="text-white hover:bg-white/15 hover:text-white"
              >
                Join a group outing
              </Button>
            </div>
          </div>
          <p className="hidden self-start justify-self-end text-right text-[15px] leading-snug text-white sm:col-span-5 sm:block lg:col-span-4 lg:col-start-9">
            Machhapuchhre, 6,993 m,
            <br />
            above Phewa Lake
          </p>
        </Container>

        <Container className="mt-auto">
          <h1
            id="hero-heading"
            className="translate-y-[0.07em] text-[clamp(5rem,23vw,20.5rem)] leading-[0.8] font-extrabold tracking-[-0.055em] motion-safe:animate-rise motion-safe:[animation-delay:240ms]"
          >
            <span className="block pb-4 text-xl leading-tight font-semibold tracking-normal sm:pb-6 sm:text-2xl">
              Adventure activities in
            </span>
            Pokhara
          </h1>
        </Container>
      </div>
    </section>
  );
}

async function ActivityList() {
  const [activities, summaries] = await Promise.all([getPublishedActivities(), getOfferSummaries()]);

  if (activities.length === 0) {
    return (
      <p className="rounded-3xl bg-card p-10 text-center text-[17px] text-muted-foreground">
        No activities are listed yet. Check back soon.
      </p>
    );
  }

  return (
    <ul className="-mx-3 grid gap-2">
      {activities.map((activity, i) => {
        const summary = summaries.get(activity.id);
        return (
          <Reveal as="li" key={activity.id} delay={(i % 3) as 0 | 1 | 2}>
            <Link
              href={`/activities/${activity.slug}`}
              className="group grid grid-cols-[6.5rem_1fr] items-center gap-x-4 gap-y-3 rounded-3xl p-3 transition-colors hover:bg-card focus-visible:bg-card focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:grid-cols-[11rem_1fr_auto] sm:gap-x-8 lg:grid-cols-[14rem_1fr_auto]"
            >
              <ActivityImage
                src={activity.image_url}
                alt={activity.name}
                sizes="(min-width: 1024px) 224px, (min-width: 640px) 176px, 104px"
                className="aspect-[4/3] rounded-2xl transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="min-w-0 space-y-1.5">
                <h3 className="text-[22px] leading-tight font-bold tracking-tight sm:text-[clamp(1.75rem,3vw,2.75rem)] sm:leading-[1.05]">
                  {activity.name}
                </h3>
                <p className="text-[15px] text-muted-foreground sm:text-base">
                  {sentenceCase(activity.category)}
                  {activity.location && ` in ${activity.location}`}
                </p>
              </div>
              <div className="col-span-2 flex items-center justify-between gap-6 sm:col-span-1 sm:justify-end">
                {summary ? (
                  <p className="text-left sm:text-right">
                    <span className="block text-sm text-muted-foreground">
                      {summary.count} {summary.count === 1 ? "offer" : "offers"} from
                    </span>
                    <span className="block text-xl font-bold tracking-tight text-sunrise tabular-nums sm:text-2xl">
                      {formatPrice(summary.fromPrice, summary.fromCurrency)}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">No offers yet</p>
                )}
                <span
                  aria-hidden="true"
                  className="grid size-12 shrink-0 place-items-center rounded-full bg-card text-primary transition-[background-color,color,transform] duration-300 group-hover:translate-x-1 group-hover:bg-primary group-hover:text-primary-foreground"
                >
                  <ArrowRight className="size-5" />
                </span>
              </div>
            </Link>
          </Reveal>
        );
      })}
    </ul>
  );
}

function ActivityListSkeleton() {
  return (
    <div className="grid gap-2" aria-busy="true" aria-label="Loading activities">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="grid grid-cols-[6.5rem_1fr] items-center gap-4 p-3 sm:grid-cols-[11rem_1fr_auto] sm:gap-8 lg:grid-cols-[14rem_1fr_auto]">
          <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="hidden h-12 w-36 sm:block" />
        </div>
      ))}
    </div>
  );
}

async function NextOutings() {
  await connection();
  const today = todayInTimeZone(new Date());
  const open = (await listPublicOutings()).filter((o) => outingState(o, today) === "open");
  const [next, ...later] = open;

  if (!next) {
    return (
      <div className="grid gap-6 rounded-[2rem] bg-card p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
        <h2 id="outings-heading" className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Walk with a group
        </h2>
        <div className="space-y-4">
          <p className="text-[17px] text-muted-foreground">
            No group outings are planned right now. New hikes and trips are added often.
          </p>
          <Button variant="outline" nativeButton={false} render={<Link href="/outings" />}>
            See group outings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid overflow-hidden rounded-[2rem] bg-card lg:grid-cols-2">
      <Reveal className="relative aspect-square lg:aspect-auto lg:min-h-[640px]">
        <ActivityImage
          src={next.image_url}
          alt={next.title}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="absolute inset-0 h-full"
          aspect="none"
        />
      </Reveal>
      <div className="flex flex-col gap-10 p-6 sm:p-10 lg:p-14">
        <Reveal delay={1} className="space-y-4">
          <h2 id="outings-heading" className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Walk with a group
          </h2>
          <p className="max-w-[44ch] text-[17px] leading-relaxed text-muted-foreground">
            Hikes and trips with other travellers, run by local organizers. Register your interest and they contact
            you.
          </p>
        </Reveal>

        <Reveal delay={2} className="space-y-4">
          <h3 className="text-3xl leading-tight font-bold tracking-tight">{next.title}</h3>
          <p className="flex flex-wrap gap-x-5 gap-y-1 text-base">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4 text-primary" aria-hidden="true" />
              {formatOutingDate(next.outing_date)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4 text-primary" aria-hidden="true" />
              {next.destination}
            </span>
          </p>
          {next.description && (
            <p className="line-clamp-3 max-w-[52ch] text-base leading-relaxed text-muted-foreground">{next.description}</p>
          )}
        </Reveal>

        {later.length > 0 && (
          <Reveal delay={3}>
            <h3 className="pb-2 text-[15px] font-semibold">Also coming up</h3>
            <ul className="grid gap-1">
              {later.slice(0, 3).map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/outings/${o.slug}`}
                    className="group flex items-baseline justify-between gap-4 rounded-xl py-1.5 text-base hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    <span className="font-medium">{o.title}</span>
                    <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
                      {formatOutingDate(o.outing_date)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        <div className="mt-auto grid gap-3 sm:grid-cols-2">
          <Button size="lg" nativeButton={false} render={<Link href={`/outings/${next.slug}`} />} className="h-14">
            See this outing
            <ArrowUpRight aria-hidden="true" />
          </Button>
          <Button size="lg" variant="secondary" nativeButton={false} render={<Link href="/outings" />} className="h-14">
            All group outings
          </Button>
        </div>
      </div>
    </div>
  );
}

const STEPS: { heading: string; rows: [string, string][] }[] = [
  {
    heading: "On this site",
    rows: [
      ["Compare offers", "prices, inclusions"],
      ["Send a request", "about 2 minutes"],
    ],
  },
  {
    heading: "Then, by phone or email",
    rows: [
      ["We ask the company", "date, places"],
      ["We confirm with you", "yes or no"],
    ],
  },
];

function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="pt-24 sm:pt-40">
      <Container className="grid gap-10 lg:grid-cols-12">
        <Reveal className="space-y-5 lg:col-span-5">
          <h2 id="how-heading" className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            How a request works
          </h2>
          <p className="max-w-[36ch] text-[17px] leading-relaxed text-muted-foreground">
            A request is not a booking. It reserves nothing and costs nothing until the company confirms your date.
          </p>
        </Reveal>

        <Reveal delay={1} className="lg:col-span-6 lg:col-start-7">
          <div className="mx-auto max-w-[30rem] bg-card px-5 pt-8 pb-12 text-[15px] sm:text-base [mask:conic-gradient(from_-45deg_at_bottom,#0000,#000_1deg_89deg,#0000_90deg)_50%/20px_100%] sm:px-8">
            <p className="pb-2 text-lg font-extrabold tracking-tight">Your request</p>
            {STEPS.map(({ heading, rows }) => (
              <div key={heading} className="pt-7">
                <h3 className="pb-2 font-bold">{heading}</h3>
                <ul className="grid gap-2">
                  {rows.map(([what, value]) => (
                    <li key={what} className="flex items-end gap-2">
                      <span className="shrink-0">{what}</span>
                      <span aria-hidden="true" className="mb-1.5 min-w-6 flex-1 border-b-2 border-dotted border-muted-foreground/40" />
                      <span className="text-right text-muted-foreground">{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="mt-8 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl bg-ink px-4 py-3 font-semibold text-white">
              <span>You get a reference number</span>
              <span className="text-mist/80">nothing paid online</span>
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function sentenceCase(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
