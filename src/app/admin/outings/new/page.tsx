import type { Metadata } from "next";

import { OutingForm } from "@/components/admin/outing-form";
import { PageTitle } from "@/components/admin/page-title";

export const metadata: Metadata = { title: "New outing" };

export default function NewOutingPage() {
  return (
    <section className="max-w-3xl space-y-6">
      <PageTitle back="/admin/outings" backLabel="Group outings" title="New outing" />
      <OutingForm />
    </section>
  );
}
