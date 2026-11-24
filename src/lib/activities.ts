import { cache } from "react";
import { cookies } from "next/headers";

import { createClient } from "@/utils/supabase/server";
import type { Activity } from "@/lib/types";

const ACTIVITY_COLUMNS =
  "id, name, slug, category, description, location, image_url, is_published";

async function getSupabase() {
  return createClient(await cookies());
}

/** Published activities, A–Z by name. Throws on database errors so error.tsx can handle them. */
export async function getPublishedActivities(): Promise<Activity[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("activities")
    .select(ACTIVITY_COLUMNS)
    .eq("is_published", true)
    .order("name", { ascending: true });

  if (error) throw new Error(`Failed to load activities: ${error.message}`);
  return data;
}

/**
 * One published activity by slug, or null if it doesn't exist or is unpublished.
 * Wrapped in React `cache` so generateMetadata and the page share one query per request.
 */
export const getPublishedActivityBySlug = cache(
  async (slug: string): Promise<Activity | null> => {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("activities")
      .select(ACTIVITY_COLUMNS)
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error) throw new Error(`Failed to load activity: ${error.message}`);
    return data;
  },
);
