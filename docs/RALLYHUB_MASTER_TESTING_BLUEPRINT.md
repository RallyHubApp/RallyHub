# RallyHub Master Testing Blueprint

> **Development mirror only.** The canonical master is `RallyHub_Master_Testing_Blueprint.docx` kept in the RallyHub project files beside `RallyHub_Master_Backlog_and_Decisions.docx`. Keep this repo copy aligned when major reusable testing rules change, but do not treat it as the user-facing master.

**Status:** Development mirror of LIVE MASTER  
**Version:** 1.4  
**Date:** 30 September 2026  
**Applies to:** RallyHub Core, King of the Court (KOTC), Club Challenge, Tournival, shared tournament formats, memberships, public displays, and future RallyHub modules.

## 1. Purpose

This document is the single source of truth for how RallyHub is tested. It consolidates the earlier **Testing approach summary**, the historical pre-deployment plan, KOTC hall failures and fixes, Club Challenge testing, Base44 rate-limit lessons, code-health cleanup rules, security/isolation requirements, browser robots, and the September 2026 collaborative-scoring stress work.

The aim is not merely to prove that a feature works once. The aim is to **actively try to break RallyHub before a real organiser, player or club can do so**.

The permanent standard is:

> **Simulate heavily, challenge assumptions, protect production data, deploy sparingly, and turn every meaningful defect into a permanent regression test.**

RallyHub is never called “ready” merely because code was written, a build passed, or one happy-path test succeeded.

---

## 2. Permanent testing principles

1. **The robot is a critic, not a demonstrator.** It should behave like a rushed person in a noisy sports hall, including wrong taps, double taps, rapid key presses, scrolling, refreshing, backgrounding, switching devices, and acting on stale screens.
2. **The backend is authoritative.** The UI may be stale. Permissions, sporting rules, score ownership, revisions and security must be enforced server-side.
3. **No clean live data is disposable test data.** Production membership records, proven live sessions and real completed competitions are protected from mutation.
4. **Every competition format has an isolated test world.** KOTC, Club Challenge and Tournival each require a dedicated sandbox/test harness, dummy data and robot coverage.
5. **No defect is fixed only once.** Once a bug is understood, its exact failure mode becomes a permanent automated regression wherever practical.
6. **No repeated redeploy loops.** Batch changes, test locally/robotically, create one release candidate, then deploy once.
7. **Shared changes trigger shared regressions.** If a shared timer, score component, permission helper, Base44 function, public route or UI primitive changes, every affected module is retested.
8. **Commercial-grade testing is adversarial.** Inject slow responses, 429s, lost responses, stale revisions, simultaneous actions and incorrect user behaviour.
9. **Testing depth is explicit.** Quick, Standard, Deep and Release-Candidate testing are different evidence levels.
10. **UX is part of correctness.** If something works technically but is slow, misleading, scroll-heavy or awkward in a hall, testing should flag it.
11. **Testing must be proportional to risk.** A spelling change does not require a full deep dive; a scoring/concurrency or architecture change does.
12. **Preserve previously proven functionality.** Improving one area must not undo good work elsewhere.
13. **Test infrastructure is evidence infrastructure.** A broken browser install, stale Vite server, bad mock, missing Linux library or sandbox timeout is a test-environment failure, not evidence that RallyHub failed. Prove the application actually rendered before classifying a UI defect.
14. **A sandbox pass is not a persisted release.** Before calling a change release-ready, prove the exact tested edits exist in the persisted source/commit and release checkpoint.
15. **A republish is not assumed live.** After deployment, fingerprint the production assets or equivalent live markers and prove the intended release is what the public domain is actually serving.
16. **The user is never the first integration tester.** Before handing back any meaningful workflow, run the complete journey as the intended user would: find the feature, understand what to do, complete setup, perform the primary action, interpret success/failure, and repeat on mobile where relevant. A technically correct feature that is undiscoverable, unclear, misleading, or only proven by build/static checks is not ready for handover.

---

## 3. Test-depth levels

### Level Q — Quick Check
Use for small, low-risk changes such as spelling, wording, isolated spacing, minor layout, or a simple display-only adjustment.

Minimum evidence:
- targeted source/static check;
- affected build/lint/typecheck if relevant;
- one focused browser check if interaction changed.

A Quick Check does **not** prove full module safety.

Typical examples:
- typo;
- button label wording;
- non-critical colour/spacing;
- a display-only text block.

Escalate immediately if the apparently simple button triggers a score, payment, email, permission, timer, round progression or production-data write.

### Level S — Standard Module Test
Use for ordinary functional repairs contained inside one module.

Minimum:
- production build;
- lint;
- typecheck;
- targeted domain/sporting test if applicable;
- targeted architecture/security check if applicable;
- desktop browser robot;
- mobile browser robot where user interaction changed;
- relevant shared-component regression;
- no unresolved P0/P1 defect.

