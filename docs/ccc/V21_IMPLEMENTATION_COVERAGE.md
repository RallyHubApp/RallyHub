# Club Command Centre v2.1 — implementation and release coverage

**Status:** Development inventory, not an acceptance certificate. Source: CCC v2.1 master specification discussed with the owner, alongside the repository Software Control Master and Master Testing Blueprint. The protected modules remain authoritative. **No production deployment authorised by this file.**

| Specification workstream | Current implementation evidence | Status / next acceptance requirement |
|---|---|---|
| Multi-tenant / club / sport boundary | Existing Base44 hierarchy, `src/lib/ccc/activityContracts.js`, scoped dashboard queries | Partial; prove cross-club, cross-tenant and club-admin access end-to-end |
| Canonical Person / membership identity | `memberIdentity.js`; optional explicit `EventRegistration.person_id` | Partial; admin-confirmed linking not wired into all workflows |
| Command Centre overview/navigation | `ClubCommandOverview.jsx` in Dashboard; overview counts use existing backend | Partial; full People / Activities / Operations / Management navigation not delivered |
| Activity types and lifecycle | `activityContracts.js`, `activityReadiness.js`, `activityWorkflow.js`, `activityWizard.js`, `ClubActivityPlanner.jsx` | Four-step planner has `ClubActivity` entity, `cccActivity` draft save/list, revision-checked staging transitions and scoped venue selection. **Persistence and backend permissions have not been independently exercised in a live Base44 runtime; no activity publication or end-to-end activation verified** |
| Sessions / calendar | `sessionCalendar.js`, `ClubSchedulePanel.jsx` | Read-only; verify date coverage, recurrence, capacity and real host assignments |
| Registration / booking | Existing guest/membership functions; `bookingPolicy.js`, `registrationEligibility.js` | Existing `eventRegistration` backend includes atomic capacity counter, approval, SumUp checkout/verification/refunds and notice delivery. `registrationBridge.js` and `cccActivity.link_event` provide explicit same-club event linking; **read-only linked-event registration overview and summary added (tenant/club scoped, capped at 500 rows), but no end-to-end bridge activation, payment reconciliation or notice delivery verification** |
| Guest / beginner / experienced access | Existing guest-access backend and `registrationEligibility.js` | Test actual venue restrictions, approvals and rescheduling on mobile |
| Membership and payment journeys | Existing membership backend; batched payment lookups and read resilience | Performance improvements committed; no measured Base44 first-load or end-to-end acceptance yet |
| Attendance and post-session | `attendanceProjection.js`, `postEventQueue.js`, `ClubPostEventPanel.jsx` | Read-only; full attendance and follow-up send reconciliation not accepted |
| Hosts and delegated access | `hostAccessPolicy.js`, existing host flows | Policy helper only; backend grants/expiry/revocation and host UI not integrated |
| Communications and branding | `communicationPolicy.js`; existing Comms Centre | Preflight helper only; all outbound routes/approved templates need audit |
| Financial reconciliation | `paymentReconciliation.js`, `ClubPaymentPanel.jsx` | Read-only last-250-record snapshot; no authoritative full ledger/revenue reconciliation |
| Audit and operational health | `auditTrail.js`, `operationalHealth.js` | Read-only helpers, not wired into full management interface |
| Analytics and reporting | `clubMetrics.js`, existing dashboards | Partial; canonical reporting definitions and completeness checks required |
| Sporting formats | Existing KOTC / Tournival / Interclub / DUPR modules preserved | Run protected regressions; no claims of CCC integration completion |
| Base44 performance / resilience | `readResilience.js`; guest/membership backend query batching and indexing | Source-level improvements; load/429/timeout tests and actual latency benchmarks outstanding |
| Release gates A01–A20 | Focused `testing/ccc` tests and existing regression scripts | **Not passed**; requires full mapping to master spec, browser/mobile/role and failure-injection evidence |

## Current evidence and next implementation order

- **Implemented in source:** `ClubActivity` schema; `cccActivity` save/list/transition/preflight/link operations; activity planner controls; `registrationBridge.js` policy; existing `eventRegistration` booking, SumUp and notification workflows.
- **Verified in sandbox:** 105 focused CCC tests passing and frontend build successful in the most recent sandbox run. These tests do not establish backend deployment or integration acceptance.
- **Priority 1:** Test Base44 SDK/entity semantics, user tenant/club authority and concurrency for `cccActivity`; repair any failures.
- **Priority 2:** Link existing tenant events via an admin-selectable event list and check venue, host, capacity, eligibility, communications and payment consistency server-side. Keep public registration closed until fully verified.
- **Priority 3:** Validate new `cccActivity.registration_overview` against a test tenant and event; verify booking statuses, linked payment attribution and pagination (currently capped at 500 records). Exercise booking, approval, payment holds, webhook reconciliation, waitlist, notices and refunds through the existing event service in an isolated test environment.
- **Priority 4:** Complete attendance, host workspace, finance, communications and remaining CCC journeys; execute A01–A20 and protected sporting regressions.

## Release blockers
1. Locate and check the exact signed-off v2.1 specification against this inventory; do not infer missing requirements from existing helpers.
2. Verify `cccActivity` draft save/list, scoped access, revision-checked transitions and linked-event persistence against real Base44 backend; add validated host/template selectors and connect registration without duplicating the existing event service.
3. Validate actual Base44 schema, record limits and query completeness; avoid treating truncated snapshots as full totals.
4. Test initial loading, repeat navigation, stale cache, 429, slow response, lost response and simultaneous actions for membership and booking.
5. Verify permissions for super-admin, club admin, host, member, guest and cross-tenant access without weakening backend RLS.
6. Run desktop and Android browser journeys, protected sporting regressions, communication preview, and payment provider test-mode checks.
7. Obtain task-specific owner approval before any production deploy/publish or live data action; verify the live release afterwards.

## Verification language
A green unit test, lint or Vite build proves only that particular sandbox check. It does not prove Base44 function deployment, live page performance, full specification completion, or production behaviour.
