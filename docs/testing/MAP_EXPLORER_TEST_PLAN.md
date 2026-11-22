# PREM Map Explorer QA plan

**Phase:** 0 research; tests specify future acceptance and have not been run because the map feature is not implemented.

**Reviewed:** 2026-11-23
**Principle:** Test data truth and access before visual polish. A map can be visually convincing while showing unauthorized, stale, mislocated or statistically unsupported information.

## Preconditions / fixture contract

Build synthetic fixtures only; never use real customer contacts, lead activity or staff-only fields. Include: published and unpublished listings; authorized and unauthorized ownership/roles; null and invalid coordinates; two duplicate/nearby listings; points on each viewport edge; representative localities; test-only fabricated market values with an unmistakable `SYNTHETIC` marker; an empty dataset; a stale timestamp; and a known licensed boundary/POI fixture with source metadata. Tests must assert that fixture data is not enabled in production builds or production APIs.

Before map implementation, product/data owners must define supported roles, exact point obfuscation policy, publication semantics, how locality IDs are verified, minimum sample count for any market aggregate, acceptable freshness windows, and a manual map/list interaction model. Pending these, require no-data/unknown states and do not make market claims.

## QA matrix

| Area | Scenario / method | Pass condition | Severity |
|---|---|---|---|
| Route/loading | Open map route directly, navigate in-app, return/back, open on narrow viewport; browser integration | Route loads without crashing; map is lazy-loaded where intended and page retains search/list access before map loads | P1 |
| Lifecycle | Mount/unmount/remount and repeated route visits; component/integration | Exactly one live map/listener set per mounted view; workers, observers, markers and listeners cleaned up; no duplicate billing initializations without reason | P1 |
| Provider/config | Missing public style URL/token, malformed URL, invalid token/domain restriction; integration | Helpful fallback/error; no secret key in bundle/network; no infinite retry; attribution/legal control remains visible | P1 |
| Network degradation | Offline, timeout, tile 401/403/404/429/5xx, partial style source error, slow 3G; browser test | Search/list remains usable; map shows recoverable message and retry; no fabricated successful basemap; no hidden paid retry loop | P1 |
| Basemap provenance | Provider/data attribution link on desktop and small-screen layouts; manual visual/accessibility | Attribution is legible/clickable, never obscured by controls, drawer or safe-area; required provider and OSM notices appear according to source terms | P0 |
| India-local coverage | Inspect set of named PREM service localities against separately documented ground truth; manual GIS review | Labels/roads/POIs are not represented as exhaustive; coordinate system and spelling reviewed; gaps reported, not silently inferred | P1 |
| Coordinates | Valid points, null/0, swapped lat/lng, out-of-region, NaN, precision; unit + API | Invalid/out-of-bounds features rejected or safely omitted and counted in telemetry; no accidental point at (0,0); no sensitive exact point leaked | P0 |
| Viewport contract | Pan/zoom across viewport edges; query integration | Query is bounded by viewport plus explicit buffer, max result and zoom policies; stable pagination/no duplicates; no whole-table download | P0 |
| Access control | Query as anon, customer, broker, staff; RLS/API integration against isolated test target | Only records allowed by documented publication/role rule are returned; staff privilege is explicit and server-enforced; clients cannot bypass with arbitrary IDs/bounds | P0 |
| Data minimization | Inspect RPC/API response, GeoJSON, browser storage and logs | No phone/email/name, lead history, private notes, auth metadata or staff-only fields in map payload/logs | P0 |
| Mutability/freshness | Listing publish/unpublish/edit/expire and stale timestamp fixtures; integration | Updated status/location is reflected after documented cache/revalidation interval; unpublished/expired points disappear; stale layer date is visible | P0 |
| Layer toggles | Toggle listings, POIs, boundaries and market layer; integration/browser | Toggle controls the actual rendered source/layer and its data request; legend, active state and accessible labels match; no fictitious data series | P1 |
| Empty/no-data | No points, no market observations, insufficient sample, provider error | Clear empty-state reason; no zero-price heatmap, fake centroid or interpolated trend; distinct from loading and error states | P0 |
| Synthetic fixture gate | Open test fixture environment and production-like config; unit/build/API | Fabricated fixture is visibly marked and is inaccessible/absent in production path; CI fails if mock flag is enabled for production build | P0 |
| Clustering | Zoom transitions with single, overlapping and boundary points; component/browser | Counts are deterministic and reconcile with visible eligible records; cluster click/keyboard has usable zoom/list behavior; cluster is not described as a market heatmap | P1 |
| Heatmap | Synthetic fixture only, weighted and unweighted options; component/browser | Legend says what is counted/weighted and source/date; color scale has accessible equivalent; no market interpretation; disabled for insufficient/unauthorized real data | P0 |
| Statistics privacy | Try low counts at point, locality and H3 resolutions; API/security | If aggregates are enabled later, under-k groups suppressed/merged per approved policy; repeated panning/query manipulation cannot reveal suppressed rows | P0 |
| H3 locality semantics | Unit tests for coordinates, cell resolution and parent/child; if implemented | Resolution and approximate parent geometry are documented; never labels H3 cell as administrative neighborhood; boundaries are generated correctly and tested near edges | P1 |
| Locality boundaries | Boundary source/license/version and point-in-polygon cases; data QA | Only sourced boundaries shown; topology/CRS checked; approximate/unverified places use clearly named point coverage rather than invented polygon | P0 |
| Filter parity | Price/BHK/locality/status/date filters from map and list; component/integration | Same server-side predicates and result totals on both views; nulls/ranges/units documented; changing map bounds does not unexpectedly reset filters | P1 |
| Selection parity | Select map marker, list row, cluster; component/browser | Same listing card/detail opens; selection is keyboard accessible; selected feature remains visible after filtering or explains why it disappeared | P1 |
| URL/deep link | Refresh with filters, viewport and selected listing in URL; browser | URL parameters are validated and shareable; no PII; invalid coordinates are safely reset; back button restores prior state | P2 |
| Search/geocode | Ambiguous local name, Hindi/Marathi spelling variant, landmark, typo, no-match and low-confidence result; API/manual | Candidate selection/confidence is explicit, no silent incorrect coordinate; provider terms and retention are observed; no raw query with PII in logs | P0 before geocoding launch |
| Routing | Mode changes, inaccessible/closed road, unavailable route, straight-line fallback; integration/manual | Only selected routing provider is used; response shows mode/provider and failures; straight-line distance is never labelled travel time | P1 before routing launch |
| Accessibility | Keyboard-only, screen reader, contrast, reduced motion, 200% zoom; manual + automated accessibility | Map is not the only search path; markers/layers have accessible names; popup focus enters/returns correctly; list equivalent supports all primary tasks | P0 |
| Mobile behavior | iOS Safari and Android Chrome, portrait/landscape, small viewport/safe areas; device QA | Touch targets, pan/zoom gestures and page scroll coexist; controls avoid overlays; list/map switch works; device can recover from context loss | P1 |
| Mobile performance | Low/mid-tier Android, cold/warm cache and throttled network; profiling | No UI thread stalls from massive DOM markers/GeoJSON; camera remains interactive; target budgets are established from measured baseline and recorded, not guessed | P1 |
| Bundle/performance | Production build analysis, route chunk inspection, browser performance | Map bundle is route-split; only needed layers loaded; baseline and regression budget for JS size, first render, tile count and memory are documented before launch | P1 |
| Security | CSP/worker compatibility, XSS in feature labels/popups, URL injection; automated/manual | Popup text is escaped/sanitized; no arbitrary HTML from scraped/provider data; allowed hosts and CSP are deliberate; map config has no privileged key | P0 |
| Attribution/ODbL | Legal checklist + UI screenshot; manual | Attribution notices remain present across layers, export/print if added, and mobile; ODbL/source obligations recorded per derived dataset | P0 |
| Cache/privacy | Inspect browser/network caches, CDN and query logs | Only public map payloads cached; private/authenticated responses have correct cache controls; no coordinates or search terms shared to an unapproved third party | P0 |
| Observability/cost | Instrument init, error, source/API request, quota events; dashboard review | No sensitive content in telemetry; alert thresholds below provider limits; request and map-init metrics can explain bill changes and retry behavior | P1 |
| Visual regression | Stable fixtures/style; screenshot desktop and mobile | Markers, legends, attribution, empty state and controls do not overlap or clip across key breakpoints; basemap changes reviewed deliberately | P2 |

