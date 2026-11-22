# Existing repository audit

This records the original PremHousing app and its original Supabase baseline; several statements below are historical snapshots. The active PREM backend is the `PremHousing` project (`swrhmpnjyvnascpqdjir`), and BidMetric is inactive. See [`docs/implementation/MAP_HEATMAP_RECOVERY_AUDIT.md`](implementation/MAP_HEATMAP_RECOVERY_AUDIT.md) for current map/inventory evidence and [`docs/implementation/bidmetric-supabase-audit.md`](implementation/bidmetric-supabase-audit.md) for the historical consolidation decision.

## Scope and snapshot

- PremHousing repository: `kara-india/PremHousing`, branch `feature/data-foundation`, audited at commit `6d6ea5d`.
- Runtime entry point: `src/main.jsx`.
- Stack: React 19, Vite 8, React Router 7, Supabase JS, Lucide icons. After Phase 0.2 cleanup, both build and lint pass; this package has no test/type-check scripts.
- Active routes: `/` renders `src/App.jsx`; `/admin` renders `AdminDashboard.jsx`; `/properties/:propertyId` renders `PropertyDetailPage.jsx`.

## Runtime feature findings

- Public search is backed by Supabase and only returns `published` properties. Filters include locality, sale/rent/commercial, price ceiling, deposit floor, BHK, area, and furnishing.
- The property detail route reads a single published row and offers a WhatsApp message prefilled with the property title.
- The admin route uses Supabase email/password auth and trusted `app_metadata.role` claims. It supports locality creation, property draft/edit, publishing after a verification checkbox, and admin-only deletion.
- At the original audit snapshot, `localities`, `properties`, and `leads` existed with RLS enabled and inventory was empty. A later aggregate-only inspection found 32 published MagicBricks-attributed property rows and 7 localities; source rights/provenance are unverified, and the rows are not cleared for PREM map/intelligence use. See the dated map recovery audit. Admin workflows have not been exercised with a real authorized user.
- The public enquiry form still launches WhatsApp; there is no lead persistence or explicit consent checkbox. The database has no public lead-insert policy.
- `robots.txt` and `sitemap.xml` exist, but the app is a Vite SPA. Property metadata is set client-side; per-property SSR/SSG and structured data are not implemented.

## Keep / refactor / replace / investigate

| Area | Finding | Action |
|---|---|---|
| `src/main.jsx`, `src/App.jsx` | Active React Router and public landing/search | **Keep and refactor** as dynamic search and content grow. |
| `src/lib/supabase.js`, current schema | Publishable-key browser client; RLS tables for localities, properties, leads | **Keep**. Add isolated broker/auth tables only after scope and role model are approved. |
| `PropertyResults.jsx`, `PropertyDetailPage.jsx` | Active, Supabase-backed; at the original audit there were no records. Later 32 published rows were found, but their MagicBricks source rights/provenance are unverified. | **Keep and verify** using owner-authorized, PREM-approved inventory only. |
| `AdminDashboard.jsx` | Active staff-only property workflow | **Keep and extend** with moderation, broker records, and CRM after human scope choices. |
| `src/constants/listings.js`, `FeaturedProperties.jsx`, old `PropertyDetail.jsx` | Fake listing claims and Rickroll placeholder video; none was routed | **Removed in Phase 0.2**. No demo records were migrated to Supabase. |
| `Hero.jsx`, `Services.jsx`, `Contact.jsx`, `About.jsx`, `Navbar.jsx`, `Footer.jsx`, `BookingModal.jsx` | Legacy components not imported by active route entry points; Contact simulated submission and map were placeholders | **Removed in Phase 0.2** with their component CSS. Active `App.jsx` content remains. |
| `CinematicHero.jsx` | Unrouted intro/map animation with placeholder Mapbox token; lint errors | **Removed in Phase 0.2** with its CSS. |
| Mapbox dependency/config | `mapbox-gl`, GSAP, and Framer Motion were referenced only by `CinematicHero`; `.env.example` had an unused Mapbox token entry | **Removed in Phase 0.2** from dependencies/lockfile and example config. A future map provider remains a separate task. |
| Orphan assets | `src/assets/vite.svg`, `broker.png`, and `hero.png`; `public/assets/commercial.png` and `interior.png` had no active references | **Removed in Phase 0.2**. Active `/assets/hero.png` and `/assets/office.png` are preserved. |
| Hardcoded contact number | Appears in the public UI and WhatsApp fallback; not an API secret | **Confirm with owner before campaign use**; make environment-driven if it is not the canonical public business number. |
| `.env.local` | Local Vite URL and publishable Supabase key; ignored by Git | **Keep local only**. Never add a service-role key to client env. |

## Estazo repository review

- Repository: [kara-india/estazo](https://github.com/kara-india/estazo), default branch `main` (not `master`), public, no license file or SPDX license detected.
- **Reuse decision:** No code/assets are cleared for copying. Use only product/workflow concepts as research unless a compatible license or written permission is provided.
- Potential concepts to consider independently: buyer/broker role journeys, contact gating, RERA verification, locality lookup, transparent valuation explanations, comparable-price visualizations, and listing promotion analytics.
- Do not inherit its auction/bidding or builder-funded monetization assumptions without a Prem-specific decision. Treat its scraped datasets and projected revenue claims as unverified and unavailable for reuse.
- Evidence: [repository metadata](https://github.com/kara-india/estazo), [README](https://github.com/kara-india/estazo/blob/main/README.md), [listing page](https://github.com/kara-india/estazo/blob/main/app/listings/page.tsx), [architecture note](https://github.com/kara-india/estazo/blob/main/docs/agent_d_frontend_architecture.md), [package metadata](https://github.com/kara-india/estazo/blob/main/package.json).

## Verification state

- `npm ci --no-audit --no-fund`: passed.
- `npm run build`: passed.
- `npm run lint`: passed after Phase 0.2 removed the unused legacy files causing the old lint errors.
- `npm run build`: passed after cleanup.
- `npm ls --depth=0`: verified declared top-level dependencies after removing the map/animation packages; `npm prune` completed successfully.
- A clean `npm ci --no-audit --no-fund` followed by lint/build passes. npm still lists one unreferenced optional artifact (`@emnapi/wasi-threads`) as extraneous; it is not declared in the project manifest or included in the app bundle and remained after `npm prune`.
- No `test` or `typecheck` script is defined in `package.json`.
- Supabase public property query: succeeds and returns zero published rows.
- No real inventory, staff-account CRUD test, broker isolation test, lead-write test, map test, AI test, or production deployment has been verified.

The unused components/assets and orphan map/animation dependencies listed above were removed in Phase 0.2; see the cleanup record below.

## Phase 0.2 cleanup record — 2026-11-23

Removed the confirmed orphan-only demo inventory, placeholder video/map code, legacy component/CSS tree, unused local/public assets, and the `mapbox-gl`, `gsap`, and `framer-motion` packages. Removed the stale `VITE_MAPBOX_TOKEN` example entry. Preserved the active landing/search/admin/detail routes and their current hero/office imagery. Repository-reference search found no imports or asset references to the removed paths. Lint and production build both pass; test and type-check commands are not configured in this repository.
