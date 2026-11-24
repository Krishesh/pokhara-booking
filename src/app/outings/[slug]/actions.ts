"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { todayInTimeZone } from "@/lib/booking";
import { outingState, validateInterestForm, type InterestField, type OutingStatus } from "@/lib/outings";

export type InterestState =
  | { status: "idle" }
  | { status: "error"; message?: string; fieldErrors?: Partial<Record<InterestField, string>>; closed?: boolean }
  | { status: "success"; alreadyRegistered: boolean; title: string };

const SAVE_FAILED = "We couldn't save your interest. Please try again in a moment.";

/** Saves a visitor's interest in an outing. Interest only: no place is reserved. */
export async function registerInterest(_prev: InterestState, formData: FormData): Promise<InterestState> {
  const get = (key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };

  const validation = validateInterestForm({
    outingId: get("outingId"),
    customerName: get("customerName"),
    contactType: get("contactType"),
    contactValue: get("contactValue"),
    participantCount: get("participantCount"),
  });
  if (!validation.ok) return { status: "error", fieldErrors: validation.fieldErrors, message: validation.formError };
  const input = validation.data;

  // Service role (interests are closed to anon). Re-check the outing is still open.
  const supabase = createAdminClient();
  const { data: outing, error: readError } = await supabase
    .from("group_outings")
    .select("title, status, outing_date")
    .eq("id", input.outingId)
    .maybeSingle();
  if (readError) {
    console.error("outings: failed to read outing", readError);
    return { status: "error", message: SAVE_FAILED };
  }
  const state = outing ? outingState({ status: outing.status as OutingStatus, outing_date: outing.outing_date }, todayInTimeZone(new Date())) : "draft";
  if (!outing || state !== "open") {
    const message =
      state === "cancelled"
        ? "This outing has been cancelled, so it isn't taking interest any more."
        : state === "past"
          ? "This outing has already taken place."
          : "This outing isn't available any more.";
    return { status: "error", message, closed: true };
  }

  // Honeypot: bots fill the hidden field. Pretend success, save nothing.
  if (get("website").trim() !== "") return { status: "success", alreadyRegistered: false, title: outing.title };

  const { error } = await supabase.from("group_interests").insert({
    outing_id: input.outingId,
    customer_name: input.customerName,
    contact_type: input.contactType,
    contact_value: input.contactValue,
    participant_count: input.participantCount,
  });
  if (error) {
    if (error.code === "23505") return { status: "success", alreadyRegistered: true, title: outing.title };
    console.error("outings: failed to save interest", error);
    return { status: "error", message: SAVE_FAILED };
  }
  return { status: "success", alreadyRegistered: false, title: outing.title };
}
