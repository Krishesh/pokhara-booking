import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CalendarDays, Info, MapPin, Users, Wallet } from "lucide-react";

import { ActivityImage } from "@/components/activity-image";
import { BackLink } from "@/components/back-link";
import { Container } from "@/components/container";
import { InterestForm } from "@/components/interest-form";
import { OutingStateBadge } from "@/components/outing-status-badge";
import { todayInTimeZone } from "@/lib/booking";
import { formatOutingDate, outingState } from "@/lib/outings";
import { getPublicOutingBySlug, listPublicOutings } from "@/lib/outings-data";
import { MoreStrip } from "@/components/more-strip";

export async function generateMetadata({ params }: PageProps<"/outings/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const outing = await getPublicOutingBySlug(slug);
  if (!outing) return { title: "Outing not found" };
  return {
    title: outing.title,
    description: `${formatOutingDate(outing.outing_date)}, ${outing.destination}. ${outing.description?.split("\n")[0] ?? ""}`.trim(),
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
  const paragraphs = outing.description?.split("\n").filter(Boolean) ?? [];

  return (
    <article>
      <Container>
        <BackLink href="/outings" label="All group outings" />

        <header className="space-y-2 pt-4 pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{outing.title}</h1>
            <OutingStateBadge state={state} />
          </div>
          <p className="text-base text-muted-foreground">
            A group outing to {outing.destination},{" "}
            {outing.outing_date ? `on ${formatOutingDate(outing.outing_date)}` : "date to be confirmed"}.
          </p>
        </header>

        <figure>
          <ActivityImage
            src={outing.image_url}
            alt={outing.title}
            priority
            sizes="(min-width: 1280px) 1216px, 100vw"
            aspect="none"
            className="aspect-[16/9] max-h-[480px] rounded-2xl"
          />
          {outing.image_url && outing.image_credit && (
            <figcaption className="pt-2 text-xs text-muted-foreground">{outing.image_credit}</figcaption>
          )}
        </figure>

        <dl className="mt-6 grid gap-1 rounded-2xl border border-border bg-card p-2 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex gap-3 rounded-xl p-3">
              <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="text-sm font-medium">{value}</dd>
              </div>
            </div>
          ))}
        </dl>

        {state === "cancelled" && (
          <p role="alert" className="mt-4 flex gap-3 rounded-xl bg-destructive/10 p-4 text-sm">
            <Info className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
            This outing has been cancelled. People who registered interest will be contacted.
          </p>
        )}
        {state === "past" && (
          <p className="mt-4 flex gap-3 rounded-xl bg-card p-4 text-sm">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <span>
              This outing has already taken place.{" "}
              <Link href="/outings" className="font-semibold text-primary underline underline-offset-4">
                See upcoming outings
              </Link>
            </span>
          </p>
        )}

        <div className="grid gap-8 pt-10 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-7">
            <section aria-labelledby="about-heading" className="space-y-3">
              <h2 id="about-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
                About this outing
              </h2>
              {paragraphs.length > 0 ? (
                paragraphs.map((p) => (
                  <p key={p} className="max-w-[65ch] text-base leading-relaxed">
                    {p}
                  </p>
                ))
              ) : (
                <p className="text-muted-foreground">The organizer will share the plan with people who register.</p>
              )}
            </section>

            <section aria-labelledby="meeting-heading" className="space-y-2">
              <h2 id="meeting-heading" className="text-lg font-semibold">
                Meeting point
              </h2>
              <p className="max-w-[65ch] text-base leading-relaxed whitespace-pre-line">
                {outing.meeting_details ?? "To be confirmed. The organizer will share it with people who registered."}
              </p>
            </section>
          </div>

          <div className="lg:col-span-5 lg:col-start-8 xl:col-span-4 xl:col-start-9">
            <div className="lg:sticky lg:top-6">
              {state === "open" ? (
                <InterestForm outingId={outing.id} />
              ) : (
                <p className="rounded-2xl bg-card p-6 text-sm text-muted-foreground">
                  {state === "cancelled"
                    ? "This outing isn't taking interest any more."
                    : "Registration is closed for this outing."}
                </p>
              )}
            </div>
          </div>
        </div>

        <MoreOutings currentId={outing.id} />
      </Container>
    </article>
  );
}

async function MoreOutings({ currentId }: { currentId: string }) {
  const today = todayInTimeZone(new Date());
  const others = (await listPublicOutings()).filter((o) => o.id !== currentId && outingState(o, today) === "open");
  return (
    <MoreStrip
      heading="Other group outings"
      items={others.map((o) => ({
        href: `/outings/${o.slug}`,
        title: o.title,
        detail: `${formatOutingDate(o.outing_date)}, ${o.destination}`,
        image_url: o.image_url,
      }))}
    />
  );
}
