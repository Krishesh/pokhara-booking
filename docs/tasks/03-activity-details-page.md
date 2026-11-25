# 03 — Activity Details Page

## Goal
Give every activity a dedicated page with its full description, image, and price, and a clear path toward booking.

## User Flow
1. Visitor clicks an activity card and lands on `/activities/[id]`.
2. The page shows a large image, name, description, price, and a "Request booking" button.
3. The activity cards on `/` become links to this page.
4. An unknown or malformed id renders the standard 404 (`notFound()`), and a failed fetch shows an error state with a link back to `/`.
5. A back link returns to the activity list.

## Database tables and columns used
From `docs/scheme.sql`:

**`activities`**
- `id` (uuid) — route parameter and lookup
- `name` (text) — page heading and metadata title
- `description` (text) — body copy, with a fallback when null
- `image_url` (text) — hero image, with a fallback when null
- `price` (numeric(10,2)) — displayed prominently
- `created_at` (timestamptz) — optional "added" context

No schema changes required.

## Acceptance Criteria
- Server Component route; `params` is a Promise in Next.js 16 and must be awaited.
- `generateMetadata` sets the page title from the activity name.
- The "Request booking" button anchors to a `#booking` section; the form itself arrives in Task 05.
- Loading (`loading.tsx`) and not-found states exist.
- `npm run lint`, `npm run typecheck`, and `npm run build` pass.

## Notes
- Depends on Task 01 for the Supabase client, `Activity` type, and card component.
- Task 04 adds the ratings/reviews block to this page; Task 05 adds the booking form.
