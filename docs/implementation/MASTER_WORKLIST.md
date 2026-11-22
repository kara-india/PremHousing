# PREM — Property & Real Estate Market: master worklist

## Execution cadence

- Each execution window is capped at ten minutes and handles one task or one bounded subtask.
- At task completion: verify it, update this checklist, provide a concise summary, and stop for user review. Do not begin the next task until the user replies.
- Parallel agents may handle independent, read-only audits or isolated workstreams; integrate only after their findings are reviewed.
- Status key: `[x]` complete and verified; `[ ]` pending or not verified. A task stays unchecked if only part of its acceptance criteria is done.

## Phase 0 — audit and preparation

- [x] **0.1 PremHousing audit:** identify runtime routes, live vs. unused components, stack, current flows, and issues. See `docs/01_EXISTING_REPOSITORY_AUDIT.md`.
- [x] **0.1b Estazo audit:** check `kara-india/estazo`, architecture, licensing, and reuse boundaries. No license is detected; use as a concept reference only; no code/assets are cleared for reuse.
- [ ] **0.2 Placeholder cleanup:** remove/replace unused static demo listings, placeholder video/map code, and dead components after final dependency review. Never seed demo properties.
- [x] **0.3 BidMetric Supabase inspection:** owner selected BidMetric as PREM backend. Read-only inventory and Security Advisor findings are in [`bidmetric-supabase-audit.md`](bidmetric-supabase-audit.md); this is an active existing project, not a blank test database.
- [x] **0.4a BidMetric schema/role mapping:** compared PREM queries with BidMetric `properties`, `agent_listings`, `agents`, `profiles`, `buyer_requests`, `leads`, and `market_trends`; documented missing fields, state/value mappings, and role/RLS risks in [`bidmetric-supabase-audit.md`](bidmetric-supabase-audit.md). No rows were queried.
- [x] **0.4b Security migration design:** reviewed the 12 RLS-disabled tables and bid RPCs; backend-only financial, identity, visit, and audit tables are closed to client roles, while auction writes are routed through validated RPCs. Remaining `profiles`, `agents`, and `properties` column/role access still needs a separate reviewed migration.
- [ ] **0.4c PREM schema adapter/additions:** add only missing PREM entities/columns after schema mapping and access decisions; avoid collisions with BidMetric migrations through v018. This is separate from the applied security migration.
- [ ] **0.5 Isolated database verification:** not run. Local Supabase CLI resolves through `npx`, but Docker/Postgres runtimes are absent, and Supabase branching is unavailable on the current plan. Post-apply metadata checks were run on BidMetric at the owner's request; this is not isolated verification.
- [x] **0.5b BidMetric security review, first pass:** applied and verified the first-pass hardening migration. Remaining findings include broad access on `profiles`, `agents`, and `properties`, GraphQL visibility on tables that intentionally remain client-readable, and leaked-password protection disabled. Review before exposing PREM account or listing flows.
- [x] **0.6 Core migration delivery:** version and push the locality/property/lead foundation migration on the feature branch. Expanded schema migrations remain pending.
- [ ] **0.7 Data-source research:** compare authorized manual inventory, official MahaRERA verification, licensed feeds, and map/POI sources. Verify current terms, usage policies, cost, provenance, and attribution from primary sources.
- [ ] **0.8 Technology/cost research:** compare MVP/balanced/scale costs in INR with dated official prices and explicit usage assumptions.

## Phase 1 — authentication, roles, and staff foundation

