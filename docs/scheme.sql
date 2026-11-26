CREATE TABLE activities (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    description text,
    image_url text,
    price numeric(10, 2) not null,
    google_review_url text,
    google_rating numeric(2, 1),
    created_at timestamptz default now()
);

CREATE TABLE bookings (
    id uuid default gen_random_uuid() primary key,
    activity_id uuid not null references activities(id) on delete cascade,
    customer_name text not null,
    customer_email text not null,
    customer_phone text not null,
    booking_date date not null,
    created_at timestamptz default now()
);

GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO anon;

CREATE POLICY "anon full access" ON public.activities
FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "anon full access" ON public.bookings
FOR ALL TO anon USING (true) WITH CHECK (true);

