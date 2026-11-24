-- More realistic demo data: providers, offers, outings and outing interests.
-- Run after seed.sql, seed-offers.sql and seed-outings.sql. Safe to run again.
--
-- ALL COMPANIES, CLUBS, PEOPLE AND PRICES HERE ARE FICTIONAL. Names were checked against
-- web search to avoid real Pokhara businesses; websites use the reserved example.com domain,
-- and interest contacts use example.com email addresses only (no real phone numbers).
-- Prices are realistic for Pokhara in 2026 but are not quotes from any real operator.
-- Photos: Wikimedia Commons, credits in docs/image-credits.md.

-- ---------- Providers ----------
-- Give the four original demo providers realistic names.
update public.providers set name = 'Fewa Wings Paragliding', website_url = 'https://fewawings.example.com',
  phone = '+977 61-000101 (demo)', address = 'Lakeside Road, Pokhara (demo)', google_rating = 4.8, google_review_count = 1240,
  notes = 'Fictional demo company. Not a real business.'
where id = 'd0000000-0000-4000-8000-000000000001';
update public.providers set name = 'Sarangkot Skyline Adventures', website_url = 'https://sarangkotskyline.example.com',
  phone = '+977 61-000102 (demo)', google_rating = 4.6, google_review_count = 486,
  notes = 'Fictional demo company. Not a real business.'
where id = 'd0000000-0000-4000-8000-000000000002';
update public.providers set name = 'Phewa Rowing Cooperative', phone = '+977 61-000103 (demo)',
  address = 'Barahi Ghat, Lakeside (demo)', notes = 'Fictional demo company. Not a real business.'
where id = 'd0000000-0000-4000-8000-000000000003';
update public.providers set name = 'Hemja Gorge Bungee', website_url = 'https://hemjagorge.example.com',
  phone = '+977 61-000104 (demo)', google_rating = 4.5, google_review_count = 210, google_retrieved_at = '2026-11-20',
  notes = 'Fictional demo company. Not a real business.'
where id = 'd0000000-0000-4000-8000-000000000004';

insert into public.providers (id, name, website_url, phone, address, google_rating, google_review_count, google_retrieved_at, notes)
values
  ('d0000000-0000-4000-8000-000000000005', 'Machhapuchhre Air Sports', 'https://machhapuchhreair.example.com', '+977 61-000105 (demo)', 'Khahare, Pokhara (demo)', 4.9, 312, '2026-11-20', 'Fictional demo company. Not a real business.'),
  ('d0000000-0000-4000-8000-000000000006', 'Kaski Ultralight Flights', 'https://kaskiultralight.example.com', '+977 61-000106 (demo)', 'Airport Road, Pokhara (demo)', 4.7, 198, '2026-11-20', 'Fictional demo company. Not a real business.'),
  ('d0000000-0000-4000-8000-000000000007', 'Seti River Zipline', 'https://setizipline.example.com', '+977 61-000107 (demo)', 'Sarangkot (demo)', 4.5, 864, '2026-11-20', 'Fictional demo company. Not a real business.'),
  ('d0000000-0000-4000-8000-000000000008', 'Pokhara Valley Guides', 'https://pokharavalleyguides.example.com', '+977 61-000108 (demo)', 'Lakeside Chowk, Pokhara (demo)', 4.8, 127, '2026-11-20', 'Fictional demo company. Not a real business.'),
  ('d0000000-0000-4000-8000-000000000009', 'Lakeside Kayak & SUP', 'https://lakesidekayak.example.com', '+977 61-000109 (demo)', 'Lakeside, Pokhara (demo)', 4.4, 93, '2026-11-20', 'Fictional demo company. Not a real business.'),
  ('d0000000-0000-4000-8000-000000000010', 'Annapurna Sky Tandem', null, '+977 61-000110 (demo)', null, 4.2, 57, '2026-11-20', 'Fictional demo company. Not a real business.')
on conflict (id) do nothing;