Typical examples:
- a contained button/function repair;
- form validation;
- isolated workflow repair;
- one module-specific backend function with no concurrency/shared-data impact.

### Level D — Deep / Adversarial Test
Use when a change touches high-risk behaviour.

Normally required for:
- scoring;
- locks/concurrency;
- multiple devices;
- sporting-engine logic;
- round generation/progression;
- timers;
- replacements/withdrawals;
- permissions;
- tenant isolation;
- public links/tokens;
- offline/reconnect;
- membership integration;
- bulk writes;
- Base44 request patterns;
- persistence/reopen;
- any behaviour that previously failed in a live hall.

Includes Level S plus:
- broad permutation simulation;
- multi-device robot personas;
- same-resource race conditions;
- stale-screen tests;
- injected Base44 429s;
- slow-response tests;
- double-tap protection;
- lost-response-after-commit reconciliation;
- offline/reconnect where applicable;
- wrong-role/wrong-tenant pressure;
- request-count review;
- code-health/stale-code inspection;
- spelling/typography/busy-hall UX review.

### Level RC — Release Candidate
Use before a meaningful production deployment or at the end of a development block.

Always appropriate when:
- several related code changes have accumulated;
- a development phase is nearing completion;
- a KOTC, Club Challenge or Tournival milestone is about to be signed off;
- shared architecture changed;
- security/data integrity changed;
- the user asks “are we ready to deploy?” after meaningful development.

Includes all required module gates plus:
- full affected shared/core regressions;
- sandbox safety verification;
- complete browser suite for affected module(s);
- architecture/security gate;
- sporting scale simulations;
- persistent state/reopen tests;
- no unresolved P0/P1 defects;
- final code-health checks;
- release checkpoint / rollback point;
- explicit deploy verdict.

### Level L — Live Hall / Device Acceptance
Only after technical gates are green.

Use real phones/tablets/laptops, real browser focus/background behaviour, real sound/speaker conditions, real QR links, real hall pressure and real network conditions.

A successful Level L test moves a scenario from **deployed** to **production-proven for that scenario**.

---

## 4. Permanent technical layers from the Testing Approach Summary

The earlier Testing approach summary established four permanent technical layers. They remain the backbone of Deep and Release-Candidate testing.

### Layer 1 — Sporting-engine simulation

Hammer the competition logic independently of the UI.

Where the format allows it, simulate broad combinations. KOTC currently uses a scale envelope of **4–40 players and 1–10 courts**; other modules should define their own valid range rather than only testing one canonical draw.

Test:
- court allocation;
- player movement;
- benches/rests;
- partner rotation;
- opponent repeats;
- locked/fixed pairs;
- ties and tiebreaks;
- scoring modes;
- win-by-1 / win-by-2;
- timed-game ties;
- withdrawals;
- injuries;
- late arrivals;
- early departures;
- replacements;
- no-shows;
- continue-short scenarios;
- court loss / court-count change;
- timing changes;
- round progression;
- finalisation blockers;
- leaderboard/aggregate calculations;
- deterministic seed behaviour;
- fairness across repeated rounds.

Deep tests should run thousands of invariant checks, not one draw that happens to look correct.

### Layer 2 — Architecture, security and data integrity

Test RallyHub as a commercial multi-tenant product.

Verify:
- tenant isolation;
- club isolation;
- wrong-tenant rejection;
- member vs guest eligibility;
- Admin / Super Admin / Event Manager / Event Host / Scorer / Display / delegated-host permissions;
- start/end validity of grants;
- expired/future grants;
- entitlement scope inheritance: tenant, club and one-event restrictions must survive capability dependencies rather than becoming broader access;
- missing/wrong club context rejection and missing/wrong event-id rejection for scoped entitlements;
- suspended/revoked grants must never regain access through dependency expansion or live-event grace;
- entity RLS;
- backend authorisation;
- optimistic revisions;
- idempotency;
- scorer leases/locks;
- public token scope/expiry;
- public read-only behaviour;
- junior privacy/name masking;
- contact-data stripping;
- audit history;
- correction history;
- cross-module and cross-tenant mutation attempts.

The UI is never a sufficient security boundary.

### Layer 3 — Human-style UI robot

The browser robot must behave like a person, not like a test script designed to pass.

Use:
- real clicks;
- real keyboard entry;
- Tab/Enter where relevant;
- scrolling;
- wrong taps;
- repeated taps;
- delayed taps;
- rapid scoring;
- browser back/forward;
- refresh;
- focus/visibility changes;
- desktop viewport;
- mobile viewport;
- long pages;
- controls at viewport boundaries;
- stale screens;
- reopen after backgrounding;
- bfcache restoration;
- retry after errors.

Run desktop first for diagnosis, then mobile. Mobile is a separate risk surface, not simply a smaller desktop.

