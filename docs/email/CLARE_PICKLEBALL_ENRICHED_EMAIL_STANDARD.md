# Clare Pickleball Enriched Email Shell — Control Standard

**Control Standard Version:** 1.1  
**Approved Design Version:** **Clare Pickleball Enriched Design v1.0**  
**Design status:** APPROVED / LOCKED / PRODUCTION SOURCE OF TRUTH  
**Status:** APPROVED / PROTECTED PRODUCTION STANDARD  
**Owner scope:** Clare Pickleball tenant  
**Applies to:** KOTC, Interclub, Membership, Events, Newsletters, Results, General club communications  
**Reference implementation:** Clare Pickleball enriched shell + KOTC results body  
**Protected footer source:** exact historical sliced clickable footer recovered from 6 October 2026 implementation; current assets under `public/email-templates/clare-interclub/`

## 1. Architectural rule

The Clare Pickleball Enriched Email is a tenant-wide shell, not a KOTC template.

The shell consists of:
1. fixed Clare Pickleball header structure;
2. dynamic header title and subtitle;
3. dynamic purpose-specific body;
4. fixed Clare Pickleball enriched signature/footer;
5. optional utility links beneath the footer.

KOTC, Interclub and all other purposes supply body content and header text. They must not fork, duplicate or recreate the Clare shell.

Required shell bindings:
- `{{HEADER_TITLE}}`
- `{{HEADER_SUBTITLE}}`
- `{{BODY_HTML}}`

Purpose-specific bodies may bind recipient, session, event, private links, public links, photographs, directory links, feedback links and other authorised RallyHub data.

## 2. Protected design invariants

These are protected controls, not suggestions:

- `EMAIL-VISUAL-001`: the **rendered production HTML** is the approval source of truth. A separate AI-generated visual/mock-up is never presented as if it were the production preview.
- `EMAIL-VISUAL-002`: after approval, implementation means reproduction, not reinterpretation. Do not "improve", modernise, restyle or rebalance approved artwork without explicit approval.
- `EMAIL-VISUAL-003`: Base44 is the host/data-binding/send layer. It is not the primary visual design workshop.
- `EMAIL-VISUAL-004`: approved header/footer assets are reused from the canonical asset library. Do not redraw, flatten, re-slice, regenerate or replace them merely to make a preview convenient.
- `EMAIL-VISUAL-005`: the Clare clickable footer is one protected shared component across KOTC, Interclub, Membership, Events, newsletters and other Clare enriched emails.
- `EMAIL-VISUAL-006`: user-requested changes are **surgical**. If the user asks to change one element, do not change adjacent approved elements.
- `EMAIL-VISUAL-007`: a build pass is not visual approval. Production readiness requires actual HTML render review.
- `EMAIL-VISUAL-008`: no `href="#"`, fake placeholder URL, broken image, missing asset or dead CTA may remain in an approval candidate.
- `EMAIL-VISUAL-009`: all CTA/body links used in preview/test must be the same link bindings used by production sends, using safe representative preview data where per-recipient links are required.
- `EMAIL-VISUAL-010`: approved graphical areas stay graphical; HTML provides structure, editability and clickability around them.
- `EMAIL-VISUAL-011`: rendering seams between sliced assets are fixed by email-safe table geometry/backgrounds/alignment, not by editing approved artwork to hide the defect.
- `EMAIL-VISUAL-012`: normal users may edit only exposed dynamic content. They do not directly edit protected shell HTML, slicing, geometry or brand tokens.

## 3. Clare visual system

Protected Clare visual rules:

- body text uses Clare navy on white;
- body typography must have deliberate visual weight: readable medium/semibold appearance, not weak default text;
- Clare yellow is the strong approved brand yellow, never a washed-out pastel unless the design explicitly calls for it;
- header logo and right-hand pickleball artwork use approved assets and may be resized/cropped only within the locked header geometry;
- complex brand graphics remain approved assets rather than CSS approximations;
- CTAs use a consistent reusable component family with consistent geometry, icon family, typography, radius, spacing and chevron treatment;
- CTA wording and destination are dynamic;
- approved icon assets are reused; do not improvise emoji/stencil icons per email.

