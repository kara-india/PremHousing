# Prem Housing — Mira-Bhayandar Real Estate

React + Vite website for Prem Housing, focused on residential and commercial property enquiries across Mira Road and Bhayandar.

## Current implementation
- Responsive public landing page with Buy, Rent, Sell and Commercial enquiry flows.
- Locality navigation and lead form that prepares a WhatsApp enquiry.
- Buy, rent and commercial searches query published Supabase listings with locality, price, deposit, BHK, area and furnishing filters; each result links to a published-only detail page.
- Staff-only `/admin` login and property management for drafts, verification-gated publishing, locality creation, editing, and admin-only deletion.
- No fabricated live property listings or unverifiable listing counts.
- SEO metadata, privacy notice, Vercel SPA routing and baseline security headers.
- WhatsApp destination can be configured with `VITE_WHATSAPP_NUMBER`.

## Local development
```bash
npm install
npm run dev
npm run lint
npm run build
```

## Environment
Copy `.env.example` to `.env.local`, then set the Vite Supabase URL and publishable key, plus `VITE_WHATSAPP_NUMBER` to the official Prem Housing WhatsApp number in international digits-only format. The publishable key is intended for browser use; never add a Supabase secret or service-role key to a `VITE_` variable. Do not commit `.env.local`.

## Database foundation
The first Supabase migration is in `supabase/migrations`. It creates locality, property, and lead tables with PostGIS fields, search indexes, constraints, and row-level security. It intentionally contains no property seed data. Public roles can read published properties and localities; leads have no public insert or read policy yet and must be submitted through a trusted server-side endpoint.

Staff property and lead access is granted only when Supabase Auth users have a trusted `app_metadata.role` claim set to `staff` or `admin`; property deletion requires `admin`. Do not use user-editable `user_metadata` for authorization. The owner applied this schema in the `PremHousing` Supabase project. Its tables are present with RLS enabled, and the current inventory is empty. The app reads published listings with the publishable key; the local CLI project is not linked to the hosted project.

### Staff access setup
Create staff accounts from Supabase Auth. To grant the first admin, run this in the Supabase SQL Editor after replacing the email with the invited account:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin')
where email = 'admin@example.com';
```

Use `staff` instead of `admin` for staff who can create, edit, verify, and publish listings but cannot delete them. The RLS policies allow staff to read and update lead rows; a lead-management screen and safe lead-submission endpoint are still future work. The user must sign out and sign back in for the app metadata claim to appear in a fresh token. There is no public signup flow.

See [`docs/implementation-plan.md`](docs/implementation-plan.md) for the phased delivery plan and external setup decisions.

## Before advertising
1. Confirm the displayed phone number and WhatsApp destination with the business owner.
2. Verify the actual office address, applicable MahaRERA details, business registration and legal/privacy contact.
3. Connect a real CRM/backend for persistent lead storage and assignment; the current form intentionally opens a WhatsApp draft and does not claim to save leads in a database.
4. Publish listings only after owner/agent authorization and availability confirmation.
5. Configure the canonical domain and verify Google Search Console, analytics and ad conversion tracking.
