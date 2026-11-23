-- Phase 2 listing review and merchandising controls.
-- Existing PREM inventory remains public and unchanged through `not_required`.
-- Broker submissions stay drafts until staff reviews and publishes them.

alter table public.properties
  add column review_status text not null default 'not_required'
    check (review_status in ('not_required', 'pending', 'approved', 'rejected')),
  add column rejection_reason text,
  add column reviewed_by uuid references auth.users (id) on delete set null,
  add column reviewed_at timestamptz,
  add column is_featured boolean not null default false;

alter table public.properties
  add constraint properties_review_metadata_consistent check (
    (review_status = 'not_required'
      and rejection_reason is null and reviewed_by is null and reviewed_at is null)
    or (review_status = 'pending'
      and rejection_reason is null and reviewed_by is null and reviewed_at is null)
    or (review_status = 'approved'
      and rejection_reason is null and reviewed_by is not null and reviewed_at is not null)
    or (review_status = 'rejected'
      and char_length(btrim(coalesce(rejection_reason, ''))) between 8 and 500
      and reviewed_by is not null and reviewed_at is not null)
  ),
  add constraint properties_published_review_approved check (
    status <> 'published' or review_status in ('not_required', 'approved')
  );

create index properties_featured_public_idx
  on public.properties (published_at desc)
  where status = 'published' and is_featured;

-- RLS already restricts broker edits to their active organization and drafts.
-- This trigger makes review decisions and featuring staff-controlled even if a
-- broker sends forged columns directly through the Data API.
create or replace function public.prem_enforce_broker_property_rules()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_role text := (select auth.jwt() -> 'app_metadata' ->> 'role');
  v_user_id uuid := (select auth.uid());
begin
  if v_role in ('staff', 'admin') then return new; end if;

  if v_user_id is null or new.broker_organization_id is null
    or not private.prem_has_active_broker_access(new.broker_organization_id) then
    raise exception using errcode = '42501', message = 'Approved broker membership is required.';
  end if;

  if tg_op = 'INSERT' and new.submitted_by is distinct from v_user_id then
    raise exception using errcode = '42501', message = 'A broker must submit listings from their own account.';
  end if;
  if tg_op = 'UPDATE' and (
    new.submitted_by is distinct from old.submitted_by
    or new.broker_organization_id is distinct from old.broker_organization_id
  ) then
    raise exception using errcode = '42501', message = 'Broker listing ownership cannot be changed by a broker.';
  end if;

  if new.status <> 'draft' or new.verified_at is not null or new.published_at is not null then
    raise exception using errcode = '42501', message = 'Brokers can submit drafts only; PREM staff controls verification and publication.';
  end if;

  -- Any broker edit is a new submission for review. Broker input can never
  -- approve, reject, feature, or invent reviewer metadata.
  new.review_status := 'pending';
  new.rejection_reason := null;
  new.reviewed_by := null;
  new.reviewed_at := null;
  if tg_op = 'INSERT' then
    new.is_featured := false;
  else
    new.is_featured := old.is_featured;
  end if;
  return new;
end;
$$;
