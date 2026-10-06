# RallyHub Software Control Master (SCM)

**Status:** LIVE CONTROL MASTER — repository authority for signed-off behaviour and change control  
**Version:** 1.2
**Date:** 6 October 2026
**Owner:** RallyHub  
**Relationship to testing:** `docs/RALLYHUB_MASTER_TESTING_BLUEPRINT.md` defines how RallyHub is tested. This SCM defines what is approved/protected and what must not regress.

## 1. Permanent control rule

RallyHub is a commercial multi-tenant sporting platform. A feature is not accepted merely because a new request works. Every change must preserve all previously signed-off behaviour unless an explicit approved change says otherwise.

For protected modules the sequence is mandatory:

1. identify the affected module and protected requirements;
2. identify the signed-off baseline/checkpoint;
3. run the applicable pre-change regression/golden scenarios where practical;
4. make the smallest modular change;
5. run affected module tests plus all shared regressions;
6. compare correctness, security and performance with the baseline;
7. do not alter a protected requirement/test merely to make changed code pass;
8. create a named checkpoint only after the gate passes;
9. update this SCM when an approved behaviour genuinely changes.

Silence is not permission to alter a protected behaviour. A protected behaviour may change only by explicit approval.

## 2. Platform architecture — protected

- Permanent hierarchy: platform → tenant → club → venue/courts → session series/occurrences/events.
- Tenant is the security and commercial boundary.
- Canonical Person is separate from account, membership, player and competition entry.
- Multi-tenant, multi-club and multi-sport behaviour must not hard-code Clare names, colours, logos or IDs into shared logic.
- Public discovery/read models remain separated from private transactional club/competition data.
- Backend authorisation is authoritative; UI visibility is not a security boundary.
- Tenant/role/entitlement/resource isolation, auditability and versioned rulesets are permanent controls.
- Trial expiry preserves tenant data/history and must not interrupt a live event.
- Shared changes trigger regressions in every consuming module.

## 3. King of the Court (KOTC) — PROTECTED COMMERCIAL MODULE

### 3.1 Sporting invariants

- `KOTC-SPORT-001`: Court 1 is always the King Court / highest court.
- `KOTC-SPORT-002`: Winners move exactly one court towards Court 1. Winners already on Court 1 stay on Court 1.
- `KOTC-SPORT-003`: Losers move exactly one court away from Court 1. Losers on the bottom active court remain at the bottom end.
- `KOTC-SPORT-004`: The number of active courts changes the bottom court only; it never changes the hierarchy. Examples: 3 courts => Court 3 bottom; 4 courts => Court 4 bottom.
- `KOTC-SPORT-005`: Incoming result pairs split into new partnerships unless an explicit valid host pair lock requires otherwise.
- `KOTC-SPORT-006`: A pair lock may not silently reverse earned ladder movement. Impossible constraints must fail visibly rather than manufacture a bad round.
- `KOTC-SPORT-007`: Round generation must enforce a final sporting invariant before persistence. Wrong-direction movement must fail closed.

### 3.2 Bench/fairness invariants

- `KOTC-BENCH-001`: Bench pressure starts at the bottom of the sporting ladder; bench fairness must not redesign earned movement.
- `KOTC-BENCH-002`: Do not give a player a second bench while another otherwise eligible player has never benched, unless no valid alternative exists.
- `KOTC-BENCH-003`: Court 1 winners are protected from ordinary bench rotation because King Court was earned.
- `KOTC-BENCH-004`: Exception: after three consecutive wins on Court 1, a player becomes eligible for bench rotation.
- `KOTC-BENCH-005`: The Court 1 streak means consecutive Court 1 wins, not appearances or wins elsewhere. Loss, bench or play away from Court 1 resets it.
- `KOTC-BENCH-006`: Host locks remain respected where a valid sporting arrangement exists.

### 3.3 Scoring/live-host invariants

