# PREM geospatial data contracts

**Status:** Phase 0 proposed contracts; descriptive only. No database schema or production SQL is defined here. These contracts constrain future schema/API design and ingestion. Do not load source data until its rights and local coverage are approved in the [source register](../research/MIRA_BHAYANDAR_DATA_SOURCE_REGISTER.md).

## 1. Shared rules

- Every external or user-supplied feature must have a source record, source-specific rights, source version/date, ingestion time, and a traceable source identifier or submitter reference. If any required rights are unknown, the feature is not eligible for public display.
- Distinguish **observed**, **user-submitted**, **officially published**, **PREM-derived**, and **forecast** data. A source authority does not make a field independently verified.
- Store facts as asserted by their source. Never silently normalize a draft plan to an approved plan, asking price to transaction price, planned transit to operational transit, or a missing observation to zero.
- License terms are properties of a source dataset/feature lineage, not a single global `source_type`. Keep attribution and downstream obligations available to API and map rendering layers.
- Do not use scraped real-estate portals, Google Maps content, unlicensed government pages, or public OSM tile/Nominatim endpoints as bulk data feeds. No source can be added based solely on public accessibility.
- Public outputs must not expose source credentials, private submissions, user identity, exact private-home coordinates, staff contact details, or hidden moderation fields.

## 2. Locality entities and boundary geometries

### Conceptual contract

A locality is first a named product concept, then optionally a bounded geography. A place label can exist without a geometry. This avoids manufacturing “official” borders for common names such as Mira Road East or Kashimira.

Required conceptual fields:

| Field | Contract |
|---|---|
| Stable locality identifier | PREM-generated immutable ID, independent of a display name. |
| Canonical name and aliases | Preserve source spelling and language/script; alias matching must not imply identical geometry. Record who approved the canonical label. |
| Boundary status/type | `unbounded_label`, `authoritative_admin`, `authoritative_planning`, `licensed_community`, or `approximate_user_defined`. Do not call an approximate shape authoritative. |
| Geometry | Optional polygon/multipolygon. Use WGS84 longitude/latitude (GeoJSON CRS84 / PostGIS 4326 convention). Reject empty, invalid, self-intersecting or antimeridian-inconsistent shapes; retain a validated source geometry version. |
| Source lineage | Source publisher, dataset/resource, source feature ID, source version/effective date, access date, license ID/URL and snapshot/checksum, required attribution, transformation history, operator. |
| Scale and precision | Source cartographic scale/resolution and intended-use constraints; never imply precision finer than source permits. Record coordinate/generalization precision. |
| Effective time | `valid_from`, `valid_to` when known, source publication date, and PREM ingestion time. A later map revision creates a new version rather than silently overwriting history. |
| Review | `unreviewed`, `checked`, `approved_for_display`, `superseded`, or `withdrawn`; reviewer and review date. “Checked” must state its method. |

### Boundary rules

- Do not derive residential locality shapes by buffering a road, scraping portal locality labels, or drawing from intuition. A user-defined shape may be used only with visible “approximate PREM area” treatment and a documented method/approver.
- An election ward is an administrative overlay, not a neighborhood polygon. Census ward/town boundaries must retain the Census vintage and code and must not be relabelled as modern neighborhood boundaries.
- Keep jurisdiction/admin boundaries in a separate boundary class from product locality boundaries; preserve publisher terminology and effective dates.
- Boundary joins must declare method (`within`, `intersects`, point-in-polygon, manual assignment) and tie-break behavior for overlaps/gaps. For ambiguous records, return `unassigned` rather than guessing.

## 3. POIs and infrastructure

Required conceptual fields:

| Field | Contract |
|---|---|
| Identity | PREM feature ID; source feature ID/GERS or other stable identifier when supplied; duplicate/cross-source links kept as explicit match assertions, not destructive merges. |
| Type | Controlled PREM category plus original source taxonomy. Separate public destinations from transit infrastructure/waypoints where the source does so. |
| Public name/location | Only facts that source terms permit PREM to publish. Avoid personal names, direct staff contact details, and private residential destinations. Store point/line/polygon geometry only at permitted precision. |
| Provenance/license | Source publisher, theme/resource/release, source feature identifier, source license and version, source-level attribution text, access/ingestion dates, and transform/conflation lineage. |
| Quality/freshness | Source confidence if present, PREM verification method, verifier, `last_verified_at`, observed status, and expected refresh policy. Do not invent a numeric confidence where source supplies none. |
| User-facing text | Source and “last checked” date available for critical map facts; stale/unknown records can be hidden or clearly marked. |

Rules:

- Pilot coverage and quality before treating any feed as complete for Mira–Bhayandar. Overture Places is monthly and source-licensed; OSM is ODbL and community-maintained. Do not combine sources in a way that loses source-level rights.
- For OSM, show required map attribution and license link. Product must support changing map/geocoding provider. The OSM public tile service is not an offline tile source, and public Nominatim must not be used for systematic POI collection or autocomplete.
- Store map presentation tiles separately from feature data. A tile provider's terms are not the data license; no tile caching or prefetch beyond the selected provider's policy.
- Do not geocode address data through a service unless its terms allow the use, storage, and display intended. Do not submit confidential or personal data to public geocoders.

## 4. Market observations, listings, and transactions

These are different object types and must never be collapsed into one “price” field.

### Observation contract

For every observation, record:

