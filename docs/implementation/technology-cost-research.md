# PREM technology and operating cost scenarios

**Research date:** 2026-11-23
**Currency conversion:** ₹94.1159 per US$1, the RBI site’s displayed FBIL exchange rate as at 1pm on 2026-11-16. USD conversions below are budgeting estimates, not the provider’s invoice rate. Provider invoices may use a different conversion date/rate and add applicable taxes, FX fees, or carrier charges.

## Summary and recommendation

For a small commercial launch, budget about **US$87 / ₹8,150 per month** for the services modeled in the MVP scenario. This includes commercial hosting, Supabase Pro, 500 single-segment phone OTP messages at Twilio’s published India list price, and no paid map/AI usage. The OTP estimate is a major uncertainty: India sender, carrier, DLT, and provider approval requirements can change the actual cost or integration path.

At the balanced scenario’s modeled traffic, the same stack is about **US$336 / ₹31,600 per month**. At the scale scenario’s modeled traffic and Supabase Team plan, the line-item estimate is **US$2,309 / ₹217,300 per month**, before Vercel usage above included credits, unmodeled paid map products, email/SMS extras, taxes, FX, support contracts, domains, and operational staffing.

These are scenario estimates, not a forecast or a vendor quote. PREM should launch with explicit spend caps/alerts and measure actual bills before committing to a higher tier. The present repository is a Vite SPA and already uses Supabase; the researched hosting and database providers match that stack.

## Scenario assumptions

| Driver | MVP | Balanced | Scale |
|---|---:|---:|---:|
| Auth monthly active users | 1,000 | 10,000 | 75,000 |
| OTP sends | 500 | 2,000 | 10,000 |
| OTP billable segments per send | 1 | 1 | 1 |
| Transactional email | 2,000 | 20,000 | 80,000 |
| Google India Dynamic Maps loads | 20,000 | 90,000 | 250,000 |
| Google India Geocoding requests | 20,000 | 90,000 | 200,000 |
| AI consultant chats | 0 | 5,000 | 30,000 |
| AI tokens per chat (input / output) | — | 3,000 / 700 | 3,000 / 700 |
| Forecasting approach | batch/statistical model; no LLM call priced | same | same |

Every scenario assumes one production app, one billing account/project, one paid Vercel seat, one SMS per OTP attempt and no retries or multi-segment Unicode messages. SMS pricing is per message segment, so real OTP costs may be higher. Usage assumptions are illustrative, not measured production telemetry. No images, file storage overages, RERA/manual inventory labor, database migration engineering, support labor, monitoring vendor, CDN image transforms, Maps Places/Routes/Street View, or domain registration are included.

## Monthly estimate

Provider prices below were read on 2026-11-23. USD line items are converted at the RBI rate above. Prices exclude applicable tax unless the vendor states otherwise.

| Service | MVP | Balanced | Scale | Basis |
|---|---:|---:|---:|---|
| Supabase | $25 / ₹2,353 | $25 / ₹2,353 | $599 / ₹56,375 | Pro in MVP/balanced; Team in scale. First project/compute configuration as shown on pricing page. Existing BidMetric billing may make PREM incremental cost different. |
| Vercel | $20 / ₹1,882 | $20 / ₹1,882 | $20 / ₹1,882 + usage | Pro starting subscription. Includes $20 usage credit; the model does not assert that all scale traffic fits the credit. One commercial project, one paid seat. |
| Email (Resend) | $0 / ₹0 | $20 / ₹1,882 | $90 / ₹8,470 | Free quota at 2k; Pro at 20k; Scale at 80k, so the 80k workload fits 100k quota. |
| Google Maps Dynamic Maps (India) | $0 / ₹0 | $42 / ₹3,953 | $378 / ₹35,575 | India 70k monthly free cap per SKU, then $2.10 per 1,000 through 5m. |
| Google Geocoding (India) | $0 / ₹0 | $30 / ₹2,823 | $195 / ₹18,352 | India 70k monthly free cap per SKU, then $1.50 per 1,000 through 5m. |
| SMS OTP (Twilio India list) | $41.60 / ₹3,915 | $166.40 / ₹15,661 | $832 / ₹78,304 | $0.0832 per outbound SMS segment; before carrier, sender, failed-message, DLT or tax charges. |
| AI consultant API | $0 / ₹0 | $32.50 / ₹3,059 | $195 / ₹18,352 | GPT-6.1 Luna Standard rates of $1/M input and $5/M output tokens; 3k input + 700 output per chat. Do not use an LLM as the source of numeric price forecasts. |
| **Modeled subtotal** | **$86.60 / ₹8,150** | **$335.90 / ₹31,614** | **$2,309 / ₹217,314 + Vercel usage** | Rounded to nearest rupee. |

