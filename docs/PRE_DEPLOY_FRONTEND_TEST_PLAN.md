# RallyHub Pre-Deployment Front-End Test Plan

Purpose: maximise confidence before the next live deployment while preserving the agreed strategy of simulate heavily and deploy sparingly.

## Test order

### Phase A — Front-end workflow and shell
- WF-001 Build, lint, typecheck and route map integrity
- WF-002 Public navigation: landing, about, contact, login, register, password reset routes
- WF-003 Authenticated app shell: dashboard/sidebar, protected route guard and legacy redirects
- WF-004 Tenant/club context: authorised tenant, wrong-tenant rejection, unlinked/pending user states
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
