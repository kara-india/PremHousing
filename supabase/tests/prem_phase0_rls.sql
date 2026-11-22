-- Run only on PremHousing test project swrhmpnjyvnascpqdjir after applying
-- 20261122194006_prem_phase0_access_and_accounts.sql and
-- 20261122195230_prem_phase0_policy_performance.sql.
-- Creates only synthetic data inside a transaction and rolls everything back.
-- Do not run this script on BidMetric or any project containing user data.

begin;

insert into auth.users (
  id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('00000000-0000-4000-8000-000000000101', 'authenticated', 'authenticated', 'prem-customer@invalid.example', '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-4000-8000-000000000102', 'authenticated', 'authenticated', 'prem-broker@invalid.example', '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-4000-8000-000000000103', 'authenticated', 'authenticated', 'prem-staff@invalid.example', '{"role":"staff"}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-4000-8000-000000000104', 'authenticated', 'authenticated', 'prem-admin@invalid.example', '{"role":"admin"}'::jsonb, '{}'::jsonb, now(), now()),
  ('00000000-0000-4000-8000-000000000105', 'authenticated', 'authenticated', 'prem-new-customer@invalid.example', '{}'::jsonb, '{}'::jsonb, now(), now());

insert into public.localities (id, name, slug)
values ('00000000-0000-4000-8000-000000000201', 'Synthetic Test Locality', 'synthetic-test-locality');

insert into public.properties (
  id, title, property_type, transaction_type, status, locality_id, price, source_name,
  verified_at, published_at
)
values
  ('00000000-0000-4000-8000-000000000301', 'Synthetic Published Listing', 'residential', 'sale', 'published', '00000000-0000-4000-8000-000000000201', 1000000, 'Synthetic test', now(), now()),
  ('00000000-0000-4000-8000-000000000302', 'Synthetic Draft Listing', 'residential', 'rent', 'draft', '00000000-0000-4000-8000-000000000201', 10000, 'Synthetic test', null, null);

insert into public.leads (
  id, property_id, name, phone, requirement, consent_at, consent_text_version
)
values ('00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-000000000301', 'Synthetic Test Lead', '+910000000000', 'Synthetic test only', now(), 'test-v1');

insert into public.prem_accounts (user_id, account_type, display_name)
values
  ('00000000-0000-4000-8000-000000000101', 'customer', 'Synthetic Customer'),
  ('00000000-0000-4000-8000-000000000102', 'broker', 'Synthetic Broker');

do $$
begin
  if (select broker_approval_status from public.prem_accounts where user_id = '00000000-0000-4000-8000-000000000102') <> 'pending' then
    raise exception 'FAIL: broker account did not default to pending review';
  end if;
end;
$$;

set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
do $$
declare visible_properties integer; visible_localities integer;
begin
  select count(*) into visible_properties from public.properties;
  select count(*) into visible_localities from public.localities;
  if visible_properties <> 1 then raise exception 'FAIL: anon must see only the published listing'; end if;
  if visible_localities <> 1 then raise exception 'FAIL: anon must see public locality'; end if;
  begin
    perform 1 from public.leads;
    raise exception 'FAIL: anon unexpectedly read leads';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.properties (title, property_type, transaction_type, locality_id, price, source_name)
    values ('Anon must not insert', 'residential', 'sale', '00000000-0000-4000-8000-000000000201', 1, 'Synthetic test');
    raise exception 'FAIL: anon unexpectedly inserted a property';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000101","role":"authenticated","app_metadata":{"role":"customer"}}', true);
do $$
declare visible_accounts integer; visible_properties integer; changed_rows integer;
begin
  select count(*) into visible_accounts from public.prem_accounts;
  select count(*) into visible_properties from public.properties;
  if visible_accounts <> 1 then raise exception 'FAIL: customer must see only their own account'; end if;
  if visible_properties <> 1 then raise exception 'FAIL: customer must not see draft listing'; end if;
  update public.prem_accounts set display_name = 'Updated Synthetic Customer'
    where user_id = '00000000-0000-4000-8000-000000000102';
  get diagnostics changed_rows = row_count;
  if changed_rows <> 0 then raise exception 'FAIL: customer changed another account'; end if;
  begin
    update public.prem_accounts set broker_approval_status = 'approved'
      where user_id = '00000000-0000-4000-8000-000000000102';
    raise exception 'FAIL: customer changed broker approval';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.leads (name, phone, requirement, consent_at, consent_text_version)
    values ('Synthetic Lead', '+910000000001', 'Unauthorized', now(), 'test-v1');
    raise exception 'FAIL: customer inserted a lead directly';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000105","role":"authenticated","app_metadata":{"role":"customer"}}', true);
do $$
declare approval_status text;
begin
  insert into public.prem_accounts (user_id, account_type, display_name)
  values ('00000000-0000-4000-8000-000000000105', 'broker', 'Synthetic New Broker');
  select broker_approval_status into approval_status from public.prem_accounts
    where user_id = '00000000-0000-4000-8000-000000000105';
  if approval_status <> 'pending' then raise exception 'FAIL: self-registered broker must be pending'; end if;
  begin
    update public.prem_accounts set broker_approval_status = 'approved'
      where user_id = '00000000-0000-4000-8000-000000000105';
    raise exception 'FAIL: broker self-approved';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.prem_accounts (user_id, account_type, display_name)
    values ('00000000-0000-4000-8000-000000000101', 'customer', 'Impersonated Customer');
    raise exception 'FAIL: customer created another user account';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000103","role":"authenticated","app_metadata":{"role":"staff"}}', true);
do $$
declare visible_properties integer; visible_leads integer; changed_rows integer;
begin
  select count(*) into visible_properties from public.properties;
  select count(*) into visible_leads from public.leads;
  if visible_properties <> 2 then raise exception 'FAIL: staff must see draft and published listings'; end if;
  if visible_leads <> 1 then raise exception 'FAIL: staff must read leads'; end if;
  update public.properties set status = 'published', verified_at = now(), published_at = now()
    where id = '00000000-0000-4000-8000-000000000302';
  get diagnostics changed_rows = row_count;
  if changed_rows <> 1 then raise exception 'FAIL: staff must update/publish listings'; end if;
  delete from public.properties where id = '00000000-0000-4000-8000-000000000302';
  get diagnostics changed_rows = row_count;
  if changed_rows <> 0 then raise exception 'FAIL: staff must not delete listings'; end if;
end;
$$;

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000104","role":"authenticated","app_metadata":{"role":"admin"}}', true);
do $$
declare changed_rows integer;
begin
  delete from public.properties where id = '00000000-0000-4000-8000-000000000302';
  get diagnostics changed_rows = row_count;
  if changed_rows <> 1 then raise exception 'FAIL: admin must be able to delete a listing'; end if;
end;
$$;

rollback;

select 'PASS: isolated synthetic anon/customer/staff/admin RLS checks rolled back' as result;
