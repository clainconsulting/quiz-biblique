-- À exécuter une seule fois dans Supabase > SQL Editor.
-- Chaque compte ne peut lire ou modifier que sa propre ligne.

create table if not exists public.user_bible_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  history jsonb not null default '[]'::jsonb,
  progress jsonb not null default '{}'::jsonb,
  favorites jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_bible_data enable row level security;

drop policy if exists "read own bible data" on public.user_bible_data;
create policy "read own bible data"
on public.user_bible_data for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "insert own bible data" on public.user_bible_data;
create policy "insert own bible data"
on public.user_bible_data for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "update own bible data" on public.user_bible_data;
create policy "update own bible data"
on public.user_bible_data for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

grant select, insert, update on public.user_bible_data to authenticated;
