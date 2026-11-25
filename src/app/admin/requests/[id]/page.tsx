import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { AlertTriangle, ArrowLeft, Lock, Mail, MessageCircle, Phone } from "lucide-react";

import { CopyButton } from "@/components/admin/copy-button";
import { FormSkeleton } from "@/components/admin/form-skeleton";
import { MessageTemplates } from "@/components/admin/message-templates";
import { RequestStatusBadge } from "@/components/admin/request-status-badge";
import { RequestStatusForm } from "@/components/admin/request-status-form";
import { Button } from "@/components/ui/button";
import { contactLinks, messageTemplates, offerChanges, requestAge } from "@/lib/admin/requests";
import { getAdminRequest } from "@/lib/admin/requests-data";
import { isUuid } from "@/lib/admin/validation";
import { formatCheckedDate, formatPrice, formatPricingUnit } from "@/lib/offer-format";

export const metadata: Metadata = { title: "Booking request" };

export default function AdminRequestPage({ params }: PageProps<"/admin/requests/[id]">) {
  return (
    <section className="space-y-6">
      <Link
        href="/admin/requests"
        className="inline-flex items-center gap-1.5 rounded-full py-1 pr-2 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Booking requests
      </Link>
      <Suspense fallback={<FormSkeleton />}>
        <RequestDetail params={params} />
      </Suspense>
    </section>
  );
}

const CONTACT_ICONS = { Call: Phone, WhatsApp: MessageCircle, Email: Mail } as const;

