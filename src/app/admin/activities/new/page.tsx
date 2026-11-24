import { Suspense } from "react";
import type { Metadata } from "next";

import { ActivityForm } from "@/components/admin/activity-form";
import { FormSkeleton } from "@/components/admin/form-skeleton";
import { PageTitle } from "@/components/admin/page-title";
import { listAdminActivities } from "@/lib/admin/data";

export const metadata: Metadata = { title: "New activity" };

export default function NewActivityPage() {
  return (
    <section className="max-w-3xl space-y-6">
      <PageTitle back="/admin/activities" backLabel="Activities" title="New activity" />
      <Suspense fallback={<FormSkeleton />}>
        <NewActivityForm />
      </Suspense>
    </section>
  );
}

async function NewActivityForm() {
  const activities = await listAdminActivities();
  const categories = [...new Set(activities.map((a) => a.category))].sort();
  return <ActivityForm categories={categories} />;
}
