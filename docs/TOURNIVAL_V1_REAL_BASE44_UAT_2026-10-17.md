# Tournival V1 — real isolated Base44 UAT, 17 October 2026

## Environment boundary
- Dedicated backend-only app: **RallyHub Tournival V1 Isolated UAT**, app ID `6ad370b167bf643f4550da70`. This is **not** RallyHub production (`6a01dc00702b7dd2a2978c28`).
- Created using direct authenticated Base44 CLI, NOT the Base44 AI Builder. UAT visibility set to **private**. Minimal placeholder site deployed only for authenticated CLI access; no RallyHub production frontend or backend was deployed.
- Fifteen selected RallyHub entity schemas successfully pushed to UAT. Six Tournival backend functions successfully deployed: `legacyTournamentManager`, `tournivalRegistration`, `tournivalHostAccess`, `tournivalPlayerPortal`, `tournivalPublicRead`, `duprIntegration`.
- Deployment initially failed for two cross-function relative imports. Fixed by packaging dependencies inside their respective function folders. Source bundle parity is checked by `npm run test:tournival-bundles`.

## Persisted UAT evidence — provider-neutral / synthetic only
- Synthetic test tournament: `6ad371e4f550cb5c8e265b97`, tenant `tournival-uat-tenant-20261017`; event fee €0 so no card/checkout/payment was attempted.
- A real persisted, hashed registration link returned its correct event via the deployed `tournivalRegistration` endpoint.
- Eight sequential synthetic player registrations succeeded. A fresh entity read confirmed **8 registrations / 8 confirmed / 8 player IDs in Tournament roster** with `payment_status=not_required`.
- Authenticated `legacyTournamentManager.update_tournival` created the persisted TournivalSession revision 1.
- Delegated-host bearer link created and redeemed against the deployed `tournivalHostAccess` endpoint. Sequential host calls started then scored four actual stored qualification matches (two rounds, two courts), including four idempotent replay checks. Fresh session read: **4/4 completed, revision 9**.
- Real `tournivalPublicRead` returned correct revision 9 and two qualification rounds. Real `tournivalPlayerPortal` returned two personal fixtures with eight safe display-name mappings.

## CRITICAL — actual simultaneous host requests FAILED
- Against the deployed remote UAT function and persisted UAT session, **12 concurrent delegated-host saves from the same expected revision 9** produced **6 success responses**, 6 rejections.
- Authoritative TournivalSession revision advanced to only **10**. Several requests were acknowledged even though they overwrote each other.
- This proves Base44's current read-check-update entity pattern is **not atomic**. All host endpoints using this pattern must be considered release-blocked; the problem is not resolved by the successful SQLite reference gate, client mutex or post-write checking.
- Remediation requires a real server-authoritative serialisation/atomic compare-and-swap primitive, possibly a supported durable actor or separate transactional service integrated through the authorised Base44 pathway, followed by retesting the same concurrent remote calls. Do not claim production readiness until only one of twelve same-revision writes succeeds.

## DUPR UAT evidence / blocker
- Real remote UAT `duprIntegration.status` confirms the **separate UAT app** has NO `DUPR_CLIENT_ID`, `DUPR_CLIENT_KEY` or `DUPR_CLIENT_SECRET` secrets configured.
- `test_connection` properly failed with missing-configuration response; no network auth was attempted.
- Real UAT `preview_tournival_uat` correctly returned 0 eligible results, reason `event_not_opted_in`; no submission performed.
- Full DUPR partner token authentication, SSO/consented identity mapping, rated-match batch write and acknowledgement/webhook processing remain NOT TESTED. Do not copy production credentials into UAT without verified source/scope and owner approval.

## Remaining genuine release gates
- **Atomic backend concurrency**, including concurrent registration capacity and provider webhook duplicate/reordering.
- Paid registration / SumUp provider callback / refund / correct Communications Centre template tested only with explicitly provisioned non-live credentials and provider-approved sandbox methods.
- Full knockout/final persistence, permitted player score entry and stress / negative-permission tests on remote UAT endpoints.
- DUPR partner UAT credentials and actual approved API scope/endpoints; no production results submitted.
- Cross-device UI tests running against the remote UAT backend rather than browser mocks.

