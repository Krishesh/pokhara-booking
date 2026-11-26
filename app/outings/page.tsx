import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Handshake, PhoneCall, UserPlus, type LucideIcon } from "lucide-react"

import { NextOutingCard, OutingCard } from "@/components/outing-card"
import { Button } from "@/components/ui/button"
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
    <li className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="grid size-9 place-items-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <span className="grid size-7 place-items-center rounded-full border border-primary/20 bg-mist text-xs font-bold text-accent-foreground tabular-nums">
          0{index + 1}
        </span>
      </div>
      <h3 className="mt-5 font-heading font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
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
      <section className="mx-auto w-full max-w-7xl px-5 pt-8 sm:px-8 sm:pt-12 lg:px-10 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-3 py-1 text-xs font-semibold tracking-[0.16em] text-accent-foreground uppercase">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
              Group outings
            </p>
            <h1 className="mt-5 text-balance text-4xl leading-[1.08] font-bold tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Meet the mountains with other travellers.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Hikes and trips with other travellers, run by local organizers.
              Pick a date, register your interest and the organizer contacts
              you.
            </p>

            <div className="mt-7 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full border border-border bg-card px-3 py-1.5 font-medium text-muted-foreground">
                {stats.upcoming} upcoming{" "}
                {stats.upcoming === 1 ? "outing" : "outings"}
              </span>
              <span className="rounded-full border border-border bg-card px-3 py-1.5 font-medium text-muted-foreground">
                {stats.organizers} local{" "}
                {stats.organizers === 1 ? "organizer" : "organizers"}
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                nativeButton={false}
                render={<Link href="#next-heading" />}
                className="h-11 rounded-lg px-5"
              >
                See next outing
              </Button>
              <Button
                nativeButton={false}
                render={<Link href="/" />}
                variant="outline"
                className="h-11 rounded-lg px-5"
              >
                Browse activities
              </Button>
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-lg lg:aspect-[5/4]">
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
        className="mx-auto w-full max-w-7xl px-5 pt-16 sm:px-8 sm:pt-20 lg:px-10"
      >
        <div className="grid gap-8 lg:grid-cols-[0.8fr_2fr]">
          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              How it works
            </p>
            <h2
              id="steps-heading"
              className="text-balance text-2xl font-bold tracking-tight sm:text-3xl"
            >
              Join an outing in three steps
            </h2>
          </div>

          <ol className="grid gap-4 sm:grid-cols-3">
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

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
        <section
          aria-labelledby="next-heading"
          className="scroll-mt-24 pt-16 sm:pt-20"
        >
          <div className="mb-6 space-y-2">
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              Coming up soon
            </p>
            <h2
              id="next-heading"
              className="text-2xl font-bold tracking-tight sm:text-3xl"
            >
              Next outing
            </h2>
          </div>
          <NextOutingCard outing={nextOuting} />
        </section>

        {groups.map((group) => (
          <section
            key={group.key}
            aria-labelledby={`month-${group.key}`}
            className="pt-16 sm:pt-20"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
              <h2
                id={`month-${group.key}`}
                className="text-2xl font-bold tracking-tight sm:text-3xl"
              >
                {group.label}
              </h2>
              <p className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground">
                {group.outings.length}{" "}
                {group.outings.length === 1 ? "outing" : "outings"}
              </p>
            </div>
            <ul className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-2 lg:grid-cols-3">
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