Before recording a browser failure, first prove the application shell actually rendered. A navigation timeout, intercepted source module, missing browser binary, stale dev server or test-login mock failure is **BLOCKED / test-infrastructure evidence**, not an application FAIL.

### Layer 4 — Real-world hall/device test

Only after Layers 1–3 are green.

Test:
- real device performance;
- phone sleep/background;
- speaker/Bluetooth audio;
- sound check;
- wake lock;
- timer visibility at hall distance;
- real QR opening;
- multiple scorer phones;
- host phone/laptop workflow;
- network variability;
- real organiser pace;
- whether controls are where the host naturally expects them.

Every hall-discovered defect should be reproduced in automation before it is considered permanently fixed.

---

## 5. Sandbox and test isolation — mandatory

### 5.1 Dedicated sandbox per competition format

KOTC, Club Challenge and Tournival must each have their own isolated sandbox/test harness. Future competition formats inherit the same rule.

A module sandbox should include:
- dedicated dummy participants;
- dummy guests where useful;
- test-only event/session records;
- obvious TEST MODE labelling;
- server-side sandbox marker;
- exclusion from production aggregates/statistics;
- blocked real-member imports where practical;
- blocked production communication fan-out unless an explicit test recipient is used;
- no mutation of clean membership records;
- no mutation of real completed competition history.

### 5.2 Server-side guards, not UI promises

Sandbox safety must be enforced in backend functions.

Examples:
- reject real Player/member IDs in sandbox creation;
- use dummy Event Participants rather than real Player records;
- require `demo_mode` / sandbox marker;
- require `exclude_from_aggregates` where applicable;
- restrict sandbox tools to authorised test users/admins;
- hide/block member or Spond imports in sandbox;
- prevent production email fan-out;
- prevent sandbox results entering real rankings/analytics.

### 5.3 Protect proven modules while testing another

Testing Tournival must not risk KOTC or Club Challenge. Testing Club Challenge must not mutate KOTC. Shared-code regressions may span formats, but test data remains isolated.

### 5.4 Protect membership as a clean source of truth

The membership database is not disposable test data. Synthetic fixtures or minimum safe copies are used instead of bulk-editing production membership records.

### 5.5 Second-tenant commercial isolation

Retain a controlled second test tenant. Isolation tests must prove both:
- authorised access to the test tenant works;
- cross-tenant reads/writes to another club fail.

---

## 6. Base44 resilience and request economy

Base44 behaviour is a permanent test dimension because live failures showed that logically correct workflows can still fail under request bursts and provider rate limits.

### 6.1 Request-economy rules

Prefer:
- one authoritative backend command per meaningful user action;
- bulk/server-side operations over browser fan-out;
- deliberate manual refresh where realtime is not needed;
- lightweight state endpoints for small refreshes;
- bounded polling only where the user genuinely benefits.

Avoid:
- many browser entity updates for one action;
- unnecessary full-state polling;
- duplicate reads after every write;
- focus polling with little user value;
- retry loops in both browser and backend;
- browser-side mass delete/recreate;
- hidden polling competing with live scoring/timer traffic.

### 6.2 Rate-limit stress

Inject 429s into critical actions such as:
- claim/lock;
- score save;
- round start;
- timer mutation;
- round preparation;
- public state fetch;
- bulk setup action.

Verify:
- retries are bounded;
- backoff is controlled;
- no duplicate sporting mutation;
- entered values remain after true failure;
- a committed result is reconciled when the response is lost;
- the UI does not show “failed” when the backend actually committed without immediately reconciling.

### 6.3 Slow-provider pressure

Simulate 1–3 second backend confirmations on hall-critical actions. The UI should acknowledge the tap immediately, lock against duplicate taps and show a clear pending state.

### 6.4 Measure calls

Deep tests should report call counts by function, including:
- full state reads;
- lightweight reads;
- score calls;
- lock/claim calls;
- timer calls;
- prepare/advance calls;
- retries;
- idle/background calls.

Unexpected call-count growth is a regression even if the workflow still works.

### 6.5 Ephemeral Base44 test-environment discipline

Treat the Base44 command/browser sandbox as ephemeral infrastructure. A fresh sandbox may:
- start in a different working directory;
- lack the previously installed Playwright/Chromium binary;
- lack Linux runtime libraries;
- contain a stale Vite process or no useful local server;
- reject a fresh port;
- time out while transforming a large development bundle;
- lose temporary test scripts created only under `/tmp`.

Permanent rules:
- keep reusable test harnesses and smoke scripts in the RallyHub repository, not only in temporary sandbox files;
- bootstrap by checking what is already installed before downloading Chromium or packages again;
- prefer one Chromium process with isolated browser contexts over repeatedly launching browsers;
- split long suites into small batches that save/report progress so a timeout does not erase completed evidence;
- when Vite/dev-server transform cost is the bottleneck, prefer testing the already-built production bundle;
- distinguish **test environment BLOCKED** from **product FAIL** and report the distinction explicitly;
- do not spend repeated cycles rebuilding test infrastructure when a faster deterministic gate can answer the immediate question.