Current KOTC CTA labels:
- `Open KOTC Player Summary`
- `Open the Shared KOTC Results`
- `Player Link Infographic`

Current KOTC CTA links:
- private player summary → recipient-specific RallyHub private result URL;
- shared results → session shared KOTC results URL;
- player-link infographic → Clare player-link guide URL.

## 4. Asset policy

Complex branding stays as approved image assets. HTML/table markup provides structure, dynamic text and clickability.

Canonical logical assets include:
- clare-logo
- header-right-art
- footer-top
- contact-left
- contact-phone
- contact-email
- contact-web
- footer-mid
- social-left
- social-facebook
- social-instagram
- social-web
- social-gap
- social-rallyhub
- approved CTA icon assets

All template code must resolve assets through one canonical asset map/base path. Do not scatter one-off Base44 upload URLs through templates.

Current compatibility asset base:
`/email-templates/clare-interclub/`

Treat that as a storage compatibility path, not as Interclub ownership. The same assets belong to the Clare tenant-wide enriched shell.

Canonical portable source:
`public/email-templates/clare-pickleball-enriched/master-shell.html`

Asset manifest:
`public/email-templates/clare-pickleball-enriched/asset-manifest.json`

## 5. Mandatory production workflow

This order is mandatory.

### Gate A — Recover before creating
Before changing any approved element:
1. search the current source and Git/checkpoint history for the last approved implementation;
2. compare existing assets/hashes where relevant;
3. reuse the proven code/assets rather than recreating them from screenshots or memory.

### Gate B — Design outside the live renderer
1. work in a portable production-style HTML master;
2. use the real approved asset library;
3. use email-safe table HTML and inline styles;
4. keep dynamic title/subtitle/body/link slots explicit;
5. do not modify the live renderer merely to explore visual ideas.

### Gate C — Render the actual HTML
1. render the exact HTML that will become production source;
2. review desktop and mobile;
3. do not substitute an unrelated mock-up, AI visual or manually assembled screenshot;
4. broken external assets invalidate the preview.

### Gate D — Self-QA before user review
The developer/agent must inspect the render before showing it:
- proportions and spacing;
- header geometry;
- artwork crop/fill;
- typography weight/colour;
- CTA consistency;
- icon consistency;
- footer alignment;
- separator thickness;
- rendering seams;
- utility links;
- missing/broken assets.

Do not use the user as the first visual QA pass for obvious defects.

### Gate E — Bind real data/actions
After visual structure is stable:
1. bind real RallyHub fields;
2. bind real CTA destinations;
3. use representative valid preview links for recipient-specific actions;
4. test phone, email, website, social, RallyHub, private result, shared result and guide links;
5. keep plain-text equivalents accurate.

### Gate F — Freeze approved design
Once approved:
1. create a named checkpoint/version;
2. treat header/footer/component geometry as locked;
3. future purpose-specific emails swap only dynamic title/subtitle/body/modules/links unless an explicit design-change request is made.

### Gate G — Production integration
Only after the standalone production HTML passes visual approval:
1. wire that exact structure into RallyHub/Base44;
2. do not restyle during integration;
3. run Communications/email gates;
4. run production build;
5. send a test email;
6. confirm the sent email matches the approved render;
7. checkpoint.

## 6. Clickable footer control

The Clare enriched footer is a protected reusable component.

It must preserve:
- Brian Moore signature/portrait block;
- phone click target;
- email click target;
- ClarePickleball.ie click target;
- Clare Pickleball lower brand block;
- Facebook click target;
- Instagram click target;
- website click target;
- RallyHub visual block and `https://rallyhub.ie/` click target;
- exact original slice proportions/alignment.

