-- Demo group outings for task 06. Organizer and details are fictional ("Demo Hiking Club").
-- Requires the group_outings table from schema.sql. Safe to run again: fixed ids, existing rows are skipped.
-- Covers every state: published with a date, published with date to be confirmed, cancelled, draft.
-- Photos: Wikimedia Commons, credits in docs/image-credits.md.

insert into public.group_outings
  (id, slug, title, destination, organizer_name, organizer_contact, description, outing_date,
   meeting_details, cost_info, image_url, image_credit, status)
values
  ('f0000000-0000-4000-8000-000000000001', 'poon-hill-sunrise-weekend', 'Poon Hill sunrise weekend', 'Ghorepani and Poon Hill',
   'Demo Hiking Club', '+977 9800000001 (demo)',
   E'A relaxed two-day group hike from Nayapul to Ghorepani, with an early climb to Poon Hill for sunrise over Annapurna South and Dhaulagiri.\nGood walking shoes and a warm jacket needed. Beginners welcome; we walk at the pace of the group.',
   '2026-12-12',
   E'Meet at 6:30 am at the Lakeside bus park, Pokhara.\nShared jeep to Nayapul, back on Sunday evening.',
   'Around NPR 6,500 per person (jeep, teahouse stay, dinner and breakfast). Paid to the organizer, not on this website.',
   'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Sunrise_from_Poon_Hill%2C_Ghorepani.jpg/1280px-Sunrise_from_Poon_Hill%2C_Ghorepani.jpg',
   'Photo: Aditya Pal, CC BY-SA 4.0, via Wikimedia Commons',
   'published'),
  ('f0000000-0000-4000-8000-000000000002', 'begnas-lake-walk-and-picnic', 'Begnas Lake walk and picnic', 'Begnas Lake',
   'Demo Hiking Club', '+977 9800000001 (demo)',
   E'An easy half-day walk along the Begnas Lake shore and up to a viewpoint, followed by a picnic by the water.\nFamily friendly.',
   null,
   null,
   null,
   'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Begnas_Lake%2C_Pokhara%2C_Kaski.jpg/1280px-Begnas_Lake%2C_Pokhara%2C_Kaski.jpg',
   'Photo: Shadow Ayush, CC BY-SA 4.0, via Wikimedia Commons',
   'published'),
  ('f0000000-0000-4000-8000-000000000003', 'australian-camp-overnight', 'Australian Camp overnight', 'Australian Camp',
   'Demo Hiking Club', '+977 9800000001 (demo)',
   E'Overnight hike to Australian Camp for sunset and sunrise views of the Annapurna range.',
   '2026-12-06',
   E'Meet at 7:00 am at Lakeside Chowk.',
   'Around NPR 4,000 per person.',
   null, null,
   'cancelled'),
  ('f0000000-0000-4000-8000-000000000004', 'mardi-himal-trek-planning', 'Mardi Himal trek (planning)', 'Mardi Himal base camp',
   'Demo Hiking Club', '+977 9800000001 (demo)',
   E'Five-day trek to Mardi Himal base camp. Still being planned: not visible to visitors.',
   null, null, null, null, null,
   'draft')
on conflict (id) do nothing;
