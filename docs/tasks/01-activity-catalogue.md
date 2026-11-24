# 01 — Activity catalogue

**Status:** Spec final (2026-11-24). **Depends on:** nothing. **PRD:** B "Activity catalogue", C "Browse and compare offers" steps 1 and 4.

## Goal

Visitors see a list of published Pokhara activities on the home page and can open a detail page for each one. This is the base page that later tasks add offers (02) and the booking form (03) to.

## User Flow

1. Visitor opens `/` and sees the heading "Adventure activities in Pokhara", a one-line subtitle, and a grid of activity cards sorted A–Z by name.
2. Each card is a single link showing a 16:9 image, the activity name, a category badge and the location. No price is shown.
3. Visitor taps a card and lands on `/activities/[slug]`.
4. The detail page shows a "← All activities" back link, a 16:9 image, the name as `h1`, a category badge, the location with a `MapPin` icon, and the description with line breaks kept.
5. If the slug does not exist or the activity is unpublished, the visitor sees the 404 page.
6. If no activities are published, the home page shows "No activities listed yet".
7. While data loads, a skeleton grid is shown. If Supabase fails, an error page with a retry button is shown.

## Database tables and columns used

From `supabase/schema.sql`:

| Table | Columns | Use |
|---|---|---|
| `activities` | `id`, `name`, `slug`, `category`, `description`, `location`, `image_url`, `is_published` | List and detail page. `slug` is the URL key (unique). Only rows with `is_published = true` are ever returned. |

`category` stays free text (no check constraint) until search or filters are in scope.

## Schema changes

Add to the `activities` table in `supabase/schema.sql`:

```sql
is_published boolean not null default false
```

New rows stay hidden until staff publish them (the toggle arrives in task 04).

## Seed data

New file `supabase/seed.sql`, run once by the developer in the Supabase SQL editor. It starts with:

```sql
alter table public.activities add column if not exists is_published boolean not null default false;
```

Then inserts these rows with `on conflict (slug) do nothing`. All have `image_url = null` and a short, factual 2–3 sentence description (no prices or vendor claims).

| name | slug | category | location | is_published |
|---|---|---|---|---|
| Paragliding at Sarangkot | `paragliding-sarangkot` | paragliding | Sarangkot | true |
| Boating on Phewa Lake | `boating-phewa-lake` | boating | Lakeside | true |
| Zipline at Sarangkot | `zipline-sarangkot` | zipline | Sarangkot | true |
| Ultralight Flight | `ultralight-flight` | ultralight | Pokhara Airport | true |
| World Peace Pagoda Hike | `world-peace-pagoda-hike` | hiking | Anadu Hill | true |
| Bungee Jump at Hemja | `bungee-jump-hemja` | bungee | Hemja | false |

The unpublished bungee row exists to prove unpublished activities stay hidden.

## Implementation notes

| File | Contents |
|---|---|
| `src/lib/types.ts` | Hand-written `Activity` type matching `supabase/schema.sql` (no generated Supabase types). |
| `src/lib/activities.ts` | `getPublishedActivities()` (ordered by `name`) and `getPublishedActivityBySlug(slug)`. Both select only the columns above and filter `is_published = true`. Uses `src/utils/supabase/server.ts`. |
| `src/app/layout.tsx` | Simple header: "Pokhara Booking" linking to `/`. No nav links or footer yet. |
| `src/app/page.tsx` | Replaces the Next.js starter page with the catalogue. Grid: 1 column on mobile, 2 at `sm`, 3 at `lg`. |
| `src/app/loading.tsx`, `src/app/error.tsx` | Skeleton grid; error message with retry button. |
| `src/app/activities/[slug]/page.tsx` | Detail page, `notFound()` for missing or unpublished slugs, `generateMetadata` for the title (e.g. "Paragliding at Sarangkot · Pokhara Booking") and description. |

- **Data freshness:** read fresh on every request (no `"use cache"`), so admin edits show immediately. `cacheComponents: true` is on in `next.config.ts`, so data reads must sit inside `<Suspense>`; the route `loading.tsx` provides that.
- **Images:** `next/image` with `unoptimized` (any host, no `next.config.ts` changes). Alt text is the activity name. When `image_url` is null, show a muted 16:9 box with the lucide `Mountain` icon.
- **Description:** plain text with `whitespace-pre-line`. No markdown.
- **Components:** shadcn `card`, `badge`, plus `skeleton` (install with `npx shadcn@latest add skeleton`).
- **Tests:** none for this task; it has no pure business logic. Unit tests start in task 02.

## Acceptance criteria

- [ ] After running `seed.sql`, `/` shows the 5 published activities A–Z, and Bungee Jump at Hemja does not appear.
- [ ] Each card opens the correct `/activities/[slug]` page.
- [ ] `/activities/bungee-jump-hemja` and `/activities/does-not-exist` return 404.
- [ ] With no published activities, `/` shows "No activities listed yet".
- [ ] A failed Supabase request shows the error page with a working retry button.
- [ ] Activities without an image show the placeholder; every image has alt text.
- [ ] Layout works on mobile and desktop.
- [ ] `npm test` and `npm run build` pass.

## Out of scope

Offers, prices and the "booking requests unavailable" message (task 02). Search, filters, maps, markdown rendering, caching, generated Supabase types, and unit tests.
