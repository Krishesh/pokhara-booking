-- Demo providers and offers for task 02 (vendor offers).
-- All names, prices and URLs are fictional demo data, not real vendors.
-- Requires seed.sql (activities) first. Safe to run again: fixed ids, existing rows are skipped.
--
-- Cases covered:
--   paragliding-sarangkot   3 visible offers (2 NPR, 1 USD) + 1 outdated (hidden)
--   boating-phewa-lake      1 per_group offer
--   zipline-sarangkot       1 offer with no provider ("Listed on ...")
--   ultralight-flight       1 per_flight offer + 1 with no price (hidden)
--   world-peace-pagoda-hike no offers (empty state)
--   bungee-jump-hemja       1 offer on an unpublished activity (hidden by RLS)

insert into public.providers (id, name, website_url, google_rating, google_review_count, google_retrieved_at, notes)
values
  ('d0000000-0000-4000-8000-000000000001', 'Demo Paragliding Co.', 'https://demo-paragliding.example.com', 4.8, 512, '2026-11-10', 'Demo data, not a real vendor.'),
  ('d0000000-0000-4000-8000-000000000002', 'Demo Sky Adventures',  'https://demo-sky.example.com',         4.5, 128, '2026-11-10', 'Demo data, not a real vendor.'),
  ('d0000000-0000-4000-8000-000000000003', 'Demo Lakeside Boats',  null,                                   4.2, null, '2026-11-10', 'Demo data, not a real vendor.'),
  ('d0000000-0000-4000-8000-000000000004', 'Demo Bungee Nepal',    null,                                   null, null, null,        'Demo data, not a real vendor.')
on conflict (id) do nothing;

insert into public.price_listings (
  id, activity_id, provider_id, package_name, price, currency, pricing_unit, duration,
  inclusions, booking_conditions, source_domain, source_url, retrieved_at, verification_status, notes
)
select v.id::uuid, a.id, v.provider_id::uuid, v.package_name, v.price, v.currency, v.pricing_unit, v.duration,
       v.inclusions, v.booking_conditions, v.source_domain, v.source_url, v.retrieved_at::date,
       v.verification_status, 'Demo data, not a real price.'
from (values
  ('e0000000-0000-4000-8000-000000000001', 'paragliding-sarangkot', 'd0000000-0000-4000-8000-000000000001',
   'Standard tandem flight', 8500.00, 'NPR', 'per_person', '20–30 minutes',
   E'Certified tandem pilot\nFlight insurance\nPick-up and drop-off from Lakeside',
   E'Weather dependent; rescheduled or refunded if the flight is cancelled.\nMaximum weight 100 kg.',
   'demo-paragliding.example.com', 'https://demo-paragliding.example.com/tandem', '2026-11-10', 'verified'),
  ('e0000000-0000-4000-8000-000000000002', 'paragliding-sarangkot', 'd0000000-0000-4000-8000-000000000002',
   'Tandem flight with photos and video', 11000.00, 'NPR', 'per_person', '30 minutes',
   E'Certified tandem pilot\nGoPro photos and video\nPick-up from Lakeside',
   null,
   'demo-sky.example.com', 'https://demo-sky.example.com/paragliding', '2026-11-08', 'unverified'),
  ('e0000000-0000-4000-8000-000000000003', 'paragliding-sarangkot', 'd0000000-0000-4000-8000-000000000002',
   'Cross-country flight', 95.00, 'USD', 'per_person', '1 hour',
   E'Experienced cross-country pilot\nFlight insurance',
   E'Only offered October to April.',
   'demo-sky.example.com', 'https://demo-sky.example.com/cross-country', '2026-11-08', 'unverified'),
  ('e0000000-0000-4000-8000-000000000004', 'paragliding-sarangkot', 'd0000000-0000-4000-8000-000000000001',
   'Sunrise flight (old price)', 7000.00, 'NPR', 'per_person', '20 minutes',
   null, null,
   'demo-paragliding.example.com', 'https://demo-paragliding.example.com/sunrise', '2025-03-01', 'outdated'),
  ('e0000000-0000-4000-8000-000000000005', 'boating-phewa-lake', 'd0000000-0000-4000-8000-000000000003',
   'Rowing boat, up to 4 people', 1500.00, 'NPR', 'per_group', '1 hour',
   E'Boat and life jackets\nBoatman',
   E'Pay at the boat station on the day.',
   'demo-boats.example.com', 'https://demo-boats.example.com/rowing', '2026-11-12', 'verified'),
  ('e0000000-0000-4000-8000-000000000006', 'zipline-sarangkot', null,
   'Zipline ride', 6000.00, 'NPR', 'per_person', '2 minutes ride, 2 hours total',
   E'Transport from Lakeside\nSafety gear',
   null,
   'demo-listings.example.com', 'https://demo-listings.example.com/zipline', '2026-10-30', 'unverified'),
  ('e0000000-0000-4000-8000-000000000007', 'ultralight-flight', 'd0000000-0000-4000-8000-000000000002',
   '15-minute ultralight flight', 13000.00, 'NPR', 'per_flight', '15 minutes',
   E'Licensed pilot\nAirport transfer',
   E'Morning flights only.',
   'demo-sky.example.com', 'https://demo-sky.example.com/ultralight', '2026-11-08', 'verified'),
  ('e0000000-0000-4000-8000-000000000008', 'ultralight-flight', 'd0000000-0000-4000-8000-000000000002',
   '30-minute ultralight flight (price on request)', null, null, null, '30 minutes',
   null, null,
   'demo-sky.example.com', 'https://demo-sky.example.com/ultralight', '2026-11-08', 'unverified'),
  ('e0000000-0000-4000-8000-000000000009', 'bungee-jump-hemja', 'd0000000-0000-4000-8000-000000000004',
   'Bungee jump', 9000.00, 'NPR', 'per_person', '1 jump',
   null, null,
   'demo-bungee.example.com', 'https://demo-bungee.example.com/jump', '2026-11-01', 'verified')
) as v(id, activity_slug, provider_id, package_name, price, currency, pricing_unit, duration,
       inclusions, booking_conditions, source_domain, source_url, retrieved_at, verification_status)
join public.activities a on a.slug = v.activity_slug
on conflict (id) do nothing;
