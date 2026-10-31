# Club Command Centre v2.1 — provisional implementation progress scorecard

**Assessment date:** 31 October 2026. **Updated after weekly recurrence preview and paginated linked-event finance rollups were integrated with the planner and registration overview.** **Scope:** CCC v2.1 workstreams as tracked in `V21_IMPLEMENTATION_COVERAGE.md`. This is a source-implementation estimate, **not** a passed specification acceptance percentage or a production readiness certificate.

## Method

Each of the 17 workstreams below receives equal weight (1/17). Each score is an engineering judgement of how much of that workstream is implemented in code, informed by the repository inventory and focused tests; it is **not** derived from a fully signed-off requirement-by-requirement A01–A20 traceability matrix. Existing working platform modules receive partial credit only where the CCC integration is present. Missing runtime evidence, consent flows and acceptance gates materially reduce scores.

| Workstream | Estimated implementation % | Primary gap |
|---|---:|---|
| Multi-tenant / club / sport boundary | 80 | CCC and event admin operations require active TenantUserAccess or ClubUserAccess grants, including revocation/expiry; live two-account isolation and remaining module gates remain |
| Canonical Person / membership identity | 55 | Active club identity-link integrity diagnostics and read-only person consent evidence added; cross-module identity lifecycle and real delivery consent still missing |
| Command Centre overview/navigation | 90 | People guest policy and Management membership readiness panels added; mobile UAT and broader actions remain |
| Activity types and lifecycle | 80 | Bounded recurrence review added; recurrence persistence and live runtime remain |
| Sessions / calendar | 85 | Weekly recurrence preview and scoped court conflicts; publication and external calendars remain |
| Registration / booking | 75 | Event admin listing, approval, verification and refunds now require authoritative active grants, with mocked denial tests; live provider/runtime and concurrency acceptance remain |
| Guest eligibility | 65 | Clare venue policy preflight and review UI added, cross-checked against existing guestAccessJourney rules; authoritative booking/host acceptance still requires live UAT |
| Membership and payment journeys | 70 | Read-only membership config, legal document, adult policy and scoped SumUp account checks; real checkout, callback and member lifecycle UAT remain |
| Attendance and post-session | 55 | Mobile UAT and consent-cleared follow-up |
| Hosts and delegated access | 95 | Host selection and actions use authoritative grants and venue assignment; real Base44 runtime, mobile UAT and cross-module revocation remain |
| Communications and branding | 70 | Person-scoped consent, preference and suppression evidence review with explicit endpoint-hash gap; eight-purpose template readiness; delivery and provider verification remain |
| Financial reconciliation | 82 | Refund recovery and paginated linked payment rollups; SumUp settlement remains unverified |
| Audit and operational health | 60 | Host revocation audit, refund reconciliation alerts and identity-integrity flags; durable audit and monitoring remain |
| Analytics and reporting | 70 | Registration, attendance and payment totals aggregate loaded continuation pages; canonical settlement reporting remains |
| Sporting formats | 45 | Protected module integration and regression |
| Base44 performance and resilience | 75 | Bounded recurrence preview, paginated finance and stale response guard; live concurrency/load remain |
| A01–A20 acceptance and release gates | 35 | Added recurrence boundary and paginated finance tests; formal A01–A20 traceability and live acceptance remain unpassed |

**Arithmetic:** 1187/17 = **69.8% (rounded to 70%) provisional implementation estimate**.

**Critical distinction:** This is an estimate of implementation coverage, not verified feature completion. **A01–A20 full acceptance has not passed.** The current changes are development code only; there has been no authorised production deploy or live SumUp verification.

## Evidence and reporting policy

- Focused CCC tests and Vite build are reported with the exact most recent run counts in `V21_IMPLEMENTATION_COVERAGE.md`.
- Mocked SDK tests establish code behaviour in the test harness, not Base44 runtime support or production reliability.
- Changes to the percentage require a corresponding update to the workstream scores, with new code and test evidence.
- A signed-off clause-by-clause master specification traceability exercise may materially change this estimate; until then, avoid presenting 70% as a measured contractual completion figure.
