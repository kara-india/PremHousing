# PREM Unnumbered Design Phase — Handoff Summary

**Status:** Design-only preview refined after owner review. This does not start or rename roadmap Phase 1.
**Date:** 2026-11-23
**Repository:** `kara-india/PremHousing`; work is on `fix/prem-map-first-heatmap-recovery`, existing PR #4.

## Product architecture

PREM has two experiences with shared identity and separate intent:

1. **Homepage Property Explorer** (`#explore-properties`): listing-first discovery of owner-authorized, PREM-approved available inventory, simple budget/BHK filters, accessible map/list synchronization and direct WhatsApp enquiry. It is embedded into the existing homepage and does not become a full analytical dashboard.
2. **Locality Intelligence Explorer** (proposed `/insights`): a dedicated decision-support workspace with requirements, one of three profiles, evidence layers, locality detail/comparison, explained property recommendations and trade-offs. It never treats asking listings as registered sales, promises investment returns, or emits unsupported safety/quietness scores.

Both share PREM navigation, typography, color tokens, property identity, accessibility patterns and the existing WhatsApp handoff. They do not share one overloaded map or an implicit market metric.

## Core UX rules

- Hard eligibility (budget, property type, BHK and explicit required criteria) is evaluated before soft preference fit. Never silently relax hard filters.
- Preference fit uses separately disclosed, versioned criteria for Standard Residential & Connectivity, Peaceful Living, and High ROI / Investment Potential. No fixed numeric weights or confidence thresholds are claimed approved.
- Recommendations show contributing evidence, unmet criteria, trade-offs, missing information, source/freshness and confidence; insufficient evidence results in no score/no recommendation.
- Market layers remain distinct: sale asking price, monthly advertised rent, price per square foot with area basis, PREM-approved inventory, preference fit, POIs, and infrastructure/development. Every real measure needs source, date, coverage, sample size, methodology and measured/estimated/user-entered designation.
- The revised preview uses actual published PREM listing fields in sample cards and accurately scoped inventory summaries. It presents prices as advertised asking prices, not completed sales, and does not repeat the database source label as a public-facing attribution. The owner states the 32 property records are theirs. No row was edited.
- The property map is visibly schematic because none of the 32 published records has coordinates. The locality intelligence view uses exact stored locality labels and listing counts instead of inventing a heatmap or locality boundaries.

## Technical handoff grounded in current schema

Existing `properties` fields include `id`, `title`, property and transaction type, `status`, `locality_id`, optional `address` and PostGIS geography `location`, `price`, `deposit`, `area_sqft`, bedrooms/bathrooms, furnishing, description, gated, property age, builder, feature and image arrays, source name/URL, verified/published timestamps. `area_sqft` does not currently identify carpet vs built-up basis. Localities have name/slug/city/region and an optional PostGIS centroid, but no boundary geometry, approved alias set, data-source metadata or review status.

Current public access permits selection of localities and published property rows through RLS; staff/admin roles can access management fields. Therefore later map APIs must return a narrow projection rather than serializing unrestricted rows. `status='published'` does not encode PREM approval, source license, coordinate-publication permission or usable photo rights. Do not expose address/exact location unless the owner/data contract authorizes it. The existing UI uses a Supabase browser client and `whatsappUrl(message)`; no service-role key belongs client-side.

Design-time proposed query shape: filter published inventory by required transaction/type, budget, bedroom and locality predicates; request only display-safe columns; require verified PREM approval and explicit coordinate-publication permission before map pin projection; bound to viewport and result limit; omit/null geometry for list results when precise location is restricted. A future server-side aggregation/RPC is required for market observations, privacy thresholds and evidence provenance; do not aggregate live listing prices as transaction ground truth.

Suggested design component groups: shared `PremShell`, `BudgetInput`, `BhkChips`, `PropertyCard`, `EvidenceBadge`, `DataState`, `Attribution`; Homepage `PropertyExplorer`, `ListingMap`, `PropertyResultsList`; Insights `RequirementPanel`, `ProfileSelector`, `EvidenceLayerControl`, `LocalityMap`, `LocalityDetailPanel`, `ComparisonView`, `RecommendationCard`, `WhyThisMatch`. Proposed route `/insights` is a design decision only; confirm route fit against final navigation before implementation.

## Deliverables

- [Design system](DESIGN_SYSTEM.md)
- [Product information architecture](PRODUCT_INFORMATION_ARCHITECTURE.md)
- [Homepage Property Explorer](HOMEPAGE_PROPERTY_EXPLORER.md)
- [Locality Intelligence Explorer](LOCALITY_INTELLIGENCE_EXPLORER.md)
- [Recommendation UX](RECOMMENDATION_UX_SPEC.md)
- [Responsive and accessibility specifications](RESPONSIVE_AND_ACCESSIBILITY.md)
- [Design QA report](DESIGN_QA_REPORT.md)
- [Visual preview](previews/PREM_DESIGN_PREVIEW.html)
- Existing [geospatial data contracts](../architecture/GEOSPATIAL_DATA_CONTRACTS.md), [map research](../research/GEOSPATIAL_STACK_EVALUATION.md), [source register](../research/MIRA_BHAYANDAR_DATA_SOURCE_REGISTER.md) and [map test plan](../testing/MAP_EXPLORER_TEST_PLAN.md) remain governing technical research.

## Read-only inventory check for the revised preview

On 2026-11-23, a read-only query of the PREM Supabase project found 32 published sale listings across seven stored locality labels. All 32 have price and area values; none has an image URL or populated property coordinates. There are 12 one-bedroom, 19 two-bedroom and one three-bedroom records. Advertised sale asking prices range from ₹27L to ₹5.25Cr, with a median of ₹84L. The locality chart uses listing counts: Mira Road 11, Mira Road East 7, Bhayandar East 6, Kashimira 5, and one each in Ketkipada, Mira Bhayandar and Mira Road West. These are inventory-description figures only; they do not measure transactions, locality quality, returns or forecasts. The query was read-only; no property or locality rows were modified.

## Explicitly not approved by this design

Provider/plan and budget, locality boundary source or approximation policy, public point-precision rules, source reuse permissions, data completeness thresholds, profile criteria/weights, minimum sample sizes, and the published-versus-PREM-approved workflow. The design itself made no data change. No forecasting model or feedback-learning workflow is defined here; forecasting remains a separate data-gated roadmap item.

## Phase protection

No application implementation, Supabase mutation, migration or production configuration change occurred. The preview is a static design artifact; it does not change the live homepage. Review the revised preview before implementation work begins.
