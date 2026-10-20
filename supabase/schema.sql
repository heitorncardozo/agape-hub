create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  role text not null default 'membro',
  is_creator boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  role text,
  group_name text,
  created_at timestamptz not null default now()
);

alter table public.members
  add column if not exists sub text,
  add column if not exists phone text,
  add column if not exists birth date,
  add column if not exists joined date,
  add column if not exists status text not null default 'Ativo';

create table if not exists public.retreats (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date,
  end_date date,
  status text not null default 'ativo',
  created_at timestamptz not null default now()
);

create table if not exists public.retreat_participants (
  id uuid primary key default gen_random_uuid(),
  retreat_id uuid not null references public.retreats(id) on delete cascade,
  member_id uuid not null references public.members(id) on delete cascade,
  type text not null check (type in ('cursista', 'servo')),
  confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  unique(retreat_id, member_id)
);

alter table public.profiles enable row level security;
alter table public.members enable row level security;
alter table public.retreats enable row level security;
alter table public.retreat_participants enable row level security;

create policy "Users can read own profile"
on public.profiles
for select
using (auth.uid() = user_id);

create policy "Coordinators can read all profiles"
on public.profiles
for select
using (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'coordenacao'
  )
);

create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = user_id);

create policy "Creator can manage profiles"
on public.profiles
for all
using (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.is_creator = true
  )
);

create policy "Coordinators and creator can manage members"
on public.members
for all
using (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and (p.role = 'coordenacao' or p.is_creator = true)
  )
);

create policy "Coordinators and creator can manage retreats"
on public.retreats
for all
using (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and (p.role = 'coordenacao' or p.is_creator = true)
  )
);

create policy "Coordinators and creator can manage retreat participants"
on public.retreat_participants
for all
using (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and (p.role = 'coordenacao' or p.is_creator = true)
  )
);
