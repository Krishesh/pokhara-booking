# Pokhara Booking — Product Requirements Document

Draft for founder review. **Confirmed** identifies supplied project facts. **ASSUMPTION** identifies recommendations requiring confirmation; these remain proposals throughout this document. **TODO** identifies unanswered questions.

## A. Product overview

### Product and problem

**Confirmed:** Pokhara Booking is a Pokhara-based booking product, initially focused on adventure activities. The founder reports that prices differ across vendors. The product will list offers from multiple travel/adventure companies and add a commission for the platform. It should also support hiking groups and travel groups to other places in a minimal form.

**ASSUMPTION:** The intended customer value is to browse activities, understand differences between vendor offers, see a customer price, and request a booking from one website. This is a proposed value proposition, not evidence of demand or competitive advantage.

### Long-term vision versus launch

| Horizon | Scope |
|---|---|
| Confirmed long-term vision | List all adventure activities available in Pokhara from multiple companies, alongside minimal hiking/travel group support. |
| ASSUMPTION: Four-day launch outcome | Publish a founder-approved subset of activities and offers, accept booking requests, let staff record outcomes, and publish group outings that accept expressions of interest. This keeps onboarding and operations manageable. |

**ASSUMPTION:** Launch as a responsive website with public browsing and forms requiring no customer account.

**ASSUMPTION:** Proposed roles are:

- **Visitor/customer:** Browses offers and submits booking requests or group interest.
- **Authorized staff:** Maintains listings and prices, contacts vendors and customers, and records booking outcomes.
- **Vendor contact:** Responds to staff outside the website; has no platform login.
- **Group organizer:** Runs an outing outside the website. This may be staff or another party, subject to confirmation.

### Feasibility judgment

**ASSUMPTION:** The five proposed Must features are a plausible four-day engineering scope only with an existing application foundation, reusable authenticated administration, ready hosting, approved content, and a developer familiar with the chosen stack.

This is **not a delivery guarantee**. A new stack, custom admin design, missing vendor agreements, or unresolved pricing could make the scope infeasible.

## B. Scope and priorities

**ASSUMPTION — proposed requirements:** Every scope choice, acceptance criterion, and dependency in the following table is proposed. The table defines the smallest recommended launch rather than additional hidden functionality.

| Feature | Priority | Smallest launch scope | Acceptance criteria | Dependencies |
|---|---|---|---|---|
| Activity catalogue | Must | Public activity list and detail pages using staff-entered text and available images. No search, filters, or maps. | Only published activities appear. Each opens its correct detail page. An activity with no available offer clearly says booking requests are unavailable. | Approved activity content; publication controls. |
| Vendor offers and customer pricing | Must | Show offers within each activity page: vendor identity, inclusions, pricing basis, currency, and final customer price. Staff retain private vendor pricing and commission fields. | Available offers show their own inclusions and totals. Missing information is not presented as included. Private commercial fields are absent from public responses. Incomplete prices prevent offer publication. | Agreed pricing model and launch offer data. |
| Booking requests | Must | An embedded offer form collects name, one contact method, requested date, and participant count. Submission produces a reference and pending acknowledgement. | Valid requests persist with the selected offer and immutable price snapshot. Unavailable or changed offers cannot be submitted using stale details. The acknowledgement explicitly says capacity is not reserved. | Available offer; server-side validation; request storage. |
| Basic staff administration | Must | Reuse the framework’s authenticated admin for listings, commercial fields, requests, and manual request status changes. | Unauthorized users cannot access staff records. Staff can publish/unpublish listings and record outcomes. Editing an offer does not change an existing request snapshot. | Existing authentication/admin foundation; designated staff owner. |
| Minimal hiking/travel groups | Must | Staff-created outing listings and a name/contact interest form. No booking or seat allocation for groups. | Published outings display available details. Interest persists against the correct outing and receives an “interest only” acknowledgement. Cancelled outings stop accepting interest. | Outing content; named organizer; staff ownership. |

