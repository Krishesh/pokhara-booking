import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FormSkeleton } from "@/components/admin/form-skeleton";
import { OfferForm } from "@/components/admin/offer-form";
import { PageTitle } from "@/components/admin/page-title";
import { getAdminOffer, getOfferFormOptions } from "@/lib/admin/data";
import { isUuid } from "@/lib/admin/validation";

export const metadata: Metadata = { title: "Edit offer" };

export default function EditOfferPage({ params }: PageProps<"/admin/offers/[id]">) {
  return (
    <section className="max-w-3xl space-y-6">
      <Suspense fallback={<FormSkeleton />}>
        <EditOffer params={params} />
      </Suspense>
    </section>
  );
}

async function EditOffer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [offer, options] = await Promise.all([getAdminOffer(id), getOfferFormOptions()]);
  if (!offer) notFound();

  return (
    <>
      <PageTitle
        back="/admin/offers"
        backLabel="Offers"
        title={offer.package_name ?? "Untitled offer"}
        description={`${offer.activity?.name ?? "Unknown activity"} · ${offer.provider?.name ?? `Listed on ${offer.source_domain}`}`}
        viewHref={offer.activity?.is_published ? `/activities/${offer.activity.slug}` : undefined}
      />
      <OfferForm offer={offer} activities={options.activities} providers={options.providers} />
    </>
  );
}
