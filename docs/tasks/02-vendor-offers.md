# 02 — Vendor offers on the activity page

**Status:** Built (2026-11-24). **Depends on:** 01 (activity detail page). **PRD:** B "Vendor offers and customer pricing", C "Browse and compare offers".

## Goal

The activity detail page lists every available offer for that activity, so visitors can compare vendor, price and what is included. Outdated or unpriced offers are never shown.

## User Flow

1. Visitor opens `/activities/[slug]`. The activity details show immediately; offers stream in below with a skeleton.
2. An "Offers (n)" section lists one full-width card per available offer, with the hint "Compare what each offer includes, not just the price."
3. Each card shows, top to bottom:
   - Vendor: provider name, or "Listed on {source_domain}" when there is no provider. Google rating as "★ 4.7 · 312 Google reviews", or "★ 4.2 Google rating" without a count, or nothing without a rating.
   - Package name (fallback "Standard package") and duration.
   - Price, large: "NPR 8,500 per person". Nepali digit grouping (12,48,500), no decimals for whole amounts. Units: per person / per group / per hour / per flight; nothing for `other`.
   - Badge: "Verified" (with check icon) or "Unverified price". "Price checked 10 Nov 2026" when `retrieved_at` is set.
   - "Included" and "Conditions" as plain text with line breaks, each only when filled in.
4. Offers are sorted by currency (NPR, USD, INR, EUR), then price low to high, then package name.
5. Offers that are `outdated`, or have no `price` or `currency`, are hidden.
6. No available offers: dashed box "Booking requests are not available for this activity yet."
7. No external links (`source_url`, `booking_url`): booking goes through our form (task 03).
8. No "Request booking" button yet (task 03). No "from" price on home cards.

## Database tables and columns used

From `supabase/schema.sql`:

| Table | Columns | Use |
|---|---|---|
| `price_listings` | `id`, `activity_id`, `provider_id`, `package_name`, `price`, `currency`, `pricing_unit`, `duration`, `inclusions`, `booking_conditions`, `verification_status`, `retrieved_at`, `source_domain` | Offer cards, filtered by `activity_id` |
| `providers` | `id`, `name`, `google_rating`, `google_review_count` | Vendor line, joined via `price_listings.provider_id` |
| `activities` | `id` | Parent activity (loaded in task 01) |

Never selected: `price_listings.notes`, `source_url`, `booking_url`; `providers.phone`, `address`, `website_url`, `google_maps_url`, `notes`.

## Database access (Row Level Security)

Done as the first step of this task. The public (anon / publishable) key is read-only:

- `activities`: only `is_published = true` rows.
- `price_listings`: only offers that are not `outdated` and belong to a published activity.
- `providers`: only providers with at least one such offer.
- No insert, update or delete for anon. Admin writes (task 04) must use the service-role key from server code only (`SUPABASE_SERVICE_ROLE_KEY`, never `NEXT_PUBLIC_`).

Column-level hiding (e.g. `notes`) is done in queries only; the anon key can still read those columns on visible rows. Move them behind a view if that becomes sensitive.

## Commission

`price_listings.price` is shown as the customer price. The PRD's vendor amount + commission model is undecided; add commission columns once the founder decides.

## Implementation

| File | Contents |
|---|---|
| `src/lib/types.ts` | `Offer`, `OfferProvider`, `AvailableOffer`, `Currency`, `PricingUnit` |
| `src/lib/offer-format.ts` | Pure functions: `isOfferAvailable`, `formatPrice`, `formatPricingUnit`, `formatRating`, `formatCheckedDate`, `sortOffers` |
| `src/lib/offer-format.test.ts` | Vitest unit tests for all of the above |
| `src/lib/offers.ts` | `getAvailableOffersForActivity(activityId)`: public columns + provider join, filters, sorting |
| `src/components/offer-card.tsx`, `offer-list.tsx` | Offer card, list with empty state, skeleton |
| `src/app/activities/[slug]/page.tsx` | Offers inside their own `<Suspense>` |
| `supabase/seed-offers.sql` | Fictional demo providers and offers (fixed ids, re-runnable) |

## Demo data (`supabase/seed-offers.sql`)

All providers are named "Demo …" with `example.com` domains and a "Demo data" note.

| Activity | Offers | Checks |
|---|---|---|
| Paragliding at Sarangkot | NPR 8,500 (verified), NPR 11,000, USD 95, plus 1 outdated | Sorting, currency order, outdated hidden |
| Boating on Phewa Lake | NPR 1,500 per group | Group pricing, rating without count |
| Zipline at Sarangkot | NPR 6,000, no provider | "Listed on" fallback |
| Ultralight Flight | NPR 13,000 per flight, plus 1 with no price | Unpriced hidden |
| World Peace Pagoda Hike | none | Empty state |
| Bungee Jump at Hemja (unpublished) | NPR 9,000 | Hidden by RLS |

## Acceptance criteria

- [x] Paragliding shows 3 offers in order NPR 8,500, NPR 11,000, USD 95; the outdated sunrise offer is absent.
- [x] Boating shows "NPR 1,500 per group" and "4.2 Google rating".
- [x] Zipline shows "Listed on demo-listings.example.com".
- [x] Ultralight shows only the priced offer, "per flight".
- [x] Peace Pagoda shows the empty message.
- [x] Page source contains no `notes`, `source_url` or `booking_url` values.
- [x] Anon key cannot insert, update or delete, and cannot read unpublished activities or outdated offers.
- [x] Works on mobile and desktop; `npm test`, lint and `npm run build` pass.
