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


## Continuous courts, Live Hall and operational Print Pack
- New Tournival host Live Scoring view is connected to the version-aware authenticated manager save. It schedules free courts independently, allows scoring active courts, releases courts on confirmation, schedules the next eligible known fixtures without waiting for a whole qualification round, and advances to knockout readiness once all qualification results exist.
- New read-only Tournival Hall projection and A4 Print Pack display confirmed scores and standings. Print Pack includes event revision and paper interruption/reconciliation instructions. The print-pack staleness comparison exists but requires a refreshed latest revision in the hosting application to be meaningful.
- Public Tournival UI uses read-only Hall for the new persistent match structure; legacy round-based public scoring remains restricted to manager-authenticated operations.
- `e2e/tournival-live-scoring.spec.mjs`: 2/2 desktop/mobile complete qualification scoring journeys passed. The separate manual rehearsal end-to-end browser gate also passed 2/2, and the engine widget 6/6.
- Important: the new browser host flow is still a Vite isolated harness with in-memory saves. A real authenticated Base44 database concurrency test has **not** passed. Neither payment nor DUPR UAT workflows were exercised.


## Tournival registration and DUPR UAT adapter integration
- Added dedicated `TournivalSession`, `TournivalMatch`, `TournivalRegistration` and hashed `TournivalAccessToken` schema source files. The new entity schemas remain **not deployed**. TournivalSession is the intended authoritative session state and Tournament.tournival_state is a compatibility projection.
- Public registration uses an event-specific 192-bit link, optional DUPR consent and separate 192-bit player link, tenant-specific Player and Person identity, capacity and waiting list, SumUp hosted checkout via the existing RallyHub adapter and PaymentRecord. Events with a verified paid webhook are added to the event roster. Payment provider callbacks verify amount and currency and do not accept browser redirects as proof.
- Organisation tools now display registrations, check-in and withdrawals with reason, keeping sporting results intact.
- A personal player page provides registration/payment/check-in, assigned fixtures, scores and knockout. A spectator-only Live Hall fetches revision-aware, redacted projections with bounded backoff and without contact information.
- Public Registration/Player/Hall browser journey with test-double backend: 6/6 PASS (390px / 1280px).
- DUPR: examined actual UAT OpenAPI contract, and adjusted partner token path/version to `/api/auth/v1.0/token`. Implemented strict opt-in, consent and eligibility-to-payload adapter for `/api/match/v1.0/batch`. Three Deno unit tests pass. Organiser may inspect dry-run report; UAT result transmission is intentionally **disabled** until actual permitted identity/SSO/scope and write rights are established. The previously existing connection test still requires Base44 Secrets and a deployed UAT backend.
- Registration/payment and public backend functions compile under `deno check`, but are not tested against real Base44 entity persistence or live/test provider callbacks. Full Base44 sandbox backend must be isolated and separately deployed/activated before persistent end-to-end host/player acceptance can be claimed.
- **Open risk**: The Base44 entity update interface currently used for sporting state does not expose an atomic compare-and-swap primitive. Two simultaneous host writers may both pass revision validation before writes; this is not accepted as a concurrency-safe final release.
- **Open risk**: registration capacity check and insert are not transactional. Under simultaneous submissions, capacity might be oversubscribed; do not claim financial/capacity release readiness until fixed and independently tested.
- **Open risk**: dynamic external DUPR player SSO/token consent callback, verified partner permissions, webhook signatures and identity-scoped rated-match submission are not complete. Existing manual CSV export remains fallback.


