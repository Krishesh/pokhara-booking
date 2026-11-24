# 05 — Admin: review booking requests and record outcomes

**Depends on:** 03 (`booking_requests` table). **PRD:** B "Basic staff administration" (requests part), C "Staff checks and records an outcome".

## Goal

Staff see all booking requests, open one to view the customer details and frozen offer, then mark it confirmed, rejected or cancelled with a short reason.

No login per `AGENTS.md`; `/admin` is open in the demo.

## User Flow

1. Staff opens `/admin/requests` and sees a table: reference, activity, provider, requested date, participants, total, status badge, age ("3 days ago").
2. Default filter shows `pending`, oldest first; staff can switch to all statuses.
3. Staff clicks a row and opens `/admin/requests/[id]`:
   - Customer name and contact (phone/email as a tap-to-call or mailto link)
   - Offer snapshot as it was at submission (not the live offer)
   - Current status and staff note
4. Staff contacts the vendor and customer outside the app, then picks a new status:
   - `confirmed`: note optional
   - `rejected` or `cancelled`: note required
5. Save updates `status`, `staff_note` and `updated_at`, and shows a toast.
6. Empty state: "No booking requests yet."

## Database tables and columns used

| Table | Columns | Use |
|---|---|---|
| `booking_requests` (added in task 03) | `id`, `reference`, `customer_name`, `contact_type`, `contact_value`, `requested_date`, `participant_count`, `offer_snapshot`, `total_price`, `currency`, `status`, `staff_note`, `created_at`, `updated_at` | List, detail, status update |

Offer details are read from `offer_snapshot`, never re-joined to `price_listings`, so later offer edits do not change what the customer requested.

## Business logic to unit test

- `canTransition(from, to)`: e.g. `pending` → any; `confirmed` → `cancelled`; `rejected`/`cancelled` are final.
- `validateOutcome(status, note)`: note required for rejected/cancelled.
