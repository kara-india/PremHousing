# PREM Product Information Architecture

**Status:** Unnumbered Design Phase deliverable; proposed design only. No application, data, or Supabase changes are authorized by this document.
**Scope:** Homepage Property Explorer and Locality Intelligence Explorer.

## Product structure

PREM has two connected but deliberately separate discovery experiences:

1. **Homepage Property Explorer** answers “Which available PREM-approved property matches my budget and bedroom needs?” It is listing-first, quick, and enquiry-oriented. It lives within the existing homepage and reuses the existing property search and WhatsApp enquiry flows.
2. **Locality Intelligence Explorer** answers “Which locality and property fit my living or investment priorities, and why?” It is evidence-led and decision-oriented, with requirements, locality context, comparison, and explainable recommendations. It is a dedicated route and never treats its indicators as guaranteed outcomes.

Both share PREM navigation, brand tokens, locality vocabulary, property identity/details, approved listing rules, accessible filters, and enquiry handoff. They do not share one overloaded map or mix observed listings with area statistics.

## Proposed sitemap and navigation

```text
Home /
├── Existing buy / rent / sell / commercial search section
├── Homepage Property Explorer section (#explore-properties)
│   ├── Filtered map + results state (same route, query state)
│   ├── Property preview (same route, selected property state)
│   └── Property details /properties/:propertyId
├── Locality Intelligence entry point
│   └── /insights (dedicated route)
│       ├── /insights/requirements (step/state; optional shareable query)
│       ├── /insights/explore (map + locality panel)
│       ├── /insights/compare (selected localities)
│       └── /insights/property/:propertyId (recommendation context + standard details)
├── /auth, /auth/callback, /auth/reset-password
├── /onboarding, /account
└── /admin (protected; never linked from public map/list controls)
```

The route names for `/insights` and its subviews are proposals. Keep a single shareable route with query parameters if the team prefers shallower routing; preserve filters and map extent either way. Do not change current routes during design work. The existing `AppRoutes.jsx` has `/`, `/properties/:propertyId`, auth, account/onboarding and staff admin routes; no map route currently exists.

### Navigation behavior

- Global header retains the existing PREM identity and navigation style. Add two clear destinations: **Explore properties** and **Locality insights**. Do not rename existing Buy/Rent/Commercial flows.
- “Explore properties” anchors to the homepage section; it does not create a second search form or new enquiry channel.
- “Locality insights” opens the dedicated experience. Its intro explains that data availability varies and that asking prices are not registered sale prices.
- Property cards and map selection open a preview/detail route; back navigation restores filters, scroll position, selected locality, and (where supported) map viewport.
- Enquiry always delegates to the existing WhatsApp destination and message helper. Auth is not required for browsing or enquiry.

## User journeys

### 1. Homepage discovery

Home → Explorer → choose maximum budget and BHK → synchronized list/map update → select card or marker → preview/details → **Enquire on WhatsApp** → prefilled message → user reviews and presses Send in WhatsApp.

If there are no results, keep both filters visible and offer “Clear filters”, “Increase budget”, and a WhatsApp alternative to request availability. Never replace zero results with unrelated inventory.

### 2. Standard Residential & Connectivity

Locality Insights → enter hard requirements → choose **Standard Residential & Connectivity** → review map layers/data coverage → select locality → read available indicators and limitations → inspect matched properties → open “Why this matches” → compare alternatives → enquire about a chosen property.

### 3. Peaceful Living

Locality Insights → requirements → **Peaceful Living** → see only evidence-backed quiet/green/context indicators, each with source and coverage → review trade-offs and missing data → compare eligible localities → inspect property fit → enquire.

No unsupported safety, crime, noise, or pollution ranking is shown. Where a metric is unavailable, explain that it is unknown.

### 4. High ROI / Investment Potential

Locality Insights → requirements → **High ROI / Investment Potential** → explicitly choose evidence type (verified rental evidence, historical transaction data, asking-price context, infrastructure status) → compare the evidence and dates → inspect locality/property fit and risks → enquire.

