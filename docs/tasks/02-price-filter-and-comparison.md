# 02 — Price Filtering & Comparison

## Goal
Let visitors narrow the activity list to a minimum/maximum price range and compare the resulting prices at a glance.

## User Flow
1. On `/`, a filter bar offers **Min price** and **Max price** number inputs with an Apply button and a Clear link.
2. Submitting writes the range to the URL (`/?min=50&max=150`) so the filtered view is shareable and server-rendered.
3. The grid shows only matching activities, sorted lowest price first, plus a summary line: "4 activities from Rs. 50 to Rs. 150".
4. If nothing matches, show an empty state: "No activities match this price range" with a Clear action.
5. Invalid input (negative, non-numeric, min > max) shows an inline message and does not apply the filter.

## Database tables and columns used
From `docs/scheme.sql`:

**`activities`**
- `id` (uuid) — key
- `name` (text) — card title
- `image_url` (text) — card image
- `price` (numeric(10,2)) — filtered and sorted with `.gte("price", min)` / `.lte("price", max)` / `.order("price")`

No schema changes required.

## Acceptance Criteria
- Filtering reads and writes `searchParams`; in Next.js 16 `searchParams` is a Promise and must be awaited (check `node_modules/next/dist/docs/`).
- Prefer a plain `<form method="get">` with named inputs — no client state or `useSearchParams` needed.
- Pure parsing/validation logic lives in `lib/price-filter.ts` with Vitest unit tests.
- Loading, empty (no data), no-match, and error states are all handled.
- Comparison is scoped to range summary + sort order; a side-by-side compare table is out of scope.
- `npm run lint`, `npm run typecheck`, `npm test` pass.

## Notes
- Depends on Task 01 for the data layer and card component.
- Price formatting should be a shared helper (e.g. `formatPrice`) rather than duplicated.
