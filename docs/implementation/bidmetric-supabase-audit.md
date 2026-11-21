# BidMetric Supabase audit for PREM

Audit date: 2026-11-22. Read-only inspection; no user rows were queried and no schema changes were made.

## Product and repository decisions

- Product brand: **PREM — Property & Real Estate Market**.
- Source Git repository: `kara-india/PremHousing` only. Estazo (`kara-india/estazo`) is a concept/research reference; its repository has no detected license, so its code and assets are not cleared for reuse.
- Selected backend: existing BidMetric Supabase project `iwgopllwmpesnpsnqlwn`, region `ap-southeast-2`, Postgres 17, status `ACTIVE_HEALTHY`.
- The ignored local `.env.local` now uses the Vite names `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. The publishable key is not committed. This repository's client reads `VITE_*`, not `NEXT_PUBLIC_*`.

## Existing schema and fit

BidMetric already has 29 public tables and migration history through version 018. Its schema includes `properties`, `agents`, `agent_listings`, `buyer_requests`, `leads`, `market_trends`, boosts, bidding, builder, and audit/billing entities. This is an established database, not a blank test project.

The current PREM/Vite app is **not schema-compatible yet**. It requests a `localities` table, which is absent from the inspected public schema. Its property UI expects a locality relationship and fields such as `property_type`, `bedrooms`, `area_sqft`, `image_urls`, and published status. BidMetric's `properties` table instead has its own shape (`type`, `sqft`, `lat`/`lng`, and valuation fields). Do not run the current UI against this project as if the schemas matched; first map app queries to the intended BidMetric tables or design additive PREM entities that do not collide with them.

### PREM query-to-table mapping

| PREM capability | Candidate BidMetric source | Mismatch / decision needed |
|---|---|---|
| Public inventory search/detail | `properties` | Candidate fields include title, price, bedrooms, bathrooms, image URLs, text locality, coordinates, and valuation. PREM expects `localities` join, `locality_id`, `property_type`, `area_sqft`, `deposit`, `furnishing`, `features`, verification timestamp, and `status='published'`. BidMetric uses `type`, `sqft`, text `locality`, no locality FK, and status values `active/sold/pending`; transaction values are `Sale/Rent/Lease`. A read adapter or reviewed additive schema is required. |
| Agent/broker listings | `agent_listings` joined to `agents` | Separate shape (`agent_id`, title, price, text location, `attrs`, images, status/boost metrics). `agent_listings.agent_id` references `agents.id`; `agents.owner_id` references Auth users. Decide how these listings join into the public inventory. |
| Leads and visits | `buyer_requests`, `leads`, `site_visits` | Existing entities carry buyer contact, visit preferences, UTM or lead lifecycle fields, but their access rules are not ready for PREM use. PREM currently keeps the enquiry in WhatsApp and has no direct lead insert. |
| Future predictions | `market_trends` and valuation columns on `properties` | Structurally promising; historical adequacy and provenance are unknown. Keep prediction details private until reviewed. |
| Locality filters/admin | No `localities` table found | Use `properties.locality` as text only for a first read-only mapping, or add a normalized locality directory after deciding migration strategy. Current locality CRUD cannot run against BidMetric. |

### Auth and authorization mapping

- `public.profiles.id` references `auth.users.id`; `profiles.role` is enum `user_role` with `buyer`, `rera_seller`, and `channel_partner`. There is no `staff` or `admin` value.
- Current PREM admin checks trusted `auth.users.app_metadata.role` for `staff/admin`. Do not replace that with `profiles.role`: the `profiles` own-row UPDATE policy and column grants permit authenticated users to update `role`, with no protecting trigger found in the metadata inspection.
- `profiles` also has a public SELECT policy and anon SELECT grants for `phone`, `email`, and `office_address`; do not use this as a public profile API.
- `agents.owner_id` references `auth.users`, but the agent self-update policy checks `auth.uid() = agents.id` rather than the owner FK. Broad update grants include fields such as verification/status/admin notes; this needs a tested least-privilege policy.
- The public active-listing policy on `properties` applies to rows, not columns. Current anon SELECT grants include owner/contact, commission, and valuation fields; a public projection/view or column-level restrictions are needed before connecting the public PREM UI.
- `agent_listings` has a public active-listing read policy and an insert policy using `auth.uid() = agent_id`, although `agent_id` is an FK to `agents.id`; validate the intended ownership relationship before reuse.

Prediction-related data structures exist: `properties` includes valuation/market/comparable prices, confidence interval, bounds, last-updated time, and factor fields; `market_trends` stores location, property type, date, average price per square foot, and transaction count. Their provenance, history depth, quality, coverage, and authorization have not been assessed. These fields are candidates for PREM's future prediction experience, not evidence that reliable predictions can be launched now.

## Security findings requiring review before public app use

Supabase Security Advisor reported `rls_disabled_in_public` at **ERROR** for 12 exposed tables:

`anti_leak_registry`, `assisted_closings`, `audit_logs`, `billing_events`, `builder_agreements`, `builder_projects`, `builder_wallets`, `builders`, `lead_pricing_config`, `loan_attachments`, `project_inventory`, and `site_visits`.

Read-only privilege inspection confirmed `anon` and `authenticated` have table-level `SELECT` grants across the public tables. RLS is disabled on those 12 tables. Treat their Data API access as potentially unrestricted until inspected and remediated. The advisor also reported 29 tables visible to anon and authenticated through GraphQL; three `SECURITY DEFINER` functions callable by anon/authenticated (`accept_bid`, `log_audit_event`, `place_bid`); five functions without a fixed search path; and leaked-password protection disabled.

Do not blanket-enable RLS or revoke grants on the live project without reviewing intended access and application dependencies: that may break BidMetric. The next security task should inspect each affected table's purpose, consumers, and data sensitivity, then prepare a least-privilege migration and validate it on an isolated branch/local stack. Until then, avoid storing PREM customer data or exposing these tables through the PREM client.

## Next integration steps

1. Map each PREM screen/query to existing BidMetric tables and identify missing locality/listing relations.
2. Select one source of truth for identities and roles; reconcile the current PREM `app_metadata.role` check with BidMetric's `profiles.role` and agent tables.
3. Review the 12 RLS-disabled tables, table grants, policies, and exposed definer functions; prepare a least-privilege remediation plan.
4. Establish isolated verification (local Supabase with Docker, or an owner-approved development branch). The selected BidMetric project itself is not a test database.
5. Assess provenance and sufficiency of `market_trends` and valuation fields before building public predictions.

Supabase guidance: [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security), [custom claims and RBAC](https://supabase.com/docs/guides/api/custom-claims-and-role-based-access-control-rbac), [local migrations](https://supabase.com/docs/guides/local-development/database-migrations).
