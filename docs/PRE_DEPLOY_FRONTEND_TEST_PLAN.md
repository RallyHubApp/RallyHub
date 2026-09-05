# RallyHub Pre-Deployment Front-End Test Plan

Purpose: maximise confidence before the next live deployment while preserving the agreed strategy of simulate heavily and deploy sparingly.

## Test order

### Phase A — Front-end workflow and shell
- WF-001 Build, lint, typecheck and route map integrity — PASS for build/lint/routes; typecheck baseline debt documented
- WF-001B Full RallyHub Typecheck — DEFERRED: fix shared typing/environment now where low-risk; complete remaining KOTC-specific errors during KOTC repair, then make typecheck a release gate
- WF-002 Public navigation: landing, about, contact, login, register, password reset routes — PASS-WITH-LIMITATION (local simulator + built SPA HTTP route smoke pass; real Base44 auth/email/provider round-trip requires Gate 4/live runtime)
- WF-003 Authenticated app shell: dashboard/sidebar, protected route guard and legacy redirects — PASS-WITH-LIMITATION (static workflow simulator + built SPA route smoke pass; real authenticated session transition remains Gate 4/runtime verification)
- WF-004 Tenant/club context: authorised tenant, wrong-tenant rejection, unlinked/pending user states — PASS-WITH-LIMITATION (static simulator + current access/tenant/club data inspection + prior live isolation audit evidence; new live session transition remains Gate 4/runtime verification)
- WF-005 Admin workflow: admin panel visibility, approvals, tenant isolation test screen
- WF-006 Tournament workflow: tournament list → create → detail → format-specific view → status transitions
- WF-007 Responsive/small-screen risk review: navigation, dialogs, score inputs, action buttons, overflow

### Phase B — Club Challenge front-end workflow
- CCUI-001 Setup → Teams → Draw → Approve → Start navigation guards
- CCUI-002 16+16 roster loading/ranking/locking and redraw constraints
- CCUI-003 Draw/fairness display and approved Event Pack state
- CCUI-004 Live scoring on simultaneous courts and stale revision conflict
- CCUI-005 Authoritative timer controls, pause/resume/+1/changeover/break and speech fallback
- CCUI-006 Round completion/missing-result block and round advance permissions
- CCUI-007 Replacement/withdrawal/continue-short/late-arrival workflows
- CCUI-008 Court/time disruption proposal → organiser review → confirm → Event Pack stale
- CCUI-009 Offline score retention → reconnect → retry → conflict/manual review
- CCUI-010 Hall Display read-only content/privacy
- CCUI-011 Showcase/tie workflow: clear winner, metrics, Showcase Final, overall draw
- CCUI-012 POT lifecycle: open/close/reveal, self/duplicate/outsider constraints; mark public QR/guest path separately if not yet deploy-ready
- CCUI-013 Finalisation blockers and final result state
- CCUI-014 Refresh/reopen persistence and archive/reopen controls

### Phase C — Shared tournament components/modules
- MOD-001 Standard Tournival regression
- MOD-002 Knockout regression
- MOD-003 King of the Court regression/smoke test (known repair priority remains separate)
- MOD-004 Match Center regression
- MOD-005 Leaderboard regression
- MOD-006 Players/member directory and player profile regression
- MOD-007 Public tournament view and public registration regression
- MOD-008 Venue selection/reuse and create-tournament modal regression

### Phase D — Other RallyHub front-end modules
- APP-001 Dashboard
- APP-002 Analytics
- APP-003 My Profile
- APP-004 Admin Panel
- APP-005 Membership/tenant access surfaces currently exposed in RallyHub

### Phase E — Resilience/security release checks
- SEC-001 Admin vs event manager vs scorer vs display role matrix
- SEC-002 Wrong-tenant and no-grant rejection
- SEC-003 Direct Club Challenge entity RLS remains restricted
- SEC-004 Score backend permits scoring but blocks scorer corrections unless granted
- SEC-005 Timer/round/finalise backend role enforcement
- RES-001 Offline score queue never reports server save while offline
- RES-002 Reconnect conflict never overwrites newer server revision
- RES-003 Hall display disconnected-state behaviour
- RES-004 Timer sleep/reopen resynchronisation

### Phase F — Pre-deploy release gate
- REL-001 Gate 1 engine suite
- REL-002 Gate 3 foundation suite
- REL-003 Gate 3 final 32-player rehearsal
- REL-004 Production build
- REL-005 No unresolved P0/P1 defects
- REL-006 Create final pre-deploy checkpoint
- REL-007 Deploy once for Gate 4 physical/browser/device rehearsal

## Result states
PASS = verified locally/simulator. PASS-WITH-LIMITATION = code/simulator verified but true browser/device/network runtime requires Gate 4. FAIL = defect found. BLOCKED = cannot be tested locally without deployment/device/account context.

## Reporting
Each test is reported back with its ID, result, evidence, defect/fix if any, and remaining limitation. The checklist is updated as testing proceeds. No deployment occurs until the pre-deploy checklist is complete and release decision is explicit.

## Completed test evidence
- WF-001: production build PASS; ESLint PASS after removal of 44 unused imports across 22 files; core route map PASS. Existing project-wide JS/type inference issues mean typecheck is tracked separately as WF-001B.
- WF-002: static workflow simulator PASS for public routes, email/password login, Google login entry point, registration, OTP verification/resend, forgot/reset-password routes and unauthenticated redirect. Production build PASS. Local Vite preview returned HTTP 200 and SPA root for `/`, `/about`, `/contact`, `/login`, `/register`, `/forgot-password`, `/reset-password`, `/register/test-event`, `/tournament/test-event`, `/t/test-event`. Live identity-provider/email delivery remains a Gate 4 runtime check.
- WF-003: authenticated-shell static simulator PASS for dashboard index, Players, Tournaments, Match Center, Leaderboard, Analytics, My Profile, Admin and isolation routes; protected `/app/*` wrapper; loading/auth/unregistered-user handling; pending-approval gate; conditional Admin sidebar item; mobile menu open/close; profile dropdown/logout; authenticated unknown-route fallback; and legacy route redirects including parameterised Player/Tournament URLs. Production build PASS. Local Vite preview returned HTTP 200 and SPA root for `/app`, all principal `/app/*` pages and legacy `/players`, `/players/:id`, `/tournaments`, `/tournaments/:id`, `/dashboard`. Actual authenticated Base44 session state transitions remain a Gate 4/runtime check.
- WF-004: security-context static simulator PASS for authentication requirement, approval requirement, explicit tenant+club activation, active ClubUserAccess enforcement, tenant/club ownership relationship validation, inactive tenant/club rejection, sole-club auto-selection, multi-club selection requirement and scope clearing. Isolation self-test code verifies caller-scoped Player listing, forbidden direct read, forbidden update and cross-tenant create spoof. Current records confirm Clare Pickleball and TBC Test PB are separate active tenants with separate active clubs; Brian is scoped to Clare and Marie to TBC Test PB with matching active ClubUserAccess and TenantUserAccess. Three prior non-admin TBC-vs-Clare live isolation audit entries all recorded PASS: TBC read allowed; Clare list/direct-ID read blocked; cross-tenant create blocked; cross-tenant update blocked. Production build PASS. A fresh post-bundle non-admin session re-check is retained for Gate 4.
