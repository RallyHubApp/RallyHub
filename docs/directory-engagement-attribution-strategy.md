# RallyHub Directory & Events — Engagement Attribution Strategy

## Purpose
Show clubs and event organisers measurable value from RallyHub without overstating what can be proven. Separate **intent signals** (for example, tapping Call now) from **verified RallyHub-generated enquiries** (an email successfully sent by RallyHub).

## What already exists
RallyHub already has a first-party analytics layer (`trackSiteEvent` → `siteAnalytics`) and records Directory/profile engagement including profile views, WhatsApp, email, website, map/directions, sharing, and event actions. This is the foundation; it should be standardised rather than rebuilt.

## Layer 1 — Site-wide contact action tracking
Replace exposed contact details on public Directory profiles with clear actions where appropriate:
- Call now
- Email club
- WhatsApp
- Visit website
- Get directions
- Share

Track each with a dedicated event name plus club/listing ID, source page, timestamp/session context and referral/UTM context. Do not put phone numbers, email addresses, or message content into analytics metadata.

### Required cleanup
- Add a dedicated `club_call_click` event.
- Stop recording phone taps as `club_whatsapp_click` with `channel: phone`.
- Keep existing `club_email_click`, `club_whatsapp_click`, `club_website_click`, `map_click`, share and profile-view signals.

These are **click/intent metrics**, not proof a call connected or an email was delivered.

## Layer 2 — Verified RallyHub-generated leads
For actions RallyHub can mediate, use a short RallyHub form instead of a naked `mailto:` link. The server sends the email and writes an operational lead record only after the delivery attempt.

Minimum record:
- listing/event ID
- organiser/club ID
- enquiry type
- source page
- timestamp
- delivery status/provider
- requester email only where operationally required

Keep submitted PII in the operational enquiry record, not the general analytics table.

The EYVA future-invitation flow is the first implementation of this pattern using `EventEnquiry`.

## Layer 3 — Events attribution
Measure:
- event page views / unique visitors
- saves
- shares
- calendar adds
- registration clicks
- future-invitation CTA opens
- verified future-invitation enquiries sent through RallyHub

A verified RallyHub enquiry should be reported separately from a click because it is a stronger value signal.

## Layer 4 — Club/organiser dashboard
Show simple outcome-focused metrics, for example:
- 1,240 listing views
- 310 unique visitors
- 83 contact actions
- 21 Call now taps
- 18 WhatsApp taps
- 13 Email club taps
- 31 Directions taps
- 12 verified RallyHub enquiries
- 18 website visits

Also show trend versus previous period and top source/referrer where available.

## Layer 5 — Monthly proof-of-value summary
Give each club/organiser a compact monthly summary such as:

> RallyHub generated 1,240 listing views, 83 contact actions, 31 direction requests and 12 verified enquiries for your club this month.

Use precise wording: "Call now taps" rather than "calls" unless a telephony provider confirms call connection.

## Future — verified call attribution
A `tel:` click can only prove intent. If RallyHub later needs completed-call attribution, add a tracked forwarding-number provider (for example, Twilio or equivalent) and record connected-call events separately. Do not infer completed calls from browser clicks.

## Privacy principles
- Collect the minimum necessary.
- No contact PII in general analytics metadata.
- Keep operational enquiry data access-controlled.
- Clearly tell users when an enquiry is being sent through RallyHub.
- Give organisers transparent counts and definitions so metrics are credible.
