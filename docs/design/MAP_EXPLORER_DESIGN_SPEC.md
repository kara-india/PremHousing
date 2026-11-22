# PREM Map Explorer: Product and Responsive Design Spec

**Status:** Phase 0 research recommendation; not an implementation contract.

**Date:** 2026-11-23
**Product goal:** Help a home seeker understand a locality, inspect PREM-approved property inventory, and compare options through an evidence-led map experience.

## Product principles

1. **Local first:** Use the repository's agreed launch geography and show its coverage boundary. Do not imply nationwide availability.
2. **Evidence with every insight:** Show what a value means, its source, its observation date, and its coverage or confidence where available.
3. **Inventory and context are connected:** A locality view should lead naturally to listings; a listing view should retain its locality context.
4. **Clear measurement:** Label carpet/built-up area separately and display units explicitly. Do not compare incompatible values as if equivalent.
5. **Honest uncertainty:** Distinguish asking prices, rents, completed/registered transactions, and model estimates. Sparse data must remain visibly sparse.
6. **Accessible alternatives:** Essential search, comparison, and property details must work without interacting with a map.

## Primary user journey

1. User chooses or searches a locality, landmark, or PREM-approved listing.
2. The explorer frames the selected area and explains whether PREM has inventory/data coverage there.
3. User adjusts a compact set of filters and explores nearby inventory or facilities.
4. Selecting a listing opens a detail preview while preserving map position and filters.
5. User saves the listing/locality to a comparison set and can return to the same research state.

## Information architecture

### Desktop

- **Top bar:** PREM identity, locality/listing search, transaction intent, and account actions.
- **Search controls:** A compact filter row for Buy/Rent, budget, bedrooms, area range, and readiness. Additional filters live in a clearly labeled expandable section.
- **Main workspace:** Map with a synchronized result list or a split map/list layout. Users can resize or collapse the list; preserve a clear focus target and avoid overlaying map controls.
- **Selection preview:** A side panel for a selected listing or locality, including key facts, provenance, save/compare actions, and a route to the full detail page.
- **Layer controls:** A labeled, keyboard-operable menu for available context layers. Hide unavailable layers instead of showing disabled promises without explanation.

### Mobile

- Start with a useful map view and a persistent search/filter entry point.
- Provide a prominent **Map / List** switch so the user can use either presentation without relying on a gesture.
- Show results as a bottom sheet with collapsed, half-height, and expanded states. Keep the selected listing card reachable and avoid covering essential map actions.
- Use a dedicated filter sheet with a clear Apply action and an active-filter count; allow reset and preserve filters when switching Map/List.
- Keep selected listing details in a separate sheet or navigable detail screen with a visible back path to the same map bounds and results.
- Support narrow screens, safe areas, portrait orientation, dynamic text, and touch targets suitable for one-handed use.

### Small-screen fallback

If the map cannot be rendered, is unsupported, or has a network error, present the same search and results in a list-first interface with a clear explanation. Do not block discovery behind map availability.

## Search and result behavior

- Search should accept locality and PREM inventory identifiers supported by the chosen data source. Avoid implying address-level precision if geocoding does not support it.
- Debounce typing, offer explicit selectable suggestions, and provide a keyboard-accessible result list.
- Keep filter state when opening and closing a preview. Show a removable summary of active filters.
- Map movement should not silently discard filters. If results update only after an explicit “Search this area” action, make the pending state and action visible.
- Result list order must be explained (for example, relevance or newest) and deterministic for equal values.
- Empty states should distinguish: no matches after filters, no approved inventory in the area, and unavailable/stale source data. Provide useful actions to widen filters or move the search area.

## Layer policy and visual semantics

Layers are optional and data-gated. The following are product candidates, not claims that data is already available:

| Candidate layer | User-facing meaning | Required clarity |
|---|---|---|
| PREM inventory | Properties that PREM is authorized to display | Identify listing status and last verified date; distinguish synthetic/demo records from real listings. |
| Sale asking-price context | Asking prices observed in eligible listings | Never label as completed transaction prices; show sample size and observation period. |
| Rental asking-rate context | Advertised rent observations | Show sample size, period, and whether deposit/maintenance is excluded. |
| Price per area | A normalized asking metric | Separate carpet and built-up bases; suppress comparisons where area basis is unknown. |
| Amenities/POIs | Nearby facilities from an approved source | State source and radius/distance method; proximity is not an endorsement or quality rating. |
| Locality trend/forecast | Historical statistic or future estimate if later approved | Visually and textually separate observed history from forecasts; disclose method, horizon, uncertainty, and coverage. |

### Confidence and sparse-data rules

