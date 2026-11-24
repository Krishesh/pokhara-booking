# 04 — Admin: manage activities, providers and offers

**Depends on:** nothing (works on existing tables). **PRD:** B "Basic staff administration" (listings part).

## Goal

Staff can add, edit and publish activities, providers and price listings from simple admin pages, so launch content can be entered without using the Supabase dashboard.

Per `AGENTS.md` there is no login: `/admin` is open in the single-user demo. The PRD's staff authentication is deferred.

## User Flow

1. Staff opens `/admin` and sees links to Activities, Providers and Offers.
2. **Activities:** table of all activities (published and unpublished). "New activity" form: name, slug (auto-filled from name, editable), category, location, image URL, description, published toggle. Edit uses the same form.
3. **Providers:** table and form: name, website, phone, address, Google Maps URL, rating, review count, rating retrieved date, notes.
4. **Offers:** table filterable by activity. Form: activity (select), provider (select, optional), package name, price, currency (select), pricing unit (select), duration, inclusions, booking conditions, source domain, source URL, booking URL, retrieved date, verification status (select), notes.
5. Save shows a success toast; validation and database errors (e.g. duplicate slug, rating outside 0–5) show inline or as a toast.
6. "Delete" is avoided: unpublish activities and mark offers `outdated` instead, so existing booking snapshots stay meaningful.

## Database tables and columns used

From `supabase/schema.sql` (read and write):

| Table | Columns |
|---|---|
| `activities` | `id`, `name`, `slug`, `category`, `description`, `location`, `image_url`, `created_at` (+ `is_published` from task 01) |
| `providers` | `id`, `name`, `website_url`, `phone`, `address`, `google_maps_url`, `google_rating`, `google_review_count`, `google_retrieved_at`, `notes`, `created_at` |
| `price_listings` | all columns: `id`, `activity_id`, `provider_id`, `package_name`, `price`, `currency`, `pricing_unit`, `duration`, `inclusions`, `booking_conditions`, `source_domain`, `source_url`, `booking_url`, `retrieved_at`, `verification_status`, `notes`, `created_at` |

Form selects must match the schema checks: `currency` in NPR/USD/INR/EUR, `pricing_unit` in per_person/per_group/per_hour/per_flight/other, `verification_status` in verified/unverified/outdated.

## Business logic to unit test

- `slugify(name)`.
- Offer form validation mirroring the schema checks (price ≥ 0, rating 0–5, required `source_domain` and `source_url`).
