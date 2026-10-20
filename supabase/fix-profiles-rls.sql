create or replace function public.is_coordinator_or_creator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = (select auth.uid())
      and (p.role = 'coordenacao' or p.is_creator = true)
  );
$$;

create or replace function public.is_creator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = (select auth.uid())
      and p.is_creator = true
  );
$$;

revoke all on function public.is_coordinator_or_creator() from public, anon;
revoke all on function public.is_creator() from public, anon;
grant execute on function public.is_coordinator_or_creator() to authenticated;
grant execute on function public.is_creator() to authenticated;

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Coordinators can read all profiles" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Creator can manage profiles" on public.profiles;
drop policy if exists "Coordinators and creator can manage members" on public.members;
drop policy if exists "Coordinators and creator can manage retreats" on public.retreats;
drop policy if exists "Coordinators and creator can manage retreat participants" on public.retreat_participants;

create policy "Users can read own profile"
on public.profiles for select
using (auth.uid() = user_id);

create policy "Coordinators can read all profiles"
on public.profiles for select
using (public.is_coordinator_or_creator());

create policy "Creator can manage profiles"
on public.profiles for all
using (public.is_creator())
with check (public.is_creator());

create policy "Coordinators and creator can manage members"
on public.members for all
using (public.is_coordinator_or_creator())
with check (public.is_coordinator_or_creator());

create policy "Coordinators and creator can manage retreats"
on public.retreats for all
using (public.is_coordinator_or_creator())
with check (public.is_coordinator_or_creator());

create policy "Coordinators and creator can manage retreat participants"
on public.retreat_participants for all
using (public.is_coordinator_or_creator())
with check (public.is_coordinator_or_creator());