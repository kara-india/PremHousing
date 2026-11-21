# PREM — Property & Real Estate Market: implementation plan

This is the consolidated roadmap. Task-level checkboxes and verified progress live in [`docs/implementation/MASTER_WORKLIST.md`](implementation/MASTER_WORKLIST.md). Repository findings live in [`docs/01_EXISTING_REPOSITORY_AUDIT.md`](01_EXISTING_REPOSITORY_AUDIT.md).

## Current baseline

- Active branch: `feature/data-foundation`, tracking `origin/feature/data-foundation`.
- Product brand: **PREM — Property & Real Estate Market**. `kara-india/PremHousing` is the only code repository; Estazo is a concept/research reference only.
- Runtime: React 19 + Vite 8. `src/main.jsx` routes `/` to the public site, `/properties/:propertyId` to a published-property detail page, and `/admin` to the staff dashboard.
- Selected backend: the existing BidMetric Supabase project in `ap-southeast-2`. It has 29 public tables, including `properties`, `leads`, `agents`, and `market_trends`; it has no `localities` table and is not compatible with current Vite queries yet.
- BidMetric has candidate valuation and market-trend fields for future predictions. Their provenance, historical coverage, quality, and permissions are not verified.
- Security Advisor reports 12 public tables with RLS disabled and anon `SELECT` grants. See [`bidmetric-supabase-audit.md`](implementation/bidmetric-supabase-audit.md). No production schema or policy change has been made.
- Public search queries published listings and filters by transaction, property type/BHK, locality, price, deposit, area, and furnishing. Property details use a published-only query.
- Admin code supports password sign-in, locality creation, property drafts/editing, verification-gated publishing, and admin-only deletion. It has not been verified with a provisioned staff account or mapped to BidMetric roles.
- Enquiries still open a WhatsApp draft. No public database lead writes, CRM screen, map/POI layer, broker workflow, AI assistant, ad tracking, or deployed production flow exists.
- Production build passes. Lint remains red on the existing issues in `Navbar.jsx` and `CinematicHero.jsx`.

## Combined phase map

| Consolidated phase | Work | Current state |
|---|---|---|
| **0. Audit and decisions** | PremHousing and Estazo audits, BidMetric schema/security review, data-source/legal research | Repo, brand, and backend are selected; schema mapping, security remediation, and source/cost/legal research remain. |
| **1. Data and staff foundation** | Reconcile BidMetric schema/RLS, staff identity and roles, property admin, moderation base | Current PREM CRUD targets a different schema. Role, locality/property mapping, access review, and staff-account verification are pending. |
| **2. Public property discovery** | Published inventory, filters, results, detail routes, map | Search and detail code are implemented; data-driven end-to-end verification and map are pending. |
| **3. Public property discovery** | Published inventory, filters, results, detail routes, map | Search and detail code are implemented; BidMetric schema mapping, data-driven verification, and map are pending. |
| **4. Locality intelligence** | Verified POIs, geospatial query, transparent location scores | Not started. |
| **5. Recommendations and AI** | Rule-based ranking, grounded chat, multilingual support | Not started; requires mapped inventory and an approved model/budget. |
| **6. Broker network** | Broker onboarding, verification, broker-owned submissions, moderation, promotional profile | New scope; not started. Confirm MVP priority and terms before schema changes. |
| **7. Leads and CRM** | Explicit consent, server-side capture, assignment, follow-up, WhatsApp/notification | WhatsApp draft only; CRM persistence and lead dashboard are pending. |
| **8. Marketing and SEO** | Analytics/ads, attribution, structured metadata, crawlable property pages | Static SEO files exist; event tracking, dynamic metadata, and campaign attribution are pending. |
| **9. Future predictions** | Data sufficiency, explainable baseline/model, uncertainty and claims review | Planned PREM capability. BidMetric has candidate valuation/trend fields; provenance and sufficiency checks must pass before public predictions. |
| **10. Hardening and launch** | Tests, RLS/security review, CI, staging, rollback, production | Build works; lint has known failures; no end-to-end suite or production deployment is verified. |

The earlier brief’s phases map into this sequence: data/admin → phases 1 and 7; search → phase 2; geospatial → phase 4; AI → phase 5; ads/SEO → phase 8; QA/deployment → phase 10. The updated brief adds the broker network, listing moderation, detailed consent/attribution, and future market predictions.

## Delivery rules

- Work one task window at a time, with a ten-minute maximum. After completing and verifying a task, stop, update the worklist, report what changed, and wait for the user’s review before taking the next task.
- Use parallel agents only for independent audits/reviews or isolated deliverables. Share findings before integrating; agents do not change the default branch.
- Keep the existing React/Vite and Supabase foundation unless a documented requirement justifies a migration.
- Do not create sample property claims, scrape portals without authorization, or copy Estazo code/assets without a license or written permission.
- Use BidMetric Supabase as the selected backend, but map its existing schema and review the recorded RLS findings before exposing PREM data or public queries.
- Never put service-role/API secrets in Vite client variables. Keep lead writes server-side and gated on explicit consent.
- Treat unverified legal, pricing, API-policy, and data-localization claims in the pasted strategy as research tasks. Verify them with primary sources before relying on them.
- Commit reviewable work on feature branches. Do not merge to `master` or deploy without a separate review checkpoint.

## Human inputs still needed

- Product differentiation: which promise should lead—verified listings and price transparency, local human guidance, locality intelligence, or a broker network?
- Broker network: launch in the first MVP or defer until the public search funnel and inventory are proven? If included, who verifies brokers and what are the Golden Profile promotion terms?
- Initial authorized inventory, localities, and source permissions.
- Auth providers/SMS budget; AI model/language/cost budget; WhatsApp Business choice; analytics and ad account IDs.
- Review data-region and privacy requirements for `ap-southeast-2` before storing customer lead data.