---

## 7. Concurrency and stale-state testing

Any workflow usable by more than one person/device is treated as a concurrency problem.

Test personas may include:
- primary host;
- helper/scorer A;
- helper/scorer B;
- additional scorers;
- public display;
- wrong-role user;
- wrong-tenant user.

Permanent race scenarios:
- two people act on the same court/resource simultaneously;
- people act on different courts in parallel;
- same-millisecond first input;
- user A saves while user B has stale state;
- host opens correction while helper opens correction;
- lock expires while an editor stays open;
- cancel releases lock;
- save releases lock;
- stale screen tries to edit a saved result;
- next round begins while old scorer page remains open;
- stale revision tries to overwrite a newer revision;
- response is lost after commit;
- rapid double tap on Save/Start/Advance.

Where the data store does not clearly provide compare-and-swap, claims should be verified after write before ownership is treated as confirmed.

---

## 8. Reusable distributed-scoring lock blueprint

Learned from KOTC and reusable elsewhere:

1. **First meaningful score-entry action wins.**
2. The first attempted digit/edit claims the court/resource.
3. The digit is only accepted locally after backend confirmation of ownership.
4. A competing host/helper cannot type into the claimed resource.
5. A saved score cannot be reopened as a new unsaved score.
6. Saving releases the entry lock immediately.
7. Correction is a separate first-claim-wins lock.
8. The original helper may have a short correction privilege where product rules require it. KOTC currently uses **90 seconds or until Prepare Next Round, whichever comes first**.
9. Host correction remains available through an explicit correction workflow.
10. A stale page refreshes to authoritative state instead of accepting a competing value.
11. The server enforces every rule independently of the UI.

This pattern should be assessed for Club Challenge and Tournival wherever distributed/player-assisted scoring is introduced.

---

## 9. Polling, refresh and stale-code rules

Polling is not automatically good UX.

Before adding polling ask:
- Does the host need the update automatically?
- How often can the data meaningfully change?
- Will polling compete with scoring/timer writes?
- Would a deliberate Refresh button be clearer and safer?
- Is true server push worth the added complexity?

KOTC learning: manual **Refresh Player Scores** was preferable to host background polling.

If polling is used:
- keep payloads lean;
- stop when state is terminal or screen is no longer relevant;
- avoid duplicate pollers;
- avoid focus polling unless needed;
- prove idle request rate in robot reports.

Stale-code rules:
- remove superseded code only when replacement and coverage are proven;
- do not delete backend functions merely because browser imports are absent;
- remove obsolete branches that contradict current architecture;
- search for old wording, routes, lock semantics and duplicate components after major refactors;
- treat stale tests as defects when they assert retired behaviour.

---

## 10. Code health, spelling, typography and UI quality

### 10.1 Build health

For Standard, Deep and RC testing run:
- production build;
- lint;
- full typecheck;
- route integrity where navigation changed.

### 10.2 Dead/superseded code review

After substantial development inspect for:
- legacy components;
- unreachable routes;
- duplicate sporting engines;
- obsolete troubleshooting tests;
- retired semantics;
- stale UI branches.

Preserve uncertain auth/backend/external entry points until separately proven dead.

### 10.3 Spelling and terminology

Review:
- spelling;
- format names, especially **King of the Court (KOTC), Club Challenge and Tournival**;
- button wording;
- success vs failure wording;
- terminology consistency;
- capitalisation;
- score notation;
- punctuation;
- dates/times;
- mobile truncation;
- accidental developer/test text.

A successful lock must not be described as a failure. A backend success must not produce a misleading red “try again” state.

### 10.4 Busy-hall UX

Ask:
- Is the primary action visible without unnecessary scrolling?
- Is the next action obvious?
- Can the host recover after a mistake?
- Does a button move/disappear unexpectedly?
- Can the host tell whether RallyHub accepted a tap?
- Are entered scores preserved after failure?
- Are touch targets large enough?
- Can the host operate one-handed?
- Is Hall Display readable at distance?
- Is an action located where the host is already working?

---

## 11. Persistence, refresh, sleep and recovery

Stateful modules should be tested for:
- hard refresh;
- soft refresh;
- reopen from Tournament Control Centre;
- browser back/forward;
- background/foreground;
- phone sleep/wake;
- network interruption;
- lost response after successful commit;
- retry after genuine failure;
- stale revision after another device changed state;
- completed-session reopen;
- archived/read-only state.

Critical sporting results and timer state must be authoritative and persistent; local state may assist UX but must not be the only copy.

---

## 12. Timer, audio and Hall Display

