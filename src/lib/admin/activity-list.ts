// Pure filtering for the admin activities list. No I/O; unit-tested.

export const ACTIVITY_TABS = ["all", "live", "hidden"] as const;
export type ActivityTab = (typeof ACTIVITY_TABS)[number];

export function parseActivityTab(value: unknown): ActivityTab {
  return typeof value === "string" && (ACTIVITY_TABS as readonly string[]).includes(value) ? (value as ActivityTab) : "all";
}

/** Counts for the tabs, from the unfiltered list. */
export function activityTabCounts(activities: readonly { is_published: boolean }[]): Record<ActivityTab, number> {
  const live = activities.filter((a) => a.is_published).length;
  return { all: activities.length, live, hidden: activities.length - live };
}

/** Activities in the tab whose name, slug, category or location contains the search text (case-insensitive). */
export function filterActivities<
  T extends { name: string; slug: string; category: string; location: string | null; is_published: boolean },
>(activities: readonly T[], tab: ActivityTab, query: string): T[] {
  const q = query.trim().toLowerCase();
  return activities.filter((a) => {
    if (tab === "live" && !a.is_published) return false;
    if (tab === "hidden" && a.is_published) return false;
    if (!q) return true;
    return [a.name, a.slug, a.category, a.location ?? ""].some((field) => field.toLowerCase().includes(q));
  });
}
