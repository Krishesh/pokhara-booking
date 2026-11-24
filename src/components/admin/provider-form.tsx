"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, Lock } from "lucide-react";

import { saveProvider, type SaveState } from "@/app/admin/actions";
import { fieldA11y, FormField, FormSection } from "@/components/admin/form-field";
import { submitKeepingValues, useSaveFeedback } from "@/components/admin/use-save-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AdminProvider } from "@/lib/admin/data";
import type { ProviderField } from "@/lib/admin/validation";

const INITIAL: SaveState = { status: "idle" };

export function ProviderForm({ provider }: { provider?: AdminProvider }) {
  const [state, formAction, pending] = useActionState(saveProvider, INITIAL);
  useSaveFeedback(state, "/admin/providers");
  const errors: Partial<Record<ProviderField, string>> = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  const text = (
    id: ProviderField,
    label: string,
    opts: { hint?: string; optional?: boolean; type?: string; inputMode?: "url" | "tel" | "decimal" | "numeric"; placeholder?: string } = {},
  ) => (
    <FormField id={id} label={label} optional={opts.optional} hint={opts.hint} error={errors[id]}>
      <Input
        id={id}
        name={id}
        type={opts.type ?? "text"}
        inputMode={opts.inputMode}
        placeholder={opts.placeholder}
        defaultValue={provider?.[id] === null || provider?.[id] === undefined ? "" : String(provider[id])}
        {...fieldA11y(id, errors[id], Boolean(opts.hint))}
      />
    </FormField>
  );

  return (
    <form onSubmit={submitKeepingValues(formAction)} className="grid gap-6" noValidate>
      {provider && <input type="hidden" name="id" value={provider.id} />}

      <FormSection title="Shown to visitors">
        {text("name", "Company name", { hint: "Shown on every offer card, e.g. Sky Adventures Pokhara." })}
        <div className="grid gap-4 sm:grid-cols-3">
          {text("google_rating", "Google rating", {
            optional: true,
            inputMode: "decimal",
            placeholder: "4.7",
            hint: "0 to 5, one decimal.",
          })}
          {text("google_review_count", "Review count", {
            optional: true,
            inputMode: "numeric",
            placeholder: "312",
          })}
          {text("google_retrieved_at", "Rating checked on", { optional: true, type: "date" })}
        </div>
      </FormSection>

      <FormSection title="Staff only" description="Never shown on the website.">
        <p className="-mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Lock className="size-3.5" aria-hidden="true" /> Private details for contacting the company.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {text("phone", "Phone", { optional: true, type: "tel", inputMode: "tel", placeholder: "+977 61-…" })}
          {text("website_url", "Website", { optional: true, type: "url", inputMode: "url", placeholder: "https://…" })}
        </div>
        {text("address", "Address", { optional: true })}
        {text("google_maps_url", "Google Maps link", { optional: true, type: "url", inputMode: "url", placeholder: "https://maps.google.com/…" })}
        <FormField id="notes" label="Notes" optional error={errors.notes}>
          <Textarea id="notes" name="notes" rows={3} defaultValue={provider?.notes ?? ""} {...fieldA11y("notes", errors.notes)} />
        </FormField>
      </FormSection>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {provider ? "Save changes" : "Create provider"}
        </Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/admin/providers" />}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