- **Kind:** `asking_sale`, `asking_rent`, `verified_transaction`, `official_disclosure`, or another named class; forecasts belong in a separate model-output contract.
- **Value:** amount, currency (`INR` where supported), amount period (sale total / monthly rent / other), and the source's wording. Do not infer a missing currency, rent period, or negotiable amount.
- **Property basis:** residential/commercial type, unit type, BHK where known, and area value plus basis (`carpet`, `built_up`, `super_built_up`, `plot`, or `unknown`) and original unit. Do not compare per-area values with unknown/mixed area basis.
- **Time:** `observed_at` (when PREM/source observed it), `source_as_of` where available, valid/availability period, and ingestion time. A date scraped from a page is not the same as transaction date.
- **Location:** locality assignment and method; optional coarse map cell only when source rights and privacy policy allow it. Do not expose exact coordinates of private homes from market observations.
- **Provenance:** source record URL/reference or submitter ID stored privately, source rights, source version, method, data-quality review, and a hash/immutable raw snapshot only if retention rights permit. Do not retain restricted page copies.
- **Status:** active, expired, withdrawn, duplicate, disputed, verified, or unverified. Never infer sold/available status from an inaccessible URL alone.
- **Privacy:** no owner/broker/customer personal data in aggregate market outputs. Keep contact details in a separate access-controlled workflow only when consent and business need exist.

### Interpretation

- An asking price is an offer, not a completed sale. MahaRERA disclosure is a project filing, not unit resale availability. IGR consideration is a deed-record field, not necessarily a clean comparable and may carry party data.
- Show source class and time window beside market summaries. Exclude or separately label low-quality, duplicate, stale, or disputed records.
- Do not call outputs “future predictions” until historical observations are sufficiently complete and representative, leakage and validation procedures are defined, and confidence/error reporting is approved. Until then, report descriptive ranges only when supportable.

## 5. Aggregation and map rendering

- Every derived statistic must carry a reproducible definition: included source classes, input cohort/filter, date range, geography assignment method, area basis, outlier policy, calculation version, run time, and sample count.
- Use locality choropleths only for approved, sourced polygons. For unbounded locality labels, show a name/summary card or point-level sample distribution only at permitted coarse precision; do not display a fabricated boundary fill.
- Use equal-area/grid or other explicitly documented spatial aggregation where appropriate; record CRS and cell resolution. Do not smooth/interpolate a sparse sample into a continuous surface or show a heatmap that implies unsupported precision.
- Return explicit `no_data`/`insufficient_sample` for absent or suppressed values. Do not color as zero and do not fill missing geography from a neighboring locality.
- Small-cell suppression is mandatory for public observation counts and sensitive user reports. The minimum threshold `k` is a product/privacy decision that must be set before launch, tested for differencing and sparse residential areas, and applied consistently across map, API, exports and cached responses. A count threshold alone does not guarantee anonymity.
- Show sample count or an agreed band, observation window, last refreshed date, and source class. Suppression should not reveal the hidden value through repeated filters, overlapping boundaries, or differenced requests; apply query controls or coarser rollups as needed.
- Do not expose exact reported hazards, incident addresses, tenant reports, or individual property coordinates where this could identify a person or home. Generalize or suppress using a privacy-reviewed rule.

## 6. Provenance and source governance

Each source registration should capture:

1. Publisher, dataset/resource title, stable URL/ID, scope and field-level coverage.
2. Source license name/version/URL and saved license/terms snapshot date; commercial-use determination and any counsel/owner decision.
3. Required credit text, share-alike or redistribution conditions, excluded fields, retention/deletion requirement, allowed transformations, and access method/rate limits.
4. Dataset release/effective date, retrieval time, checksum (where permitted), source identifier semantics, known quality limitations, and expected update interval.
5. PREM owner, approval date, allowed product feature(s), review date, expiration/revocation contact, and operational freshness owner.

Ingestion should fail closed when license, source version, coordinates/CRS, or required attribution is absent. Maintain a source/attribution registry that map and report surfaces can query. Keep separate source lineage for joins and derived datasets so an ODbL source does not silently become indistinguishable from permissively licensed facts.

## 7. Privacy and access boundaries

- Apply data minimization: retain only fields necessary for the approved feature. Treat names, phone/email, account IDs, precise home locations, and free-text reports as personal or potentially identifying.
- Public-facing POIs must represent public destinations, not private residences or individual staff. Never copy contact details from MBMC directories into public search results absent explicit rights and necessity.
- Staff may have expanded review access as a product requirement, but privileges must be role-checked server-side and audited. Staff visibility does not grant authority to republish source-restricted data.
- Separate public, authenticated-submitter, moderation/staff, and source-license metadata. Do not send service credentials or private submitter identity to clients.
- Define data retention and deletion for withdrawn listings, user reports, and expired licenses. Preserve a minimal audit tombstone where needed, with personal data erased or de-identified as policy/law requires.
- Any exact location shown for a listing must be consented and reflect the actual property only if legally authorized; otherwise use an approximate centroid or locality-level presentation clearly labelled as approximate.

## 8. Decisions required before implementation

1. Authoritative geography provider and allowed boundary types for product localities.
2. POI pilot source(s): licensed Overture extract, licensed OSM extract/provider, MBMC feed, or a reviewed combination; choose after local coverage audit and license review.
3. Written source rights for MBMC/MahaRERA/IGR/MMRDA data and any submitted listing media/coordinates.
4. Public coordinate precision for each entity type and disclosure/consent controls.
5. Small-cell threshold and anti-differencing policy for aggregates and user-submitted reports.
6. Observation taxonomy, required area basis, stale/duplicate thresholds, and minimum historical coverage before any forecast feature.
7. Source governance owner, review cadence, correction/takedown workflow, and attribution placement.
