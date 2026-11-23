alter table public.prem_broker_organizations
  drop constraint prem_broker_organizations_contact_phone_check;

alter table public.prem_broker_organizations
  add constraint prem_broker_organizations_contact_phone_check
  check (contact_phone is null or contact_phone ~ '^\+[1-9][0-9]{7,14}$');
