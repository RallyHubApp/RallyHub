# Club Command Centre v2.1 — implementation and release coverage

**Status:** Development inventory, not an acceptance certificate. Source: CCC v2.1 master specification discussed with the owner, alongside the repository Software Control Master and Master Testing Blueprint. The protected modules remain authoritative. **No production deployment authorised by this file.**

| Specification workstream | Current implementation evidence | Status / next acceptance requirement |
|---|---|---|
| Multi-tenant / club / sport boundary | Existing Base44 hierarchy, `src/lib/ccc/activityContracts.js`, scoped dashboard queries | Partial; prove cross-club, cross-tenant and club-admin access end-to-end |
| Canonical Person / membership identity | `memberIdentity.js`; optional explicit `EventRegistration.person_id` | Partial; admin-confirmed linking not wired into all workflows |
| Command Centre overview/navigation | `ClubCommandOverview.jsx` in Dashboard; overview counts use existing backend | Partial; full People / Activities / Operations / Management navigation not delivered |
| Activity types and lifecycle | `activityContracts.js`, `activityReadiness.js` | Pure contracts only; creation wizard, persistence, role checks and lifecycle transitions not connected |
| Sessions / calendar | `sessionCalendar.js`, `ClubSchedulePanel.jsx` | Read-only; verify date coverage, recurrence, capacity and real host assignments |
| Registration / booking | Existing guest/membership functions; `bookingPolicy.js`, `registrationEligibility.js` | Existing workflows retained; pure policies not authoritative backend enforcement |
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

## Release blockers
1. Locate and check the exact signed-off v2.1 specification against this inventory; do not infer missing requirements from existing helpers.
2. Implement the remaining integrated workflows, not just standalone policy modules.
3. Validate actual Base44 schema, record limits and query completeness; avoid treating truncated snapshots as full totals.
4. Test initial loading, repeat navigation, stale cache, 429, slow response, lost response and simultaneous actions for membership and booking.
5. Verify permissions for super-admin, club admin, host, member, guest and cross-tenant access without weakening backend RLS.
6. Run desktop and Android browser journeys, protected sporting regressions, communication preview, and payment provider test-mode checks.
7. Obtain task-specific owner approval before any production deploy/publish or live data action; verify the live release afterwards.

## Verification language
A green unit test, lint or Vite build proves only that particular sandbox check. It does not prove Base44 function deployment, live page performance, full specification completion, or production behaviour.