Where applicable test:
- pre-start sound check;
- browser audio unlock from real user gesture;
- device-default voice fallback;
- physical device volume;
- 60 / 30 / 10 second warnings;
- 5 → 1 countdown;
- round-finished announcement;
- pause/resume;
- +1 minute;
- changed duration;
- wake lock;
- full-screen timer;
- timer centring/size;
- sleep/foreground recovery;
- authoritative persisted timer;
- public Hall Display read-only behaviour;
- disconnect warning with last-known state retained;
- privacy/name masking.

Do not over-engineer unreliable voice selection. Device default is preferable to a misleading selector.

---

## 13. Module robot strategy

### King of the Court (KOTC)
Maintain:
- domain/sporting gates;
- fairness simulation;
- persistent-pair simulation;
- 4–40 player / 1–10 court scale simulation;
- access/architecture gate;
- desktop host journey;
- mobile host journey;
- hall-pressure simulator;
- player scorer robot;
- host + multiple scorer concurrency robot;
- public live/results robot;
- completed-route robot;
- Hall Display robot;
- sandbox robot;
- setup/seeding robot.

### Club Challenge
Maintain/mirror:
- canonical sporting/fairness suite;
- interaction robot;
- full browser host journey;
- multi-scorer concurrency where distributed scoring is used;
- public Hall Display/disconnect robot;
- POT/public voting robot;
- timer/audio/wake-lock tests;
- replacement/withdrawal/late-arrival/court-loss scenarios;
- full TEST MODE populated journey;
- role/tenant/security gates;
- sandbox safety tests.

KOTC lessons around request economy, first-claim locks, stale screens, command acknowledgement, sound, wake lock and duplicate-submit protection must be reviewed before Club Challenge is declared hall-ready.

### Tournival
Before commercial-grade sign-off, create/mirror:
- dedicated Tournival sandbox;
- synthetic roster generator;
- sporting-engine permutation simulator;
- group-stage fairness/coverage checks;
- knockout seeding/bracket checks;
- score-format validation;
- group → knockout → final lifecycle robot;
- invalid/tied score tests;
- multi-device scoring tests where supported;
- public-view/public-registration robot;
- refresh/reopen persistence;
- role/tenant/security tests;
- rate-limit pressure and request-count reporting;
- fully populated TEST MODE journey through final results.

No Tournival deep test uses real membership or a live KOTC/Club Challenge competition as convenient test data.

---

## 14. Defect-to-regression rule

Every meaningful defect follows this loop:

1. reproduce it;
2. classify it: UI, backend, sporting logic, architecture, Base44/provider, stale state, security or UX;
3. create the smallest deterministic automated reproduction practical;
4. fix the product;
5. prove the regression test catches the defect where practical;
6. prove it passes after the fix;
7. run surrounding regression;
8. add the scenario permanently to the module suite/blueprint when reusable;
9. update release evidence/checkpoint.

Examples already promoted into permanent regressions:
- roster refresh loop;
- rate-limit blocked start;
- committed action reported as failure;
- full-screen timer size/centring;
- controls below viewport;
- scorer collision locks;
- stale host attempting to overwrite a helper’s saved result;
- same-millisecond host/helper first-input race;
- simultaneous correction race;
- 90-second helper correction expiry;
- helper correction cut off by Prepare Next Round;
- double-tap save protection;
- four scorer phones recovering from injected 429s;
- unnecessary background host polling.

---

## 15. Release-state vocabulary

Use these terms precisely:

- **Coded** — source changed.
- **Build-passed** — stated build/lint/typecheck passed.
- **Simulator-tested** — sporting/static gates passed.
- **Robot-tested** — browser automation passed stated scenarios.
- **Release-candidate** — required simulator/browser/security gates are green and rollback checkpoint exists.
- **Deployed** — candidate is live in Base44 production.
- **Live-device tested** — a named real device/browser scenario was exercised.
- **Production-proven** — the stated scenario worked in the real environment/event.

Never collapse these into “done”.

---

## 16. Release/deployment discipline

For meaningful changes:

1. protect a known-good checkpoint before risky work;
2. make changes in a batch;
3. select the test depth from risk;
4. run the selected gates;
5. fix release-blocking defects;
6. rerun failed and surrounding tests;
7. run shared regressions if shared code changed;
8. inspect Base44 request counts/polling;
9. create the release-candidate checkpoint;
10. report exact evidence and remaining limitations;
11. verify the tested changes exist in persisted source / the current commit, then create the release checkpoint;
12. request **one** deployment;
13. after publish, perform a production fingerprint check (asset hash, release marker, or equivalent) to prove the intended candidate is actually live;
14. run planned live-device/hall acceptance;
15. convert any live defect into automation before calling it permanently fixed.

The user should not be used as the primary integration tester for defects the robot could have found first.

### Development-block stop-and-test rule

