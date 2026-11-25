import { cache } from "react";
import { cookies } from "next/headers";

import { createClient } from "@/utils/supabase/server";
import { todayInTimeZone } from "@/lib/booking";
import { isListed, sortOutings, type PublicOuting } from "@/lib/outings";

// Public reads with the anon key. RLS only returns published and cancelled outings,
// and column grants exclude organizer_contact.
const PUBLIC_COLUMNS =
  "id, slug, title, destination, organizer_name, description, outing_date, meeting_details, cost_info, image_url, image_credit, status";

/**
 * Upcoming published and cancelled outings, soonest first, "to be confirmed" last.
 * Wrapped in React `cache` so several components on one page share a single query.
 */
export const listPublicOutings = cache(async (): Promise<PublicOuting[]> => {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from("group_outings")
    .select(PUBLIC_COLUMNS)
    .in("status", ["published", "cancelled"]);
  if (error) throw new Error(`Failed to load outings: ${error.message}`);
  const today = todayInTimeZone(new Date());
  return sortOutings((data as PublicOuting[]).filter((o) => isListed(o, today)));
});

/** One published or cancelled outing by slug (including past ones), or null. */
export async function getPublicOutingBySlug(slug: string): Promise<PublicOuting | null> {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from("group_outings")
    .select(PUBLIC_COLUMNS)
    .eq("slug", slug)
    .in("status", ["published", "cancelled"])
    .maybeSingle();
  if (error) throw new Error(`Failed to load outing: ${error.message}`);
  return data as PublicOuting | null;
}