## Subsequent acceptance run — registration / payment boundaries
- Real isolated Base44 test event `6ad374ae2ae0b5d3a3982ea7`, capacity 4, sequential synthetic submissions. 4 confirmed, 2 waitlisted in correct positions [1,2], roster 4. Idempotent repeat returned identical registration ID. Same email with a different operation correctly returned 409. Missing consent returned 400; invalid token 404; revoked link 404. All verified through the deployed registration endpoint and fresh entity reads.
- **CRITICAL CAPACITY CONCURRENCY FAILURE:** separate synthetic event `6ad374d6da9d020cd2151008`, capacity 1, 12 parallel registration requests. ALL **12** returned confirmed and were persisted as confirmed; roster contained only **one** ID. This is genuine confirmed overbooking and roster lost-update behaviour. Strict release blocker; cannot be repaired by an in-memory test gate or client-side retry. Requires server-authoritative atomic capacity reservation and roster reconciliation/retest before production.
- Payment-unavailable negative test: independent €5.50 synthetic event `6ad374f75ca144c1c0be0070`, NO gateway credentials and no checkout. Registration and payment remained `pending_payment`, roster stayed empty, no PaymentRecord/charge created. This is a correct safe hold. Real SumUp checkout and verified webhook not tested.
- No production data or external financial transaction used. DUPR partner testing remains blocked by UAT credentials and allowed submission scope.

## FIX VERIFIED — atomic concurrent host state and registration capacity
- Identified a *supported and tested* Base44 entity primitive: `updateMany(query, {$set|$inc|$addToSet|$pull})`, with an atomic predicate. Direct isolated-UAT probe: 12 simultaneous compare-and-swap updates to the same `state_revision` → exactly 1 matched/updated.
- Patched BOTH authenticated `legacyTournamentManager.update_tournival` and delegated `tournivalHostAccess.save` to use `updateMany({id,tenant_id,state_revision:expectedRevision}, {$set:{...}})`; return 409 whenever `updated !== 1`. No successful response after a losing write.
- Patched `tournivalRegistration` with an atomic `Tournament.tournival_reserved_count` reservation: initialize counter from existing confirmed/pending registrations only when the new field is null; claim capacity with conditional `$inc` while count remains below event capacity. Schema extended with numeric reserved counter. Confirmed free registrations enter `player_ids` via atomic `$addToSet`, preventing roster lost updates.
- Patched authorised organiser withdrawal to conditionally transition registration to withdrawn and release one capacity unit with `$inc:-1` only for confirmed/pending-payment rows. Pre-event roster withdrawal uses atomic `$pull`. Existing matches are preserved.
- Patched verified-payment webhook's successful paid-player roster projection to use atomic `$addToSet`; **real SumUp callback transaction remains untested**.
- Successfully deployed revised isolated UAT `Tournament` entity and the three changed Tournival endpoints (host, manager, registration). Main RallyHub backend was NOT deployed.
- Remote UAT capacity retest, *new independent event*: 12 simultaneous submissions for capacity 1 → **exactly 1 confirmed, 11 waitlisted, roster 1, overbooked=false**. The initial counter-null edge was explicitly fixed after a first retest (all waitlisted).
- Remote UAT host retest: 12 simultaneous requests against the same revision 10 → **1 accepted, 11 rejected, persistent revision 11**.
- Remote UAT withdrawal regression: one confirmed participant withdrawn; counter 1→0, pre-event roster 1→0, duplicate withdrawal idempotent (no second capacity release).
- Source tests: Deno backend/domain suite 12/12 passed, Tournival sporting/scheduler/operations/timing/pressure/statistics gates passed, deployment bundle gate passed, application build passed.
- Remaining work: waitlist **positions and promotion** must be made race-consistent (simultaneous waitlisted responses can have the same reported position), capacity reconciliation after multi-entity partial failures, real paid SumUp callback idempotency/transaction verification, real player scoring and full multi-device UAT, DUPR UAT credential/SSO/submission. These are separate release gates, not covered by the two verified fixes.

