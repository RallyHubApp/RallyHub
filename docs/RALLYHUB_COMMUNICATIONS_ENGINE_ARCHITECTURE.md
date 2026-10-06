# RallyHub Communications Engine — Phase 1 Architecture Contract

Status: ISOLATED / NOT WIRED TO PRODUCTION CALLERS
Baseline checkpoint: Pre-Communications Engine baseline
Build method: additive strangler migration.

## Purpose
One multi-tenant, multi-sport Communications Engine for operational, transactional, campaign and interactive communications. Source modules own sporting/business state and audience semantics. Communications owns permission/consent evaluation, composition, branding, channel orchestration, workflow, delivery state and audit.

## Phase 1 entities
CommunicationCampaign, CommunicationMessage, CommunicationRecipient, CommunicationDeliveryAttempt, CommunicationBrandKit, CommunicationTemplate, CommunicationWorkflow, CommunicationPoll, CommunicationPollResponse.

Existing EmailTransportConfig and ConsentRecord remain untouched in Phase 1 and are migration inputs, not duplicated transports.

## Interactive communications
Polls, feedback, suggestions, surveys, RSVP and availability requests are first-class communication kinds. They use the same audience, BrandKit, schedule, reminders, workflow and audit infrastructure. Existing RallyHubFeedback, ClubFeedback and Club Challenge voting are not modified yet; later adapters may feed them into the common interaction model.

Question types planned: single choice, multiple choice, yes/no, rating/scale, free text, date/time/availability and RSVP. Polls can be anonymous or identified, time-limited, results-controlled and reminder-enabled.

## Non-regression / DO NOT MODIFY in Phase 1
No caller changes to KOTC, Session/Guest Booking, Interclub, Membership, Directory, Events, Member Messaging, ClubBroadcast, payment or sporting engines.
No change to existing send transports, templates, recipient selection, private links, scoring/results logic or WhatsApp hand-off.
No production campaign sending is introduced by Phase 1.

## Central rules
- Platform vs tenant ownership is explicit; tenant-owned records require tenant_id.
- Campaign/marketing communication requires applicable permission before eligibility.
- Suppressed endpoints are never eligible.
- Recipient dedupe and delivery idempotency are central.
- Email requires HTML and plain-text bodies before send readiness.
- Workflow re-checks live state; goal achieved / expiry / withdrawal / suppression exits the journey.
- Emergency is a distinct policy class; ordinary campaigns do not bypass quiet hours.
- Historical rendered message/template/BrandKit versions are immutable audit evidence.
- AI may draft/recommend; it may not silently expand an audience or send.
- Providers/suppliers never receive raw Directory contact databases.

## Later adapters
Session Booking first contained adapter; KOTC results/player communications; Interclub journey; Membership/payment journey; Directory/network campaigns only after deliverability guard and preference centre.

## Test gate
scripts/communicationsCoreGate.mjs must pass before any existing module imports the core.
