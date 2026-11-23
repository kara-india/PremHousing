-- Run only on isolated PREM Phase 1 Test (wnmmxgnhpojllspcdgds), after
-- Phase 2 migration 20261123114033_prem_phase2_moderation_and_featured.
-- Synthetic rows/users are created inside one transaction and rolled back.
-- Never run on active PremHousing or against real customer/listing data.

begin;

insert into auth.users (
  id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('00000000-0000-4000-8000-000000000601', 'authenticated', 'authenticated', 'phase2-customer@invalid.example', '{}', '{}', now(), now()),
  ('00000000-0000-4000-8000-000000000602', 'authenticated', 'authenticated', 'phase2-broker@invalid.example', '{}', '{}', now(), now()),
  ('00000000-0000-4000-8000-000000000603', 'authenticated', 'authenticated', 'phase2-staff@invalid.example', '{"role":"staff"}', '{}', now(), now()),
  ('00000000-0000-4000-8000-000000000604', 'authenticated', 'authenticated', 'phase2-admin@invalid.example', '{"role":"admin"}', '{}', now(), now());

insert into public.prem_accounts (user_id, account_type, display_name)
values
  ('00000000-0000-4000-8000-000000000601', 'customer', 'Phase 2 Synthetic Customer'),
  ('00000000-0000-4000-8000-000000000602', 'broker', 'Phase 2 Synthetic Broker');

insert into public.localities (id, name, slug)
values ('00000000-0000-4000-8000-000000000605', 'Phase 2 Synthetic Locality', 'phase-2-synthetic-locality');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000602","role":"authenticated"}', true);
select set_config('prem_test.org', public.prem_register_broker_organization(
  'Phase 2 Synthetic Brokerage', 'MAHA-TEST-PHASE2', 'phase2-broker@invalid.example', '+919000000602'
)::text, true);
reset role;

set local role service_role;
select public.prem_admin_review_broker_organization(
  '00000000-0000-4000-8000-000000000604', current_setting('prem_test.org')::uuid,
  'approved', 'Synthetic Phase 2 fixture approval'
);
reset role;

-- A broker cannot self-approve, add a reviewer, or feature a submitted listing.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000602","role":"authenticated"}', true);
do $$
declare v_property_id uuid;
begin
  insert into public.properties (
    title, property_type, transaction_type, status, locality_id, price,
    source_name, submitted_by, broker_organization_id,
    review_status, reviewed_by, reviewed_at, is_featured
  ) values (
    'Synthetic Pending Listing', 'residential', 'sale', 'draft',
    '00000000-0000-4000-8000-000000000605', 1000000,
    'Synthetic broker submission', auth.uid(), current_setting('prem_test.org')::uuid,
    'approved', auth.uid(), now(), true
  ) returning id into v_property_id;
  perform set_config('prem_test.property', v_property_id::text, true);
end;
$$;
do $$
begin
  if not exists (
    select 1 from public.properties
    where id = current_setting('prem_test.property')::uuid
      and review_status = 'pending' and reviewed_by is null and reviewed_at is null
      and rejection_reason is null and is_featured = false and status = 'draft'
  ) then raise exception 'FAIL: broker forged a review or featured field'; end if;
end;
$$;
reset role;

set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
do $$
begin
  if exists (select 1 from public.properties where id = current_setting('prem_test.property')::uuid) then
    raise exception 'FAIL: anon role read a pending broker draft';
  end if;
end;
$$;
reset role;

-- Staff can reject with feedback, but rejection itself never publishes a row.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000603","role":"authenticated","app_metadata":{"role":"staff"}}', true);
update public.properties
set review_status = 'rejected', rejection_reason = 'Synthetic review requires a current owner confirmation.',
    reviewed_by = auth.uid(), reviewed_at = now()
where id = current_setting('prem_test.property')::uuid;
do $$
begin
  if not exists (
    select 1 from public.properties
    where id = current_setting('prem_test.property')::uuid and status = 'draft'
      and review_status = 'rejected' and rejection_reason like 'Synthetic review%'
      and reviewed_by = auth.uid() and reviewed_at is not null
  ) then raise exception 'FAIL: staff rejection feedback was not persisted'; end if;
end;
$$;
reset role;

-- A broker edit resubmits for review and cannot clear the draft gate, feature,
-- or preserve a stale rejection message.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000602","role":"authenticated"}', true);
update public.properties
set title = 'Synthetic Revised Listing', review_status = 'approved', is_featured = true
where id = current_setting('prem_test.property')::uuid;
do $$
begin
  if not exists (
    select 1 from public.properties
    where id = current_setting('prem_test.property')::uuid
      and title = 'Synthetic Revised Listing' and status = 'draft'
      and review_status = 'pending' and rejection_reason is null
      and reviewed_by is null and reviewed_at is null and is_featured = false
  ) then raise exception 'FAIL: broker resubmission did not return to pending'; end if;
end;
$$;
reset role;

-- Staff approval and publication require a trusted reviewer. Staff can feature
-- the listing only after review; public visibility remains published-only.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000603","role":"authenticated","app_metadata":{"role":"staff"}}', true);
update public.properties
set review_status = 'approved', reviewed_by = auth.uid(), reviewed_at = now(),
    status = 'published', verified_at = now(), published_at = now(), is_featured = true
where id = current_setting('prem_test.property')::uuid;
do $$
begin
  if not exists (
    select 1 from public.properties where id = current_setting('prem_test.property')::uuid
      and status = 'published' and review_status = 'approved' and is_featured
  ) then raise exception 'FAIL: staff could not approve and publish'; end if;
end;
$$;
reset role;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000601","role":"authenticated","user_metadata":{"role":"admin"}}', true);
do $$
declare changed_rows integer;
begin
  update public.properties set is_featured = false, review_status = 'rejected'
  where id = current_setting('prem_test.property')::uuid;
  get diagnostics changed_rows = row_count;
  if changed_rows <> 0 then raise exception 'FAIL: customer changed staff-only listing review/featured state'; end if;
end;
$$;
reset role;

insert into public.leads (
  id, property_id, name, phone, requirement, message, consent_at, consent_text_version
)
values (
  '00000000-0000-4000-8000-000000000606', current_setting('prem_test.property')::uuid,
  'Synthetic Customer', '+919000000601', 'Buy a property', 'Synthetic enquiry', now(), 'phase2-test'
);

-- Anonymous/customer roles cannot read or update enquiry PII; staff can update
-- workflow status. User metadata cannot elevate customer privileges.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000601","role":"authenticated","user_metadata":{"role":"admin"}}', true);
do $$
declare changed_rows integer;
begin
  if (select count(*) from public.leads) <> 0 then raise exception 'FAIL: customer read staff-only leads'; end if;
  update public.leads set status = 'contacted' where id = '00000000-0000-4000-8000-000000000606';
  get diagnostics changed_rows = row_count;
  if changed_rows <> 0 then raise exception 'FAIL: customer updated lead status'; end if;
end;
$$;
reset role;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000603","role":"authenticated","app_metadata":{"role":"staff"}}', true);
update public.leads set status = 'contacted' where id = '00000000-0000-4000-8000-000000000606';
do $$
begin
  if not exists (select 1 from public.leads where id = '00000000-0000-4000-8000-000000000606' and status = 'contacted') then
    raise exception 'FAIL: staff could not update lead workflow status';
  end if;
end;
$$;
reset role;

rollback;
