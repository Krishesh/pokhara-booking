import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CircleCheck,
  Clock,
  EyeOff,
  Inbox,
  Mountain,
  Tags,
  TriangleAlert,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FLAG_LABELS, type OfferFlag } from "@/lib/admin/dashboard";
import { getDashboard, type Dashboard } from "@/lib/admin/dashboard-data";
import { requestAge } from "@/lib/admin/requests";
import { formatCheckedDate, formatPrice } from "@/lib/offer-format";
import { formatOutingDate } from "@/lib/outings";
import { cn } from "@/lib/utils";

export default function AdminOverviewPage() {
  return (
    <section className="space-y-6">
      <Suspense fallback={<OverviewSkeleton />}>
        <Overview />
      </Suspense>
    </section>
  );
}

const updatedFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Kathmandu",
});

async function Overview() {
  await connection();
  const now = new Date();
  const d = await getDashboard(now);

  return (
    <>
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Staff overview</h1>
          <p className="max-w-2xl text-muted-foreground">
            What visitors can see, which offers need checking, and who is waiting for a reply.
          </p>
        </div>
        <p className="flex items-center gap-2 self-start rounded-xl border border-border bg-card px-3.5 py-2 text-sm md:self-auto">
          <span className="size-2 rounded-full bg-primary" aria-hidden="true" />
          Updated at {updatedFormatter.format(now)}
        </p>
      </header>

      <StatCards d={d} />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-12">
        <div className="grid min-w-0 gap-6 lg:col-span-7">
          <PendingTriage d={d} now={now} />
          <RequestsThisWeek d={d} />
        </div>
        <div className="grid min-w-0 gap-6 lg:col-span-5">
          <FlaggedOffers d={d} />
          <OutingsPanel d={d} />
        </div>
      </div>
    </>
  );
}

function StatCards({ d }: { d: Dashboard }) {
  const hidden = d.activities.total - d.activities.published;
  const chips: { flag: OfferFlag; className: string }[] = [
    { flag: "unverified", className: "bg-sunrise-soft text-sunrise" },
    { flag: "outdated", className: "bg-muted text-muted-foreground" },
    { flag: "no_price", className: "bg-destructive/10 text-destructive" },
  ];
  const { pending } = d.requests;

  return (
    <ul className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard icon={Mountain} title="Activities" href="/admin/activities" linkLabel="Manage activities">
        <Figure value={`${d.activities.published} / ${d.activities.total}`} unit="live / total" />
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <EyeOff className="size-4" aria-hidden="true" />
          {hidden === 0 ? "All activities are live" : `${hidden} hidden from visitors`}
        </p>
      </StatCard>

      <StatCard icon={Tags} title="Offers" href="/admin/offers" linkLabel="Review offers">
        <Figure value={String(d.offers.total)} unit="total" />
        <div className="flex flex-wrap gap-1.5">
          {chips.some(({ flag }) => d.offers.counts[flag] > 0) ? (
            chips
              .filter(({ flag }) => d.offers.counts[flag] > 0)
              .map(({ flag, className }) => (
                <span key={flag} className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", className)}>
                  {d.offers.counts[flag]} {FLAG_LABELS[flag].toLowerCase()}
                </span>
              ))
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CircleCheck className="size-4 text-primary" aria-hidden="true" />
              All verified
            </span>
          )}
        </div>
      </StatCard>

      <StatCard icon={Building2} title="Providers" href="/admin/providers" linkLabel="Manage providers">
        <Figure value={String(d.providers.total)} unit="companies" />
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CircleCheck className="size-4 text-primary" aria-hidden="true" />
          {d.providers.withOffers} with offers listed
        </p>
      </StatCard>

      <li
        className={cn(
          "flex flex-col justify-between gap-5 rounded-2xl border-2 bg-card p-5",
          pending.count > 0 ? "border-primary/30" : "border-border",
        )}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-primary">Pending requests</h2>
            {pending.overdue > 0 && (
              <span className="rounded-full bg-sunrise-soft px-2.5 py-0.5 text-xs font-semibold text-sunrise">
                Action needed
              </span>
            )}
          </div>
          <Figure value={String(pending.count)} unit="waiting" accent />
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className={cn("size-4", pending.overdue > 0 ? "text-sunrise" : "text-primary")} aria-hidden="true" />
            {pending.oldestDays === null
              ? "All caught up"
              : pending.overdue > 0
                ? `${pending.overdue} waiting over 2 days`
                : pending.oldestDays === 0
                  ? "Oldest arrived today"
                  : `Oldest waiting ${pending.oldestDays} ${pending.oldestDays === 1 ? "day" : "days"}`}
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/requests" />} className="w-full">
          Review requests
          <ArrowRight aria-hidden="true" />
        </Button>
      </li>
    </ul>
  );
}

