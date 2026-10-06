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

## Standalone build completed — 6 October 2026

The Communications Engine is now built as a dormant RallyHub module in the live repository. This does **not** mean existing communications have been migrated. The activation boundary is deliberate: KOTC, Interclub, Session Booking, Membership, Directory and Events retain their existing callers until a separately approved adapter migration.

### Portable domain layer
The following code is intentionally independent of Base44:
- `src/services/communications/core.js` — scope, dedupe/idempotency primitives, readiness and workflow exit rules.
- `renderer.js` — BrandKit, merge fields, HTML/plain-text rendering and parity signals.
- `audience.js` — dynamic AND/OR audiences, exclusions and contact dedupe.
- `consent.js` — purpose-aware permission, tenant/platform scope and double-opt-in evidence.
- `workflow.js` — goal-based journey state and simulation.
- `workflowLibrary.js` — reusable payment, Interclub, KOTC, membership and feedback journey definitions.
- `deliverability.js` — pre-flight risk, bounce/complaint circuit breakers, staged-send advice, communication pressure and safety delay.
- `polls.js` — poll/survey/feedback/RSVP/availability question validation and result aggregation.
- `analytics.js` — delivery and outcome metrics.
- `ports.js` — repository/provider/clock boundaries for future migration away from Base44.
- `engine.js` — orchestration/activation boundary.
- `simulator.js` — no-send campaign simulation.

### Persistence model
In addition to the Phase-1 entities, the standalone build now includes:
- `CommunicationPreference`
- `CommunicationSuppression`
- `CommunicationChannelConfig`
- `CommunicationEvent`
- `CommunicationConversation`
- `CommunicationContentBlock`
- `CommunicationWorkflowRun`

These support preference centre/double opt-in, suppression, provider configuration, immutable audit events, replies/inbox, reusable blocks and journey state.

### Communications Centre
Super Admin now has a standalone `/app/communications` route. It is visibly marked **BUILD / SIMULATION — external delivery disabled**. It exposes the intended product areas:
Overview; Compose; Audiences; Templates & Brand; Workflows; Polls & Feedback; Delivery; Consent; Analytics; Settings.

The composer can already run a no-send KOTC-style simulation, render HTML and plain text and report audience/pre-flight state. There is deliberately no live Send button.

### Activation safety
The portable engine has explicit modes: `simulation`, `test`, `live`. Simulation cannot externally deliver. Live preparation alone is insufficient: the activation boundary also requires a successful pre-flight and an explicit activation token supplied by a controlled adapter. Existing source modules do not possess that adapter/token.

### Base44 boundary
Base44 is treated as current infrastructure, not the architecture. Base44 entity/function access belongs behind adapters. Delivery providers are also adapters. A future move from Base44 therefore replaces infrastructure adapters rather than the Communications domain/workflow/template/audience engine.

A discovered Base44 bundling constraint prevents one backend-function directory directly importing source from another backend-function directory. Future source-module integration must therefore use a stable Communications service/API boundary or a separately packaged shared dependency; it must not duplicate the Communications domain rules back into source modules.

### Test gates
- `communicationsCoreGate.mjs`
- `communicationsRendererGate.mjs`
- `communicationsDeliveryGate.mjs`
- `communicationsDomainGate.mjs`
- `communicationsActivationGate.mjs`

The domain gate includes KOTC-results, Interclub-journey and payment-reminder simulations. The activation gate proves simulation cannot send and live delivery requires explicit activation. The full production Vite build must also pass.

### Explicitly deferred to controlled activation
No existing KOTC, Interclub, Session Booking, Membership, Directory, Events or other communication caller is redirected by this standalone build. No legacy communication code is deleted. Those are migration phases, not module-build phases.

## Standalone build completed — 6 October 2026

The Communications Engine is now built as a dormant RallyHub module in the live repository. Existing KOTC, Interclub, Session Booking, Membership, Directory and Events communication callers remain unchanged until separately approved adapter migrations.

### Portable domain layer
The platform-independent layer now covers core policy, BrandKit rendering, audiences/deduplication, consent and double-opt-in evidence, workflow execution/simulation, reusable journey definitions, deliverability/pre-flight, polls/feedback/RSVP/availability, analytics, provider/repository ports, orchestration and no-send simulation.

### Persistence model
The standalone model includes campaign, message, recipient, delivery attempt, BrandKit, template, workflow, poll and poll response plus preference, suppression, channel configuration, immutable communication event, conversation/inbound thread, reusable content block and workflow-run state.

### Communications Centre
Super Admin has a standalone `/app/communications` route marked BUILD / SIMULATION — external delivery disabled. It exposes Overview, Compose, Audiences, Templates & Brand, Workflows, Polls & Feedback, Delivery, Consent, Analytics and Settings. The composer can run a no-send KOTC-style simulation and render HTML and plain-text previews. There is deliberately no live Send action.

### Portability and activation boundary
Base44 is current infrastructure, not the Communications architecture. Base44 persistence/functions and each delivery provider belong behind adapters so future infrastructure replacement does not rewrite the domain engine. Engine modes are simulation, test and live; simulation cannot externally deliver, and controlled activation requires successful pre-flight plus an explicit adapter-level activation credential.

A Base44 bundling constraint discovered during the first adapter experiment prevents one backend-function directory directly importing source from another backend-function directory. Future module integration must use a stable Communications service/API boundary or separately packaged shared dependency; it must not copy domain rules back into source modules.

### Test gates
- `communicationsCoreGate.mjs`
- `communicationsRendererGate.mjs`
- `communicationsDeliveryGate.mjs`
- `communicationsDomainGate.mjs`
- `communicationsActivationGate.mjs`

The domain gate includes KOTC-results, Interclub-journey and payment-reminder simulations. The activation gate proves simulation cannot send and controlled live delivery requires explicit activation. The full production Vite build also passes.

### Deferred to controlled migration
No existing source module is redirected by this standalone build and no legacy communication code is deleted. Source-module integration is a later migration phase with its own checkpoint and regression gate.
