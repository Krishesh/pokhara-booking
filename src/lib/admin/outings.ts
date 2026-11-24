// Pure admin logic for group outings (task 06): form validation, message templates, contact export.

import { formatOutingDate, OUTING_STATUSES, type OutingStatus } from "../outings";

export type OutingField =
  | "title"
  | "slug"
  | "destination"
  | "organizer_name"
  | "organizer_contact"
  | "description"
  | "outing_date"
  | "meeting_details"
  | "cost_info"
  | "image_url"
  | "image_credit"
  | "status";

export type OutingInput = {
  title: string;
  slug: string;
  destination: string;
  organizer_name: string;
  organizer_contact: string | null;
  description: string | null;
  outing_date: string | null;
  meeting_details: string | null;
  cost_info: string | null;
  image_url: string | null;
  image_credit: string | null;
  status: OutingStatus;
};

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateOuting(
  values: Record<string, string>,
): { ok: true; data: OutingInput } | { ok: false; fieldErrors: Partial<Record<OutingField, string>> } {
  const errors: Partial<Record<OutingField, string>> = {};
  const v = (k: string) => (values[k] ?? "").trim();
  const text = (key: OutingField, label: string, max: number, required = false, min = 2): string | null => {
    const value = v(key);
    if (!value) {
      if (required) errors[key] = `${label} is required.`;
      return null;
    }
    if (value.length < min) errors[key] = `${label} must be at least ${min} characters.`;
    else if (value.length > max) errors[key] = `${label} must be ${max} characters or fewer.`;
    return value;
  };

  const title = text("title", "Title", 120, true);
  const slug = v("slug").toLowerCase();
  if (!slug) errors.slug = "Web address is required.";
  else if (slug.length > 80 || !SLUG_RE.test(slug)) {
    errors.slug = "Use only lowercase letters, numbers and single dashes, e.g. poon-hill-weekend.";
  }
  const destination = text("destination", "Destination", 120, true);
  const organizer_name = text("organizer_name", "Organizer", 120, true);
  const organizer_contact = text("organizer_contact", "Organizer contact", 200, false, 3);
  const description = text("description", "Description", 5000, false, 1);
  const meeting_details = text("meeting_details", "Meeting details", 1000, false, 1);
  const cost_info = text("cost_info", "Cost", 500, false, 1);

  let outing_date: string | null = null;
  const dateRaw = v("outing_date");
  if (dateRaw) {
    const d = new Date(`${dateRaw}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateRaw) || Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== dateRaw) {
      errors.outing_date = "Enter a valid date, or leave it empty for “to be confirmed”.";
    } else outing_date = dateRaw;
  }

  let image_url: string | null = null;
  const imageRaw = v("image_url");
  if (imageRaw) {
    try {
      const url = new URL(imageRaw);
      if (url.protocol !== "https:" || !url.hostname.includes(".")) throw new Error();
      image_url = imageRaw;
    } catch {
      errors.image_url = "Image link must be a full link starting with https://";
    }
  }
  const image_credit = text("image_credit", "Photo credit", 200, false, 1);

  const statusRaw = v("status") || "draft";
  const status = (OUTING_STATUSES as readonly string[]).includes(statusRaw) ? (statusRaw as OutingStatus) : null;
  if (!status) errors.status = "Choose draft, published or cancelled.";

  if (Object.keys(errors).length > 0 || !status) return { ok: false, fieldErrors: errors };
  return {
    ok: true,
    data: {
      title: title!,
      slug,
      destination: destination!,
      organizer_name: organizer_name!,
      organizer_contact,
      description,
      outing_date,
      meeting_details,
      cost_info,
      image_url,
      image_credit: image_url ? image_credit : null,
      status,
    },
  };
}

export type TemplateOuting = {
  title: string;
  destination: string;
  organizer_name: string;
  outing_date: string | null;
  meeting_details: string | null;
  cost_info: string | null;
};

/** Messages for everyone who registered interest; staff send them to the whole list. */
export function outingTemplates(o: TemplateOuting): { key: string; title: string; text: string }[] {
  const date = formatOutingDate(o.outing_date);
  const when = o.outing_date ? `on ${date}` : "(date to be confirmed)";
  const sign = "\n\n– Pokhara Booking";
  return [
    {
      key: "thanks",
      title: "Thanks for your interest",
      text: `Namaste! Thank you for your interest in ${o.title} ${when}. ${o.organizer_name} will contact you with details. Your place is not reserved yet.${sign}`,
    },
    {
      key: "details",
      title: "Details confirmed",
      text:
        `Namaste! ${o.title} is going ahead ${when}.\n` +
        `Meeting: ${o.meeting_details ?? "to be confirmed"}\n` +
        `Cost: ${o.cost_info ?? "to be confirmed"}\n` +
        `Please reply to confirm you're joining, and how many people.${sign}`,
    },
    {
      key: "cancelled",
      title: "Outing cancelled",
      text: `Namaste! Sorry, ${o.title} ${when} has been cancelled. We'll let you know about future outings. Thank you for your interest.${sign}`,
    },
  ];
}

/** One contact per line ("Name: value"), for pasting into a broadcast list or group chat. */
export function contactsText(interests: { customer_name: string; contact_value: string }[]): string {
  return interests.map((i) => `${i.customer_name}: ${i.contact_value}`).join("\n");
}
