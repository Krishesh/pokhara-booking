import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, CalendarDays, Info, MapPin, Users, Wallet } from "lucide-react";

import { ActivityImage } from "@/components/activity-image";
import { InterestForm } from "@/components/interest-form";
import { OutingStateBadge } from "@/components/outing-status-badge";
import { todayInTimeZone } from "@/lib/booking";
import { formatOutingDate, outingState } from "@/lib/outings";
import { getPublicOutingBySlug } from "@/lib/outings-data";

export async function generateMetadata({ params }: PageProps<"/outings/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const outing = await getPublicOutingBySlug(slug);
  if (!outing) return { title: "Outing not found" };
  return {
    title: outing.title,
    description: `${formatOutingDate(outing.outing_date)} · ${outing.destination}. ${outing.description?.split("\n")[0] ?? ""}`.trim(),
  };
}

export default async function OutingPage({ params }: PageProps<"/outings/[slug]">) {
  await connection();
  const { slug } = await params;
  const outing = await getPublicOutingBySlug(slug);
  if (!outing) notFound();
  const state = outingState(outing, todayInTimeZone(new Date()));

  const facts = [
    { icon: CalendarDays, label: "Date", value: formatOutingDate(outing.outing_date) },
    { icon: MapPin, label: "Destination", value: outing.destination },
    { icon: Users, label: "Organizer", value: outing.organizer_name },
    { icon: Wallet, label: "Cost", value: outing.cost_info ?? "To be confirmed" },
  ];

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Link href="/outings" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        All group outings
      </Link>

      <figure className="space-y-2">
        <ActivityImage src={outing.image_url} alt={outing.title} className="rounded-xl" priority />
        {outing.image_url && outing.image_credit && (
          <figcaption className="text-xs text-muted-foreground">{outing.image_credit}</figcaption>
        )}
      </figure>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{outing.title}</h1>
          <OutingStateBadge state={state} />
        </div>
        {state === "cancelled" && (
          <p role="alert" className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">
            <Info className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
            This outing has been cancelled. People who registered interest will be contacted.
          </p>
        )}
        {state === "past" && (
          <p className="flex gap-2 rounded-lg border bg-muted/50 p-3 text-sm">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            This outing has already taken place. <Link href="/outings" className="underline">See upcoming outings</Link>.
          </p>
        )}
      </header>

      <dl className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
        {facts.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex gap-3">
            <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div>
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-sm">{value}</dd>
            </div>
          </div>
        ))}
      </dl>

      {outing.description && <p className="leading-relaxed whitespace-pre-line">{outing.description}</p>}

      <section className="space-y-1">
        <h2 className="text-lg font-semibold">Meeting point</h2>
        <p className="text-sm whitespace-pre-line text-muted-foreground">
          {outing.meeting_details ?? "To be confirmed. The organizer will share it with people who registered."}
        </p>
      </section>

      {state === "open" ? (
        <InterestForm outingId={outing.id} />
      ) : (
        <p className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
          {state === "cancelled" ? "This outing isn't taking interest any more." : "Registration is closed for this outing."}
        </p>
      )}
    </article>
  );
}
