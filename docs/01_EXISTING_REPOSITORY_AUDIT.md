# Existing repository audit

This records the original PremHousing app and its original Supabase baseline. The owner later selected BidMetric Supabase for PREM; use [`docs/implementation/bidmetric-supabase-audit.md`](implementation/bidmetric-supabase-audit.md) as the current backend reference.

## Scope and snapshot

- PremHousing repository: `kara-india/PremHousing`, branch `feature/data-foundation`, audited at commit `6d6ea5d`.
- Runtime entry point: `src/main.jsx`.
- Stack: React 19, Vite 8, React Router 7, Supabase JS, Lucide icons. Build passes; lint reports existing errors in legacy `Navbar.jsx` and `CinematicHero.jsx`.
- Active routes: `/` renders `src/App.jsx`; `/admin` renders `AdminDashboard.jsx`; `/properties/:propertyId` renders `PropertyDetailPage.jsx`.

## Runtime feature findings

- Public search is backed by Supabase and only returns `published` properties. Filters include locality, sale/rent/commercial, price ceiling, deposit floor, BHK, area, and furnishing.
- The property detail route reads a single published row and offers a WhatsApp message prefilled with the property title.
- The admin route uses Supabase email/password auth and trusted `app_metadata.role` claims. It supports locality creation, property draft/edit, publishing after a verification checkbox, and admin-only deletion.
- The database currently has `localities`, `properties`, and `leads`, with RLS enabled. Inventory is empty. Admin workflows have not been exercised with a real authorized user.
- The public enquiry form still launches WhatsApp; there is no lead persistence or explicit consent checkbox. The database has no public lead-insert policy.
- `robots.txt` and `sitemap.xml` exist, but the app is a Vite SPA. Property metadata is set client-side; per-property SSR/SSG and structured data are not implemented.

## Keep / refactor / replace / investigate

| Area | Finding | Action |
|---|---|---|
| `src/main.jsx`, `src/App.jsx` | Active React Router and public landing/search | **Keep and refactor** as dynamic search and content grow. |
| `src/lib/supabase.js`, current schema | Publishable-key browser client; RLS tables for localities, properties, leads | **Keep**. Add isolated broker/auth tables only after scope and role model are approved. |
| `PropertyResults.jsx`, `PropertyDetailPage.jsx` | Active, Supabase-backed; no records available to test with | **Keep and verify** after owner-authorized inventory is entered. |
| `AdminDashboard.jsx` | Active staff-only property workflow | **Keep and extend** with moderation, broker records, and CRM after human scope choices. |
| `src/constants/listings.js`, `FeaturedProperties.jsx`, old `PropertyDetail.jsx` | Hardcoded demo claims and placeholder video; imported by legacy components, not by runtime routes | **Replace/remove after final dependency review**. Do not migrate demo listings into the database. |
| `Hero.jsx`, `Services.jsx`, `Contact.jsx`, `About.jsx`, `Navbar.jsx`, `Footer.jsx`, `BookingModal.jsx` | Legacy components not imported by current route entry points | **Investigate then remove or archive** in a dedicated cleanup task. |
| `CinematicHero.jsx` | Not routed; imports Mapbox/GSAP/framer-motion and contains a placeholder token string; contributes to lint failures | **Remove or redesign after confirming no external consumer**. The token string is a placeholder, not a working Mapbox credential. |
| Mapbox dependency/config | Mapbox package is used only by the unused cinematic component; `.env.example` has an optional token placeholder | **Investigate** map needs/provider and remove unused dependency only after the map choice is made. |
| `src/assets/vite.svg`, `src/assets/broker.png` | Not used by active route; broker image is referenced by unused `About.jsx` | **Investigate/remove** with the legacy component cleanup. |
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
- `npm run lint`: fails on pre-existing unused/declaration-order issues in legacy `Navbar.jsx` and `CinematicHero.jsx`.
- Supabase public property query: succeeds and returns zero published rows.
- No real inventory, staff-account CRUD test, broker isolation test, lead-write test, map test, AI test, or production deployment has been verified.
