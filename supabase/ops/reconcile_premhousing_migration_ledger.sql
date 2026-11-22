-- One-time migration-ledger repair for the owner-selected PremHousing project.
-- The schema from 20261120191244_property_inventory_and_leads.sql pre-existed
-- outside Supabase migration tracking. The checked-in migration remains the
-- source of truth; this records that its schema effects were already present.
-- Run only on project ref swrhmpnjyvnascpqdjir, after verifying its schema/RLS.
-- This does not modify application rows or run on BidMetric.

begin;

do $$
declare
  required_objects integer;
  expected_policies integer;
begin
  select count(*) into required_objects
  from (values
    ('public.localities'::regclass),
    ('public.properties'::regclass),
    ('public.leads'::regclass),
    ('public.prem_accounts'::regclass),
    ('supabase_migrations.schema_migrations'::regclass)
  ) as required(relation_oid);

  if required_objects <> 5 then
    raise exception 'PremHousing baseline check failed: expected PREM tables and migration ledger';
  end if;

  select count(*) into expected_policies
  from pg_policies
  where schemaname = 'public'
    and policyname like 'prem\_%' escape '\';

  if expected_policies < 12 then
    raise exception 'PremHousing baseline check failed: expected Phase 0 PREM RLS policies';
  end if;

  if exists (
    select 1 from supabase_migrations.schema_migrations
    where version = '20261120191244'
  ) then
    raise exception 'PremHousing baseline migration is already recorded';
  end if;
end;
$$;

insert into supabase_migrations.schema_migrations (version, name)
values ('20261120191244', 'property_inventory_and_leads');

commit;
