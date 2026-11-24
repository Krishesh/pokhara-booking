import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ActivityForm } from "@/components/admin/activity-form";
import { FormSkeleton } from "@/components/admin/form-skeleton";
import { PageTitle } from "@/components/admin/page-title";
import { getAdminActivity, listAdminActivities } from "@/lib/admin/data";
import { isUuid } from "@/lib/admin/validation";

export const metadata: Metadata = { title: "Edit activity" };

export default function EditActivityPage({ params }: PageProps<"/admin/activities/[id]">) {
  return (
    <section className="max-w-3xl space-y-6">
      <Suspense fallback={<FormSkeleton />}>
        <EditActivity params={params} />
      </Suspense>
    </section>
  );
}

async function EditActivity({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [activity, all] = await Promise.all([getAdminActivity(id), listAdminActivities()]);
  if (!activity) notFound();
  const categories = [...new Set(all.map((a) => a.category))].sort();

  return (
    <>
      <PageTitle
        back="/admin/activities"
        backLabel="Activities"
        title={activity.name}
        description={`${activity.offer_count} ${activity.offer_count === 1 ? "offer" : "offers"} on this activity.`}
        viewHref={activity.is_published ? `/activities/${activity.slug}` : undefined}
      />
      <ActivityForm activity={activity} categories={categories} />
    </>
  );
}