## Suggested automation layers

1. **Unit:** coordinate validation, GeoJSON serialization, filters, numeric units, aggregate suppression, URL parsing, localization and provider adapter configuration.
2. **Component:** source/layer state synchronization, no-data/loading/error states, list/map selection parity and keyboard interaction.
3. **API/RLS integration:** run only against an isolated development/test target and synthetic identities/fixtures. Verify anonymous, customer, broker and staff behavior; no production rows or schema writes for this research plan.
4. **Browser end-to-end:** desktop and mobile viewport; mocked tile/provider responses for deterministic UI tests plus one separate opt-in smoke test against the chosen provider. Ensure tests do not create repeated billable map sessions unexpectedly.
5. **Manual device/data review:** actual Android low/mid-tier and iOS browser; local label/road/POI ground-truth spot checks; contrast/screen reader; licensing and attribution.

## Launch gate

Do not launch customer-facing map market insights until: (a) the chosen provider and its commercial terms are approved, (b) all data sources and permitted uses are documented, (c) production response data is RLS-safe and minimized, (d) no-data behavior is verified, (e) location privacy and minimum aggregation thresholds are signed off, (f) mobile/accessibility/performance checks pass on target devices, and (g) attribution is visible in the final UI. A listings map can launch earlier only if published listing coordinates are authorized, backend policy and provider terms are met, and the above applicable security/accessibility checks pass.

## Research evidence

- [MapLibre docs and examples](https://maplibre.org/maplibre-gl-js/docs/), including official examples for [clusters and heatmap layers](https://maplibre.org/maplibre-gl-js/docs/examples/).
- [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/) — no bulk/offline prefetch for standard OSM tiles, visible attribution, caching requirements and best-effort service.
- [OpenStreetMap copyright/license](https://www.openstreetmap.org/copyright) — ODbL attribution and data license reference.
- [MapTiler Cloud pricing](https://www.maptiler.com/cloud/pricing/) and [terms](https://www.maptiler.com/terms/cloud/) — quota/cost and commercial restrictions require current review.
- [Mapbox pricing](https://www.mapbox.com/pricing) and [GL JS pricing](https://docs.mapbox.com/mapbox-gl-js/guides/pricing/) — charge metric is map initialization/load; separate services may meter separately.
- [PMTiles cloud storage](https://docs.protomaps.com/pmtiles/cloud-storage) — HTTP Range requests, CORS, storage request/byte costs; [PMTiles concepts](https://docs.protomaps.com/pmtiles/) — read-only archive semantics.
