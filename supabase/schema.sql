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
-- Public visitors use the anon (publishable) key and may only READ what the site shows.
-- All writes (admin, task 04) go through server code using the service-role key, which bypasses RLS.
alter table public.providers      enable row level security;
alter table public.activities     enable row level security;
alter table public.price_listings enable row level security;

-- Table privileges: anon is read-only
grant usage on schema public to anon;
revoke insert, update, delete, truncate on public.providers, public.activities, public.price_listings from anon;
grant select on public.providers, public.activities, public.price_listings to anon;

drop policy if exists "anon full access" on public.providers;
drop policy if exists "anon full access" on public.activities;
drop policy if exists "anon full access" on public.price_listings;

-- Activities: only published ones
drop policy if exists "anon reads published activities" on public.activities;
create policy "anon reads published activities" on public.activities
  for select to anon
  using (is_published);

-- Offers: not outdated, and on a published activity
drop policy if exists "anon reads public offers" on public.price_listings;
create policy "anon reads public offers" on public.price_listings
  for select to anon
  using (
    verification_status <> 'outdated'
    and exists (
      select 1 from public.activities a
      where a.id = price_listings.activity_id and a.is_published
    )
  );

-- Providers: only those with at least one public offer
drop policy if exists "anon reads providers with public offers" on public.providers;
create policy "anon reads providers with public offers" on public.providers
  for select to anon
  using (
    exists (
      select 1
      from public.price_listings pl
      join public.activities a on a.id = pl.activity_id
      where pl.provider_id = providers.id
        and pl.verification_status <> 'outdated'
        and a.is_published
    )
  );
