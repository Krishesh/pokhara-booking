-- Fictional demo providers and offers for task 02 (idempotent, fixed ids)
-- Run supabase/schema.sql and supabase/seed.sql first.

insert into public.providers (
  id,
  name,
  website_url,
  phone,
  address,
  google_maps_url,
  google_rating,
  google_review_count,
  google_retrieved_at,
  notes
)
values
  (
    '11111111-1111-4111-8111-111111111101',
    'Demo Sunrise Paragliding',
    'https://sunrise-paragliding.example.com',
    '+977-61-555001',
    'Lakeside Road 6, Pokhara',
    'https://maps.example.com/demo-sunrise-paragliding',
    4.7,
    312,
    '2026-11-10',
    'Demo data — private operator note'
  ),
  (
    '11111111-1111-4111-8111-111111111102',
    'Demo Annapurna Air Sports',
    'https://annapurna-air.example.com',
    '+977-61-555002',
    'Sarangkot Hill Road, Pokhara',
    'https://maps.example.com/demo-annapurna-air',
    4.5,
    84,
    '2026-11-08',
    'Demo data — private operator note'
  ),
  (
    '11111111-1111-4111-8111-111111111103',
    'Demo Phewa Boat Association',
    'https://phewa-boats.example.com',
    '+977-61-555003',
    'Barahi Ghat, Lakeside, Pokhara',
    'https://maps.example.com/demo-phewa-boats',
    4.2,
    null,
    '2026-11-12',
    'Demo data — private operator note'
  ),
  (
    '11111111-1111-4111-8111-111111111104',
    'Demo Pokhara Ultralight',
    'https://pokhara-ultralight.example.com',
    '+977-61-555004',
    'Pokhara Airport Gate, Pokhara',
    'https://maps.example.com/demo-pokhara-ultralight',
    4.8,
    140,
    '2026-11-11',
    'Demo data — private operator note'
  ),
  (
    '11111111-1111-4111-8111-111111111105',
    'Demo Hemja Adventure',
    'https://hemja-adventure.example.com',
    '+977-61-555005',
    'Hemja Highway, Pokhara',
    'https://maps.example.com/demo-hemja-adventure',
    4.6,
    52,
    '2026-11-09',
    'Demo data — private operator note'
  )
on conflict (id) do nothing;

-- Paragliding at Sarangkot: NPR 8,500 (verified), NPR 11,000, USD 95, plus 1 outdated
insert into public.price_listings (
  id, activity_id, provider_id, package_name, price, currency, pricing_unit,
  duration, inclusions, booking_conditions, source_domain, source_url,
  booking_url, retrieved_at, verification_status, notes
)
select
  '22222222-2222-4222-8222-222222222201',
  a.id,
  '11111111-1111-4111-8111-111111111101',
  'Standard Tandem Flight',
  8500,
  'NPR',
  'per_person',
  '25–30 minutes',
  E'Certified tandem pilot\nHotel pickup within Lakeside\nHelmet and safety harness',
  E'Weather dependent; morning wind windows preferred.\nArrive 30 minutes before launch.',
  'sunrise-paragliding.example.com',
  'https://sunrise-paragliding.example.com/tandem',
  'https://sunrise-paragliding.example.com/book',
  '2026-11-10',
  'verified',
  'Demo data — private listing note'
from public.activities a
where a.slug = 'paragliding-sarangkot'
on conflict (id) do nothing;

insert into public.price_listings (
  id, activity_id, provider_id, package_name, price, currency, pricing_unit,
  duration, inclusions, booking_conditions, source_domain, source_url,
  booking_url, retrieved_at, verification_status, notes
)
select
  '22222222-2222-4222-8222-222222222202',
  a.id,
  '11111111-1111-4111-8111-111111111102',
  'Cross-Country Tandem',
  11000,
  'NPR',
  'per_person',
  '45–60 minutes',
  E'Extended thermal flight\nPhotos and GoPro video included',
  'Subject to midday thermal conditions.',
  'annapurna-air.example.com',
  'https://annapurna-air.example.com/xc',
  'https://annapurna-air.example.com/book',
  '2026-11-08',
  'unverified',
  'Demo data — private listing note'
from public.activities a
where a.slug = 'paragliding-sarangkot'
on conflict (id) do nothing;

insert into public.price_listings (
  id, activity_id, provider_id, package_name, price, currency, pricing_unit,
  duration, inclusions, booking_conditions, source_domain, source_url,
  booking_url, retrieved_at, verification_status, notes
)
select
  '22222222-2222-4222-8222-222222222203',
  a.id,
  '11111111-1111-4111-8111-111111111102',
  'International Tandem Package',
  95,
  'USD',
  'per_person',
  '30 minutes',
  E'English-speaking tandem pilot\nLakeside hotel transfer',
  'Minimum age 12 with guardian consent.',
  'annapurna-air.example.com',
  'https://annapurna-air.example.com/intl',
  'https://annapurna-air.example.com/book-intl',
  '2026-11-05',
  'unverified',
  'Demo data — private listing note'
from public.activities a
where a.slug = 'paragliding-sarangkot'
on conflict (id) do nothing;

