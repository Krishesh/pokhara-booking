import type { Metadata } from "next";

import { PageTitle } from "@/components/admin/page-title";
import { ProviderForm } from "@/components/admin/provider-form";

export const metadata: Metadata = { title: "New provider" };

export default function NewProviderPage() {
  return (
    <section className="max-w-3xl space-y-6">
      <PageTitle back="/admin/providers" backLabel="Providers" title="New provider" />
      <ProviderForm />
    </section>
  );
}