function StatCard({
  icon: Icon,
  title,
  href,
  linkLabel,
  children,
}: {
  icon: typeof Mountain;
  title: string;
  href: string;
  linkLabel: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex flex-col justify-between gap-5 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/30">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">{title}</h2>
          <span className="grid size-9 place-items-center rounded-lg bg-accent text-primary">
            <Icon className="size-5" aria-hidden="true" />
          </span>
        </div>
        {children}
      </div>
      <Link
        href={href}
        className="group inline-flex items-center gap-1 self-start rounded-sm text-sm font-semibold text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        {linkLabel}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </li>
  );
}

function Figure({ value, unit, accent }: { value: string; unit: string; accent?: boolean }) {
  return (
    <p className="flex items-baseline gap-2">
      <span className={cn("text-3xl font-bold tracking-tight tabular-nums", accent && "text-primary")}>{value}</span>
      <span className="text-sm text-muted-foreground">{unit}</span>
    </p>
  );
}

function Panel({
  title,
  action,
  className,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("min-w-0 space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function PendingTriage({ d, now }: { d: Dashboard; now: Date }) {
  const list = d.requests.latestPending;
  return (
    <Panel
      title="Oldest pending requests"
      action={
        <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
          {d.requests.pending.count} waiting
        </span>
      }
    >
      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-mist px-6 py-12 text-center">
          <Inbox className="size-7 text-primary" aria-hidden="true" />
          <p className="font-semibold">No pending requests</p>
          <p className="text-sm text-muted-foreground">You&apos;re all caught up. New requests will show here.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-[minmax(0,1fr)] gap-2">
          {list.map((r) => {
            const age = requestAge(r.created_at, "pending", now);
            return (
              <li
                key={r.id}
                className={cn(
                  "flex flex-col justify-between gap-3 rounded-xl border p-4 sm:flex-row sm:items-center",
                  age.overdue ? "border-sunrise/25 bg-sunrise-soft/50" : "border-border bg-mist",
                )}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-card text-primary">
                    <CalendarDays className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold tracking-wide text-primary tabular-nums">{r.reference}</span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-semibold",
                          age.overdue ? "bg-sunrise-soft text-sunrise" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {age.label === "Today" ? "Received today" : `Waiting ${age.label}`}
                      </span>
                    </div>
                    <p className="truncate font-semibold">{r.offer_snapshot.activity.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {r.customer_name}, {r.participant_count} {r.participant_count === 1 ? "person" : "people"}, for{" "}
                      {formatCheckedDate(r.requested_date)}, {r.offer_snapshot.vendor}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
                  <span className="text-sm font-semibold tabular-nums">{formatPrice(r.total_price, r.currency)}</span>
                  <Button size="sm" nativeButton={false} render={<Link href={`/admin/requests/${r.id}`} />}>
                    Open
                    <span className="sr-only"> {r.reference}</span>
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {d.requests.pending.count > list.length && (
        <Link href="/admin/requests" className="inline-block text-sm font-semibold text-primary hover:underline">
          See all {d.requests.pending.count} pending requests
        </Link>
      )}
    </Panel>
  );
}

const FLAG_STYLES: Record<OfferFlag, { row: string; badge: string; detail: string }> = {
  no_price: { row: "border-destructive/20 bg-destructive/5", badge: "bg-destructive/10 text-destructive", detail: "text-destructive" },
  outdated: { row: "border-sunrise/25 bg-sunrise-soft/50", badge: "bg-sunrise-soft text-sunrise", detail: "text-sunrise" },
  unverified: { row: "border-border bg-mist", badge: "bg-muted text-muted-foreground", detail: "text-muted-foreground" },
};

function flagDetail(flag: OfferFlag, checked: string | null) {
  if (flag === "no_price") return "Missing price or currency, hidden from visitors";
  if (flag === "outdated") return "Marked outdated, hidden from visitors";
  return checked ? `Not verified, last checked ${checked}` : "Not verified yet";
}

function FlaggedOffers({ d }: { d: Dashboard }) {
  return (
    <Panel
      title="Offers to check"
      action={
        <Link href="/admin/offers" className="text-sm font-semibold text-primary hover:underline">
          View all
        </Link>
      }
    >
      {d.offers.flagged.length === 0 ? (
        <p className="flex items-center gap-2 rounded-xl bg-mist p-4 text-sm">
          <CircleCheck className="size-4 text-primary" aria-hidden="true" />
          Every offer has a verified price.
        </p>
      ) : (
        <ul className="grid grid-cols-[minmax(0,1fr)] gap-2">
          {d.offers.flagged.map((o) => (
            <li key={o.id}>
              <Link
                href={`/admin/offers/${o.id}`}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl border p-3.5 transition-colors hover:border-primary/30 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  FLAG_STYLES[o.flag].row,
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {o.activityName}
                    {o.package_name && <span className="font-normal text-muted-foreground">, {o.package_name}</span>}
                  </span>
                  <span className={cn("block truncate text-xs", FLAG_STYLES[o.flag].detail)}>
                    {o.providerName ? `${o.providerName}: ` : ""}
                    {flagDetail(o.flag, formatCheckedDate(o.retrieved_at))}
                  </span>
                </span>
                <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold", FLAG_STYLES[o.flag].badge)}>
                  {FLAG_LABELS[o.flag]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

const dayLabel = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" });

function RequestsThisWeek({ d }: { d: Dashboard }) {
  const { perDay, lastSevenDays } = d.requests;
  const max = Math.max(1, ...perDay.map((p) => p.count));
  const barWidth = 100 / perDay.length;
  return (
    <Panel title="Requests, last 7 days">
      <SmallFigures
        items={[
          { label: "Received", value: lastSevenDays.received },
          { label: "Confirmed", value: lastSevenDays.confirmed },
          { label: "Rejected", value: lastSevenDays.rejected },
        ]}
      />
      <figure>
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-28 w-full" aria-hidden="true">
          {perDay.map((p, i) => {
            const h = p.count === 0 ? 1.5 : Math.max(3, (p.count / max) * 38);
            return (
              <rect
                key={p.date}
                x={i * barWidth + barWidth * 0.18}
                y={40 - h}
                width={barWidth * 0.64}
                height={h}
                rx={1.2}
                className={p.count > 0 ? "fill-primary" : "fill-muted"}
              />
            );
          })}
        </svg>
        <div className="flex pt-1.5 text-center text-xs text-muted-foreground" aria-hidden="true">
          {perDay.map((p) => (
            <span key={p.date} className="flex-1">
              {dayLabel.format(new Date(`${p.date}T00:00:00Z`))}
            </span>
          ))}
        </div>
        <figcaption className="sr-only">
          Requests received per day: {perDay.map((p) => `${p.date}: ${p.count}`).join(", ")}
        </figcaption>
      </figure>
    </Panel>
  );
}

function SmallFigures({ items }: { items: { label: string; value: number }[] }) {
  return (
    <dl className="grid grid-cols-3 gap-2 text-center">
      {items.map(({ label, value }) => (
        <div key={label} className="flex flex-col-reverse rounded-xl bg-mist py-2.5">
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="text-xl font-bold tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function OutingsPanel({ d }: { d: Dashboard }) {
  const { outings } = d;
  return (
    <Panel
      title="Group outings"
      action={
        <Link href="/admin/outings" className="text-sm font-semibold text-primary hover:underline">
          Manage
        </Link>
      }
    >
      <SmallFigures
        items={[
          { label: "Upcoming", value: outings.upcoming },
          { label: "Drafts", value: outings.drafts },
          { label: "Interests, 7 days", value: outings.interestsLastSevenDays },
        ]}
      />
      {outings.next ? (
        <Link
          href={`/admin/outings/${outings.next.id}`}
          className="flex items-center gap-3 rounded-xl border border-border p-3.5 transition-colors hover:border-primary/30 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <Users className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">Next: {outings.next.title}</span>
            <span className="block text-xs text-muted-foreground">{formatOutingDate(outings.next.outing_date)}</span>
          </span>
        </Link>
      ) : (
        <p className="flex items-center gap-2 rounded-xl bg-mist p-3.5 text-sm text-muted-foreground">
          <TriangleAlert className="size-4 text-sunrise" aria-hidden="true" />
          No upcoming outings are published.
        </p>
      )}
    </Panel>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading overview">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <Skeleton className="h-96 rounded-2xl lg:col-span-7" />
        <div className="grid gap-6 lg:col-span-5">
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
