# Responsive and accessibility specification

**Status:** Design-phase handoff; not implemented or browser-tested.
**Applies to:** Homepage Property Explorer and Locality Intelligence Explorer.

## Breakpoints and layout behavior

Use content-driven breakpoints aligned with the current app's 900 px and 650 px media queries. Treat widths as transition ranges, not device labels.

| Range | Homepage Property Explorer | Locality Intelligence Explorer |
|---|---|---|
| `> 1100 px` | Two-column map and results panel where enough eligible results exist; hero and existing site sections retain current width | Three-column workspace: compact requirements rail, map/canvas, evidence/recommendation panel; panel can collapse to widen map |
| `901–1100 px` | Two-column map/list with reduced card detail; filters wrap into a second row | Two columns: requirements become a collapsible top/left drawer; map and analysis panel remain independently scrollable |
| `651–900 px` | Tablet map/list split or user-selected map/list view; cards remain readable and controls wrap | Map takes primary canvas; requirements and locality details use drawers/sheets; comparison switches from wide columns to stacked/scrollable cards |
| `<= 650 px` | Explicit Map/List segmented switch; map and results use separate full-width views; filter sheet; property detail in a sheet or route | Map/List/Insights navigation; sticky compact profile + selected locality context; filters and layer controls in labelled sheets; recommendations and comparison are list-first |

Additional rules:

- Respect current `.wrap` maximum width (1180 px) and 320 px minimum viewport behavior; avoid horizontal page scrolling at 320–650 px.
- At mobile widths, do not render three columns squeezed together. Map and list are explicit view states with preserved filters, selected item and viewport.
- On tablet, allow requirements rail to collapse; preserve a visible affordance and announce expanded/collapsed state.
- At 200% zoom and 320 CSS px width, use the list alternative and stacked controls; no primary action may be clipped.
- Use `100dvh`/safe-area-aware mobile sheets where supported with a resilient fallback; ensure bottom action buttons clear the home indicator and browser bars.
- Compare tables may scroll horizontally only inside a labelled comparison region, with frozen row labels where feasible; offer a stacked comparison card alternative.
- Avoid hover-only behavior. Touch, keyboard, switch and screen-reader interaction must produce equivalent selection.

## Interaction and accessibility requirements

### Keyboard and focus

- Provide a logical heading/navigation order: page heading → requirements → map/list toggle → map controls/layers → results/comparison → selected-property actions.
- All filters, profile cards, layer toggles, marker alternatives, list rows, comparison controls and sheets are reachable by keyboard.
- Provide a visible focus indicator with at least a 2 px outline and offset; do not rely on the current subtle gold shadow alone over variable basemaps.
- When a modal or sheet opens, move focus to its heading or first control, contain focus only if modal, and restore focus to its trigger on close.
- Escape closes non-destructive menus/sheets and returns focus. Map keyboard shortcuts must not hijack normal text input or page scrolling.
- Do not make drag or map pan the only path to content; include explicit zoom buttons, reset/locate actions where available, and list selection.

### Screen-reader and non-map alternatives

- Use semantic regions with names: “Property map”, “Property results”, “Locality intelligence”, and “Layer controls”.
- Provide a synchronized textual result list and a selected locality/property summary. The list is the fully functional alternative, not a summary-only fallback.
- Markers have accessible names including locality, asking price, BHK where known, and selection state; avoid exposing synthetic or unverified rows as approved inventory.
- Announce concise result-count/filter updates through a polite live region; do not move focus when the count changes.
- Explain each metric and status in text. A map color legend alone is not an accessible description.
- Use `aria-pressed` for toggle buttons, labelled fieldsets for BHK and profile selection, and proper `aria-expanded` relationships for drawers/accordions.
- Use error text linked to inputs and announce fetch failures without exposing raw provider/database errors.

### Touch and pointer

- Minimum target size: 44 × 44 CSS px for primary controls and map actions; leave spacing between adjacent destructive or high-impact controls.
- Provide a marker/list selection route for overlapping properties; do not require precise pin tapping.
- Do not use multi-touch as the only zoom path. Preserve browser page zoom and scroll in non-map regions.
- Tap a listing row to select; selection state should be visible on both list and map. Tapping the selected item again should not unexpectedly clear unrelated filters.