-- ---------- Offers: realistic prices on the original ones ----------
update public.price_listings set price = 10500, duration = '25–30 minutes', retrieved_at = '2026-11-20'
where id = 'e0000000-0000-4000-8000-000000000001';
update public.price_listings set price = 12500 where id = 'e0000000-0000-4000-8000-000000000002';
update public.price_listings set price = 150 where id = 'e0000000-0000-4000-8000-000000000003';
update public.price_listings set price = 16500, booking_conditions = E'Morning flights only, weather permitting.\nMaximum weight 95 kg.'
where id = 'e0000000-0000-4000-8000-000000000007';
update public.price_listings set price = 11500, inclusions = E'Jump from the 70 m tower\nSafety briefing\nCertificate', booking_conditions = E'Minimum age 14. Weight 35–110 kg.'
where id = 'e0000000-0000-4000-8000-000000000009';

-- ---------- New offers ----------
insert into public.price_listings (
  id, activity_id, provider_id, package_name, price, currency, pricing_unit, duration,
  inclusions, booking_conditions, source_domain, source_url, retrieved_at, verification_status, notes
)
select v.id::uuid, a.id, v.provider_id::uuid, v.package_name, v.price, v.currency, v.pricing_unit, v.duration,
       v.inclusions, v.booking_conditions, v.source_domain, v.source_url, v.retrieved_at::date,
       v.verification_status, 'Fictional demo price, not a real quote.'
