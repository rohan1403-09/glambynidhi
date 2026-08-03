create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 80),
  service text check (service is null or char_length(service) <= 100),
  rating smallint not null check (rating between 1 and 5),
  review text not null check (char_length(review) between 10 and 500),
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

-- Reviews are read and written only through the Vercel server API.
-- No public database policy is needed because the private server key bypasses RLS.
