# PREM authentication and first-login onboarding

Status (2026-11-23): **auth/onboarding foundation and isolated Phase 1 broker/staff access slice implemented and synthetically tested; live provider setup, first-admin bootstrap, and rollout remain open.** This document translates the owner's account and access requirements into a safe implementation plan. It is not a claim that Google or phone Auth is production-ready.

## Frontend progress (2026-11-23)

The app has shared sign-in entry points at `/auth`, `/auth/callback`, `/auth/reset-password`, first-login/profile routes at `/onboarding` and `/account`, and a staff link from `/admin` that returns to the staff route after sign-in. Email/password sign-in, signup, reset email, phone OTP request/verification, Google OAuth initiation/callback handling, provider error messaging, and remembered/session-only storage are implemented. Customer/broker onboarding never offers staff; staff still routes through the trusted `app_metadata.role` guard. The `prem_accounts` table and owner-scoped RLS are applied and synthetically tested on PremHousing. Identity linking and complete interactive provider verification remain open.

Owner decision: Phase 1 uses email/password only. Phone and Google choices are hidden while disabled and are deferred to a later phase; the owner does not need to configure SMS/OAuth now. A read-only Auth settings check on PremHousing found email signup enabled. The Node suite now has 11 passing tests. Six versioned Phase 1 migrations and the synthetic broker/staff/admin RLS matrix pass on isolated project `wnmmxgnhpojllspcdgds`. `manage-prem-access` is deployed there with JWT verification; no-auth smoke returns 401. Broker registration/review UI is implemented behind `VITE_ENABLE_BROKER_ORGANIZATIONS=false`. Email-flow verification, first-admin bootstrap, authenticated privileged function success, and authorized active-project rollout remain pending.

## Confirmed requirements

- Staff, customers, and brokers can choose email, mobile, or Google/Gmail sign-in.
- Include a Remember me choice.
- On first successful sign-in, ask whether the person is a customer or broker and collect minimal basic information. Save progress and allow profile completion later.
- Staff can view, edit, and publish broker listings and broker activity across organizations.
- Public property browsing remains available without an account.

## Credential and identity handling

- Supabase Auth is the identity and credential system. It stores password credentials securely and manages verified email/phone and Google identities. PREM must not store plaintext passwords, password hashes, OAuth tokens, or Google/SMS provider secrets in a public application table.
- Store only the profile and onboarding data PREM needs in database tables. Use Auth as the source of truth for verified login email/phone; copy a value only if there is a documented product need and synchronized update/deletion behavior.
- Remember me controls whether the browser session persists across browser restarts. Checked means persistent storage; unchecked means session-only storage. It does not change the user's role or authorization.
- Support one PREM account per person. If a user adds Google/email/phone later, require proof of control and link the new identity to the existing Auth user. Do not silently create duplicate customer/broker profiles based on matching email or phone strings.

## First-login and account-type boundary

Detect onboarding from the absence of a PREM onboarding/account record, not a fragile comparison of Auth creation and last-login timestamps. After any sign-in method succeeds:

1. Create or load the PREM account record.
2. If no account type is recorded, prompt for `customer` or `broker`; never offer `staff` or `admin` in this public flow.
3. Collect only quick basics required to continue (recommended: display name and preferred contact confirmation). Make optional profile fields skippable.
4. Save `onboarding_status = incomplete` when the user skips; show a clear resume/complete-profile action later.
5. For brokers, mark onboarding `pending` and require trusted staff to attach/approve an organization membership before broker listing/lead access is enabled.
6. Customers can continue to browse; private saved requirements/visits require an authenticated, owner-scoped record and appropriate consent.

## Proposed role and permission matrix

| Actor | Public listings | Broker listings/activity | Private customer data | Staff/admin management |
|---|---|---|---|---|
| Anonymous | Read approved public fields | None | None | None |
| Customer | Read approved public fields | None | Own records only | None |
| Broker | Read approved public fields | Own organization and assigned work only | Only explicitly assigned, consented work | None |
| Staff | Read approved public fields | Read, edit, and publish across organizations | Minimum data needed for authorized operations | No staff-role grants; admin delete remains separate |
| Admin | Read approved public fields | Staff access plus approved moderation | Authorized operational scope | Provision staff, approve broker memberships, and delete only through trusted policies |

Staff/admin privileges must be checked in the database/API as well as hidden or shown in the UI. The current client reads `app_metadata.role`; only a trusted server/Admin API may assign it. Never use client-editable `user_metadata` or `profiles.role` to grant privilege. `profiles.role` is self-updatable in BidMetric and its values (`buyer`, `rera_seller`, `channel_partner`) do not represent PREM staff authorization.

Staff's requested cross-organization write access is limited here to broker listings/activity editing and publishing. It does not grant staff the right to edit broker verification, organization membership, staff roles, billing, or unrelated customer PII. Those remain separately controlled.

## Proposed database shape (review before migration)

Avoid repurposing the legacy `profiles.role` field. Add a PREM-specific account/onboarding table with:

- `user_id` primary key → `auth.users.id`
- `account_type` constrained to `customer` or `broker` for self-service onboarding
- `onboarding_status` such as `incomplete`, `complete`, or `pending_review`
- minimal profile fields, initially display name and optional contact preference
- created/updated timestamps and a server-managed review timestamp/status where applicable

Use column-level grants and RLS so a user can read and update only permitted own profile fields; do not permit clients to change account type after first selection, verification, membership, or any trusted role. Broker organization/membership state should be separate and staff-managed. Keep staff roles in the trusted server-managed path. Add no `password`, password hash, OAuth token, or provider secret columns.

The app now targets the owner-selected PremHousing project (`swrhmpnjyvnascpqdjir`). Its Phase 0 account/access migration and synthetic RLS suite are applied and verified there. BidMetric is inactive for PREM and must not receive migrations or app writes.

## Sign-in choices and setup gates

- **Email:** implement verified email/password sign-in, recovery, and account creation only through the approved onboarding route. Confirm email confirmation and SMTP deliverability settings.
- **Mobile:** implement phone OTP; configure a supported SMS provider, sender, rate limits, budget, and abuse protections before enabling it.
- **Google/Gmail:** implement Supabase Google OAuth; configure OAuth client credentials in the provider dashboard/secret store, exact callback and site redirect URLs, and production/preview origins. Never commit these secrets.
- **Remember me:** implement an explicit persistent vs. session-only storage choice and verify sign-out clears the relevant stored session. Confirm behavior across refresh, tab close, and browser restart.
- Supabase provider toggles are not exposed through the currently connected plugin, so verify current Dashboard settings manually before enabling flows. Google and SMS provider credentials have not been supplied/configured.

## Implementation and acceptance gates

1. Confirm email challenge mode, Google provider availability, SMS provider/cost, and Remember me behavior.
2. Keep the applied PremHousing account/RLS migration under version control; run future database changes on PremHousing or another owner-confirmed isolated target. Never apply PREM changes to BidMetric.
3. Implement login method selection and first-login account type/profile onboarding; skip and resume must work without duplicating records.
4. Implement staff assignment and broker organization approval through a trusted path. A public account must not become staff/admin by choosing a role or editing profile fields.
5. Add database-level acceptance coverage for: customer own-row access; broker organization isolation; staff cross-broker listing read/edit/publish; denial of staff role grants; admin-only deletion; and private customer-data boundaries.
6. Verify email, phone, and Google identity linking does not create duplicate PREM account records; test Remember me persistence and session-only expiration.

Do not expose the new login choices as production-ready until provider setup, isolated RLS checks, and the role-boundary acceptance criteria pass.
