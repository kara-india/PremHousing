# PREM — Property & Real Estate Market

PREM is a React + Vite real-estate discovery and enquiry app for Mira-Bhayandar. It supports public property search, verified listing details, customer/broker accounts, and staff-managed inventory.

## Current features

- Responsive public landing page and Buy, Rent, Sell, and Commercial enquiry flows.
- Supabase-backed Homepage Property Explorer with synchronized property cards, filters, exact published-result count, and Mapbox locality context.
- `/insights` Locality Intelligence Explorer with budget/type/BHK requirements, three review profiles, locality comparison, and transparent unavailable-evidence states.
- Mapbox Geocoding API v6 resolves locality names at runtime to approximate locality centres. It never infers building pins or persists geocoder results.
- Published-only property detail pages.
- Email/password sign-in, password recovery, mobile OTP and Google OAuth UI, Remember me/session-only storage, and resumable customer/broker onboarding.
- Protected `/admin`, `/onboarding`, and `/account` routes. Staff access uses trusted Supabase `app_metadata.role`; staff can manage and publish listings, while deletion is admin-only.
- The 32 published property rows are shown as PREM inventory following the owner's confirmation. They do not contain property-level coordinates; Mapbox markers identify approximate locality centres only. Asking prices and listing counts are not registered transactions or market forecasts.
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

Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_WHATSAPP_NUMBER`, and `VITE_MAPBOX_ACCESS_TOKEN`. Vercel Preview and Production require the same public Supabase URL/publishable key and Mapbox token. These variables are configured in both environments; redeploy after changing them. Mapbox browser tokens are public: restrict the supplied token to required public map/geocoding scopes and approved PREM origins in Mapbox. Never put a Supabase secret or service-role key in a `VITE_` variable. Do not commit `.env.local`.

## Supabase database

PREM uses the `PremHousing` Supabase project (`swrhmpnjyvnascpqdjir`). BidMetric is not used by this app; do not apply PREM migrations or writes there. A read-only consolidation audit found no BidMetric public-table rows or Storage objects to transfer. The three unused BidMetric Auth accounts were deleted per owner instruction, along with their linked identities and sessions; no user data was copied to PREM. Its schema conflicts with PREM's native `properties` and `leads` design, so its migrations were not replayed. See [`bidmetric-supabase-audit.md`](docs/implementation/bidmetric-supabase-audit.md#2026-11-23-consolidation-decision) for the object inventory and migration decision. The existing PremHousing foundation contains `localities`, `properties`, and `leads` with PostGIS, search indexes, checks, and foreign keys. A read-only check found 7 localities and 32 published property rows without geospatial locations. The owner confirmed the 32 rows are PREM inventory; this app displays their published fields but does not treat their asking prices as registered transactions or analytical market evidence. The new map resolves locality names at request time; it does not modify Supabase. See [`MAP_HEATMAP_RECOVERY_AUDIT.md`](docs/implementation/MAP_HEATMAP_RECOVERY_AUDIT.md).

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

**Current as of 2026-11-23:** Phase 0 is complete. The Phase 1 auth and broker foundation is implemented on the development branch; interactive account/provider verification and first-admin operational checks remain in the worklist. Phase 2 moderation and staff leads are implemented and verified with rollback-only synthetic RLS tests on the isolated Prem Phase 1 Test project; production schema has not been changed, and `VITE_ENABLE_PHASE2_REVIEW` stays false until a reviewed production release. Phase 3 property search, Mapbox locality-centre maps, map/list switching, bounded inventory comparison, pagination, and public detail address minimization passed repository lint/tests/build and desktop/mobile browser review. The Homepage Property Explorer is embedded on `/`, and Locality Intelligence appears below it and at `/insights`. The owner confirmed the 32 published property rows are PREM-owned inventory; asking prices/counts do not establish market transactions, trends, or forecast evidence. A production build still warns that the lazy Mapbox chunk is approximately 1.9 MB minified (531 KB gzip); measure target-device performance before claiming low-bandwidth readiness. Production migration/release, provider and account verification, licensed market evidence, and forecast ground truth are future release gates. See [`docs/implementation/MASTER_WORKLIST.md`](docs/implementation/MASTER_WORKLIST.md) and the dated [map QA plan](docs/testing/MAP_EXPLORER_TEST_PLAN.md).

## Before advertising

1. Confirm the business phone number and WhatsApp destination.
2. Verify the office address, applicable MahaRERA details, registrations, and privacy contact.
3. Add a validated, consent-aware server endpoint before persisting leads or assigning them to a CRM.
4. Publish listings only after owner/agent authorization and availability confirmation.
5. Configure the canonical domain, Google Search Console, analytics, and ad conversion tracking.
