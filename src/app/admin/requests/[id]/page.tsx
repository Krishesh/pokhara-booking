import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { AlertTriangle, ArrowLeft, Mail, MessageCircle, Phone } from "lucide-react";

import { CopyButton } from "@/components/admin/copy-button";
import { FormSkeleton } from "@/components/admin/form-skeleton";
import { MessageTemplates } from "@/components/admin/message-templates";
import { RequestStatusBadge } from "@/components/admin/request-status-badge";
import { RequestStatusForm } from "@/components/admin/request-status-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { contactLinks, messageTemplates, offerChanges, requestAge } from "@/lib/admin/requests";
import { getAdminRequest } from "@/lib/admin/requests-data";
import { isUuid } from "@/lib/admin/validation";
import { formatCheckedDate, formatPrice, formatPricingUnit } from "@/lib/offer-format";

export const metadata: Metadata = { title: "Booking request" };

export default function AdminRequestPage({ params }: PageProps<"/admin/requests/[id]">) {
  return (
    <section className="space-y-6">
      <Link href="/admin/requests" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
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
            {age.overdue && <span className="font-medium text-destructive"> · waiting over 2 days</span>}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium">{r.customer_name}</dd>
                <dt className="text-muted-foreground">{r.contact_type === "phone" ? "Phone" : "Email"}</dt>
                <dd className="flex flex-wrap items-center gap-2">
                  <span className="font-mono">{r.contact_value}</span>
                  <CopyButton text={r.contact_value} label="Copy contact" copiedMessage="Contact copied" size="icon-sm" variant="ghost" />
                </dd>
                <dt className="text-muted-foreground">Date</dt>
                <dd>{formatCheckedDate(r.requested_date)}</dd>
                <dt className="text-muted-foreground">People</dt>
                <dd>{r.participant_count}</dd>
                <dt className="text-muted-foreground">Estimated total</dt>
                <dd className="font-medium">{formatPrice(r.total_price, r.currency)}</dd>
              </dl>
              <div className="flex flex-wrap gap-2">
                {links.map(({ label, href }) => {
                  const Icon = CONTACT_ICONS[label as keyof typeof CONTACT_ICONS];
                  return (
                    <Button
                      key={label}
                      variant="outline"
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Offer as the customer saw it</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {changes.length > 0 && (
                <div role="note" className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                  <div>
                    <p className="font-medium">The offer has changed since this request</p>
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
              <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2">
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
              {r.price_listing_id && (
                <Link href={`/admin/offers/${r.price_listing_id}`} className="inline-block text-sm text-muted-foreground underline hover:text-foreground">
                  Open the current offer
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Message the customer</CardTitle>
            </CardHeader>
            <CardContent>
              <MessageTemplates
                templates={templates}
                initialKey={r.status === "pending" ? "received" : r.status}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Record the outcome</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(r.staff_note || r.updated_by) && (
                <div className="space-y-1 rounded-lg bg-muted/50 p-3 text-sm">
                  {r.staff_note && <p className="whitespace-pre-line">“{r.staff_note}”</p>}
                  <p className="text-xs text-muted-foreground">
                    {r.updated_by ? `Last updated by ${r.updated_by}` : "Last updated"}
                    {updated && ` · ${updated}`}
                  </p>
                </div>
              )}
              <RequestStatusForm key={r.status} id={r.id} reference={r.reference} status={r.status} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
