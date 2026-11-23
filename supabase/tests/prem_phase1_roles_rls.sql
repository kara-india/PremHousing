-- Run only on isolated PREM Phase 1 test project wnmmxgnhpojllspcdgds after
-- applying all checked-in Phase 1 migrations, including the MahaRERA requirement.
-- Uses synthetic Auth/listing fixtures in one transaction and rolls everything back.
-- Never run on active PremHousing, BidMetric, or a project containing user data.

begin;

insert into auth.users (
  id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('00000000-0000-4000-8000-000000000501', 'authenticated', 'authenticated', 'phase1-customer@invalid.example', '{}', '{"role":"admin"}', now(), now()),
  ('00000000-0000-4000-8000-000000000502', 'authenticated', 'authenticated', 'phase1-broker-a@invalid.example', '{}', '{}', now(), now()),
  ('00000000-0000-4000-8000-000000000503', 'authenticated', 'authenticated', 'phase1-broker-b@invalid.example', '{}', '{}', now(), now()),
  ('00000000-0000-4000-8000-000000000504', 'authenticated', 'authenticated', 'phase1-staff@invalid.example', '{"role":"staff"}', '{}', now(), now()),
  ('00000000-0000-4000-8000-000000000505', 'authenticated', 'authenticated', 'phase1-admin@invalid.example', '{"role":"admin"}', '{}', now(), now()),
  ('00000000-0000-4000-8000-000000000506', 'authenticated', 'authenticated', 'phase1-agent-a@invalid.example', '{}', '{}', now(), now());

insert into public.prem_accounts (user_id, account_type, display_name)
values
  ('00000000-0000-4000-8000-000000000501', 'customer', 'Synthetic Customer'),
  ('00000000-0000-4000-8000-000000000502', 'broker', 'Synthetic Broker A'),
  ('00000000-0000-4000-8000-000000000503', 'broker', 'Synthetic Broker B'),
  ('00000000-0000-4000-8000-000000000506', 'broker', 'Synthetic Broker Agent');

insert into public.localities (id, name, slug)
values ('00000000-0000-4000-8000-000000000507', 'Phase 1 Synthetic Locality', 'phase-1-synthetic-locality');

-- Customer signup cannot register as a brokerage.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000501","role":"authenticated","user_metadata":{"role":"admin"}}', true);
do $$
begin
  begin
    perform public.prem_register_broker_organization('Customer Org', 'MAHA-TEST-CUSTOMER', null, null);
    raise exception 'FAIL: customer created a broker organization';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;

-- Broker owner registrations are atomic and pending by default.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000502","role":"authenticated"}', true);
do $$
begin
  begin
    perform public.prem_register_broker_organization('Missing Number Brokerage', '   ', 'broker-a@invalid.example', null);
    raise exception 'FAIL: broker registered without a MahaRERA number';
  exception when invalid_parameter_value then null;
  end;
  begin
    perform public.prem_register_broker_organization('Overlong Number Brokerage', repeat('X', 101), 'broker-a@invalid.example', null);
    raise exception 'FAIL: broker registered with an overlong MahaRERA number';
  exception when invalid_parameter_value then null;
  end;
end;
$$;
select set_config('prem_test.org_a', public.prem_register_broker_organization('Synthetic Brokerage A', 'MAHA-TEST-0001', 'broker-a@invalid.example', '+919000000002')::text, true);
do $$
begin
  if (select review_status from public.prem_broker_organizations where id = current_setting('prem_test.org_a')::uuid) <> 'pending' then
    raise exception 'FAIL: new broker organization was not pending';
  end if;
  if (select maharera_number from public.prem_broker_organizations where id = current_setting('prem_test.org_a')::uuid) <> 'MAHA-TEST-0001' then
    raise exception 'FAIL: MahaRERA number was not persisted';
  end if;
  if (select membership_status from public.prem_broker_memberships where organization_id = current_setting('prem_test.org_a')::uuid and user_id = auth.uid()) <> 'pending' then
    raise exception 'FAIL: owner membership was not pending';
  end if;
end;
$$;
reset role;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000503","role":"authenticated"}', true);
select set_config('prem_test.org_b', public.prem_register_broker_organization('Synthetic Brokerage B', 'MAHA-TEST-0002', 'broker-b@invalid.example', '+919000000003')::text, true);
reset role;

-- Pending broker cannot create inventory; customers cannot alter review state.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000502","role":"authenticated"}', true);
do $$
begin
  begin
    insert into public.properties (title, property_type, transaction_type, status, locality_id, price, source_name, submitted_by, broker_organization_id)
    values ('Pending broker must not publish', 'residential', 'sale', 'draft', '00000000-0000-4000-8000-000000000507', 1, 'Synthetic test', auth.uid(), current_setting('prem_test.org_a')::uuid);
    raise exception 'FAIL: pending broker created a listing';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000501","role":"authenticated","user_metadata":{"role":"admin"}}', true);
do $$
begin
  begin
    update public.prem_broker_organizations set review_status = 'approved' where id = current_setting('prem_test.org_a')::uuid;
    raise exception 'FAIL: customer changed organization review state';
  exception when insufficient_privilege then null;
  end;
  if exists (select 1 from public.prem_broker_organizations where id = current_setting('prem_test.org_a')::uuid) then
    raise exception 'FAIL: editable user_metadata.role granted staff visibility';
  end if;
end;
$$;
reset role;

-- Only the server-only RPC can approve brokerage records, and it verifies the
-- actor against persisted app_metadata rather than caller-provided user metadata.
set local role service_role;
do $$
begin
  begin
    perform public.prem_admin_review_broker_organization(
      '00000000-0000-4000-8000-000000000502', current_setting('prem_test.org_a')::uuid, 'approved', 'Synthetic invalid actor test'
    );
    raise exception 'FAIL: non-admin actor approved a brokerage';
  exception when insufficient_privilege then null;
  end;
  perform public.prem_admin_review_broker_organization(
    '00000000-0000-4000-8000-000000000505', current_setting('prem_test.org_a')::uuid, 'approved', 'Synthetic approval fixture'
  );
  perform public.prem_admin_review_broker_organization(
    '00000000-0000-4000-8000-000000000505', current_setting('prem_test.org_b')::uuid, 'approved', 'Synthetic approval fixture'
  );
end;
$$;
reset role;

insert into public.prem_broker_memberships (organization_id, user_id, membership_role, membership_status, reviewed_by, reviewed_at)
values (current_setting('prem_test.org_a')::uuid, '00000000-0000-4000-8000-000000000506', 'agent', 'active', '00000000-0000-4000-8000-000000000505', now());

-- Approved brokers can create drafts only inside their own organization.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000502","role":"authenticated"}', true);
do $$
declare v_property_id uuid;
begin
  insert into public.properties (title, property_type, transaction_type, status, locality_id, price, source_name, submitted_by, broker_organization_id)
  values ('Broker A Synthetic Draft', 'residential', 'sale', 'draft', '00000000-0000-4000-8000-000000000507', 100, 'Synthetic test', auth.uid(), current_setting('prem_test.org_a')::uuid)
  returning id into v_property_id;
  perform set_config('prem_test.property_a', v_property_id::text, true);
end;
$$;
reset role;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000503","role":"authenticated"}', true);
do $$
declare v_property_id uuid;
begin
  insert into public.properties (title, property_type, transaction_type, status, locality_id, price, source_name, submitted_by, broker_organization_id)
  values ('Broker B Synthetic Draft', 'residential', 'rent', 'draft', '00000000-0000-4000-8000-000000000507', 20, 'Synthetic test', auth.uid(), current_setting('prem_test.org_b')::uuid)
  returning id into v_property_id;
  perform set_config('prem_test.property_b', v_property_id::text, true);
  if (select count(*) from public.properties where id = current_setting('prem_test.property_a')::uuid) <> 0 then
    raise exception 'FAIL: broker B saw broker A listing';
  end if;
end;
$$;
reset role;

-- Active agents can collaborate on same-org drafts but cannot reassign or publish.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000506","role":"authenticated"}', true);
do $$
declare changed_rows integer;
begin
  update public.properties set title = 'Broker A Draft Edited by Agent'
    where id = current_setting('prem_test.property_a')::uuid;
  get diagnostics changed_rows = row_count;
  if changed_rows <> 1 then raise exception 'FAIL: active agent could not edit same-org draft'; end if;
  begin
    update public.properties set status = 'published', verified_at = now(), published_at = now()
      where id = current_setting('prem_test.property_a')::uuid;
    raise exception 'FAIL: broker agent published listing';
  exception when insufficient_privilege then null;
  end;
  if (select count(*) from public.prem_listing_activity where organization_id = current_setting('prem_test.org_a')::uuid) < 2 then
    raise exception 'FAIL: broker agent could not see same-org listing activity';
  end if;
end;
$$;
reset role;

-- Staff can see across orgs, edit/publish, and inspect activity, but cannot delete or grant access.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000504","role":"authenticated","app_metadata":{"role":"staff"}}', true);
do $$
declare v_count integer; v_rows integer;
begin
  select count(*) into v_count from public.properties where status = 'draft';
  if v_count <> 2 then raise exception 'FAIL: staff did not see both organizations listings'; end if;
  select count(*) into v_count from public.prem_listing_activity;
  if v_count < 3 then raise exception 'FAIL: staff could not see broker listing activity'; end if;
  update public.properties set status = 'published', verified_at = now(), published_at = now()
    where id = current_setting('prem_test.property_a')::uuid;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then raise exception 'FAIL: staff could not publish broker draft'; end if;
  delete from public.properties where id = current_setting('prem_test.property_b')::uuid;
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'FAIL: staff deleted a property'; end if;
  select count(*) into v_count from public.prem_access_audit;
  if v_count <> 0 then raise exception 'FAIL: non-admin staff read access audit'; end if;
  begin
    insert into public.prem_access_audit (action, actor_user_id, subject_user_id, reason)
    values ('staff_granted', auth.uid(), auth.uid(), 'Synthetic unauthorized audit write');
    raise exception 'FAIL: staff inserted audit record';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;

insert into public.prem_access_audit (action, actor_user_id, subject_user_id, reason)
values ('staff_granted', '00000000-0000-4000-8000-000000000505', '00000000-0000-4000-8000-000000000504', 'Synthetic audit fixture');

-- Customer and anonymous users see published inventory only and no org/audit data.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000501","role":"authenticated","user_metadata":{"role":"admin"}}', true);
do $$
declare v_count integer;
begin
  select count(*) into v_count from public.properties;
  if v_count <> 1 then raise exception 'FAIL: customer read unpublished broker drafts'; end if;
  select count(*) into v_count from public.prem_access_audit;
  if v_count <> 0 then raise exception 'FAIL: customer read access audit'; end if;
  select count(*) into v_count from public.prem_broker_organizations;
  if v_count <> 0 then raise exception 'FAIL: customer read brokerage records'; end if;
end;
$$;
reset role;

set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
do $$
declare v_count integer;
begin
  select count(*) into v_count from public.properties;
  if v_count <> 1 then raise exception 'FAIL: anonymous user read unpublished listings'; end if;
  begin
    select count(*) into v_count from public.prem_broker_organizations;
    raise exception 'FAIL: anonymous user read broker organizations';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000505","role":"authenticated","app_metadata":{"role":"admin"}}', true);
do $$
declare v_count integer; v_rows integer;
begin
  select count(*) into v_count from public.prem_access_audit
    where actor_user_id = '00000000-0000-4000-8000-000000000505';
  if v_count <> 3 then raise exception 'FAIL: trusted admin could not read synthetic access audit'; end if;
  delete from public.properties where id = current_setting('prem_test.property_b')::uuid;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then raise exception 'FAIL: admin could not delete synthetic property'; end if;
end;
$$;
reset role;

rollback;
select 'PASS: isolated Phase 1 customer/broker/agent/staff/admin RLS checks rolled back' as result;
