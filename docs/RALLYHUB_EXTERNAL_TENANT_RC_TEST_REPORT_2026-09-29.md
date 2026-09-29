# RallyHub External Tenant / Trial Foundation — RC-Depth Test Report

**Date:** 29 September 2026  
**Scope:** New additive multi-tenant capability / entitlement / trial / legal / commercial foundation  
**Testing standard:** `RALLYHUB_MASTER_TESTING_BLUEPRINT.md`  
**Pre-change restore point:** `5625e76cd5f698e105b9d1b2aa7728a6d5f47617`  

## Final verdict

**PASS-WITH-LIMITATION for the new external-tenant foundation.**

The new foundation is architecturally safe to retain and continue building on. It is **not yet an external-club production rollout**, because entitlement enforcement, trial UI/onboarding, Super Admin controls, payment conversion and Ashbourne-specific activation have intentionally not yet been wired into live product routes.

The critical preservation objective passed: **no live King of the Court, RallyHub Interclub / Club Challenge, Tournival or other tournament-engine product file was changed.** Existing production tenants remain on legacy/full access because there are currently **zero `TenantAccessPolicy` enforcement records**.

## Change-scope / blast-radius check

Changed product architecture is confined to:
- new RallyHub capability catalogue;
- new tenant access policy;
- new tenant entitlement records;
- new trial application records;
- versioned RallyHub legal agreement and immutable acceptance records;
- commercial plan / plan-capability / subscription records;
- new `tenantEntitlements` backend service and pure entitlement policy helper;
- testing/documentation.

Existing tournament engines were not refactored or migrated.

## Layer 1 — Sporting engine / deterministic regression

### King of the Court

- Domain foundation: **PASS**
- Deterministic sporting engine: **PASS**
- Fairness / bench engine: **PASS**
- Persistence / workflow: **PASS**
- Integrated production simulator: **PASS**
  - 370 player/court combinations × 9 rounds
  - **25,937 invariant checks**
  - **0 failures**
- Exception / transition suite: **PASS** — 58 checks
- Engine acceptance: **PASS** — 24 checks
- UI integration architecture: **PASS** — 33 checks
- Host controls: **PASS** — 36 checks
- Deployment rehearsal: **PASS** — 56 checks
- Lifecycle / timer regression: **PASS** — 45 checks
- Access / architecture gate: **PASS** — 133 checks

### RallyHub Interclub / Club Challenge

- Gate 1 engine suite: **PASS**
  - canonical 16 + 16 players
  - 4 courts
  - 12 rounds
  - 48 matches
  - 6 games per player
- Generalised fixture sizes: **PASS**
- Phase 1 simulation: **PASS**
- Gate 3 foundation: **PASS**
- Gate 3 final rehearsal: **PASS**
  - concurrent scorers
  - stale/offline conflict
  - replacement
  - 4→3 court disruption
  - metrics
  - showcase
  - finalisation blockers
  - role/security contract

## Layer 2 — Architecture / security / data integrity

### New entitlement architecture gate

**PASS — 56 checks**

Verified:
- legacy/full-access default for existing tenants;
- explicit `entitlements_required` mode exists but is not enabled for production tenants;
- tournament types and platform functions are separated;
- start/end and entitlement types are representable;
- legal agreement versioning / acceptance evidence is representable;
- tenant context mismatch rejection;
- club context mismatch rejection;
- event-scoped entitlement checks;
- capability dependency handling;
- live-event expiry grace;
- Super Admin protection for entitlement mutation.

### Deterministic entitlement policy simulation

**PASS — 40 checks, 0 failures**

Verified:
- active, future, expired, grace, suspended and revoked windows;
- club-scoped access cannot become tenant-wide when club context is missing;
- wrong-club access is rejected;
- one-event access requires the matching event ID;
- missing/wrong event ID is rejected;
- KOTC dependencies such as Results / Player Links inherit the source entitlement's club/event scope;
- dependency graphs resolve transitively and safely with cycles;
- suspended/revoked/scheduled grants cannot regain access through dependency expansion;
- live-event grace preserves club/event scope.

### Security defects discovered by the blueprint and fixed before sign-off

The first implementation exposed four issues during adversarial review:
1. A club-scoped entitlement could be considered when the caller omitted club context.
2. A same-tenant non-admin caller was not explicitly rejected when asking about another club ID.
3. A `one_event` entitlement did not initially require the matching event ID.
4. Capability dependencies could lose the originating one-event scope, e.g. a one-event KOTC licence risked becoming a broader Results permission.

All four were fixed in the new entitlement service and added to permanent regression coverage. The Master Testing Blueprint was also updated so entitlement scope inheritance is now a permanent Layer 2 requirement.

### Test-tenant persistence

Used existing isolated test tenant only:
- `RallyHub One-Off Test Tenant`
- `RallyHub Test Club`

