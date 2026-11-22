# PREM map and heatmap recovery audit

**Audit date:** 2026-11-23  
**Repository snapshot:** `master` at `9c1f34990dbd80adc56239801224dc40534d3eaa`  
**Repair branch:** `fix/prem-map-first-heatmap-recovery`  
**Scope:** GitHub source/documentation inspection only. No local browser runtime, local checkout, environment values, or live Supabase queries were available to this audit.

## Executive finding

The supplied “all phases complete” map/heatmap summary does not match the current GitHub `master` snapshot inspected for this task.

The current repository tree contains no `DESIGN.md`, `DESIGN_DECISIONS.md`, `MAP_INTELLIGENCE_SPEC.md`, `NeighbourhoodMap.jsx`, `PreferenceControls.jsx`, or `LocalityComparisonDrawer.jsx`. The previous map component/dependencies were expressly removed in the 2026-11-23 Phase 0.2 cleanup because they were orphaned, unused, and configured with a placeholder Mapbox token. The package manifest does not include Mapbox GL JS or another interactive map renderer.

The active public surface is still a conventional single-page landing/search experience backed by Supabase published-property queries. The README states that PREM's current inventory is empty. The current App does not import a map component or offer a neighbourhood explorer route/section in the code inspected.

Therefore this task is a **new, scoped map/heatmap product workstream**, not a repair of a currently present five-layer Mapbox implementation. Do not claim that the supplied implementation summary was verified.

## Repository and feature evidence

| Area | Verified state in inspected snapshot | Evidence |
|---|---|---|
| Default branch | `master` | Repository metadata |
| Head commit | `9c1f349` | Recursive tree and recent commit |
| Runtime | React 19, Vite 8, React Router 7, Supabase JS | `package.json`, `src/main.jsx`, `src/AppRoutes.jsx` |
| Public route | `/` renders `src/App.jsx` | `src/AppRoutes.jsx` |
| Admin/detail/auth/onboarding routes | Existing lazy routes | `src/AppRoutes.jsx` |
| Map renderer | None declared in `package.json` | Package manifest |
| Map component | None in current recursive tree | Recursive repository tree |
| Heatmap component/data | Not present in current tree inspected | Recursive repository tree |
| Design docs claimed in prior summary | Not present at repository root/tree | Recursive repository tree |
| Active inventory | README says empty; no seeded properties | `README.md`, worklog and prior DB record |
| Listing source | Published-only Supabase query | `src/App.jsx` |
| Existing data source policy | Broker/owner-authorized listings; no scraping/import performed | `docs/implementation/data-source-research.md` |
| Geospatial DB direction | PostGIS already part of selected PREM foundation according to schema docs | `docs/implementation/schema-design-v1.md` |
| Provider decisions | Map provider must be selected after licensing/terms and cost review | `data-source-research.md`, `technology-cost-research.md` |

## Important existing project decisions to preserve

1. PremHousing Supabase project ref is `swrhmpnjyvnascpqdjir`; BidMetric is inactive and must not be targeted.
2. No public inventory is currently available. Do not invent properties or market observations.
3. Public listing search exposes published records only.
4. Public clients cannot write leads directly; lead capture remains server-side / WhatsApp-first until the consented API is implemented.
5. Broker/account security is based on trusted RLS and server-controlled role/approval states.
6. No production map provider is approved.
7. Mapbox real-estate commercial licensing and Google Maps content caching/use constraints must be considered before provider adoption.
8. OSM data carries ODbL attribution/share-alike obligations; public OSM tile and Nominatim servers are not production bulk ingestion services.
9. Asking-price observations must never be represented as transaction outcomes.
10. Forecasting remains separate and data-gated.

## Why the heatmap cannot currently render

At the inspected repository snapshot, the most direct reason is that there is no map implementation to render:

- `mapbox-gl` was removed from dependencies in Phase 0.2.
- No Mapbox token is defined in the example environment.
- The old `CinematicHero` component was removed.
- The current `App.jsx` has no map import or map canvas.
- No heatmap sources/layers or local heatmap datasets exist in the tree.
- No public property records are available to supply inventory heatmaps.

This is stronger than a Mapbox opacity/z-index bug: the supplied implementation summary appears to refer to a different working tree or an unpushed local branch.

## Data and visualisation implications

With an empty property inventory, the production heatmap must display a polished no-data state. A meaningful interactive **visual prototype** can still be built with synthetic GeoJSON fixture data, but every fixture must be unmistakably labelled as illustrative and kept outside production market tables.

Recommended independent visual layers:

- **Advertised sale asking prices:** only from permitted, dated observations; never completed transaction value.
- **Advertised rent:** monthly rent ranges; not rental yield.
- **Asking price per area:** preserve carpet vs built-up basis as separate cohorts.
- **PREM approved inventory:** only live published/approved listings; empty until real listings exist.
- **Preference fit:** transparent illustrative scoring until audited POI inputs and method are approved.
- **POI/context:** only licensed/approved datasets with source and freshness metadata.

Do not render fake continuous surfaces across the whole map when the source data only supports sparse locality-level values. Use choropleth/locality highlights or labelled points/clusters as appropriate.

## Implementation recommendation

A staged local-first map workstream should proceed without touching Supabase production:

1. Establish an evidence-backed map provider recommendation and license/cost decision record.
2. Implement a map explorer UI with a provider adapter boundary. Do not embed paid-provider assumptions throughout the app.
3. Add a synthetic, clearly labelled, non-production GeoJSON fixture for visual and interaction QA.
4. Implement independent layer state and meaningful legends, with empty and insufficient-data states.
5. Connect actual PREM inventory only through the existing published-only query when records become available.
6. Add PostGIS-backed aggregation only after schema/query design and explicit approval.
7. Keep third-party market data ingestion, portal collection, and forecast overlays outside this UI task.

## Limitations of this audit

- Inspected GitHub source and documentation, not the user's local Antigravity workspace.
- Could not inspect uncommitted changes, private environment variables, browser console, or a running deployment.
- Did not initialize the application, capture browser screenshots, or verify current production rendering.
- Did not modify application code or database schemas.
- No local executable build/tests were run because a local repository checkout/runtime was not available through this GitHub read interface.

These limitations must remain visible in future reports until an actual runtime checkout and browser validation are performed.