**ASSUMPTION:** Launch offers use one clearly stated price per participant, multiplied by the requested participant count, to avoid a pricing engine. Offers requiring package pricing, different participant categories, or custom quotations remain unpublished until a simpler supported arrangement is agreed.

TODO: [Can launch vendors provide offers using this pricing basis, or is another single pricing basis required?]

### Deferred work

**ASSUMPTION:** Defer the following because each adds implementation or operational complexity:

- Customer accounts and booking-history pages.
- Live availability, capacity reservation, automatic confirmation, and vendor integrations.
- Online payment, automated commission calculation, payouts, and settlement reports.
- Vendor dashboards, reviews, chat, automated messages, and public request tracking.
- Search, advanced filters, maps, and a dedicated offer-comparison tool.
- Customer-created public groups, group payments, participant lists, chat, and seat allocation.
- Variable participant pricing, discounts, promotional codes, and multi-activity checkout.
- Exhaustive onboarding of Pokhara activities or vendors.

### Smaller fallback

**ASSUMPTION:** If the initial foundation check does not support the five-feature scope, defer group listings and interest forms entirely, leaving four Must features. Do not call the five-feature launch complete if groups are cut.

**ASSUMPTION:** If those four still cannot fit, release a catalogue preview with booking submission disabled. Treat it as a preview, not a booking launch.

## C. Essential user journeys

**ASSUMPTION — proposed workflows:** All behavior in this section is proposed to support manual operations.

### Browse and compare offers

1. A visitor opens the activity catalogue and selects an activity.
2. Its page shows available vendor offers with vendor identity, inclusions, price basis, currency, and customer price.
3. The visitor compares the information directly on that page. A lower price does not imply equivalent inclusions.
4. An unavailable offer cannot accept requests. An activity without available offers displays an unavailable message.

### Submit a booking request

1. The visitor selects an offer and enters contact details, requested date, and participant count.
2. The form displays the total for that participant count before submission.
3. The server checks current offer availability and version, then calculates the total from stored pricing.
4. If the offer changed, submission stops and the visitor sees the updated terms and price for review. No silent substitution occurs.
5. If valid, the server saves the request and its offer snapshot together.
6. The acknowledgement displays the reference and:

> Request received. Confirmation is pending. This request does not reserve capacity or guarantee a booking.

**ASSUMPTION:** The acknowledgement is on-screen only. Staff contact the customer manually; automatic email or messaging is deferred.

### Staff checks and records an outcome

1. Staff opens a pending request and contacts the vendor using an agreed external channel.
2. Staff records the result and contacts the customer.
3. Proposed statuses are `Pending`, `Confirmed`, `Rejected`, and `Cancelled`.
4. Staff records a short reason for rejection or cancellation.
5. Confirmation requires vendor acceptance and customer agreement to the recorded price and terms.

**ASSUMPTION:** Existing request snapshots remain immutable. If a vendor proposes a different price or materially different offer, staff rejects the original request with an explanation and directs the customer to submit a new request against the revised offer. Negotiation and repricing workflows are deferred.

**ASSUMPTION:** A status change records an operational outcome only; it does not automatically collect payment or issue a refund.

### Browse a group and submit interest

1. A visitor opens a published hiking/travel outing.
2. The page shows the organizer and available destination, date, meeting, and cost information.
3. The visitor submits their name and contact details.
4. The acknowledgement states that interest does not confirm participation or reserve a place.
5. Staff follows up outside the website.

**ASSUMPTION:** A cancelled outing remains accessible with a cancellation label and disabled interest form. Staff uses saved interest records to contact affected people manually. The MVP does not track group participation confirmation.

## D. Pricing and commission

**Confirmed:** The platform intends to add commission to vendor offers. The commercial arrangement and calculation method are not confirmed.

| Term | Meaning |
|---|---|
| Vendor price | The price supplied or agreed by the vendor. Whether it is a net amount or selling price remains unresolved. |
| Platform commission | Pokhara Booking’s agreed earning from the offer. Its amount and calculation method remain unresolved. |
| Final customer price | The amount presented to the customer for the selected offer and participant count. |

