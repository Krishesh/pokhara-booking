"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Loader2 } from "lucide-react";

import { saveActivity, type SaveState } from "@/app/admin/actions";
import { ActivityImage } from "@/components/activity-image";
import { fieldA11y, FormField, FormSection } from "@/components/admin/form-field";
import { submitKeepingValues, useSaveFeedback } from "@/components/admin/use-save-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { AdminActivity } from "@/lib/admin/data";
import { slugify, type ActivityField } from "@/lib/admin/validation";

const INITIAL: SaveState = { status: "idle" };

export function ActivityForm({ activity, categories }: { activity?: AdminActivity; categories: string[] }) {
  const [state, formAction, pending] = useActionState(saveActivity, INITIAL);
  useSaveFeedback(state, "/admin/activities");

  const [name, setName] = useState(activity?.name ?? "");
  const [slug, setSlug] = useState(activity?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(activity));
  const [imageUrl, setImageUrl] = useState(activity?.image_url ?? "");
  const [published, setPublished] = useState(activity?.is_published ?? false);

  const errors: Partial<Record<ActivityField, string>> = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const slugChangedOnLive = Boolean(activity?.is_published && slug !== activity.slug);
  const previewable = /^https:\/\/[^\s]+\.[^\s]+/.test(imageUrl);

  return (
    <form onSubmit={submitKeepingValues(formAction)} className="grid gap-6" noValidate>
      {activity && <input type="hidden" name="id" value={activity.id} />}
      <input type="hidden" name="is_published" value={published ? "on" : ""} />

      <FormSection title="Basics">
        <FormField id="name" label="Name" error={errors.name} hint="Shown as the page title, e.g. Paragliding at Sarangkot.">
          <Input
            id="name"
            name="name"
            value={name}
            maxLength={100}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            {...fieldA11y("name", errors.name, true)}
          />
        </FormField>

        <FormField
          id="slug"
          label="Web address (slug)"
          error={errors.slug}
          hint={
            <>
              The page will be at <span className="font-mono">/activities/{slug || "…"}</span>. Lowercase letters, numbers
              and dashes.
            </>
          }
        >
          <Input
            id="slug"
            name="slug"
            value={slug}
            maxLength={80}
            className="font-mono"
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value.toLowerCase());
            }}
            {...fieldA11y("slug", errors.slug, true)}
          />
        </FormField>
        {slugChangedOnLive && (
          <p role="alert" className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
            This activity is live. Changing its web address breaks links people have already shared.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="category" label="Category" error={errors.category} hint="e.g. paragliding, boating, hiking">
            <Input
              id="category"
              name="category"
              list="category-options"
              defaultValue={activity?.category ?? ""}
              maxLength={40}
              {...fieldA11y("category", errors.category, true)}
            />
            <datalist id="category-options">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </FormField>
          <FormField id="location" label="Location" optional error={errors.location} hint="e.g. Sarangkot, Lakeside">
            <Input
              id="location"
              name="location"
              defaultValue={activity?.location ?? ""}
              maxLength={100}
              {...fieldA11y("location", errors.location, true)}
            />
          </FormField>
        </div>

        <FormField
          id="description"
          label="Description"
          optional
          error={errors.description}
          hint="2–4 plain sentences. Line breaks are kept. Don't put prices here; they belong on offers."
        >
          <Textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={activity?.description ?? ""}
            maxLength={5000}
            {...fieldA11y("description", errors.description, true)}
          />
        </FormField>
      </FormSection>

      <FormSection title="Photo">
        <FormField
          id="image_url"
          label="Image link"
          optional
          error={errors.image_url}
          hint="A direct https:// link to a landscape photo (16:9 works best). Leave empty to show a placeholder."
        >
          <Input
            id="image_url"
            name="image_url"
            type="url"
            inputMode="url"
            placeholder="https://…"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            {...fieldA11y("image_url", errors.image_url, true)}
          />
        </FormField>
        <FormField
          id="image_credit"
          label="Photo credit"
          optional
          error={errors.image_credit}
          hint="Shown under the photo. Required by most free licences, e.g. Photo: Jane Doe, CC BY-SA 4.0, via Wikimedia Commons."
        >
          <Input
            id="image_credit"
            name="image_credit"
            defaultValue={activity?.image_credit ?? ""}
            maxLength={200}
            {...fieldA11y("image_credit", errors.image_credit, true)}
          />
        </FormField>
        <div className="max-w-sm">
          <p className="mb-2 text-xs text-muted-foreground">Preview</p>
          <ActivityImage src={previewable ? imageUrl : null} alt={name || "Activity"} className="rounded-lg" />
        </div>
      </FormSection>

      <FormSection title="Visibility">
        <label className="flex items-start gap-3">
          <Switch checked={published} onCheckedChange={setPublished} className="mt-0.5" aria-describedby="published-hint" />
          <span className="grid gap-1">
            <span className="text-sm font-medium">{published ? "Live on the website" : "Hidden from the website"}</span>
            <span id="published-hint" className="text-xs text-muted-foreground">
              Hidden activities and their offers can&apos;t be seen or booked. Nothing is deleted.
            </span>
          </span>
        </label>
      </FormSection>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {activity ? "Save changes" : "Create activity"}
        </Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/admin/activities" />}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
