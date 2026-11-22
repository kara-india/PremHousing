-- PREM Phase 0 policy/index tuning for PremHousing.
-- Keep trusted JWT evaluation statement-scoped and avoid overlapping SELECT
-- policies. The new FK index supports lead-to-property joins and deletes.

drop policy if exists "Anyone can read localities" on public.localities;
drop policy if exists "Staff can manage localities" on public.localities;
drop policy if exists "Anyone can read published properties" on public.properties;
drop policy if exists "Staff can read all properties" on public.properties;
drop policy if exists "Staff can create properties" on public.properties;
drop policy if exists "Staff can update properties" on public.properties;
drop policy if exists "Admins can delete properties" on public.properties;
drop policy if exists "Staff can read leads" on public.leads;
drop policy if exists "Staff can update leads" on public.leads;

drop policy if exists prem_localities_staff_manage on public.localities;

create policy prem_localities_staff_insert
  on public.localities for insert to authenticated
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('staff', 'admin'));

create policy prem_localities_staff_update
  on public.localities for update to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('staff', 'admin'))
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('staff', 'admin'));

create policy prem_localities_staff_delete
  on public.localities for delete to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('staff', 'admin'));

drop policy if exists prem_properties_public_published_read on public.properties;
drop policy if exists prem_properties_staff_read_all on public.properties;

create policy prem_properties_public_or_staff_read
  on public.properties for select to anon, authenticated
  using (
    status = 'published'
    or ((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('staff', 'admin')
  );

drop policy if exists prem_properties_staff_insert on public.properties;
create policy prem_properties_staff_insert
  on public.properties for insert to authenticated
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('staff', 'admin'));

drop policy if exists prem_properties_staff_update on public.properties;
create policy prem_properties_staff_update
  on public.properties for update to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('staff', 'admin'))
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('staff', 'admin'));

drop policy if exists prem_properties_admin_delete on public.properties;
create policy prem_properties_admin_delete
  on public.properties for delete to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists prem_leads_staff_read on public.leads;
create policy prem_leads_staff_read
  on public.leads for select to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('staff', 'admin'));

drop policy if exists prem_leads_staff_update on public.leads;
create policy prem_leads_staff_update
  on public.leads for update to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('staff', 'admin'))
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('staff', 'admin'));

create index if not exists leads_property_id_idx on public.leads (property_id);
