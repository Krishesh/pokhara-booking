"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Info, Loader2, Lock } from "lucide-react";

import { saveOffer, type SaveState } from "@/app/admin/actions";
import { fieldA11y, FormField, FormSection } from "@/components/admin/form-field";
import { submitKeepingValues, useSaveFeedback } from "@/components/admin/use-save-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { ActivityOption, AdminOffer, Option } from "@/lib/admin/data";
import { domainFromUrl, offerVisibility, type OfferField } from "@/lib/admin/validation";
import { todayInTimeZone } from "@/lib/booking";
import { formatPrice, formatPricingUnit } from "@/lib/offer-format";
import { CURRENCIES, PRICING_UNITS, type PricingUnit } from "@/lib/types";

const INITIAL: SaveState = { status: "idle" };

const UNIT_LABELS: Record<PricingUnit, string> = {
  per_person: "Per person",
  per_group: "Per group (flat)",
  per_flight: "Per flight (flat)",
  per_hour: "Per hour (no online requests)",
  other: "Other (no online requests)",
};

export function OfferForm({
  offer,
  activities,
  providers,
  defaultActivityId,
}: {
  offer?: AdminOffer;
  activities: ActivityOption[];
  providers: Option[];
  defaultActivityId?: string;
}) {
  const [state, formAction, pending] = useActionState(saveOffer, INITIAL);
  useSaveFeedback(state, "/admin/offers");
  const errors: Partial<Record<OfferField, string>> = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  const [activityId, setActivityId] = useState(offer?.activity_id ?? defaultActivityId ?? "");
  const [price, setPrice] = useState(offer?.price === null || offer?.price === undefined ? "" : String(offer.price));
  const [currency, setCurrency] = useState<string>(offer ? (offer.currency ?? "") : "NPR");
  const [unit, setUnit] = useState<string>(offer ? (offer.pricing_unit ?? "") : "per_person");
  const [status, setStatus] = useState<string>(offer?.verification_status ?? "unverified");
  const [sourceUrl, setSourceUrl] = useState(offer?.source_url ?? "");
  const [sourceDomain, setSourceDomain] = useState(offer?.source_domain ?? "");
  const [domainTouched, setDomainTouched] = useState(Boolean(offer));

  const priceNumber = price.trim() === "" ? null : Number(price.replace(/,/g, ""));
  const validPrice = priceNumber !== null && Number.isFinite(priceNumber) && priceNumber >= 0 ? priceNumber : null;
  const activity = activities.find((a) => a.id === activityId);
  const visibility = offerVisibility({
    price: validPrice,
    currency: currency || null,
    verification_status: status,
    activityPublished: Boolean(activity?.is_published),
  });
  const unitLabel = formatPricingUnit((unit || null) as PricingUnit | null);

  return (
    <form onSubmit={submitKeepingValues(formAction)} className="grid gap-6" noValidate>
      {offer && <input type="hidden" name="id" value={offer.id} />}

      {offer && (
        <p className="flex gap-2 rounded-lg border bg-muted/50 p-3 text-sm">
          <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          Changes apply to new booking requests only. Requests already sent keep the price and details the visitor saw.
        </p>
      )}

      <FormSection title="What and who">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="activity_id" label="Activity" error={errors.activity_id}>
            <NativeSelect
              id="activity_id"
              name="activity_id"
              className="w-full"
              value={activityId}
              onChange={(e) => setActivityId(e.target.value)}
              {...fieldA11y("activity_id", errors.activity_id)}
            >
              <NativeSelectOption value="">Choose an activity…</NativeSelectOption>
              {activities.map((a) => (
                <NativeSelectOption key={a.id} value={a.id}>
                  {a.name}
                  {a.is_published ? "" : " (hidden)"}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </FormField>
          <FormField
            id="provider_id"
            label="Provider"
            error={errors.provider_id}
            hint={
              <>
                Missing? <Link href="/admin/providers/new" className="underline">Add a provider</Link> first.
              </>
            }
          >
            <NativeSelect
              id="provider_id"
              name="provider_id"
              className="w-full"
              defaultValue={offer?.provider_id ?? ""}
              {...fieldA11y("provider_id", errors.provider_id, true)}
            >
              <NativeSelectOption value="">— No provider (shows “Listed on website”) —</NativeSelectOption>
              {providers.map((p) => (
                <NativeSelectOption key={p.id} value={p.id}>
                  {p.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="package_name" label="Package name" optional error={errors.package_name} hint="e.g. Tandem flight with photos">
            <Input
              id="package_name"
              name="package_name"
              defaultValue={offer?.package_name ?? ""}
              maxLength={120}
              {...fieldA11y("package_name", errors.package_name, true)}
            />
          </FormField>
          <FormField id="duration" label="Duration" optional error={errors.duration} hint="e.g. 20–30 minutes">
            <Input
              id="duration"
              name="duration"
              defaultValue={offer?.duration ?? ""}
              maxLength={80}
              {...fieldA11y("duration", errors.duration, true)}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Price">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField id="price" label="Price" error={errors.price} hint="Leave empty if unknown (offer stays hidden).">
            <Input
              id="price"
              name="price"
              inputMode="decimal"
              placeholder="8500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              {...fieldA11y("price", errors.price, true)}
            />
          </FormField>
          <FormField id="currency" label="Currency" error={errors.currency}>
            <NativeSelect
              id="currency"
              name="currency"
              className="w-full"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              {...fieldA11y("currency", errors.currency)}
            >
              <NativeSelectOption value="">—</NativeSelectOption>
              {CURRENCIES.map((c) => (
                <NativeSelectOption key={c} value={c}>
                  {c}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </FormField>
          <FormField id="pricing_unit" label="Priced" error={errors.pricing_unit}>
            <NativeSelect
              id="pricing_unit"
              name="pricing_unit"
              className="w-full"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              {...fieldA11y("pricing_unit", errors.pricing_unit)}
            >
              <NativeSelectOption value="">—</NativeSelectOption>
              {PRICING_UNITS.map((u) => (
                <NativeSelectOption key={u} value={u}>
                  {UNIT_LABELS[u]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </FormField>
        </div>
        <div className="rounded-lg bg-muted p-3 text-sm">
          <span className="text-muted-foreground">Visitors will see: </span>
          {validPrice !== null && currency ? (
            <strong>
              {formatPrice(validPrice, currency)}
              {unitLabel && ` ${unitLabel}`}
            </strong>
          ) : (
            <span className="text-muted-foreground">nothing (no price yet)</span>
          )}
        </div>
      </FormSection>

      <FormSection title="Details shown on the offer card">
        <FormField id="inclusions" label="Included" optional error={errors.inclusions} hint="One item per line, e.g. Pilot, Insurance, Transport.">
          <Textarea
            id="inclusions"
            name="inclusions"
            rows={4}
            defaultValue={offer?.inclusions ?? ""}
            {...fieldA11y("inclusions", errors.inclusions, true)}
          />
        </FormField>
        <FormField
          id="booking_conditions"
          label="Conditions"
          optional
          error={errors.booking_conditions}
          hint="Weather, weight limits, cancellation terms, seasons."
        >
          <Textarea
            id="booking_conditions"
            name="booking_conditions"
            rows={3}
            defaultValue={offer?.booking_conditions ?? ""}
            {...fieldA11y("booking_conditions", errors.booking_conditions, true)}
          />
        </FormField>
      </FormSection>

      <FormSection title="Verification">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="verification_status"
            label="Status"
            error={errors.verification_status}
            hint="Verified = you confirmed this price with the provider."
          >
            <NativeSelect
              id="verification_status"
              name="verification_status"
              className="w-full"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              {...fieldA11y("verification_status", errors.verification_status, true)}
            >
              <NativeSelectOption value="verified">Verified</NativeSelectOption>
              <NativeSelectOption value="unverified">Unverified</NativeSelectOption>
              <NativeSelectOption value="outdated">Outdated (hidden)</NativeSelectOption>
            </NativeSelect>
          </FormField>
          <FormField id="retrieved_at" label="Price checked on" optional error={errors.retrieved_at} hint="Shown as “Price checked …”.">
            <Input
              id="retrieved_at"
              name="retrieved_at"
              type="date"
              defaultValue={offer ? (offer.retrieved_at ?? "") : todayInTimeZone(new Date())}
              {...fieldA11y("retrieved_at", errors.retrieved_at, true)}
            />
          </FormField>
        </div>
        <p className={visibility.visible ? "flex items-center gap-2 text-sm" : "flex items-center gap-2 text-sm text-muted-foreground"}>
          {visibility.visible ? <Eye className="size-4" aria-hidden="true" /> : <EyeOff className="size-4" aria-hidden="true" />}
          {visibility.reason}
        </p>
      </FormSection>

      <FormSection title="Source (staff only)" description="Where this price came from. Never shown on the website.">
        <p className="-mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Lock className="size-3.5" aria-hidden="true" /> Only the website name is shown, as “Listed on …”, when there is no provider.
        </p>
        <FormField id="source_url" label="Source link" error={errors.source_url} hint="The page where you found this price.">
          <Input
            id="source_url"
            name="source_url"
            type="url"
            inputMode="url"
            placeholder="https://…"
            value={sourceUrl}
            onChange={(e) => {
              setSourceUrl(e.target.value);
              if (!domainTouched) setSourceDomain(domainFromUrl(e.target.value) ?? "");
            }}
            {...fieldA11y("source_url", errors.source_url, true)}
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="source_domain" label="Source website" error={errors.source_domain} hint="Filled in from the link.">
            <Input
              id="source_domain"
              name="source_domain"
              value={sourceDomain}
              onChange={(e) => {
                setDomainTouched(true);
                setSourceDomain(e.target.value);
              }}
              {...fieldA11y("source_domain", errors.source_domain, true)}
            />
          </FormField>
          <FormField id="booking_url" label="Vendor booking link" optional error={errors.booking_url}>
            <Input
              id="booking_url"
              name="booking_url"
              type="url"
              inputMode="url"
              placeholder="https://…"
              defaultValue={offer?.booking_url ?? ""}
              {...fieldA11y("booking_url", errors.booking_url)}
            />
          </FormField>
        </div>
        <FormField id="notes" label="Notes" optional error={errors.notes}>
          <Textarea id="notes" name="notes" rows={3} defaultValue={offer?.notes ?? ""} {...fieldA11y("notes", errors.notes)} />
        </FormField>
      </FormSection>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {offer ? "Save changes" : "Create offer"}
        </Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/admin/offers" />}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
