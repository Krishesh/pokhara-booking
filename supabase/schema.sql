-- Pokhara Booking schema
-- Source of truth for table and column names. Read this before writing queries or types.
-- Mirrors the live Supabase project as of 2026-11-24.

create extension if not exists pgcrypto;

-- Activity operators (paragliding companies, boat rentals, etc.)
create table if not exists public.providers (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  website_url         text,
  phone               text,
  address             text,
  google_maps_url     text,
  google_rating       numeric(2, 1) check (google_rating >= 0 and google_rating <= 5),
  google_review_count integer check (google_review_count >= 0),
  google_retrieved_at date,
  notes               text,
  created_at          timestamptz default now()
);

-- Things to do in Pokhara
create table if not exists public.activities (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  category     text not null,
  description  text,
  location     text,
  image_url    text,
  is_published boolean not null default false,  -- only published rows are shown publicly
  created_at   timestamptz default now()
);

-- A price offered for an activity, optionally by a specific provider
create table if not exists public.price_listings (
  id                  uuid primary key default gen_random_uuid(),
  activity_id         uuid not null references public.activities (id) on delete cascade,
  provider_id         uuid references public.providers (id) on delete set null,
  package_name        text,
  price               numeric(12, 2) check (price >= 0),
  currency            text check (currency in ('NPR', 'USD', 'INR', 'EUR')),
  pricing_unit        text check (pricing_unit in ('per_person', 'per_group', 'per_hour', 'per_flight', 'other')),
  duration            text,
  inclusions          text,
  booking_conditions  text,
  source_domain       text not null,
  source_url          text not null,
  booking_url         text,
  retrieved_at        date,
  verification_status text not null default 'unverified'
                      check (verification_status in ('verified', 'unverified', 'outdated')),
  notes               text,
  created_at          timestamptz default now()
);

-- Row Level Security
-- MVP has no auth (single-user demo), so the anon role gets full access.
alter table public.providers      enable row level security;
alter table public.activities     enable row level security;
alter table public.price_listings enable row level security;

-- Table privileges for anon (policies only filter rows; anon also needs these grants)
grant usage on schema public to anon;
grant select, insert, update, delete on public.providers      to anon;
grant select, insert, update, delete on public.activities     to anon;
grant select, insert, update, delete on public.price_listings to anon;

drop policy if exists "anon full access" on public.providers;
create policy "anon full access" on public.providers
  for all to anon using (true) with check (true);

drop policy if exists "anon full access" on public.activities;
create policy "anon full access" on public.activities
  for all to anon using (true) with check (true);

drop policy if exists "anon full access" on public.price_listings;
create policy "anon full access" on public.price_listings
  for all to anon using (true) with check (true);
