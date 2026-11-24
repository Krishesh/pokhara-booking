"use server";

import type { SaveState } from "@/app/admin/actions";
import { AdminUnauthorizedError, requireAdmin } from "@/lib/admin/guard";
import { validateOuting } from "@/lib/admin/outings";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const GENERIC = "Something went wrong while saving. Please try again.";

/** Creates or updates an outing. Re-checks the admin password (Server Actions can be called from any URL). */
export async function saveOuting(_prev: SaveState, formData: FormData): Promise<SaveState> {
  let supabase;
  try {
    supabase = await requireAdmin();
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return { status: "error", message: "Admin password required. Reload the page and sign in again." };
    }
    throw error;
  }

  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) if (typeof value === "string") values[key] = value;
  const idRaw = values.id ?? "";
  const id = idRaw === "" ? null : UUID_RE.test(idRaw) ? idRaw : "invalid";
  if (id === "invalid") return { status: "error", message: GENERIC };

  const result = validateOuting(values);
  if (!result.ok) return { status: "error", fieldErrors: result.fieldErrors };
  const data = result.data;

  const { data: clash } = await supabase.from("group_outings").select("id, title").eq("slug", data.slug).maybeSingle();
  if (clash && clash.id !== id) {
    return { status: "error", fieldErrors: { slug: `This web address is already used by “${clash.title}”.` } };
  }

  const row = { ...data, updated_at: new Date().toISOString() };
  const { data: saved, error } = id
    ? await supabase.from("group_outings").update(row).eq("id", id).select("id").single()
    : await supabase.from("group_outings").insert(row).select("id").single();
  if (error || !saved) {
    console.error("admin: save outing failed", error);
    return { status: "error", message: GENERIC };
  }
  return { status: "success", id: saved.id, message: id ? `Saved “${data.title}”.` : `Created “${data.title}”.` };
}