Supabase Team is a conservative scale scenario rather than a technical requirement. If PREM can stay on Pro, replace the scale Team line with $25 (or $35 if a second paid project is needed); the estimate drops by $574 per month (about ₹54,023). Keep projects isolated where appropriate, but do not treat an unverified active production database as a staging environment.

The MVP email volume fits Resend Free’s 3,000 monthly emails, but its 100/day cap applies. Supabase Auth’s built-in email service should not be assumed to provide production delivery; budget and configure custom SMTP before enabling users. Balanced and Scale use paid Resend plans. If PREM uses a different SMTP vendor or its existing service, substitute that negotiated cost.

## Unit-cost calculations and cautions

- **FX:** $1 × ₹94.1159. Source is the RBI current-rates page, quoting FBIL at 1pm 2026-11-16. Rounded rupee results are estimates.
- **Supabase:** Pro starts at $25/month and includes $10 compute credits (enough for one Micro instance as shown), 100k MAUs, daily backups with seven-day retention, and 250GB egress. Team starts at $599/month and provides team/security/compliance features and longer retention. Additional projects/compute, storage, egress, auth MAUs and other metered items can add charges. The PREM/BidMetric project’s current plan and invoice were not verified in this research, so these totals are not incremental invoice commitments.
- **Vercel:** Pro starts at $20/month and includes $20 usage credit. Hobby is restricted to personal/non-commercial use under Vercel terms, so it is not the recommended production tier for PREM. Usage above credits and added paid seats cost extra; a scale deployment requires measured usage and a spend limit.
- **Maps:** Google India pricing eligibility requires a billing account with a large majority of in-region usage. The modeled Dynamic Maps and Geocoding SKUs each have separate 70,000 monthly free usage caps. Maps, Places, Routes and other SKUs are charged separately; only the two named SKUs are estimated. The India price sheet is effective 2024-08-01, with the current free cap scheme from 2025-03-01. Recheck the live calculator before enabling usage.
- **Alternative maps:** Mapbox GL JS currently lists the first 50,000 web map loads free, then $5 per 1,000 for 50,001–100,000, $4 per 1,000 for 100,001–200,000, and $3 per 1,000 thereafter through 1m. Its scale price for 250k loads is approximately $800/month ($5×50k + $4×100k + $3×50k per 1,000), before other products. A map load occurs when the Map object initializes. This makes Google India Dynamic Maps much cheaper for the chosen India scenario; validate features, attribution, and data rights before choosing a provider.
- **Phone OTP:** Twilio’s public India page quotes $0.0832 per outbound segment for international numbers and alphanumeric sender IDs, with domestic/alphanumeric sender discounts via sales. Additional carrier fees can apply; failed message processing is listed at $0.001. Indicative cost of 500/2,000/10,000 one-segment sends is $41.60/$166.40/$832. India DLT registration, approved sender/template routing and delivery for authentication must be confirmed before production. Unicode or long messages may use multiple billable segments. Supabase integration may require a supported provider or a custom SMS hook; verify this exact provider path before implementation.
- **India OTP alternative:** MSG91’s public India-to-India price table lists 5,000 OTPs at ₹0.25 each (₹1,250 before GST), then lower volume tiers. Its stated 27,000 example is ₹5,400 plus 18% GST. It could reduce SMS costs substantially, but it is not included in the scenario totals because its fit as a direct Supabase Auth SMS provider and the current DLT/contract setup were not verified. Evaluate a custom hook and delivery SLA before switching.
- **Email:** Resend currently offers 3,000 emails/month free with a 100/day limit; Pro is $20/month for 50k and Scale $90/month for 100k. Additional paid-plan messages are $0.90 per 1,000. Authentication, onboarding and transactional workflows should use a verified sender domain, SPF/DKIM/DMARC and delivery monitoring.
- **AI:** Official API pricing lists `gpt-6.1-sol` Standard at $1 per million input tokens and $5 per million output tokens. At 3,000 input and 700 output tokens per answer, the estimate is $0.0065 per chat: 5,000 chats ≈$32.50 and 30,000 ≈$195. Prompt size, retries, tool calls, model choice and traffic alter this. Keep model/API credentials server-side and apply per-user quotas. Classical forecasting should be batched and evaluated against historical holdouts; this estimate excludes analyst/model-development labor and any inference service not selected.
- **Tax and currency:** Scenario totals exclude GST/VAT and card/FX fees. Vendor tax treatment depends on billing location and account details. Do not add a blanket tax rate until invoices/billing entities are confirmed.

