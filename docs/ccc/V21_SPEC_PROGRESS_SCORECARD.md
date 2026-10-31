# Club Command Centre v2.1 — provisional implementation progress scorecard

**Assessment date:** 31 October 2026. **Reassessment:** Existing event/host cursor pagination was confirmed; membership dashboard and directory now also use scoped cursor pagination with fail-closed incomplete reads and tested >500-record scenarios. Production Base44 runtime acceptance remains outstanding. **Updated after registration-to-attendance reconciliation, manual guest walk-in ledger, post-event follow-up triage and person-linked evidence review.** **Scope:** CCC v2.1 workstreams as tracked in `V21_IMPLEMENTATION_COVERAGE.md`. This is a source-implementation estimate, **not** a passed specification acceptance percentage or a production readiness certificate.

## Method

Each of the 17 workstreams below receives equal weight (1/17). Each score is an engineering judgement of how much of that workstream is implemented in code, informed by the repository inventory and focused tests; it is **not** derived from a fully signed-off requirement-by-requirement A01–A20 traceability matrix. Existing working platform modules receive partial credit only where the CCC integration is present. Missing runtime evidence, consent flows and acceptance gates materially reduce scores.

| Workstream | Estimated implementation % | Primary gap |
|---|---:|---|
| Multi-tenant / club / sport boundary | 80 | CCC and event admin operations require active TenantUserAccess or ClubUserAccess grants, including revocation/expiry; live two-account isolation and remaining module gates remain |
| Canonical Person / membership identity | 70 | Active club identity-link integrity diagnostics and read-only person consent evidence added; backend account-link guard now blocks inconsistent Person/Player/Membership/access grants; partial-write integrity review now visible in Membership Console; concurrent linking, safe recovery actions, full cross-module lifecycle and real consent still missing |
| Command Centre overview/navigation | 90 | People guest policy and Management membership readiness panels added; mobile UAT and broader actions remain |
| Activity types and lifecycle | 80 | Bounded recurrence review added; recurrence persistence and live runtime remain |
| Sessions / calendar | 85 | Weekly recurrence preview and scoped court conflicts; publication and external calendars remain |
| Registration / booking | 77 | Event admin listing, approval, verification and refunds now require authoritative active grants, with mocked denial tests; live provider/runtime and concurrency acceptance remain |
| Guest eligibility | 75 | Clare venue policy preflight and review UI added, cross-checked against existing guestAccessJourney rules; backend approval now rechecks current directory session and beginner restrictions; live host acceptance and concurrency UAT remain |
| Membership and payment journeys | 70 | Read-only membership config, legal document, adult policy and scoped SumUp account checks; real checkout, callback and member lifecycle UAT remain |
| Attendance and post-session | 83 | Guest and event attendance reconciliation, separate walk-in ledger, both CSV exports and advisory close-out checklist; server-side booking eligibility and stale UI save protections added; live UAT and complete-roster verification remain |
| Hosts and delegated access | 95 | Host selection and actions use authoritative grants and venue assignment; real Base44 runtime, mobile UAT and cross-module revocation remain |
| Communications and branding | 73 | Post-event candidate triage and linked-person evidence review integrated; endpoint-hash suppression, approved preview, delivery and provider verification remain |
| Financial reconciliation | 82 | Refund recovery and paginated linked payment rollups; SumUp settlement remains unverified |
| Audit and operational health | 77 | Prioritised read-only operations action queue, recurrence/recovery alerts, event close-out readiness and identity flags; durable audit and monitoring remain |
| Analytics and reporting | 85 | Event and guest attendance/registration CSV exports with personal-data confirmation, formula protection and partial-read warnings; canonical settlement reporting and cross-module exports remain |
| Sporting formats | 60 | Tournival host command, score immutability, DUPR read-only preflight, delegated access and recovery scenario tests added; full tournament end-to-end acceptance, actual DUPR integration and production runtime remain |
| Base44 performance and resilience | 90 | Bounded recurrence preview, paginated finance, guest attendance concurrent-save guard and stale session response protection; bounded 8-way Tournival roster reads and fail-closed partial lookup added; membership dashboard and member directory now cursor-page their main scoped ledgers, with verified 1,250-record test and fail-closed incomplete responses; real Base44 SDK/load verification and configuration pagination remain |
| A01–A20 acceptance and release gates | 41 | Added recurrence boundary and paginated finance tests; formal A01–A20 traceability and live acceptance remain unpassed |

**Arithmetic:** 1313/17 = **77.2% provisional implementation estimate**. This is an engineering estimate of source coverage, not verified acceptance.

**Critical distinction:** This is an estimate of implementation coverage, not verified feature completion. **A01–A20 full acceptance has not passed.** The current changes are development code only; there has been no authorised production deploy or live SumUp verification.

## Evidence and reporting policy

- Focused CCC tests and Vite build are reported with the exact most recent run counts in `V21_IMPLEMENTATION_COVERAGE.md`.
- Mocked SDK tests establish code behaviour in the test harness, not Base44 runtime support or production reliability.
- Changes to the percentage require a corresponding update to the workstream scores, with new code and test evidence.
- A signed-off clause-by-clause master specification traceability exercise may materially change this estimate; until then, avoid presenting 77.2% as a measured contractual completion figure.