Do not:
- replace the footer with a single flattened image;
- reconstruct it from a screenshot when canonical slices exist;
- change cell widths/dividers independently;
- enlarge the RallyHub block relative to Clare Pickleball;
- introduce white boxes/backgrounds;
- re-cut the original slices to fix a renderer seam.

Renderer seams must be handled with zero-spacing tables, appropriate cell backgrounds, top alignment and email-safe geometry.

## 7. User editing boundary

Normal user may edit approved dynamic fields exposed by the purpose-specific body schema, including:
- heading/title where permitted;
- body copy;
- optional body modules;
- approved images;
- CTA wording where allowed;
- links where allowed.

Normal user must not directly edit:
- protected shell HTML;
- footer slicing;
- header geometry;
- brand tokens;
- locked component internals;
- production data-binding syntax.

## 8. Purpose-specific body model

Examples:
- `CP_Body_KOTC_Results`
- `CP_Body_Interclub_Results`
- `CP_Body_Membership`
- `CP_Body_Event`
- `CP_Body_Newsletter`

All mount inside the same `CP_Enriched_Email_Shell`.

Optional modules such as Photos, What’s Next, More Pickleball, Sponsors, Fixtures, Feedback or Directory links are **body modules**. They are never silently hard-coded into the tenant shell.

## 9. Approval / release gate

A template is not approved merely because it compiles or renders.

All must pass:
- actual production HTML visually matches approved reference;
- no broken assets;
- no placeholder URLs;
- all intended click targets work;
- recipient-specific links use safe valid preview/test bindings;
- clickable footer intact;
- body typography/colour matches approved Clare system;
- desktop/mobile render checked;
- plain-text parity checked;
- test email reviewed;
- automated Communications gates pass;
- production build passes;
- named checkpoint created.

## 10. Mandatory execution prompt

Use this prompt whenever ChatGPT/AI is asked to create, modify, migrate or repair a RallyHub enriched email:

> **RallyHub Visual Email Production Protocol**
>
> Work as a production email designer and HTML engineer. Follow `docs/email/CLARE_PICKLEBALL_ENRICHED_EMAIL_STANDARD.md` before editing.
>
> 1. Recover and reuse existing approved source/assets first. Search code/history before recreating anything.
> 2. Treat the approved Clare shell as protected: fixed header structure, dynamic title/subtitle, dynamic body, fixed clickable Clare footer, optional utility row.
> 3. Do not redesign, flatten, redraw, re-slice or approximate approved header/footer assets unless the user explicitly requests a redesign.
> 4. Make only the requested change. Do not alter adjacent approved elements.
> 5. Create/refine the design in portable production-style email-safe HTML before changing the live Base44 renderer.
> 6. The approval preview must be a render of the actual HTML source intended for production. Never substitute a separate AI mock-up.
> 7. Use the canonical asset library and reusable CTA/icon/component library. Do not improvise emoji/stencil icons or washed-out brand colours.
> 8. Self-QA the rendered HTML before showing it: header proportions, typography, CTA consistency, icon quality, spacing, footer alignment, seams and broken assets.
> 9. Bind and test real RallyHub actions before approval. No `href="#"`, fake URLs or untested CTA destinations.
> 10. Preserve exact clickable-footer segmentation and links. Fix renderer seams with table/background/alignment rules, not by damaging the artwork.
> 11. Once visually approved, freeze/version the design and wire that exact HTML into RallyHub without restyling.
> 12. Run Communications gates, production build, test-send and checkpoint before calling it complete.
>
> If a previous approved implementation exists, recovery beats recreation. If the user asks for one change, change one thing.

## 11. Asset workflow

Preferred workflow:
1. maintain approved tenant assets once in the canonical public asset directory;
2. reference them from all tenant templates;
3. update the manifest when an approved asset changes;
4. avoid repeated manual uploader work;
5. retain original source-quality assets.

Future enhancement: Super Admin Asset Library UI for managed tenant email assets and approved component packs.
