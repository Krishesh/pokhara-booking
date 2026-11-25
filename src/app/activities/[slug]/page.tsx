import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircleDollarSign, MapPin, MessageCircle, ShieldCheck } from "lucide-react";

import { ActivityImage } from "@/components/activity-image";
import { BackLink } from "@/components/back-link";
import { Container } from "@/components/container";
import { OfferList, OfferListSkeleton } from "@/components/offer-list";
import { MoreStrip } from "@/components/more-strip";
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

        <header className="space-y-2 pt-4 pb-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{activity.name}</h1>
          <p className="flex items-center gap-1.5 text-base text-muted-foreground">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            {sentenceCase(activity.category)}
            {activity.location ? `, ${activity.location}` : ""}, Pokhara
          </p>
        </header>

        <figure>
          <ActivityImage
            src={activity.image_url}
            alt={activity.name}
            priority
            sizes="(min-width: 1280px) 1216px, 100vw"
            aspect="none"
            className="aspect-[16/9] max-h-[480px] rounded-2xl"
          />
          {activity.image_url && activity.image_credit && (
            <figcaption className="pt-2 text-xs text-muted-foreground">{activity.image_credit}</figcaption>
          )}
        </figure>

        <div className="grid gap-8 pt-10 lg:grid-cols-12">
          <section aria-labelledby="about-heading" className="space-y-3 lg:col-span-7">
            <h2 id="about-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
              About this activity
            </h2>
            {paragraphs.length > 0 ? (
              paragraphs.map((p) => (
                <p key={p} className="max-w-[65ch] text-base leading-relaxed">
                  {p}
                </p>
              ))
            ) : (
              <p className="text-muted-foreground">The companies below describe what each package includes.</p>
            )}
          </section>

          <aside aria-labelledby="request-heading" className="lg:col-span-4 lg:col-start-9">
            <div className="space-y-4 rounded-2xl bg-card p-6">
              <h2 id="request-heading" className="text-base font-semibold">
                How requesting works
              </h2>
              <ul className="space-y-3">
                {REQUEST_NOTES.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex gap-3 text-sm leading-snug">
                    <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        <div className="pt-14">
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
