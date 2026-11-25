// Pure filters for the admin providers and outings lists. No I/O; unit-tested.

import type { OutingState } from "../outings";

/** Providers whose name, website, phone or address contains the search text (case-insensitive). */
export function filterProviders<
  T extends { name: string; website_url: string | null; phone: string | null; address: string | null },
>(providers: readonly T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...providers];
  return providers.filter((p) =>
    [p.name, p.website_url ?? "", p.phone ?? "", p.address ?? ""].some((field) => field.toLowerCase().includes(q)),
  );
}

/** "https://www.example.com/path" -> "example.com"; returns the input when it isn't a URL. */
export function displayDomain(url: string): string {
  try {
    return new URL(url.includes("://") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export const OUTING_TABS = ["all", "open", "draft", "cancelled", "past"] as const;
export type OutingTab = (typeof OUTING_TABS)[number];

export function parseOutingTab(value: unknown): OutingTab {
  return typeof value === "string" && (OUTING_TABS as readonly string[]).includes(value) ? (value as OutingTab) : "all";
}

/** Counts per tab from each outing's current state ("open" = published and not yet past). */
export function outingTabCounts(states: readonly OutingState[]): Record<OutingTab, number> {
  const counts: Record<OutingTab, number> = { all: states.length, open: 0, draft: 0, cancelled: 0, past: 0 };
  for (const s of states) counts[s] += 1;
  return counts;
}
