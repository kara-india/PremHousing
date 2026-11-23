-- Server-only atomic broker approval path. The Edge Function validates the
-- caller JWT; this function independently checks the persisted trusted claim.
create or replace function public.prem_admin_review_broker_organization(
  p_actor_id uuid,
  p_organization_id uuid,
  p_review_status text,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_role text;
  v_owner_id uuid;
  v_old_status text;
  v_action text;
  v_membership_status text;
begin
  select raw_app_meta_data ->> 'role' into v_actor_role
    from auth.users where id = p_actor_id;
  if v_actor_role is distinct from 'admin' then
    raise exception using errcode = '42501', message = 'Trusted PREM admin role required.';
  end if;
  if p_review_status not in ('approved', 'rejected', 'suspended') then
    raise exception using errcode = '22023', message = 'Unsupported broker review status.';
  end if;
  if char_length(btrim(coalesce(p_reason, ''))) not between 8 and 500 then
    raise exception using errcode = '22023', message = 'A review reason between 8 and 500 characters is required.';
  end if;
  select created_by, review_status into v_owner_id, v_old_status
    from public.prem_broker_organizations where id = p_organization_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'Broker organization not found.';
  end if;
  update public.prem_broker_organizations
    set review_status = p_review_status, reviewed_by = p_actor_id,
        reviewed_at = pg_catalog.now(), updated_at = pg_catalog.now()
    where id = p_organization_id;
  v_membership_status := case when p_review_status = 'approved' then 'active' else p_review_status end;
  update public.prem_broker_memberships
    set membership_status = v_membership_status, reviewed_by = p_actor_id,
        reviewed_at = pg_catalog.now()
    where organization_id = p_organization_id;
  update public.prem_accounts
    set broker_approval_status = p_review_status
    where user_id = v_owner_id and account_type = 'broker';
  v_action := case
    when p_review_status = 'approved' and v_old_status in ('rejected', 'suspended') then 'broker_reactivated'
    when p_review_status = 'approved' then 'broker_approved'
    when p_review_status = 'rejected' then 'broker_rejected'
    else 'broker_suspended'
  end;
  insert into public.prem_access_audit (action, actor_user_id, subject_user_id, organization_id, reason)
    values (v_action, p_actor_id, v_owner_id, p_organization_id, btrim(p_reason));
end;
$$;

revoke all on function public.prem_admin_review_broker_organization(uuid, uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.prem_admin_review_broker_organization(uuid, uuid, text, text)
  to service_role;
