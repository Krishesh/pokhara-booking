# 05 — Admin: review booking requests and record outcomes

**Status:** Built (2026-11-24). **Depends on:** 03 (`booking_requests`), 04 (admin, password, `requireAdmin`). **PRD:** B "Basic staff administration" (requests part), C "Staff checks and records an outcome", H "Success measurement" (age of pending requests).
**Staff guide:** [`docs/admin-guide.md` → Booking requests](../admin-guide.md#7-booking-requests).

## Goal

Staff see every booking request, open one to view the customer and the offer exactly as the customer saw it, contact the customer with a ready-made message, and record Confirmed, Rejected or Cancelled with a reason and their name.

## User Flow

1. **Navigation:** "Requests" in the admin bar shows the number of pending requests. The overview's pending card links to the list.
2. **List** (`/admin/requests`):
   - Tabs Pending (default) · Confirmed · Rejected · Cancelled · All, each with a count.
   - Columns: reference + activity · vendor, customer, date · people, total, status, received.
   - Pending shows oldest first; other tabs newest first. Pending requests older than 48 h are highlighted with a warning icon.
   - **Search** by reference, customer name, phone (spaces and dashes ignored) or email; it keeps the current tab.
   - Empty states: "No pending requests. You're all caught up.", "No requests match …", and so on.
3. **Request** (`/admin/requests/[id]`):
   - Header: the reference (with a copy button), status badge, received time (Nepal time) and age, plus "waiting over 2 days" when overdue.
   - **Customer:** name and contact (copy button), date, people, estimated total. **Call** (`tel:`), **WhatsApp** (`wa.me`, for numbers with a country code or Nepali 97/98 mobiles) and **Email** (`mailto:`).
   - **Offer as the customer saw it:** from `offer_snapshot`, never the live offer, plus a link to the current offer. A **change notice** lists differences from the live offer: new price (with the old one), now outdated, activity hidden, no price, or offer deleted.
   - **Message the customer:** four copyable templates ("We're checking", "Confirmed", "Can't confirm", "Cancelled"). Each is filled with the first name, reference, activity (package), vendor, date, people and total; rejected and cancelled include the reason. Staff send them themselves.
   - **Record the outcome:**
     - The allowed next statuses are radio options, each with help text.
     - Reason is required for Rejected and Cancelled and optional for Confirmed (up to 1,000 characters).
     - "Your name" is required and remembered in `localStorage`.
     - Rejected and Cancelled ask for confirmation first, because they're final.
     - Above the form: the latest note, "Last updated by {name} · {time}".
     - A final request shows "…which is final. Ask them to send a new request."
4. **Status rules:** pending → confirmed, rejected or cancelled; confirmed → cancelled; rejected and cancelled are final.
5. **Two staff at once:** the update applies only `where status = <status the page showed>`. If nothing matches, nothing is saved, and the page says "updated by someone else" with a Reload button.
6. Success shows a toast and refreshes the page; the form resets because it's keyed by status. Validation errors appear under the fields and typed values are kept.

## Database tables and columns used

| Table | Columns | Use |
|---|---|---|
| `booking_requests` | `id`, `reference`, `price_listing_id`, `customer_name`, `contact_type`, `contact_value`, `requested_date`, `participant_count`, `offer_snapshot`, `total_price`, `currency`, `status`, `staff_note`, `updated_by` (new), `created_at`, `updated_at` | List, search, detail, status update |
| `price_listings` | `price`, `currency`, `pricing_unit`, `verification_status` | Change notice (live offer) |
| `activities` | `is_published` | Change notice |

**Schema change (applied):** `booking_requests.updated_by text` (≤ 80 characters) and a ≤ 1,000-character check on `staff_note`. The table stays closed to anon and authenticated users; only the service role, via `requireAdmin()`, reads or writes it.

## Implementation

| File | Contents |
|---|---|
| `src/lib/admin/requests.ts` (+ test) | Pure logic: transitions, `validateStatusChange`, `requestAge`, `contactLinks`, `normalizeRequestSearch` (makes search input safe to use in the database filter), `offerChanges`, `messageTemplates` |
| `src/lib/admin/requests-data.ts` | `listAdminRequests`, `countRequestsByStatus`, `countPendingRequests`, `getAdminRequest` (+ live offer) |
| `src/app/admin/requests/actions.ts` | `updateRequestStatus`: `requireAdmin()`, validation, update only if the status hasn't changed |
| `src/app/admin/requests/page.tsx`, `[id]/page.tsx` | List and detail |
| `src/components/admin/request-*.tsx`, `message-templates.tsx`, `copy-button.tsx` | Filters, status badge, status form, templates, copy |
| `src/components/admin/admin-nav.tsx`, `src/app/admin/layout.tsx` | Requests link with pending count |

Not included (PRD-deferred): automatic emails or SMS, payments and refunds, a history of every status change (only the latest note and who made it are kept), and deleting or keeping data for a set time.

## Acceptance criteria

- [x] The list shows pending requests by default with tab counts; the nav shows the pending count.
- [x] Searching "980 111 2222" finds the request stored as `+9779801112222`; searching the reference finds exactly that request; an unknown search shows the empty message.
- [x] The request page shows Call (`tel:+977…`) and WhatsApp (`wa.me/977…`) links and the offer as the customer saw it.
- [x] A request submitted at NPR 9,000 whose offer is now NPR 8,500 shows the change notice.
- [x] Rejecting without a reason or name shows both errors; with them, a confirmation dialog appears, then the request is final with "Last updated by …", and the "Can't confirm" template includes the reason.
- [x] Changing the status in the database while the page is open: submitting shows "updated by someone else" and saves nothing; after Reload only Cancelled is offered, and confirmed → cancelled works.
- [x] The staff name is remembered in the browser.
- [x] Lint, `npm test` (90 tests) and `npm run build` pass. Demo requests were reset to pending afterwards.
