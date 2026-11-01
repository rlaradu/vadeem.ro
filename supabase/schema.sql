-- fermi.ro: daily questions table + Row Level Security
-- Run this in the Supabase SQL editor.

create table if not exists public.daily_questions (
  id               uuid primary key default gen_random_uuid(),
  publish_date     date not null,                 -- e.g. '2026-11-01'
  position         smallint not null default 1 check (position between 1 and 3), -- Q1..Q3 of the day
  question_text    text not null,                 -- e.g. 'Câte shaorme se vând vineri în București?'
  correct_answer   bigint not null,
  explanation_text text not null,
  source_link      text                           -- optional
  ,unique (publish_date, position)
);

alter table public.daily_questions enable row level security;

-- Anyone (anon + authenticated) can read.
-- Note: this also exposes future questions to anyone who queries the API directly.
-- If that matters, restrict with: using (publish_date <= current_date + 1)
-- (+1 day tolerates users ahead of the server's UTC date).
create policy "Public read"
  on public.daily_questions
  for select
  using (true);

-- Only authenticated users whose JWT app_metadata.role = 'admin' can write.
-- Set the role for your admin user (app_metadata is not user-editable):
--   update auth.users
--   set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
--   where email = 'you@example.com';
create policy "Admin insert"
  on public.daily_questions
  for insert
  to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin update"
  on public.daily_questions
  for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admin delete"
  on public.daily_questions
  for delete
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- MIGRATION for an existing table (3 questions per day). Run once if you
-- created the table with the old schema (publish_date unique):
--   alter table public.daily_questions drop constraint if exists daily_questions_publish_date_key;
--   alter table public.daily_questions add column if not exists position smallint not null default 1 check (position between 1 and 3);
--   alter table public.daily_questions add constraint daily_questions_date_position_key unique (publish_date, position);

-- Sample rows for testing
-- insert into public.daily_questions (publish_date, position, question_text, correct_answer, explanation_text)
-- values ('2026-11-02', 1, 'Câți locuitori are București?', 2300000, 'Exemplu.'),
--        ('2026-11-02', 2, 'Câte kilometri are Transfăgărășanul?', 90, 'Exemplu.'),
--        ('2026-11-02', 3, 'Câte bănci sunt în România?', 25, 'Exemplu.');