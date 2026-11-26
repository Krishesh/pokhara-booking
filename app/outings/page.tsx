import type { Metadata } from "next"
import Image from "next/image"
import { Handshake, PhoneCall, UserPlus, type LucideIcon } from "lucide-react"

import { NextOutingCard, OutingCard } from "@/components/outing-card"
import { getNextOuting, getOutingStats, groupOutings } from "@/lib/demo-data"

export const metadata: Metadata = {
  title: "Group outings",
  description:
    "Hikes and trips with other travellers around Pokhara, run by local organizers.",
}

function Step({
  icon: Icon,
  title,
  index,
  children,
}: {
  icon: LucideIcon
  title: string
  index: number
  children: React.ReactNode
}) {
  return (
    <li className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="grid size-9 place-items-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="text-xs font-semibold text-muted-foreground tabular-nums">
          0{index + 1}
        </span>
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {children}
      </p>
    </li>
  )
}

export default function OutingsPage() {
  const stats = getOutingStats()
  const nextOuting = getNextOuting()
  const groups = groupOutings()

  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-5 pt-6 sm:px-8 sm:pt-8">
        <div className="grid overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5 p-6 sm:p-10">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              Group outings
            </p>
            <h1 className="max-w-2xl text-4xl leading-[1.05] font-bold tracking-tight sm:text-5xl">
              Meet the mountains with other travellers.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
              Hikes and trips with other travellers, run by local organizers.
              Pick a date, register your interest and the organizer contacts
              you.
            </p>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-lg bg-muted px-3 py-2 font-medium">
                {stats.upcoming} upcoming{" "}
                {stats.upcoming === 1 ? "outing" : "outings"}
              </span>
              <span className="rounded-lg bg-muted px-3 py-2 font-medium">
                {stats.organizers} local{" "}
                {stats.organizers === 1 ? "organizer" : "organizers"}
              </span>
            </div>
          </div>

          <div className="relative min-h-[280px] bg-muted lg:min-h-[380px]">
            <Image
              src="/images/pokhara-dawn.jpg"
              alt="Machhapuchhre and the Annapurna range at dawn, reflected in still water at Pokhara"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="steps-heading"
        className="mx-auto w-full max-w-7xl px-5 pt-12 sm:px-8"
      >
        <div className="grid gap-6 lg:grid-cols-[0.8fr_2fr]">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              How it works
            </p>
            <h2
              id="steps-heading"
              className="text-2xl font-bold tracking-tight sm:text-3xl"
            >
              Join an outing in three steps
            </h2>
          </div>

          <ol className="grid gap-3 sm:grid-cols-3">
            <Step icon={UserPlus} title="Register your interest" index={0}>
              Leave your name, contact and group size. It takes a minute.
            </Step>
            <Step icon={PhoneCall} title="The organizer contacts you" index={1}>
              They confirm the plan, the meeting point and the cost.
            </Step>
            <Step icon={Handshake} title="Join the group" index={2}>
              Pay the organizer directly. Nothing is charged on this site.
            </Step>
          </ol>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <section aria-labelledby="next-heading" className="pt-14">
          <h2
            id="next-heading"
            className="pb-5 text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Next outing
          </h2>
          <NextOutingCard outing={nextOuting} />
        </section>

        {groups.map((group) => (
          <section
            key={group.key}
            aria-labelledby={`month-${group.key}`}
            className="pt-14"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <h2
                id={`month-${group.key}`}
                className="text-2xl font-bold tracking-tight sm:text-3xl"
              >
                {group.label}
              </h2>
              <p className="rounded-lg bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground">
                {group.outings.length}{" "}
                {group.outings.length === 1 ? "outing" : "outings"}
              </p>
            </div>
            <ul className="grid grid-cols-1 gap-5 pt-6 sm:grid-cols-2 lg:grid-cols-3">
              {group.outings.map((outing) => (
                <OutingCard key={outing.id} outing={outing} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  )
}