async function RequestDetail({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const found = await getAdminRequest(id);
  if (!found) notFound();
  const { request: r, current } = found;
  const snap = r.offer_snapshot;

  const age = requestAge(r.created_at, r.status, new Date());
  const changes = offerChanges(snap, current);
  const links = contactLinks(r.contact_type, r.contact_value);
  const templates = messageTemplates(r);
  const unit = formatPricingUnit(snap.pricing_unit);
  const received = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kathmandu",
  }).format(new Date(r.created_at));
  const updated =
    r.updated_at !== r.created_at
      ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kathmandu" }).format(
          new Date(r.updated_at),
        )
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-wide tabular-nums sm:text-3xl">{r.reference}</h1>
            <CopyButton text={r.reference} label="Copy reference" copiedMessage="Reference copied" size="icon-sm" variant="ghost" />
            <RequestStatusBadge status={r.status} />
          </div>
          <p className="text-muted-foreground">
            Received {received} ({age.label.toLowerCase() === "today" ? "today" : `${age.label} ago`})
            {age.overdue && <span className="font-semibold text-sunrise">, waiting over 2 days</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {links.map(({ label, href }) => {
            const Icon = CONTACT_ICONS[label as keyof typeof CONTACT_ICONS];
            return (
              <Button
                key={label}
                variant={label === "WhatsApp" ? "default" : "outline"}
                size="sm"
                nativeButton={false}
                render={<a href={href} target={label === "WhatsApp" ? "_blank" : undefined} rel="noreferrer" />}
              >
                <Icon aria-hidden="true" />
                {label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <section aria-labelledby="customer-heading" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 id="customer-heading" className="sr-only">
              Customer
            </h2>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="grid size-12 shrink-0 place-items-center rounded-full bg-accent text-base font-bold text-accent-foreground"
                >
                  {initials(r.customer_name)}
                </span>
                <div className="min-w-0">
                  <p className="text-lg font-semibold">{r.customer_name}</p>
                  <p className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                    {r.contact_type === "phone" ? <Phone className="size-3.5" aria-hidden="true" /> : <Mail className="size-3.5" aria-hidden="true" />}
                    <span className="tabular-nums">{r.contact_value}</span>
                    <CopyButton text={r.contact_value} label="Copy contact" copiedMessage="Contact copied" size="icon-sm" variant="ghost" />
                  </p>
                </div>
              </div>
              <dl className="grid grid-cols-3 gap-2 text-center sm:min-w-80">
                <div className="flex flex-col-reverse rounded-xl bg-mist px-3 py-2">
                  <dt className="text-xs text-muted-foreground">Date</dt>
                  <dd className="text-sm font-semibold">{formatCheckedDate(r.requested_date)}</dd>
                </div>
                <div className="flex flex-col-reverse rounded-xl bg-mist px-3 py-2">
                  <dt className="text-xs text-muted-foreground">People</dt>
                  <dd className="text-sm font-semibold tabular-nums">{r.participant_count}</dd>
                </div>
                <div className="flex flex-col-reverse rounded-xl bg-mist px-3 py-2">
                  <dt className="text-xs text-muted-foreground">Total</dt>
                  <dd className="text-sm font-semibold text-sunrise tabular-nums">{formatPrice(r.total_price, r.currency)}</dd>
                </div>
              </dl>
            </div>
          </section>

          <section aria-labelledby="offer-heading" className="space-y-4 rounded-2xl border border-border bg-card p-5 text-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="offer-heading" className="flex items-center gap-2 text-lg font-semibold">
                <Lock className="size-4 text-primary" aria-hidden="true" />
                Offer as the customer saw it
              </h2>
              <span className="text-xs text-muted-foreground">Saved when the request was sent</span>
            </div>
              {changes.length > 0 && (
                <div role="note" className="flex gap-2.5 rounded-xl border border-sunrise/30 bg-sunrise-soft/60 p-4">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-sunrise" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-sunrise">The offer has changed since this request</p>
                    <ul className="list-disc pl-4">
                      {changes.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                    <p className="mt-1 text-muted-foreground">
                      Confirm only at the price below, or reject and ask the customer to send a new request.
                    </p>
                  </div>
                </div>
              )}
              <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2 rounded-xl bg-mist p-4">
                <dt className="text-muted-foreground">Activity</dt>
                <dd>{snap.activity.name}</dd>
                <dt className="text-muted-foreground">Provider</dt>
                <dd>{snap.vendor}</dd>
                <dt className="text-muted-foreground">Package</dt>
                <dd>{snap.package_name ?? "Standard package"}</dd>
                {snap.duration && (
                  <>
                    <dt className="text-muted-foreground">Duration</dt>
                    <dd>{snap.duration}</dd>
                  </>
                )}
                <dt className="text-muted-foreground">Price</dt>
                <dd>
                  {formatPrice(snap.price, snap.currency)}
                  {unit && ` ${unit}`}
                  <span className="text-muted-foreground"> ({snap.verification_status === "verified" ? "verified" : "unverified"}
                  {snap.retrieved_at && `, checked ${formatCheckedDate(snap.retrieved_at)}`})</span>
                </dd>
                {snap.inclusions && (
                  <>
                    <dt className="text-muted-foreground">Included</dt>
                    <dd className="whitespace-pre-line">{snap.inclusions}</dd>
                  </>
                )}
                {snap.booking_conditions && (
                  <>
                    <dt className="text-muted-foreground">Conditions</dt>
                    <dd className="whitespace-pre-line">{snap.booking_conditions}</dd>
                  </>
                )}
              </dl>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
                <span className="text-muted-foreground">
                  {formatPrice(snap.price, snap.currency)}
                  {snap.pricing_unit === "per_person" && ` × ${r.participant_count}`}
                </span>
                <span className="text-base font-bold text-sunrise tabular-nums">{formatPrice(r.total_price, r.currency)}</span>
              </div>
              {r.price_listing_id && (
                <Link href={`/admin/offers/${r.price_listing_id}`} className="inline-block text-sm font-semibold text-primary hover:underline">
                  Open the current offer
                </Link>
              )}
          </section>

          <section aria-labelledby="message-heading" className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 id="message-heading" className="text-lg font-semibold">
              Message the customer
            </h2>
            <MessageTemplates templates={templates} initialKey={r.status === "pending" ? "received" : r.status} />
          </section>
        </div>

        <div className="space-y-6">
          <section aria-labelledby="outcome-heading" className="space-y-4 rounded-2xl border-2 border-primary/25 bg-card p-5 sm:p-6 lg:sticky lg:top-6">
            <h2 id="outcome-heading" className="text-lg font-semibold">
              Record the outcome
            </h2>
              {(r.staff_note || r.updated_by) && (
                <div className="space-y-1 rounded-xl bg-mist p-3 text-sm">
                  {r.staff_note && <p className="whitespace-pre-line">“{r.staff_note}”</p>}
                  <p className="text-xs text-muted-foreground">
                    {r.updated_by ? `Last updated by ${r.updated_by}` : "Last updated"}
                    {updated && `, ${updated}`}
                  </p>
                </div>
              )}
              <RequestStatusForm key={r.status} id={r.id} reference={r.reference} status={r.status} />
          </section>
        </div>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}
