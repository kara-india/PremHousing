# Homepage Property Explorer — UX and Implementation Design

**Status:** Unnumbered Design Phase specification; no app implementation is included.
**Design target:** A compact, map-first property discovery section integrated into the existing PREM homepage without redesigning the website.

## Experience intent

Help a visitor browse PREM’s published property collection by maximum budget and BHK, then make a clear enquiry. The homepage experience is simpler than the separate Locality Intelligence Explorer: it makes no neighbourhood scores, predictions, or market heatmap claims. The Explorer is one section within the existing PREM homepage; it does not replace the brand site, hero, service information, areas, story or contact flow.

The existing PREM brand uses a warm ivory canvas, deep forest green, restrained brass accents, editorial serif headlines, compact sans-serif interface text, fine neutral dividers, and local real-estate imagery. Reuse these patterns and existing `App.css`/`index.css` tokens rather than rebranding the whole site. The design may refine the explorer's composition, not the global homepage.

## Placement and desktop composition

Place the section after the existing primary search/intro and before the area/service content. Section anchor: `#explore-properties`.

1. **Section header:** small uppercase eyebrow “EXPLORE PROPERTIES”; headline “Find a home in Mira Road & Bhayandar”; one concise explanation. A right-aligned result count appears only after query completion and only if it describes the current result set.
2. **Filter rail:** maximum budget (INR input plus optional range slider), BHK segmented control (All, 1 BHK, 2 BHK, 3+ BHK), and a clear/reset action. More filters can be disclosed behind “More filters” only if the current data model supports them; avoid crowded controls in the first screen.
3. **Results workspace:** desktop two-column layout: map about 52–58% of workspace width, scrollable cards about 42–48%. Maintain minimum readable widths; below tablet breakpoints switch to list with a map/list toggle rather than squeezing both panes.
4. **Map controls:** accessible zoom buttons, visible provider attribution, “Search this area” only if pan-driven queries are implemented. A selected marker has a distinct outline/shape in addition to color and opens a compact property preview.
5. **Cards:** show the real available fields: title, locality, advertised asking price, bedrooms, area in sq ft, and furnishing/features only when present. Current records contain no image URLs, so do not add representative stock photos that might be mistaken for the actual property. Keep the clear no-photo treatment. Do not surface an unverified source badge; owner states the 32 published property records are theirs. Do not change their source fields as part of design work.

At wide desktop, map/list should remain visible together. Do not turn the home page into a full-viewport analytics dashboard.

## Filters and query semantics

### Budget

- Label **Maximum budget** and show INR with Indian digit grouping (e.g., ₹1,00,00,000).
- Default to **Any budget** to avoid silently excluding inventory. A slider is a convenience paired with a numeric input so keyboard users can enter a precise value.
- Show the current amount adjacent to the control; validation rejects negative values and non-numeric input without clearing the last valid query.
- Currency scope: purchase price for sale; monthly asking rent for rental properties. If mixed transaction types are shown, make the different units explicit and do not apply one ambiguous budget scale across them.

### BHK

Segmented single-select: **All**, **1 BHK**, **2 BHK**, **3+ BHK**. It applies only to residential inventory. For commercial results, hide it or explain why it does not apply; do not silently retain an invisible filter.

### Synchronization and count

- Budget and BHK filters are authoritative for both list and map. Apply the same query result set to card count and markers.
- State whether filter changes apply immediately or after an explicit **Apply** action. On mobile, use draft filter values in a sheet and apply atomically.
- “N properties” must be exact for the active scope. The revised static preview’s count of 32 comes from a read-only count of the 32 currently published PREM records; it is not hardcoded as a general product value. A production query must calculate the active-filter count and distinguish it from a capped list.
- Retain filters and selected locality when toggling map/list or opening a property detail and returning.

## Property selection and map/list behavior

- Cards and markers represent only owner-authorized PREM-approved listings whose public publication status and display rights permit it.
- Marker label is a compact price when valid. Sale values use a concise INR format; rent uses INR/month or a simpler marker plus a full rent unit in the preview. Do not display source labels as approval claims.
- Overlapping properties cluster with a numeric marker. Selecting a cluster zooms or reveals a keyboard-accessible member list. Do not replace cluster count with a statistical heatmap.
- Selecting a marker highlights the corresponding card, scrolls it into view without moving keyboard focus unexpectedly, and opens a preview. Selecting a card centers/highlights its marker if coordinates exist.
- Keyboard/screen-reader users can select every result from the list; provide accessible names for marker buttons and a visible selected state. Map panning is never the only way to access inventory.
- If coordinates are absent or approximate, list the property normally and omit the exact marker. A locality centroid must not be presented as the building location.
- The detail action navigates to `/properties/:propertyId`; browser back restores filter, result scroll, and map extent where feasible.

## WhatsApp enquiry

Reuse the existing `whatsappUrl` helper and current business destination. The explorer does not submit a new lead API or introduce another contact flow.