During exploratory/product-build sessions it is acceptable to keep brainstorming and adding closely related features for a short development block. However, before handing that block back for user testing, or once several connected changes have accumulated, ChatGPT must explicitly stop feature work and run the appropriate RallyHub test gates against everything changed in that block. The handoff must state what was built, what was tested, what passed, what was fixed during testing, what remains unproven, and the exact evidence state. Build/lint alone is never the handoff standard for a meaningful block.

For payment, membership, guest/member booking, messaging, permissions, tenant isolation, competition logic, timers, public links or other production-sensitive workflows, this stop-and-test checkpoint is mandatory before asking the user to try it on a live device.

---

## 17. Mandatory RallyHub Testing Operating Prompt

Use the following prompt whenever ChatGPT is asked to test, validate, stress-test, prepare for deployment, or decide whether RallyHub is ready. This prompt is part of the blueprint so testing does not depend on remembering an old conversation.

> **RALLYHUB TESTING OPERATING PROMPT**
>
> You are testing RallyHub as a commercial-grade sports competition and club-management product. Use `docs/RALLYHUB_MASTER_TESTING_BLUEPRINT.md` as the canonical testing standard.
>
> **1. Select the correct test depth first:** Quick, Standard, Deep, Release Candidate, or Live Hall/Device. Base this on risk, not merely code size. Do not run a full deep dive for a trivial spelling or isolated display fix. Escalate for scoring, concurrency, sporting logic, timers, permissions, tenant isolation, public tokens, membership integration, bulk writes, persistence, Base44 request-pattern changes, shared architecture, end-of-phase development, or anything that could corrupt sporting results or production data.
>
> **2. Identify the blast radius.** Determine which competition formats and shared services are affected. RallyHub currently includes **King of the Court (KOTC), Club Challenge and Tournival**. If shared code changed, regress every affected format even if that format’s own source file was untouched.
>
> **3. Protect production data before testing.** Never use the clean membership database, a real completed competition, or a proven live session as disposable test data. Use the dedicated module sandbox, dummy participants and server-side test guards. If a module does not yet have a safe sandbox/robot harness, strengthen isolation before high-volume or destructive testing.
>
> **4. For Deep/RC testing, work through the permanent layers:**
> - sporting-engine/permutation simulation;
> - architecture/security/tenant/role/data-integrity testing;
> - human-style desktop then mobile browser robots;
> - Base44 resilience/request-economy pressure;
> - concurrency/stale-state/multi-device races where applicable;
> - persistence/refresh/reopen/sleep/offline recovery where applicable;
> - code-health/stale-code/spelling/typography/busy-hall UX review;
> - only then Live Hall/Device acceptance.
>
> **5. Actively try to break the feature.** Use wrong taps, rapid double taps, first-keypress races, simultaneous devices, stale screens, revision conflicts, lock expiry, cancel/reclaim, lost responses after commit, injected 429s, slow backend responses, refresh/reopen, background/foreground and next-state transitions. Measure Base44 calls and challenge unnecessary polling or browser fan-out.
>
> **6. Never accept UI-only protection** for sporting, permission, security or concurrency rules. Verify the authoritative backend independently enforces the rule.
>
> **7. Every meaningful defect becomes a permanent regression test** wherever practical. After a fix, rerun the defect reproduction plus surrounding regression; do not merely rerun the happy path.
>
> **8. Preserve previously proven functionality.** Do not improve one module by breaking another. Do not mutate real data to make testing convenient.
>
> **9. Do not repeatedly ask the user to redeploy.** Batch fixes, complete the selected pre-deploy gates, then create one release candidate and one rollback checkpoint. Recommend deployment only after the appropriate gates are green.
>
> **10. Never say “ready to deploy” because build/lint/typecheck alone passed.** For meaningful work, require the blueprint’s relevant sporting, architecture/security and browser gates.
>
> **10A. Prove persistence before publish.** The exact tested changes must be present in persisted source / the current commit and captured in the release checkpoint. A test that passed only against an ephemeral sandbox state is not release evidence.
>
> **10B. Prove the publish.** After republish, fingerprint production (asset hashes, release marker or equivalent). Do not assume the custom domain is on the intended release merely because a publish action completed.
>
> **11. Challenge the UX from the viewpoint of a rushed organiser in a noisy hall.** If the workflow is technically correct but unnecessarily slow, scroll-heavy, misleading or likely to cause duplicate actions, record it as a defect/product-improvement finding.
>
> **11A. Run the handover journey before giving the feature back to the user.** For every meaningful workflow, prove that an intended user can find it, understand the first step without prior developer knowledge, complete any required setup, perform the primary action, see a clear success/failure state, understand what the result means, and recover from the common zero/error state. Test desktop and mobile when the feature is used on both. The user must not become the first person to discover that the workflow is unclear, incomplete or broken.
>
> **12. At the end, report the exact evidence and state:** coded, build-passed, simulator-tested, robot-tested, release-candidate, deployed, live-device tested, or production-proven. If not ready, identify and fix/test the blocker rather than making the user the integration tester.
>
> **13. Use the RallyHub Testing Control Pack for independent/third-party testing.** Before any external tester, AI agent, browser service, security tool or separately tasked testing process begins, require the current protocol declaration, Test Run Brief and Risk Gate. Accept the result as RallyHub release evidence only when it is returned in the standard Evidence Report and passes the applicable persistence/release checks.

