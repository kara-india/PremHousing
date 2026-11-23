-- Correct Phase 1 RLS/advisor findings on the isolated PREM test target.

-- Make public broker registration run with caller privileges and narrow RLS.
alter function public.prem_register_broker_organization(text, text, text) security invoker;
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

grant insert (name, contact_email, contact_phone, created_by)
  on public.prem_broker_organizations to authenticated;
grant insert (organization_id, user_id, membership_role)
  on public.prem_broker_memberships to authenticated;

create policy prem_broker_organizations_insert_own_pending
  on public.prem_broker_organizations for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and review_status = 'pending'
    and exists (
      select 1 from public.prem_accounts a
      where a.user_id = (select auth.uid()) and a.account_type = 'broker'
    )
  );

create policy prem_broker_memberships_insert_own_pending_owner
  on public.prem_broker_memberships for insert to authenticated
  with check (
    user_id = (select auth.uid()) and membership_role = 'owner' and membership_status = 'pending'
    and exists (
      select 1 from public.prem_broker_organizations o
      where o.id = organization_id and o.created_by = (select auth.uid()) and o.review_status = 'pending'
    )
  );

-- Broker review runs only inside the trusted admin Edge Function, which uses the
-- server-only Supabase key. Remove the authenticated SECURITY DEFINER RPC.
drop function if exists public.prem_admin_review_broker_organization(uuid, text, text);

-- Admins can read audit history; clients cannot create or change audit entries.
grant select on public.prem_access_audit to authenticated;
create policy prem_access_audit_admin_read
  on public.prem_access_audit for select to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- Cover foreign keys used for staff review, account deletion, and activity queries.
create index prem_broker_organizations_reviewed_by_idx
  on public.prem_broker_organizations (reviewed_by);
create index prem_broker_memberships_reviewed_by_idx
  on public.prem_broker_memberships (reviewed_by);
create index prem_access_audit_actor_user_idx on public.prem_access_audit (actor_user_id);
create index prem_access_audit_subject_user_idx on public.prem_access_audit (subject_user_id);
create index prem_access_audit_org_idx on public.prem_access_audit (organization_id);
create index prem_listing_activity_actor_user_idx on public.prem_listing_activity (actor_user_id);
create index properties_submitted_by_idx on public.properties (submitted_by);

-- Combine staff and broker write policies to avoid duplicate permissive checks.
drop policy prem_properties_staff_insert on public.properties;
drop policy prem_properties_broker_draft_insert on public.properties;
create policy prem_properties_staff_or_broker_insert
  on public.properties for insert to authenticated
  with check (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('staff', 'admin')
    or (
      submitted_by = (select auth.uid())
      and status = 'draft' and verified_at is null and published_at is null
      and private.prem_has_active_broker_access(properties.broker_organization_id)
    )
  );

drop policy prem_properties_staff_update on public.properties;
drop policy prem_properties_broker_draft_update on public.properties;
create policy prem_properties_staff_or_broker_update
  on public.properties for update to authenticated
  using (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('staff', 'admin')
    or (
      status = 'draft'
      and private.prem_has_active_broker_access(properties.broker_organization_id)
    )
  )
  with check (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('staff', 'admin')
    or (
      status = 'draft'
      and verified_at is null and published_at is null
      and private.prem_has_active_broker_access(properties.broker_organization_id)
    )
  );
