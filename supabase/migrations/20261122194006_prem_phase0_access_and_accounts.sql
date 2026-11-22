-- PREM Phase 0 reconciliation for the owner-selected PremHousing project.
-- The PREM property schema already exists there without migration tracking.
-- This additive migration scopes access to the three existing PREM tables and
-- adds owner-scoped account onboarding. It is not for BidMetric.

-- Existing tables have RLS enabled but no policies and broad client grants.
-- Public clients may browse localities and published listings only; lead data
-- stays staff-only and cannot be inserted directly from a public client.
alter table public.localities enable row level security;
alter table public.properties enable row level security;
alter table public.leads enable row level security;

revoke all privileges on table public.localities, public.properties, public.leads
  from public, anon, authenticated;
grant select on table public.localities, public.properties to anon, authenticated;
grant insert, update, delete on table public.localities, public.properties to authenticated;
grant select, update on table public.leads to authenticated;

drop policy if exists prem_localities_public_read on public.localities;
create policy prem_localities_public_read
  on public.localities for select to anon, authenticated
  using (true);

drop policy if exists prem_localities_staff_manage on public.localities;
create policy prem_localities_staff_manage
  on public.localities for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') in ('staff', 'admin'))
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') in ('staff', 'admin'));

drop policy if exists prem_properties_public_published_read on public.properties;
create policy prem_properties_public_published_read
  on public.properties for select to anon, authenticated
  using (status = 'published');

drop policy if exists prem_properties_staff_read_all on public.properties;
create policy prem_properties_staff_read_all
  on public.properties for select to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') in ('staff', 'admin'));

drop policy if exists prem_properties_staff_insert on public.properties;
create policy prem_properties_staff_insert
  on public.properties for insert to authenticated
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') in ('staff', 'admin'));

drop policy if exists prem_properties_staff_update on public.properties;
create policy prem_properties_staff_update
  on public.properties for update to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') in ('staff', 'admin'))
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') in ('staff', 'admin'));

drop policy if exists prem_properties_admin_delete on public.properties;
create policy prem_properties_admin_delete
  on public.properties for delete to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists prem_leads_staff_read on public.leads;
create policy prem_leads_staff_read
  on public.leads for select to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') in ('staff', 'admin'));

drop policy if exists prem_leads_staff_update on public.leads;
create policy prem_leads_staff_update
  on public.leads for update to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') in ('staff', 'admin'))
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') in ('staff', 'admin'));

create table if not exists public.prem_accounts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  account_type text not null check (account_type in ('customer', 'broker')),
  display_name text check (display_name is null or char_length(display_name) between 1 and 100),
  onboarding_status text not null default 'incomplete'
    check (onboarding_status in ('incomplete', 'complete')),
  broker_approval_status text not null default 'not_required'
    check (broker_approval_status in ('not_required', 'pending', 'approved', 'rejected', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint prem_accounts_approval_matches_type check (
    (account_type = 'broker' and broker_approval_status <> 'not_required')
    or (account_type = 'customer' and broker_approval_status = 'not_required')
  )
);

create or replace function public.prem_initialize_account_review_state()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.broker_approval_status := case
    when new.account_type = 'broker' then 'pending'
    else 'not_required'
  end;
  return new;
end;
$$;

create or replace function public.prem_touch_account_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

drop trigger if exists prem_accounts_initialize_review_state on public.prem_accounts;
create trigger prem_accounts_initialize_review_state
before insert on public.prem_accounts
for each row execute function public.prem_initialize_account_review_state();

drop trigger if exists prem_accounts_touch_updated_at on public.prem_accounts;
create trigger prem_accounts_touch_updated_at
before update on public.prem_accounts
for each row execute function public.prem_touch_account_updated_at();

alter table public.prem_accounts enable row level security;
revoke all privileges on table public.prem_accounts from public, anon, authenticated;
grant select on table public.prem_accounts to authenticated;
grant insert (user_id, account_type, display_name) on table public.prem_accounts to authenticated;
grant update (display_name, onboarding_status) on table public.prem_accounts to authenticated;
grant all privileges on table public.prem_accounts to service_role;

drop policy if exists prem_accounts_select_own on public.prem_accounts;
create policy prem_accounts_select_own
  on public.prem_accounts for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists prem_accounts_insert_own on public.prem_accounts;
create policy prem_accounts_insert_own
  on public.prem_accounts for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and account_type in ('customer', 'broker')
  );

drop policy if exists prem_accounts_update_own_profile on public.prem_accounts;
create policy prem_accounts_update_own_profile
  on public.prem_accounts for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

revoke all privileges on function public.prem_initialize_account_review_state() from public, anon, authenticated;
revoke all privileges on function public.prem_touch_account_updated_at() from public, anon, authenticated;