- `KOTC-SCORE-001`: Player Link scoring may operate without identity verification when configured as open player scoring; first scorer/device claims the court.
- `KOTC-SCORE-002`: One scorer per court at a time. A saved result is locked against competing first-pass writes; corrections are controlled.
- `KOTC-SCORE-003`: Score digits are entered locally; the application must not make a network request for every key press.
- `KOTC-SCORE-004`: Authoritative score persistence is the critical path. Audit/telemetry must not hold the host on a Saving state after the authoritative match write succeeds.
- `KOTC-SCORE-005`: Prepare Next Round must not perform redundant full-state reads when the host already has authoritative resolved score state; server-side preparation still validates current matches.
- `KOTC-SCORE-006`: Lost-response, stale-revision, double-tap, scorer-lock and Base44 429 behaviour remain mandatory Deep tests.
- `KOTC-SCORE-007`: Courtside performance is correctness. Score Save, Prepare Next Round and Start Round require performance regression evidence, not only functional pass/fail.
- `KOTC-HOST-001`: The primary/Superhost has a live session leaderboard directly inside the KOTC host interface. It must not require opening the public Results link or leaving the live host workflow.
- `KOTC-HOST-002`: The live host leaderboard recalculates from authoritative completed session matches and shows position, player, played, wins, losses, score differential and Court 1 appearances using the same session ranking order as KOTC results.

### 3.4 Host/session behaviour already established

- Start gate before score entry; clear current-round state.
- Auto/controlled progression only after required scores are resolved.
- Undo/recovery must preserve authoritative sporting state.
- Live roster supports injury, leaving, late join/return and bench handling without corrupting historical rounds.
- Hall announcements include the established `5-4-3-2-1, hand in scores` sequence where enabled.
- Cumulative leaderboard/history, head-to-head and future prediction features must consume authoritative completed results and not mutate sporting movement.
- KOTC is generally not DUPR-rated; DUPR is an explicit per-event choice, not an implicit KOTC behaviour.

### 3.5 Current protected restore points

- `LOCKED KOTC sporting and bench hierarchy` — signed-off sporting/bench implementation checkpoint, 5 Oct 2026.
- `KOTC live score latency fast path` — live scoring latency/control checkpoint, 5 Oct 2026.

These checkpoints are rollback references, not permission to bypass regression testing.

## 3A. Universal player measurement & sporting intelligence module — PROTECTED

RallyHub preserves three separate player measures. They may be displayed together for context, but none may silently modify another.

1. **Club Leaderboard / Club Rank** — official cumulative club competition table. Eligible completed results score Win = 2, Draw = 1, Loss = 0. Ranking order is total leaderboard points, then total wins, then score differential (PF − PA), then Points For. Court 1 appearances, bench frequency, starting/final court, DUPR and predictive strength do not affect Club Rank. If all sporting tie-breaks remain equal, players share the same rank; alphabetical order is display-only and is never a sporting tie-break. For Clare's current production history the controlled baseline begins 17 September 2026; demos, tests and sandboxes are excluded. Genuine KOTC, Banner Bash, Interclub and other explicitly leaderboard-enabled sporting events feed the same cumulative table. Interclub showcase/exhibition matches do not count.
2. **DUPR Rating** — external DUPR measure. RallyHub may display the current DUPR and preserve the DUPR snapshot at match time for context/analysis. DUPR does not alter Club Leaderboard points or rank.
3. **RallyHub Performance Rating / Performance Analysis** — separate RallyHub intelligence layer for opponent strength, score margins, head-to-head, partners/opponents, recent form, expected versus actual performance, trends and future prediction. It does not alter Club Leaderboard points/rank and does not overwrite DUPR.

Protected invariant: **Club Points ≠ DUPR ≠ RallyHub Performance Rating.**

### 3A.1 Shared multi-tenant sporting-intelligence architecture

- Sporting intelligence is a **shared RallyHub platform module**, not a Clare-specific feature and not duplicated inside each sporting format.
- All shared logic is tenant/club scoped. Clare names, colours, IDs or event assumptions must never be hard-coded into the generic engine.
- KOTC, RallyHub Interclub, Tournival, standard tournaments and future sporting formats consume the same canonical intelligence service where their match model is compatible.
- A new tenant/club inherits the reusable module and can configure its capabilities without a bespoke code fork.
- Official Club Leaderboard eligibility and Performance Intelligence eligibility are **independent controls**. An event may feed intelligence without affecting Club Rank.
- Existing genuine leaderboard-enabled events remain eligible for both unless deliberately configured otherwise; test/demo/sandbox/abandoned/cancelled data must not contaminate either measure.
- The implemented performance service version is `performance-2026-10-06-v2-multitenant`.
- Protected restore point: `Multi-tenant sporting intelligence module v2` — 6 October 2026.

### 3A.2 Club-level capability controls

Each tenant club may enable/disable the following capabilities independently:

- Sporting Intelligence master capability;
- RallyHub Performance Rating;
- Head-to-Head analysis;
- Partnership/partner analysis;
- Forecasting/prediction;
- DUPR contextual intelligence.