---

## 18. Fast QA ladder and reusable test-harness rules

Use the lightest reliable gate first, then escalate only when risk or evidence requires it.

### Tier A — Structural / no-browser gate
Run in seconds where possible:
- production build;
- targeted source/static assertions;
- shared-layout width/overflow/breakpoint checks;
- route/config presence checks;
- backend/function bundle or syntax checks;
- privacy/public-contract scans where applicable.

This is the default first line for shared CSS/layout, simple wiring and release-persistence checks. It is not a substitute for interaction testing when user behaviour changed.

### Tier B — Targeted browser smoke
Use one browser process, fresh context per route/journey, and a small representative set of high-value routes. For shared authenticated-shell/mobile changes, include at minimum:
- Super Admin;
- Membership / Member Admin;
- Events;
- Tournament / KOTC;
- Interclub / Club Challenge;
- Players / Waiting List / Guest Bookings / Learn where the shared shell applies.

Rules:
- use phone width and desktop where relevant;
- verify the app shell/header loaded before measuring layout;
- test mobile-menu open/close and critical navigation presence;
- assert no horizontal page overflow;
- avoid cross-route contamination by using fresh browser contexts;
- prefer the built production bundle when the dev server is the bottleneck.

### Tier C — Full Deep / Release-Candidate suite
Run the full domain/security/browser/concurrency/resilience suite only when the selected risk level requires it. Do not launch the longest suite by reflex for every CSS or wording repair.

### Handover journey gate
For any meaningful user-facing workflow, browser testing must cover the whole handover journey rather than only the final button or API response:
- locate the feature from the normal navigation or entry point;
- confirm the page explains what it is for and what the user should do first;
- verify required setup/state is visible and understandable;
- complete the primary action with realistic test data;
- verify success, zero-result and common failure states are explicit rather than silent;
- verify the resulting records/totals/state, not merely that a request returned 200;
- repeat at phone width where the workflow is expected to be used on mobile;
- only then hand the feature back to the user for live/provider acceptance where that external dependency cannot be reproduced safely in sandbox.

A build pass, isolated component render, mocked API success or backend unit test does not satisfy this gate by itself.

### Harness hygiene
- Network mocks must be narrow enough not to intercept RallyHub source-module requests such as `/src/...` or unrelated API calls.
- Authentication mocks must reflect the current auth request shape.
- A test that never reaches the app shell is a harness failure, not proof of a responsive regression.
- Reusable scripts belong in the repository and should expose a single stable command where practical (for example `qa:mobile` / `qa:smoke`).
- Long bulk audits should persist progress after each item/batch and continue through the population, recording failures rather than losing the full audit because one item failed.
- For large public populations, use the authoritative lightweight endpoint/contract sequentially and throttle requests; render representative pages separately instead of opening every full page when maps/images make the browser audit disproportionately slow.

## 19. Persistence and production-publish verification

A release candidate must cross three separate boundaries:

1. **TESTED** — the named gates passed against a known code state.
2. **PERSISTED** — the exact tested edits are present in the repository/current commit and captured by the checkpoint.
3. **DEPLOYED** — production is proven to be serving that persisted candidate.

Permanent release rules:
- after testing, inspect the relevant persisted files or commit diff; do not assume sandbox edits were auto-committed;
- record the checkpoint ID and commit hash where available;
- after republish, fetch the live application with cache-busting/no-cache semantics and record the active JS/CSS asset fingerprint or equivalent release marker;
- if production still serves old assets, distinguish CDN propagation from a publish of an older source state before changing code again;
- if the persisted source itself lacks the tested edit, reapply it to persisted source, rerun the short release gate and create a new checkpoint;
- only use **DEPLOYED** after the production fingerprint matches the intended release.

### Shared responsive changes are site-wide changes
A change to `AppLayout`, `Sidebar`, global CSS, viewport/meta configuration or another common shell primitive triggers site-wide responsive smoke coverage, even when the defect was first observed on only one page. Do not patch Interclub, KOTC, Membership or Super Admin individually if the cause is shared.

## 20. Test-report template

For Standard, Deep and RC work record:
- change/module;
- selected test depth and why;
- protected baseline/checkpoint;
- sandbox/test data used;
- sporting tests and invariant counts;
- architecture/security checks;
- desktop/mobile browser robots;
- concurrency/multi-device scenarios;
- Base44 rate-limit/slow-response injections;
- request counts/polling observations;
- persistence/offline/sleep tests;
- defects found;
- fixes made;
- permanent regressions added;
- build/lint/typecheck;
- shared-module regressions;
- remaining real-device limitations;
- release-candidate checkpoint;
- final verdict.

