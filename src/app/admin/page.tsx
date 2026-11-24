import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Building2, ClipboardList, Mountain, Tags } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminOverview } from "@/lib/admin/data";

export default function AdminOverviewPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">Manage what visitors see: activities, the offers on them, and providers.</p>
      </div>
      <Suspense fallback={<OverviewSkeleton />}>
        <OverviewCards />
      </Suspense>
    </section>
  );
}

async function OverviewCards() {
  const o = await getAdminOverview();
  const cards = [
    {
      href: "/admin/activities",
      icon: Mountain,
      title: "Activities",
      value: `${o.activities.published} / ${o.activities.total}`,
      detail: "published / total",
    },
    {
      href: "/admin/offers",
      icon: Tags,
      title: "Offers",
      value: String(o.offers.total),
      detail: `${o.offers.unverified} unverified · ${o.offers.outdated} outdated · ${o.offers.unpriced} without price`,
    },
    {
      href: "/admin/providers",
      icon: Building2,
      title: "Providers",
      value: String(o.providers),
      detail: "companies offering activities",
    },
    {
      href: "/admin/requests",
      icon: ClipboardList,
      title: "Pending booking requests",
      value: String(o.pendingRequests),
      detail: o.pendingRequests > 0 ? "waiting for a reply" : "all caught up",
    },
  ];

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ href, icon: Icon, title, value, detail }) => {
        const body = (
          <Card className="h-full">
            <CardHeader>
              <CardDescription className="flex items-center gap-2">
                <Icon className="size-4" aria-hidden="true" />
                {title}
              </CardDescription>
              <CardTitle className="text-3xl font-bold">{value}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-end justify-between gap-2 text-xs text-muted-foreground">
              <span>{detail}</span>
              {href && <ArrowRight className="size-4 shrink-0" aria-hidden="true" />}
            </CardContent>
          </Card>
        );
        return (
          <li key={title}>
            {href ? (
              <Link
                href={href}
                className="block h-full rounded-xl transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {body}
              </Link>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ul>
  );
}

function OverviewSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Loading overview">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-32 rounded-xl" />
      ))}
    </div>
  );
}
