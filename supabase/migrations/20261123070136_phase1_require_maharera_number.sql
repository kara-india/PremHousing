-- Require broker applicants to submit a MahaRERA registration number.
-- The value is treated as opaque text; validity is confirmed during staff review.

alter table public.prem_broker_organizations
  add column maharera_number text not null
    check (char_length(btrim(maharera_number)) between 4 and 100);

drop function if exists public.prem_register_broker_organization(text, text, text);

create function public.prem_register_broker_organization(
  p_name text,
  p_maharera_number text,
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
  v_maharera_number text := btrim(coalesce(p_maharera_number, ''));
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'Authentication required.';
  end if;
  if char_length(v_maharera_number) not between 4 and 100 then
    raise exception using errcode = '22023', message = 'A valid MahaRERA registration number is required.';
  end if;
  select account_type into v_account_type
    from public.prem_accounts where user_id = v_user_id;
  if v_account_type is distinct from 'broker' then
    raise exception using errcode = '42501', message = 'A broker account is required.';
  end if;
  if exists (select 1 from public.prem_broker_organizations where created_by = v_user_id) then
    raise exception using errcode = '23505', message = 'A brokerage organization is already registered for this account.';
  end if;
  insert into public.prem_broker_organizations (name, maharera_number, contact_email, contact_phone, created_by)
    values (btrim(p_name), v_maharera_number, nullif(btrim(p_contact_email), ''), nullif(btrim(p_contact_phone), ''), v_user_id)
    returning id into v_organization_id;
  insert into public.prem_broker_memberships (organization_id, user_id, membership_role)
    values (v_organization_id, v_user_id, 'owner');
  return v_organization_id;
end;
$$;

revoke all on function public.prem_register_broker_organization(text, text, text, text) from public, anon;
grant execute on function public.prem_register_broker_organization(text, text, text, text) to authenticated;
grant insert (name, maharera_number, contact_email, contact_phone, created_by)
  on public.prem_broker_organizations to authenticated;
