-- Prem Housing property catalogue and enquiry foundation.
-- No seed data is included: publish only owner-authorized, verified listings.

create extension if not exists postgis with schema extensions;

create type public.property_type as enum ('residential', 'commercial');
create type public.transaction_type as enum ('sale', 'rent', 'lease');
create type public.property_status as enum ('draft', 'published', 'archived');
create type public.lead_status as enum ('new', 'contacted', 'qualified', 'closed', 'archived');

create table public.localities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  city text not null default 'Mira-Bhayandar',
  region text not null default 'Maharashtra',
  centroid extensions.geography(point, 4326),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint localities_name_nonempty check (length(btrim(name)) > 0)
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  property_type public.property_type not null,
  transaction_type public.transaction_type not null,
  status public.property_status not null default 'draft',
  locality_id uuid not null references public.localities(id) on delete restrict,
  address text,
  location extensions.geography(point, 4326),
  price numeric(14, 2) not null,
  deposit numeric(14, 2),
  area_sqft numeric(10, 2),
  bedrooms smallint,
  bathrooms smallint,
  furnishing text,
  description text,
  gated boolean,
  property_age_years smallint,
  builder text,
  features text[] not null default '{}',
  image_urls text[] not null default '{}',
  source_name text not null,
  source_url text,
  verified_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint properties_title_nonempty check (length(btrim(title)) > 0),
  constraint properties_price_nonnegative check (price >= 0),
  constraint properties_deposit_nonnegative check (deposit is null or deposit >= 0),
  constraint properties_area_positive check (area_sqft is null or area_sqft > 0),
  constraint properties_bedrooms_nonnegative check (bedrooms is null or bedrooms >= 0),
  constraint properties_bathrooms_nonnegative check (bathrooms is null or bathrooms >= 0),
  constraint properties_age_nonnegative check (property_age_years is null or property_age_years >= 0),
  constraint properties_furnishing_valid check (furnishing is null or furnishing in ('unfurnished', 'semi-furnished', 'furnished')),
  constraint properties_source_nonempty check (length(btrim(source_name)) > 0),
  constraint properties_published_is_verified check (status <> 'published' or (verified_at is not null and published_at is not null))
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete set null,
  name text not null,
  phone text not null,
  requirement text not null,
  message text,
  consent_at timestamptz not null,
  consent_text_version text not null,
  status public.lead_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_name_nonempty check (length(btrim(name)) > 0),
  constraint leads_phone_nonempty check (length(btrim(phone)) > 0),
  constraint leads_requirement_nonempty check (length(btrim(requirement)) > 0),
  constraint leads_consent_version_nonempty check (length(btrim(consent_text_version)) > 0)
);

create index properties_public_search_idx
  on public.properties (transaction_type, property_type, price)
  where status = 'published';
create index properties_locality_idx on public.properties (locality_id);
create index properties_location_idx on public.properties using gist (location);
create index localities_centroid_idx on public.localities using gist (centroid);
create index properties_search_text_idx on public.properties using gin (
  to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(address, ''))
);
create index leads_created_at_idx on public.leads (created_at desc);
create index leads_status_idx on public.leads (status, created_at desc);

alter table public.localities enable row level security;
alter table public.properties enable row level security;
alter table public.leads enable row level security;

grant select on public.localities, public.properties to anon, authenticated;
grant insert, update, delete on public.localities, public.properties to authenticated;
grant select, update on public.leads to authenticated;

create policy "Anyone can read localities"
  on public.localities for select
  to anon, authenticated
  using (true);

create policy "Staff can manage localities"
  on public.localities for all
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'staff'))
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'staff'));

create policy "Anyone can read published properties"
  on public.properties for select
  to anon, authenticated
  using (status = 'published');

create policy "Staff can read all properties"
  on public.properties for select
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'staff'));

create policy "Staff can create properties"
  on public.properties for insert
  to authenticated
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'staff'));

create policy "Staff can update properties"
  on public.properties for update
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'staff'))
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'staff'));

create policy "Admins can delete properties"
  on public.properties for delete
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "Staff can read leads"
  on public.leads for select
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'staff'));

create policy "Staff can update leads"
  on public.leads for update
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'staff'))
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'staff'));
