import { Suspense } from "react";
import type { Metadata } from "next";

import { FormSkeleton } from "@/components/admin/form-skeleton";
import { OfferForm } from "@/components/admin/offer-form";
import { PageTitle } from "@/components/admin/page-title";
import { getOfferFormOptions } from "@/lib/admin/data";
import { isUuid } from "@/lib/admin/validation";

export const metadata: Metadata = { title: "New offer" };

export default function NewOfferPage({ searchParams }: PageProps<"/admin/offers/new">) {
  return (
    <section className="max-w-3xl space-y-6">
      <PageTitle back="/admin/offers" backLabel="Offers" title="New offer" />
      <Suspense fallback={<FormSkeleton />}>
        <NewOfferForm searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function NewOfferForm({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [params, options] = await Promise.all([searchParams, getOfferFormOptions()]);
  const activity = typeof params.activity === "string" && isUuid(params.activity) ? params.activity : undefined;
  return <OfferForm activities={options.activities} providers={options.providers} defaultActivityId={activity} />;
}