These controls determine which intelligence capabilities are available to that club. They do not rewrite historic sporting results and do not silently change Club Points.

### 3A.3 Event/format controls

Every sporting logic must expose or inherit appropriate event-level policy controls rather than embedding its own leaderboard/rating rules.

- **Counts toward Club Leaderboard** — controls official Club Points/Rank only.
- **Include in Performance Intelligence** — controls whether eligible completed results feed RallyHub rating/analysis.
- Format/event overrides may separately govern RallyHub rating, H2H, partnership analysis, forecasting context and DUPR context where supported.
- The two primary switches are deliberately independent: an event can contribute to Performance Intelligence while being excluded from the official Club Leaderboard.
- Test/practice/demo events default away from official standings and must be explicitly isolated.
- Event policy must be resolved before results are consumed; no silent retrospective reclassification.

### 3A.4 Intelligence inputs and outputs

The Performance Analysis layer may use authoritative completed match data to calculate or expose opponent strength and quality of result; score margin and points for/against; head-to-head records; partner combinations/chemistry and opponent combinations; recent form and trends; expected versus actual performance; activity/format splits; RallyHub performance rating/history; and future match/team predictions and forecasting.

Court position, Court 1 appearances and other format-specific metadata may be retained as descriptive statistics where useful, but do not alter official Club Rank unless a future explicitly approved versioned methodology says otherwise.

### 3A.5 Governance and change control

- The sporting-intelligence engine must consume authoritative completed sporting results; it must never mutate match outcomes, KOTC movement or other sporting state.
- Club Rank methodology, DUPR and RallyHub Performance Rating remain separately versioned concepts.
- No future sporting module may create an independent competing player-rating/leaderboard implementation where the shared module can be used.
- Any change that would make Performance Intelligence influence Club Points/Rank requires an explicit methodology version change, impact analysis, Super Admin approval, shadow/dry-run comparison and SCM update before production.
- Historical DUPR snapshots may be retained for analysis, but current DUPR must never be retroactively substituted as if it were the rating at match time.
- The canonical separation rule must be preserved in UI/API behaviour and regression testing: **Club Points ≠ DUPR ≠ RallyHub Performance Rating.**

## 4. RallyHub Interclub — PROTECTED MODULE

- Dedicated club-versus-club module, not a generic tournament fallback.
- Existing teams, registrations, scores and event history are protected; live events must never be used as disposable test data.
- Team setup supports club players, guests, ranking/order, reserves, planned substitutions and handover.
- Event-day host controls include draw approval/undo, court/time controls, break controls, reserve/replacement handling, score correction, PA/announcements and public/live views.
- Historical rounds/results remain immutable when future substitutions/replacements are applied.
- Public/player links are read projections and must not expose private participant/contact data.
- Scoring and event management remain permission-controlled and tenant-scoped.
- Completed/archived events are read-only except through explicitly authorised audited correction/reopen workflows.
- Public link resilience and concurrent access are release requirements; player/public views should tolerate the expected event audience (current operational target up to approximately 200 simultaneous viewers).
- Live Event View standard: responsive phone/screen layout, RallyHub/module branding, QR/clickable links, Copy/Share/WhatsApp, appearance controls and event-specific final/showcase handling.
- Clare v Galway, 4 Oct 2026, is production evidence: 4 courts, 12 rounds, 20-minute break after Round 6, optional showcase/final. Day-of failures (public link load, draw spinner, missing draw icon) are permanent regression cases.
- Draw/spot-prize behaviour is non-sporting unless explicitly configured; it must never alter scores/rankings.
- DUPR can be enabled for an Interclub event only by explicit event configuration/agreement.

## 5. DUPR integration — CONTROLLED INTEGRATION MODULE

### 5.1 Architecture decisions

- Central RallyHub DUPR service; no DUPR-specific logic duplicated independently inside each sporting module.
- DUPR is optional per event/format. Tournament, Interclub, ladder/league fixture or club night can opt in when appropriate.
- KOTC is normally DUPR-off because its scoring/rotation format is generally unsuitable.
- Official integration path uses DUPR SSO/authentication; do not rely on manually typed player IDs as the primary production identity mechanism.
- Server-side partner/UAT token handling only. Secrets remain server-side and must never be exposed in frontend code/logs/public responses.
- Ratings are visible from authorised DUPR data/webhook updates where permitted.
- Organiser flow: score/result → organiser review/approval → DUPR submission. Submission must never happen merely because a score exists.
- Match create/update/delete permissions and club permissions must follow DUPR partner rules and RallyHub tenant/event authority.
- UAT and production remain separated. Certification/integration review precedes production credentials.
- Provider-neutral CSV/manual interoperability remains a permanent fallback, not a replacement for the official API integration.

