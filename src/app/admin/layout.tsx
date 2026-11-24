import { Suspense } from "react";
import type { Metadata } from "next";

import { AdminNav, AdminNavView } from "@/components/admin/admin-nav";
import { countPendingRequests } from "@/lib/admin/requests-data";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · Pokhara Booking" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<AdminNavView pathname="" />}>
        <AdminNavWithCount />
      </Suspense>
      {children}
    </div>
  );
}

async function AdminNavWithCount() {
  const pending = await countPendingRequests().catch(() => 0);
  return <AdminNav pendingCount={pending} />;
}
