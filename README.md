# PREM — Property & Real Estate Market

PREM is a React + Vite real-estate discovery and enquiry app for Mira-Bhayandar. It supports public property search, verified listing details, customer/broker accounts, and staff-managed inventory.

## Current features

- Responsive public landing page and Buy, Rent, Sell, and Commercial enquiry flows.
- Supabase-backed search over published property records, with locality, price, deposit, BHK, area, and furnishing filters.
- Published-only property detail pages.
- Email/password sign-in, password recovery, mobile OTP and Google OAuth UI, Remember me/session-only storage, and resumable customer/broker onboarding.
- Protected `/admin`, `/onboarding`, and `/account` routes. Staff access uses trusted Supabase `app_metadata.role`; staff can manage and publish listings, while deletion is admin-only.
- No fabricated live properties or unverifiable inventory counts. A read-only aggregate audit found 32 published property rows attributed to MagicBricks; their reuse rights and provenance are unverified, and none has a geospatial location. Do not treat them as PREM-approved map/market data until reviewed.
- SEO metadata, privacy notice, Vercel SPA routing, and baseline security headers.
- WhatsApp destination can be configured with `VITE_WHATSAPP_NUMBER`.

Mobile OTP and Google sign-in remain disabled until the matching providers, delivery, and redirect URLs are configured in Supabase. Supabase Auth manages credentials; PREM never copies passwords, tokens, or provider secrets into `prem_accounts`. The public contact flow prepares a WhatsApp message and does not persist a lead yet.

## Local development

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
```

Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_WHATSAPP_NUMBER`. The current local configuration targets the owner-selected PremHousing Supabase project (`swrhmpnjyvnascpqdjir`). Never put a Supabase secret or service-role key in a `VITE_` variable. Do not commit `.env.local`.

## Supabase database

PREM uses the `PremHousing` Supabase project (`swrhmpnjyvnascpqdjir`). BidMetric is not used by this app; do not apply PREM migrations or writes there. A read-only consolidation audit found no BidMetric public-table rows or Storage objects to transfer. The three unused BidMetric Auth accounts were deleted per owner instruction, along with their linked identities and sessions; no user data was copied to PREM. Its schema conflicts with PREM's native `properties` and `leads` design, so its migrations were not replayed. See [`bidmetric-supabase-audit.md`](docs/implementation/bidmetric-supabase-audit.md#2026-11-23-consolidation-decision) for the object inventory and migration decision. The existing PremHousing foundation contains `localities`, `properties`, and `leads` with PostGIS, search indexes, checks, and foreign keys. A read-only aggregate check on 2026-11-23 found 7 public localities without centroids and 32 published property rows without geospatial locations; all 32 identify `magicbricks` as source. This contradicts older “empty inventory” notes. Rights and ingestion provenance are unverified, so these rows are not approved PREM inventory. No rows were changed during this audit. See [`MAP_HEATMAP_RECOVERY_AUDIT.md`](docs/implementation/MAP_HEATMAP_RECOVERY_AUDIT.md).

The tracked migration history is:

1. `20261120191244_property_inventory_and_leads` — verified pre-existing PREM foundation, recorded in the migration ledger after schema reconciliation.
2. `20261122194006_prem_phase0_access_and_accounts` — owner-scoped `prem_accounts`, least-privilege grants, published-listing/locality access, staff lead access, and staff/admin listing policies.
3. `20261122195230_prem_phase0_policy_performance` — non-overlapping read policies, statement-scoped JWT checks, and a lead-to-property foreign-key index.

Public clients can read localities and published properties. Draft listings are visible only to authorized staff. Leads cannot be read by public users or inserted directly from the browser. Customers can read/update their own account profile; broker accounts start pending, and clients cannot approve themselves. The BidMetric-specific security migration is archived outside `supabase/migrations` and must not be applied to PremHousing.

`supabase/tests/prem_phase0_rls.sql` exercises anon, customer, broker, staff, and admin RLS behavior with synthetic rows in a transaction and rolls them back. Run it only against the isolated PremHousing test project. The one-time history reconciliation is documented in `supabase/ops/reconcile_premhousing_migration_ledger.sql`. The local Supabase CLI is not linked; before using CLI migration commands, verify the linked ref is PremHousing.

### Staff access

Create the staff identity through Supabase Auth. The first trusted admin must be assigned by an authorized project owner or a protected server-side provisioning path. For the initial owner-managed bootstrap, replace the email below with that exact Auth user:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin')
where email = 'admin@example.com';
```

Use `staff` instead of `admin` for staff who can create, edit, verify, and publish but cannot delete listings. The user must sign out and back in to receive a token with the updated trusted claim. Do not assign staff roles through editable `user_metadata` or a public profile field.

## Project status

Phase 0 database work and map-first research are complete. Map implementation remains gated on owner review of data rights and provider/location decisions; no map implementation has started. Auth Phase 1 still has pending Supabase provider setup, first-admin provisioning, and interactive auth-flow verification. See [`docs/implementation/MASTER_WORKLIST.md`](docs/implementation/MASTER_WORKLIST.md), [`docs/implementation/auth-onboarding-plan.md`](docs/implementation/auth-onboarding-plan.md), and [`docs/implementation/MAP_HEATMAP_RECOVERY_AUDIT.md`](docs/implementation/MAP_HEATMAP_RECOVERY_AUDIT.md).

## Before advertising

1. Confirm the business phone number and WhatsApp destination.
2. Verify the office address, applicable MahaRERA details, registrations, and privacy contact.
3. Add a validated, consent-aware server endpoint before persisting leads or assigning them to a CRM.
4. Publish listings only after owner/agent authorization and availability confirmation.
5. Configure the canonical domain, Google Search Console, analytics, and ad conversion tracking.
