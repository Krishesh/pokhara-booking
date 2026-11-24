# 03 — Submit a booking request

**Status:** Built (2026-11-24). **Depends on:** 02 (offer cards). **PRD:** B "Booking requests", C "Submit a booking request".

## Goal

A visitor picks an offer, enters their details and submits a booking request. The server re-checks the offer, recalculates the total, saves the request with a frozen copy of the offer, and shows a reference with a "pending, not confirmed" message.

## User Flow

1. Each offer card has a **Request booking** button. Offers priced `per_hour` or `other` instead show "Online requests aren't available for this offer."
2. The button opens a dialog titled "Request booking" with the activity, package and vendor. Fields:
   - Your name (2–100 characters)
   - Contact method: Phone or Email (radio), then the phone number or email address
     - Phone: `+`, spaces, dashes and brackets allowed; 7–15 digits. Stored without spaces (`+9779800000000`).
     - Email: basic format check, up to 254 characters.
   - Date: today or later in Pokhara time (`Asia/Kathmandu`), at most 12 months ahead
   - Participants: whole number 1–20
3. An **Estimated total** updates as the visitor types:
   - `per_person`: price × participants ("NPR 8,500 per person × 3")
   - `per_group`, `per_flight`: the flat price ("(flat price)")
4. "This is a request, not a confirmed booking. We only use your contact details to arrange this booking."
5. **Send request** shows a spinner while sending. The Server Action:
   - Validates every field (errors appear under each field; values are kept).
   - Re-reads the offer with the service-role key and applies the public visibility rules itself (published activity, not outdated, has price and currency, requestable unit).
   - **Offer gone or outdated:** the dialog shows "Offer unavailable" with a Reload button. Nothing is saved.
   - **Price, currency or unit changed:** nothing is saved; a red notice shows the new price, the total recalculates, and the visitor submits again with the new terms. No silent substitution.
   - **Honeypot filled** (hidden `website` field): shows a normal confirmation but saves nothing.
   - Otherwise saves the request with a reference like `PKR-7EV5GB` (no 0/O/1/I/L), retrying on the rare duplicate.
6. The dialog switches to the confirmation:
   > Request received. Confirmation is pending. This request does not reserve capacity or guarantee a booking.

   Then the reference, activity, offer, date, participants and estimated total. No public URL for the request (the PRD says the public can't look up booking records).
7. Unexpected server errors show a toast ("We couldn't send your request…"). Reopening the dialog starts a fresh form.

## Database tables and columns used

| Table | Columns | Use |
|---|---|---|
| `price_listings` | `id`, `package_name`, `price`, `currency`, `pricing_unit`, `duration`, `inclusions`, `booking_conditions`, `verification_status`, `retrieved_at`, `source_domain`, `activity_id`, `provider_id` | Server-side re-check and snapshot source |
| `activities` | `name`, `slug`, `is_published` | Visibility check and snapshot |
| `providers` | `name` | Snapshot |
| `booking_requests` (new) | all columns | Insert only |

## `booking_requests` table

Added to `supabase/schema.sql` and applied:

| Column | Notes |
|---|---|
| `reference` | Unique, `PKR-` + 6 characters (check constraint) |
| `price_listing_id` | `on delete set null`, so requests survive offer deletion |
| `customer_name`, `contact_type` (`phone`/`email`), `contact_value` | Length and value checks |
| `requested_date`, `participant_count` (1–20) | |
| `offer_snapshot` (jsonb) | Activity name and slug, vendor, provider name, source domain, package, price, currency, unit, duration, inclusions, conditions, verification status, price-checked date. Never updated. |
| `total_price`, `currency` | Computed on the server |
| `status` | `pending` (default), `confirmed`, `rejected`, `cancelled` (task 05) |
| `staff_note`, `created_at`, `updated_at` | |

Index on `(status, created_at)` for the admin list (task 05).

**Access:** RLS on with no policies, and all privileges revoked from `anon` and `authenticated`. Only server code using the service-role key reads or writes this table. The public key gets `permission denied` for both reading and inserting.

## Implementation

| File | Contents |
|---|---|
| `src/lib/booking.ts` | Pure logic: `validateBookingForm`, `calculateTotal`, `isRequestableUnit`, `todayInTimeZone`, `maxRequestDate`, `normalizePhone`, `isValidEmail`, `hasOfferChanged`, `generateReference`, `buildOfferSnapshot` |
| `src/lib/booking.test.ts` | 22 Vitest tests for the above (41 in the project) |
| `src/utils/supabase/admin.ts` | Service-role client, guarded by `server-only` (a client import fails the build) |
| `src/app/activities/[slug]/actions.ts` | `submitBookingRequest` Server Action |
| `src/components/booking-dialog.tsx` | Dialog, form, live total, price-changed notice, confirmation |
| `src/components/offer-card.tsx` | Request button or "not available online" note |
| `src/app/layout.tsx` | `sonner` `<Toaster />` |

New packages: `server-only`, `sonner` (+ `next-themes`, pulled in by the shadcn `sonner` component), shadcn `dialog`, `label`, `radio-group`. `@types/node` bumped to 22 to satisfy Vitest 5's peer requirement.

**Environment:** `SUPABASE_SERVICE_ROLE_KEY` must be set in `.env.local` (server-only, never `NEXT_PUBLIC_`).

## Acceptance criteria

- [x] Empty submit shows errors under name, contact and date; values stay in the form.
- [x] Valid request (3 × NPR 8,500) saves with total NPR 25,500, a `PKR-` reference, normalized phone and the offer snapshot; the confirmation shows the PRD text.
- [x] Price changed in the database while the form is open: nothing saved, new price shown, total recalculated; resubmitting saves at the new price.
- [x] Offer marked outdated while the form is open: "Offer unavailable", nothing saved.
- [x] Group offer stays flat (NPR 1,500 for 4 people).
- [x] Honeypot submission shows a confirmation but saves nothing.
- [x] Public key cannot read or insert `booking_requests`; the service-role key is not in any browser bundle.
- [x] Works on mobile (dialog scrolls within the screen); lint, `npm test` and `npm run build` pass.
