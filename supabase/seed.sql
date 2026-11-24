-- Demo data for task 01 (activity catalogue).
-- Run once in the Supabase SQL editor. Safe to run again: existing slugs are skipped.

-- Schema change from task 01 (also recorded in schema.sql)
alter table public.activities add column if not exists is_published boolean not null default false;

insert into public.activities (name, slug, category, location, description, is_published)
values
  (
    'Paragliding at Sarangkot',
    'paragliding-sarangkot',
    'paragliding',
    'Sarangkot',
    E'Tandem paragliding flight launching from Sarangkot hill with a trained pilot.\nOn clear days the flight looks out over Phewa Lake and the Annapurna range before landing near Lakeside.',
    true
  ),
  (
    'Boating on Phewa Lake',
    'boating-phewa-lake',
    'boating',
    'Lakeside',
    E'Rowing or paddle boat trip on Phewa Lake, Pokhara''s largest lake.\nA common stop is the Tal Barahi temple on its small island.',
    true
  ),
  (
    'Zipline at Sarangkot',
    'zipline-sarangkot',
    'zipline',
    'Sarangkot',
    E'Long, steep zipline descending from the Sarangkot ridge toward the valley floor.\nRiders are harnessed in and travel at high speed over forest and fields.',
    true
  ),
  (
    'Ultralight Flight',
    'ultralight-flight',
    'ultralight',
    'Pokhara Airport',
    E'Short scenic flight in a two-seat ultralight aircraft, flown by a licensed pilot.\nThe route circles the Pokhara valley with close views of the surrounding hills and mountains.',
    true
  ),
  (
    'World Peace Pagoda Hike',
    'world-peace-pagoda-hike',
    'hiking',
    'Anadu Hill',
    E'Hike up Anadu Hill to the white World Peace Pagoda above the south shore of Phewa Lake.\nThe trail climbs through forest and can be combined with a boat crossing back to Lakeside.',
    true
  ),
  (
    'Bungee Jump at Hemja',
    'bungee-jump-hemja',
    'bungee',
    'Hemja',
    E'Bungee jump from a tower above a river gorge at Hemja, north of Pokhara.\nUnpublished on purpose: used to check that hidden activities stay off the site.',
    false
  )
on conflict (slug) do nothing;
