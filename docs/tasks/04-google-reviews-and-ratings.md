# 04 — Google Reviews & Ratings

## Goal
Surface each activity's Google rating and link visitors to its Google reviews, without any API integration.

## User Flow
1. On an activity's detail page, a reviews block shows a star icon, the rating (e.g. "4.8 / 5"), and a "Read reviews on Google" button.
2. The button opens `google_review_url` in a new tab.
3. Activity cards show a compact rating badge when a rating exists.
4. If both fields are null, the whole block is hidden. If only one exists, render only that part — never a broken link or empty stars.

## Database tables and columns used
From `docs/scheme.sql`:

**`activities`**
- `id` (uuid) — lookup
- `google_rating` (numeric(2,1)) — star rating display, formatted to one decimal
- `google_review_url` (text) — external Google Maps reviews link

No schema changes or new tables required. Per the PRD assumption, external review links replace API integration.

## Acceptance Criteria
- External links use `target="_blank"` with `rel="noopener noreferrer"`.
- Rating formatting is a pure helper (e.g. `formatRating`) covered by a Vitest test.
- Missing rating/link values degrade gracefully.
- The block is responsive and uses theme tokens (`text-muted-foreground` for secondary text).
- `npm run lint`, `npm run typecheck`, and `npm test` pass.

## Notes
- Depends on Task 03 for the detail page layout.
- No Google Maps API key, no server calls to Google.
