import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  CircleDollarSign,
  MapPin,
  MessageCircle,
  Mountain,
  ShieldCheck,
} from "lucide-react"

import { OfferList } from "@/components/offer-list"
import { Button } from "@/components/ui/button"
import { isRequestableOffer } from "@/lib/booking"
import {
  getActivities,
  getActivityBySlug,
  getRelatedActivities,
  type DemoActivity,
} from "@/lib/demo-data"
import { isOfferAvailable } from "@/lib/offer-format"

interface ActivityPageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getActivities().map((activity) => ({ slug: activity.slug }))
}

export async function generateMetadata({
  params,
}: ActivityPageProps): Promise<Metadata> {
  const { slug } = await params
  const activity = getActivityBySlug(slug)

  if (!activity) {
    return { title: "We couldn't find that page" }
  }

  return {
    title: activity.name,
    description: activity.description.join(" "),
  }
}

function ActivityPhoto({ activity }: { activity: DemoActivity }) {
  if (!activity.image) {
    return (
      <div
        role="img"
        aria-label={`${activity.name} (no photo available)`}
        className="flex size-full items-center justify-center bg-accent text-primary/60"
      >
        <Mountain className="size-10" aria-hidden="true" />
      </div>
    )
  }

  return (
    <Image
      src={activity.image}
      alt={activity.imageAlt}
      fill
      priority
      sizes="(min-width: 1024px) 50vw, 100vw"
      className="object-cover"
    />
  )
}

export default async function ActivityDetailPage({
  params,
}: ActivityPageProps) {
  const { slug } = await params
  const activity = getActivityBySlug(slug)

  if (!activity) {
    notFound()
  }

  const offers = activity.offers
    .filter(isOfferAvailable)
    .filter(isRequestableOffer)
  const related = getRelatedActivities(activity)

  return (
    <article className="mx-auto w-full max-w-7xl px-5 pt-6 sm:px-8 sm:pt-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-md py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All activities
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col justify-center space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="inline-flex w-fit rounded-full border border-primary/20 bg-accent px-3 py-1 text-xs font-semibold tracking-[0.16em] text-accent-foreground uppercase">
            {activity.category}
          </p>
          <h1 className="text-balance text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
            {activity.name}
          </h1>
          <p className="flex items-center gap-1.5 text-base text-muted-foreground">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            {activity.location}, Pokhara
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full border border-border bg-mist px-3 py-1.5 font-medium text-muted-foreground">
              {offers.length} bookable offers
            </span>
            <span className="rounded-full border border-border bg-mist px-3 py-1.5 font-medium text-muted-foreground">
              No payment online
            </span>
          </div>
          <div>
            <Button
              nativeButton={false}
              render={<Link href="#offers" />}
              className="h-11 rounded-lg px-5"
            >
              Compare offers
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </div>

        <figure className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-sm lg:aspect-auto lg:min-h-[360px]">
          <ActivityPhoto activity={activity} />
          {activity.credit ? (
            <figcaption className="absolute right-0 bottom-0 left-0 bg-ink px-3 py-2 text-xs text-mist">
              {activity.credit}
            </figcaption>
          ) : null}
        </figure>
      </div>

      <div className="grid gap-8 pt-10 lg:grid-cols-12">
        <section
          aria-labelledby="about-heading"
          className="space-y-3 lg:col-span-7"
        >
          <h2
            id="about-heading"
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            About this activity
          </h2>
          {activity.description.map((paragraph) => (
            <p
              key={paragraph}
              className="max-w-[65ch] text-base leading-relaxed text-muted-foreground"
            >
              {paragraph}
            </p>
          ))}
        </section>

        <aside
          aria-labelledby="request-heading"
          className="lg:col-span-4 lg:col-start-9"
        >
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 id="request-heading" className="font-heading text-lg font-semibold">
              How requesting works
            </h2>
            <ol className="mt-4 space-y-4">
              <li className="flex gap-3 text-sm leading-snug">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                  <MessageCircle className="size-4" aria-hidden="true" />
                </span>
                <span>
                  Pick an offer and send a request with your date and group
                  size.
                </span>
              </li>
              <li className="flex gap-3 text-sm leading-snug">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                  <ShieldCheck className="size-4" aria-hidden="true" />
                </span>
                <span>
                  We check the date with the company, then contact you to
                  confirm.
                </span>
              </li>
              <li className="flex gap-3 text-sm leading-snug">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                  <CircleDollarSign className="size-4" aria-hidden="true" />
                </span>
                <span>
                  Nothing is charged online. You pay the company directly.
                </span>
              </li>
            </ol>
          </div>
        </aside>
      </div>

      <div className="pt-16 sm:pt-20">
        <OfferList offers={offers} activityName={activity.name} />
      </div>

      <section aria-labelledby="more-heading" className="pt-16 sm:pt-20">
        <h2
          id="more-heading"
          className="pb-4 text-2xl font-bold tracking-tight sm:text-3xl"
        >
          More to do in Pokhara
        </h2>
        <ul className="grid gap-5 sm:grid-cols-3">
          {related.map((item) => (
            <li key={item.slug} className="h-full">
              <Link
                href={`/activities/${item.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-[border-color,box-shadow,transform] duration-300 hover:border-primary/40 hover:shadow-lifted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.imageAlt}
                      fill
                      sizes="(min-width: 640px) 33vw, 100vw"
                      className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.04] motion-reduce:transition-none"
                    />
                  ) : (
                    <div
                      role="img"
                      aria-label={`${item.name} (no photo available)`}
                      className="flex size-full items-center justify-center bg-accent text-primary/60"
                    >
                      <Mountain className="size-10" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="space-y-1 p-4">
                  <h3 className="font-heading font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.cardLocation}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}
