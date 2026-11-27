# PREM engineering handoff

Use this page to resume PREM work with another coding assistant. The repository is the canonical record of product decisions and engineering state; read the linked sources before changing code, schema, or data.

## Repository and current status

- Repository: [kara-india/PremHousing](https://github.com/kara-india/PremHousing)
- Product: PREM, focused on Mira Road and Bhayandar.
- Read first: [`MASTER_WORKLIST.md`](MASTER_WORKLIST.md), then the latest dated worklog under `docs/` (currently [`worklog-2026-11-28.md`](../worklog-2026-11-28.md)). The master worklist is authoritative when older worklog text conflicts.
- Current open implementation focus: Phase 4 locality explorer acceptance. At 320px the homepage/search has horizontal overflow; 390/768/1440 looked usable. A real screen-reader pass and 320px diagnosis/fix remain open. The map's production bundle has already been reduced; Vite still emits an advisory because chunks exceed its uncompressed threshold.
- Phase 4 map research: [`MAP_EVIDENCE_THRESHOLDS.md`](../research/MAP_EVIDENCE_THRESHOLDS.md), [`MAHARASHTRA_IGR_ACCESS_RESEARCH.md`](../research/MAHARASHTRA_IGR_ACCESS_RESEARCH.md), and the Phase 4 section in the master worklist.
- Current production map provider is Mapbox. Do not change providers or hide bundle warnings without a measured, approved plan.

## Key approved decisions

- All 133 active PremHousing property rows are owner-authorized PREM inventory; do not edit them without a separate task and current DB review.
- Locality candidates without a literal, defensible text clue remain broad Mira Road. No external lookups, inferred micro-locality assignment, or database reassignment; ambiguous candidates await manual review.
- Market evidence has four distinct layers. The thresholds (10 registered sales/12 months; 12 completed rentals/12 months; 15 sale asks/90 days; 15 advertised rental asks/60 days) and a minimum of three independent authorized contributors for asking-price/rent colors are approved only as provisional implementation/testing gates. They do not prove statistical reliability or authorize public colors. Require a separate explicit publication approval and suppress inadequate evidence.
- Golden Profile is a free 30-day promotion with the benefits and exact disclosure recorded in Phase 6 of the worklist. No guaranteed leads/rank/verification, no RERA endorsement, no charge/conversion at expiry.
- No authorised Maharashtra IGR export is confirmed. Phase 9 starts with source-access/reuse research. Do not scrape restricted sources or treat portal asks as transactions; keep forecasting internal-only until rights and evidence are established.
- The proposed 90-day raw evidence deletion target is for legal review only. Do not implement automatic deletion before approved retention, purpose/consent, access, secure-deletion, and metadata policies.
- Cost ceiling, primary/backup incident owners, final support-hours confirmation, final evidence retention, and analytics IDs remain open. Mon–Sat 10:00–19:00 IST is the approved initial planning schedule, pending confirmation.
- The owner approved Prem Jha's primary contact for public use, but do not commit phone digits or credentials/secrets to the repository. Use approved configuration/secrets management.

## Data and environment safety

- Supabase references used in prior work: active PremHousing `swrhmpnjyvnascpqdjir`; isolated `Prem Phase 1 Test` `wnmmxgnhpojllspcdgds`. The owner edits Supabase tables in parallel. Inspect current schema and migration history read-only before any database work; never assume the recorded state is still current.
- Do not write to production or change data unless the current task explicitly authorizes that exact scope. Never delete broadly or run remote reset commands.
- Never commit `.env*`, API keys, service-role/secret keys, access tokens, auth sessions, personal data, or local review artifacts.
- The 112-listing manual review CSV is outside this repository at `PREM-local-review`. It was deliberately not committed. Supply it separately if a future assistant needs to perform that review. Existing untracked crawler/SQL artifacts were intentionally left untouched and uncommitted; inspect only when a specific task authorizes it.
- Vercel/Supabase/GitHub authentication is held outside Git and may need reauthentication for another assistant. Do not assume browser/plugin sessions transfer.

## Resume checklist for another assistant

1. Pull the latest `master`, check `git status` and review recent commits; preserve unrelated/local files.
2. Read this handoff, `MASTER_WORKLIST.md`, the latest worklog, and the specifications linked under the relevant phase.
3. Identify the next unchecked task and its acceptance criteria. Preserve the owner's paused scopes and pending approvals.
4. For data or schema tasks, read the current database state first and do not overlap the owner's parallel changes.
5. Make a focused change, run only the checks appropriate to that change, update the worklist/worklog, and report the diff, checks, remaining blockers, and any required owner input.

## What this handoff cannot transfer

The repo contains the durable decisions and research cited above, but cannot transfer another AI's credentials, plugin/browser sessions, unsynced local files, or the owner's parallel Supabase edits. The local CSV must be separately shared for manual review; credentials should be configured securely in the new environment, never pasted into Git or this document.
