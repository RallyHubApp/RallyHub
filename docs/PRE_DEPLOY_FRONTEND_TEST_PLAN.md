# RallyHub Pre-Deployment Front-End Test Plan

Purpose: maximise confidence before the next live deployment while preserving the agreed strategy of simulate heavily and deploy sparingly.

## Test order

### Phase A — Front-end workflow and shell
- WF-001 Build, lint, typecheck and route map integrity — PASS for build/lint/routes; typecheck baseline debt documented
- WF-001B Full RallyHub Typecheck — DEFERRED: fix shared typing/environment now where low-risk; complete remaining KOTC-specific errors during KOTC repair, then make typecheck a release gate
- WF-002 Public navigation: landing, about, contact, login, register, password reset routes — PASS-WITH-LIMITATION (local simulator + built SPA HTTP route smoke pass; real Base44 auth/email/provider round-trip requires Gate 4/live runtime)
- WF-003 Authenticated app shell: dashboard/sidebar, protected route guard and legacy redirects — PASS-WITH-LIMITATION (static workflow simulator + built SPA route smoke pass; real authenticated session transition remains Gate 4/runtime verification)
- WF-004 Tenant/club context: authorised tenant, wrong-tenant rejection, unlinked/pending user states — PASS-WITH-LIMITATION (static simulator + current access/tenant/club data inspection + prior live isolation audit evidence; new live session transition remains Gate 4/runtime verification)
- WF-005 Admin workflow: admin panel visibility, approvals, tenant isolation test screen — PASS-WITH-FIX (static simulator + build/lint pass; corrected Admin Panel visibility so only platform/site admins can access it, and disabled admin data queries for non-admin users)
- WF-006 Tournament workflow: tournament list → create → detail → format-specific view → status transitions — PASS-WITH-FIX (static workflow simulator + lint/build pass; fixed tenant/club ownership on quick KOTC/Tournival/import creation and ensured generated standard Match records inherit tournament tenant_id)
- WF-007 Responsive/small-screen risk review: navigation, dialogs, score inputs, action buttons, overflow — PASS-WITH-FIX (static responsive simulator + lint/build pass; fixed standard tournament tab overflow on narrow screens and multi-game score-chip wrapping)

### Phase B — Club Challenge front-end workflow
- CCUI-001 Setup → Teams → Draw → Approve → Start navigation guards — PASS (static navigation/guard simulator + source inspection + lint/build pass; redraw protection confirmed by completed-match-history block)
- CCUI-002 16+16 roster loading/ranking/locking and redraw constraints — PASS (static roster/ranking/lock simulator + Gate 1 canonical engine suite + lint/build pass; drag disabled after approval/live states, rank changes invalidate fairness/draw approval, completed history blocks full redraw)
- CCUI-003 Draw/fairness display and approved Event Pack state — PASS (static simulator + Gate 1 canonical engine suite + lint/build pass; approval versions/stamps draw, Event Pack fresh only on approval, stale pack blocked after material changes)
- CCUI-004 Live scoring on simultaneous courts and stale revision conflict — PASS (static concurrency contract + Gate 3 foundation + final 32-player rehearsal + lint/build pass; match-level optimistic revisions isolate different courts and reject stale same-match edits with 409/current-state response)
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
- WF-005: Admin workflow simulator PASS for site-admin UI guard, approve/reject/revoke controls, self-protection, backend `adminUserTools` non-admin rejection, approval-status validation, protection against revoking platform admins, admin-only approval notifications and isolation-test invocation. A defect was found and fixed: Admin Panel visibility previously inherited KOTC `admin` role, which could expose the site-owner panel to a non-platform KOTC admin. Sidebar and AdminPanel now require `user.role === 'admin'`, and the three AdminPanel data queries are disabled for non-admin users. ESLint PASS and production build PASS after the fix. Live invite/email/password-reset operations remain Gate 4/runtime checks.
- WF-006: Tournament workflow simulator PASS for list/search/status filtering, advanced creation, quick Club Challenge/KOTC/Tournival creation, tournament detail routing, specialist format dispatch to dedicated Club Challenge/KOTC/Tournival views, standard draw generation guard, Draft → Registration Open, draw → In Progress and In Progress → Completed pathways, deletion confirmation, and Club Challenge separation from standard status controls. Two tenancy defects were found and fixed: quick KOTC/Tournival and KOTC-import tournament creation did not persist active tenant/host club, and standard draw-generated Match records did not inherit tournament `tenant_id`. ESLint PASS and production build PASS after fixes. Note for SEC phase: Tournament entity `read` RLS is currently public/true to support public views; this needs a dedicated privacy/security design review because the same entity also stores internal tournament state. Live CRUD/status transitions remain Gate 4/runtime checks.
- WF-007: responsive static simulator PASS for mobile sidebar/overlay, desktop sidebar offset, horizontal-overflow containment, mobile menu touch target, tournament cards/actions, dialog vertical scrolling, Club Challenge tab/score/timer/event controls, Tournival/public Tournival scrollable navigation, KOTC timer scaling and bracket overflow. Two low-risk defects were fixed: standard tournament tabs now scroll horizontally instead of clipping on narrow screens, and MatchScorer multi-game score chips now wrap rather than overflow. ESLint PASS and production build PASS. True viewport/device rendering remains Gate 4.
- CCUI-003: draw/fairness/Event Pack simulator PASS. Fairness report and hard-check badge render; draw approval increments `draw_version`, records approver/time and aligns `event_pack_version`; approval marks the pack current; printing is blocked before approval and when stale; the pack contains ranked rosters, approved fixtures, blank score fields, timing/break settings, manual final total and Showcase line when enabled. Ranking/material fixture changes mark the pack OUT OF DATE. Gate 1 canonical engine suite, ESLint and production build all PASS. Browser print/PDF pagination remains a Gate 4 physical check.
