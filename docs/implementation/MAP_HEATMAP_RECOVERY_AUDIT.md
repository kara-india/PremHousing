# PREM map and heatmap recovery audit

**Audit date:** 2026-11-23
**Repository snapshot:** `master` at `9c1f34990dbd80adc56239801224dc40534d3eaa`
**Repair branch:** `fix/prem-map-first-heatmap-recovery`
**Scope:** Local repository, source, design, test plan, GitHub PR #4 and aggregate-only live PremHousing inspection. No application code, provider credentials, schema/data writes, deployment or merge was performed.

## Executive finding

The supplied “all phases complete” map/heatmap summary does not match the current GitHub `master` snapshot inspected for this task.

The current repository tree contains no `DESIGN.md`, `DESIGN_DECISIONS.md`, `MAP_INTELLIGENCE_SPEC.md`, `NeighbourhoodMap.jsx`, `PreferenceControls.jsx`, or `LocalityComparisonDrawer.jsx`. The previous map component/dependencies were expressly removed in the 2026-11-23 Phase 0.2 cleanup because they were orphaned, unused, and configured with a placeholder Mapbox token. The package manifest does not include Mapbox GL JS or another interactive map renderer.

The active public surface is still a conventional landing/search experience backed by Supabase published-property queries. The current App does not import a map component or offer a neighbourhood explorer route/section. A read-only aggregate query now shows 32 published records in the connected PremHousing project, contradicting older documentation that inventory is empty. All 32 are attributed to MagicBricks, all have MagicBricks source URLs, and none has a geospatial location. Rights and ingestion provenance are unknown; these records are not cleared for PREM public map or market-intelligence use.

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
| Active inventory | 32 published rows; all attributed to MagicBricks, no geospatial locations; rights/provenance unverified | Aggregate-only query against PremHousing, 2026-11-23; no row-level values/PII read |
| Localities | 7 public localities; none has a centroid | Aggregate-only query against PremHousing, 2026-11-23 |
| Listing source | Published-only Supabase query | `src/App.jsx` |
| Existing data source policy | Broker/owner-authorized listings; no scraping/import performed | `docs/implementation/data-source-research.md` |
| Geospatial DB direction | PostGIS already part of selected PREM foundation according to schema docs | `docs/implementation/schema-design-v1.md` |
| Provider decisions | Map provider must be selected after licensing/terms and cost review | `data-source-research.md`, `technology-cost-research.md` |

## Important existing project decisions to preserve

1. PremHousing Supabase project ref is `swrhmpnjyvnascpqdjir`; BidMetric is inactive and must not be targeted.
2. The database has 32 published property rows, but they are MagicBricks-attributed and rights/provenance-unverified. Do not label them PREM-approved, map them, or make market claims from them until reviewed. Do not alter their current status as part of this research task.
3. Public listing search exposes published records only.
4. Public clients cannot write leads directly; lead capture remains server-side / WhatsApp-first until the consented API is implemented.
5. Broker/account security is based on trusted RLS and server-controlled role/approval states.
6. No production map provider is approved.
7. Mapbox real-estate commercial licensing and Google Maps content caching/use constraints must be considered before provider adoption.
8. OSM data carries ODbL attribution/share-alike obligations; public OSM tile and Nominatim servers are not production bulk ingestion services.
9. Asking-price observations must never be represented as transaction outcomes.
10. Forecasting remains separate and data-gated.

## Why the heatmap cannot currently render

At the inspected local repository, the most direct reason is that there is no map implementation to render:

- `mapbox-gl` was removed from dependencies in Phase 0.2.
- No Mapbox token is defined in the example environment.
- The old `CinematicHero` component was removed.
- The current `App.jsx` has no map import or map canvas.
- No heatmap sources/layers or local heatmap datasets exist in the tree.
- The 32 current published rows have no geospatial locations and are not approved for map use; no verified market observations are available.

This is stronger than a Mapbox opacity/z-index bug: the supplied implementation summary appears to refer to a different working tree or an unpushed local branch.

## Data and visualisation implications

The public search query can expose published rows, but PREM has no rights-cleared, geolocated inventory for a map and no verified market observations. A meaningful interactive **visual prototype** can still be built with synthetic GeoJSON fixtures, but every fixture must be unmistakably labelled illustrative and kept outside production market tables and APIs.

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

1. Finish Phase 0 research and resolve data provenance/status handling for the current MagicBricks-attributed records.
2. Obtain owner decisions on provider/budget, boundary/approximation policy, attribution/languages, and exact-location privacy.
3. After explicit phase approval, implement a map explorer with a provider adapter and synthetic, unmistakably labelled non-production GeoJSON fixtures.
4. Keep market layers independent and show no-data/insufficient-data states until rights-cleared observations meet evidence thresholds.
5. Connect only owner-authorized, PREM-approved and location-authorized listings through a bounded published-only contract.
6. Add PostGIS aggregation only after reviewed query/schema design and explicit approval.
7. Keep third-party market-data ingestion, portal collection and forecast overlays outside the map UI task.

## Verification and limitations

- Local checkout was `fix/prem-map-first-heatmap-recovery`, initially at `df323bd`, based on current `master` `9c1f349`. Existing draft PR #4 was reused; no competing PR was created.
- Initial baseline before documentation changes: `npm test` 7/7 passed, `npm run lint` passed, `npm run build` passed. `.env.local` was confirmed ignored; its contents were not read or printed.
- Read-only live inspection targeted PremHousing project ref `swrhmpnjyvnascpqdjir`. Only aggregate counts and source-name/URL-host summaries were inspected; no property titles, URLs, owner names, contact data or other record-level values were retrieved. No database writes were made.
- Research documents include public competitor/product inspection, current official vendor/source links, and explicit uncertainty limits. The TalkingLands interactive application returned 403; Flat Finder was inspected only as a public, changing prototype. Neither private backend was inferred.
- No map was implemented, no provider was configured, no UI/browser screenshots exist, and prospective map tests were not run. This work remains research/documentation, not implementation verification.
- Live database contents can change; the aggregate counts are a dated observation. The MagicBricks source and URLs do not establish license or permission. Do not delete/unpublish rows without a separate owner decision; do not expose them as approved PREM listings without confirming source authority and the current application’s publication controls.
