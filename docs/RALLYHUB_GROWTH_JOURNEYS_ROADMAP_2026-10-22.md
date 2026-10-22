# RallyHub — Guided Growth Journeys Roadmap

**Recorded:** 22 October 2026  
**Status:** Agreed direction / future work. This is a planning document, not permission to deploy or send communications.  
**Owner:** RallyHub  
**Source of truth:** This document for the cross-audience roadmap; Communications Centre `CommunicationTemplate` records for actual email text, version, footer, utility links and approvals.

## Objective

Make RallyHub the trusted, up-to-date destination for discovering pickleball clubs, playing opportunities, tournaments and events, coaching, services, suppliers and holidays across the island of Ireland. Both supply (club/organiser information) and demand (players looking for opportunities) are required. Avoid describing RallyHub as an authoritative single source of truth until coverage and freshness can be evidenced.

## Three connected guided journeys

1. **Event organisers and providers — Sarah journey (work in progress).** Continue the guided event/listing creation, validation, preview and publishing path already being developed. Reuse its tested principles and building blocks; do not duplicate the event editor.
2. **Clubs and Directory owners — in progress.** After approval, give the owner a personalised guided setup that recognises already-populated information, identifies remaining steps, permits direct editing, and helps them maintain venues, sessions and public contact data. Existing owners should receive a distinct review/enhancement journey rather than a new-user welcome.
3. **Players — next proposed workstream.** Develop friction-light discovery, optional personal account creation, player interests/location/preferences, following clubs and events, relevant opted-in alerts, reasons to return and a privacy-respecting onboarding flow. Browse without mandatory registration where practical; measure verified adoption and retention rather than raw signups alone.

## Club-led player acquisition (proposed, not yet built)

- Add **Share RallyHub with Your Members** to verified clubs' Directory management area.
- Generate a club-specific sharing pack: public club-listing URL, ready-to-send WhatsApp message, email copy, and social graphics. Do not send on the club's behalf without approval.
- Offer the same short invitation in the guided welcome and quarterly review communications, but **do not distract from the main setup/review call to action**.
- Make the benefit reciprocal: visibility for clubs; reliable discovery of clubs, events, services, coaching and holidays for players.
- Instrument link share/click and player registration sources, with privacy-conscious reporting.

## Communications Centre: two separate club lifecycle templates

- **Directory 01 — Welcome & Guided Setup**, purpose `directory_welcome`. Replaces old generic welcome draft. Personalised club and owner, primary CTA to `/directory/{slug}/edit?guided=1`, secondary CTA to `/directory/help`, approved RallyHub C3 header, founder signature card, C2 footer, six default editable utility links, brief request to share RallyHub with members. **Wording remains draft pending owner sign-off.** The guided CTA backend code has been deployed and source-verified independently.
- **Directory 02 — Quarterly Review & Enhance**, purpose `directory_quarterly_review`. Distinct from welcome; personalised suggested improvements drawn from real Directory data; optional Spond enhancement; reminder to share RallyHub with newly joined members. **Draft only; sending workflow and recurrence NOT enabled.**

## Quarterly review business rules to implement and test

- Eligible: active verified Directory owner with an established listing, using the public listing plus editable profile and actual guided setup completeness; no assumption that missing editable profile means an incomplete listing.
- Prioritise missing/dated details. If listing is complete and recently checked, suppress unnecessary reminders.
- At most one quarterly email per owner/listing, with delivery audit, idempotence, opt-outs/consent as applicable, bounce handling and suppression of recently welcomed or revoked accounts.
- Proposed quarters: January, April, July, October. **Do not create an automation or send until reviewed and explicitly approved.**
- Build a read-only preview/sample shortlist first; obtain owner sign-off of template content and eligibility conditions before switching it on.
- Current snapshot at discussion: **38 Directory listings with active owner access; 23 of those had active editable profile records.** This is not a count of incomplete listings.

## Proposed order after Communications Centre sign-offs

1. Finish approving the RallyHub platform/system-generated email templates one at a time, preserving real sender, approved C3/C2 branded HTML shell, Brian Moore Founder signature, correct CTA buttons and six editable utility links.
2. Review and approve Directory 01 (guided welcome) and Directory 02 (quarterly review); test first-use and established-owner scenarios without sending customer emails.
3. Build and test club-specific share pack and Directory sharing affordances.
4. Design and test player's discovery-to-signup-to-return guided journey, drawing on Sarah's event journey and club journey UX.
5. Add consent-safe relevant notifications, source/attribution metrics and quality/freshness checks. Promote broadly only once player journey works end-to-end.

## Non-negotiable delivery controls

Use direct Base44 backend/code and authorised GitHub integration; **never Base44 AI Builder** unless specifically authorised with the required phrase. Sandbox test before owner-approved production deployment; then confirm actual deployed source and live result. No live email sends or recurring broadcasts without explicit task-specific authorisation. Keep RallyHub platform templates/branding separate from tenant/Clare Pickleball templates.
