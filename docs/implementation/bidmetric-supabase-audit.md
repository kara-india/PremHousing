# BidMetric Supabase audit for PREM

Audit date: 2026-11-22. The initial schema/security inspection was read-only and queried no user rows. A security migration was later applied to the active project at the owner's request; the changes and post-apply checks are recorded below.

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

### Phase 1.1 auth decision record

- **Identity source:** keep Supabase Auth `auth.users.id` as the canonical identity. `profiles.id` is the one-to-one profile key; `agents.owner_id` refers to the Auth user. Do not create a second PREM password/identity store.
- **Role boundary:** retain trusted server-managed `app_metadata.role` for PREM staff/admin authorization while the current UI uses it. Set these claims only through a trusted Admin API/server path. Never authorize from client-editable `user_metadata`. Do not use BidMetric's `profiles.role` for staff, admin, or broker authorization: its current enum is only `buyer`, `rera_seller`, `channel_partner`, and authenticated clients have UPDATE privilege on the role column.
- **Owner decision:** staff, customers, and brokers can choose email, mobile, or Google/Gmail sign-in. First login asks whether the account is a customer or broker and captures minimal basic details; incomplete profiles can be completed later. Staff can view, edit, and publish broker listings/activity across organizations. Public browsing remains anonymous.
- **Credential handling:** email/password credentials and provider identities belong in Supabase Auth (`auth.users`/identity system), never in a public PREM profile table and never as plaintext. Store only required onboarding/profile fields in PREM tables; use Auth as the source for verified email/phone. The “Remember me” option controls client session persistence, not account privilege.
- **Onboarding and role boundary:** first-login onboarding may self-select only customer or broker. Do not offer staff/admin in the public role selector; assign staff/admin through a trusted PREM admin/server path. Broker accounts remain pending approval and receive no cross-organization access until mapped to an approved organization membership. Keep account type/role immutable from client updates after onboarding; account changes need a trusted path. If one person adds another sign-in method, verify/link it to the same Auth user to avoid duplicate accounts.
- **Access matrix:** anonymous users browse approved public listings only; customers read their own profile and consented/owned activity; brokers read their organization's listings and authorized assignments; staff can read, edit, and publish broker listings/activity across organizations. Keep customer PII limited to operational need/assignment. Admin-only deletion remains the existing behavior unless separately changed.
- **Existing UI gap:** `AdminDashboard.jsx` currently allows both `staff` and `admin` to create/edit/publish properties, while only `admin` can delete. Staff's listing edit/publish rights now match the owner's direction, but the dashboard still uses PREM's legacy `properties` shape and is not integrated with broker organizations/activity. Phase 1.2/2 must align both UI and RLS with the cross-organization staff requirement.
- **Connector limitation:** the connected Supabase tools expose project/database operations but not the Auth provider toggle settings. Current active provider settings were not verified in this task. Confirm them in Supabase Dashboard before changing Auth configuration. Phone/SMS credentials and Google OAuth credentials were not provided in the project context.
- **Broker boundary:** when broker accounts are approved, map each Auth user to broker organization/membership records and keep verification, organization status, and staff privileges server-managed. `agents` is not a trusted role source; its current `owner_id` mapping and update policy need repair before reuse.
- **Remaining implementation decisions:** email sign-in is planned as password-based and phone as OTP; confirm this assumption if the owner prefers magic-link/OTP email or phone/password. Provider settings and credentials must be configured before enabling these flows.