Show rental yield only when a property-specific, documented formula has valid rent and price inputs. Keep yield, historical appreciation, and speculative future potential distinct. No guarantee or unqualified “high ROI” badge.

### 5. No suitable match

Requirements → zero eligible properties → preserve hard constraints → explain which constraints eliminated matches → offer only transparent alternatives (relax an optional filter, expand locality, or request human help). Never recommend an over-budget or wrong-type property as a match.

## Shared interaction/state model

| State | Homepage Explorer | Locality Intelligence |
|---|---|---|
| Initial | Compact filters, inventory summary only when a truthful approved count is available, results/list invitation | Explain purpose, geography/data coverage, optional requirements start |
| Loading | Preserve controls; card skeletons and map placeholder; announce loading to assistive technology | Preserve requirements; distinguish loading records from absent evidence |
| Success | Count reflects exactly the filtered result set; cards and eligible markers use same predicates | Separate listing count from observation sample sizes; show each source/date/coverage |
| No matches | “No published listings match”; clear/widen filters, contact option | “No eligible properties match these requirements”; keep no-data locality indicators separate |
| No inventory | Explain no approved inventory is available in that scope; no fabricated pins | Show named localities and explicit unavailable indicators; no synthetic market surface |
| Partial data | Hide unavailable facts on cards; show a short source/verification note where known | Mark individual indicators unavailable/stale/sparse; do not extrapolate neighboring data |
| Error | Retry and contact actions; retain entered filters | Retry failed layer independently; keep working layers and comparison state |
| Unsupported map | Switch to list with all filters/results intact | Keep locality cards, comparison table, and accessible textual summaries available |

## Evidence and source presentation rules

- Distinguish an authorized property listing from an asking-price observation, registered transaction, official disclosure, user-entered claim, estimate, and forecast.
- Every analytical indicator needs metric definition, unit, observation window, source, coverage, sample count or suppression state, freshness, and method.
- Use “Unavailable” or “Insufficient verified data”, never a zero or inferred value for missing information.
- Proposed synthetic prototypes must be visually stamped **Illustrative only — not market data** and remain outside production APIs/tables. The existing 32 published MagicBricks-attributed property rows and 7 localities are explicitly out of analytical design evidence: their provenance is unverified and they must remain untouched during this Design Phase.

## Technical handoff references

- Existing routes: `src/AppRoutes.jsx`.
- Existing homepage search: `src/App.jsx`; public property results: `src/components/sections/PropertyResults.jsx`.
- Existing property detail: `src/components/sections/PropertyDetailPage.jsx`.
- Existing WhatsApp helper: `src/lib/whatsapp.js`; current homepage creates a prefilled requirement message and asks the visitor to send it in WhatsApp.
- Existing query is published-only and selects property title/type/transaction/price/deposit/area/bedrooms/furnishing/description/features/image URLs and locality name. It does not select bathrooms, facing, floor, point geometry, verification/source fields for the card contract, or a public property reference in the WhatsApp message.
- Current `properties` joins `localities`; schema has `location` geography and locality has `centroid`, but Phase 0 aggregate audit found no populated locations/centroids. Do not plot the current MagicBricks-attributed rows or infer exact positions.
- Map query, layer contract, provenance and privacy proposals are specified in [`../architecture/GEOSPATIAL_DATA_CONTRACTS.md`](../architecture/GEOSPATIAL_DATA_CONTRACTS.md). No schema currently supplies full market-observation history, POI quality, traffic, quietness, rental-demand, or infrastructure completion evidence; these remain data dependencies.

## Design decision summary

Keep the homepage explorer simple and immediately useful for available properties. Give locality analysis its own decision-support route with visible evidence quality. Both connect through the same approved property detail and WhatsApp handoff. An absent dataset is a first-class product state, not a reason to fabricate visual density.
