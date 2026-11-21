# Prem Housing / Prem Realty master worklist

## Execution cadence

- Each execution window is capped at ten minutes and handles one task or one bounded subtask.
- At task completion: verify it, update this checklist, provide a concise summary, and stop for user review. Do not begin the next task until the user replies.
- Parallel agents may handle independent, read-only audits or isolated workstreams; integrate only after their findings are reviewed.
- Status key: `[x]` complete and verified; `[ ]` pending or not verified. A task stays unchecked if only part of its acceptance criteria is done.

## Phase 0 — audit and preparation

- [x] **0.1 PremHousing audit:** identify runtime routes, live vs. unused components, stack, current flows, and issues. See `docs/01_EXISTING_REPOSITORY_AUDIT.md`.
- [x] **0.1b Estazo audit:** check repository, architecture, licensing, and reuse boundaries. No license is detected; no code/assets are cleared for reuse.
- [ ] **0.2 Placeholder cleanup:** remove/replace unused static demo listings, placeholder video/map code, and dead components after final dependency review. Never seed demo properties.
- [x] **0.3 Supabase inspection:** confirm active PremHousing project, existing tables, RLS, and current empty inventory.
- [x] **0.4a Expanded schema design:** proposed the complete entity map, trust boundaries, state rules, and RLS matrix in [`schema-design-v1.md`](schema-design-v1.md). This is a reviewable design, not an applied schema migration.
- [ ] **0.4b Versioned implementation migration:** generate and test additive SQL for approved tables/policies; do not expand the active project until scope decisions and isolated verification are complete.
- [ ] **0.5 Isolated database verification:** not yet run. Local Supabase CLI resolves through `npx`, but Docker/Postgres runtimes are absent. Use local Supabase after Docker setup or an owner-approved development branch; never use the active project as the test database.
- [x] **0.6 Core migration delivery:** version and push the locality/property/lead foundation migration on the feature branch. Expanded schema migrations remain pending.
- [ ] **0.7 Data-source research:** compare authorized manual inventory, official MahaRERA verification, licensed feeds, and map/POI sources. Verify current terms, usage policies, cost, provenance, and attribution from primary sources.
- [ ] **0.8 Technology/cost research:** compare MVP/balanced/scale costs in INR with dated official prices and explicit usage assumptions.

## Phase 1 — authentication, roles, and staff foundation

- [ ] **1.1 Auth provider setup:** decide and configure email/password, Phone OTP, and/or Google OAuth. Phone/SMS and Google provider credentials are not configured.
- [ ] **1.2 Login UI:** email/password staff login exists; implement/verify any selected OTP or OAuth flows and provide recovery UX.
- [ ] **1.3 Role provisioning:** admin claim instructions use trusted `app_metadata`; provision a real admin account, then define staff, broker-owner, and broker-agent role assignment safely.
- [ ] **1.4 Session/role context:** move role/session handling to a shared auth context/hook if the staff/broker/public surfaces require it.
- [ ] **1.5 RLS policy set:** current locality/property/lead RLS is in place. Add and review multi-tenant broker/customer/audit policies in isolated DB testing.
- [ ] **1.6 Auth/RLS tests:** test anon, staff, admin, broker owner, and broker agent access, including cross-broker isolation.

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

## Phase 9 — forecasting research (optional)

- [ ] **9.1 Data sufficiency:** verify ownership/licensing, coverage, time span, and quality of historical transactions.
- [ ] **9.2 Baseline:** only if data is sufficient, prototype a transparent non-LLM statistical model with uncertainty.
- [ ] **9.3 UX/claims:** do not make guaranteed-price or investment claims; state uncertainty and show “insufficient data” when appropriate.
- [ ] **9.4 Review gate:** obtain human approval before exposing forecast outputs publicly.

## Phase 10 — hardening, review, and launch

- [ ] **10.1 Test suite:** add unit, integration, RLS, and end-to-end tests for approved flows; run existing build/lint.
- [ ] **10.2 Security/accessibility/performance review:** secrets, input handling, RLS, uploads, keyboard/screen-reader support, and bundle/performance checks.
- [ ] **10.3 CI:** add branch checks for lint, tests, and build; current lint is not green.
- [ ] **10.4 Rollback:** document migration backup/restore and feature rollback before production data changes.
- [ ] **10.5 Staging:** verify staging against test/branch DB; no prod deployment from this work branch.
- [ ] **10.6 Production readiness:** business approvals, privacy/legal review, data permission, secrets, SEO, analytics, and monitoring.
- [ ] **10.7 Deploy:** only after a reviewed release checkpoint; monitor post-launch errors and provide a final report.

## Human decisions / creative review

- [ ] Confirm brand naming: Prem Housing / Prem Realty / both.
- [ ] Choose the strongest differentiator: verified and transparent inventory; human local concierge; locality intelligence; or verified broker network.
- [ ] Decide whether broker onboarding and the Golden Profile promotion belong in the first release or a later stage.
- [ ] Approve initial localities, listing/data sources, broker vetting criteria, promotion duration/terms, auth methods, AI languages/provider, WhatsApp model, and marketing IDs.
