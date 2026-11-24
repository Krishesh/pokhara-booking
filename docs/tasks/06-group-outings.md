# 06 — Hiking and travel group outings

**Status:** Built (2026-11-24). **Depends on:** 04 (admin, `requireAdmin`), 03 (contact validation, honeypot pattern). **PRD:** B "Minimal hiking/travel groups", C "Browse a group and submit interest", E "Group Outing / Group Interest".
**Staff guide:** [`docs/admin-guide.md` → Group outings](../admin-guide.md#8-group-outings).

## Goal

Staff publish group outings; visitors browse them and register interest. Interest does not reserve a place: the organizer follows up outside the website. Cancelled outings stop taking interest, and past outings drop off the list automatically.

## User Flow

**Visitor**

1. A **Group outings** link in the site header (next to **Activities**) opens `/outings`.
2. The list shows upcoming published and cancelled outings as cards (photo, title, date or "Date to be confirmed", destination). Dated outings come first, soonest first, then "to be confirmed" ones by title. Cancelled outings carry a red **Cancelled** badge. Outings whose date has passed, and drafts, are not listed. Empty state: "No group outings planned yet."
3. `/outings/[slug]` shows:
   - the photo with its credit
   - title and status badge
   - a facts box: date, destination, organizer name, cost ("To be confirmed" if empty)
   - the description, and the meeting point ("To be confirmed…" if empty)
4. **Interest form** (open outings only):
   - Fields: name, phone or email (same checks as the booking form), and "How many people?" (1–20, default 1).
   - Hidden honeypot field.
   - Note: "We only share your contact details with the organizer of this outing."
   - On success: "Interest received. This does not confirm participation or reserve a place. The organizer will contact you."
   - Registering the same phone or email again for the same outing shows "You're already on the list for this outing" and saves nothing.
5. **Cancelled outings:** a notice, and the form is replaced by "This outing isn't taking interest any more."
6. **Past outings:** "This outing has already taken place", and registration is closed. Drafts and unknown web addresses return 404.
7. The server re-checks the outing before saving, so an outing cancelled or passed while the form is open is refused.

**Staff** (`/admin/outings`, "Outings" in the admin menu)

1. **Table:** title, destination · organizer, date, status, number interested (with the head count when it's larger), view and edit links.
2. **New / edit form:**
   - title, with the web address filled in automatically (duplicates are refused)
   - destination, date (empty = to be confirmed), description, meeting point, cost (free text)
   - organizer name (public) and organizer contact (**staff only**)
   - photo link with preview and credit
   - status draft / published / cancelled, with help text
3. **Outing page:**
   - the form on the left
   - **Interested people:** name, people, date registered, contact, Call / WhatsApp / Email, and **Copy all contacts** (`Name: value` lines)
   - **Message everyone:** "Thanks for your interest", "Details confirmed", "Outing cancelled"; the cancellation message is selected automatically for cancelled outings
4. No deletes: cancel or leave as draft. Interests can't be deleted either (the foreign key is `on delete restrict`).

## Database tables and columns used

New tables in `supabase/schema.sql`, applied:

| Table | Columns |
|---|---|
| `group_outings` | `id`, `slug` (unique, checked), `title`, `destination`, `organizer_name`, `organizer_contact` (staff only), `description`, `outing_date` (null = to be confirmed), `meeting_details`, `cost_info` (descriptive only), `image_url`, `image_credit`, `status` (`draft` / `published` / `cancelled`), `created_at`, `updated_at` |
| `group_interests` | `id`, `outing_id` → `group_outings` (restrict), `customer_name`, `contact_type` (`phone` / `email`), `contact_value`, `participant_count` (1–20, default 1), `created_at`; **unique `(outing_id, contact_value)`** |

**Access:**
- **Outings, public key:** visitors can read published and cancelled outings only, and only the public columns. `organizer_contact` is refused, and drafts are invisible.
- **Interests:** no access for the public key at all. The interest Server Action uses the server-only service-role key; admin reads go through `requireAdmin()`.
- Emails are stored lowercase and phone numbers without spaces, so the unique constraint catches duplicates typed differently.

## Implementation

| File | Contents |
|---|---|
| `src/lib/outings.ts` (+ test) | `outingState` (open / cancelled / past / draft), `isListed`, `sortOutings`, `formatOutingDate`, `validateInterestForm` |
| `src/lib/admin/outings.ts` (+ test) | `validateOuting`, `outingTemplates`, `contactsText` |
| `src/lib/outings-data.ts` | Public reads (anon key) |
| `src/lib/admin/outings-data.ts` | Admin list with interest totals; outing + interests |
| `src/app/outings/**` | List, detail, loading, `registerInterest` Server Action |
| `src/app/admin/outings/**` | Admin list, new, edit + interests, `saveOuting` action |
| `src/components/interest-form.tsx`, `outing-status-badge.tsx`, `admin/outing-form.tsx` | UI |
| `src/app/layout.tsx` | Header links: Activities · Group outings |
| `supabase/seed-outings.sql` | Fictional "Demo Hiking Club" outings: published with a date, published with date to be confirmed, cancelled, draft |

Photos for the two published demo outings come from Wikimedia Commons (CC BY-SA 4.0), credited under each photo and in [`docs/image-credits.md`](../image-credits.md).

## Acceptance criteria

- [x] The header links to Group outings; the list shows cancelled (6 Dec), Poon Hill (12 Dec), then Begnas (to be confirmed); the draft is not listed and its page is a 404.
- [x] The organizer's contact is not in the public page, and the public key gets `permission denied` for it and for `group_interests` (read and insert).
- [x] The interest form shows field errors; a valid phone registration succeeds with the PRD wording; the same phone typed differently is "already on the list"; an email registration works.
- [x] The cancelled outing shows the notice and no form; cancelling an outing in the admin turns the public form off.
- [x] The admin table shows "2 (4 people)"; the outing page lists both people with Call/WhatsApp/Email, the Details confirmed template is filled in, and a duplicate web address is refused; creating a draft works (the test outing was removed afterwards).
- [x] Mobile layout has no sideways scrolling; lint, `npm test` (108 tests) and `npm run build` pass.
