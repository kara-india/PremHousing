# PREM map evidence thresholds — proposal for owner review

**Status:** draft recommendation, not owner-approved policy. Do not render rate colors until the owner reviews these thresholds, data rights/provenance are confirmed, and each relevant dataset passes the checks below.

## Why the layers stay separate

Four different evidence types must remain independent: registered sale transactions, verified completed rental transactions, PREM-verified advertised sale asking prices, and PREM-verified advertised monthly rents. Asking prices and advertised rents are seller/landlord expectations; they are not completed transactions. Carpet-area and built-up-area observations also cannot be blended into one rate series.

RBI's published comparison of registration-based HPI with portal-derived advertised prices describes meaningful level and composition differences. NHB RESIDEX methodology uses product medians, transaction-count weights, and a four-quarter moving average for a city index. These support careful segmentation and smoothing for an index; neither source establishes Mira Road micro-locality thresholds or a locality-level market rate. [RBI comparison](https://www.rbi.org.in/Scripts/BS_ViewBulletin.aspx?Id=19659) · [NHB methodology](https://www.nhb.org.in/wp-content/uploads/2023/12/WHITE-PAPER-NHB-RESIDEX-METHODOLOGY.pdf)

The proposed sample cutoffs below are conservative operational guardrails for PREM's small-area map, not statistical standards claimed by RBI/NHB. A single minimum count cannot guarantee representativeness. Coverage, source bias, segment mix, duplicate records, and geographic quality must also pass.

## Proposed gates by layer

| Layer | Minimum observations and time window | Geographic and composition gate | Quality, source and duplicate checks | If any gate fails |
| --- | --- | --- | --- | --- |
| **Registered sale transactions** | At least **10 distinct verified registrations** in the trailing **12 months**. Review quarterly. | Evaluate only within a supported locality boundary. For micro-areas, require a verified boundary and the same 10-record gate inside it. Keep property type, bedroom/size band, and area basis consistent; do not blend carpet and built-up area. | Traceable registration/transaction evidence and observation date; deduplicate by transaction/property; at least **5 distinct buildings**; normalize price per a single verified area basis; flag related-party, partial-share, and extreme/outlier records for review. State that registration consideration can differ from all-in market value. | Suppress the rate fill. Show “insufficient verified transactions” with count and period. Do not interpolate from adjacent areas. A broader locality summary may be shown only if it independently passes the same gates and is labelled at that broader geography. |
| **Verified rental transactions** | At least **12 completed, verified leases** in the trailing **12 months**. Review quarterly. | Same supported geography and consistent property/bedroom/area segments. Use a single comparable rent measure; do not mix monthly rent with rent per square foot. | Evidence that the lease completed, not just an enquiry or listing; observation date and verification method; deduplicate household/property/lease; at least **5 distinct properties**; disclose if the sample is mostly from one broker or building. | Suppress the rate fill and show an insufficient-evidence state. Do not substitute advertised rent or extrapolate. |
| **PREM-verified advertised sale asking prices** | At least **15 current, authorized listings**, each observed within **90 days**; confirm availability at least every **30 days**. | Same supported geography and comparable segment/area basis. A project name alone is not a micro-locality. A micro-area fill requires an approved boundary and the full gate inside it. | Documented right/authority to use each observation, observation date, deduplication across portals/brokers and reposts, at least **5 distinct developments/buildings**, and preferably **3 independent authorized contributors/channels**. Report PREM's inventory coverage and bias; asking price is not a transaction price. | Suppress color and show the eligible sample count, last checked date, and why it falls short. A PREM inventory snapshot may be shown as such, but not described as the area's representative market rate. |
| **PREM-verified advertised monthly rents** | At least **15 current, authorized rental listings**, each observed within **60 days**; revalidate at least every **14 days**. | Same supported geography and comparable property/bedroom/area segment. Keep monthly rent and deposit separate. Do not map a rent-per-square-foot value unless the area basis is verified and consistent. | Documented permission/authority, observation date, rental availability/status, deduplication by property and cross-post, at least **5 distinct properties/buildings**, and preferably **3 independent authorized contributors/channels**. Disclose PREM sample coverage and bias. | Suppress color. Show insufficient evidence and sample age/count. Never relabel asking rent as a completed lease. |

## Aggregation and display rules

1. Apply counts after deduplication, verification, segment matching, and exclusion of records with unknown area basis—not to raw rows.
2. Prefer the median with a visible interquartile range or other clearly explained spread. Do not display a continuous interpolated heatmap from area points or use a single property to color an area.
3. Display layer name, evidence type, observation period, sample count, source/method, geographic unit and boundary basis, area basis, last updated date, and a plain-language completeness/confidence note.
4. Never transfer a neighboring area's color to a sparse area. If the locality passes but a micro-area does not, show only the locality-level value and label it as locality-level.
5. Use separate legends for residential, rental, and investment preference lenses. A preference lens does not change the evidence layer or imply safety or return guarantees.
6. Retain a suppression state with its reason; do not present blank/missing data as a low price.
7. Keep NHB/RBI city-level index context separate from PREM's local observations. Do not downscale Mumbai HPI/RESIDEX into Mira Road or micro-area numbers.

## Owner review questions

- Are the proposed cutoffs (10 registered sales, 12 completed rentals, 15 sale asks, 15 rent asks) acceptable as initial publication gates, or should any be raised?
- Should “3 independent authorized contributors” be mandatory for asking-price/rent map colors, or can an explicitly labelled PREM-inventory-only sample ever qualify?
- Is the 90-day sale-ask / 60-day rent-ask recency window acceptable, with 30-day / 14-day availability rechecks?
- Should the first map show only locality-level medians until a meaningful reviewed micro-area sample exists, even when a boundary is eventually obtained?

## Map data and licensing reference

OSM-derived POIs may be persisted only in a logically separate dataset with source, extraction date, licence, attribution and update metadata. OSMF recommends visible, legible OpenStreetMap attribution near the produced work and a link to ODbL information; its guidance also says attribution belongs in database/derivative-database metadata where applicable. Dataset-separation and share-alike treatment depend on whether PREM creates a derivative database or a collective database, so review the actual schema/distribution before publishing an extract. [OSMF attribution guidance](https://osmfoundation.org/wiki/Licence/Attribution_Guidelines) · [OSMF produced-work guidance](https://osmfoundation.org/wiki/Licence/Community_Guidelines/Produced_Work_-_Guideline) · [OSMF licensing FAQ](https://osmfoundation.org/wiki/Licence_and_Legal_FAQ)

Do not persist Google Search or Places results. Do not use public OSM raster tile servers as PREM's production tile host. No OSM extraction or POI import was performed as part of this proposal.
