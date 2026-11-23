-- PREM Phase 1 broker tenancy, draft ownership, activity, and access audit.
-- Apply to isolated test first. This migration intentionally does not rewrite
-- existing listing rows; new ownership columns remain nullable for staff inventory.

create table public.prem_broker_organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 120),
  contact_email text check (contact_email is null or char_length(contact_email) <= 254),
  contact_phone text check (contact_phone is null or contact_phone ~ '^\+[1-9][0-9]{7,14}$'),
  review_status text not null default 'pending'
    check (review_status in ('pending', 'approved', 'rejected', 'suspended')),
  created_by uuid not null unique references auth.users (id) on delete restrict,
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint prem_broker_org_review_fields_match check (
    (review_status = 'pending' and reviewed_at is null)
    or (review_status <> 'pending' and reviewed_at is not null)
  )
);

create table public.prem_broker_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.prem_broker_organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  membership_role text not null default 'owner' check (membership_role in ('owner', 'agent')),
  membership_status text not null default 'pending'
    check (membership_status in ('pending', 'active', 'rejected', 'suspended')),
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id),
  constraint prem_broker_membership_review_fields_match check (
    (membership_status = 'pending' and reviewed_at is null)
    or (membership_status <> 'pending' and reviewed_at is not null)
  )
);

create unique index prem_broker_memberships_one_owner_per_org_idx
  on public.prem_broker_memberships (organization_id) where membership_role = 'owner';
create index prem_broker_memberships_active_user_idx
  on public.prem_broker_memberships (user_id, organization_id)
  where membership_status = 'active';

create table public.prem_access_audit (
  id uuid primary key default gen_random_uuid(),
  action text not null check (action in (
    'staff_granted', 'staff_revoked', 'broker_approved', 'broker_rejected',
    'broker_suspended', 'broker_reactivated'
  )),
  actor_user_id uuid references auth.users (id) on delete set null,
  subject_user_id uuid references auth.users (id) on delete set null,
  organization_id uuid references public.prem_broker_organizations (id) on delete set null,
  reason text not null check (char_length(btrim(reason)) between 8 and 500),
  created_at timestamptz not null default now()
);

create table public.prem_listing_activity (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties (id) on delete set null,
  organization_id uuid references public.prem_broker_organizations (id) on delete set null,
  actor_user_id uuid references auth.users (id) on delete set null,
  action text not null check (action in ('created', 'updated', 'status_changed')),
  previous_status public.property_status,
  next_status public.property_status,
  occurred_at timestamptz not null default now()
);

create index prem_listing_activity_org_time_idx
  on public.prem_listing_activity (organization_id, occurred_at desc);
create index prem_listing_activity_property_time_idx
  on public.prem_listing_activity (property_id, occurred_at desc);

alter table public.properties
  add column submitted_by uuid references auth.users (id) on delete set null,
  add column broker_organization_id uuid references public.prem_broker_organizations (id) on delete set null;
create index properties_broker_organization_idx
  on public.properties (broker_organization_id, status, created_at desc);

alter table public.prem_broker_organizations enable row level security;
alter table public.prem_broker_memberships enable row level security;
alter table public.prem_access_audit enable row level security;
alter table public.prem_listing_activity enable row level security;

revoke all privileges on public.prem_broker_organizations, public.prem_broker_memberships,
  public.prem_access_audit, public.prem_listing_activity from public, anon, authenticated;
grant select on public.prem_broker_organizations, public.prem_broker_memberships,
  public.prem_listing_activity to authenticated;
grant all privileges on public.prem_broker_organizations, public.prem_broker_memberships,
  public.prem_access_audit, public.prem_listing_activity to service_role;

-- RLS-safe membership lookups live outside PostgREST's exposed schemas. These
-- helpers can only answer for the current JWT subject, never an arbitrary user.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to anon, authenticated;

create or replace function private.prem_can_read_broker_organization(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.prem_broker_memberships m
    where m.organization_id = p_organization_id
      and m.user_id = (select auth.uid())
      and m.membership_status in ('pending', 'active')
  );
$$;

create or replace function private.prem_has_active_broker_access(p_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.prem_broker_memberships m
    join public.prem_broker_organizations o on o.id = m.organization_id
    where m.organization_id = p_organization_id
      and m.user_id = (select auth.uid())
      and m.membership_status = 'active'
      and o.review_status = 'approved'
  );
$$;

revoke all on function private.prem_can_read_broker_organization(uuid) from public, anon;
revoke all on function private.prem_has_active_broker_access(uuid) from public, anon;
grant execute on function private.prem_can_read_broker_organization(uuid) to anon, authenticated;
grant execute on function private.prem_has_active_broker_access(uuid) to anon, authenticated;

