# RallyHub Control – Reusable Guided Setup & Onboarding Journey

**Status:** Working control standard  
**Last updated:** 21 October 2026  
**Purpose:** Preserve the guided setup model so it can be reused for clubs, coaches, holiday providers, event organisers, suppliers and other RallyHub Directory listing types.

## Core principle
RallyHub should do the groundwork first. The organiser should check and complete only what is missing.

Preferred journey: **Prefill → show what is already ready → identify gaps → deep-link to the first unfinished item → autosave → preview → deliberate publish.**

## Reusable data model
Keep these concepts separate:
- **Person/account:** the verified RallyHub user.
- **Public listing/brand:** the name players see in the Directory. One person may manage more than one listing or brand.
- **Event:** one canonical RallyHub event record.
- **Collaborator:** another organisation associated with the same event; this must not create a duplicate event or duplicate poster.

A user account identity must never be forced to equal the public brand name.

## Conditional public-name confirmation
Only show this step when RallyHub has genuine identity or brand ambiguity.

Choices may include recognised brand names, **Use my own name**, and **Another business / brand**. Explain that the RallyHub account stays under the person’s own identity and the choice only controls the public organiser/business name.

Brand candidates and inference notes are private guided-setup metadata and must never be exposed by public Directory endpoints.

## Personalised setup summary
The first guided screen is a progress summary, not Step 1 of an empty wizard.

Example:
- ✓ About you
- ✓ Contact & social
- ✓ Where you operate
- ● Check your event
- ○ Preview & publish

Show **X of Y ready** and one primary action: **Continue setup**.

## Deep-link behaviour
Personalised onboarding link:
`/directory/{listing-slug}/edit?guided=1&continue=1`

The page must wait until listing type and related event data are loaded before deciding the next unfinished step.

If the first unfinished step is an existing event:
`/directory/{listing-slug}/events?guided=1&edit={event-id}`

## Autosave and resume
- Autosave guided changes.
- Show **Saved automatically ✓**.
- Maintain a local draft if a server save cannot yet complete.
- Resume from the first unfinished item.
- Optional fields never block continuation.

## Listing-type blueprints
**Club / place to play:** Club details → Contact → Playing venues → Regular sessions → Preview & publish

**Pickleball holiday / experience:** Confirm public name when ambiguous → About you → Contact & social → Where you operate → Holiday event → Preview & publish

**Tournament / event organiser:** Confirm public name when ambiguous → About you → Contact & social → Where you operate → Event → Preview & publish

**Coach / coaching provider:** Confirm public name when ambiguous → About you → Contact & social → Where you operate → Clinic/event when useful → Preview & publish

**Equipment / supplier:** Confirm public name when ambiguous → About you → Contact & social → Preview & publish

**Other provider:** Confirm public name when ambiguous → About you → Contact & social → Where you operate → Event when useful → Preview & publish

## Completion logic
Mark a step Ready only when information is genuinely useful:
- About: public name + usable description.
- Contact: at least one useful public contact method or website.
- Location/service area: populated where relevant.
- Club venue: usable venue name + address/map coordinates.
- Session: day + start time + venue.
- Event: meaningful event name/date; event-required listing types remain Started until published.
- Preview & publish: all required prior steps complete.

## Event hand-off
When an event already exists, say **We’ve already started your event for you** and show its name/date/location. Do not say “Create an event” when one exists.

Reuse suitable organiser contact and website information from the listing.

## Canonical event and collaborators
Keep one event record even when several brands or organisations are involved.

Public presentation:
- Hosted by [primary organiser]
- In collaboration with [partner]

If the collaborator later has a RallyHub listing, link it to the same event rather than creating a duplicate.

## Publish controls
Incomplete provider listings should remain a private setup draft until deliberately published. A non-club provider’s first event publication may also make the organiser listing live when that is the intended journey.

Do not claim a listing/event is live until production write and public behaviour are verified.

## Onboarding email pattern
The email should:
- Say **We’ve already started this for you**.
- Briefly state what RallyHub already knows.
- Show the same progress sequence as the product.
- Have one primary **Continue setup** button.
- Explain autosave/resume.
- Offer Quick Start as reassurance, not the main process.
- Mention detected brand ambiguity without making an assumption.

## Public discovery requirement
The Directory must visibly support:
- Clubs & places to play
- Tournaments & event organisers
- Coaching
- Pickleball holidays & experiences
- Equipment & suppliers
- Other enabled provider categories

Directory search must not silently exclude providers because the initial category happens to be Clubs.

Events is for dated events. Provider/business discovery belongs in the Directory; Events should link clearly back to provider categories.

## Intake data-quality rule
Accept common shorthand where safe:
- `www.example.com` → `https://www.example.com`
- Instagram/Facebook `@handle` → provider URL

Never silently discard a user’s valid-looking website/social information solely because they omitted the scheme.

## Implementation safeguards
- Reuse existing Directory listing and Tournament entities.
- Do not create a parallel onboarding database.
- Keep inferred setup metadata private.
- Do not hard-code individual providers into generic UI.
- Preserve stable listing slug when public display name changes.
- Keep role/access ownership separate from public naming.
- Re-run club/provider regression tests whenever guided setup changes.

## Current checkpoints
- Reusable guided setup and Sandra deep-link onboarding: `6ad910b9c9d604aebf6a71a3`
- Conditional public brand confirmation: `6ad916043c444c572449925f`

At the latter checkpoint, the focused Directory/Events suite passed 20/20 tests. Deployment/publication remains a separate production action requiring explicit approval.
