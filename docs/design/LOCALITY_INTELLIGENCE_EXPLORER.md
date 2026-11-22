# PREM Locality Intelligence Explorer

**Status:** Design specification for the unnumbered Design Phase. No implementation or production data integration is authorized by this document.
**Scope:** A dedicated, analytical locality and recommendation experience, distinct from the Homepage Property Explorer.
**Research basis:** [Map Explorer design spec](MAP_EXPLORER_DESIGN_SPEC.md), [source register](../research/MIRA_BHAYANDAR_DATA_SOURCE_REGISTER.md), [geospatial contracts](../architecture/GEOSPATIAL_DATA_CONTRACTS.md), [Phase 0 recovery audit](../implementation/MAP_HEATMAP_RECOVERY_AUDIT.md).

## Product role

The Locality Intelligence Explorer supports a considered choice of where to live or invest. It brings together user constraints, evidence about a locality, a transparent comparison, and matching PREM-approved properties. It is not a second property listing page and it is not a promise of property performance.

The experience has two stages:

1. **Set requirements:** maximum budget, residential type, BHK and only currently supported optional needs; choose one of three preference profiles.
2. **Explore evidence:** inspect eligible localities, compare available evidence, view matching properties with reasons and trade-offs, then enquire.

Users may edit requirements or change profile at any time. Changing a soft preference must not silently relax a hard constraint.

## Navigation and page structure

Proposed route: `/insights` (final route name awaits IA review). Entry points are a Homepage card/link labelled “Explore neighbourhoods” and the primary navigation item “Market Insights”. The account/auth routes remain separate and are not required to browse.

### Desktop dashboard

Use a three-zone editorial layout within the existing PREM shell:

- **Left requirement rail:** budget, property type, BHK and profile cards. Keep the requirement summary visible and allow it to collapse.
- **Central map/workspace:** selected analytical layer, bounded locality view, map controls and evidence legend. Provide an equivalent sortable locality list/table when the map is unavailable or inaccessible.
- **Right contextual panel:** selected locality facts, evidence coverage, comparison actions and recommended property cards. It may collapse to expand the map.

Above the workspace, show a compact result context: selected profile, current eligible-result count or a clear unavailable state, and “as of”/coverage language when those values exist. Do not display an aggregate count unless it came from the same filtered, authorized query as the results.

### Mobile dashboard

- Header and one-line requirement/profile summary remain compact.
- Requirements open in a full-height drawer or step sheet; the user can return without losing selections.
- Provide an explicit **Map / List** segmented control. Essential locality and property actions work in list mode.
- Layer controls open a labelled bottom sheet with layer description, availability, legend and source metadata.
- Locality facts and recommendation details use a bottom sheet with a visible drag handle and close button; do not bury the close action below the fold.
- Keep filters persistent while changing between map, list, locality details and comparison.

## Preference profile selection

Present exactly three mutually exclusive profile cards. Each includes a short objective, the leading considerations, what it cannot establish, and a “Choose profile” action. A profile influences ranking only after hard filters; it never changes the factual values shown in evidence panels.

### Standard Residential & Connectivity

**Objective:** balanced day-to-day convenience and affordability. Candidate dimensions: verified access to public transport/rail, road connectivity, schools/colleges, hospitals, markets/essential amenities, and property affordability. Each dimension is shown only where an eligible source and a defensible method exist. A distance to a facility is not a measure of facility quality or actual journey time.

### Peaceful Living

**Objective:** surface evidence relevant to a quieter residential context without claiming that a neighbourhood is peaceful or safe. Candidate dimensions: residential land-use context, distance to mapped major roads, verified green-space access, surrounding built density, and credible environmental measurements when available. Road proximity alone cannot establish noise or disturbance; no crime/safety, noise or air-quality estimate is shown without suitable, dated, licensed data and methodology.

### High ROI / Investment Potential

**Objective:** organize investment-relevant evidence without guaranteeing returns. Keep three concepts visually separate: **rental yield** (verified rent and comparable price basis), **capital appreciation** (historical observed price change on comparable evidence), and **future potential** (an uncertain scenario, if later approved). Show source, sample, period, method and limitations beside every metric. Asking-price trends are not registered transaction outcomes. Do not calculate a yield from incompatible rent and price cohorts.