Official Supabase references: [Auth users and identities](https://supabase.com/docs/guides/auth/users), [password-based email or phone Auth](https://supabase.com/docs/guides/auth/passwords), [redirect URL configuration](https://supabase.com/docs/guides/auth/redirect-urls), and [custom claims/RBAC](https://supabase.com/docs/guides/api/custom-claims-and-role-based-access-control-rbac).

The implementation sequence, session behavior, first-login state model, and proposed PREM onboarding record are in [`auth-onboarding-plan.md`](auth-onboarding-plan.md). No Auth provider setting or onboarding schema has been changed yet.

Prediction-related data structures exist: `properties` includes valuation/market/comparable prices, confidence interval, bounds, last-updated time, and factor fields; `market_trends` stores location, property type, date, average price per square foot, and transaction count. Their provenance, history depth, quality, coverage, and authorization have not been assessed. These fields are candidates for PREM's future prediction experience, not evidence that reliable predictions can be launched now.

## Security findings requiring review before public app use

Supabase Security Advisor reported `rls_disabled_in_public` at **ERROR** for 12 exposed tables:

`anti_leak_registry`, `assisted_closings`, `audit_logs`, `billing_events`, `builder_agreements`, `builder_projects`, `builder_wallets`, `builders`, `lead_pricing_config`, `loan_attachments`, `project_inventory`, and `site_visits`.

Read-only privilege inspection confirmed `anon` and `authenticated` have table-level `SELECT` grants across the public tables. RLS is disabled on those 12 tables. Treat their Data API access as potentially unrestricted until inspected and remediated. The advisor also reported 29 tables visible to anon and authenticated through GraphQL; three `SECURITY DEFINER` functions callable by anon/authenticated (`accept_bid`, `log_audit_event`, `place_bid`); five functions without a fixed search path; and leaked-password protection disabled.

### First-pass remediation applied 2026-11-22

The owner authorized applying necessary database changes to BidMetric. Supabase branching was unavailable on the current plan and this workstation has no Docker/Postgres runtime, so changes were applied as one versioned migration and verified by read-only metadata queries afterward. No user rows were read or changed.

- Enabled RLS and revoked all `PUBLIC`, `anon`, and `authenticated` table privileges on the 12 previously exposed tables above. These tables have no client policies; trusted server operations retain their existing owner/service-role path.
- Restricted `bids` reads to non-identifying auction fields and removed direct client writes. `place_bid` now requires an authenticated non-owner, an active property, and a positive amount above the current price. `accept_bid` now requires the authenticated property owner and a placed bid belonging to that property.
- Revoked anon RPC access to `place_bid` and `accept_bid`; `log_audit_event` is trigger-only. Fixed the search path on the audited functions.
- Post-apply metadata checks confirmed RLS enabled and no client table privileges on all 12 tables; `anon` cannot execute the bid RPCs, while `authenticated` can. Project status remained `ACTIVE_HEALTHY`.

The advisor now reports the 12 locked tables as informational RLS-enabled/no-policy findings. It still reports broad access on `profiles`, `agents`, and `properties`, intentional auction RPCs as authenticated `SECURITY DEFINER` functions, GraphQL visibility for public client-readable tables, and leaked-password protection disabled. These remaining findings need a separate compatibility review before connecting PREM account, listing, or prediction flows. Isolated verification remains pending.

## Next integration steps

1. Map each PREM screen/query to existing BidMetric tables and identify missing locality/listing relations.
2. Select one source of truth for identities and roles; reconcile the current PREM `app_metadata.role` check with BidMetric's `profiles.role` and agent tables.
3. Complete the remaining column/role hardening for `profiles`, `agents`, and `properties` without breaking existing BidMetric clients; enable leaked-password protection in Auth settings.
4. Establish isolated verification (local Supabase with Docker or a development branch when plan access permits). The live-project metadata checks do not replace isolated verification.
5. Map current PREM queries to BidMetric's actual schema before connecting the UI; preserve the current mismatch notes above.
6. Assess provenance and sufficiency of `market_trends` and valuation fields before building public predictions.

Supabase guidance: [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security), [custom claims and RBAC](https://supabase.com/docs/guides/api/custom-claims-and-role-based-access-control-rbac), [local migrations](https://supabase.com/docs/guides/local-development/database-migrations).

## 2026-11-23 consolidation decision

The owner selected PremHousing (`swrhmpnjyvnascpqdjir`) as PREM's only Supabase database for now. BidMetric (`iwgopllwmpesnpsnqlwn`) was inspected read-only to decide whether useful schema, data, or files should be migrated. Both projects were confirmed `ACTIVE_HEALTHY` in the same organization and region.

| Inventory | BidMetric source | PremHousing target |
|---|---:|---:|
| Public tables | 29 | 4 |
| Public functions | 12 | 2 |
| Recorded migrations | 18 | 3 |
| Auth users | 3 | 0 |
| Storage buckets / objects | 0 / 0 | 0 / 0 |
| Public table rows | 0 | 0 |

No public-table rows or Storage files are available to transfer. The three BidMetric Auth accounts were not copied. Supabase documents that Auth identities, including password hashes, can be moved through a project backup/restore or SQL export/import ([Auth migration guide](https://supabase.com/kb/troubleshooting/migrating-auth-users-between-projects)); this connector does not provide a secure cross-project backup/restore flow, and no database credentials were available for a controlled dump/restore. Do not copy account rows as ordinary application data or reuse BidMetric's JWT secret: existing sessions should be invalidated and users should authenticate again. Until a supported transfer path is available, the accounts remain only in BidMetric; if they are needed in PREM, they must be re-created or migrated through Supabase's supported Auth/database backup process.

No BidMetric public schema or migrations were replayed. The source `properties` and `leads` tables conflict with PremHousing's native tables and differ in enums, locality relationships, row lifecycle, and ownership. The archived hardening migration also depends on BidMetric-only tables and functions; replaying it would fail or change the wrong security boundary. BidMetric broker/agent structures are not accepted as PREM's authorization source because the audited role and owner mappings are unsafe for that purpose.

The useful product direction is carried forward as PREM requirements: transparent valuation research, time-series forecasting with feedback from verified actuals, and broker activity oversight by trusted staff. These are already documented in [`forecasting-feedback-plan.md`](forecasting-feedback-plan.md), [`auth-onboarding-plan.md`](auth-onboarding-plan.md), and the master worklist. Forecast tables and model data are intentionally not created yet: source provenance, historical coverage, and forecast sufficiency have not been verified. PremHousing's own migration ledger is therefore correctly different from BidMetric's; there are no pending public-schema or application-data migrations for Phase 0. Preserving the three Auth accounts is the sole remaining consolidation decision.

This was an inventory and disposition only. Neither project was paused, deleted, or modified by the consolidation check.
