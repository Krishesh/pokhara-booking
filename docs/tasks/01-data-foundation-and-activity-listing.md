# 01 — Data Foundation & Activity Listing

## Goal
Connect the app to Supabase with a typed data layer and seed the demo catalog, so visitors can browse all adventure activities as cards showing image, name, and price.

## User Flow
1. Visitor opens `/`.
2. The page fetches activities from Supabase on the server and renders a responsive grid of activity cards (image, name, price).
3. While loading, a skeleton grid is shown. If no rows exist, an empty state ("No activities yet"). If the request fails, an error state with a retry action.
4. Cards are display-only in this slice; linking to details is added in Task 03.

## Database tables and columns used
From `docs/scheme.sql`:

**`activities`**
- `id` (uuid) — React key and future detail-page link
- `name` (text) — card title
- `image_url` (text) — card image, placeholder fallback when null
- `price` (numeric(10,2)) — formatted as NPR (assumption; confirm currency)
- `created_at` (timestamptz) — default ordering, newest first

This task also inserts demo seed data (6–8 Pokhara activities) via SQL the user runs manually in the Supabase SQL editor. Seed rows use the columns above plus `description`, `google_rating`, and `google_review_url` so later slices have data.

## Acceptance Criteria
- `package.json` parses (remove the stray duplicated `"scripts"` line) and `npm install` succeeds.
- `@supabase/supabase-js` installed.
- `lib/supabase/server.ts` creates a server client; it normalizes `NEXT_PUBLIC_SUPABASE_URL` (`.env.local` currently ends in `/rest/v1/`) and throws a clear error when env vars are missing.
- `lib/types.ts` defines an `Activity` type matching the schema exactly.
- `supabase/seed.sql` contains idempotent demo inserts.
- `/` handles loading (`loading.tsx`), empty, and error states.
- `npm run lint`, `npm run typecheck`, and `npm run build` pass.

## Notes
- Server Components by default; no `"use client"` needed here.
- Do not enable RLS or change grants — the schema's `anon` CRUD is intentional for this no-auth demo.
- Use shadcn `Card` and theme tokens; Tailwind utilities only.
- The draft schema lives at `docs/scheme.sql` (not `supabase/schema.sql` as `AGENTS.md` implies). Leave it there unless the user asks to move it.
