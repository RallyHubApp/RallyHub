# RallyHub Master Testing Group

**Control Pack version:** 1.0  
**Master Testing Blueprint:** v1.4  
**Effective:** 30 September 2026

## Purpose

The Master Testing Group is RallyHub's testing-governance model. It ensures ChatGPT, third-party testers, browser agents, security tools and human testers follow the same evidence standard rather than inventing a new process for each test run.

It is a set of mandatory roles and gates, not necessarily a committee of different people. One tester may perform several roles, but the final release decision must be based on the recorded evidence rather than the tester's confidence or memory.

## Roles

### 1. Protocol Guardian
- Confirms the current Master Testing Blueprint and Testing Control Pack versions.
- Rejects a test run that starts without a protocol declaration.
- Confirms the supplied Test Run Brief is being used.
- Records any deviation from the protocol.

### 2. Risk Gatekeeper
- Reviews the change before testing.
- Identifies blast radius and risk flags.
- Runs the machine-readable Risk Gate.
- Sets the minimum permitted depth: Q, S, D, RC or LIVE.
- May escalate depth; may not silently downgrade it.

### 3. Domain / Sporting Tester
- Tests sporting invariants, draw logic, scoring, timers, rounds, withdrawals, replacements and format-specific rules where applicable.
- Uses permutation/simulation coverage when the selected depth requires it.

### 4. Architecture / Security Tester
- Tests backend authority, tenant isolation, role/permission boundaries, public/private data contracts, tokens, idempotency and data integrity.
- Never accepts UI-only protection as proof.

### 5. Browser / UX Robot
- Tests human journeys on desktop and mobile.
- Behaves like a rushed organiser/player rather than a scripted demonstrator.
- Runs the full handover journey for meaningful user-facing workflows: discovery, instructions, setup, primary action, result interpretation, zero/error state, and mobile where relevant.
- Treats a workflow as not handover-ready if the user would be the first person to discover that it is unclear, incomplete or broken.
- Confirms the app actually rendered before recording a UI FAIL.
- Uses fresh browser contexts where cross-route contamination is possible.

### 6. Base44 / Resilience Tester
- Tests request economy, rate limiting, slow responses, 429s, lost responses, stale persistence and recovery where relevant.
- Distinguishes platform/test-environment failures from RallyHub product failures.

### 7. Evidence Recorder
- Records every required test case using the standard Evidence Report.
- Captures expected result, actual result, evidence, result state and defect reference.
- Records blocked tests rather than hiding or reclassifying them.
- Preserves progress in long population audits.

### 8. Release Gatekeeper
- Confirms required layers ran at or above the Risk Gate depth.
- Rejects release if P0/P1, security/tenant isolation, persistence or required evidence blocks remain.
- Proves the tested source is persisted in the current commit/checkpoint.
- After publish, proves production serves the intended release before using DEPLOYED/PRODUCTION-PROVEN.

## Mandatory third-party workflow

Every external or independent test run follows this order:

1. Load Master Testing Blueprint and Control Pack.
2. Make the protocol declaration.
3. Create/fill the Test Run Brief.
4. Run the Risk Gate and record the minimum required depth.
5. Identify exact target commit/checkpoint/build and environment.
6. Protect production data and prepare approved test data/sandbox.
7. Execute the required layers and cases, including the end-to-end handover journey for meaningful user-facing workflows.
8. Record results in the Evidence Report as PASS, PASS-WITH-LIMITATION, FAIL or BLOCKED.
9. Continue independent tests after individual failures where safe; do not stop a population audit merely because one item failed.
10. Fix meaningful defects and add permanent regressions where practical.
11. Rerun defect reproductions plus surrounding regression.
12. Prove tested edits are persisted.
13. Run the Release Gate.
14. Publish only an approved release candidate.
15. Fingerprint production after publish.
16. Record the final release state.

## Independence rule

A third-party tester is free to add extra tests, tools or attack scenarios. They are **not** free to omit mandatory RallyHub gates without recording a deviation. Extra evidence can increase confidence; it cannot replace required evidence unless the Master Testing Blueprint explicitly permits an equivalent method.

## Minimum handover from a third party

A third-party result is not accepted without:
- protocol versions;
- run ID;
- tester/tool identity;
- target build/commit/checkpoint;
- selected depth and Risk Gate output;
- blast radius;
- environment and test data;
- test-case results with evidence;
- defects and blocked tests;
- persistence proof where release readiness is claimed;
- final verdict and limitations;
- production fingerprint if deployment is claimed.

## Non-negotiable rule

> No third-party test result is accepted as RallyHub release evidence unless it declares the Master Testing Blueprint version followed, uses the RallyHub Test Run Brief and Evidence Report, and passes the applicable Risk/Release Gates.

## Standard invocation

When handing RallyHub to another tester or AI, use:

> Test this RallyHub change under the current RallyHub Master Testing Blueprint and Testing Control Pack. Load the protocol first, complete the Test Run Brief, run the Risk Gate to determine minimum depth, execute all mandatory layers, and return the standard Evidence Report. Do not call the change ready to publish unless persistence and release-gate requirements are proven.