- Do not publish a neighborhood aggregate below a product-approved minimum sample count. The threshold remains an owner/data-science decision and must be set before implementation.
- Show sample count and time period beside aggregate price/rent values; make “insufficient data” a valid state.
- Preserve source disagreements or data-quality issues for investigation; do not smooth them into a precise-looking heatmap.
- A heatmap or color scale must include a legend, metric, unit, date range, and clear indication of whether values are observed or modeled.
- Never encode a single opaque “best locality” score without an explainable methodology and accessible underlying factors.

## Visual direction

- Develop a distinct PREM visual language from the current brand system. Do not reproduce competitor colors, page composition, copy, iconography, or assets.
- Make the map a quiet working surface: neutral base, restrained overlays, readable labels, and explicit selection/hover states.
- Use one accent color for PREM-approved inventory and a separate, color-blind-safe scale for measured intensity. Do not rely on color alone; pair markers/regions with labels, patterns, or text.
- Prioritize legible contrast at common zoom levels. Keep attribution visible as required by selected map/data providers.
- Use plain language in control labels, for example “Nearby schools” rather than an unexplained score or proprietary category name.

## Accessibility and interaction requirements

- All search, filter, list, layer, save, and selection actions work by keyboard and screen reader.
- Provide a synchronized textual result list and selected-place summary as a non-map alternative.
- Announce result counts and filter updates without moving focus unexpectedly.
- Use semantic buttons/inputs, visible focus indicators, labeled controls, adequate contrast, and reduced-motion support.
- Do not make hover the only way to reveal a property's identity or status.
- Ensure markers have accessible names and selected state. Avoid requiring precise tapping on overlapping pins; offer a cluster/list selection flow.

## Trust, privacy, and provenance

- Each property preview should identify its source/authorization category, verification date, and a correction/report path appropriate to the listing workflow.
- Never show scraped personal owner details. Apply the project's approved synthetic-data labeling consistently wherever synthetic listings appear.
- Saved places/lists must be private by default. Sharing requires an explicit action and a clear summary of what becomes visible.
- Retain only the minimum research state needed to provide resume/share features. Align with the project's auth and privacy design before persisting identifiable behavior.
- Do not expose staff-only broker activity or private listing data in public map results; enforce authorization on the server/database layer, not only in UI.

## Loading, error, and empty states

- **Initial load:** Skeleton list/cards and map placeholder; preserve working search controls if tiles are delayed.
- **No results:** State whether filters, coverage, or inventory caused it, then offer a next step.
- **Sparse insight:** Say data is limited and provide period/sample details; do not color the region as if evidence were strong.
- **Map provider failure:** Fall back to the list and preserve query/filter state.
- **Stale source:** Show last update and avoid presenting it as current.
- **Geolocation denied/unavailable:** Keep manual locality search usable; location permission is never mandatory.

## Acceptance criteria for a future implementation

- A user can search a supported locality, adjust filters, view results in map and list modes, open a listing, and return with their context intact.
- Desktop and mobile layouts provide equivalent core functionality, with explicit Map/List navigation on mobile.
- Results, overlays, and counts reflect approved data only; empty/sparse/stale/error cases are distinguishable.
- Every displayed aggregate identifies metric, units, date range, and sample/coverage context. Asking prices are never presented as completed sales.
- No map-only action is required to reach a listing or compare saved properties.
- Keyboard-only and screen-reader users can complete the core journey and receive result/update feedback.
- Synthetic records are unmistakably labeled and owner names/personal details are absent.
- Authorization boundaries are enforced by existing backend/RLS rules and verified independently; UI visibility alone is insufficient.

## Open decisions before implementation

- Confirm the initial geographic boundary and default map center.
- Select a map provider and verify licensing, attribution, geocoding, storage, and expected usage costs.
- Define approved sources and refresh cadence for each POI and market metric layer.
- Set minimum sample thresholds and methodology for any aggregate or forecast.
- Choose the authoritative PREM brand tokens and confirm whether an existing design system supersedes this visual direction.
- Decide whether the initial release is locality-first, listing-first, or a user-selectable landing mode. Recommendation: locality-first with immediate access to listings.
- Define sharing scope and retention for saved comparisons/research state.

## Repository context checked

- `docs/implementation/data-source-research.md` recommends owned, permissioned listing/media sources, treats MahaRERA as a reference absent explicit reuse permission, and documents map/geodata restrictions.
- `docs/implementation/schema-design-v1.md` includes future place/POI concepts but does not establish that a map UI or market layer already exists.
- The current repository has no map renderer or map SDK dependency. This document is a design recommendation only; it does not authorize adding a provider or writing application code.