- [x] **1.1a Auth identity/role inventory:** mapped the existing staff login to Supabase email/password and checked the Auth/profile/agent role boundaries. `auth.users.id` is the identity key; `profiles.role` is self-updatable and cannot authorize staff; trusted `app_metadata.role` is the current PREM staff gate. See [`bidmetric-supabase-audit.md`](bidmetric-supabase-audit.md).
- [x] **1.1b Audience/access decision:** owner confirmed email, mobile, or Google/Gmail sign-in for staff, customers, and brokers; staff can view, edit, and publish across broker listings/activity. Keep customer and broker data scoped. Staff role is provisioned by PREM, never self-selected.
- [x] **1.1c Auth/onboarding requirements:** support email/password, mobile OTP, and Google OAuth; include Remember me; first sign-in asks account type and minimal basics; save an incomplete profile and allow later completion. See [`auth-onboarding-plan.md`](auth-onboarding-plan.md).
- [ ] **1.1d Provider setup:** verify Auth settings in Supabase Dashboard; configure phone SMS delivery, Google OAuth client/redirects, and approved production URLs. The connected Supabase tools cannot inspect provider toggles; no credentials/settings have been changed.
- [ ] **1.2 Login and onboarding UI:** implement the three sign-in choices, Remember me/session-only behavior, account linking, first-login customer/broker onboarding, resumable profile completion, and safe routing. Never offer staff as a self-selected role.
- [ ] **1.3 Role provisioning:** staff are assigned by a trusted PREM admin/server path; brokers map to organization memberships with approval state; customers map to their own account/data. Do not authorize from `profiles.role` or editable `user_metadata`.
- [ ] **1.4 Session/role context:** move role/session handling to a shared auth context/hook if the staff/broker/public surfaces require it.
- [ ] **1.5 RLS policy set:** prevent self-assigned staff/admin privileges; restrict agent verification fields; hide private property columns; allow authorized staff cross-broker read/edit/publish; scope brokers to their organization/assignments and customers to their own records. Verify on an isolated database before rollout.
- [ ] **1.6 Auth/RLS tests:** cover anon, customer, staff, admin, broker owner, and broker agent; prove staff cross-broker view/edit/publish works, brokers cannot cross organizations, customers see only their records, and only the trusted admin path can grant staff/admin roles.

## Phase 2 — admin and listing moderation

- [ ] **2.1 Admin guard verification:** `/admin` checks the signed-in user’s trusted role in UI; prove RLS also blocks unauthorized reads/writes with real test accounts.
- [ ] **2.2 Admin operations:** basic property CRUD exists. Add broker approval, lead/customer views, featured control, and any approved export needs.
- [ ] **2.3 Listing moderation:** add `pending/approved/rejected` review states and rejection feedback for broker-submitted listings; current status is only `draft/published/archived`.
- [ ] **2.4 CSV import/export:** optional; implement only after data format and owner workflow are defined.
- [ ] **2.5 Admin RLS:** verify administrator access across all approved resources and deny regular staff/broker access to unrelated records.
- [ ] **2.6 CRUD acceptance:** use a provisioned admin and test create, edit, publish, unpublish, reject, and delete flows.

## Phase 3 — public property search and maps

- [ ] **3.1 Dynamic property pages:** public detail route is dynamic and published-only. Replace/archive the unused demo detail component and add image storage only after owner media is supplied.
- [ ] **3.2 Search query:** published-property search and locality/transaction/type/price/deposit/BHK/area/furnishing filters exist; verify with approved rows.
- [ ] **3.3 Map view:** choose Mapbox/Google/other provider, configure a restricted token, plot listings, and support marker/list interaction.
- [ ] **3.4 Transaction-specific values:** confirm sale/rent/lease units and displayed price semantics; schema currently uses `price` plus optional `deposit`.
- [ ] **3.5 Heavy-deposit handling:** a minimum-deposit filter exists; add transaction-specific UX and acceptance coverage.
- [ ] **3.6 Contextual filters:** hide or explain inapplicable filters for sale/rent/commercial flows.
- [ ] **3.7 Search acceptance:** verify representative owner-authorized records, correct result ordering, empty state, map/list behavior, and detail links.

## Phase 4 — locality intelligence

- [ ] **4.1 Approved POI source:** choose permitted data source and categories for stations, transit, hospitals, schools, parks, emergency services, and commercial hubs.
- [ ] **4.2 POI provenance:** model coordinates, category, source/attribution, confidence, and last-verified time; load only permitted data.
- [ ] **4.3 Distance/scoring:** implement transparent proximity measures and rule-based security/connectivity/family/business scores; avoid claims based on unsupported safety proxies.
- [ ] **4.4 Ranking:** combine hard filters with explainable soft preferences and clear trade-offs; never bury valid options solely due to weak soft score.
- [ ] **4.5 Map POI layers:** accessible map layers/markers and source attribution.
- [ ] **4.6 Location acceptance:** compare representative distances to known coordinates and test scoring with reviewed examples.

## Phase 5 — AI consultant and recommendations

- [ ] **5.1 Model/budget decision:** select provider, server-side budget, languages, and retention policy.
- [ ] **5.2 Chat UX:** multi-turn requirement clarification with explicit human handoff.
- [ ] **5.3 Search tool:** structured, RLS-safe search function with validated fields and bounded result count.
- [ ] **5.4 Grounded explanations:** cite only returned property/POI fields; report no exact match and trade-offs honestly.
- [ ] **5.5 Conversation/requirements retention:** define minimal storage, access, deletion, and retention before persistence.
- [ ] **5.6 Consent handoff:** ask before saving contact details or creating a lead.
- [ ] **5.7 Multilingual behavior:** validate English, Hindi, Marathi, and Hinglish only if included in scope.
- [ ] **5.8 AI acceptance:** test at least three reviewed dialogues and measure retrieval constraint accuracy; no fabricated listing details.

