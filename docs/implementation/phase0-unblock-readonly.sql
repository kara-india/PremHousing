-- PREM Phase 0 diagnostic for the selected BidMetric Supabase project.
-- READ ONLY: returns schema/policy metadata and aggregate counts only; no row values or PII.
-- Run in Supabase SQL Editor on the BidMetric project and paste the result sets back.

begin transaction read only;

-- 1) Compare checked-in/local migrations with the database's recorded history.
select version
from supabase_migrations.schema_migrations
order by version;

-- 2) Confirm current relations, relevant property columns, types, and status checks.
select
  to_regclass('public.properties') as properties_relation,
  to_regclass('public.localities') as localities_relation,
  to_regclass('public.prem_accounts') as prem_accounts_relation;

select
  column_name,
  data_type,
  udt_name,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'properties'
  and column_name in (
    'id', 'title', 'type', 'transaction_type', 'status', 'sqft',
    'carpet_area', 'locality', 'city', 'image_urls', 'owner_id'
  )
order by ordinal_position;

select conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.properties'::regclass
  and contype in ('c', 'f')
order by conname;

-- 3) Aggregate value distributions only; no listing text, IDs, addresses, or contacts.
select status, transaction_type, type, count(*) as listing_count
from public.properties
group by status, transaction_type, type
order by status, transaction_type, type;

select
  count(*) as total_properties,
  count(*) filter (where sqft is not null) as has_sqft,
  count(*) filter (where carpet_area is not null) as has_carpet_area,
  count(*) filter (where image_urls is not null and cardinality(image_urls) > 0) as has_image_urls
from public.properties;

-- 4) Confirm RLS and column exposure on shared listing/profile tables.
select n.nspname as schema_name, c.relname as table_name, c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as force_rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('properties', 'profiles', 'agents', 'agent_listings', 'prem_accounts')
order by c.relname;

select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('properties', 'profiles', 'agents', 'agent_listings', 'prem_accounts')
order by tablename, policyname;

select
  has_table_privilege('anon', 'public.properties', 'select') as anon_can_select_properties,
  has_table_privilege('authenticated', 'public.properties', 'select') as authenticated_can_select_properties,
  has_column_privilege('anon', 'public.properties', 'owner_id', 'select') as anon_can_select_owner_id,
  has_column_privilege('anon', 'public.properties', 'agent_commission', 'select') as anon_can_select_commission;

commit;

-- Still required after this diagnostic:
-- 1) Confirm whether BidMetric `status='active'` means PREM-approved and public.
-- 2) Confirm which area field is displayed (built-up sqft or carpet_area).
-- 3) Supply an isolated Supabase/Postgres test target. Do not run the draft migration
--    against the active production project as a substitute for RLS verification.
