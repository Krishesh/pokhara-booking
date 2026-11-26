-- Ensure catalogue columns exist when upgrading an earlier table
alter table public.activities add column if not exists is_published boolean not null default false;
alter table public.activities add column if not exists slug text;
alter table public.activities add column if not exists category text;
alter table public.activities add column if not exists location text;

create unique index if not exists activities_slug_key on public.activities (slug);

-- Seed Pokhara adventure activities (idempotent)
insert into public.activities (name, slug, category, location, description, image_url, is_published)
values
  (
    'Paragliding at Sarangkot',
    'paragliding-sarangkot',
    'paragliding',
    'Sarangkot',
    'Launch from the Sarangkot ridge above Pokhara for a tandem flight over the valley and Phewa Lake. On clear days, the route offers wide views of the Annapurna range and Machapuchare before landing near Lakeside.',
    null,
    true
  ),
  (
    'Boating on Phewa Lake',
    'boating-phewa-lake',
    'boating',
    'Lakeside',
    'Paddle or ride a traditional wooden boat across the calm waters of Phewa Lake from the Lakeside docks. Visitors often combine the trip with a short crossing to Tal Barahi Temple on the small island in the middle of the lake.',
    null,
    true
  ),
  (
    'Zipline at Sarangkot',
    'zipline-sarangkot',
    'zipline',
    'Sarangkot',
    'Ride a steep cable line descending from the hills of Sarangkot toward the valley floor near Hemja. The descent runs above forested slopes and terraced fields with views of the surrounding Himalayan foothills.',
    null,
    true
  ),
  (
    'Ultralight Flight',
    'ultralight-flight',
    'ultralight',
    'Pokhara Airport',
    'Take off from Pokhara in a two-seat open-cockpit ultralight aircraft piloted by a certified flyer. Routes follow the Seti River valley and circle high above Phewa Lake with close-up views of the Annapurna massif.',
    null,
    true
  ),
  (
    'World Peace Pagoda Hike',
    'world-peace-pagoda-hike',
    'hiking',
    'Anadu Hill',
    'Follow forested hillside trails up to the white stupa atop Anadu Hill on the southern shore of Phewa Lake. The hilltop terrace looks back across the water toward Pokhara city and the snow-capped peaks beyond.',
    null,
    true
  ),
  (
    'Bungee Jump at Hemja',
    'bungee-jump-hemja',
    'bungee',
    'Hemja',
    'Jump from an elevated steel tower overlooking the riverside cliffs in the Hemja area north of Pokhara. Harnessed leaps drop toward the valley below before rebounding above the riverbed.',
    null,
    false
  )
on conflict (slug) do nothing;
