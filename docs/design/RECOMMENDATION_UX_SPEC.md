# PREM Recommendation UX and Explainability

**Status:** Design-only recommendation contract; weights, evidence thresholds and production scoring require product/data approval.
**Principle:** Filter for eligibility first; rank only with evidence; say when the evidence is not enough.

## User-facing promise

PREM may help a user compare eligible homes and locality evidence against their chosen priorities. It must not imply that a ranking is objective truth, a professional valuation, a forecast, or a guarantee of lifestyle or investment outcomes. A recommendation is an explanation of a versioned rule set applied to current, disclosed evidence.

Three layers are visually distinct:

1. **Eligibility:** Does the property satisfy the user's non-negotiable requirements?
2. **Preference fit:** How does this eligible option align with the chosen profile, using the evidence actually available?
3. **Evidence quality:** How complete, current, comparable and source-authorized is that evidence?

These must not collapse into one opaque percentage.

## Requirement collection

Collect only what's needed to shortlist:

- Maximum budget in INR, with Indian digit grouping and a clear maximum label.
- Residential property type using values supported by the actual schema.
- BHK: All, 1, 2, 3+ (null bedroom count remains “not stated,” not a false match).
- Optional supported fields such as area range or furnishing only when they materially help and are present in the current data model.
- One of exactly three profile choices: Standard Residential & Connectivity, Peaceful Living, or High ROI / Investment Potential.

Show a compact editable summary before results. The user may remove optional preferences. Do not ask for name, phone, email or account before browsing. Do not store anonymous answers unless a separate retention/consent design is approved.

## Hard eligibility rules

The candidate pool is limited to public, PREM-approved, currently published listings accessible through the intended RLS-safe query. Apply hard filters as exclusion rules before preference ranking:

- `price <= max_budget`; budget currency is INR and transaction semantics are shown separately.
- Property type exactly matches the selected type.
- BHK matches the selected rule: 1, 2 or >=3; unknown bedroom count cannot satisfy a specific BHK requirement.
- Other explicitly selected hard constraints must be supported by a trusted field. If unsupported or missing, ask the user whether it is a hard constraint or explain that the constraint cannot currently be applied. Never silently ignore it.

The design should display “matches all selected requirements” only when every active hard constraint was evaluated. A result that fails a hard constraint is excluded even if it has strong soft-preference evidence. If no exact result exists, offer the user options to broaden a specific rule without modifying it automatically.

The current public schema/query does not express a PREM editorial approval workflow separately from `status='published'`. The result contract therefore needs a future explicit definition of PREM approval/publication before this recommendation surface can rely on it. The current 32 MagicBricks-attributed rows are not cleared for display or scoring; do not modify them during design.

## Three profile criteria

Profiles are qualitative presets over **evidence dimensions**, not claims that a model knows what the user will like. The dimension set and relative priorities are configurable and must carry a `profile_version`. Do not publish numerical weights until sample sufficiency and metric direction have been validated against local examples.

### Standard Residential & Connectivity

Candidate criteria:

- Verified access to rail/public transport and road network.
- Verified proximity to schools/colleges, hospitals, markets and essential amenities.
- Listing affordability relative to the user's budget.
- Residential convenience supported by a clear, non-composite method.

Explain a reason only as narrowly as the data supports: “Mapped hospital within X distance of the approximate locality center,” not “excellent healthcare.” Distance is straight-line or network distance only if labelled, sourced and correctly computed.

### Peaceful Living

Candidate criteria:

- Documented residential land-use context.
- Distance/context for major roads, explicitly a proxy rather than a measurement of noise.
- Verified parks/green spaces with source and coverage.
- Built density or environmental evidence only where a dated, comparable source exists.

Do not infer safety, crime, noise, air quality or serenity from POI absence, image appearance or distance alone. If credible local environmental evidence is unavailable, show it as unavailable and remove it from any ranking denominator only according to the approved coverage method.

### High ROI / Investment Potential

This profile requires stronger safeguards and must clearly separate:

- **Rental yield:** compatible, rights-cleared observed monthly rent and property price denominator, with cohort, gross/net definition, date and expenses treatment explicit. Do not compute if either input is an unverified asking quote or mismatched cohort.
- **Capital appreciation:** historical change in compatible observed transaction values, not a future promise. Asking-price index changes must be labelled as advertised asks.
- **Future potential:** speculative scenario only if later approved as forecasting; keep separate from observed metrics, show uncertainty/as-of date, and never phrase as guaranteed ROI.

Until sufficient licensed outcomes and comparable rental evidence exist, render this profile as “Investment evidence unavailable” or show only separately labelled factual listing/context attributes. Never derive “high ROI” from the lowest asking price, a planned project announcement or distance to a station.

## Ranking and score presentation

Recommended processing contract:

1. Normalize units and verify freshness/provenance for each criterion.
2. Apply hard eligibility filters.
3. Resolve comparable evidence for the selected profile; missing evidence is tagged unknown, not zero.
4. Check approved coverage and sample-size thresholds for that profile/method version.
5. Only if the gate passes, compute a normalized preference fit under a documented method; otherwise return a non-scored explanation and the evidence that is available.
6. Order candidates deterministically, with a tie-breaking rule that does not falsely imply market quality (for example, transparent relevance then stable listing ID).