create policy prem_broker_organizations_read_member_or_staff
  on public.prem_broker_organizations for select to authenticated
  using (
    created_by = (select auth.uid())
    or private.prem_can_read_broker_organization(id)
    or ((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('staff', 'admin')
  );

create policy prem_broker_memberships_read_self_or_staff
  on public.prem_broker_memberships for select to authenticated
  using (
    user_id = (select auth.uid())
    or ((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('staff', 'admin')
  );

create policy prem_listing_activity_read_member_or_staff
  on public.prem_listing_activity for select to authenticated
  using (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('staff', 'admin')
    or private.prem_has_active_broker_access(prem_listing_activity.organization_id)
  );

-- Client calls this single function so organization and owner membership are atomic.
create or replace function public.prem_register_broker_organization(
  p_name text,
  p_contact_email text default null,
  p_contact_phone text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_organization_id uuid;
  v_account_type text;
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required.';
  end if;
  select account_type into v_account_type
    from public.prem_accounts where user_id = v_user_id;
  if v_account_type is distinct from 'broker' then
    raise exception using errcode = '42501', message = 'A broker account is required.';
  end if;
  if exists (select 1 from public.prem_broker_organizations where created_by = v_user_id) then
    raise exception using errcode = '23505', message = 'A brokerage organization is already registered for this account.';
  end if;
  insert into public.prem_broker_organizations (name, contact_email, contact_phone, created_by)
    values (btrim(p_name), nullif(btrim(p_contact_email), ''), nullif(btrim(p_contact_phone), ''), v_user_id)
    returning id into v_organization_id;
  insert into public.prem_broker_memberships (organization_id, user_id, membership_role)
    values (v_organization_id, v_user_id, 'owner');
  return v_organization_id;
end;
$$;

revoke all on function public.prem_register_broker_organization(text, text, text) from public, anon;
grant execute on function public.prem_register_broker_organization(text, text, text) to authenticated;

-- Keep broker inventory in draft until a trusted staff/admin publishes it.
create or replace function public.prem_enforce_broker_property_rules()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_role text := (select auth.jwt() -> 'app_metadata' ->> 'role');
  v_user_id uuid := (select auth.uid());
begin
  if v_role in ('staff', 'admin') then return new; end if;
  if v_user_id is null or new.broker_organization_id is null
    or not private.prem_has_active_broker_access(new.broker_organization_id) then
    raise exception using errcode = '42501', message = 'Approved broker membership is required.';
  end if;
  if tg_op = 'INSERT' and new.submitted_by is distinct from v_user_id then
    raise exception using errcode = '42501', message = 'A broker must submit listings from their own account.';
  end if;
  if tg_op = 'UPDATE' and (
    new.submitted_by is distinct from old.submitted_by
    or new.broker_organization_id is distinct from old.broker_organization_id
  ) then
    raise exception using errcode = '42501', message = 'Broker listing ownership cannot be changed by a broker.';
  end if;
  if new.status <> 'draft' or new.verified_at is not null or new.published_at is not null then
    raise exception using errcode = '42501', message = 'Brokers can submit drafts only; PREM staff controls verification and publication.';
  end if;
  return new;
end;
$$;

create trigger prem_properties_enforce_broker_rules
before insert or update on public.properties
for each row execute function public.prem_enforce_broker_property_rules();

create or replace function public.prem_log_listing_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_action text;
begin
  if tg_op = 'INSERT' then
    v_action := 'created';
    insert into public.prem_listing_activity (property_id, organization_id, actor_user_id, action, next_status)
      values (new.id, new.broker_organization_id, (select auth.uid()), v_action, new.status);
    return new;
  end if;
  v_action := case when new.status is distinct from old.status then 'status_changed' else 'updated' end;
  insert into public.prem_listing_activity (
    property_id, organization_id, actor_user_id, action, previous_status, next_status
  ) values (new.id, new.broker_organization_id, (select auth.uid()), v_action, old.status, new.status);
  return new;
end;
$$;

create trigger prem_properties_log_activity
after insert or update on public.properties
for each row execute function public.prem_log_listing_activity();

revoke all on function public.prem_enforce_broker_property_rules() from public, anon, authenticated;
revoke all on function public.prem_log_listing_activity() from public, anon, authenticated;

drop policy if exists prem_properties_public_or_staff_read on public.properties;
create policy prem_properties_public_staff_or_broker_read
  on public.properties for select to anon, authenticated
  using (
    status = 'published'
    or ((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('staff', 'admin')
    or private.prem_has_active_broker_access(properties.broker_organization_id)
  );

create policy prem_properties_broker_draft_insert
  on public.properties for insert to authenticated
  with check (
    submitted_by = (select auth.uid())
    and status = 'draft' and verified_at is null and published_at is null
    and private.prem_has_active_broker_access(properties.broker_organization_id)
  );

create policy prem_properties_broker_draft_update
  on public.properties for update to authenticated
  using (
    status = 'draft'
    and private.prem_has_active_broker_access(properties.broker_organization_id)
  )
  with check (
    status = 'draft'
    and verified_at is null and published_at is null
    and private.prem_has_active_broker_access(properties.broker_organization_id)
  );
