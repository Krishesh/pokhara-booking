# 04 — Admin: manage activities, providers and offers

**Status:** Built (2026-11-24). **Depends on:** nothing (works on existing tables). **PRD:** B "Basic staff administration" (listings part).
**Staff guide:** [`docs/admin-guide.md`](../admin-guide.md).

## Goal

Staff can add, edit, publish and hide activities, providers and offers from simple admin pages, so launch content can be managed without the Supabase dashboard. Nothing is ever deleted.

## Access

`AGENTS.md` rules out login, signup and Supabase Auth. Admin writes with the service-role key, though, so leaving it open would let anyone edit the site once deployed. Decision: **one shared password, using the browser's built-in sign-in box (HTTP Basic Auth)**. There are no accounts and no login UI.

- `ADMIN_PASSWORD` in `.env.local` (8+ characters; any username). If it's unset or too short, `/admin` returns 503 and stays locked.
- `src/proxy.ts` checks every `/admin` request: 401 with a `WWW-Authenticate` prompt, `Cache-Control: no-store`, `X-Robots-Tag: noindex`.
- **Server Actions can be POSTed to any URL**, so the proxy is not enough. Every admin action and admin data read calls `requireAdmin()` (`src/lib/admin/guard.ts`), which re-checks the `Authorization` header before creating the service-role client. Verified: posting the publish action to a public page without the password changes nothing, while the same request with the password works.
- Admin pages are `noindex`, and the public site has no link to `/admin`.
- `AGENTS.md` notes this exception so future work keeps it.

## User Flow

**Navigation:** a top bar on every admin page: Overview · Activities · Offers · Providers · View site.

1. **Overview** (`/admin`): cards for activities (published / total), offers (unverified / outdated / without price), providers, and pending booking requests (read-only until task 05).
2. **Activities** (`/admin/activities`): table of name + slug, category, location, offer count (links to filtered offers), a **Live / Hidden** switch (instant, with toast), a view-on-site link and an edit link. **New activity** and edit pages (`/admin/activities/new`, `/admin/activities/[id]`):
   - Name; slug filled in automatically from the name until edited. Changing the slug of a live activity shows a broken-links warning; a duplicate slug shows "This slug is already used by …".
   - Category (free text, with suggestions from existing categories), location, description.
   - Photo: `https://` link only, live preview, plus a **Photo credit** shown under the photo on the site.
   - Live switch.
3. **Providers** (`/admin/providers`): table of name/website, Google rating, phone, offer count. The form has two parts:
   - **Shown to visitors:** name, rating 0–5 (one decimal), review count (needs a rating), rating-checked date.
   - **Staff only:** phone, website, address, Maps link, notes.
4. **Offers** (`/admin/offers`):
   - Filters for activity and status, kept in the URL (`?activity=…&status=…`).
   - Table columns: offer (package · activity · provider), price + unit, status badge, **on website** (visible, or why it's hidden), price-checked date.
   - Quick buttons: **Verify** (sets verified and the price-checked date to today; shows as **Re-check** on verified offers) and **Outdated**.
   - The form (`/admin/offers/new?activity=…`, `/admin/offers/[id]`):
     - activity (hidden ones marked) and provider ("No provider" means "Listed on …")
     - package, duration
     - price (commas allowed), currency, unit, with a "Visitors will see" preview
     - inclusions, conditions
     - status and price-checked date (defaults to today), with a live visibility hint
     - source link (required) with the source website filled in automatically, booking link, notes
     - on edit, a note that changes apply to new booking requests only
5. Saving shows a success toast and returns to the list. Validation errors appear under each field, and the typed values are kept (the form submits without React's automatic reset). Unexpected errors show a toast. Each list has a loading skeleton and an empty state, and `/admin` has an error page with retry.
6. **No deletes.** Activities are hidden, offers are marked outdated, and providers simply have no offers. Booking-request snapshots are never touched.

## Database tables and columns used

From `supabase/schema.sql`, read and written with the service-role key:

| Table | Columns |
|---|---|
| `activities` | `id`, `name`, `slug`, `category`, `description`, `location`, `image_url`, `image_credit` (new), `is_published`, `created_at` |
| `providers` | `id`, `name`, `website_url`, `phone`, `address`, `google_maps_url`, `google_rating`, `google_review_count`, `google_retrieved_at`, `notes` |
| `price_listings` | all columns |
| `booking_requests` | `status` (pending count on the overview only) |

**Schema change:** `activities.image_credit text` (photographer and licence), granted to anon for the public caption. Applied.

## Validation (`src/lib/admin/validation.ts`, tested)

Mirrors the database checks so staff get clear messages:
- **Text:** length limits.
- **Slug:** `^[a-z0-9]+(-[a-z0-9]+)*$`, up to 80 characters, unique.
- **Links:** image link `https://` only; other links http(s) only (no `javascript:`).
- **Provider numbers:** rating 0–5 with one decimal; review count a whole number, and it needs a rating.
- **Price:** ≥ 0 with up to 2 decimals, commas allowed. Price and currency go together.
- **Allowed values:** currency, pricing unit and status must be one of the allowed values.
- **Required:** the source link; the source domain is taken from it.
- **Ids:** valid UUIDs.

`offerVisibility()` explains why an offer is hidden. `slugify()` and `domainFromUrl()` power the auto-fill.

## Photos

The five published activities now use freely licensed Wikimedia Commons photos (CC BY-SA 4.0), each credited under the photo. Details are in [`docs/image-credits.md`](../image-credits.md). Zipline and ultralight use scenery of the same area, because no free photos of those activities exist on Commons. Bungee (hidden) keeps the placeholder.

## Implementation

| File | Contents |
|---|---|
| `src/lib/admin/basic-auth.ts` (+ test) | Pure Basic Auth parsing, constant-time compare, `isAdminAuthorized` |
| `src/lib/admin/guard.ts` | `requireAdmin()`: password check, then the service-role client |
| `src/proxy.ts` | `/admin` gate |
| `src/lib/admin/validation.ts` (+ test) | Form validation and helpers |
| `src/lib/admin/data.ts` | Admin reads (overview, lists, single rows, form options) |
| `src/app/admin/actions.ts` | `saveActivity`, `setActivityPublished`, `saveProvider`, `saveOffer`, `setOfferStatus` |
| `src/app/admin/**` | Layout, overview, error page, list and form pages |
| `src/components/admin/*` | Nav, forms, quick actions, filters, skeletons, form helpers |
| `docs/admin-guide.md`, `docs/images/admin/*` | Staff guide with screenshots |
| `.env.example` | All required environment variables |

New shadcn components: `table`, `switch`, `textarea`, `native-select`.

## Acceptance criteria

- [x] `/admin` without the password returns 401 (503 if no password is configured); a wrong password returns 401; the right one returns 200. Admin pages are `noindex`.
- [x] An admin Server Action posted to a public URL without the password changes nothing.
- [x] An empty activity form shows errors; the slug fills in from the name; values survive errors; an `http://` image is rejected; a duplicate slug names the other activity.
- [x] Creating a provider with a review count but no rating is rejected; with a rating it saves.
- [x] A new offer on a hidden activity shows "Hidden: activity not published"; the source website fills in from the link; the price preview reads "NPR 7,500 per person".
- [x] The Live switch publishes the activity with a toast; the activity and its offer then appear on the public site.
- [x] The offers filter by activity works; Verify sets the status to verified and the price-checked date to today.
- [x] Photos show on the home and detail pages with credits.
- [x] Lint, `npm test` (68 tests) and `npm run build` pass. Test data was removed afterwards.
