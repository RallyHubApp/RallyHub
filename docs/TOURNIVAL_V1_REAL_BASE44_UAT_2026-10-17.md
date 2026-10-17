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
