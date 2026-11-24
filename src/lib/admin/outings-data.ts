import "server-only";

import { requireAdmin } from "./guard";
import type { OutingStatus } from "../outings";

export type AdminOuting = {
  id: string;
  slug: string;
  title: string;
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
  created_at: string;
  updated_at: string;
};

export type AdminInterest = {
  id: string;
  customer_name: string;
  contact_type: "phone" | "email";
  contact_value: string;
  participant_count: number;
  created_at: string;
};

const COLUMNS = `id, slug, title, destination, organizer_name, organizer_contact, description, outing_date,
  meeting_details, cost_info, image_url, image_credit, status, created_at, updated_at`;

function fail(what: string, error: { message: string }): never {
  console.error(`admin: failed to load ${what}`, error);
  throw new Error(`Failed to load ${what}`);
}

/** All outings with interest totals, soonest first ("to be confirmed" last). */
export async function listAdminOutings(): Promise<(AdminOuting & { interest_count: number; people_count: number })[]> {
  const supabase = await requireAdmin();
  const [outings, interests] = await Promise.all([
    supabase.from("group_outings").select(COLUMNS).order("outing_date", { ascending: true, nullsFirst: false }).order("title"),
    supabase.from("group_interests").select("outing_id, participant_count"),
  ]);
  if (outings.error) fail("outings", outings.error);
  if (interests.error) fail("interests", interests.error);

  const totals = new Map<string, { interest_count: number; people_count: number }>();
  for (const i of interests.data) {
    const t = totals.get(i.outing_id) ?? { interest_count: 0, people_count: 0 };
    t.interest_count += 1;
    t.people_count += i.participant_count;
    totals.set(i.outing_id, t);
  }
  return (outings.data as AdminOuting[]).map((o) => ({ ...o, ...(totals.get(o.id) ?? { interest_count: 0, people_count: 0 }) }));
}

export async function getAdminOuting(id: string): Promise<{ outing: AdminOuting; interests: AdminInterest[] } | null> {
  const supabase = await requireAdmin();
  const { data, error } = await supabase.from("group_outings").select(COLUMNS).eq("id", id).maybeSingle();
  if (error) fail("outing", error);
  if (!data) return null;
  const { data: interests, error: interestsError } = await supabase
    .from("group_interests")
    .select("id, customer_name, contact_type, contact_value, participant_count, created_at")
    .eq("outing_id", id)
    .order("created_at", { ascending: true });
  if (interestsError) fail("interests", interestsError);
  return { outing: data as AdminOuting, interests: interests as AdminInterest[] };
}
