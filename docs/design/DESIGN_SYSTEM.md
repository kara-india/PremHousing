# PREM shared design system

**Status:** Design phase proposal; no application CSS or components were changed.
**Applies to:** Homepage Property Explorer and Locality Intelligence Explorer.

## Design intent

Extend PREM Realty's existing editorial, local-business identity rather than replacing it. The app currently uses warm off-white backgrounds, deep forest green, muted gold, dark ink, Playfair Display for display headings, Manrope for compact headings, and DM Sans for body copy. Preserve this recognizable palette and typographic contrast. Keep market-intelligence visuals distinct from the brand palette so users do not mistake a heat scale for an endorsement.

The two experiences share navigation, typography, controls, cards, status patterns, and map interaction conventions. Their information density differs: Homepage discovery stays simple and enquiry-oriented; locality intelligence is denser, evidence-led, and decision-oriented.

## Design tokens

Token values are a proposal mapped from current `src/index.css` and `src/App.css` values. Consolidate in CSS custom properties during a later implementation phase, after design approval.

| Token | Proposed value | Use |
|---|---|---|
| `color.ink` | `#20231F` | Body text and primary dark text |
| `color.forest` | `#24372F` | Primary PREM action, navigation, selected states |
| `color.forestDeep` | `#202720` | Dark utility/nav backgrounds |
| `color.gold` | `#C9A66B` | Brand highlight, restrained emphasis and focus accent |
| `color.goldDeep` | `#8E7047` | Gold text on light backgrounds where contrast is needed |
| `color.cream` | `#F8F7F3` | Page background |
| `color.surface` | `#FFFFFF` | Cards, sheets and popovers |
| `color.surfaceMuted` | `#F0EEE7` | Secondary section/background |
| `color.line` | `#E5E1D8` | Borders and separators |
| `color.textMuted` | `#73756F` | Secondary copy; verify contrast at actual font size |
| `color.success` | `#35634A` | Verified/complete states with icon and label |
| `color.warning` | `#805A18` | Limited, stale or incomplete data states |
| `color.error` | `#A13C35` | Actionable errors |

### Data visualization palette

- Reserve forest green and a small gold accent for PREM-selected actions, selected properties and branded framing.
- Use a perceptually ordered, color-vision-safe sequential palette for numeric intensity, with luminance and texture/outline variation. Do not use green-to-red traffic-light scales as the only cue.
- Use discrete categorical hues only for categorical POI groups and include a text legend. Avoid reusing the forest accent for unrelated category values.
- Maintain an accessible non-color status label such as “limited data” or “selected property”. Do not communicate confidence through color alone.
- Final palette and contrast ratios must be measured in rendered light/dark overlays during visual QA.

## Typography

| Role | Typeface | Guidance |
|---|---|---|
| Display/section title | Playfair Display | Existing editorial serif; use sparingly for page and section titles, not dense numeric labels |
| UI heading | Manrope | Existing geometric sans; use for cards, controls, navigation and concise panel headings |
| Body/control | DM Sans | Existing body face; use for explanatory copy, labels, filters and numeric supporting context |
| Data values | DM Sans with tabular numerals | Align prices/counts; keep unit and period visible beside the value |

Use a compact scale: page title 40–56 px desktop / 32–40 px mobile; section title 28–40 / 24–32; panel title 18–22; body 15–17; secondary text at least 13; control labels at least 13. Existing app microcopy is often smaller; the new discovery/analysis surfaces should remain readable at normal zoom. Respect browser text scaling and user zoom.

## Layout and spacing

- Base spacing unit: 4 px; common steps 4, 8, 12, 16, 24, 32, 48, 64.
- Content max width: 1180 px, matching the existing `.wrap`; use 24 px outer gutters desktop and 17 px mobile.
- Use a 12-column desktop grid, 8-column tablet grid and 4-column mobile grid. Keep map attribution and essential controls outside occluding drawers.
- Card radius: 2–6 px for primary PREM surfaces; use larger radii only for transient mobile sheets. Avoid generic fully rounded dashboard cards.
- Borders: 1 px `color.line`; use elevation selectively for floating search, selected card and sheet surfaces. Avoid stacking multiple shadows.

