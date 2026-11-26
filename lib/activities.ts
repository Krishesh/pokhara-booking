import "server-only";

import type { Activity } from "@/lib/types";
import { createServerSupabaseClient } from "@/utils/supabase/server";

const ACTIVITY_COLUMNS =
  "id, name, slug, category, description, location, image_url, is_published" as const;

export async function getPublishedActivities(): Promise<Activity[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("activities")
    .select(ACTIVITY_COLUMNS)
    .eq("is_published", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch activities: ${error.message}`);
  }

  return data ?? [];
}

export async function getPublishedActivityBySlug(
  slug: string
): Promise<Activity | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("activities")
    .select(ACTIVITY_COLUMNS)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch activity: ${error.message}`);
  }

  return data;
}
