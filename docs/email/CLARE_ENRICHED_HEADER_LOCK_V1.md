# Clare Pickleball Enriched Email Header — LOCKED v1.0

Status: APPROVED OUTER GEOMETRY — DO NOT REDESIGN FOR BODY OR TITLE CHANGES.

## Frozen geometry
- Left Clare logo cell: 24%.
- Dynamic centre text cell: 46%.
- Right artwork cell: 30%.
- Clare logo asset: `clare-logo-transparent.png`, width 165px with max-width 100%, natural aspect ratio.
- Right artwork asset: `header-right-clean.png`, native 324×231 aspect ratio.
- Right artwork renders at 108% of its cell width, natural height, top-right aligned, clipped horizontally by the 30% cell.
- Result: artwork touches both the top edge of the header content area and the lower blue/yellow rule without vertical stretching or white gap.
- Mobile media rules MUST NOT resize the logo or artwork. Only centre title/subtitle typography may adapt.
- Dynamic header title lines are nowrap individually and must remain wholly inside the centre cell.

## Change-control rule
A request to alter title/subtitle/body content MUST NOT modify the logo, artwork, 24/46/30 columns, header border geometry, or footer. Any change to those frozen elements requires an explicit new header design version and visual approval.

## Automated gate
`e2e/interclub-email-render.spec.mjs` checks at 600px, 390px and 320px:
- 24/46/30 proportions
- logo fill
- native artwork aspect ratio
- artwork contact with top and lower edges
- no centre-text bleed
- no horizontal overflow
