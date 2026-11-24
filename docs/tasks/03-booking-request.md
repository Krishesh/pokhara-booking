# 03 — Submit a booking request

**Depends on:** 02 (offer cards). **PRD:** B "Booking requests", C "Submit a booking request".

## Goal

A visitor picks an offer, enters their details and submits a booking request. The server recalculates the total, saves the request with a frozen copy of the offer, and shows a reference number with a "pending, not confirmed" message.

## User Flow

1. On an available offer card, visitor clicks "Request booking".
2. A form (dialog or inline) asks for: name, contact method (phone or email) and value, requested date, participant count.
3. The form shows a live total before submit:
   - `per_person`: price × participants
   - `per_group` / `per_flight`: price (flat)
   - `per_hour` / `other`: no total; offer cannot be requested online
4. Visitor submits. A server action:
   - Re-reads the listing from `price_listings`.
   - Rejects if the offer is now unavailable (outdated or no price).
   - Rejects if the price shown in the form differs from the stored price, and shows the updated price for review.
   - Saves the request with a snapshot of the offer and the computed total.
5. Visitor sees an acknowledgement page with the reference and the text:
   > Request received. Confirmation is pending. This request does not reserve capacity or guarantee a booking.
6. Validation errors show inline under each field; server errors show a toast.

## Database tables and columns used

From `supabase/schema.sql` (read only):

| Table | Columns | Use |
|---|---|---|
| `price_listings` | `id`, `activity_id`, `provider_id`, `package_name`, `price`, `currency`, `pricing_unit`, `duration`, `inclusions`, `booking_conditions`, `verification_status` | Server-side re-check and snapshot source |
| `providers` | `name` | Snapshot |
| `activities` | `name` | Snapshot |

## Schema changes needed

No table stores booking requests yet. Proposed (update `supabase/schema.sql`, then run in Supabase):

```sql
create table public.booking_requests (
  id                uuid primary key default gen_random_uuid(),
  reference         text not null unique,
  price_listing_id  uuid references public.price_listings (id) on delete set null,
  customer_name     text not null,
  contact_type      text not null check (contact_type in ('phone', 'email')),
  contact_value     text not null,
  requested_date    date not null,
  participant_count integer not null check (participant_count > 0),
  offer_snapshot    jsonb not null,  -- activity/provider names, package, price, currency, pricing_unit, inclusions, conditions
  total_price       numeric(12, 2) not null check (total_price >= 0),
  currency          text not null,
  status            text not null default 'pending'
                    check (status in ('pending', 'confirmed', 'rejected', 'cancelled')),
  staff_note        text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);
alter table public.booking_requests enable row level security;
```

Note: with the current "anon full access" policy pattern, anyone could read all bookings, including customer contact details. This table should allow anon `insert` only.

## Business logic to unit test

- `calculateTotal(price, pricing_unit, participants)`, including the "not bookable online" units.
- `buildOfferSnapshot(listing, provider, activity)`.
- `generateReference()` format (e.g. `PKR-7F3K2Q`).
- Form validation (date not in the past, participants ≥ 1, contact format).