### 5.2 UAT work completed / in progress

- NDA/access process completed sufficiently to obtain UAT partner credentials; UAT credentials are held in Base44 Secrets.
- Four test identities are part of the controlled UAT set: Brian, Róisín, RallyHub app/test identity and Marie; three were verified during the current cycle and Marie required re-verification after an expired link.
- DUPR instructed logout before each verification; MFA is required for club-admin access.
- UAT club access follows identity verification and password-reset/MFA setup.
- The integration work reviewed mandatory SSO, ratings/webhooks, result publication and DUPR's integration checklist.
- Per-event enable/disable remains a protected product requirement.
- Existing historical Phase-1 interoperability decision: provider-neutral CSV/manual export/import fallback remains available even after API integration.

### 5.3 DUPR regression/security requirements

- No token/secret in browser bundle, logs, public payloads or tenant-visible configuration.
- Wrong tenant/club/event cannot submit another entity's results.
- Duplicate/retry/idempotency behaviour must prevent accidental duplicate DUPR publication.
- Correction/deletion flows must reconcile with DUPR rather than creating contradictory RallyHub/DUPR records.
- Opted-out events must make zero DUPR publication calls.
- UAT test accounts/data must not contaminate production leaderboards or club records.
- Player consent/SSO linkage must be durable enough that normal use does not repeatedly force unnecessary re-verification, while respecting DUPR token/security requirements.

## 6. Membership / Member Portal — PROTECTED SHARED MODULE

- Membership year for Clare currently runs September–September; displayed 2026–27 fee is €36. Tenant configuration must remain dynamic rather than hard-coded globally.
- Membership list requires operational filters including A–Z, membership ID, payment date and DOB where authorised.
- Member profile supports controlled profile photo/crop and initials fallback.
- Member contact details are private by default; public/member-facing projections must not expose full mobile/email without explicit authorised design. Existing masked-display requirement includes last-four-digit style where appropriate.
- GDPR communications/consent is one-way/controlled where specified and must be auditable.
- Canonical identity/member reconciliation must handle aliases/duplicates without silently creating duplicate people.
- Member Portal Phase 1: Home | Play | Clubhouse | Learn | Me; combined personal calendar/map; KOTC/Interclub/Directory events; posts/polls/comments; privacy-controlled messaging; profiles/membership/payment/playing groups; competition results/leaderboard; Learn/resources; notifications/digital membership card/onboarding.
- Phase 1 continues to use Spond for sessions/bookings/payments where agreed. Phase 2 progressively replaces Spond with native sessions, eligibility, capacity/waitlists, payment-confirmed booking, reminders, cancellations/refunds, attendance, event chat/broadcasts, host tools and analytics.

## 7. Events / Public Directory / Discovery

- Public Directory supports 32-county discovery and filters including county/day/time/level/indoor/outdoor/name.
- Claim → verify → edit remains the ownership flow; private owner/contact records are not public listing fields.
- Protected Call/WhatsApp/Email actions must respect GDPR/privacy and tracking rules.
- Directory/public discovery is a public read layer, separated from transactional competition state and private club/member data.
- Event creation is tenant-controlled with public categories such as Tournaments, Coaching, Holidays and Other; upcoming fixtures/events must remain discoverable.
- Public listing counts/data imports are controlled datasets; regressions in count or protected records require reconciliation rather than silent overwrite.

## 8. Trials, entitlements and external clubs

- External trials use isolated tenants and explicit entitlements/capabilities.
- Demo Mode data remains separate from real statistics.
- Trial-to-paid conversion preserves tenant, users, integrations and history.
- Expiry preserves data and must not terminate a live event mid-session.
- Ashbourne/external KOTC trials must use the same protected KOTC sporting engine, not a divergent copy.

## 9. Testing and release control

The Master Testing Blueprint remains mandatory. In addition:

