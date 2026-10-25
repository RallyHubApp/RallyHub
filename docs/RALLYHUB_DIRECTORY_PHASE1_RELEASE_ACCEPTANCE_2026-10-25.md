# RallyHub Directory Command Centre — Phase 1 release acceptance ledger

**Date:** 25 October 2026  
**Scope:** Phase 1 Master Specification v1.0, Directory independently governed; two verified superadmin IDs; separate from tenant/multi-sport engine.  
**Current decision:** SANDBOX IMPLEMENTATION AND AUTOMATED CHECKS PASS; PRODUCTION PHASE 1 SIGN-OFF IS WITHHELD PENDING RELEASE AND REAL-SYSTEM EVIDENCE.

## Implemented in sandbox
1. Technical repairs: corrected the original 491 TypeScript errors; typecheck now exits 0 without suppressing all application checks. Added missing React/Leaflet/Node type declarations and corrected several real bad references. Browser regression discovered and repaired a missing `Megaphone` import that otherwise caused an authenticated white screen. New Directory views no longer show Clare Pickleball's membership KPI.
2. Directory administration: independent Directory workspace and private tabs, established CRM and enquiry inbox; outstanding follow-up badges; distinguishes submitted enquiries from contact button clicks.
3. Campaigns & Consent: Directory-only campaign drafts, approved-brand HTML preview, content approval, UTM name, read-only eligible-audience preview (consent/channel/topic/county/club, suppression, deduplication), hashed email suppression and unsubscribe-triggered suppression. No send action is exposed.
4. Identity governance: independent verified person-source IDs, explicit consent references, provenance and Directory-only proposals/revocation. Neither tenant records nor roles are mutated by these actions. Link activation is unavailable, deliberately requiring an independently verified tenant-side contract.
5. Portability: private RLS schemas, typed Directory inventory, cursor-paginated export, nested credential redaction, dependency/relationship manifest and synthetic restoration dry-run validator. Requires production-safe export/reconciliation and actual test restore before extraction readiness can be signed.
6. External service prerequisite check: Base44 Gmail for `rallyhubapp@gmail.com`, Google Analytics and Google Search Console OAuth connectors report connected/active. This is connection status only, not proof of successful recipient delivery, campaign readiness or actual measurement accuracy.

## Automated evidence
- `npm run typecheck` — PASS (0 errors).
- `npm run test:directory` — 87/87 PASS (includes sandbox mock-authorised workflow tests for both approved IDs, denied arbitrary admins, consent segmentation, suppression, draft approval, explicit identity linking, cursor-paginated redacted snapshot and synthetic restore).
- `npm run gate:directory-security` — PASS (source gate, not live signed-in role verification).
- `npm run build` — PASS.
- Focused ESLint — PASS.
- Playwright selection: `e2e/directory-governance.spec.mjs`, `directory-auth-header`, `directory-dual-mode`, `directory-search-map` — 10/10 PASS after repairing the Sidebar missing import. These tests use synthetic/mocked sessions for protected paths.
- `node scripts/kotcAccessArchitectureGate.mjs` — PASS (140 checks).
- `node scripts/memberGuestBookingGate.mjs` — PASS.
- `node scripts/clubChallengeGate1.mjs` — PASS.
- `communicationsCoreGate`, `communicationsDeliveryGate`, `communicationsDomainGate`, `communicationsActivationGate`, `communicationsRendererGate`, `visualEmailProductionProtocolGate` — ALL PASS. All ran without sending communications.

## Release and acceptance gates still outstanding
1. **Approved production release:** New schemas `DirectoryCampaign`, `DirectorySuppression`, `DirectoryIdentityLink`, `DirectoryGovernanceAudit`, new `directoryGovernance` backend and updated `directoryPlayerNetwork` function are SANDBOX ONLY. Push schema first with permissions readback; then targeted backend deployment; finally owner-published frontend, with backup/rollback. Not authorised under this task.
2. **Actual authenticated enforcement:** Positive Brian and Conall signed-in test sessions and negative other-platform-admin, tenant admin, listing owner, guest/member and anonymous backend tests; test direct entity RLS. Mock tests do not substitute for this.
3. **Real live workflows:** read/save/reload enquiry follow-up; actual consent withdrawal and re-subscribe using dedicated test identities; campaign content approval; actual trusted transport test to owner-controlled test address (requires explicit permission to send); retries/failures/opt-out/delivery receipts; email provider acceptance is not delivery confirmation.
4. **GA4 and Search Console evidence:** Verify property/site selection, permission scopes, actual Directory conversion event ingestion, consent compliance, URL/referrer and UTMs, dashboard versus provider reconciliation and source counts. Connection status only verified.
5. **Real portable extraction:** All 22 Directory schemas readback, source-record inventory, actual cursor export, count and relationship reconciliation, secure handling and restoration into an independent disposable environment, and external adapter replacement/reissue rehearsal. Synthetic dry run PASS does not satisfy this.
6. **Other Phase 1 acceptance:** Verify coach/supplier/holiday approval and bulk actions against governing spec, mobile/tablet accessibility and performance, audit-event history/retention and data lifecycle, social provider connections only if explicitly approved, and operational recovery procedures.

## Safety guarantees
No new production entity/configuration changes, backend deployments, frontend publication, customer emails, tenant record updates or social publishing were performed in this sandbox completion pass. Campaign send remains disabled; identity link is proposal-only; archive is read-only and redacts bearer/secret credentials. A test environment signed in via mocked sessions cannot demonstrate a live account has been granted or denied permission.
