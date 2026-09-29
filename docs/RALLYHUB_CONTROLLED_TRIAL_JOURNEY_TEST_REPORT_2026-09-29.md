# RallyHub Controlled External Trial Journey — Build & Test Report

**Date:** 29 September 2026  
**Test depth:** Release Candidate / Deep, per `docs/RALLYHUB_MASTER_TESTING_BLUEPRINT.md`  
**Scope:** Controlled external club trial through application, approval, agreement acceptance, activation, onboarding/demo, King of the Court, Spond entitlement path, results and expiry. Commercial conversion/payment intentionally excluded.

## Hard guardrail

The development rule remained in force throughout this block:

> Do not refactor the existing tournament engines before the upcoming RallyHub Interclub.

No RallyHub Interclub product file and no KOTC sporting-engine library (`kotcV2Engine`, `kotcV2Domain`, `kotcV2Fairness`, `kotcV2Workflow`, `kotcV2Results`, `kotcV2Simulator`) was changed in this controlled-journey block.

## What is built

### Application
- Public `/trial/apply` route.
- Club/contact/role/email/mobile/membership/Spond/intended-use/requested-start capture.
- Explicit confirmation that the applicant is authorised to apply for the club.
- Application does not itself activate access.

### Super Admin approval
- `/app/trials` controlled administration screen.
- Super Admin can review submitted applications and approve the selected KOTC + Spond pilot scope.
- Approval creates/uses a dedicated tenant and club, sets entitlement enforcement, and generates an unguessable activation token while persisting only its hash.
- Activation deadline and selected capabilities are recorded.

### Trial & Evaluation Agreement
- Active versioned pilot agreement: `rallyhub_trial_evaluation`, version `0.1-pilot`.
- Explicit acceptance confirmations for authority, agreement terms, restricted sharing/confidentiality and RallyHub intellectual property.
- Acceptance evidence stores agreement ID/version/wording hash and confirmation evidence.
- Pilot agreement contains confidentiality, no-sharing, IP ownership/restrictions, security, data, feedback, duration/expiry, live-event continuity, suspension/termination, evaluation-service, liability, survival and Irish governing-law provisions.
- Legal wording remains marked for Irish commercial/IP solicitor review before broad public rollout.

### Activation and identity
- Trial starts on actual acceptance/activation rather than approval.
- Time-bound tenant entitlements are created.
- Trial user remains narrow at club level (`member` bundle) and gains KOTC/Spond capability through the entitlement layer, rather than receiving broad club-admin rights.
- Dedicated trial journey record tracks activation, expiry and onboarding progress.

### Restricted trial shell
- Trial users enter a dedicated `/app` trial shell before normal RallyHub club routes.
- Unrelated `/app` routes redirect to the trial portal.
- KOTC tournament control is the only authenticated module route exposed for this pilot.
- Desktop/mobile onboarding shows countdown, capabilities, checklist and quick-start guidance.

### Guided demo
- Creates a 16-player / 4-court / 4-round synthetic KOTC.
- Uses the existing server-recognised `RALLYHUB_KOTC_SANDBOX_V1` marker.
- Demo is excluded from aggregates/leaderboards and rejects real member records.
- Demo email fan-out is blocked.

### Real KOTC
- Trial portal can create a real KOTC inside the trial tenant/club.
- Existing KOTC sporting engine is reused; the only integration is at authorisation/tenant/entitlement boundaries.
- An active entitled trial host may create the KOTC session and receives session-host access bounded by entitlement expiry.
- Existing host, scoring, player-link, Live Event View and result workflows remain the sporting source of truth.

### Spond
- Spond remains a separate entitlement (`integration.spond`).
- Spond manager access for an external trial user requires the active Spond entitlement.
- Tournament import rejects another tenant/club.
- Trial onboarding only recognises Spond progress evidence scoped to that trial tenant and club.

### Results
- Existing KOTC results link/public result workflow is reused.
- Results management requires authenticated session-host access.
- Completed public result page and host post-event correction/share flow remain intact.
- Existing email preview/test/send safeguards remain in place; demo events cannot email real participants.

### Expiry
- Expiry blocks creation of new demo/live tournaments and new restricted work.
- Tenant/data/history are retained rather than deleted.
- Natural expiry reconciles journey and trial-application state.
- There is no automatic paid conversion or payment action in this pilot.
- A prepared-but-not-started event does not extend access.
- A genuinely live KOTC gets a bounded event-specific completion grace only after the first round has successfully started before entitlement expiry.
- Trial router and expiry screen now honour that same grace, preventing the UI from cutting off a live event while still blocking new work.