## Color, contrast and motion

- Target WCAG 2.2 AA contrast for text and controls, tested on actual map basemaps and overlay states. Minimum 4.5:1 for normal text and 3:1 for large text/UI boundaries where applicable.
- Do not use gold `#C9A66B` for small text on cream/white; use it as a fill, large accent or border with a dark companion label.
- Every chart, layer and badge communicates meaning with labels/icons/patterns as well as hue. Sequential heat scales must remain legible in grayscale and common color-vision deficiencies.
- Expose source, date, sample count, suppression and confidence text adjacent to any analytical layer. State “No verified observations” or “Insufficient data” rather than rendering an empty color ramp.
- Respect `prefers-reduced-motion`; no pulsing heatmaps, parallax, auto-playing map flyovers or movement required to understand selection.
- Use restrained 120–220 ms transitions for menu/sheet state only; preserve direct state feedback if animation is disabled.

## Responsive states and content priority

### Homepage Property Explorer

1. Keep the existing PREM header and homepage narrative intact.
2. On desktop, show budget/BHK controls before the map/results, with matching count and result order visible.
3. On narrow screens, let user choose Map or List; keep an active-filter count and clear/apply controls accessible in the filter sheet.
4. A result row must show only available fields. Missing bath, area, furnishing or feature data is omitted or explicitly marked unknown, never fabricated.
5. WhatsApp action remains explicit and names the listing reference and available property details. Explain that PREM's WhatsApp message opens for the user to review/send.

### Locality Intelligence Explorer

1. The selected profile and hard requirements remain visible or one action away while the user inspects layers.
2. On desktop, panels can collapse independently; on mobile, do not stack the full desktop rails above the map.
3. Provide a layer details sheet describing unit, source, observation period, coverage, sample size and method.
4. Comparison and recommendation explanations remain accessible as text/list content, regardless of map state.
5. Any insufficient-data state preserves the user’s chosen requirements and offers a non-coercive action (change locality, compare available evidence, or broaden a non-hard preference).

## Loading, empty, error and insufficient-data states

| State | User-facing behavior |
|---|---|
| Initial loading | Keep navigation and requirements usable; skeletons identify future content regions; do not present placeholder values as data |
| No approved listings | Say no PREM-approved listings are currently available in this area; distinguish this from a failed request |
| No filter match | State that filters produced no matches and offer reset/relaxation for optional filters only |
| Map/tile failure | Preserve search state, show concise retry/continue in list mode, and avoid a fake basemap |
| Missing coordinates | Keep listing in list results if otherwise authorized; explain it cannot be plotted; never geocode silently |
| Insufficient market sample | Do not paint a continuous heat layer; show reason, method/threshold when approved, and available coverage |
| Stale/unavailable source | Show last successful update and source status; separate stale from current data |
| No recommendation evidence | Do not invent a fit score; show hard-eligible listings with explicit “not enough evidence to score” where applicable |
| WhatsApp unavailable | Keep the listing reference/details visible and offer the configured alternative contact route if one exists |

All states must avoid announcing all skeleton tiles or repeated updates to assistive technology. Use a polite live region for final fetch status and an assertive alert only for blocking errors.

## Validation checklist for later implementation

- Test portrait/landscape at 320, 360, 390, 768, 900, 1024, 1280 and 1440 CSS px; include browser zoom and enlarged text.
- Verify keyboard-only completion of all five documented journeys; test screen-reader names/status of layers, filter updates, result lists and recommendations.
- Validate contrast for forest/gold text, badges, markers, legends and overlay basemaps in selected/unselected/loading states.
- Test iOS Safari and Android Chrome safe areas, sheets, keyboard viewport resizing, scroll lock and back navigation.
- Simulate no coordinates, empty inventory, insufficient samples, source failure, slow network, stale observations and missing map provider.
- Confirm there is no horizontal page overflow and no control under an attribution block, sticky header, bottom navigation or system inset.

These are acceptance requirements for a later build. No map, route or responsive behavior was implemented or verified in this design task.
