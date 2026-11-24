"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Loader2, Lock } from "lucide-react";

import type { SaveState } from "@/app/admin/actions";
import { saveOuting } from "@/app/admin/outings/actions";
import { ActivityImage } from "@/components/activity-image";
import { fieldA11y, FormField, FormSection } from "@/components/admin/form-field";
import { submitKeepingValues, useSaveFeedback } from "@/components/admin/use-save-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { OutingField } from "@/lib/admin/outings";
import type { AdminOuting } from "@/lib/admin/outings-data";
import { slugify } from "@/lib/admin/validation";

const INITIAL: SaveState = { status: "idle" };

const STATUS_HELP: Record<string, string> = {
  draft: "Hidden from visitors while you plan.",
  published: "Visible on the website and taking interest.",
  cancelled: "Still visible with a Cancelled label; the interest form is turned off.",
};

export function OutingForm({ outing }: { outing?: AdminOuting }) {
  const [state, formAction, pending] = useActionState(saveOuting, INITIAL);
  useSaveFeedback(state, "/admin/outings");
  const errors: Partial<Record<OutingField, string>> = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  const [title, setTitle] = useState(outing?.title ?? "");
  const [slug, setSlug] = useState(outing?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(outing));
  const [imageUrl, setImageUrl] = useState(outing?.image_url ?? "");
  const [status, setStatus] = useState<string>(outing?.status ?? "draft");
  const previewable = /^https:\/\/[^\s]+\.[^\s]+/.test(imageUrl);

  const field = (
    id: OutingField,
    label: string,
    opts: { hint?: string; optional?: boolean; type?: string; textarea?: number; placeholder?: string } = {},
  ) => (
    <FormField id={id} label={label} optional={opts.optional} hint={opts.hint} error={errors[id]}>
      {opts.textarea ? (
        <Textarea
          id={id}
          name={id}
          rows={opts.textarea}
          placeholder={opts.placeholder}
          defaultValue={(outing?.[id] as string | null) ?? ""}
          {...fieldA11y(id, errors[id], Boolean(opts.hint))}
        />
      ) : (
        <Input
          id={id}
          name={id}
          type={opts.type ?? "text"}
          placeholder={opts.placeholder}
          defaultValue={(outing?.[id] as string | null) ?? ""}
          {...fieldA11y(id, errors[id], Boolean(opts.hint))}
        />
      )}
    </FormField>
  );

  return (
    <form onSubmit={submitKeepingValues(formAction)} className="grid gap-6" noValidate>
      {outing && <input type="hidden" name="id" value={outing.id} />}

      <FormSection title="The outing">
        <FormField id="title" label="Title" error={errors.title} hint="e.g. Poon Hill sunrise weekend">
          <Input
            id="title"
            name="title"
            value={title}
            maxLength={120}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            {...fieldA11y("title", errors.title, true)}
          />
        </FormField>
        <FormField
          id="slug"
          label="Web address (slug)"
          error={errors.slug}
          hint={`The page will be at /outings/${slug || "…"}`}
        >
          <Input
            id="slug"
            name="slug"
            className="font-mono"
            value={slug}
            maxLength={80}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value.toLowerCase());
            }}
            {...fieldA11y("slug", errors.slug, true)}
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          {field("destination", "Destination", { hint: "e.g. Ghorepani and Poon Hill" })}
          {field("outing_date", "Date", { type: "date", optional: true, hint: "Leave empty to show “Date to be confirmed”." })}
        </div>
        {field("description", "Description", {
          optional: true,
          textarea: 4,
          hint: "What the outing is, difficulty, what to bring. Line breaks are kept.",
        })}
        {field("meeting_details", "Meeting point and time", {
          optional: true,
          textarea: 2,
          hint: "Empty shows “To be confirmed”.",
        })}
        {field("cost_info", "Cost", {
          optional: true,
          placeholder: "Around NPR 3,500 per person (transport + food)",
          hint: "A description only: visitors don't pay on the website. Empty shows “To be confirmed”.",
        })}
      </FormSection>

      <FormSection title="Organizer">
        {field("organizer_name", "Organizer name", { hint: "Shown to visitors." })}
        <p className="-mb-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Lock className="size-3.5" aria-hidden="true" /> Staff only, never shown on the website.
        </p>
        {field("organizer_contact", "Organizer contact", { optional: true, placeholder: "+977 98… or email" })}
      </FormSection>

      <FormSection title="Photo">
        <FormField
          id="image_url"
          label="Image link"
          optional
          error={errors.image_url}
          hint="A direct https:// link to a landscape photo. Leave empty for a placeholder."
        >
          <Input
            id="image_url"
            name="image_url"
            type="url"
            placeholder="https://…"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            {...fieldA11y("image_url", errors.image_url, true)}
          />
        </FormField>
        {field("image_credit", "Photo credit", {
          optional: true,
          hint: "Shown under the photo, e.g. Photo: Jane Doe, CC BY-SA 4.0, via Wikimedia Commons.",
        })}
        <div className="max-w-sm">
          <p className="mb-2 text-xs text-muted-foreground">Preview</p>
          <ActivityImage src={previewable ? imageUrl : null} alt={title || "Outing"} className="rounded-lg" />
        </div>
      </FormSection>

      <FormSection title="Visibility">
        <FormField id="status" label="Status" error={errors.status} hint={STATUS_HELP[status]}>
          <NativeSelect
            id="status"
            name="status"
            className="w-full sm:w-64"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            {...fieldA11y("status", errors.status, true)}
          >
            <NativeSelectOption value="draft">Draft (hidden)</NativeSelectOption>
            <NativeSelectOption value="published">Published</NativeSelectOption>
            <NativeSelectOption value="cancelled">Cancelled</NativeSelectOption>
          </NativeSelect>
        </FormField>
      </FormSection>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {outing ? "Save changes" : "Create outing"}
        </Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/admin/outings" />}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