## Latest operational development and regression evidence
- Tournival-specific hall announcement controls now use the existing `rallyHubHallAudio.js` service, supporting local unlock, mute/volume, manual editable templates and court call-ups; unavailable audio cannot prevent sporting progression. This is local hall audio and in-app event-state records, not customer email/WhatsApp integration.
- Added live schedule monitor `tournivalTiming.js` and `TournivalTimingMonitor.jsx`; court utilisation, remaining workload, projected finish and venue overrun warnings are advisory. Host chooses any rule/timing changes. 18 focused projection cases passed. Forecast is a work estimate rather than an operational SLA.
- Added event-level statistics projection `tournivalStatistics.js` and UI. Computes appearances, wins/losses, points for/against, partner/opponent history and podium from unique confirmed match IDs; duplicate read projections do not double-count. Rehearsal is excluded. Not yet integrated with the permanent player career-statistics store.
- Corrected knockout selection for non-power-of-two participant counts (e.g. 24 players), selecting the highest-qualified legal power-of-two bracket instead of producing an unresolvable 12-pair stage.
- Pressure engine test `scripts/tournivalPressureGate.mjs`: 24 simulated six-round schedules; 624 confirmed match commits, 624 duplicate retries and 624 conflicting-model writes rejected. These are pure in-memory model tests, **not simultaneous Base44 database transactions**.
- Regression gates after these additions: `npm run test:tournival-v1` passed; `npm run test:tournival-browser` 16/16 passed; `npm run test:kotc-readiness` 372 scenarios / 34,833 checks passed; `npm run test:interclub-reliability` 37/37 passed; `npm run build` passed; official DUPR adapter Deno tests 3/3 passed.
- The DUPR host review UI requests only `preview_tournival_uat`; it never calls a submission endpoint. The UAT partner auth URL/version was verified against the 17 Oct 2026 DUPR UAT OpenAPI document. Actual partner token authentication and scopes have not yet been exercised in a separately deployed sandbox.
- New ongoing release blockers: absence of atomic provider/DB transaction guarantees, full permitted player score editing, revocable delegated host token journey, verified DUPR SSO/UAT rights, provider payment-refund E2E, server-integrated automated browser tests and an isolated backend deployment environment. These are not silently marked PASSED.

## Feature-to-code summary
| Feature | Code | Status |
| --- | --- | --- |
| Qualification/knockout sporting rules | `src/lib/tournivalEngine.js` | IMPLEMENTED / unit TESTED |
| Duration estimator 2–6 / booking | `TournivalSetup.jsx` and engine | IMPLEMENTED / unit TESTED |
| Continuous-court queue | `src/lib/tournivalScheduler.js`; `TournivalLiveScoring.jsx` | IMPLEMENTED / browser simulated |
| Authoritative Tournival entity state | `base44/entities/TournivalSession.jsonc`; `legacyTournamentManager/entry.ts` | SOURCE IMPLEMENTED / remote consistency NOT VERIFIED |
| Public registration / payment checkout | `tournivalRegistration`; `paymentGatewayWebhook` | SOURCE IMPLEMENTED / mocked browser TESTED / provider E2E BLOCKED |
| Roster, check-in, withdrawal | `TournivalRegistrations.jsx`; manager backend | SOURCE IMPLEMENTED / remote E2E NOT RUN |
| Personal player link | `tournivalPlayerPortal`; `PublicTournivalPlayer.jsx` | SOURCE IMPLEMENTED / mocked browser TESTED |
| Public Live Hall | `tournivalPublicRead`; `PublicTournivalHall.jsx` | SOURCE IMPLEMENTED / mocked browser TESTED |
| Operational audio | `TournivalAnnouncements.jsx`; shared hall audio | SOURCE IMPLEMENTED / physical-device NOT RUN |
| Forecast/venue monitor | `src/lib/tournivalTiming.js` | IMPLEMENTED / unit TESTED |
| Spond import | Reused `SpondXlsxImportModal` | EXISTING REUSE / Tournival reconciliation NOT RUN |
| DUPR UAT eligibility/dry-run | `duprIntegration`, `tournivalMatchAdapter.ts`, `duprCsvExport` | SOURCE IMPLEMENTED / unit TESTED / UAT write BLOCKED |
| Print pack | `TournivalPrintPack.jsx` | IMPLEMENTED / manual print verification NOT RUN |
| Local rehearsal | `TournivalRehearsal.jsx` | IMPLEMENTED / full simulated browser PASS |
| Event statistics | `tournivalStatistics.js` | IMPLEMENTED / unit TESTED / career persistence NOT RUN |
| Real payment refunds and notifications | Existing gateway / Communications Centre | NOT FULLY WIRED |
| Delegated host / player-scored permissions | Existing TournamentUserAccess plus legacy manager | PARTIAL / E2E NOT RUN |
| Atomic concurrent writes/capacity | Base44 entity facade | BLOCKED / strict live safety gate |