## Map layer selector and semantics

Each layer is independently selectable. Selecting an unavailable layer must explain why, not show a blank map or fabricated surface. Layer names are explicit about the quantity and evidence type.

| Layer | Label and visual | Required information before display | Current design state |
|---|---|---|---|
| Sale asking-price intelligence | “Advertised sale asking price”; locality ranges or eligible point distribution, never a continuous interpolated field without statistical justification | Currency, asking-price basis, property type/BHK, source, observation dates, sample count, coverage, area basis when normalized, suppression/method note | Disabled/no verified observations until rights-cleared, dated observations exist |
| Monthly advertised rent | “Advertised monthly rent”; rent bands distinct from sale price | Monthly currency, property type/BHK, source, observation dates, sample count, coverage; no yield inference | Disabled/no verified observations |
| Asking price per area | “Asking price per sq. ft.” with **carpet** and **built-up** cohorts separated; never blend silently | Explicit area basis, unit, compatible observations, source/date/sample/coverage | Disabled until area basis and comparable, rights-cleared observations exist |
| PREM-approved inventory | Individual marker or cluster for listings explicitly approved for public display and whose location precision is authorized | Published/approved status, source/verification freshness, authorized coordinates, bounded public fields | Current MagicBricks-attributed rows are not cleared or geolocated; do not plot them |
| Preference match | Locality/feature suitability shown as a qualitative evidence summary or versioned score only when criteria and evidence support it | Profile/method version, available vs unavailable criteria, evidence coverage, result eligibility and confidence | “Not enough evidence to rank” when a material profile dimension is missing |
| Amenities and POIs | Category markers and count/distance summaries from licensed, locally checked features | Source/license, feature date, coverage, category, confidence; distance metric and reference point | Disabled until a source-level local coverage/rights review passes |
| Infrastructure and development | Discrete, dated project markers/lines with status, not a glowing opportunity surface | Publisher, source link, status exactly as published (proposed/under construction/operational), source date and geographic precision | Reference-only until source terms and coordinates are approved |

For every active layer, a legend panel carries: **what it measures**, units, date/as-of, source, geographic coverage, sample/feature count where relevant, methodology link, data completeness/confidence, and an “estimated / observed / user-submitted” badge. Missing counts are shown as “not available,” never zero. Use color plus labels/icons/patterns; color alone cannot encode status.

## Locality details and comparison

Selecting a locality opens an editorial snapshot with:

- Locality name and boundary type/status: authoritative boundary, approximate service area or name-only entity.
- Evidence summary with source date, sample size, coverage and missing dimensions.
- Available sale/rent/area-basis observations only; ask-price and transaction facts have separate headings.
- Amenity/transport context only where a licensed, verified source supports it.
- PREM-approved properties satisfying current hard filters, or a precise no-match/no-data message.
- Actions to compare, inspect sources/methodology, adjust requirements, or return to the map/list.

Comparison supports two to three selected localities in a side-by-side table on desktop. On mobile, use a horizontally scrollable comparison with the locality name and row header pinned, and a stacked alternative for screen readers. Rows are limited to available, comparable fields: sale asking-price band; advertised monthly-rent band; carpet/built-up asking price separately; eligible transport/facility counts or distances; dated infrastructure facts; profile fit and criteria coverage. Each row has units, date and source link. Incomparable or missing values say “Not enough comparable data”; never use blank cells that look like zero.

Do not create an overall winner badge based on arbitrary weights. Allow a user to pin a locality and inspect trade-offs. Any eventual score requires an approved method version and must expose covered and unavailable criteria.

## Recommendation result and detail states

Result cards list only PREM-approved, currently eligible listings. Each card should show the actual available title, image if supplied and cleared, locality, asking price, BHK/area where present, transaction type and freshness/verification badge if supported by the record. The match section is separate from listing facts and includes:

- **Why it appears:** up to three supported reasons linked to a profile criterion.
- **Trade-offs:** unmet soft preferences or relevant distance/feature limitations.
- **Unavailable:** important criteria for which data is absent.
- **Evidence coverage:** high/partial/low/not enough evidence, with the definition available.
- **Actions:** compare, open property details, and the existing PREM WhatsApp enquiry.

