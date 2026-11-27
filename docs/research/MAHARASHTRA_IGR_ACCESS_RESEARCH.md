# Maharashtra IGR transaction-data access research

**Research status:** initial source-access review, 2026-11-28. This is not legal advice and does not grant a data-use right.

## Owner-approved objective

Research authorised access before designing PREM's transaction-forecast data pipeline. Establish permitted access and reuse, licensing and commercial-use restrictions, availability of transaction-level records, cost, and access conditions. The owner does not currently confirm possession of an authorised Maharashtra IGR transaction export.

## Findings from official sources

1. The Maharashtra government's historical e-governance report describes IGR/iSARITA online eSearch facilities for property/document and Index II searches. This supports the existence of an individual search service, but the report is from 2013 and does not establish a present-day bulk feed, API, commercial reuse licence, or stable machine-readable transaction export. [Government of Maharashtra, State of E-Governance in Maharashtra (2013)](https://maharashtra.gov.in/site/upload/WhatsNew/State%20of%20E-Governance%20in%20Maharashtra%2C%202013%20compressed.pdf)
2. The IGR Maharashtra Citizen Charter describes document-search services and individual requests at Sub-Registrar offices under the Registration Act. The available charter is not sufficient evidence of current fees or bulk/commercial reuse conditions; confirm current service terms directly before budgeting or implementation. [IGR Maharashtra Citizen Charter (PDF)](https://grievanceigr.maharashtra.gov.in/pdf/Citizen_Charter_English.pdf)
3. The department's published portal terms caution that online information is not itself a legal statement. Those terms do not describe a bulk transaction-data licence or API. [IGR Maharashtra portal terms](https://grievanceigr.maharashtra.gov.in/home/termscondition)

## What remains unverified

- Whether IGR currently offers an authorised bulk export, API, or another structured transaction-level product.
- Whether registration consideration, property attributes, locality, area basis, and registration dates can be obtained consistently enough for PREM's target series.
- The access prerequisites (account, application, institutional status, security, rate limits, or in-person process).
- Current pricing, licence scope, commercial use, onward display, retention, and derived-statistics rights.
- Whether any public search result may lawfully be retained or combined with PREM data for internal model evaluation.

The available official sources demonstrate search/document-request pathways, not an authorised reusable dataset. **Do not infer bulk access or permission from the ability to search individual records.** No restricted page was scraped, no login or CAPTCHA was bypassed, and no access request was sent.

## Next research steps

1. Locate current IGR guidance specifically for eSearch/Index II, certified/uncertified document copies, bulk access and data sharing; record page date and exact conditions.
2. Identify the appropriate official IGR contact or formal application route for written clarification on structured transaction-level exports and internal/commercial derived use. Draft a question for owner review; do not send it without the owner's explicit authorization.
3. Compare only sources with documented rights. Keep registered transaction observations separate from portal asking prices, broker actuals, and synthetic test data.
4. If no permitted source is available, record the gap and keep forecasting internal-only or paused; do not scrape restricted systems or present asking prices as registered transactions.

## Forecasting implications

- No production schema, ingestion, or model should assume an IGR export exists.
- Any later sample requires source/license metadata, provenance, transaction verification, consistent carpet-area basis, deduplication, privacy controls, temporal cutoffs, and legal review.
- Public forecasts remain disabled until rights, verified evidence, backtests, uncertainty and calibration, methodology, and separate owner approval pass.
- Raw transaction documents may only be considered after legal review of retention, purpose/consent, access, secure deletion, and metadata retention. The proposed 90-day deletion target is not authorization to implement automatic deletion.
