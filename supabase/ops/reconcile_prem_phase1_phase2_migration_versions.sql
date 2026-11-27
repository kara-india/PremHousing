-- Reconcile Supabase MCP-generated migration timestamps with the canonical
-- versions in supabase/migrations. The MCP apply_migration tool records a
-- server-generated version while preserving the supplied migration filename
-- in `name`; Supabase CLI compares versions only, so db push would otherwise
-- try to re-run schema changes already applied.
--
-- Safe to run only on PREM databases where all nine Phase 1/2 migration names
-- below already exist in supabase_migrations.schema_migrations. This updates
-- migration metadata only; it does not change application schema or rows.

begin;

do $$
declare
  matched_rows integer;
  version_conflicts integer;
begin
  with expected(name, canonical_version) as (
    values
      ('20261123055336_prem_phase1_broker_roles', '20261123055336'),
      ('20261123055841_prem_phase1_security_tuning', '20261123055841'),
      ('20261123060102_prem_phase1_broker_team_access', '20261123060102'),
      ('20261123060424_prem_phase1_contact_phone_check', '20261123060424'),
      ('20261123060732_prem_phase1_policy_helpers', '20261123060732'),
      ('20261123060942_prem_phase1_admin_review_path', '20261123060942'),
      ('20261123070136_phase1_require_maharera_number', '20261123070136'),
      ('phase1_require_maharera_number', '20261123070136'),
      ('20261123114033_prem_phase2_moderation_and_featured', '20261123114033'),
      ('prem_phase2_moderation_and_featured', '20261123114033'),
      ('20261123114513_prem_phase2_review_metadata_index', '20261123114513'),
      ('prem_phase2_review_metadata_index', '20261123114513')
  )
  select count(*) into matched_rows
  from expected e
  join supabase_migrations.schema_migrations m on m.name = e.name;

  if matched_rows <> 9 then
    raise exception 'Expected exactly nine Phase 1/2 migration history rows; found %', matched_rows;
  end if;

  with expected(name, canonical_version) as (
    values
      ('20261123055336_prem_phase1_broker_roles', '20261123055336'),
      ('20261123055841_prem_phase1_security_tuning', '20261123055841'),
      ('20261123060102_prem_phase1_broker_team_access', '20261123060102'),
      ('20261123060424_prem_phase1_contact_phone_check', '20261123060424'),
      ('20261123060732_prem_phase1_policy_helpers', '20261123060732'),
      ('20261123060942_prem_phase1_admin_review_path', '20261123060942'),
      ('20261123070136_phase1_require_maharera_number', '20261123070136'),
      ('phase1_require_maharera_number', '20261123070136'),
      ('20261123114033_prem_phase2_moderation_and_featured', '20261123114033'),
      ('prem_phase2_moderation_and_featured', '20261123114033'),
      ('20261123114513_prem_phase2_review_metadata_index', '20261123114513'),
      ('prem_phase2_review_metadata_index', '20261123114513')
  )
  select count(*) into version_conflicts
  from supabase_migrations.schema_migrations existing
  where existing.version in (select canonical_version from expected)
    and not exists (
      select 1 from expected e
      where e.canonical_version = existing.version and e.name = existing.name
    );

  if version_conflicts <> 0 then
    raise exception 'Canonical migration versions already belong to other rows; no history was changed';
  end if;
end;
$$;

with expected(name, canonical_version) as (
  values
    ('20261123055336_prem_phase1_broker_roles', '20261123055336'),
    ('20261123055841_prem_phase1_security_tuning', '20261123055841'),
    ('20261123060102_prem_phase1_broker_team_access', '20261123060102'),
    ('20261123060424_prem_phase1_contact_phone_check', '20261123060424'),
    ('20261123060732_prem_phase1_policy_helpers', '20261123060732'),
    ('20261123060942_prem_phase1_admin_review_path', '20261123060942'),
    ('20261123070136_phase1_require_maharera_number', '20261123070136'),
    ('phase1_require_maharera_number', '20261123070136'),
    ('20261123114033_prem_phase2_moderation_and_featured', '20261123114033'),
    ('prem_phase2_moderation_and_featured', '20261123114033'),
    ('20261123114513_prem_phase2_review_metadata_index', '20261123114513'),
    ('prem_phase2_review_metadata_index', '20261123114513')
)
update supabase_migrations.schema_migrations m
set version = e.canonical_version
from expected e
where m.name = e.name
  and m.version <> e.canonical_version;

do $$
declare
  mismatched_rows integer;
begin
  select count(*) into mismatched_rows
  from supabase_migrations.schema_migrations m
  where m.name in (
    '20261123055336_prem_phase1_broker_roles',
    '20261123055841_prem_phase1_security_tuning',
    '20261123060102_prem_phase1_broker_team_access',
    '20261123060424_prem_phase1_contact_phone_check',
    '20261123060732_prem_phase1_policy_helpers',
    '20261123060942_prem_phase1_admin_review_path',
    '20261123070136_phase1_require_maharera_number',
    'phase1_require_maharera_number',
    '20261123114033_prem_phase2_moderation_and_featured',
    'prem_phase2_moderation_and_featured',
    '20261123114513_prem_phase2_review_metadata_index',
    'prem_phase2_review_metadata_index'
  )
  and m.version not in (
    '20261123055336', '20261123055841', '20261123060102',
    '20261123060424', '20261123060732', '20261123060942',
    '20261123070136', '20261123114033', '20261123114513'
  );

  if mismatched_rows <> 0 then
    raise exception 'Migration history reconciliation left % mismatched rows', mismatched_rows;
  end if;
end;
$$;

commit;
