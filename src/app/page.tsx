import { Suspense } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";

import { ActivityImage } from "@/components/activity-image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getPublishedActivities } from "@/lib/activities";

export default function HomePage() {
  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Adventure activities in Pokhara</h1>
        <p className="text-muted-foreground">
          Browse paragliding, boating, hiking and more, then compare offers from local companies.
        </p>
      </div>
      <Suspense fallback={<ActivityGridSkeleton />}>
        <ActivityGrid />
      </Suspense>
    </section>
  );
}

async function ActivityGrid() {
  const activities = await getPublishedActivities();

  if (activities.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
        No activities listed yet.
      </p>
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {activities.map((activity) => (
        <li key={activity.id}>
          <Link
            href={`/activities/${activity.slug}`}
            className="block h-full rounded-xl transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Card className="h-full pt-0">
              <ActivityImage src={activity.image_url} alt={activity.name} />
              <CardHeader>
                <CardTitle>
                  <h2>{activity.name}</h2>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-2 text-muted-foreground">
                <Badge variant="secondary" className="capitalize">
                  {activity.category}
                </Badge>
                {activity.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-4" aria-hidden="true" />
                    {activity.location}
                  </span>
                )}
              </CardContent>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ActivityGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading activities">
      {Array.from({ length: 6 }, (_, i) => (
        <Card key={i} className="pt-0">
          <Skeleton className="aspect-video w-full rounded-none" />
          <CardHeader>
            <Skeleton className="h-5 w-2/3" />
          </CardHeader>
          <CardContent className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