## PREM decision guidance

1. **MVP:** Supabase Pro and Vercel Pro; verified transactional SMTP; start with email/password and Google OAuth if provider readiness is complete. If mobile OTP must launch, validate India sender/route requirements and budget for retries before public enablement. Use Google Maps only after key restrictions, usage quotas and billing alerts are in place; otherwise begin with an attributed static/approved map experience.
2. **Balanced:** retain Pro tiers; choose either a reviewed India-eligible Google setup or Mapbox only after a real usage test. Use a domestic SMS quote/contract if it integrates safely with Supabase Auth. Put a monthly ceiling on external-model chat, record token usage, and keep property search deterministic and database-filtered.
3. **Scale:** do not upgrade Supabase to Team solely because traffic grows; use Team when its controls, retention, support or organizational access justify the price. Load-test Vercel, database query patterns, storage and egress; model image delivery separately. Recalculate Maps SKU usage and paid OTP delivery from measured data. Keep customer-facing predictions gated on data provenance and out-of-time evaluation.

### Decisions still needed before a committed budget

- Confirm current Supabase organization plan, compute size, paid-project count, storage/egress and whether PREM shares costs with BidMetric.
- Choose the production hosting account/region and number of paid Vercel seats, or use a reviewed alternative.
- Confirm email provider and sending volume; validate domain ownership and deliverability.
- Confirm India OTP vendor, DLT responsibility, expected retries, message language/segments and provider support in Supabase Auth.
- Decide map vendor and actual SKUs (map render, geocoding, autocomplete, place details, routes) after legal/terms and feature review.
- Define AI model and per-user limits only after product scope, retention and data handling are approved.
- Recompute against measured 30-day usage and real invoices before increasing traffic or removing spend caps.

## Official price and documentation sources

All accessed 2026-11-23 unless a page states a published effective date.

- [Supabase pricing](https://supabase.com/pricing)
- [Vercel pricing](https://vercel.com/pricing), [Vercel plan terms](https://vercel.com/legal/terms), and [Hobby plan restrictions](https://vercel.com/docs/plans/hobby)
- [Google Maps Platform India price list](https://developers.google.com/maps/billing-and-pricing/pricing-india), [India eligibility and billing FAQ](https://developers.google.com/maps/billing-and-pricing/india), and [pricing categories/free usage caps](https://developers.google.com/maps/billing-and-pricing/pricing-categories)
- [Mapbox pricing](https://www.mapbox.com/pricing)
- [Twilio India SMS pricing](https://www.twilio.com/en-us/sms/pricing/in) and [Twilio India SMS guidelines](https://www.twilio.com/en-us/guidelines/in/sms)
- [MSG91 India OTP pricing](https://msg91.com/in/pricing/otp)
- [Resend pricing](https://resend.com/pricing)
- [OpenAI API pricing](https://developers.openai.com/api/docs/pricing)
- [Reserve Bank of India current rates](https://www.rbi.org.in/home.aspx)
