<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project notes

Pokhara Booking is an early-stage Next.js 16 App Router app for an adventure-activity booking MVP. `supabase/prd.md` is the product plan; treat its proposed PHP/MySQL stack as outdated — this repo is Next.js + Supabase.

## Commands

- `npm run dev` — dev server (Turbopack).
- `npm run build` / `npm start` — production build and serve.
- `npm run lint` — ESLint 9 flat config; use this instead of the removed `next lint`.
- `npm run typecheck` — `tsc --noEmit`.
- `npm run format` — Prettier with Tailwind class sorting (`.ts`/`.tsx` only).
- No test runner is configured; there is no `npm test` script and no Vitest dependency.
- No CI or pre-commit hooks: verify with `npm run lint` and `npm run typecheck` (add `npm run build` for route/config changes).
- If npm reports `EJSONPARSE`, remove the stray first line in `package.json` (a duplicated `"scripts"` object above the opening `{`).

## Structure

- `app/` — App Router at the repo root; there is no `src/`.
- `@/*` maps to the repo root (`tsconfig.json`).
- `components/ui/` — shadcn/ui `base-nova` components built on `@base-ui/react`, not Radix. Add more with `npx shadcn@latest add <name>`.
- `cn` comes from the `cn` package; `@/lib/utils` only re-exports it.
- Tailwind v4 has no `tailwind.config.*`; theme tokens live in `app/globals.css`.

## Data

- Draft schema: `docs/scheme.sql` (misspelled; not `supabase/schema.sql`).
- It defines `activities` and `bookings`, grants `anon` full CRUD, and does not enable RLS.
- `.env.local` (gitignored) sets `NEXT_PUBLIC_SUPABASE_URL` to the `/rest/v1/` endpoint and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; `createClient` expects the bare project URL.
- `@supabase/supabase-js` is not installed and there is no data/API layer yet.
## MVP Guardrails
- **No Auth:** Do not implement login, signup, or Supabase Auth. Treat the app as a single-user demo.
- **Database:** Always read `supabase/schema.sql` before writing any Supabase queries or TypeScript types. Never guess table or column names. If a feature needs a new column or table, update `supabase/schema.sql` first and tell the user to run the SQL in Supabase.
- **Stack:** Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, `@supabase/supabase-js`.
- **Testing:** Use Vitest (`npm test`). Do NOT install Playwright or Cypress. Write unit tests for pure business logic
- **Scope:** Keep solutions simple, clean, and demo-ready. Avoid over-engineering.

## UI Guidelines
- **Components:** Use shadcn/ui first (`npx shadcn@latest add <component>`). Don't hand-build buttons, inputs, dialogs, etc. Use `lucide-react` for icons.
- **Styling:** Tailwind utility classes only. No custom CSS or inline styles. Use theme tokens (`bg-background`, `text-muted-foreground`), not hardcoded colors, and `cn()` for conditional classes.
- **Layout:** Mobile-first and responsive. Keep spacing and typography consistent across pages.
- **States:** Every data-driven view must handle loading, empty, and error states. Use toasts (`sonner`) for action feedback.
- **Components architecture:** Server Components by default. Add `"use client"` only when you need state, effects, or event handlers.
- **Accessibility:** Semantic HTML, labels on all inputs, alt text on images.
