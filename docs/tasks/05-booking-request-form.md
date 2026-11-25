# 05 — Booking Request Form

## Goal
Let a visitor submit a booking request for an activity — name, email, phone, and preferred date — store it in Supabase, and see a confirmation.

## User Flow
1. On `/activities/[id]`, the "Request booking" button jumps to a form in the `#booking` section.
2. The form has the activity pre-selected and displayed, plus Name, Email, Phone, and Preferred date (minimum: today).
3. On submit, the form validates inline, then a Server Action inserts a row into `bookings`.
4. Success replaces the form with a confirmation panel: "Request sent — {name}, {activity} on {date}" and a link back to all activities. This is a request, not an instant confirmation.
5. On failure, an error toast appears and entered values are preserved.

## Database tables and columns used
From `docs/scheme.sql`:

**`bookings`**
- `id` (uuid) — generated, used as the confirmation reference
- `activity_id` (uuid, FK → `activities.id`) — the selected activity
- `customer_name` (text) — required
- `customer_email` (text) — required, email format
- `customer_phone` (text) — required, 7–15 digits with optional `+`, spaces, or dashes
- `booking_date` (date) — required, today or later
- `created_at` (timestamptz) — set by the database default

**`activities`**
- `id`, `name`, `price` — read to show which activity is being requested and its price in the confirmation

No schema changes required.

## Acceptance Criteria
- Validation is pure logic in `lib/booking-validation.ts` with Vitest unit tests for required fields, email, phone, and date rules.
- Submission uses a Next.js Server Action (no auth, no client-side Supabase key handling).
- The insert surfaces Supabase errors instead of silently failing.
- Labels on all inputs, semantic `<form>`, success and error states.
- Vitest is installed and `npm test` is added to `package.json` scripts.
- `npm run lint`, `npm run typecheck`, and `npm test` pass; `npm run build` passes.

## Notes
- Depends on Task 03 for the detail page.
- No payment, no email notification, no booking status field — all explicitly out of MVP scope.
- If `@supabase/supabase-js` is still missing from Task 01, add it here.