---

## 21. Result states

- **PASS** — fully verified at the stated test layer.
- **PASS-WITH-LIMITATION** — automated/local evidence is green but a named live/device/provider behaviour remains unproven.
- **FAIL** — a defect or violated invariant exists.
- **BLOCKED** — the required test cannot run because an environment/account/device capability is missing.

A limitation must be specific; “needs more testing” is not sufficient.

---

## 22. RallyHub Testing Control Pack and Master Testing Group

The Master Testing Blueprint is the human policy master. The repository also contains a machine-readable **RallyHub Testing Control Pack** under `testing/control-pack/`. Its purpose is to ensure ChatGPT, third-party testers, browser agents, security tools and human testers follow the same process rather than interpreting this document differently on every run.

The Control Pack contains five mandatory components:

1. **Master Testing Group** — the governance roles: Protocol Guardian, Risk Gatekeeper, Domain/Sporting Tester, Architecture/Security Tester, Browser/UX Robot, Base44/Resilience Tester, Evidence Recorder and Release Gatekeeper. One person or agent may perform several roles, but release status must come from evidence rather than self-confidence.
2. **Testing Manifest** — machine-readable protocol versions, permanent layers, result/release states, third-party rules, evidence fields and hard release blocks.
3. **Test Run Brief** — the required pre-test record of the exact build, change, blast radius, test data, risk flags, selected depth, planned cases and publish-verification plan.
4. **Evidence Report** — the required post-test record of expected/actual results, evidence, defects, blocked tests, persistence proof, release verdict and production fingerprint where deployment is claimed.
5. **Risk Gate** — machine-readable rules that determine the minimum test depth and mandatory escalations. The tester may go deeper; the tester may not silently go shallower.

Repository commands:
- `npm run qa:protocol` validates the Control Pack itself;
- `npm run qa:risk -- <test-run-brief.json>` evaluates the brief and minimum permitted depth;
- `npm run qa:evidence -- <test-run-brief.json> <evidence-report.json>` validates evidence and the release gate.

### Third-party acceptance rule

No third-party test result is accepted as RallyHub release evidence unless it:
- declares the current Master Testing Blueprint and Control Pack versions;
- uses the RallyHub Test Run Brief;
- passes the Risk Gate at the stated test depth;
- records required tests in the RallyHub Evidence Report using PASS, PASS-WITH-LIMITATION, FAIL or BLOCKED;
- identifies the exact target build/commit/checkpoint;
- distinguishes environment/harness failures from RallyHub application failures;
- proves persisted source before claiming release readiness;
- fingerprints production before claiming deployment or production proof.

A third party may add extra tools and tests. Extra evidence may increase confidence, but it does not silently replace mandatory RallyHub evidence. Any deviation must be recorded with its reason and confidence impact.

### Test-run lifecycle

The standard sequence is:

**Protocol loaded → Test Run Brief → Risk Gate → isolated test environment/data → required layers → Evidence Report → defect/regression loop → persistence proof → Release Gate → publish → production fingerprint → final release state.**

This sequence also applies to ChatGPT itself. The protocol is designed specifically so future testing does not depend on an agent remembering the right process from earlier conversation history.

---

## 23. Living-document and versioning rule

This blueprint is continuously improved.

- **v1.0** captures the Testing approach summary plus KOTC, Club Challenge, Base44, code-health and September 2026 collaborative-scoring lessons.
- **v1.1** added the 24 September Interclub pre-draw roster scope lock and deferred planned-handover gate.
- **v1.2 (30 September 2026)** adds the fast QA ladder, ephemeral Base44 test-environment rules, harness hygiene, persisted-source release gate, production asset fingerprinting after republish, site-wide responsive blast-radius testing, and progress-preserving bulk-audit rules learned during the Directory/contact and mobile-shell work.
- **v1.3 (30 September 2026)** introduces the RallyHub Master Testing Group and machine-readable Testing Control Pack: Testing Manifest, Test Run Brief, Evidence Report, Risk Gate, third-party acceptance rule and automated protocol/evidence validation commands.
- **v1.4 (30 September 2026)** adds the mandatory end-to-end handover journey gate learned from Finance Lite: the user is never the first integration tester; meaningful workflows must be tested from discovery/instructions through setup, primary action, result interpretation, zero/error state and mobile where relevant before handover.
- New reusable lessons become v1.5, v1.6, etc.
- Major testing-architecture changes may become v2.0.
- Historical test plans remain evidence, but this file is the canonical standard.
- When a new failure mode is discovered, update both the automated regression and this blueprint if the lesson is reusable.

The goal is that every future phase of KOTC, Club Challenge, Tournival and new RallyHub development begins with everything already learned rather than rediscovering the same failures.
