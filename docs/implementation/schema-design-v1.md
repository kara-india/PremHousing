# Prem Housing database design — v1 proposal

Status: **design proposal, not yet applied to Supabase**. This expands the existing locality/property/lead foundation without making a production schema change. Product and role assumptions below must be reviewed before an executable migration is applied.

## Principles

- Keep Supabase Auth as the identity source. Never accept role claims from editable `user_metadata`; platform staff authorization uses trusted `app_metadata` until a managed role-provisioning path exists.
- Keep customer accounts optional. A buyer can enquire without an account; persist personal data only after explicit, versioned consent.
- Keep broker organizations as tenants. Broker ownership is an organization ID, not an Auth user ID. Every broker-owned read/write must be scoped to an active membership.
- Preserve the existing public rule: anonymous visitors can read published properties and public locality information only. Drafts, submissions, documents, leads, appointments, chat, attribution, and audit events are private.
- Keep moderation explicit. A listing is not public just because a broker submitted it. Promotion is a paid/featured placement and never represents trust or regulatory verification.
- Save source, permission, attribution, confidence, and last-verified time for external/locality data. Do not derive safety claims from unverified proxies.
- Do not create forecast tables before the separate historical-data sufficiency review.

## Existing tables to retain

| Table | Role in v1 | Proposed additive changes |
|---|---|---|
| `localities` | Public locality directory | Keep current columns; POIs reference a locality. |
| `properties` | Canonical listing record | Add nullable broker ownership/submitter fields and a review state. Existing owner/admin listings continue to work. Keep `status` (`draft/published/archived`) separate from review state. |
| `leads` | Consented enquiry and lifecycle | Add optional assigned staff/broker references and consent purpose metadata; preserve the existing no-public-insert policy. Capture through a validated server-side endpoint later. |

## Proposed tables

| Table | Main fields / links | Access boundary |
|---|---|---|
| `staff_profiles` | `user_id` → `auth.users`, display/contact fields, staff role label, active flag | User can read own profile; staff can read the directory; admins provision/deactivate. Profile fields do not grant access by themselves. |
| `broker_organizations` | legal/display name, contact, RERA identifier/status, verification state, timestamps | Active members read their organization; staff administer all. RERA verification is a recorded check, not a blanket endorsement. |
| `broker_memberships` | `organization_id`, `user_id`, `owner/agent`, `invited/active/suspended`, timestamps | User reads own membership; staff administer. Owner invitations require a trusted server-side action, not client-side role edits. |
| `property_media` | property, storage object path, alt text, order, uploader | Public reads only for published listing media; brokers manage media on their own non-published listings; staff moderate. |
| `property_documents` | property, private storage path, document kind, review state, reviewer/time | No anonymous access; assigned broker organization and staff only. Store objects in a private bucket and use short-lived signed URLs. |
| `property_submissions` | property, organization, submitter, JSON listing snapshot, submission status, reviewer/time, rejection reason | Broker can create/read its own submissions; only staff can review. Broker cannot update reviewer/status fields after submission. |
| `locality_pois` | locality, category, point, source/source URL/license, confidence, verified time | Public read only for reviewed POIs; staff curate. No unlicensed bulk import. |
| `customer_requirements` | optional Auth user, optional lead, transaction/property/locality/price/BHK preferences, consent/retention fields | Private to the customer and authorized staff; assigned broker gets only explicitly assigned requirements. |
| `chat_conversations` | optional user/lead, session identifier, language, consent state, retention expiry | Private to the owner and authorized staff. Anonymous ephemeral chat should not be persisted by default. |
| `chat_messages` | conversation, speaker (`user/assistant/system`), content, optional grounded property references, created time | Inherits conversation access; never expose system prompts or provider credentials. Retain only under an approved policy. |
| `property_visits` | property, lead/customer, assigned staff or broker membership, requested/confirmed/completed/cancelled state | Customer sees own visit; assigned staff and the assigned broker see only their visit. |
| `lead_followups` | lead, assigned user, due time, result, completion time | Assigned staff and authorized admins; broker sees only follow-ups explicitly assigned to that broker. |
| `lead_attributions` | lead, first/last-touch UTM fields, approved campaign/source labels, capture time | Staff only. Do not store ad platform secrets or unrestricted click identifiers here. |
| `audit_events` | actor, action, entity type/ID, minimal before/after metadata, timestamp, request correlation ID | Append-only writes through trusted server-side operations; staff/admin read. Avoid copying unnecessary customer PII into event payloads. |

