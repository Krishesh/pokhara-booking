import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";

import { ActivityImage } from "@/components/activity-image";
import { OfferList, OfferListSkeleton } from "@/components/offer-list";
import { Badge } from "@/components/ui/badge";
import { getPublishedActivityBySlug } from "@/lib/activities";

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

export default async function ActivityPage({ params }: PageProps<"/activities/[slug]">) {
  const { slug } = await params;
  const activity = await getPublishedActivityBySlug(slug);
  if (!activity) notFound();

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All activities
      </Link>

      <ActivityImage src={activity.image_url} alt={activity.name} className="rounded-xl" priority />

      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">{activity.name}</h1>
        <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
          <Badge variant="secondary" className="capitalize">
            {activity.category}
          </Badge>
          {activity.location && (
            <span className="flex items-center gap-1">
              <MapPin className="size-4" aria-hidden="true" />
              {activity.location}
            </span>
          )}
        </div>
      </header>

      {activity.description && (
        <p className="leading-relaxed whitespace-pre-line">{activity.description}</p>
      )}

      <Suspense fallback={<OfferListSkeleton />}>
        <OfferList activityId={activity.id} activityName={activity.name} />
      </Suspense>
    </article>
  );
}
