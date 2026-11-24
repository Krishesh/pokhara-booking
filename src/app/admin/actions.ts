"use server";

import { AdminUnauthorizedError, requireAdmin } from "@/lib/admin/guard";
import {
  validateActivity,
  validateOffer,
  validateProvider,
  VERIFICATION_STATUSES,
  type FieldErrors,
  type FormValues,
} from "@/lib/admin/validation";
import { todayInTimeZone } from "@/lib/booking";
import type { VerificationStatus } from "@/lib/types";

// Every action starts with requireAdmin(): Server Actions can be POSTed to any URL,
// so the /admin password check in src/proxy.ts is not enough on its own.

export type SaveState<K extends string = string> =
  | { status: "idle" }
  | { status: "error"; message?: string; fieldErrors?: FieldErrors<K> }
  | { status: "success"; id: string; message: string };

export type QuickResult = { ok: true; message: string } | { ok: false; message: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const GENERIC = "Something went wrong while saving. Please try again.";

function values(formData: FormData): FormValues {
  const out: FormValues = {};
  for (const [key, value] of formData.entries()) if (typeof value === "string") out[key] = value;
  return out;
}

function editId(formData: FormData): string | null | "invalid" {
  const id = formData.get("id");
  if (typeof id !== "string" || id === "") return null;
  return UUID_RE.test(id) ? id : "invalid";
}

async function guard(): Promise<Awaited<ReturnType<typeof requireAdmin>> | null> {
  try {
    return await requireAdmin();
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) return null;
    throw error;
  }
}

const DENIED = { status: "error", message: "Admin password required. Reload the page and sign in again." } as const;

// ---------- activities ----------

export async function saveActivity(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const supabase = await guard();
  if (!supabase) return DENIED;
  const id = editId(formData);
  if (id === "invalid") return { status: "error", message: GENERIC };

  const result = validateActivity(values(formData));
  if (!result.ok) return { status: "error", fieldErrors: result.fieldErrors };
  const data = result.data;

  const { data: clash } = await supabase.from("activities").select("id, name").eq("slug", data.slug).maybeSingle();
  if (clash && clash.id !== id) {
    return { status: "error", fieldErrors: { slug: `This slug is already used by “${clash.name}”.` } };
  }

  const query = id
    ? supabase.from("activities").update(data).eq("id", id).select("id").single()
    : supabase.from("activities").insert(data).select("id").single();
  const { data: saved, error } = await query;
  if (error || !saved) {
    console.error("admin: save activity failed", error);
    return { status: "error", message: error?.code === "23505" ? "That slug is already in use." : GENERIC };
  }
  return { status: "success", id: saved.id, message: id ? `Saved “${data.name}”.` : `Created “${data.name}”.` };
}

export async function setActivityPublished(id: string, published: boolean): Promise<QuickResult> {
  const supabase = await guard();
  if (!supabase) return { ok: false, message: DENIED.message };
  if (!UUID_RE.test(id) || typeof published !== "boolean") return { ok: false, message: GENERIC };

  const { data, error } = await supabase
    .from("activities")
    .update({ is_published: published })
    .eq("id", id)
    .select("name")
    .single();
  if (error || !data) {
    console.error("admin: publish toggle failed", error);
    return { ok: false, message: GENERIC };
  }
  return { ok: true, message: published ? `“${data.name}” is now live.` : `“${data.name}” is now hidden.` };
}

// ---------- providers ----------

export async function saveProvider(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const supabase = await guard();
  if (!supabase) return DENIED;
  const id = editId(formData);
  if (id === "invalid") return { status: "error", message: GENERIC };

  const result = validateProvider(values(formData));
  if (!result.ok) return { status: "error", fieldErrors: result.fieldErrors };
  const data = result.data;

  const query = id
    ? supabase.from("providers").update(data).eq("id", id).select("id").single()
    : supabase.from("providers").insert(data).select("id").single();
  const { data: saved, error } = await query;
  if (error || !saved) {
    console.error("admin: save provider failed", error);
    return { status: "error", message: GENERIC };
  }
  return { status: "success", id: saved.id, message: id ? `Saved “${data.name}”.` : `Created “${data.name}”.` };
}

// ---------- offers ----------

export async function saveOffer(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const supabase = await guard();
  if (!supabase) return DENIED;
  const id = editId(formData);
  if (id === "invalid") return { status: "error", message: GENERIC };

  const result = validateOffer(values(formData));
  if (!result.ok) return { status: "error", fieldErrors: result.fieldErrors };
  const data = result.data;

  const [{ data: activity }, provider] = await Promise.all([
    supabase.from("activities").select("id").eq("id", data.activity_id).maybeSingle(),
    data.provider_id
      ? supabase.from("providers").select("id").eq("id", data.provider_id).maybeSingle()
      : Promise.resolve({ data: { id: null } }),
  ]);
  if (!activity) return { status: "error", fieldErrors: { activity_id: "That activity no longer exists." } };
  if (!provider.data) return { status: "error", fieldErrors: { provider_id: "That provider no longer exists." } };

  const query = id
    ? supabase.from("price_listings").update(data).eq("id", id).select("id").single()
    : supabase.from("price_listings").insert(data).select("id").single();
  const { data: saved, error } = await query;
  if (error || !saved) {
    console.error("admin: save offer failed", error);
    return { status: "error", message: GENERIC };
  }
  const label = data.package_name ?? "offer";
  return { status: "success", id: saved.id, message: id ? `Saved “${label}”.` : `Created “${label}”.` };
}

/** "verified" also stamps today's date as the price-checked date. */
export async function setOfferStatus(id: string, status: VerificationStatus): Promise<QuickResult> {
  const supabase = await guard();
  if (!supabase) return { ok: false, message: DENIED.message };
  if (!UUID_RE.test(id) || !VERIFICATION_STATUSES.includes(status)) return { ok: false, message: GENERIC };

  const patch =
    status === "verified"
      ? { verification_status: status, retrieved_at: todayInTimeZone(new Date()) }
      : { verification_status: status };
  const { data, error } = await supabase
    .from("price_listings")
    .update(patch)
    .eq("id", id)
    .select("package_name")
    .single();
  if (error || !data) {
    console.error("admin: offer status failed", error);
    return { ok: false, message: GENERIC };
  }
  const label = data.package_name ?? "Offer";
  return {
    ok: true,
    message:
      status === "verified"
        ? `“${label}” verified, price checked today.`
        : status === "outdated"
          ? `“${label}” marked outdated and hidden.`
          : `“${label}” marked unverified.`,
  };
}