from (values
  -- Paragliding
  ('e0000000-0000-4000-8000-000000000010', 'paragliding-sarangkot', 'd0000000-0000-4000-8000-000000000005',
   'Sunrise tandem flight', 11500.00, 'NPR', 'per_person', '25–30 minutes',
   E'Licensed tandem pilot\nFlight insurance\nPick-up from Lakeside hotels\nPhotos from the pilot''s camera',
   E'Weather dependent: rebooked or refunded if cancelled.\nPassenger weight 15–100 kg.',
   'machhapuchhreair.example.com', 'https://machhapuchhreair.example.com/sunrise-tandem', '2026-11-20', 'verified'),
  ('e0000000-0000-4000-8000-000000000011', 'paragliding-sarangkot', 'd0000000-0000-4000-8000-000000000010',
   'Budget tandem flight', 8800.00, 'NPR', 'per_person', '15–20 minutes',
   E'Tandem pilot\nFlight insurance', E'Transport to the take-off point not included.',
   'annapurnaskytandem.example.com', 'https://annapurnaskytandem.example.com/tandem', '2026-11-18', 'unverified'),
  ('e0000000-0000-4000-8000-000000000012', 'paragliding-sarangkot', 'd0000000-0000-4000-8000-000000000001',
   'Acro tandem flight', 16000.00, 'NPR', 'per_person', '30 minutes',
   E'Experienced acro pilot\nFlight insurance\nGoPro video\nPick-up from Lakeside',
   E'Spirals and wingovers: not recommended if you get motion sick.',
   'fewawings.example.com', 'https://fewawings.example.com/acro', '2026-11-20', 'verified'),
  -- Boating
  ('e0000000-0000-4000-8000-000000000013', 'boating-phewa-lake', 'd0000000-0000-4000-8000-000000000003',
   'Paddle boat, up to 4 people', 1000.00, 'NPR', 'per_group', '1 hour',
   E'Paddle boat\nLife jackets', E'Pay at the boat station on the day.',
   'phewarowing.example.com', 'https://phewarowing.example.com/paddle-boat', '2026-11-20', 'verified'),
  ('e0000000-0000-4000-8000-000000000014', 'boating-phewa-lake', 'd0000000-0000-4000-8000-000000000009',
   'Single kayak hire', 900.00, 'NPR', 'per_person', '1 hour',
   E'Sit-on-top kayak\nPaddle and life jacket', E'Basic swimming ability required.',
   'lakesidekayak.example.com', 'https://lakesidekayak.example.com/kayak-hire', '2026-11-19', 'unverified'),
  ('e0000000-0000-4000-8000-000000000015', 'boating-phewa-lake', 'd0000000-0000-4000-8000-000000000009',
   'Stand-up paddleboard lesson', 3500.00, 'NPR', 'per_person', '2 hours',
   E'Board, paddle and life jacket\nCertified instructor\nDry bag for your phone', E'Morning sessions only (calmer water).',
   'lakesidekayak.example.com', 'https://lakesidekayak.example.com/sup-lesson', '2026-11-19', 'verified'),
  ('e0000000-0000-4000-8000-000000000016', 'boating-phewa-lake', 'd0000000-0000-4000-8000-000000000009',
   'Guided kayak tour', 1800.00, 'NPR', 'per_hour', 'Minimum 2 hours',
   E'Kayak and gear\nGuide', E'Priced per hour: contact us for a quote.',
   'lakesidekayak.example.com', 'https://lakesidekayak.example.com/tours', '2026-11-19', 'unverified'),
  -- Zipline
  ('e0000000-0000-4000-8000-000000000017', 'zipline-sarangkot', 'd0000000-0000-4000-8000-000000000007',
   'Zipline ride with transport', 7500.00, 'NPR', 'per_person', '2 minutes ride, about 2.5 hours total',
   E'Return transport from Lakeside\nHarness and helmet\nSafety briefing',
   E'Weight 35–125 kg. Not suitable during pregnancy.',
   'setizipline.example.com', 'https://setizipline.example.com/ride', '2026-11-20', 'verified'),
  ('e0000000-0000-4000-8000-000000000018', 'zipline-sarangkot', 'd0000000-0000-4000-8000-000000000007',
   'Zipline with GoPro video', 8800.00, 'NPR', 'per_person', '2 minutes ride, about 2.5 hours total',
   E'Everything in the standard ride\nGoPro video of your ride', null,
   'setizipline.example.com', 'https://setizipline.example.com/ride-video', '2026-11-20', 'unverified'),
  -- Ultralight
  ('e0000000-0000-4000-8000-000000000019', 'ultralight-flight', 'd0000000-0000-4000-8000-000000000006',
   '30-minute mountain flight', 26000.00, 'NPR', 'per_flight', '30 minutes',
   E'Licensed pilot\nAirport transfer\nClose views of Machhapuchhre',
   E'Morning flights only, weather permitting.',
   'kaskiultralight.example.com', 'https://kaskiultralight.example.com/30-minutes', '2026-11-20', 'verified'),
  ('e0000000-0000-4000-8000-000000000020', 'ultralight-flight', 'd0000000-0000-4000-8000-000000000006',
   '60-minute Annapurna flight', 46000.00, 'NPR', 'per_flight', '60 minutes',
   E'Licensed pilot\nAirport transfer\nAnnapurna range circuit',
   E'Morning flights only, weather permitting.',
   'kaskiultralight.example.com', 'https://kaskiultralight.example.com/60-minutes', '2026-11-20', 'verified'),
  ('e0000000-0000-4000-8000-000000000021', 'ultralight-flight', 'd0000000-0000-4000-8000-000000000005',
   '15-minute valley flight', 125.00, 'USD', 'per_flight', '15 minutes',
   E'Licensed pilot\nFlight insurance', null,
   'machhapuchhreair.example.com', 'https://machhapuchhreair.example.com/ultralight', '2026-11-18', 'unverified'),
  -- World Peace Pagoda hike
  ('e0000000-0000-4000-8000-000000000022', 'world-peace-pagoda-hike', 'd0000000-0000-4000-8000-000000000008',
   'Guided hike with boat crossing', 2500.00, 'NPR', 'per_person', 'About 4 hours',
   E'English-speaking guide\nBoat across Phewa Lake\nWater', E'Moderate climb on stone steps. Good shoes needed.',
   'pokharavalleyguides.example.com', 'https://pokharavalleyguides.example.com/peace-pagoda', '2026-11-20', 'verified'),
  ('e0000000-0000-4000-8000-000000000023', 'world-peace-pagoda-hike', 'd0000000-0000-4000-8000-000000000008',
   'Private sunrise hike', 6000.00, 'NPR', 'per_group', 'About 3 hours',
   E'Private guide for your group (up to 6)\nHot tea at the top', E'Starts at 5:00 am from Lakeside.',
   'pokharavalleyguides.example.com', 'https://pokharavalleyguides.example.com/sunrise', '2026-11-20', 'unverified'),
  -- Bungee
  ('e0000000-0000-4000-8000-000000000024', 'bungee-jump-hemja', 'd0000000-0000-4000-8000-000000000004',
   'Canyon swing', 10500.00, 'NPR', 'per_person', '1 swing',
   E'Swing from the 70 m tower\nSafety briefing', E'Minimum age 14. Weight 35–110 kg.',
   'hemjagorge.example.com', 'https://hemjagorge.example.com/swing', '2026-11-20', 'unverified'),
  ('e0000000-0000-4000-8000-000000000025', 'bungee-jump-hemja', 'd0000000-0000-4000-8000-000000000004',
   'Bungee and swing combo', 18000.00, 'NPR', 'per_person', '1 jump + 1 swing',
   E'One bungee jump and one canyon swing\nCertificate\nPhotos', E'Both on the same day.',
   'hemjagorge.example.com', 'https://hemjagorge.example.com/combo', '2026-11-20', 'verified')
) as v(id, activity_slug, provider_id, package_name, price, currency, pricing_unit, duration,
       inclusions, booking_conditions, source_domain, source_url, retrieved_at, verification_status)
