create table if not exists public.app_records (
  entity text not null,
  record_id text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (entity, record_id)
);

grant select, insert, update, delete on table public.app_records to authenticated;

alter table public.app_records enable row level security;

create or replace function public.can_access_app_record(p_entity text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = (select auth.uid())
      and p.is_active = true
      and (
        p.is_creator = true
        or p.role = 'coordenacao'
        or (
          p.role = 'lideranca'
          and p_entity not in (
            'transactions', 'payables', 'receivables', 'budgets',
            'accountability', 'donations', 'users', 'audit_logs'
          )
        )
        or (
          p.role = 'tesouraria'
          and p_entity in (
            'transactions', 'payables', 'receivables', 'budgets',
            'accountability', 'donations', 'retreats'
          )
        )
      )
  );
$$;

revoke all on function public.can_access_app_record(text) from public;
grant execute on function public.can_access_app_record(text) to anon, authenticated;

do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'app_records'
  loop
    execute format('drop policy if exists %I on public.app_records', existing_policy.policyname);
  end loop;
end;
$$;

create policy "Authorized users can access app records"
on public.app_records for all
using (
  auth.uid() is not null
  and (select public.can_access_app_record(entity))
)
with check (
  auth.uid() is not null
  and (select public.can_access_app_record(entity))
);

create or replace function public.replace_app_records(p_entity text, p_records jsonb)
returns void
language plpgsql
set search_path = ''
as $$
begin
  if p_entity is null or p_entity = '' then
    raise exception 'p_entity must be a non-empty string';
  end if;
  if p_records is null or jsonb_typeof(p_records) is distinct from 'array' then
    raise exception 'p_records must be a JSON array';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_records) as record_data(value)
    where jsonb_typeof(record_data.value) <> 'object'
      or jsonb_typeof(record_data.value -> 'id') <> 'string'
      or coalesce(record_data.value ->> 'id', '') = ''
  ) then
    raise exception 'Every app record must have a non-empty string id';
  end if;

  if exists (
    select record_data.value ->> 'id'
    from jsonb_array_elements(p_records) as record_data(value)
    group by record_data.value ->> 'id'
    having count(*) > 1
  ) then
    raise exception 'App record ids must be unique within an entity';
  end if;

  delete from public.app_records as current_record
  where current_record.entity = p_entity
    and not exists (
      select 1
      from jsonb_array_elements(p_records) as record_data(value)
      where record_data.value ->> 'id' = current_record.record_id
    );

  insert into public.app_records (entity, record_id, payload, updated_at)
  select p_entity, record_data.value ->> 'id', record_data.value, now()
  from jsonb_array_elements(p_records) as record_data(value)
  on conflict (entity, record_id)
  do update set payload = excluded.payload, updated_at = excluded.updated_at;
end;
$$;

revoke all on function public.replace_app_records(text, jsonb) from public, anon;
grant execute on function public.replace_app_records(text, jsonb) to authenticated;