**ASSUMPTION:** Staff enters agreed commercial amounts manually per offer; the launch does not contain a configurable commission engine.

**ASSUMPTION:** If the vendor amount is net, the symbolic relationship is `S = V + C`. If commission is deducted from an agreed selling price, it is `C = S − V`, where `S` is the customer unit price, `V` is the vendor amount payable per unit, and `C` is commission per unit. These are alternatives requiring a founder decision.

**ASSUMPTION:** Under the proposed per-participant model, the customer total is `T = S × N`, where `N` is participant count. Publish only offers whose mandatory charges can be included in the displayed total.

**ASSUMPTION:** The server checks commercial amounts against the selected model. Staff sees vendor amount, commission, and customer price; customers see the final price, currency, inclusions, exclusions, and total.

**ASSUMPTION:** Booking snapshots preserve these agreed amounts and terms at submission. Later offer edits affect new requests only.

TODO: [Which currency will launch use?]

TODO: [Are vendor prices net amounts or agreed customer selling prices?]

TODO: [Is commission fixed, percentage-based, or different per offer?]

TODO: [How are taxes treated, and must they appear separately?]

TODO: [Are there mandatory extra charges, and can all be included before submission?]

TODO: [Who collects payment, through which method, and at what stage?]

TODO: [Who approves cancellations, and what cancellation terms apply?]

TODO: [Who determines, funds, and processes refunds?]

TODO: [When and how are vendors paid, and how is platform commission retained?]

## E. Minimum data and pages

### Proposed data model

**ASSUMPTION — proposed model:** The following entities and fields are the minimum recommended structure. This does not confirm a technology stack.

| Entity | Minimum fields |
|---|---|
| Activity | ID, title, description, optional image, published flag. |
| Vendor | ID, public display name, private contact details. |
| Offer | ID, activity, vendor, inclusions, exclusions, vendor amount, commission amount, customer unit price, currency, available flag, version. |
| Booking Request | ID/reference, offer link, customer name, contact type/value, requested date, participant count, status, immutable offer snapshot, staff outcome note, created/updated timestamps, last-updated-by staff. |
| Group Outing | ID, title, destination, organizer name/contact, description, date or explicit “to be confirmed,” meeting details if available, cost information or explicit “to be confirmed,” draft/published/cancelled status. |
| Group Interest | ID, outing link, customer name, contact type/value, created timestamp. |

**ASSUMPTION:** The booking snapshot contains activity and vendor names, offer inclusions/exclusions, pricing basis, currency, vendor amount, commission, customer unit price, and total. Retain linked records by unpublishing or deactivating them rather than deleting records that have requests.

**ASSUMPTION:** Group cost information is descriptive only; the group form does not create a priced booking.

### Smallest page and screen set

**ASSUMPTION:** Customer-facing templates are:

- Activity catalogue, also serving as the home page.
- Activity detail with offers and booking form.
- Group outing list.
- Group outing detail with interest form.
- Shared submission acknowledgement template.

**ASSUMPTION:** Admin uses built-in list and edit screens for the six entities, plus staff login. No custom dashboard is required.

### Personal information and access

**ASSUMPTION:** Collect only a name and one usable contact method for either form; additionally collect trip date and participant count for booking requests. Do not collect identity documents, payment details, or health information.

**ASSUMPTION:** Public users cannot retrieve booking records or group-interest lists. All authenticated launch staff share one authorized role; detailed permission tiers are deferred. Staff authentication, server-side validation, framework form protections, and private server-side commercial fields are required.

TODO: [Should customer contact be phone, email, or a choice between them?]

TODO: [Which staff members need access to customer and commercial data?]

TODO: [What privacy notice and retention/deletion rules should apply?]

## F. Four-day implementation plan

### Conditions

**ASSUMPTION:** Planning assumes a developer experienced with the selected framework and a founder/operations owner available daily to supply decisions and content.

