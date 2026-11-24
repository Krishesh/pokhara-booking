# Pokhara Booking

Compare and request adventure activities in Pokhara, Nepal, from several local companies in one place, and join hiking and travel group outings.

Visitors browse activities (paragliding, boating, ziplining…), compare offers from different providers side by side, and send a **booking request**. Staff check availability with the provider, contact the customer, and record the outcome in a small password-protected admin. Visitors can also register interest in **group outings** that an organizer follows up on.

> **Status:** MVP / single-user demo. All companies, prices and outings in the seed data are fictional ("Demo …").

![Home page with activity cards](docs/images/home.png)

---

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Database](#database)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Security model](#security-model)
- [Documentation](#documentation)
- [Deploying](#deploying)
- [Not in this MVP](#not-in-this-mvp)

---

## Features

### For visitors

| Page | What it does |
|---|---|
| `/` | Catalogue of published activities with photos, category and location. |
| `/activities/[slug]` | Activity details and **offers to compare**: provider, Google rating, package, duration, price (`NPR 8,500 per person`), Verified / Unverified badge, price-checked date, what's included and conditions. Outdated or unpriced offers are hidden. |
| Request booking (dialog) | Name, phone or email, date and number of people, with a live estimated total. The server re-checks the offer: if it was withdrawn or its price changed, nothing is saved and the visitor reviews the new terms. On success the visitor gets a reference like `PKR-7EV5GB` and is told the request is **pending, not a confirmed booking**. |
| `/outings`, `/outings/[slug]` | Hiking and travel group outings. Visitors register interest (name, contact, number of people). Cancelled and past outings stop taking interest. |

### For staff (`/admin`, password-protected)

| Section | What it does |
|---|---|
| **Overview** | Counts of live activities, offers by status, providers and pending booking requests. |
| **Activities** | Add and edit activities, a one-click **Live / Hidden** switch, photo with credit. |
| **Offers** | Add and edit prices; filter by activity and status; **Verify** / **Outdated** in one click; each row says whether visitors can see it, and why not. |
| **Providers** | Public name and Google rating; phone, address and notes stay staff-only. |
| **Outings** | Plan outings (draft / published / cancelled), see who's interested, copy all contacts, ready-made messages. |
| **Requests** | Pending requests oldest first (overdue after 2 days), search by reference, name, phone or email; Call / WhatsApp / Email buttons; the offer exactly as the customer saw it, with a notice when the live offer has since changed; copyable customer messages; record **Confirmed / Rejected / Cancelled** with a reason and staff name. |

Nothing in the admin is ever deleted: activities are hidden, offers marked outdated, outings cancelled. Booking requests keep a frozen copy of the offer, so editing an offer never changes requests already sent.

Admin screenshots and step-by-step instructions are in the **[Admin guide](docs/admin-guide.md)**.

---

## Tech stack

- **[Next.js 16](https://nextjs.org)** (App Router, Server Components, Server Actions, Cache Components, Turbopack)
- **React 19**, **TypeScript**
- **[Tailwind CSS 4](https://tailwindcss.com)** and **[shadcn/ui](https://ui.shadcn.com)** (Base UI), **lucide-react** icons, **sonner** toasts
- **[Supabase](https://supabase.com)** (Postgres + Row Level Security) via `@supabase/supabase-js` and `@supabase/ssr`
- **[Vitest](https://vitest.dev)** for unit tests

> This Next.js version has breaking changes compared to older releases. Its docs ship in `node_modules/next/dist/docs/`; check them before changing framework code (see `AGENTS.md`).

---

## Getting started

### Prerequisites

- **Node.js 22** or newer and npm
- A **Supabase** project (the free tier is fine)

### 1. Install

```bash
git clone https://github.com/Krishesh/pokhara-booking.git
cd pokhara-booking
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` as described in [Environment variables](#environment-variables).

### 3. Set up the database

In the Supabase dashboard, open **SQL Editor** and run these files **in this order** (paste the whole file, then **Run**):

1. [`supabase/schema.sql`](supabase/schema.sql): tables, checks, Row Level Security and grants
2. [`supabase/seed.sql`](supabase/seed.sql): 6 demo activities (5 with photos)
3. [`supabase/seed-offers.sql`](supabase/seed-offers.sql): demo providers and offers
4. [`supabase/seed-outings.sql`](supabase/seed-outings.sql): demo group outings

All four are safe to run more than once. Make sure the dashboard is on the same project as `NEXT_PUBLIC_SUPABASE_URL`.

### 4. Run

```bash
npm run dev
```

- Website: <http://localhost:3000>
- Admin: <http://localhost:3000/admin>. Your browser asks for a password: use `ADMIN_PASSWORD` from `.env.local`, with any username.

---

## Environment variables

See [`.env.example`](.env.example).

| Variable | Where to find it | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | The project URL, e.g. `https://abcd.supabase.co`. **No** `/rest/v1` at the end. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Settings → API Keys → **Publishable key** (`sb_publishable_…`) | Public and read-only by design. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API Keys → **Secret key** (`sb_secret_…`) | **Server-only.** Bypasses Row Level Security. Never prefix with `NEXT_PUBLIC_` and never import it in client code. Used for booking requests, outing interest and the admin. |
| `ADMIN_PASSWORD` | You choose it | At least 8 characters. If empty or shorter, `/admin` stays locked. |

Restart `npm run dev` after changing `.env.local`.

---

## Database

`supabase/schema.sql` is the source of truth for tables and columns. Read it before writing queries, and update it first when a feature needs a schema change (see `AGENTS.md`).

| Table | Purpose |
|---|---|
| `activities` | Things to do. `is_published` controls visibility; `image_url` + `image_credit` for photos. |
| `providers` | Companies running activities. Contact details are staff-only. |
| `price_listings` | Offers: a provider's price for an activity (price, currency, unit, inclusions, verification status, source). |
| `booking_requests` | Visitor requests with a reference, contact, date, people, a frozen `offer_snapshot`, the total, and status (`pending` → `confirmed` / `rejected` / `cancelled`). |
| `group_outings` | Hikes and trips: date (or to be confirmed), meeting point, cost text, organizer, status (`draft` / `published` / `cancelled`). |
| `group_interests` | Interest in an outing; one per contact per outing. |

**Who can see what** (enforced in the database, not just in the app):

| Table | Public (publishable key) | Server (service-role key) |
|---|---|---|
| `activities` | Read published rows, public columns | Full |
| `price_listings` | Read non-outdated offers on published activities; no source links or notes | Full |
| `providers` | Read name and rating of providers with a visible offer | Full |
| `group_outings` | Read published and cancelled outings; no organizer contact | Full |
| `booking_requests`, `group_interests` | **No access** | Full |

The public key can't insert, update or delete anything.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server at <http://localhost:3000> |
| `npm run build` | Production build (also type-checks) |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests (pricing, validation, references, admin auth, request and outing logic) |

---

## Project structure

```
src/
├── app/
│   ├── page.tsx                      # Activity catalogue (home)
│   ├── activities/[slug]/            # Activity page, offers, booking request action
│   ├── outings/                      # Group outings list and pages, interest action
│   ├── admin/                        # Admin: overview, activities, offers, providers, outings, requests
│   ├── layout.tsx                    # Header, toasts
│   └── error.tsx                     # Error page with retry
├── components/
│   ├── ui/                           # shadcn/ui components
│   ├── admin/                        # Admin forms, tables, status form, message templates
│   ├── booking-dialog.tsx            # Request booking form
│   ├── interest-form.tsx             # Outing interest form
│   └── offer-card.tsx, offer-list.tsx, activity-image.tsx, …
├── lib/
│   ├── booking.ts                    # Totals, validation, references, snapshots (pure, tested)
│   ├── offer-format.ts               # Price, rating and date formatting, sorting (pure, tested)
│   ├── outings.ts                    # Outing state, sorting, interest validation (pure, tested)
│   ├── activities.ts, offers.ts, outings-data.ts   # Public data reads (publishable key)
│   └── admin/                        # Admin auth, validation, data reads (service-role key)
├── utils/supabase/                   # server.ts (publishable key), admin.ts (service role, server-only)
└── proxy.ts                          # /admin password gate
supabase/                             # schema.sql and seed files
docs/                                 # PRD, task specs, admin guide, image credits
```

Business logic lives in small pure modules (`src/lib/**`) with unit tests next to them (`*.test.ts`); pages and Server Actions wire them to Supabase.

---

## Security model

- **No user accounts** (by design for the MVP). `/admin` is protected by one shared password using the browser's built-in sign-in box (HTTP Basic Auth) in `src/proxy.ts`.
- **Server Actions can be called from any URL**, so every admin action and admin data read re-checks the password with `requireAdmin()` (`src/lib/admin/guard.ts`), not just the proxy.
- The **public key is read-only** and limited by Row Level Security and column grants (see [Database](#database)). Writes go through Server Actions that validate input and use the service-role key, which is guarded by `server-only` so it can't end up in browser code.
- Booking totals are always **calculated on the server** from the stored price, and a changed or withdrawn offer is never silently substituted.
- Public forms use a hidden **honeypot** field to drop bot submissions.
- Admin pages are `noindex`, and there's no link to `/admin` on the public site.

---

## Documentation

| Document | For |
|---|---|
| [`docs/admin-guide.md`](docs/admin-guide.md) | **Staff**: how to use the admin, with screenshots |
| [`docs/Pokhara-Booking-PRD-Krishesh.md`](docs/Pokhara-Booking-PRD-Krishesh.md) | Product requirements, scope and open business questions |
| [`docs/tasks/`](docs/tasks/) | Final spec and acceptance criteria for each feature (01 catalogue → 06 group outings) |
| [`docs/image-credits.md`](docs/image-credits.md) | Photo sources and licences |
| [`AGENTS.md`](AGENTS.md) | Rules for contributors and coding agents |

---

## Deploying

The app deploys like any Next.js app (e.g. on [Vercel](https://vercel.com/docs/frameworks/nextjs)). Before going live:

1. Add the four [environment variables](#environment-variables) in the hosting provider's settings.
2. Use a **long, unique `ADMIN_PASSWORD`**, serve the site over **HTTPS only**, and change the password when staff leave.
3. Use a **fresh service-role (secret) key** that has never been in a `NEXT_PUBLIC_` variable or shared anywhere.
4. Replace the demo data with real, approved activities, providers and offers, and resolve the open business questions in the PRD (commission, payments, cancellations and refunds, privacy notice).

---

## Not in this MVP

Deferred on purpose (see the PRD): customer accounts, online payment and commission handling, automatic emails or SMS, live availability and instant confirmation, vendor dashboards, reviews, search and filters on the public site, seat allocation for outings, and data retention rules.

---

## Credits

Activity and outing photos are from [Wikimedia Commons](https://commons.wikimedia.org) under CC BY-SA 4.0; authors are credited under each photo and in [`docs/image-credits.md`](docs/image-credits.md).
