"use server";

import { AdminUnauthorizedError, requireAdmin } from "@/lib/admin/guard";
import { STATUS_LABELS, validateStatusChange, type StatusChangeField } from "@/lib/admin/requests";

export type StatusChangeState =
  | { status: "idle" }
  | { status: "error"; message?: string; fieldErrors?: Partial<Record<StatusChangeField, string>>; conflict?: boolean }
  | { status: "success"; message: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const GENERIC = "Something went wrong while saving. Please try again.";

/**
 * Changes a request's status. Only applies if the request is still in the status the staff member saw
 * (`from`), so two people can't overwrite each other.
 */
export async function updateRequestStatus(_prev: StatusChangeState, formData: FormData): Promise<StatusChangeState> {
  let supabase;
  try {
    supabase = await requireAdmin(); // Server Actions can be called from any URL: always re-check.
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return { status: "error", message: "Admin password required. Reload the page and sign in again." };
    }
    throw error;
  }

  const get = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };
  const id = get("id");
  if (!UUID_RE.test(id)) return { status: "error", message: GENERIC };

  const result = validateStatusChange({ from: get("from"), to: get("to"), note: get("staff_note"), staffName: get("staff_name") });
  if (!result.ok) return { status: "error", fieldErrors: result.fieldErrors, message: result.formError };
  const { from, to, note, staffName } = result.data;

  const { data, error } = await supabase
    .from("booking_requests")
    .update({ status: to, staff_note: note, updated_by: staffName, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", from)
    .select("reference");

  if (error) {
    console.error("admin: status change failed", error);
    return { status: "error", message: GENERIC };
  }
  if (!data || data.length === 0) {
    return {
      status: "error",
      conflict: true,
      message: "This request was updated by someone else. Reload the page to see the latest status.",
    };
  }
  return { status: "success", message: `${data[0].reference} marked ${STATUS_LABELS[to].toLowerCase()}.` };
}
