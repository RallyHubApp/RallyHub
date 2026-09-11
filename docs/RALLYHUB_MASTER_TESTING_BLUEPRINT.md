# RallyHub Master Testing Blueprint

**Status:** Canonical living testing standard  
**Version:** 1.0  
**Date:** 11 September 2026  
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
11. request **one** deployment;
12. run planned live-device/hall acceptance;
13. convert any live defect into automation before calling it permanently fixed.

The user should not be used as the primary integration tester for defects the robot could have found first.

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
> **11. Challenge the UX from the viewpoint of a rushed organiser in a noisy hall.** If the workflow is technically correct but unnecessarily slow, scroll-heavy, misleading or likely to cause duplicate actions, record it as a defect/product-improvement finding.
>
> **12. At the end, report the exact evidence and state:** coded, build-passed, simulator-tested, robot-tested, release-candidate, deployed, live-device tested, or production-proven. If not ready, identify and fix/test the blocker rather than making the user the integration tester.

---

## 18. Test-report template

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

## 19. Result states

- **PASS** — fully verified at the stated test layer.
- **PASS-WITH-LIMITATION** — automated/local evidence is green but a named live/device/provider behaviour remains unproven.
- **FAIL** — a defect or violated invariant exists.
- **BLOCKED** — the required test cannot run because an environment/account/device capability is missing.

A limitation must be specific; “needs more testing” is not sufficient.

---

## 20. Living-document and versioning rule

This blueprint is continuously improved.

- **v1.0** captures the Testing approach summary plus KOTC, Club Challenge, Base44, code-health and September 2026 collaborative-scoring lessons.
- New reusable lessons become v1.1, v1.2, etc.
- Major testing-architecture changes may become v2.0.
- Historical test plans remain evidence, but this file is the canonical standard.
- When a new failure mode is discovered, update both the automated regression and this blueprint if the lesson is reusable.

The goal is that every future phase of KOTC, Club Challenge, Tournival and new RallyHub development begins with everything already learned rather than rediscovering the same failures.
