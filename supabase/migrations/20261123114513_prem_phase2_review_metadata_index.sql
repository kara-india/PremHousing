-- Cover reviewer lookups and parent-side referential checks for reviewed listings.
create index properties_reviewed_by_idx
  on public.properties (reviewed_by)
  where reviewed_by is not null;
