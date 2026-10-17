# Tournival V1 — Development evidence / 17 October 2026

## Scope and source
Baseline: RH-TOURNIVAL-V1-MASTER v1.0, owner corrections from 17 October.
Development route: direct Base44 sandbox tools, main working branch, Base44-managed origin.
No Base44 AI Builder. No production deployment or publication.

## Implemented in this checkpoint
- Standalone `tournival_state` field added to Tournament schema source. Host and public Tournival paths read this first and migrate by writing only this field; guarded legacy fallback applies to tournament format 'tournival'. Existing KOTC state is not overwritten by Tournival saves.
- Pre-event estimator models 2–6 group rounds, match time, court-dependent knockout waves and mandatory final, changeovers, setup, and 60+ minute bookings in 30-minute steps. Host receives overrun warning, not a block.
- Tournival setup persists duration assumptions and enables 2 group rounds.
- 2-pair knockout generates an actual Final; 4-pair bracket begins at semifinal rather than incorrectly waiting for a QF.
- Score validator rejects absent scores and retains timed and points formats.
- Independent pure scheduling utility: match IDs, round-priority free-court fill, active player/court collision checks, blocked-player skip, pause, result version check, idempotent duplicate handling.

## Testing evidence
- `npm run test:tournival-v1`: automated estimator and sporting fixtures across 240 configurations; nine queue-to-completion runs and concurrency safety invariants.
- `npm run test:kotc-readiness`: PASS (372 scenarios / 34,833 checks).
- `npm run test:interclub-reliability`: PASS (37/37).
- `npm run build`: PASS following state-field changes.
These are sandbox code tests, NOT live production acceptance.

## Important incomplete work / release blocks
- Pure scheduler is NOT wired to an atomic server-side persistence service. Current host UI remains round-gated; simultaneous host saves have not been made transaction-safe.
- `tournival_state` schema has only been edited in sandbox source. Its backend deployment/migration is separately required, and production behaviour has not been verified.
- Dedicated Tournival entities, delegated host link access, payment and callback reconciliation, public registration, Spond, DUPR outbox, audio, Print Pack, rehearsal, Live Hall update transport and cross-device end-to-end tests are NOT implemented by this checkpoint.
- Backend source now includes the authenticated `update_tournival` management action, format checking, state-shape validation and a guard against replacing a scored draw. The player-facing host link now sends this action rather than `update_kotc`. This is sandbox source only and the endpoint is **not deployed or remotely integration-tested**.
- Playwright Chromium installed with OS dependencies; `npm run test:tournival-browser`: **6/6 PASS**, isolated simulation harness at 390px and 1280px, 2/4/6 rounds. This does NOT exercise the actual authenticated Tournival host or player application screens. Real-device / host acceptance remains NOT RUN.
- Do not publish or deploy until all master specification acceptance requirements are satisfied and owner gives separate explicit production approval.


## Additional sandbox integration checkpoint
- Added `tournivalOperations.js`: isolated domain handling registration capacity/waitlists, check-in, provider-confirmed payment transitions, withdrawals, safe public snapshot, notices, print-data versioning and conservative DUPR eligibility. These operations are pure and their payment/DUPR checks are **not wired to live providers**.
- Added a Tournival Rehearsal tab for authorised organiser views, running in local browser state only. It supplies synthetic check-ins, qualification match scheduling, manual synthetic score entry, knockout progression and final completion, with no Base44 entity mutation or external effect. This is an operational simulation **not a persistent server sandbox**.
- Tournival host and delegated manager save paths now use the authenticated `legacyTournamentManager` action `update_tournival`, with revision checks and duplicate operation ID responses. This protects ordinary stale saves but **is not an atomic database compare-and-swap**; racing writers may still conflict without serial transaction enforcement.
- The existing DUPR integration has UAT partner-token status and connection checks only. Full SSO/player mapping/eligible result submission/webhook reconciliation remains pending external endpoint-contract verification and development.
- The Interclub payment infrastructure supplies reusable SumUp checkout, provider verification and refund helpers. It has not yet been correctly bound to dedicated Tournival registrations and verified provider webhook receipts.
- The rehearsal end-to-end browser journeys pass for 390px and 1280px after correcting a checkout state bug found in browser testing.
