-- vadeem.ro: complete database setup (safe to run multiple times).
-- Paste ALL of this into Supabase -> SQL Editor -> Run.

-- 1) Daily questions (3 per day) -------------------------------------------
create table if not exists public.daily_questions (
  id               uuid primary key default gen_random_uuid(),
  publish_date     date not null,
  position         smallint not null default 1 check (position between 1 and 3),
  question_text    text not null,
  correct_answer   bigint not null,
  explanation_text text not null,
  source_link      text,
  image_url        text,
  unit             text
);

-- If the table was created with the older schema, upgrade it.
-- Picture of the question (public URL; null = generated artwork).
alter table public.daily_questions add column if not exists image_url text;
-- Unit shown at the end of the input, e.g. KILOGRAME, BUCĂȚI.
alter table public.daily_questions add column if not exists unit text;

alter table public.daily_questions
  drop constraint if exists daily_questions_publish_date_key;
alter table public.daily_questions
  add column if not exists position smallint not null default 1
  check (position between 1 and 3);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'daily_questions_date_position_key'
  ) then
    alter table public.daily_questions
      add constraint daily_questions_date_position_key
      unique (publish_date, position);
  end if;
end $$;

alter table public.daily_questions enable row level security;

drop policy if exists "Public read"  on public.daily_questions;
drop policy if exists "Admin insert" on public.daily_questions;
drop policy if exists "Admin update" on public.daily_questions;
drop policy if exists "Admin delete" on public.daily_questions;

-- Anyone can read.
create policy "Public read" on public.daily_questions
  for select using (true);

-- Only authenticated users with app_metadata.role = 'admin' can write
-- (the /admin page uses the service role key and bypasses this).
create policy "Admin insert" on public.daily_questions
  for insert to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admin update" on public.daily_questions
  for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admin delete" on public.daily_questions
  for delete to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 2) Profiles (usernames for the leaderboard) -------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  username   text not null unique check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  created_at timestamptz not null default now()
);
-- RLS on with no policies: only the server (service role) can touch it.
alter table public.profiles enable row level security;

-- 3) Plays (community stats + leaderboard) ----------------------------------
create table if not exists public.plays (
  client_id    uuid not null,
  publish_date date not null,
  position     smallint not null check (position between 1 and 3),
  user_id      uuid references auth.users (id) on delete set null,
  guess        double precision not null check (guess > 0),
  factor       double precision not null check (factor >= 1),
  played_on    date not null,
  created_at   timestamptz not null default now(),
  primary key (client_id, publish_date, position)
);
create index if not exists plays_date_idx on public.plays (publish_date);
create index if not exists plays_user_idx on public.plays (user_id);
alter table public.plays enable row level security;

-- 4) Test questions for today and yesterday (delete them whenever) ----------
insert into public.daily_questions
  (publish_date, position, question_text, correct_answer, explanation_text)
values
  (current_date, 1, 'Câți locuitori are București (municipiul)?', 1716000, 'Exemplu de test.'),
  (current_date, 2, 'Câți kilometri are Transfăgărășanul?', 90, 'Exemplu de test.'),
  (current_date, 3, 'Câte stele are drapelul Uniunii Europene?', 12, 'Exemplu de test.'),
  (current_date - 1, 1, 'Câți metri are Vârful Moldoveanu?', 2544, 'Exemplu de test.'),
  (current_date - 1, 2, 'Câte județe are România?', 41, 'Exemplu de test.'),
  (current_date - 1, 3, 'Câți ani are Podul de la Cernavodă?', 130, 'Exemplu de test.')
on conflict (publish_date, position) do nothing;

-- 5) Storage bucket for question images (public read) ------------------------
-- The admin upload route also creates this bucket automatically if missing.
insert into storage.buckets (id, name, public)
values ('question-images', 'question-images', true)
on conflict (id) do nothing;
-- 6) Units for the test questions (only fills empty ones) --------------------
update public.daily_questions set unit = 'LOCUITORI' where unit is null and question_text like 'Câți locuitori are București%';
update public.daily_questions set unit = 'KILOMETRI' where unit is null and question_text like 'Câți kilometri are Transfăgărășanul%';
update public.daily_questions set unit = 'STELE'     where unit is null and question_text like 'Câte stele are drapelul%';
update public.daily_questions set unit = 'METRI'     where unit is null and question_text like 'Câți metri are Vârful Moldoveanu%';
update public.daily_questions set unit = 'JUDEȚE'    where unit is null and question_text like 'Câte județe are România%';
update public.daily_questions set unit = 'ANI'       where unit is null and question_text like 'Câți ani are Podul%';
-- 7) Question ideas sent by players ------------------------------------------
-- RLS on with no policies: only the server (service role) reads/writes it.
create table if not exists public.question_ideas (
  id               uuid primary key default gen_random_uuid(),
  idea_text        text not null check (char_length(idea_text) between 15 and 300),
  suggested_answer text,
  source_link      text,
  contact          text,
  client_id        uuid not null,
  status           text not null default 'new' check (status in ('new', 'used', 'rejected')),
  created_at       timestamptz not null default now()
);
create index if not exists question_ideas_client_idx on public.question_ideas (client_id, created_at);
alter table public.question_ideas enable row level security;