insert into public.price_listings (
  id, activity_id, provider_id, package_name, price, currency, pricing_unit,
  duration, inclusions, booking_conditions, source_domain, source_url,
  booking_url, retrieved_at, verification_status, notes
)
select
  '22222222-2222-4222-8222-222222222204',
  a.id,
  '11111111-1111-4111-8111-111111111101',
  'Outdated Sunrise Offer',
  7500,
  'NPR',
  'per_person',
  '25 minutes',
  'Morning flight',
  null,
  'sunrise-paragliding.example.com',
  'https://sunrise-paragliding.example.com/sunrise-old',
  null,
  '2026-09-01',
  'outdated',
  'Demo data — outdated offer should stay hidden'
from public.activities a
where a.slug = 'paragliding-sarangkot'
on conflict (id) do nothing;

-- Boating on Phewa Lake: NPR 1,500 per group, rating without count
insert into public.price_listings (
  id, activity_id, provider_id, package_name, price, currency, pricing_unit,
  duration, inclusions, booking_conditions, source_domain, source_url,
  booking_url, retrieved_at, verification_status, notes
)
select
  '22222222-2222-4222-8222-222222222205',
  a.id,
  '11111111-1111-4111-8111-111111111103',
  '1-Hour Wooden Boat Hire',
  1500,
  'NPR',
  'per_group',
  '1 hour',
  E'Wooden rowboat for up to 4 people\nLife jackets for all passengers',
  'Life jackets must be worn while on the lake.',
  'phewa-boats.example.com',
  'https://phewa-boats.example.com/hourly',
  null,
  '2026-11-12',
  'verified',
  'Demo data — private listing note'
from public.activities a
where a.slug = 'boating-phewa-lake'
on conflict (id) do nothing;

-- Zipline at Sarangkot: NPR 6,000, no provider ("Listed on demo-listings.example.com")
insert into public.price_listings (
  id, activity_id, provider_id, package_name, price, currency, pricing_unit,
  duration, inclusions, booking_conditions, source_domain, source_url,
  booking_url, retrieved_at, verification_status, notes
)
select
  '22222222-2222-4222-8222-222222222206',
  a.id,
  null,
  'Single Zip Ride',
  6000,
  'NPR',
  'per_person',
  '1 hour total',
  E'Shuttle from Lakeside to Sarangkot launch\nHarness and safety briefing',
  'Weight limit 35–125 kg.',
  'demo-listings.example.com',
  'https://demo-listings.example.com/zipline',
  null,
  '2026-11-09',
  'unverified',
  'Demo data — private listing note'
from public.activities a
where a.slug = 'zipline-sarangkot'
on conflict (id) do nothing;

-- Ultralight Flight: NPR 13,000 per flight, plus 1 with no price
insert into public.price_listings (
  id, activity_id, provider_id, package_name, price, currency, pricing_unit,
  duration, inclusions, booking_conditions, source_domain, source_url,
  booking_url, retrieved_at, verification_status, notes
)
select
  '22222222-2222-4222-8222-222222222207',
  a.id,
  '11111111-1111-4111-8111-111111111104',
  '15-Minute Valley Flight',
  13000,
  'NPR',
  'per_flight',
  '15 minutes',
  E'Certified pilot\nFlight suit and intercom headset',
  'Maximum passenger weight 95 kg.',
  'pokhara-ultralight.example.com',
  'https://pokhara-ultralight.example.com/15min',
  'https://pokhara-ultralight.example.com/book',
  '2026-11-11',
  'verified',
  'Demo data — private listing note'
from public.activities a
where a.slug = 'ultralight-flight'
on conflict (id) do nothing;

insert into public.price_listings (
  id, activity_id, provider_id, package_name, price, currency, pricing_unit,
  duration, inclusions, booking_conditions, source_domain, source_url,
  booking_url, retrieved_at, verification_status, notes
)
select
  '22222222-2222-4222-8222-222222222208',
  a.id,
  '11111111-1111-4111-8111-111111111104',
  '60-Minute Himalayan Tour',
  null,
  null,
  'per_flight',
  '60 minutes',
  'Extended mountain route',
  null,
  'pokhara-ultralight.example.com',
  'https://pokhara-ultralight.example.com/60min',
  null,
  '2026-11-11',
  'unverified',
  'Demo data — unpriced offer should stay hidden'
from public.activities a
where a.slug = 'ultralight-flight'
on conflict (id) do nothing;

-- Bungee Jump at Hemja (unpublished activity): hidden by RLS
insert into public.price_listings (
  id, activity_id, provider_id, package_name, price, currency, pricing_unit,
  duration, inclusions, booking_conditions, source_domain, source_url,
  booking_url, retrieved_at, verification_status, notes
)
select
  '22222222-2222-4222-8222-222222222209',
  a.id,
  '11111111-1111-4111-8111-111111111105',
  'Tower Bungee Jump',
  9000,
  'NPR',
  'per_person',
  '30 minutes',
  'Jump harness and safety briefing',
  null,
  'hemja-adventure.example.com',
  'https://hemja-adventure.example.com/bungee',
  null,
  '2026-11-09',
  'verified',
  'Demo data — hidden because parent activity is unpublished'
from public.activities a
where a.slug = 'bungee-jump-hemja'
on conflict (id) do nothing;