**ASSUMPTION:** The framework already supports authentication, database migrations, forms, and administration; hosting access and deployment foundations are ready.

**ASSUMPTION:** Reusable responsive layouts are acceptable, and approved vendor information, pricing, and outing content are available during implementation.

TODO: [What team capacity, stack, existing code, hosting, design assets, and approved content are already available?]

**ASSUMPTION — proposed schedule:**

| Day | Concrete deliverables | Dependencies and decision gate |
|---|---|---|
| Day 1 | Confirm pricing basis and scope; establish deployment path; create entities and authenticated admin; enter sample approved content. | Check actual foundations and capacity first. Activate the smaller fallback if the five-feature scope is not credible. |
| Day 2 | Build catalogue, activity detail, vendor offer display, booking form, server-calculated totals, snapshots, and pending acknowledgement. | Requires approved offer structure and prices. Validate stale-price and unavailable-offer handling. |
| Day 3 | Add manual booking outcomes, outing pages, interest submission, and cancellation behavior. Enter launch content. | Requires operational owner and group details. Validate private-data boundaries and request persistence. |
| Day 4 | Run launch checklist, correct defects, finish content review, deploy, run a production smoke check, and hand over staff workflow. | Requires deployment access and founder approval of commercial information and customer-facing terms. |

### Cuts if the schedule slips

**ASSUMPTION:** Cut visual customization and optional images first, then defer group functionality as the explicit four-feature fallback. Do not cut correct pricing, snapshot preservation, staff access protection, request persistence, or pending messaging.

### Engineering versus business readiness

**ASSUMPTION:** Engineering is complete when the retained scope passes its acceptance checks and is deployed.

**ASSUMPTION:** Accepting real requests additionally requires approved vendor offers, a working availability-confirmation process, assigned staff, payment responsibility, cancellation/refund terms, and appropriate customer-facing information. A working website alone does not satisfy these conditions.

## G. Launch acceptance checklist

**ASSUMPTION — proposed release checks:** These checks apply to the five-feature scope. If groups are formally deferred, mark group checks out of scope and identify the release as the four-feature fallback.

- [ ] Only published activities and eligible offers are visible.
- [ ] Each offer shows the correct vendor, its own inclusions/exclusions, currency, and pricing basis.
- [ ] Customer totals match server-side calculations and include agreed mandatory charges.
- [ ] Missing or inconsistent pricing prevents publication.
- [ ] Valid booking submissions persist with a reference and immutable offer snapshot.
- [ ] Changed prices require review before a request can be submitted.
- [ ] Unavailable offers reject submissions, including forms opened before deactivation.
- [ ] Acknowledgements clearly distinguish pending requests from confirmed bookings.
- [ ] Staff can record confirmation, rejection, and cancellation outcomes.
- [ ] Later offer edits leave existing request snapshots unchanged.
- [ ] Unauthorized users cannot access admin, personal records, vendor costs, or commission data.
- [ ] Group interest persists against the correct outing and does not imply confirmed participation.
- [ ] Cancelled outings cannot accept new interest.
- [ ] Core pages and forms work on mobile and desktop.
- [ ] The deployed version passes a submission and staff-review smoke check.

## H. Success measurement

**ASSUMPTION:** Use saved operational records for initial measurement; a custom analytics dashboard is deferred.

| Proposed measure | Purpose |
|---|---|
| ASSUMPTION: Booking requests by activity and offer | Identify where submitted interest occurs. |
| ASSUMPTION: Confirmed, rejected, cancelled, and pending request counts | Understand operational outcomes. |
| ASSUMPTION: Rejection and cancellation reasons | Identify availability, pricing, or process problems. |
| ASSUMPTION: Age of pending requests | Identify requests needing follow-up. |
| ASSUMPTION: Group interest by outing | Observe interest without equating it with attendance. |

**ASSUMPTION:** Website conversion measurement is deferred unless an existing analytics setup is ready. Request counts alone cannot establish conversion rates or proven demand.

