import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FormSkeleton } from "@/components/admin/form-skeleton";
import { PageTitle } from "@/components/admin/page-title";
import { ProviderForm } from "@/components/admin/provider-form";
import { getAdminProvider } from "@/lib/admin/data";
import { isUuid } from "@/lib/admin/validation";

export const metadata: Metadata = { title: "Edit provider" };

export default function EditProviderPage({ params }: PageProps<"/admin/providers/[id]">) {
  return (
    <section className="max-w-3xl space-y-6">
      <Suspense fallback={<FormSkeleton />}>
        <EditProvider params={params} />
      </Suspense>
    </section>
  );
}

async function EditProvider({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const provider = await getAdminProvider(id);
  if (!provider) notFound();

  return (
    <>
      <PageTitle
        back="/admin/providers"
        backLabel="Providers"
        title={provider.name}
        description={`${provider.offer_count} ${provider.offer_count === 1 ? "offer" : "offers"} from this provider.`}
      />
      <ProviderForm provider={provider} />
    </>
  );
}