## Shared components

| Component | Shared contract | Homepage expression | Intelligence expression |
|---|---|---|---|
| Global header | Existing PREM logo, core navigation and WhatsApp entry point; clear current location | Normal homepage navigation | Adds active Explore/Insights navigation and a clear way back |
| Search input | Label, optional clear action, keyboard-selectable results, loading/error feedback | Compact locality/search field | Requirement/locality search with contextual help |
| Filter control | Visible label, current value, reset semantics, focus state | Budget and BHK chips/controls | Budget, residential type, BHK and criteria in a compact form |
| Property card | Image only when valid, title, locality, asking price, available facts, source/status context, enquiry action | Compact horizontal cards by map | Recommendation cards include reasons, trade-offs and confidence |
| Map marker | Selectable by pointer and keyboard/list; named, selected state; cluster for overlap | Price-labelled listing marker only when eligible | Layer-specific symbols and a selected locality/property state |
| Layer selector | Named controls with availability state; preserve selected layers | No market-analysis selector by default | Separate inventory, asking-price, asking-rent, price/area, preference, amenity and infrastructure layers; unavailable layers explain why |
| Legend | Metric, unit, range, source/time coverage where applicable | Price labels on valid listing markers | Metric-specific continuous/discrete key plus sample/coverage notes |
| Evidence badge | Text, optional icon, date/source details on disclosure | “PREM listing” or approved source | “Observed”, “asking”, “estimated”, “user entered”, “insufficient data” |
| Empty/error panel | Plain language, cause, useful next action, retry where relevant | No matches / no eligible listings / loading | No observations / insufficient sample / source unavailable, kept distinct |
| Mobile sheet | Named heading, close/back, safe-area-aware drag handle; controls remain operable without drag | Map/list results sheet | Locality/recommendation detail sheet with persistent profile context |

### Buttons and controls

- Primary action: forest fill, white text, label-led, minimum 44 px height; use for “View properties”, “Apply filters”, or “Enquire on WhatsApp”.
- Secondary action: white/cream surface, ink text and visible border; use for compare/reset and non-destructive navigation.
- Destructive actions are out of scope for the two explorers.
- Filter chips must have a selected state represented by fill/border plus `aria-pressed`, not color alone.
- Inputs always retain visible labels; placeholder text is an example, not the only label.

## Map visuals and data semantics

- Calm neutral basemap; local roads and labels need enough contrast beneath markers and analysis overlays.
- Property price pins show asking price only, in INR, and are distinct from a data-density heatmap.
- Clusters show count and open a list/zoom target. Do not present cluster count as market volume without an explicit definition.
- Sale asking price, monthly advertised rent, carpet-area asking price/sq ft, built-up-area asking price/sq ft, PREM inventory, preference match, POIs and infrastructure each require a separate symbol/legend and data contract.
- Never style an unverified listing as PREM-approved. Current published MagicBricks-attributed rows are explicitly not cleared for map use; this design does not alter or relabel them.
- No continuous intensity layer for sparse observations. A missing coordinate, missing observation or suppressed small sample is not a zero.

## Iconography and imagery

Use the existing Lucide outline icon family for interface actions, with consistent 1.75–2 px strokes and 18–22 px UI sizes. Pair unfamiliar icons with text. Do not use icons as the only data legend. Use location-accurate, licensed PREM imagery only after sourcing; current remote image URLs are not evidence of a locality-specific scene. Any generic illustrative image must be captioned as illustrative and not presented as a specific building or amenity.

## Motion

Motion is short and functional: selected marker/card transitions, sheet entrance, and filter disclosure only. Never pulse a low-confidence score or imply real-time data with animation. Under `prefers-reduced-motion`, remove nonessential movement and keep state changes perceivable through labels/focus.

## Approval and implementation note

These tokens and components are design proposals, not a change to the app's CSS or a guarantee that every proposed data field currently exists. Future implementation should first reconcile these tokens with existing `src/index.css`/`src/App.css`, check contrast in actual map tiles, and map component props to the current database schema and authorization rules.