TODO: [What baseline data exists for enquiries, bookings, and group participation?]

TODO: [Which measures matter most to the founder, and what target values should be agreed?]

TODO: [Who reviews these measures and how often?]

## I. Open decisions — multiple-choice review

The options below are **proposed answers, not confirmed decisions**. “Other” allows a different approach.

| Order | Unanswered question | Choices |
|---|---|---|
| Implementation blocker | TODO: [What team capacity is available for the four days?] | A. Experienced developer plus founder/operations owner; B. Developer only; C. Other—specify. |
| Implementation blocker | TODO: [What stack and application foundation are available?] | A. Existing project with authentication/admin; B. Familiar stack, new project; C. Not selected. |
| Implementation blocker | TODO: [What hosting and deployment access are available?] | A. Ready to deploy; B. Selected but setup needed; C. Not selected. |
| Implementation blocker | TODO: [Is commission added to vendor net price or deducted from an agreed selling price?] | A. Added to net; B. Deducted from selling price; C. Varies by agreement. |
| Implementation blocker | TODO: [How is commission agreed?] | A. Fixed amount; B. Percentage; C. Different per offer. |
| Implementation blocker | TODO: [Can launch offers use one price per participant?] | A. Yes; B. One package price instead; C. Multiple pricing types are essential. |
| Launch blocker | TODO: [Who is the initial customer audience?] | A. Domestic visitors; B. International visitors; C. Both—specify language needs. |
| Launch blocker | TODO: [Which activities and vendors are confirmed for launch?] | A. Approved list ready—provide it; B. Shortlist exists, approval pending; C. None confirmed. |
| Launch blocker | TODO: [Are listed companies direct operators, resellers, or both?] | A. Operators; B. Resellers; C. Both. |
| Launch blocker | TODO: [Who confirms availability and how?] | A. Staff contacts vendor manually; B. Vendor provides an agreed availability list; C. Other—specify. |
| Launch blocker | TODO: [Who collects payment, and when?] | A. Platform after confirmation; B. Vendor directly; C. Other—specify timing. |
| Launch blocker | TODO: [Who handles cancellations and refunds?] | A. Platform; B. Vendor; C. Shared—define responsibilities. |
| Launch blocker | TODO: [Who creates and runs group outings?] | A. Platform creates and runs; B. Platform lists, partner runs; C. Other—specify. |
| Launch blocker | TODO: [What content and design assets are ready?] | A. Approved copy, prices, and assets; B. Partial content with reusable design acceptable; C. Neither ready. |

**ASSUMPTION:** These choices resolve direction only. Currency, taxes, extra charges, settlement, privacy, and the precise commercial terms identified earlier still require answers before launch.

## J. Five weakest points

| # | Unresolved or fragile point | Why it matters | Smallest improvement |
|---|---|---|---|
| 1 | Commission and price basis are unconfirmed. | The schema, displayed total, and vendor reconciliation could encode the wrong commercial arrangement. | ASSUMPTION: Approve one complete sample offer showing vendor amount, commission, customer total, inclusions, and charges before implementation. |
| 2 | Launch inventory and vendor authority are unknown. | The website could list incomplete, outdated, or unauthorized offers. | ASSUMPTION: Obtain a founder-approved launch list with vendor contacts and agreed offer details. |
| 3 | Booking, payment, cancellation, and refund ownership are unresolved. | Staff could record confirmation without a shared understanding of what was promised or who acts next. | ASSUMPTION: Agree a short operating procedure and assign an owner for each step before accepting requests. |
| 4 | Four-day capacity and technical readiness are unverified. | Even the reduced scope depends on reusable foundations and timely decisions. | ASSUMPTION: Check the existing project, deployment path, and staff availability at the start, then select the five-feature scope or explicit fallback. |
| 5 | Initial audience, demand, and group-operation model lack validation. | A technically working product may attract unsuitable enquiries or group interest that nobody can fulfill. | ASSUMPTION: Select an initial audience, review the request flow with prospective users, and name an organizer before publishing any outing. |