- Protected requirement IDs in this SCM are release gates.
- Golden scenarios must cover at minimum KOTC 12/3, 14/3+2 bench, 16/4, 18/4+2 bench, locks, three consecutive Court-1 wins, injury, late join, odd/even bench cycles, host overrides, crash/recovery, player scoring and Base44 slow/429/lost-response conditions.
- Interclub golden scenarios include full draw → live → scores → break → substitutions/replacements → final result → archive/reopen/public view.
- Every meaningful live defect becomes a permanent regression case.
- Production membership and proven live competition data are never disposable test fixtures.
- Test harnesses must label TEST MODE and isolate synthetic data.
- A build pass proves compilation only. It does not prove sporting correctness, performance, security or release readiness.

## 10. Development/tool control

- Prefer direct, reviewable repository/code changes for controlled RallyHub engineering work where the capability exists.
- Do not substitute an AI builder message/request for a previously agreed direct-code workflow merely for convenience.
- If a different implementation route is genuinely required, record the reason before changing the protected module.
- Approved visual/email/document assets are references to reuse, not prompts to redesign.
- Changes to shared components must identify every consuming module before release.
- The protected **Development & Control Library** in Super Admin is the human-readable access point for RallyHub control/reference documents. Repository files under `docs/` remain authoritative; the library is a read-only generated mirror and must not become an independently edited copy.
- Control-library document retrieval is backend-authorised for RallyHub Super Admin; hiding a frontend tab is not sufficient security.
- When a controlled document changes, regenerate/synchronise the secure library mirror before checkpoint/release.

## 11. Communications Engine — SHARED PROTECTED MODULE

Implementation began 6 October 2026 as an additive, standalone shared service. Existing module callers remain unchanged until their individual adapter gate passes. The detailed architecture contract is `docs/RALLYHUB_COMMUNICATIONS_ENGINE_ARCHITECTURE.md`.

Protected scope:

- multi-tenant/platform owner identity, sender identity, audience and purpose on every communication;
- tenant BrandKits/style guides: approved logos, colours, typography/fallbacks, layout, buttons, imagery, voice/tone, contact/social/legal footer and channel overrides; no hard-coded Clare identity in shared code;
- reusable/versioned templates, components/content blocks and approved custom HTML;
- independently editable HTML and plain-text email bodies with desktop/mobile/plain-text preview and parity checking;
- operational, transactional, campaign, emergency and interactive communications;
- interactive communication types include polls, feedback, suggestions, surveys, RSVP and availability requests; they use the same audiences, branding, scheduling, reminders, workflow and audit controls;
- dynamic/saved audiences resolved from authorised live RallyHub data, with exact eligible/excluded/suppressed counts before bulk send;
- central permission/consent gate, preference centre, double-opt-in evidence where configured, persistent suppression and tenant-vs-platform consent separation;
- workflow/journey orchestration: trigger → condition → action/send → wait → live-state re-check → branch → goal → exit/escalation; completion of the goal immediately stops irrelevant reminders;
- event-relative and scheduled delivery, quiet hours, frequency/communication-pressure controls and workflow simulation;
- recipient-level delivery ledger including queued/sent/accepted/delivered/opened/clicked/action-completed plus bounce/failure/complaint/unsubscribe where providers support the event; opens are indicative, first-party RallyHub actions are preferred outcome evidence;
- controlled bulk sends: batching/throttling, progressive limits, sender/domain health, pre-flight checks, cancellable safety delay, stop-remaining delivery, staged sends and circuit breakers;
- list provenance and anti-spam controls; purchased/scraped lists are prohibited;
- recipient deduplication, idempotency and targeted resend/correction;
- provider abstraction: email now; assisted WhatsApp hand-off retained; future WhatsApp Business API/SMS/push are adapters rather than module rewrites;
- protected contact relay/replies must avoid unnecessary disclosure of raw email/mobile data;
- campaigns may later use A/B testing, conversion attribution, behavioural follow-up, best-time optimisation and AI drafting/recommendations; AI never silently expands an audience or sends;
- suppliers/providers may use governed communications but never receive raw Directory contact databases;
- existing approved email templates/assets and current KOTC/Interclub/Session Booking behaviour are protected migration inputs, not redesign prompts;
- no sporting/product module should retain independent communication transport/template/workflow logic after its migration is signed off.

### 11.1 Phase-1 isolated core — 6 October 2026

Created without wiring any production caller:

- `CommunicationCampaign`
- `CommunicationMessage`
- `CommunicationRecipient`
- `CommunicationDeliveryAttempt`
- `CommunicationBrandKit`
- `CommunicationTemplate`
- `CommunicationWorkflow`
- `CommunicationPoll`
- `CommunicationPollResponse`
- pure policy core `src/services/communications/core.js`
- executable gate `scripts/communicationsCoreGate.mjs`

