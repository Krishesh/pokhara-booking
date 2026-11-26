import Image from "next/image"
import Link from "next/link"
import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Mountain,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { DemoOuting } from "@/lib/demo-data"
import { cn } from "@/lib/utils"

interface OutingImageProps {
  outing: DemoOuting
  priority?: boolean
  sizes: string
}

export function OutingImage({ outing, priority, sizes }: OutingImageProps) {
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
      priority={priority}
      sizes={sizes}
      className="object-cover"
    />
  )
}

interface OutingDateBadgeProps {
  outing: DemoOuting
  className?: string
}

export function OutingDateBadge({ outing, className }: OutingDateBadgeProps) {
  if (!outing.day || !outing.monthShort || !outing.weekday) {
    return null
  }

  return (
    <span
      className={cn(
        "flex w-14 flex-col items-center rounded-lg bg-ink px-2 py-1.5 text-white",
        className
      )}
    >
      <span className="text-xs leading-none font-semibold text-white/70 uppercase">
        {outing.monthShort}
      </span>
      <span className="text-xl leading-tight font-bold tabular-nums">
        {outing.day}
      </span>
      <span className="text-xs leading-none font-medium text-white/60">
        {outing.weekday}
      </span>
    </span>
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
    <div className="flex gap-2.5">
      <Icon
        className="mt-0.5 size-4 shrink-0 text-primary"
        aria-hidden="true"
      />
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="font-medium">{value}</dd>
      </div>
    </div>
  )
}

export function OutingCard({ outing }: { outing: DemoOuting }) {
  const cancelled = outing.status === "cancelled"

  return (
    <li>
      <Link
        href={`/outings/${outing.slug}`}
        className={cn(
          "group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
          cancelled ? "opacity-75" : "hover:border-primary/60"
        )}
      >
        <div className="relative">
          <div
            className={cn(
              "relative aspect-[4/3] w-full overflow-hidden bg-muted",
              cancelled && "grayscale"
            )}
          >
            <OutingImage
              outing={outing}
              sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            />
          </div>
          <OutingDateBadge outing={outing} className="absolute top-3 left-3" />
          {cancelled ? (
            <span className="absolute top-3 right-3">
              <Badge variant="destructive">Cancelled</Badge>
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-4 p-5">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold tracking-tight">
              {outing.title}
            </h3>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin
                className="size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              {outing.destination}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users
                className="size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              {outing.organizer}
            </p>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3 text-sm">
            <span className="truncate text-muted-foreground">
              {cancelled
                ? "Not taking interest"
                : outing.status === "tbc"
                  ? "Cost to be confirmed"
                  : outing.cost}
            </span>
            <span className="flex shrink-0 items-center gap-1 font-semibold text-primary">
              Details
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </li>
  )
}

export function NextOutingCard({ outing }: { outing: DemoOuting }) {
  return (
    <Link
      href={`/outings/${outing.slug}`}
      className="group grid overflow-hidden rounded-xl border border-border bg-card hover:border-primary/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none lg:grid-cols-[1.1fr_0.9fr]"
    >
      <div className="flex flex-col gap-5 p-6 sm:p-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            Register your interest
          </p>
          <h3 className="text-2xl font-bold tracking-tight">{outing.title}</h3>
          <p className="line-clamp-3 text-base leading-relaxed text-muted-foreground">
            {outing.summary}
          </p>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <Detail icon={CalendarDays} label="Date" value={outing.dateLabel} />
          <Detail
            icon={MapPin}
            label="Destination"
            value={outing.destination}
          />
          <Detail icon={Users} label="Organizer" value={outing.organizer} />
          <Detail icon={Wallet} label="Cost" value={outing.cost} />
        </dl>

        <span className="mt-auto inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors group-hover:bg-accent-foreground">
          See details and register
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </span>
      </div>

      <div className="relative min-h-[280px] bg-muted lg:min-h-[360px]">
        <OutingImage
          outing={outing}
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
        />
        <OutingDateBadge outing={outing} className="absolute top-4 left-4" />
      </div>
    </Link>
  )
}

export function RelatedOutingCard({ outing }: { outing: DemoOuting }) {
  return (
    <li>
      <Link
        href={`/outings/${outing.slug}`}
        className="group block overflow-hidden rounded-xl border border-border bg-card hover:border-primary/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          <OutingImage outing={outing} sizes="(min-width: 640px) 33vw, 100vw" />
        </div>
        <div className="space-y-1 p-4">
          <h3 className="font-semibold">{outing.title}</h3>
          <p className="text-sm text-muted-foreground">
            {outing.dateLabel}, {outing.destination}
          </p>
        </div>
      </Link>
    </li>
  )
}
