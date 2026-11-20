# Prem Housing implementation plan

## Verified baseline

- The repository is a React 19 and Vite single-page site focused on Mira-Bhayandar.
- The public page contains search controls, service and locality sections, and a WhatsApp enquiry form.
- There is no backend client, API, database, admin experience, live inventory, or AI service configured.
- The old sample inventory module contains unverified listing claims and placeholder media; the public landing page currently avoids presenting these as live listings.
- The repo had no local commits or remote configured when inspected. It is now attached to `https://github.com/kara-india/PremHousing.git`, tracking the existing `master` history.
- The working branch is `feature/data-foundation` so the work can be reviewed before merging.

## Delivery sequence

1. **Data and backend foundation (current slice).** Add versioned Postgres/PostGIS tables for localities, properties, and consented leads. Enable RLS everywhere, expose only published inventory to the public, and reserve lead writes for a trusted server-side integration. Do not seed unverified listings.
2. **Search UI.** Connect the existing search form to published records and support transaction, residential/commercial type, locality, budget, deposit, BHK, furnishing, and area filters. Add an accessible results list and property detail route.
3. **Location intelligence.** Add verified coordinates and locality matching, map display, and cached POI distance data only after an allowed geocoding/data source is selected.
4. **Recommendations and consultant.** Implement explainable structured matching first. Add an AI chat endpoint only after a server-side model key and an inventory-backed search tool are configured; replies must be grounded in returned records.
5. **Admin and leads.** Add Supabase Auth staff access, property CRUD, lead status handling, consent capture, and a server-side lead submission path. Never expose service credentials in Vite client variables.
6. **SEO and analytics.** Add property metadata, sitemap generation for published listings, and analytics/pixel events behind cookie consent once business IDs and privacy text are supplied.
7. **Hardening and deployment.** Add integration/e2e coverage, accessibility/performance checks, CI, and a staging deployment after the Supabase project, approved inventory source, and deployment target are available.

## Decisions and dependencies

- Initial geography stays Mira Road and Bhayandar, as specified. Exact boundaries/locality list can be refined using owner-approved inventory.
- There is no approved listing feed or dataset in the repository. The schema records provenance and verification dates; only authorized, verified records should be published.
- No Supabase project is connected to this workspace. The migration is local and version-controlled; it has not been applied to a hosted database.
- Public lead insertion is deliberately not enabled yet. A server-side endpoint must validate consent and protect the database from spam before lead capture is connected.
- Map provider, AI model, paid data-source budget, WhatsApp Business API, analytics IDs, ad pixels, and production domain remain integration decisions requiring business credentials or an approved vendor.
- Keep guest search and enquiry flow; user accounts are only for staff administration.

## Current acceptance criteria

- Schema supports residential/commercial properties, buy/rent/lease, prices and deposits, BHK, area, furnishing, locality, geospatial coordinates, source provenance, and publication state.
- Public API roles can read published property/locality data only.
- Lead PII is inaccessible to public roles and visible only to trusted staff claims.
- No synthetic inventory or secrets are introduced.