Phase-1 gate covers tenant scope, marketing permission, suppression, dedupe, idempotency, HTML/plain-text readiness, workflow exits and poll validation. Existing `EmailTransportConfig`, `ConsentRecord`, `ClubBroadcast`, feedback entities and all current module callers remain untouched.

### 11.2 Controlled rollout

1. Phase 1 core + architecture gate.
2. BrandKit + reusable renderer/composer.
3. Central delivery/ledger adapter around existing transport.
4. Session Booking as first contained caller migration.
5. KOTC results/player communications with all current private-link/test-send/dedupe/resend behaviour preserved.
6. Interclub as first reusable multi-step journey.
7. General workflow engine + simulation.
8. Membership/payment journeys.
9. Preference centre/double opt-in UX.
10. Deliverability/anti-spam guard before broad Directory/provider campaigns.
11. Directory/network audience engine.
12. Campaign optimisation/analytics/AI and additional channel adapters.
13. Full migration/duplicate-code cleanup only after each module passes regression.

## 12. Module register

| Module | Current control status | Primary next control work |
|---|---|---|
| Platform architecture/security | Protected | Maintain isolation/entitlement regressions |
| KOTC | Commercial / protected | Golden sporting + latency gates |
| Interclub | Production-proven / protected | Convert live defects into permanent regressions |
| DUPR | UAT integration / protected design | Complete controlled UAT/certification and event toggle |
| Sporting Intelligence / Player Measurement | Protected shared multi-tenant module | Regression-test tenant/event capability policies and leaderboard separation |
| Membership/Member Portal | Active development / protected data model | Continue modular Phase 1 |
| Events | Active | Consolidate shared event/public projections |
| Public Directory | Production dataset / protected privacy | Continue controlled reconciliation/claim flow |
| Trials/Entitlements | Controlled pilot | External-club isolation and conversion testing |
| Communications Engine | Phase 1 isolated core / protected | BrandKit + composer, then controlled caller adapters |

## 13. Change log\n\n### 6 October 2026 — SCM v1.3\n\n- Began standalone Communications Engine Phase 1 behind the pre-build checkpoint `Pre-Communications Engine baseline`.\n- Added central campaign/message/recipient/delivery/BrandKit/template/workflow entities plus first-class polls/feedback/survey/RSVP/availability entities.\n- Added executable core gate and protected strangler-migration order; no existing production communication caller changed.\n- Expanded the protected specification to include consent/double opt-in, HTML/plain-text parity, workflow goals/exits, deliverability/anti-spam controls, tenant style guides, interactive communications and future channel adapters.\n

### 6 October 2026 — SCM v1.2

- Added the secure Super Admin **Development & Control Library** as the readable in-product access point for RallyHub control/reference documentation.
- Repository `docs/` files remain the authority; the in-product library is a generated read-only mirror to prevent document drift.
- Added backend Super Admin authorisation, searchable document index and in-app Markdown reader.
- Indexed all 13 current Markdown documents held under RallyHub `docs/` at this baseline.

### 6 October 2026 — SCM v1.1

- Replaced the earlier partial Universal Player Measurement section with the implemented shared multi-tenant Sporting Intelligence architecture.
- Preserved the three independent measures: Club Leaderboard / Club Rank, DUPR Rating, and RallyHub Performance Rating / Performance Analysis.
- Recorded club-level capability controls for Sporting Intelligence, Performance Rating, Head-to-Head, Partnership Analysis, Forecasting and DUPR context.
- Recorded independent event controls for official Club Leaderboard eligibility versus Performance Intelligence eligibility.
- Recorded reusable consumption by KOTC, Interclub, Tournival, standard tournaments and future sporting formats.
- Recorded implementation version `performance-2026-10-06-v2-multitenant` and checkpoint `Multi-tenant sporting intelligence module v2`.
- Reaffirmed the protected invariant: **Club Points ≠ DUPR ≠ RallyHub Performance Rating.**


### 5 October 2026 — SCM v1.0

- Created permanent Software Control Master.
- Captured platform architecture, KOTC sporting/bench/scoring invariants, Interclub, DUPR, Membership/Member Portal, Events/Directory, trials and release controls.
- Recorded KOTC sporting and live-score-latency checkpoints.
- Established Communications/Email Engine as the next shared modular build.
- Established explicit rule that approved behaviour cannot be changed silently and that build success alone is not release evidence.