Hard-constraint failures are excluded, not rescued by a high soft score. If an exact match is absent, show “No exact match” and offer only user-controlled alternatives (for example, nearby locality or a different BHK) while visibly preserving the original constraint. Never loosen budget or property type automatically.

The detail view adds the property's verified/available attributes and locality evidence. Do not fill missing image, bathroom count, furnishing, coordinates or feature information with illustrative data. Enquiry uses existing `whatsappUrl` behavior with the property reference and user-chosen details; this design does not introduce an alternative lead form or store user inputs.

## Data and technical boundaries

The current local schema defines `localities` with `name`, `slug`, `city`, `region`, `centroid` and timestamps. It has no boundary geometry, alias table, official-boundary provenance, or verified locality-level indicator table. `properties` includes `title`, property and transaction type, `status`, `locality_id`, optional `address` and PostGIS `location`, `price`, `deposit`, optional `area_sqft`, `bedrooms`, `bathrooms`, `furnishing`, description, `gated`, `property_age_years`, `builder`, `features`, `image_urls`, `source_name`, `source_url`, `verified_at` and `published_at`. The schema has no `area_basis`, observation-period/source-rights record, `synthetic` flag, market observations, POI dataset, recommendation score, match rationale, or confidence contract. Do not assume these exist in the live schema; migrations/history must be reconciled before implementation.

Public RLS permits reading locality rows and published property rows; public listing query is published-only. Existing front-end property query returns the fields needed by current cards but does not fetch coordinates. A future map query must be a narrow projection, bounded by viewport/filter/limit, return only published and explicitly approved listings with authorized or generalized locations, and exclude contact details, private addresses, moderation notes, and leads. Current coordinates are absent from all 32 MagicBricks-attributed property rows per Phase 0 aggregate inspection. The 7 locality rows have no centroids. These rows must remain unchanged during the Design Phase and are not eligible for map display or recommendation evidence.

Future data needs: licensed boundary or a clearly named approximate service-area geometry; source/license/version/ingestion/expiry metadata; market-observation contract with asking-vs-transaction distinction, observed date, property cohort, area basis and quality; licensed POI and infrastructure lineage; locality-feature coverage and method version; coordinate-precision/obfuscation rules. This is a proposal, not a migration request.

## Recommendation interface contract

Input: normalized user-selected hard filters (maximum budget, property type, BHK, optional filters supported by existing data), selected preference profile and version, and any explicit comparison/locality scope. The UI sends only values required to search; do not persist anonymous preference inputs by default.

Output per candidate: eligible listing reference; satisfied/failed hard constraints; supported criterion evidence with source and timestamp; unavailable criteria; profile-specific contribution explanation; any proposed normalized preference score only if minimum coverage and approved method checks pass; evidence coverage/confidence state; and versioned methodology reference. The display must not imply model prediction or financial advice. Forecast outputs remain a separate, gated product surface.

See [`RECOMMENDATION_UX_SPEC.md`](RECOMMENDATION_UX_SPEC.md) for ranking, explanation and no-data rules.

## State and responsive requirements

- **Loading:** retain prior criteria and show labelled skeletons; do not move the map camera unexpectedly.
- **No data:** distinguish “no eligible PREM listings,” “no licensed locality evidence,” and “layer not available.”
- **Insufficient data:** describe the missing evidence or coverage rule and allow comparison of observable facts without manufacturing a score.
- **Error:** keep the list or requirement state available, explain retry, and do not present cached facts as current without an as-of date.
- **Map unavailable:** switch to locality cards/list, layer descriptions and accessible comparison.
- **Mobile:** 44×44 CSS px minimum touch target, safe-area-aware drawer, one primary action per card, no hover-only actions, no horizontally clipped filters.
- **Accessibility:** logical headings, keyboardable profile cards/layers, `aria-pressed` or radio semantics, visible focus, text alternative to every spatial encoding, reduced-motion support and announced result count changes.

## Open design decisions

- Product route naming and exact point at which users set profile/requirements.
- Approved locality names and authoritative vs approximate boundary policy.
- Map provider, pricing ceiling, attribution placement and language priorities.
- Property-coordinate precision and whether any locality-level generalization is acceptable.
- Minimum coverage/sample rules for each market metric and each recommendation profile.
- Whether the initial launch is allowed to show only property inventory and verified amenity facts while market layers remain unavailable.
