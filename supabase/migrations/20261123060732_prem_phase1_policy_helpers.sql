-- Break organization/membership RLS recursion with non-exposed, caller-scoped helpers.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to anon, authenticated;

create or replace function private.prem_can_read_broker_organization(p_organization_id uuid)
returns boolean
language sql stable security definer
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
language sql stable security definer
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

drop policy prem_broker_organizations_read_member_or_staff on public.prem_broker_organizations;
create policy prem_broker_organizations_read_member_or_staff
  on public.prem_broker_organizations for select to authenticated
  using (
    created_by = (select auth.uid())
    or private.prem_can_read_broker_organization(id)
    or ((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('staff', 'admin')
  );

drop policy prem_listing_activity_read_member_or_staff on public.prem_listing_activity;
create policy prem_listing_activity_read_member_or_staff
  on public.prem_listing_activity for select to authenticated
  using (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('staff', 'admin')
    or private.prem_has_active_broker_access(organization_id)
  );

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

drop policy prem_properties_public_staff_or_broker_read on public.properties;
create policy prem_properties_public_staff_or_broker_read
  on public.properties for select to anon, authenticated
  using (
    status = 'published'
    or ((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('staff', 'admin')
    or private.prem_has_active_broker_access(broker_organization_id)
  );

drop policy prem_properties_staff_or_broker_insert on public.properties;
create policy prem_properties_staff_or_broker_insert
  on public.properties for insert to authenticated
  with check (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('staff', 'admin')
    or (
      submitted_by = (select auth.uid())
      and status = 'draft' and verified_at is null and published_at is null
      and private.prem_has_active_broker_access(broker_organization_id)
    )
  );

drop policy prem_properties_staff_or_broker_update on public.properties;
create policy prem_properties_staff_or_broker_update
  on public.properties for update to authenticated
  using (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('staff', 'admin')
    or (status = 'draft' and private.prem_has_active_broker_access(broker_organization_id))
  )
  with check (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('staff', 'admin')
    or (
      status = 'draft' and verified_at is null and published_at is null
      and private.prem_has_active_broker_access(broker_organization_id)
    )
  );
