<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## MVP Guardrails
- **No Auth:** Do not implement login, signup, or Supabase Auth. Treat the app as a single-user demo.
  - Exception (task 04): `/admin` is protected by one shared password (`ADMIN_PASSWORD`, browser Basic Auth in `src/proxy.ts`). Keep it, and call `requireAdmin()` at the start of every admin Server Action and admin data read. Admin uses the server-only `SUPABASE_SERVICE_ROLE_KEY`; the public key is read-only.
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