join public.activities a on a.slug = v.activity_slug
on conflict (id) do nothing;

-- ---------- Outings ----------
update public.group_outings set organizer_name = 'Lakeside Trekking Circle', organizer_contact = 'lakeside.trekking@example.com (demo)'
where id in ('f0000000-0000-4000-8000-000000000001', 'f0000000-0000-4000-8000-000000000003');
update public.group_outings set organizer_name = 'Pokhara Weekend Walkers', organizer_contact = 'weekend.walkers@example.com (demo)'
where id in ('f0000000-0000-4000-8000-000000000002', 'f0000000-0000-4000-8000-000000000004');

insert into public.group_outings
  (id, slug, title, destination, organizer_name, organizer_contact, description, outing_date,
   meeting_details, cost_info, image_url, image_credit, status)
values
  ('f0000000-0000-4000-8000-000000000005', 'ghandruk-village-weekend', 'Ghandruk village weekend', 'Ghandruk',
   'Pokhara Weekend Walkers', 'weekend.walkers@example.com (demo)',
   E'Two days in the Gurung village of Ghandruk, with views of Annapurna South and Machhapuchhre.\nShort jeep ride, then an easy 2-hour walk. Homestay with a local family, and a visit to the Gurung museum.',
   '2027-01-09',
   E'Meet at 7:00 am at the Baglung bus park, Pokhara.\nBack on Sunday by 5 pm.',
   'Around NPR 5,500 per person (jeep, homestay, dinner and breakfast).',
   'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Ghandruk_an_Annapurna_South.jpg/1280px-Ghandruk_an_Annapurna_South.jpg',
   'Photo: Kondephy, CC BY-SA 4.0, via Wikimedia Commons', 'published'),
  ('f0000000-0000-4000-8000-000000000006', 'bandipur-heritage-day-trip', 'Bandipur heritage day trip', 'Bandipur',
   'Lakeside Trekking Circle', 'lakeside.trekking@example.com (demo)',
   E'A day in the car-free hilltop bazaar of Bandipur: old Newar houses, temples, and a short walk to the Tundikhel viewpoint.',
   '2026-12-20',
   E'Meet at 6:30 am at Prithvi Chowk bus stop.',
   'Around NPR 3,000 per person (return bus and lunch).',
   'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Ganesh_Temple_Bandipur_Bandipur_VDC_Tanahau_Gandak_Pradesh_Nepal_Rajesh_Dhungana.jpg/1280px-Ganesh_Temple_Bandipur_Bandipur_VDC_Tanahau_Gandak_Pradesh_Nepal_Rajesh_Dhungana.jpg',
   'Photo: Rajesh Dhungana, CC BY-SA 4.0, via Wikimedia Commons', 'published'),
  ('f0000000-0000-4000-8000-000000000007', 'rupa-lake-cycling-day', 'Rupa Lake cycling day', 'Rupa Lake',
   'Pokhara Weekend Walkers', 'weekend.walkers@example.com (demo)',
   E'Ride from Lakeside to the quiet Rupa Lake, with a stop at Begnas on the way back. Mostly flat village roads, one steady climb.\nBikes can be rented the day before.',
   null, null, null,
   'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Rupa_Lake.jpg/1280px-Rupa_Lake.jpg',
   'Photo: Pursob64, CC BY-SA 4.0, via Wikimedia Commons', 'published'),
  ('f0000000-0000-4000-8000-000000000008', 'annapurna-base-camp-group-trek', 'Annapurna Base Camp group trek', 'Annapurna Base Camp',
   'Himalayan Trail Friends', 'trail.friends@example.com (demo)',
   E'Eight-day group trek through Ghandruk, Chhomrong and the Modi Khola valley to Annapurna Base Camp (4,130 m).\nGood fitness needed; previous trekking experience recommended. Group of 6–10.',
   '2027-03-15',
   E'Briefing the evening before departure at Lakeside (location shared after registering).',
   'Around NPR 55,000 per person for 8 days (permits, guide, teahouses and meals).',
   'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Annapurna_Base_Camp_with_snow.jpg/1280px-Annapurna_Base_Camp_with_snow.jpg',
   'Photo: Samdesherpa, CC BY-SA 4.0, via Wikimedia Commons', 'published'),
  ('f0000000-0000-4000-8000-000000000009', 'sarangkot-sunrise-hike', 'Sarangkot sunrise hike', 'Sarangkot',
   'Lakeside Trekking Circle', 'lakeside.trekking@example.com (demo)',
   E'An early walk up to Sarangkot viewpoint for sunrise over the Annapurna range, then breakfast in the village.',
   '2026-12-05',
   E'Meet at 4:45 am at Lakeside Chowk. Bring a torch and a warm layer.',
   'Free (breakfast at your own cost).',
   'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Sarangkot%2C_Nepal-WLV-1689.jpg/1280px-Sarangkot%2C_Nepal-WLV-1689.jpg',
   'Photo: Bijay Chaurasia, CC BY-SA 4.0, via Wikimedia Commons', 'published'),
  ('f0000000-0000-4000-8000-000000000010', 'panchase-overnight-trek', 'Panchase overnight trek (planning)', 'Panchase',
   'Himalayan Trail Friends', 'trail.friends@example.com (demo)',
   E'Overnight forest trek to Panchase hill. Still being planned: not visible to visitors.',
   null, null, null, null, null, 'draft')
on conflict (id) do nothing;

-- ---------- Outing interests (example.com emails only) ----------
insert into public.group_interests (outing_id, customer_name, contact_type, contact_value, participant_count)
values
  ('f0000000-0000-4000-8000-000000000008', 'Anita Gurung', 'email', 'anita.gurung@example.com', 2),
  ('f0000000-0000-4000-8000-000000000008', 'Tom Becker', 'email', 'tom.becker@example.com', 1),
  ('f0000000-0000-4000-8000-000000000008', 'Priya Sharma', 'email', 'priya.sharma@example.com', 3),
  ('f0000000-0000-4000-8000-000000000005', 'Bikash Thapa', 'email', 'bikash.thapa@example.com', 4),
  ('f0000000-0000-4000-8000-000000000005', 'Emma Laurent', 'email', 'emma.laurent@example.com', 2),
  ('f0000000-0000-4000-8000-000000000006', 'Ramesh Adhikari', 'email', 'ramesh.adhikari@example.com', 1),
  ('f0000000-0000-4000-8000-000000000009', 'Sofia Rossi', 'email', 'sofia.rossi@example.com', 2)
on conflict (outing_id, contact_value) do nothing;
