# Clare Pickleball Enriched Email Shell — Control Standard

**Version:** 1.0  
**Status:** Approved architecture / reference implementation  
**Owner scope:** Clare Pickleball tenant  
**Applies to:** KOTC, Interclub, Membership, Events, Newsletters, Results, General club communications

## 1. Architectural rule

The Clare Pickleball Enriched Email is a tenant-wide shell, not a KOTC template.

The shell consists of:
1. fixed Clare Pickleball header structure;
2. dynamic header title and subtitle;
3. dynamic purpose-specific body;
4. fixed Clare Pickleball enriched signature/footer;
5. optional utility links beneath the footer.

KOTC, Interclub and other purposes supply body content and header text. They must not fork or recreate the Clare shell.

## 2. Design-lock rule

After visual approval, implementation is reproduction, not reinterpretation.

Do not alter approved:
- logo position or scale;
- header geometry;
- blue/yellow separator proportions;
- right-hand artwork crop/alignment;
- typography tokens;
- body navy;
- footer artwork;
- clickable footer segmentation;
- spacing rules;
- CTA component geometry;
unless an explicit design change is approved and versioned.

## 3. Dynamic fields

Required shell bindings:
- {{HEADER_TITLE}}
- {{HEADER_SUBTITLE}}
- {{BODY_HTML}}

Optional content bindings are supplied by each purpose-specific body, e.g. recipient, session, event, results links, photographs, feedback and directory links.

## 4. Asset policy

Complex branding stays as approved image assets. HTML/table markup provides structure and clickability.

Canonical logical asset names:
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

All template code must resolve these through one asset manifest/base path. Do not scatter Base44 media URLs through individual templates.

Temporary legacy asset base remains /email-templates/clare-interclub/ until the files are copied into the canonical Clare enriched asset folder. Code must treat that as a compatibility location, not a KOTC/Interclub ownership statement.

## 5. Source-code portability

The canonical source template is:
public/email-templates/clare-pickleball-enriched/master-shell.html

The asset map is:
public/email-templates/clare-pickleball-enriched/asset-manifest.json

These are deliberately plain portable files. They can be copied out of Base44, edited/tested externally, and returned without redesigning the template.

## 6. Build process

1. Design visually.
2. Approve visual.
3. Lock design/version.
4. Map design to Clare shell + approved body components.
5. Bind dynamic RallyHub data.
6. Compile/render email-safe HTML.
7. Compare render to approved reference.
8. Check desktop/mobile, links, assets, data bindings and plain-text parity.
9. Send test.
10. Approve version for production.

## 7. User editing boundary

Normal user may edit approved dynamic content, images and links exposed by the body schema.

Normal user must not directly edit the locked shell HTML, footer slicing, header geometry or brand tokens.

## 8. Purpose-specific bodies

Examples:
- CP_Body_KOTC_Results
- CP_Body_Interclub_Results
- CP_Body_Membership
- CP_Body_Event
- CP_Body_Newsletter

They all mount inside the same CP_Enriched_Email_Shell.

## 9. Quality gate

A template cannot be called approved merely because it renders.

Acceptance requires:
- approved visual match;
- no hard-coded purpose title in shell;
- no hard-coded event/session content in shell;
- all links valid;
- clickable footer intact;
- body text using approved Clare navy;
- mobile layout intact;
- test email reviewed;
- version checkpoint created.

## 10. Asset workflow improvement

Preferred workflow: add/update approved assets once in the canonical public asset directory and update the manifest if needed. Publishing RallyHub then serves the assets from stable RallyHub-owned URLs. Do not use the Base44 UI uploader for every template instance.

Future enhancement: add a Super Admin Asset Library UI that writes approved tenant email assets to this canonical mapping and exposes them to all email templates.
