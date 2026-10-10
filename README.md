# Prem Housing — Mira-Bhayandar Real Estate

React + Vite website for Prem Housing, focused on residential and commercial property enquiries across Mira Road and Bhayandar.

## Current implementation
- Responsive public landing page with Buy, Rent, Sell and Commercial enquiry flows.
- Locality navigation and lead form that prepares a WhatsApp enquiry.
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
Copy `.env.example` to `.env.local` and set `VITE_WHATSAPP_NUMBER` to the official Prem Housing WhatsApp number in international digits-only format. Do not commit `.env.local` or other secrets.

## Before advertising
1. Confirm the displayed phone number and WhatsApp destination with the business owner.
2. Verify the actual office address, applicable MahaRERA details, business registration and legal/privacy contact.
3. Connect a real CRM/backend for persistent lead storage and assignment; the current form intentionally opens a WhatsApp draft and does not claim to save leads in a database.
4. Publish listings only after owner/agent authorization and availability confirmation.
5. Configure the canonical domain and verify Google Search Console, analytics and ad conversion tracking.
