import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  MapPin,
  MessageCircle,
  Mountain,
  Search,
  ShieldCheck,
} from "lucide-react"

import { OutingDateBadge } from "@/components/outing-card"
import { Button } from "@/components/ui/button"
import {
  getActivities,
  getListedOutings,
  getNextOuting,
  getOutingStats,
  getTotalOfferCount,
  type DemoActivity,
} from "@/lib/demo-data"
import { formatPrice, isOfferAvailable, sortOffers } from "@/lib/offer-format"

function ActivityCard({
  activity,
  priority,
}: {
  activity: DemoActivity
  priority: boolean
}) {
  const sortedOffers = sortOffers(activity.offers.filter(isOfferAvailable))
  const fromOffer = sortedOffers[0]

  return (
    <li className="h-full">
      <Link
        href={`/activities/${activity.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-[border-color,box-shadow,transform] duration-300 hover:border-primary/40 hover:shadow-lifted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {activity.image ? (
            <Image
              src={activity.image}
              alt={activity.imageAlt}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.04] motion-reduce:transition-none"
            />
          ) : (
            <div
              role="img"
              aria-label={activity.imageAlt}
              className="flex size-full items-center justify-center bg-accent text-primary/60"
            >
              <Mountain className="size-10" aria-hidden="true" />
            </div>
          )}
          <span className="absolute top-3 right-3 rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold tracking-wide text-mist uppercase">
            {activity.category}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
            <MapPin className="size-3.5" aria-hidden="true" />
            {activity.cardLocation}
          </p>
          <h3 className="mt-2 font-heading text-lg font-semibold tracking-tight">
            {activity.name}
          </h3>

          <div className="mt-auto border-t border-border pt-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Starting at</p>
                <p className="mt-0.5 text-lg font-bold text-primary tabular-nums">
                  {fromOffer
                    ? formatPrice(fromOffer.price, fromOffer.currency)
                    : "—"}
                </p>
              </div>
              <span className="grid size-9 place-items-center rounded-full bg-accent text-accent-foreground transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              Compare {activity.offers.length} offers
            </p>
          </div>
        </div>
      </Link>
    </li>
  )
}

export default function HomePage() {
  const activities = getActivities()
  const outing = getNextOuting()
  const upcoming = getListedOutings().slice(0, 3)
  const offerCount = getTotalOfferCount()
  const outingStats = getOutingStats()

  const steps = [
    {
      icon: Search,
      title: "Compare offers",
      copy: "See each company's price, what's included and when it was checked.",
    },
    {
      icon: MessageCircle,
      title: "Send a request",
      copy: "Pick a date and group size. It takes about two minutes.",
    },
    {
      icon: ShieldCheck,
      title: "We confirm with you",
      copy: "We check with the company and contact you. Nothing is paid online.",
    },
  ]

  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-5 pt-8 sm:px-8 sm:pt-12 lg:px-10 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-3 py-1 text-xs font-semibold tracking-[0.16em] text-accent-foreground uppercase">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
              Pokhara, Nepal
            </p>
            <h1 className="mt-5 max-w-xl text-balance text-4xl leading-[1.08] font-bold tracking-tight sm:text-5xl lg:text-[3.6rem]">
              Adventure activities, without the guesswork.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Paragliding, boating, ziplines and hikes around the lake. Compare
              offers from local companies and send a booking request.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                nativeButton={false}
                render={<Link href="#activities" />}
                className="h-11 gap-2 rounded-lg px-5"
              >
                Browse activities
                <ArrowRight aria-hidden="true" />
              </Button>
              <Button
                nativeButton={false}
                render={<Link href="/outings" />}
                variant="outline"
                className="h-11 rounded-lg px-5"
              >
                Group outings
              </Button>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 border-t border-border pt-6 text-sm">
              <div className="pr-4">
                <dt className="text-muted-foreground">Activities</dt>
                <dd className="mt-1 text-xl font-bold tabular-nums">
                  {activities.length}
                </dd>
              </div>
              <div className="border-l border-border px-4">
                <dt className="text-muted-foreground">Offers</dt>
                <dd className="mt-1 text-xl font-bold tabular-nums">
                  {offerCount}
                </dd>
              </div>
              <div className="border-l border-border pl-4">
                <dt className="text-muted-foreground">Upcoming outings</dt>
                <dd className="mt-1 text-xl font-bold tabular-nums">
                  {outingStats.upcoming}
                </dd>
              </div>
            </dl>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-lg lg:aspect-[5/4]">
              <Image
                src="/images/phewa-machhapuchhre.jpg"
                alt="Phewa Lake below forested hills, with Machhapuchhre and the Annapurna range under a clear blue sky"
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="absolute right-4 bottom-4 left-4 max-w-sm rounded-xl bg-ink p-4 text-mist shadow-lg sm:right-6 sm:bottom-6 sm:left-6">
              <p className="text-xs font-semibold tracking-wide text-mist/60 uppercase">
                Phewa Lake
              </p>
              <p className="mt-1 text-sm font-medium">
                Machhapuchhre, 6,993 m, above Phewa Lake
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="how-heading"
        className="mx-auto w-full max-w-7xl px-5 pt-16 sm:px-8 sm:pt-20 lg:px-10"
      >
        <div className="grid gap-8 lg:grid-cols-[0.8fr_2fr]">
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              How booking works
            </p>
            <h2
              id="how-heading"
              className="text-balance text-2xl font-bold tracking-tight sm:text-3xl"
            >
              A simple three-step process
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Compare, request, then confirm with the company.
            </p>
          </div>

          <ol className="grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="rounded-xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-9 place-items-center rounded-lg bg-accent text-accent-foreground">
                    <step.icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="grid size-7 place-items-center rounded-full border border-primary/20 bg-mist text-xs font-bold text-accent-foreground tabular-nums">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-heading text-base font-semibold">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {step.copy}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="featured-heading"
        className="mx-auto w-full max-w-7xl px-5 pt-16 sm:px-8 sm:pt-20 lg:px-10"
      >
        <div className="grid overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:grid-cols-2">
          <div className="flex flex-col gap-5 p-6 sm:p-8 lg:p-10">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              Next group outing
            </p>
            <div className="space-y-2">
              <h2
                id="featured-heading"
                className="text-balance text-2xl font-bold tracking-tight sm:text-3xl"
              >
                {outing.title}
              </h2>
              <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
                Hikes and trips with other travellers, run by local organizers.
                Register your interest and they contact you.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-mist px-3 py-2">
                <CalendarDays
                  className="size-4 text-primary"
                  aria-hidden="true"
                />
                {outing.dateLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-mist px-3 py-2">
                <MapPin className="size-4 text-primary" aria-hidden="true" />
                {outing.destination}
              </span>
            </div>

            <div className="border-t border-border pt-5">
              <h3 className="text-sm font-semibold">Also coming up</h3>
              <ul className="mt-2 divide-y divide-border">
                {upcoming.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/outings/${item.slug}`}
                      className="group flex items-baseline justify-between gap-4 rounded-md py-2.5 text-sm transition-colors hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      <span className="font-medium">{item.title}</span>
                      <span className="flex shrink-0 items-center gap-1 text-muted-foreground tabular-nums">
                        {item.dateLabel}
                        <ArrowUpRight
                          className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                          aria-hidden="true"
                        />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto flex flex-wrap gap-3 pt-2">
              <Button
                nativeButton={false}
                render={<Link href={`/outings/${outing.slug}`} />}
                className="h-11 rounded-lg px-5"
              >
                View outing
                <ArrowRight aria-hidden="true" />
              </Button>
              <Button
                nativeButton={false}
                render={<Link href="/outings" />}
                variant="outline"
                className="h-11 rounded-lg px-5"
              >
                All group outings
              </Button>
            </div>
          </div>

          <div className="relative min-h-[300px] bg-muted lg:min-h-[420px]">
            <Image
              src={outing.image ?? "/images/pokhara-dawn.jpg"}
              alt={outing.title}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <OutingDateBadge outing={outing} className="absolute top-4 left-4" />
          </div>
        </div>
      </section>

      <section
        id="activities"
        aria-labelledby="activities-heading"
        className="mx-auto w-full max-w-7xl scroll-mt-20 px-5 pt-16 pb-4 sm:px-8 sm:pt-20 lg:px-10"
      >
        <div className="flex flex-col gap-5 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              Activities
            </p>
            <h2
              id="activities-heading"
              className="text-balance text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Things to do in Pokhara
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              Browse outdoor activities across the valley and the Annapurna
              foothills, then compare offers from local companies and send a
              request.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full border border-border bg-card px-3 py-1.5 font-medium text-muted-foreground">
              {activities.length} activities
            </span>
            <span className="rounded-full border border-border bg-card px-3 py-1.5 font-medium text-muted-foreground">
              {offerCount} offers to compare
            </span>
          </div>
        </div>

        <p className="pt-6 text-sm font-medium text-muted-foreground">
          Showing {activities.length} activities, A to Z
        </p>

        <ul className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity, index) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              priority={index < 3}
            />
          ))}
        </ul>
      </section>
    </>
  )
}
