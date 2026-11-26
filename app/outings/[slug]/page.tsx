import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  CalendarDays,
  Info,
  MapPin,
  Mountain,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import { OutingInterestForm } from "@/components/outing-interest-form"
import { RelatedOutingCard } from "@/components/outing-card"
import { Badge } from "@/components/ui/badge"
import {
  getOutingBySlug,
  getOutings,
  getRelatedOutings,
  type DemoOuting,
} from "@/lib/demo-data"

interface OutingPageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getOutings().map((outing) => ({ slug: outing.slug }))
}

export async function generateMetadata({
  params,
}: OutingPageProps): Promise<Metadata> {
  const { slug } = await params
  const outing = getOutingBySlug(slug)

  if (!outing) {
    return { title: "We couldn't find that page" }
  }

  return {
    title: outing.title,
    description: outing.summary,
  }
}

function OutingPhoto({ outing }: { outing: DemoOuting }) {
  if (!outing.image) {
    return (
      <div
        role="img"
        aria-label={`${outing.title} (no photo available)`}
        className="flex size-full items-center justify-center bg-accent text-primary/60"
      >
        <Mountain className="size-10" aria-hidden="true" />
      </div>
    )
  }

  return (
    <Image
      src={outing.image}
      alt={outing.imageAlt}
      fill
      priority
      sizes="(min-width: 1024px) 50vw, 100vw"
      className="object-cover"
    />
  )
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 bg-card p-4">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 text-sm font-medium">{value}</dd>
      </div>
    </div>
  )
}

export default async function OutingDetailPage({ params }: OutingPageProps) {
  const { slug } = await params
  const outing = getOutingBySlug(slug)

  if (!outing) {
    notFound()
  }

  const cancelled = outing.status === "cancelled"
  const related = getRelatedOutings(outing)

  return (
    <article className="mx-auto w-full max-w-7xl px-5 pt-6 sm:px-8 sm:pt-8">
      <Link
        href="/outings"
        className="inline-flex items-center gap-2 rounded-md py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All group outings
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col justify-center space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              Group outing
            </p>
            {cancelled ? <Badge variant="destructive">Cancelled</Badge> : null}
          </div>
          <h1 className="text-balance text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
            {outing.title}
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            A group outing to {outing.destination},{" "}
            {outing.date ? `on ${outing.dateLabel}` : "date to be confirmed"}.
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full border border-border bg-mist px-3 py-1.5 font-medium text-muted-foreground">
              {outing.organizer}
            </span>
            <span className="rounded-full border border-border bg-mist px-3 py-1.5 font-medium text-muted-foreground">
              {cancelled ? "Not taking interest" : outing.cost}
            </span>
          </div>
        </div>

        <figure className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-sm lg:aspect-auto lg:min-h-[360px]">
          <OutingPhoto outing={outing} />
          {outing.credit ? (
            <figcaption className="absolute right-0 bottom-0 left-0 bg-ink px-3 py-2 text-xs text-mist">
              {outing.credit}
            </figcaption>
          ) : null}
        </figure>
      </div>

      <dl className="mt-6 grid gap-px overflow-hidden rounded-xl border border-border bg-border shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <Detail icon={CalendarDays} label="Date" value={outing.dateLabel} />
        <Detail icon={MapPin} label="Destination" value={outing.destination} />
        <Detail icon={Users} label="Organizer" value={outing.organizer} />
        <Detail icon={Wallet} label="Cost" value={outing.cost} />
      </dl>

      {cancelled ? (
        <p
          role="alert"
          className="mt-4 flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm"
        >
          <Info
            className="mt-0.5 size-4 shrink-0 text-destructive"
            aria-hidden="true"
          />
          This outing has been cancelled. People who registered interest will be
          contacted.
        </p>
      ) : null}

      <div className="grid gap-8 pt-10 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-7">
          <section aria-labelledby="about-heading" className="space-y-3">
            <h2
              id="about-heading"
              className="text-balance text-2xl font-bold tracking-tight sm:text-3xl"
            >
              About this outing
            </h2>
            {outing.about.map((paragraph) => (
              <p
                key={paragraph}
                className="max-w-[65ch] text-base leading-relaxed text-muted-foreground"
              >
                {paragraph}
              </p>
            ))}
          </section>

          <section aria-labelledby="meeting-heading" className="space-y-2">
            <h2 id="meeting-heading" className="text-lg font-semibold">
              Meeting point
            </h2>
            <p className="max-w-[65ch] text-base leading-relaxed whitespace-pre-line text-muted-foreground">
              {outing.meeting}
            </p>
          </section>
        </div>

        <div className="lg:col-span-5 lg:col-start-8 xl:col-span-4 xl:col-start-9">
          <div className="lg:sticky lg:top-24">
            {outing.takesInterest ? (
              <OutingInterestForm
                outingId={outing.id}
                outingTitle={outing.title}
                organizer={outing.organizer}
              />
            ) : null}
          </div>
        </div>
      </div>

      <section aria-labelledby="more-heading" className="pt-16 sm:pt-20">
        <h2
          id="more-heading"
          className="pb-4 text-2xl font-bold tracking-tight sm:text-3xl"
        >
          Other group outings
        </h2>
        <ul className="grid gap-5 sm:grid-cols-3">
          {related.map((item) => (
            <RelatedOutingCard key={item.id} outing={item} />
          ))}
        </ul>
      </section>
    </article>
  )
}