## Defects found and corrected during testing

1. **Expired live-event routing mismatch:** backend granted live-event completion grace but the trial router would have removed the KOTC route at trial expiry. Fixed by exposing `liveEventGraceActive` from authoritative journey state and allowing only that existing live tournament route during the bounded grace window.
2. **Natural expiry state reconciliation:** journey expiry did not also reconcile an activated trial application to `expired`. Fixed.
3. **Trial event-name accessibility:** real KOTC name input lacked an accessible label. Fixed with `aria-label="KOTC event name"`.
4. **Older KOTC browser harnesses lacked new shared Auth/Appearance context:** test harnesses were updated; no KOTC product logic was changed for those failures.
5. **Several stale KOTC browser assertions:** updated to current accessible/link presentation rather than obsolete raw text assumptions.

## Test evidence

### Controlled-trial architecture/security
- `trialJourneyArchitectureGate.mjs`: **80 checks PASS, 0 failures**.
- Covers application/approval separation, token hashing, legal evidence, narrow identity, explicit entitlements, KOTC/Spond server checks, tenant/club isolation, sandbox safety, expiry, live-event grace, route isolation and request economy.

### Controlled-trial browser journey
`e2e/trial-controlled-journey.spec.mjs`: **8/8 PASS**:
1. public application + authority + KOTC/Spond intent;
2. Super Admin approval + activation link;
3. explicit Trial & Evaluation Agreement confirmations;
4. narrow trial shell + `/app/admin` rejection;
5. guided demo then real KOTC creation;
6. mobile onboarding/no horizontal overflow;
7. expired trial/new-work lockout/no auto conversion;
8. live-event expiry grace allows the already-started KOTC to finish.

### KOTC preservation
- KOTC access/architecture gate: **136 checks PASS**.
- Integrated production simulator: **25,937 invariant checks, 0 failures**, 370 player/court combinations × 9 rounds plus workflow/transition scenarios.
- Delegated-host browser robot: **4/4 PASS** after test-context repair.
- Public/completed results robots: functional scenarios PASS, including live/public transitions, permanent final results, secure host management, local share, explicit email path and post-event correction.
- Completed Tournament Control Centre host-review route: PASS after stale harness/assertion repair.
- Strict full mobile KOTC journey remains functionally exercised by the broader robot suite; its hard millisecond thresholds showed variable sandbox latency after adding auth instrumentation (different runs tripped different unrelated acknowledgement metrics). This is recorded as a test-environment/performance limitation, not a deterministic functional regression. No sporting invariant or functional KOTC assertion failed in the new trial work.

### RallyHub Interclub preservation
- Club Challenge/RallyHub Interclub Gate 1 engine: **PASS**.
- Gate 3 final rehearsal: **PASS** — 32 players, 48 matches, fairness, concurrent scorers, stale/offline conflict, replacement, 4→3 court disruption, metrics, showcase, finalisation blockers and role security.
- Full browser robot: **5/5 PASS** on rerun — mobile host journey, public voting, Live Event View/disconnect/reconnect, completed player link and live recovery.
- No Interclub product files changed in this controlled-trial development block.

### Build/code health
- Production build: **PASS**.
- Targeted lint for controlled-trial and updated harness files: **PASS** after removing one unused icon import.
- Existing repository-wide lint/typecheck debt outside this block remains separate and was not treated as introduced by this work.

## Data safety

- Browser journeys used mocked/synthetic Ashbourne-style data.
- No real Ashbourne trial application/tenant was created by these tests.
- Query after testing: `RallyHubTrialApplication` contains **0 records**.
- Clare membership/live competition data was not used as disposable trial data.

## Remaining limitation before a real external pilot

**Real Spond provider acceptance has not been performed with Ashbourne credentials/account data.** The entitlement checks, tenant/club restrictions, Spond UI path and import ownership guards are tested, but a genuine Ashbourne Spond login/group/event import needs the club's authorised Spond connection and should be treated as provider/live acceptance, not simulated evidence.

Likewise, no commercial conversion/payment behaviour is included by design in this phase.

## Verdict

**PASS-WITH-LIMITATION — controlled journey is built and suitable for a controlled pilot once a real applicant/account and authorised Spond connection are supplied.**

Evidence state: coded → build-passed → simulator-tested → robot-tested for the controlled journey and affected functional regressions. Real external Spond/provider acceptance and real-device pilot remain to be completed before calling the external-club scenario production-proven.
