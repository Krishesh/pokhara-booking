# 02 — Vendor offers on the activity page

**Depends on:** 01 (activity detail page). **PRD:** B "Vendor offers and customer pricing", C "Browse and compare offers".

## Goal

The activity detail page lists every available offer for that activity, side by side, so visitors can compare vendor, price and what is included. Outdated offers are not shown as bookable.

## User Flow

1. Visitor opens `/activities/[slug]`.
2. Below the description, an "Offers" section shows one card per price listing:
   - Provider name, Google rating and review count (if present)
   - Package name and duration
   - Price, currency and pricing unit (e.g. "NPR 8,500 per person")
   - Inclusions and booking conditions
   - Verification badge (`verified` / `unverified`)
3. Missing fields are left out, never shown as "included".
4. Listings marked `outdated`, or with no `price`, are shown greyed out as "Not available for booking", or hidden.
5. If the activity has no available offers, the section says booking requests are unavailable for this activity.

## Database tables and columns used

From `supabase/schema.sql`:

| Table | Columns | Use |
|---|---|---|
| `price_listings` | `id`, `activity_id`, `provider_id`, `package_name`, `price`, `currency`, `pricing_unit`, `duration`, `inclusions`, `booking_conditions`, `verification_status` | Offer cards; filter by `activity_id` |
| `providers` | `id`, `name`, `google_rating`, `google_review_count` | Vendor identity on each card, joined via `price_listings.provider_id` (nullable: show "Independent listing" if null) |
| `activities` | `id`, `slug` | Look up the activity |

Not shown publicly: `price_listings.source_url`, `source_domain`, `notes`, `providers.phone`, `providers.notes`.

## Business logic to unit test

- `isOfferAvailable(listing)`: false if `verification_status = 'outdated'` or `price` is null.
- `formatPrice(price, currency, pricing_unit)`.

## Open question

The PRD's commission model (vendor amount + commission = customer price) is unresolved. `price_listings.price` has one price only. For this task, show `price` as the customer price; add commission columns later once the founder decides.