## Continued development — waitlist FIFO, controlled promotion and partial-write recovery (source only)
- Introduced a new `Tournament.tournival_waitlist_sequence` counter. The registration endpoint allocates tickets by retrying Base44 atomic, conditional `updateMany` increments, using a preexisting ticket maximum as an initial seed. This prevents simultaneous requests receiving the same queue position; tickets are never recycled. The allocation is extracted into `tournivalRegistration/waitlistAllocation.ts` and has direct tests including 100 simultaneous contenders.
- New registrations which observed an existing waitlist are not permitted to jump the queue for a newly vacated place.
- Authenticated tournament manager now exposes `tournival_promote_waitlist`, selecting the lowest ticket and using an atomic capacity claim and registration-status CAS. Free-event only; disabled after the qualification draw exists or registration closes. Paid promotions are intentionally blocked pending verified checkout integration.
- Authenticated `tournival_capacity_audit` shows persisted active confirmations vs reservation counter and duplicate waitlist tickets. `tournival_reconcile_capacity` requires *closed registration* plus the operator-supplied expected count, and performs a conditional counter repair with audit. This is a controlled recovery pathway after interrupted multi-entity writes, not automatic transaction rollback.
- Source checks passed: waitlist allocator Deno 2/2 including concurrent model; sporting test suite; 8 transition/allocator Deno tests; Base44 function bundle gate; web application build.
- **Deployment boundary:** the Base44 CLI device login was no longer active in the new remote sandbox runtime. The above changes are **NOT yet deployed to isolated UAT** and are **NOT remotely acceptance tested**. No production changes were made.
- **Provider boundary:** previous UAT app has no DUPR credential secrets. Actual UAT partner-token/SSO/writes cannot yet run there; DUPR adapter dry-run remains the only validated route. Real SumUp callbacks cannot safely be tested without a configured non-live provider account plus a verified checkout (the UAT paid-registration hold was tested earlier).
- **Known remaining cases:** reconciliation of already-created registration with incomplete roster/link issuance, paid waitlist promotion and refunds, remote FIFO promotion race tests, backend payment webhook parallelism and full DUPR authorised flow.

## 17 October continuation — actual remote FIFO, recovery, SumUp-negative and DUPR boundaries
- Reauthenticated direct Base44 CLI, recreated *only the separate UAT project checkout* and successfully deployed the latest waitlist schema and `tournivalRegistration`/`legacyTournamentManager` functions into isolated UAT app `6ad370b167bf643f4550da70`.
- Real burst FIFO test against deployed isolated backend: accepted waitlisted registrations received **unique sequential tickets**. **FULL 12/12 burst acceptance FAILED**: several requests returned temporary failures. A temporary UAT-only diagnostic response revealed the underlying provider error **`Rate limit exceeded`**; the diagnostic disclosure was removed and the safe endpoint redeployed. Do NOT mark full burst availability passed.
- A bounded retry/backoff was added to `tournivalRegistration/waitlistAllocation.ts`, with direct entity `get(id)` for fresh ticket reads, still no duplicates observed remotely. Throttling can still interrupt registration *before* the record is persisted. Source now maps provider rate-limit errors to HTTP 429 with same-operation retry guidance instead of generic HTTP 500; deployed to isolated UAT. The endpoint should eventually expose Retry-After and robust partial-write reconciliation, rather than claiming uninterrupted burst success.
- Real promotion **PASSED** after throttling subsided: synthetic event `6ad38030d14bff734a4d4c7b` had five uniquely numbered waitlisted registrations; withdrawal succeeded, organiser promotion selected exactly ticket #1, final 1 confirmed / 4 waitlisted / roster 1 / reserved capacity 1, audit clean. Earlier attempts during throttling failed; they are not counted as success.
- Controlled real UAT partial-write recovery **PASSED**: on the same synthetic event, safely closed registration, injected **synthetic** wrong reserved count 3 (actual active 1), audit flagged it, rejected stale correction with HTTP 409, then allowed authorised count-CAS reconciliation to 1. Final audit clean. Only synthetic UAT data changed.
- Deployed existing `paymentGatewayWebhook` to isolated UAT. Negative test with an invented synthetic checkout/reference **PASSED**: webhook returned error without SumUp credentials, and PaymentRecord stayed pending, linked TournivalRegistration remained pending_payment, roster stayed empty. This is NOT a genuine SumUp-paid/failed/refunded callback test, and no external charge was performed.
- Real isolated DUPR UAT `status` again showed `DUPR_CLIENT_ID`, `DUPR_CLIENT_KEY`, `DUPR_CLIENT_SECRET` all absent. `test_connection` returned a safe configuration error. The real `preview_tournival_uat` endpoint returned `dry_run_only`, zero eligible matches (event not opted in), `submissionPerformed:false`. Full SSO, identity mapping, batch submission and webhook reconciliation are **not tested** and remain release-blocked.
- Deno waitlist allocator tests 2/2 PASS, Deno static checks PASS, Tournival pure regression gates PASS. **Remote full parallel FIFO throughput remains unresolved under Base44 service rate limits**; do not imply prod readiness.
