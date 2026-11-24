import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Mail, MessageCircle, Phone } from "lucide-react";

import { CopyButton } from "@/components/admin/copy-button";
import { FormSkeleton } from "@/components/admin/form-skeleton";
import { MessageTemplates } from "@/components/admin/message-templates";
import { OutingForm } from "@/components/admin/outing-form";
import { PageTitle } from "@/components/admin/page-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { contactsText, outingTemplates } from "@/lib/admin/outings";
import { getAdminOuting } from "@/lib/admin/outings-data";
import { contactLinks } from "@/lib/admin/requests";
import { isUuid } from "@/lib/admin/validation";
import { todayInTimeZone } from "@/lib/booking";
import { formatCheckedDate } from "@/lib/offer-format";
import { formatOutingDate, outingState } from "@/lib/outings";

export const metadata: Metadata = { title: "Edit outing" };

const ICONS = { Call: Phone, WhatsApp: MessageCircle, Email: Mail } as const;

export default function EditOutingPage({ params }: PageProps<"/admin/outings/[id]">) {
  return (
    <section className="space-y-6">
      <Suspense fallback={<FormSkeleton />}>
        <EditOuting params={params} />
      </Suspense>
    </section>
  );
}

async function EditOuting({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const found = await getAdminOuting(id);
  if (!found) notFound();
  const { outing, interests } = found;
  const people = interests.reduce((sum, i) => sum + i.participant_count, 0);
  const state = outingState(outing, todayInTimeZone(new Date()));

  return (
    <>
      <PageTitle
        back="/admin/outings"
        backLabel="Group outings"
        title={outing.title}
        description={`${formatOutingDate(outing.outing_date)} · ${interests.length} interested (${people} ${people === 1 ? "person" : "people"})`}
        viewHref={outing.status !== "draft" ? `/outings/${outing.slug}` : undefined}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <OutingForm outing={outing} />

        <div className="space-y-6">
          <Card id="interested">
            <CardHeader>
              <CardTitle>Interested people</CardTitle>
              <CardDescription>
                {interests.length === 0
                  ? "Nobody has registered interest yet."
                  : `${interests.length} ${interests.length === 1 ? "registration" : "registrations"}, ${people} ${people === 1 ? "person" : "people"} in total.`}
              </CardDescription>
            </CardHeader>
            {interests.length > 0 && (
              <CardContent className="space-y-4">
                <ul className="divide-y rounded-lg border">
                  {interests.map((i) => (
                    <li key={i.id} className="space-y-1 p-3 text-sm">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-medium">{i.customer_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {i.participant_count} {i.participant_count === 1 ? "person" : "people"} ·{" "}
                          {formatCheckedDate(i.created_at.slice(0, 10))}
                        </span>
                      </div>
                      <div className="font-mono text-xs text-muted-foreground">{i.contact_value}</div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {contactLinks(i.contact_type, i.contact_value).map(({ label, href }) => {
                          const Icon = ICONS[label as keyof typeof ICONS];
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
                    </li>
                  ))}
                </ul>
                <CopyButton
                  text={contactsText(interests)}
                  label="Copy all contacts"
                  copiedMessage={`${interests.length} contacts copied`}
                />
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Message everyone</CardTitle>
              <CardDescription>Copy, then send to the people above by WhatsApp, SMS or email.</CardDescription>
            </CardHeader>
            <CardContent>
              <MessageTemplates
                templates={outingTemplates(outing)}
                initialKey={state === "cancelled" ? "cancelled" : "thanks"}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