Suggested prefilled text:

> Hello PREM, I’m interested in [property title] ([PREM property reference]) in [locality]. Asking price: [sale total or monthly rent]. Please confirm availability and arrange a discussion.

Include only fields actually known and approved for public display. If no stable public reference exists, design calls for one to be added later to the safe public-property contract; do not expose internal database IDs by default. Explain that WhatsApp opens a draft and the visitor must press **Send**. The visitor can edit it before sending. Do not add owner names, broker private contact information, or hidden moderation values.

## Responsive design

### Tablet / compact desktop

- Filters wrap into two tidy rows or a horizontal scroll region with clear focus visibility.
- Keep the list panel at a readable minimum width; if unavailable, switch to tabs rather than compressing card text.

### Mobile

- Keep section heading and active budget summary visible. Filters open in a full-height or tall bottom sheet with labeled controls, active count, **Apply**, and **Reset**.
- Use a clear **Map / List** segmented toggle above content. List is the safe fallback and can be the initial mode when map tiles fail.
- Map mode uses full available width and touch-sized zoom/selection controls; list results appear in a bottom sheet with collapsed/expanded states or as a dedicated list view.
- Tapping a pin opens a compact property sheet with title, price, BHK, area, locality, “View details”, and WhatsApp enquiry. Keep attribution and close controls clear of device safe areas.
- No essential action depends on pinch, hover, drag, or color perception.

## Screen and state specifications

| Screen/state | Design behavior |
|---|---|
| Homepage integrated | Existing navigation, hero, sections and footer remain intact; explorer is an additional section with PREM visual tokens. |
| Initial explorer | Heading, budget/BHK controls and map/list invitation; never claim a result count before the query resolves. |
| Loading | Preserve controls and prior results when refreshing; show card skeletons and map placeholder; announce “Updating properties”. Avoid spinner-only layout shifts. |
| Results | Exact current count, synchronized cards and markers, listing order label where applicable, pagination/capped-result note. |
| Selected listing | Distinct card/marker selection plus preview; details and enquiry actions; close returns to the same search state. |
| Current PREM collection | Render the actual published listing fields and label amounts as advertised asking prices. Do not imply completed transactions, verification, or location precision that the data does not contain. |
| No filter matches | “No published listings match these filters.” Show clear filters and transparent alternatives that preserve hard constraints. |
| Map unavailable | Explain map loading issue, retain/list results and filters, provide Retry. Do not show a fake map or simulated pins. |
| Query error | Friendly retry, preserve filters and allow WhatsApp contact; do not describe the error as no inventory. |
| Missing property data | Omit absent photo/facts; show neutral placeholder and “Not provided” only when user needs to understand omission. No invented bathroom/facing/floor values. |
| WhatsApp handoff | Confirm the draft is opening and that PREM receives nothing until visitor sends in WhatsApp. Provide an ordinary link/button fallback if popup is blocked. |

## Existing schema and implementation fit

Current `src/App.jsx` already has the public search form and queries `properties` joined to `localities`, selecting `id,title,property_type,transaction_type,price,deposit,area_sqft,bedrooms,furnishing,description,features,image_urls,locality.name`, restricted to `status='published'`. It currently supports more than the requested budget/BHK filters. `PropertyResults.jsx` displays price, title, locality, bedroom count, area, available images, and an enquiry action. `src/lib/whatsapp.js` builds the existing WhatsApp URL.

Not present in the homepage result select: bathrooms, floor, facing, a stable public reference, source, verification date, explicit area basis, or property geometry. The schema supports property `location` geography, but the read-only preview query found none populated on the 32 published records. The revised preview may show actual title, locality, price, bedroom and area values, but uses no fabricated photos, exact property pins, or source claims. It does not update any of the 32 records or seven locality rows. The map treatment is labeled schematic and is not a claim about street or property geometry.

Future component boundary (proposal): `PropertyExplorerSection` owns filter/result state; `ExplorerFilters` edits budget/BHK; `ExplorerMap` renders only safe, authorized points; `ExplorerResultList` and `PropertyCard` share the same selected property; `PropertyPreview` links to existing detail; `WhatsAppEnquiryLink` composes allowed fields through existing helper. Use existing query/data access where possible; do not add production dependencies or app code in the design phase.

## Acceptance checklist for future implementation

- Budget defaults to Any, validates, and is labeled as sale total or monthly rent.
- BHK has All/1/2/3+ choices and is hidden/explained for commercial inventory.
- Card and map results use the same published/approved query and filters.
- Count is exact or clearly described as a capped visible count.
- Marker/card selection is synchronized and keyboard operable; list remains complete alternative.
- Missing coordinates never turn into false property locations.
- Loading, no inventory, no match, error, tile failure, missing-field, and WhatsApp states match this spec.
- WhatsApp uses existing PREM destination/helper and sends only after the visitor presses Send.
- No production data records, schema, application files, or provider settings are changed by design artifacts.