## Phase 6 — broker partner portal

- [ ] **6.1 Scope decision:** confirm launch timing, supported localities, broker verification owner, and onboarding eligibility.
- [ ] **6.2 Broker identity:** model broker organizations, owners, agents, invitations, and status without client-editable privilege claims.
- [ ] **6.3 Promotional profile:** decide “Golden Profile” duration/terms and disclose it as a promotion, not a trust/RERA endorsement; enforce expiry server-side.
- [ ] **6.4 Submission workflow:** broker-owned drafts → pending review → approved/rejected; prevent cross-broker access.
- [ ] **6.5 Broker dashboard:** listings, assigned leads, site visits, and minimal performance data.
- [ ] **6.6 Notifications/visits:** implement only selected channels and consented workflows.
- [ ] **6.7 Moderation/duplicate detection:** verify ownership/permission and duplicate checks before public approval.
- [ ] **6.8 Broker acceptance:** test two broker accounts and prove they cannot read/change each other’s data.

## Phase 7 — leads, CRM, and WhatsApp

- [ ] **7.1 Consent UX:** add explicit opt-in language/checkbox before storing name, phone, or requirements; provide purpose/retention notice.
- [ ] **7.2 Server-side capture:** add validated, rate-limited Edge Function/API; no public direct insert into `leads`.
- [ ] **7.3 Assignment and lifecycle:** define staff/broker assignment, status, follow-up, site visit, and audit events.
- [ ] **7.4 CRM UI:** show only authorized leads; support filtering by property, agent, broker, status, and permitted campaign source.
- [ ] **7.5 WhatsApp:** choose click-to-chat vs. Cloud API/template messages, verify provider setup/cost, and only send notifications after consent.
- [ ] **7.6 Attribution:** capture approved UTM fields and deduplicate events/leads.
- [ ] **7.7 Privacy rights:** define retrieval/update/deletion, retention, and breach response with qualified legal review.
- [ ] **7.8 Lead acceptance:** verify no lead is stored without consent and no broker can access an unrelated lead.

## Phase 8 — marketing, analytics, and SEO

- [ ] **8.1 Event plan:** approve analytics IDs, event taxonomy, cookie/consent policy, and attribution requirements.
- [ ] **8.2 GA4/GTM:** implement consent-aware page/search/property/contact events and verify once per action.
- [ ] **8.3 Meta Pixel/CAPI:** implement only after business IDs and server-side secret storage are configured.
- [ ] **8.4 Campaign QA:** verify in vendor debug tools; test duplicate handling and lead attribution.
- [ ] **8.5 SEO metadata:** dynamic title/description, structured data from verified fields, and crawlable property pages.
- [ ] **8.6 Sitemap/local SEO:** generated sitemap for published listings and approved organization details.
- [ ] **8.7 SEO/analytics acceptance:** validate events, metadata, canonical URLs, performance, and accessibility.

## Phase 9 — forecasting and verified feedback loop (planned, data-gated)

Detailed design and acceptance criteria: [`forecasting-feedback-plan.md`](forecasting-feedback-plan.md). Forecast work is a separate, paused workstream; it does not authorize collecting restricted data or exposing estimates publicly.

