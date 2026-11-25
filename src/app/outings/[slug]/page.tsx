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
import { Reveal } from "@/components/reveal";

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

        <figure className="pt-4">
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-ink text-white">
            <ActivityImage
              src={outing.image_url}
              alt={outing.title}
              priority
              sizes="(min-width: 1280px) 1216px, 100vw"
              aspect="none"
              className="-z-10 h-[58svh] max-h-[680px] min-h-[400px] motion-safe:[&_img]:animate-drift"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-x-0 bottom-0 space-y-3 p-6 sm:p-10">
              <h1 className="max-w-[20ch] text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] font-extrabold tracking-[-0.04em] motion-safe:animate-rise">
                {outing.title}
              </h1>
              <p className="flex max-w-[52ch] flex-wrap items-center gap-x-3 gap-y-2 text-lg font-medium text-white motion-safe:animate-rise motion-safe:[animation-delay:100ms] sm:text-xl">
                <span>
                  A group outing to {outing.destination}, {outing.outing_date ? `on ${formatOutingDate(outing.outing_date)}` : "date to be confirmed"}.
                </span>
                <OutingStateBadge state={state} />
              </p>
            </div>
          </div>
          {outing.image_url && outing.image_credit && (
            <figcaption className="px-2 pt-3 text-[13px] text-muted-foreground">Photo: {outing.image_credit}</figcaption>
          )}
        </figure>

        <dl className="mt-6 grid gap-2 rounded-3xl bg-card p-2 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex gap-3 rounded-2xl p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-teal-soft text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="text-base font-semibold">{value}</dd>
              </div>
            </div>
          ))}
        </dl>

        {state === "cancelled" && (
          <p role="alert" className="mt-6 flex gap-3 rounded-2xl bg-destructive/10 p-5 text-base">
            <Info className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
            This outing has been cancelled. People who registered interest will be contacted.
          </p>
        )}
        {state === "past" && (
          <p className="mt-6 flex gap-3 rounded-2xl bg-card p-5 text-base">
            <Info className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <span>
              This outing has already taken place.{" "}
              <Link href="/outings" className="font-semibold text-primary underline underline-offset-4">
                See upcoming outings
              </Link>
            </span>
          </p>
        )}

        <div className="grid gap-12 pt-14 sm:pt-20 lg:grid-cols-12">
          <div className="space-y-12 lg:col-span-7">
            <Reveal as="section" className="space-y-5">
              <h2 id="about-heading" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                About this outing
              </h2>
              {paragraphs.length > 0 ? (
                paragraphs.map((p) => (
                  <p key={p} className="max-w-[62ch] text-lg leading-relaxed">
                    {p}
                  </p>
                ))
              ) : (
                <p className="text-lg text-muted-foreground">The organizer will share the plan with people who register.</p>
              )}
            </Reveal>

            <Reveal as="section" delay={1} className="space-y-3">
              <h2 id="meeting-heading" className="text-2xl font-bold tracking-tight">
                Meeting point
              </h2>
              <p className="max-w-[62ch] text-lg leading-relaxed whitespace-pre-line">
                {outing.meeting_details ?? "To be confirmed. The organizer will share it with people who registered."}
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-5 lg:col-start-8 xl:col-span-4 xl:col-start-9">
            <div className="lg:sticky lg:top-6">
              {state === "open" ? (
                <InterestForm outingId={outing.id} />
              ) : (
                <p className="rounded-3xl bg-card p-6 text-base text-muted-foreground">
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