Tested persisted records for:
- active KOTC trial;
- expired Spond trial;
- future Tournival beta;
- one-event RallyHub Interclub access.

Records were re-read successfully after creation, then moved to `revoked` and re-read again. All test entitlements are now inert. No Clare production record was used for this persistence test.

### Production tenant enforcement safety

Query of `TenantAccessPolicy`: **0 records**.

Therefore no existing RallyHub tenant has been switched from the default legacy/full-access behaviour. The new entitlement layer cannot currently block Clare or the upcoming Interclub.

## Layer 3 — Human-style browser robots

### KOTC delegated host — mobile

**PASS — 4 / 4**

Verified:
- restricted host controls;
- attendee contact scope;
- player/public links;
- real keyboard score entry;
- Super Admin test tools remain Super Admin-only;
- session host cannot see test tools;
- failed score save preserves entered values and retries safely.

### KOTC full mobile host journey

**PASS — 1 / 1 strict robot**

Final successful run:
- create acknowledgement: 79 ms;
- create → editor: 669 ms;
- round setup save acknowledgement: 55 ms;
- start acknowledgement: 138 ms;
- start → live: 800 ms;
- timer running: 807 ms;
- undo acknowledgement: 84 ms;
- undo → editor: 1,071 ms;
- restart → live: 816 ms;
- Round 1 → Round 2 editor: 679 ms;
- finish → podium: 591 ms;
- whole-court drag persisted;
- round setup survived reload;
- 3 rounds completed;
- post-event score correction passed;
- 46 backend function calls in the journey.

Two earlier runs exceeded individual acknowledgement thresholds under sandbox load (266 ms undo; 482 ms round-setup save). A full diagnostic run then completed every functional step with all measured timings inside target, and the permanent strict robot subsequently passed. This is recorded as transient environment jitter, not a repeatable regression.

### RallyHub Interclub full browser robot

**PASS — 5 / 5**

Passed:
1. Mobile host setup → practice → draw → live → full result.
2. Public two-team voting.
3. Public Live Event View / Hall Display including disconnect/reconnect truth.
4. Completed player-link journey including Final, Summary and integrated voting.
5. Live recovery with stale timer, break controls and return to next round.

The robot exercised 48 normal matches and rate-limit retry behaviour. This is the primary preservation test for the upcoming Interclub.

### Tenant Events

- Desktop create/upload/crop/preview/publish: **PASS**
- Mobile editor / no horizontal body scroll: **PASS**

### Shared auth / old one-off test fixtures

Four of six selected shared tests passed. Two failures are pre-existing/stale and outside this change:
- landing login currently preserves `/` rather than the old test expectation of forcing `/app`;
- an old temporary Marie directory listing fixture no longer exists.

Neither corresponding product area was changed by this entitlement work. These are logged as test-suite housekeeping rather than regressions from this foundation.

## Layer 4 — Base44 / build / provider integrity

- Production build: **PASS**
- New entitlement backend bundles/parses: **PASS**
- Targeted lint for all new entitlement code/tests: **PASS**
- Existing KOTC provider/rate-limit resilience gates: **PASS**
- Interclub browser rate-limit retry scenario: **PASS**
- Test-tenant entity create/read/update/read persistence: **PASS**

### Existing repository-wide code-health limitations

`npm run lint` is not globally clean because of two existing unused imports in `src/pages/MemberMessages.jsx`.

`npm run typecheck` is not globally clean because the repository already contains broad pre-existing JavaScript/TypeScript inference issues, including Leaflet and existing UI/component typings. None of the reported files were introduced by the external-tenant foundation. New entitlement files pass targeted lint and backend bundling.

These existing repository debts mean this report does **not** claim that the entire RallyHub repository is a clean green-field RC under every code-health gate.

## Rollback / recovery

Pre-change checkpoint exists and is known:
- `5625e76cd5f698e105b9d1b2aa7728a6d5f47617`

A final post-test checkpoint should be used as the new known-good foundation point.

## Release position

### Safe now
- retain the new schemas and entitlement service;
- continue building external-tenant onboarding around them;
- continue current Clare and upcoming RallyHub Interclub work without changing engine internals.

### Not yet activated
- entitlement enforcement on Clare or any current production tenant;
- Ashbourne tenant/trial activation;
- public trial application UI;
- Trial & Evaluation Agreement UI/acceptance journey;
- Super Admin entitlement management UI;
- guided demo onboarding / Quick Start surfaces;
- payment gateway/subscription checkout;
- automatic paid conversion.

## Final statement

The external-tenant architecture has passed the relevant sporting regression, architecture/security, browser-robot and Base44/persistence testing at RC depth. The testing process identified and corrected real scope-escalation risks before the entitlement service was connected to live routes. RallyHub Interclub remains functionally intact and fully green in its full browser robot. The new foundation is therefore safe to retain and proceed with, while entitlement enforcement remains deliberately inactive until the next controlled rollout stage.
