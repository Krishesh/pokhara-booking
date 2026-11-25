import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircleDollarSign, MapPin, MessageCircle, ShieldCheck } from "lucide-react";

import { ActivityImage } from "@/components/activity-image";
import { BackLink } from "@/components/back-link";
import { Container } from "@/components/container";
import { OfferList, OfferListSkeleton } from "@/components/offer-list";
import { MoreStrip } from "@/components/more-strip";
import { Reveal } from "@/components/reveal";
import { getPublishedActivities, getPublishedActivityBySlug } from "@/lib/activities";

export async function generateMetadata({
  params,
}: PageProps<"/activities/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const activity = await getPublishedActivityBySlug(slug);
  if (!activity) return { title: "Activity not found" };

  return {
    title: activity.name,
    description: activity.description?.split("\n")[0] ?? undefined,
  };
}

const REQUEST_NOTES = [
  { icon: MessageCircle, text: "Pick an offer and send a request with your date and group size." },
  { icon: ShieldCheck, text: "We check the date with the company, then contact you to confirm." },
  { icon: CircleDollarSign, text: "Nothing is charged online. You pay the company directly." },
];

export default async function ActivityPage({ params }: PageProps<"/activities/[slug]">) {
  const { slug } = await params;
  const activity = await getPublishedActivityBySlug(slug);
  if (!activity) notFound();

  const paragraphs = activity.description?.split("\n").filter(Boolean) ?? [];

  return (
    <article>
      <Container>
        <BackLink href="/" label="All activities" />

        <figure className="pt-4">
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-ink text-white">
            <ActivityImage
              src={activity.image_url}
              alt={activity.name}
              priority
              sizes="(min-width: 1280px) 1216px, 100vw"
              aspect="none"
              className="-z-10 h-[62svh] max-h-[720px] min-h-[420px] motion-safe:[&_img]:animate-drift"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-x-0 bottom-0 space-y-3 p-6 sm:p-10">
              <h1 className="max-w-[18ch] text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] font-extrabold tracking-[-0.04em] motion-safe:animate-rise">
                {activity.name}
              </h1>
              <p className="flex max-w-[48ch] items-start gap-2 text-lg font-medium text-white motion-safe:animate-rise motion-safe:[animation-delay:100ms] sm:text-xl">
                <MapPin className="mt-1 size-5 shrink-0" aria-hidden="true" />
                <span>
                  {sentenceCase(activity.category)}
                  {activity.location ? ` in ${activity.location}, Pokhara.` : " in Pokhara."} Compare offers from local
                  companies and request a date.
                </span>
              </p>
            </div>
          </div>
          {activity.image_url && activity.image_credit && (
            <figcaption className="px-2 pt-3 text-[13px] text-muted-foreground">Photo: {activity.image_credit}</figcaption>
          )}
        </figure>

        <div className="grid gap-10 pt-14 sm:pt-20 lg:grid-cols-12">
          <Reveal as="section" className="space-y-5 lg:col-span-7">
            <h2 id="about-heading" className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              About this activity
            </h2>
            {paragraphs.length > 0 ? (
              paragraphs.map((p) => (
                <p key={p} className="max-w-[62ch] text-lg leading-relaxed">
                  {p}
                </p>
              ))
            ) : (
              <p className="text-lg text-muted-foreground">The companies below describe what each package includes.</p>
            )}
          </Reveal>

          <aside aria-labelledby="request-heading" className="lg:col-span-4 lg:col-start-9">
            <Reveal delay={1} className="space-y-5 rounded-3xl bg-card p-6 sm:p-8">
              <h2 id="request-heading" className="text-xl font-bold tracking-tight">
                How requesting works
              </h2>
              <ul className="space-y-4">
                {REQUEST_NOTES.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex gap-3 text-base leading-snug">
                    <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                    {text}
                  </li>
                ))}
              </ul>
            </Reveal>
          </aside>
        </div>

        <div className="pt-20 sm:pt-28">
          <Suspense fallback={<OfferListSkeleton />}>
            <OfferList activityId={activity.id} activityName={activity.name} />
          </Suspense>
        </div>

        <Suspense fallback={null}>
          <MoreActivities currentId={activity.id} />
        </Suspense>
      </Container>
    </article>
  );
}


async function MoreActivities({ currentId }: { currentId: string }) {
  const others = (await getPublishedActivities()).filter((a) => a.id !== currentId && a.image_url);
  return (
    <MoreStrip
      heading="More to do in Pokhara"
      items={others.map((a) => ({
        href: `/activities/${a.slug}`,
        title: a.name,
        detail: a.location ? `${sentenceCase(a.category)} in ${a.location}` : sentenceCase(a.category),
        image_url: a.image_url,
      }))}
    />
  );
}

function sentenceCase(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