The UI may use a **qualitative fit label** (“Strong evidence match,” “Some criteria align,” “Not enough evidence”) only when its rule is documented. Pair labels with coverage, not a percent gauge. If an eventual numerical score is approved, it must show the method version, covered criteria/total considered, uncertainty or evidence-quality context, and never mix missing evidence into the score as a zero or silently renormalize without stating the method.

No locality winner or investment label is shown when evidence is incomparable, stale, sparse, not rights-cleared or missing a material profile dimension. A high property score cannot compensate for failed budget/BHK constraints.

## Explanation card and property detail

Each eligible recommendation card includes:

- Listing facts: available title, cleared photo, asking price, locality, BHK, area basis/value, and furnishing/features only when present.
- Match status and evidence coverage state.
- **Why this appears:** up to three criterion-level explanations, tied to actual evidence/source/date.
- **Trade-offs:** criteria that are not met or weakly evidenced, stated without judgment.
- **Not known:** missing data relevant to this profile.
- Controls to open property details, compare, and enquire through the existing PREM WhatsApp integration.

Example explanation template (not an assertion about current PREM inventory):

> Fits your selected budget and BHK. A licensed transit dataset places a mapped rail station within the stated distance of this approximate locality area (source/date). School coverage is incomplete, so this result cannot be ranked on that factor.

Do not use fabricated sample listing names, prices, local statistics or feature claims in production copy. Any design-only fixture must be conspicuously labelled “Illustrative mock data.”

## Locality comparison UX

Comparison explains differences instead of creating one winner. The user chooses two or three localities. Show only comparable rows with units, geographic basis, source/date, coverage and missing data. Group rows into:

- **Observed asking evidence:** sale, rent and area-basis cohorts separated.
- **Connectivity and amenities:** source-verified counts/distances with measurement method.
- **Infrastructure:** dated statements and exact status; proposed and operational remain distinct.
- **Profile alignment:** covered criteria and explicit unknowns, optionally a gated versioned fit label.

Let users pin a priority or revisit the profile; do not make the comparison depend on a hidden aggregate score. On mobile, preserve row headers and provide a stacked accessible comparison.

## No-match and insufficient evidence

### No exact match

State which hard constraints produced zero results. Offer reversible, user-selected alternatives such as:

- Raise the budget cap (show current cap and new value before applying).
- Include nearby localities (only if their names/coverage are verified).
- Change BHK to All or a broader selection.
- Clear an optional furnishing/area preference.

Never change a hard filter without a direct user action. Keep a route back to the original criteria.

### Insufficient locality evidence

State the missing source/coverage, what can still be explored, and when the underlying data was checked. Keep property search available; do not show empty color ramps, “0” for unknown, fabricated scores, or inferred safety/travel claims. Distinguish:

- No published PREM listings match.
- No location-authorized listings can be mapped.
- No licensed observations for this layer.
- Evidence exists but is too sparse/stale/incomparable to rank.
- Provider/API unavailable.

## Component and API handoff

Proposed composable UI elements:

- `RequirementSummary`, `BudgetField`, `PropertyTypeSelect`, `BhkSelect`.
- `PreferenceProfileGroup` with radio semantics and profile explanation.
- `EligibilityResultCount`, `EvidenceCoverageBadge`, `CriterionExplanationList`, `TradeoffList`, `UnavailableEvidenceNotice`.
- `RecommendationCard`, `RecommendationDetailPanel`, `LocalityComparisonTable`, `NoMatchAlternatives`.

Proposed search input: `{ budgetMax, propertyType, bhkRule, optionalFilters, profileId, profileVersion, localityIds? }`.

Proposed result fields: `{ listingId, eligibility: { passed, evaluatedConstraints, unknownConstraints }, fit: { status, score?, methodVersion?, coveredCriteria, totalCriteria }, explanations: [{ criterionId, direction, evidenceValue, unit, sourceId, observedAt, geographyBasis }], tradeoffs: [], unavailable: [], evidenceQuality: { coverage, freshness, comparability }, propertyProjection }`.

The optional score is null unless the approved coverage and confidence gates pass. The current database does not contain profile methods, locality indicators, observation lineage, source-license registry or score snapshots. Do not fabricate them in Supabase. Query only an approved, published listing projection under RLS; perform sensitive aggregation server-side if future design requires it. Keep numerical forecasts outside this recommendation contract and out of any LLM response.

## Required design QA examples

Review each profile against:

1. A fully eligible listing with strong evidence in several dimensions.
2. An eligible listing with some criteria unknown.
3. A listing that exceeds budget (must be excluded despite other strengths).
4. A locality with no verified amenities or boundaries.
5. A stale or incomparable price observation.
6. The investment profile with no verified rent/transaction history.
7. No exact match with alternatives that require explicit user consent.

Acceptance requires correct distinction between eligibility and preference fit, visible source/coverage, truthful unknown states, hard-constraint preservation, keyboard/screen-reader usability and no fabricated numerical claims.
