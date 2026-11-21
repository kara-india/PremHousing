# Prem Housing / Prem Realty implementation plan

This is the consolidated roadmap. Task-level checkboxes and verified progress live in [`docs/implementation/MASTER_WORKLIST.md`](implementation/MASTER_WORKLIST.md). Repository findings live in [`docs/01_EXISTING_REPOSITORY_AUDIT.md`](01_EXISTING_REPOSITORY_AUDIT.md).

## Current baseline

- Active branch: `feature/data-foundation`, tracking `origin/feature/data-foundation`.
- Runtime: React 19 + Vite 8. `src/main.jsx` routes `/` to the public site, `/properties/:propertyId` to a published-property detail page, and `/admin` to the staff dashboard.
- Supabase has RLS-enabled `localities`, `properties`, and `leads` tables. The project contains no inventory yet.
- Public search queries published listings and filters by transaction, property type/BHK, locality, price, deposit, area, and furnishing. Property details use a published-only query.
- Admin code supports password sign-in, locality creation, property drafts/editing, verification-gated publishing, and admin-only deletion. It has not been verified with a provisioned staff account.
- Enquiries still open a WhatsApp draft. No public database lead writes, CRM screen, map/POI layer, broker workflow, AI assistant, ad tracking, or deployed production flow exists.
- Production build passes. Lint remains red on the existing issues in `Navbar.jsx` and `CinematicHero.jsx`.

## Combined phase map

| Consolidated phase | Work | Current state |
|---|---|---|
| **0. Audit and decisions** | PremHousing and Estazo audits, data-source/legal review, scope and architecture | PremHousing audit and Estazo license review are complete; source/cost/legal research and brand/scope decisions remain. |
| **1. Data and staff foundation** | Supabase schema/RLS, staff identity and roles, property admin, moderation base | Core three-table schema and basic admin CRUD are implemented. Expanded broker, moderation, audit, and staff-account verification are pending. |
| **2. Public property discovery** | Published inventory, filters, results, detail routes, map | Search and detail code are implemented; data-driven end-to-end verification and map are pending. |
| **3. Locality intelligence** | Verified POIs, geospatial query, transparent location scores | Not started. |
| **4. Recommendations and AI** | Rule-based ranking, grounded chat, multilingual support | Not started; requires real inventory and an approved model/budget. |
| **5. Broker network** | Broker onboarding, verification, broker-owned submissions, moderation, promotional profile | New scope; not started. Confirm MVP priority and terms before schema expansion. |
| **6. Leads and CRM** | Explicit consent, server-side capture, assignment, follow-up, WhatsApp/notification | WhatsApp draft only; CRM persistence and lead dashboard are pending. |
| **7. Marketing and SEO** | Analytics/ads, attribution, structured metadata, crawlable property pages | Static SEO files exist; event tracking, dynamic metadata, and campaign attribution are pending. |
| **8. Forecast research** | Data sufficiency audit, baseline model if justified | Optional and deferred until reliable historical transaction data exists. |
| **9. Hardening and launch** | Tests, RLS/security review, CI, staging, rollback, production | Build works; lint has known failures; no end-to-end suite or production deployment is verified. |

The earlier brief’s phases map into this sequence: data/admin → phases 1 and 6; search → phase 2; geospatial → phase 3; AI → phase 4; ads/SEO → phase 7; QA/deployment → phase 9. The updated brief adds the broker network, listing moderation, detailed consent/attribution, and optional forecast research.

## Delivery rules

- Work one task window at a time, with a ten-minute maximum. After completing and verifying a task, stop, update the worklist, report what changed, and wait for the user’s review before taking the next task.
- Use parallel agents only for independent audits/reviews or isolated deliverables. Share findings before integrating; agents do not change the default branch.
- Keep the existing React/Vite and Supabase foundation unless a documented requirement justifies a migration.
- Do not create sample property claims, scrape portals without authorization, or copy Estazo code/assets without a license or written permission.
- Never put service-role/API secrets in Vite client variables. Keep lead writes server-side and gated on explicit consent.
- Treat unverified legal, pricing, API-policy, and data-localization claims in the pasted strategy as research tasks. Verify them with primary sources before relying on them.
- Commit reviewable work on feature branches. Do not merge to `master` or deploy without a separate review checkpoint.

## Human inputs still needed

- Public brand: keep “Prem Housing,” rebrand to “Prem Realty,” or use both with distinct meanings.
- Product differentiation: which promise should lead—verified listings and price transparency, local human guidance, locality intelligence, or a broker network?
- Broker network: launch in the first MVP or defer until the public search funnel and inventory are proven? If included, who verifies brokers and what are the Golden Profile promotion terms?
- Initial authorized inventory, localities, and source permissions.
- Auth providers/SMS budget; AI model/language/cost budget; WhatsApp Business choice; analytics and ad account IDs.
- Review the connected Supabase project region (`ap-southeast-2`) before storing customer lead data.
