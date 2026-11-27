-- DRAFT REFERENCE ONLY — NOT A MIGRATION; DO NOT EXECUTE.
-- This proposal defaults provenance to Google Search, stores unstructured raw data,
-- and defines no RLS policies. It is not approved for the PREM database or data ingestion.
create table public.locality_insights (
  id uuid not null default gen_random_uuid (),
  locality_id uuid not null,
  property_rate_sqft numeric(10, 2) null,
  rental_range_min numeric(10, 2) null,
  rental_range_max numeric(10, 2) null,
  connectivity_notes text null,
  drawbacks text null,
  source_name text not null default 'google_search',
  raw_data jsonb null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint locality_insights_pkey primary key (id),
  constraint locality_insights_locality_id_fkey foreign KEY (locality_id) references public.localities (id) on delete cascade,
  constraint locality_insights_locality_id_key unique (locality_id)
) TABLESPACE pg_default;