## State and integrity rules

- `properties.status` remains `draft`, `published`, or `archived`. Add a separate review state such as `not_required`, `pending`, `approved`, or `rejected`; only staff can move a submission to `approved` and publish it.
- A broker edit to an already published listing must create a new submission/snapshot. It must not silently rewrite the public version.
- Use foreign keys with deliberate delete behavior: preserve audit history; null optional lead/property references where lawful; cascade only private child records that have no retention requirement.
- Add indexes for tenant and lookup paths: `(organization_id, user_id, status)`, `properties(broker_organization_id, status)`, submission queue `(status, submitted_at)`, POI locality/category/geography, assignment/status/date for leads and visits, and conversation/created time.
- Use check constraints for enum-like state, non-empty identifiers, valid confidence range, consent timestamp/version pairing, and valid numeric bounds.
- Keep a promotion record separate from broker verification: organization, start/end, placement, terms/version, and payment reference if monetization is approved. Expiry must be enforced server-side.

## RLS policy matrix to implement and test

| Resource | Anonymous | Customer | Broker owner/agent | Staff/admin |
|---|---|---|---|---|
| Localities and reviewed POIs | Read public rows | Same | Same | Read/write |
| Published properties and public media | Read published only | Same | Same plus own drafts | Read all; manage/review |
| Broker organizations/memberships | None | None | Own active organization and own membership | Manage all |
| Private documents/submissions | None | None | Own organization only; submitted snapshots read-only | Review/manage |
| Leads, requirements, chats, visits | None | Own consented records only | Explicitly assigned records only | Authorized staff; admin oversight |
| Attribution and audit events | None | None | None | Read; trusted server writes append-only |

Every exposed table must have RLS enabled and only the minimum SQL grants. Policies must use `TO anon` / `TO authenticated` explicitly and combine authentication with ownership/tenant predicates. `UPDATE` policies need both `USING` and `WITH CHECK`. Never put service-role keys in the browser. Test allow and deny cases, including two broker organizations attempting cross-tenant access.

## Migration and verification sequence

1. Confirm owner decisions on broker launch, broker vetting, assignment, retention, and selected auth providers.
2. Generate an additive migration with `supabase migration new`; do not rewrite the already-applied foundation migration.
3. Implement schema, grants, RLS, indexes, constraints, and pgTAP tests together.
4. Apply migrations to an isolated local Supabase stack or a separately approved development branch. Do not test expanded DDL on the active project.
5. Run migration replay, RLS allow/deny tests, Supabase security advisors, and verify that the current public search still sees only published rows.
6. Only after review and successful isolated verification, schedule the migration for the active project.

## Current 0.5 environment check (2026-11-22)

The repository has `supabase/config.toml` (Postgres 17) and the existing core migration. This workstation has `npx`, but no Supabase CLI, Docker, PostgreSQL client/server, or Podman. `npx supabase@latest --version` resolves CLI 3.2.0, but there is no local container runtime to run an isolated Supabase database. The active project will not be used as a substitute. A local run requires Docker Desktop plus the CLI; a hosted branch requires the owner to choose an organization and approve any quoted cost.

Official guidance reviewed: [local database migrations](https://supabase.com/docs/guides/local-development/database-migrations), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security), [custom claims and RBAC](https://supabase.com/docs/guides/api/custom-claims-and-role-based-access-control-rbac).
