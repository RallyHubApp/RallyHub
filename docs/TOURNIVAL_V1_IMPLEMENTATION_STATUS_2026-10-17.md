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
- Browser/Playwright tests and real device or host acceptance have NOT been executed.
- Do not publish or deploy until all master specification acceptance requirements are satisfied and owner gives separate explicit production approval.