- [ ] **9.1 Scope and target definition (Pause 1):** confirm launch geography and hierarchy, eligible property/transaction types, forecast grain, target (nominal/real price or price per sq ft), currency/area units, horizons (candidate 1/3/5 years), forecast cadence, and decision use. Keep the India → Maharashtra → MMR → city → locality example provisional until approved.
- [ ] **9.2 Data-source, license, and privacy audit:** prioritize verified registered transactions or owner-authorized records. Verify official source availability and current reuse terms; classify licensed data, internal broker actuals, asking-price listings, public indexes, and synthetic data separately. No ToS-violating scraping; listings are not sale ground truth; synthetic data is development-only.
- [ ] **9.3 Ingestion and provenance design:** define raw/normalized records, stable source IDs or hashes, import timestamps, source/license, observed date, quality/verification status, units, deduplication, correction history, and privacy-safe aggregation. Do not import personal identities.
- [ ] **9.4 Label, feature, and snapshot contract:** specify target/adjustments, static and time-varying features, as-of cutoffs, and reproducible training snapshots. A snapshot may contain only observed historical actuals available at its cutoff; preserve the exact feature/label version.
- [ ] **9.5 Forecast schema and access design:** propose migrations for source catalog, observed outcomes, snapshots, model registry, forecast runs/predictions, outcome matches, evaluations, and deployments. Define immutable completed runs, append-only forecast ledger, service-only writes, least-privilege RLS, and rollback. Verify on an isolated database before applying to BidMetric.
- [ ] **9.6 Temporal evaluation and baselines:** establish chronological rolling-origin backtests and a final holdout; compare carry-forward/seasonal-naive or trend baselines before advanced models. Report MAE/RMSE/MASE/bias, interval coverage and probabilistic scores; avoid unqualified MAPE. No random split that leaks future observations.
- [ ] **9.7 Modeling and hierarchy decision:** keep three concepts distinct: multilevel regression/partial pooling for nested cohorts; hierarchical time-series reconciliation (e.g. bottom-up/MinT) for aggregate-to-local forecast coherence; and continual learning from newly verified actuals. Assess compatible, licensed baselines such as StatsForecast and HierarchicalForecast before deeper models.
- [ ] **9.8 Forecast ledger MVP (Pause 2):** create versioned run metadata and immutable point/interval predictions with as-of date, target period, geography/entity key, horizon, model version, snapshot ID, and uncertainty. Verify forecasts cannot be silently edited and held-out forecasts remain immutable.
- [ ] **9.9 Actual collection and matching (Pause 3):** ingest only verified observed outcomes with source provenance; match matured forecasts by geography/entity, target period, and documented tolerance. Do not write forecasts or estimated values into the actuals table.
- [ ] **9.10 Evaluation/reporting (Pause 4):** calculate horizon- and segment-level errors, bias, directional accuracy, interval coverage/calibration, and sample counts; suppress or aggregate small cells where privacy or source terms require it. Show predicted-vs-actual and uncertainty bands in an internal dashboard.
- [ ] **9.11 Drift, retraining, and promotion (Pause 5):** monitor input and error drift; create model cards; retrain only from verified actuals available before the new cutoff. Use shadow/challenger evaluation and human approval before promotion; never learn from prior predictions.
- [ ] **9.12 Public forecast UX and claims:** publish only after data sufficiency, backtest, privacy, and human review gates pass. Show as-of date, horizon, sample count, interval/uncertainty, provenance limitations, and “insufficient data” states; no guarantees or investment advice.
- [ ] **9.13 Forecast acceptance:** prove temporal no-leakage, immutable completed forecasts, correct actual matching, per-horizon metric correctness, ground-truth-only retraining, reproducibility, uncertainty reporting, and safe data handling. Forecasting remains non-production until all gates pass.

## Phase 10 — hardening, review, and launch

- [ ] **10.1 Test suite:** add unit, integration, RLS, and end-to-end tests for approved flows; run existing build/lint.
- [ ] **10.2 Security/accessibility/performance review:** secrets, input handling, RLS, uploads, keyboard/screen-reader support, and bundle/performance checks.
- [ ] **10.3 CI:** add branch checks for lint, tests, and build; current lint is not green.
- [ ] **10.4 Rollback:** document migration backup/restore and feature rollback before production data changes.
- [ ] **10.5 Staging:** verify staging against test/branch DB; no prod deployment from this work branch.
- [ ] **10.6 Production readiness:** business approvals, privacy/legal review, data permission, secrets, SEO, analytics, and monitoring.
- [ ] **10.7 Deploy:** only after a reviewed release checkpoint; monitor post-launch errors and provide a final report.

## Human decisions / creative review

- [ ] Choose the strongest differentiator: verified and transparent inventory; human local concierge; locality intelligence; or verified broker network.
- [ ] Decide whether broker onboarding and the Golden Profile promotion belong in the first release or a later stage.
- [ ] Approve initial localities, listing/data sources, broker vetting criteria, promotion duration/terms, auth methods, AI languages/provider, WhatsApp model, and marketing IDs.
- [ ] Confirm PREM's first forecast geography, property/transaction segments, target units, and whether a forecast is useful to customers or only internal teams; exact market scope materially changes data feasibility.
- [ ] Configure Google OAuth and SMS delivery in Supabase using provider credentials stored only in the provider dashboard/secret manager, never in Git or public tables.
- [ ] Confirm staff/admin deletion and account-management boundaries separately; staff has cross-broker view/edit/publish, while admin-only deletion is the current app behavior.
