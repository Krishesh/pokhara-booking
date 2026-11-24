# 06 — Hiking and travel group outings

**Depends on:** nothing (new tables). **PRD:** B "Minimal hiking/travel groups", C "Browse a group and submit interest". This is the feature the PRD's fallback plan cuts first if time runs short.

## Goal

Staff publish group outings; visitors browse them and register interest with a name and contact. Interest does not reserve a place, and cancelled outings stop accepting it.

## User Flow

**Staff**

1. Staff opens `/admin/outings` and creates an outing: title, destination, organizer name and contact, description, date (or "to be confirmed"), meeting details, cost info (free text or "to be confirmed"), status (`draft` / `published` / `cancelled`).
2. Staff opens an outing to see the list of people who registered interest, with their contact details.

**Visitor**

1. Visitor opens `/outings` and sees published and cancelled outings (cancelled ones are labelled). Drafts are hidden.
2. Visitor opens `/outings/[id]` and sees the outing details and organizer.
3. Visitor fills name, contact method and contact value, then submits.
4. Acknowledgement: "Interest received. This does not confirm participation or reserve a place. The organizer will contact you."
5. On a cancelled outing, the form is disabled with a "This outing has been cancelled" message, and the server also rejects submissions.
6. Empty state: "No group outings planned yet."

## Database tables and columns used

None of the current tables in `supabase/schema.sql` cover this. Proposed (update `supabase/schema.sql`, then run in Supabase):

```sql
create table public.group_outings (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  destination       text not null,
  organizer_name    text not null,
  organizer_contact text,
  description       text,
  outing_date       date,          -- null = to be confirmed
  meeting_details   text,
  cost_info         text,          -- descriptive only, not a price
  status            text not null default 'draft'
                    check (status in ('draft', 'published', 'cancelled')),
  created_at        timestamptz default now()
);

create table public.group_interests (
  id            uuid primary key default gen_random_uuid(),
  outing_id     uuid not null references public.group_outings (id) on delete cascade,
  customer_name text not null,
  contact_type  text not null check (contact_type in ('phone', 'email')),
  contact_value text not null,
  created_at    timestamptz default now()
);

alter table public.group_outings   enable row level security;
alter table public.group_interests enable row level security;
```

`group_interests` holds contact details, so anon should get `insert` only, not read access.

## Business logic to unit test

- `canRegisterInterest(outing)`: true only when `status = 'published'`.
- `formatOutingDate(date)`: "To be confirmed" when null.
- Contact validation (shared with task 03).
