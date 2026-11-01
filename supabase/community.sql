-- vadeem.ro: community data (stats, leaderboard, accounts).
-- Run in the Supabase SQL editor AFTER schema.sql.
--
-- Both tables have RLS enabled and NO policies on purpose: the browser can't
-- read or write them directly. All access goes through the Next.js API routes
-- (service role), which recompute scores server-side so they can't be faked.

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  username   text not null unique check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create table if not exists public.plays (
  client_id    uuid not null,                       -- anonymous browser id
  publish_date date not null,
  position     smallint not null check (position between 1 and 3),
  user_id      uuid references auth.users (id) on delete set null, -- set when signed in
  guess        double precision not null check (guess > 0),
  factor       double precision not null check (factor >= 1),      -- error factor (x)
  played_on    date not null,                       -- local date it was played
  created_at   timestamptz not null default now(),
  primary key (client_id, publish_date, position)
);
create index if not exists plays_date_idx on public.plays (publish_date);
create index if not exists plays_user_idx on public.plays (user_id);
alter table public.plays enable row level security;
