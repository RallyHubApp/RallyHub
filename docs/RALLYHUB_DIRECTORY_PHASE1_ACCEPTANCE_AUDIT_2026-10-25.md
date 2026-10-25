# RallyHub Directory Command Centre — Phase 1 acceptance audit
Date: 25 October 2026
Governing source: Directory Command Centre Phase 1 Master Specification v1.0 (24 October 2026).
Classification: READ-ONLY verification and source audit; no sign-off or production change authority.

## Proven checks
- `npm run test:directory`: 71/71 PASS.
- `npm run gate:directory-security`: PASS source-level only; explicitly does not prove authenticated negative roles.
- `npx playwright test e2e/directory-auth-header.spec.mjs e2e/directory-search-map.spec.mjs e2e/directory-dual-mode.spec.mjs`: 8/8 PASS after Chromium installation; tested local web app with mocked session where specified, not live authenticated acceptance.
- Vite production build: PASS on 25 October 2026 in preceding acceptance run.
- Targeted ESLint for AdminPanel and Sidebar: PASS.
- `node scripts/kotcAccessArchitectureGate.mjs`: PASS (140 checks).
- `node scripts/memberGuestBookingGate.mjs`: PASS.
- `node scripts/clubChallengeGate1.mjs`: PASS.
- `npm run typecheck`: FAIL, 491 TypeScript diagnostics. Examples: `TS5097` .ts import-extension configuration and Leaflet/node typings. Do not imply these are all Directory issues; baseline root causes need triage.

## Phase 1 specification traceability
| Requirement | Evidence / current classification |
|---|---|
| Domain boundary and two-identity super-admin policy | Directory-specific backend and restricted RLS schemas; source gate PASS; authenticated role-matrix acceptance PENDING |
| Overview and Directory-only navigation | Implemented in AdminPanel/Sidebar; counts and alerts source implemented; full signed-in and mobile walkthrough PENDING |
| Listings/providers, claims, owner/editor access | Core screens/functions/entities implemented; browser mocked-editor tests PASS; full role and migration tests PENDING; completeness of supplier/holiday/provider bulk actions NOT VERIFIED |
| People/audience CRM | Verified owners and opted-in players displayed via distinct Directory sources; segmentation, deduplication, provenance and explicit cross-domain linking contract NOT DEMONSTRATED |
| Enquiry capture, forwarding and follow-up | DirectoryContactEnquiry/Action/EnquiryFollowup and dedicated `directoryEnquiryAdmin` backend exist; anonymous 403 verified earlier; signed-in create/edit/read-back and mail-provider acceptance FAILED/RETRY cases NOT END-TO-END VERIFIED |
| Activity terminology | Label 'Contact clicks (delivery not confirmed)' and distinct submitted-enquiry counter in source; tests PASS; current live frontend publication NOT VERIFIED |
| Marketing/social | No DirectoryCampaign entity/function identified; campaigns, approval, UTMs, attribution and social APIs require implementation or verification; NOT COMPLETE |
| Communications | Existing platform templates/transports; separate Directory campaign preview, opt-out, retry, recipient eligibility and delivery-log workflow not acceptance-tested; NOT COMPLETE |
| Analytics | `siteAnalytics` and DirectoryAnalyticsDashboard sources exist; real GA4/Search Console connection, attributed conversions, sample controls and provider reconciliation NOT VERIFIED |
| Independent Directory export and future portability | No complete Directory extraction tool/package located in scoped function inventory; migration rehearsal, adapter dependency report, restoration test NOT COMPLETE |
| Consent & cross-domain isolation | Source-level entity segregation and tenant gates PASS; real consent withdrawals/retention/deletions and cross-domain negative cases NOT TESTED |
| Technical acceptance | 71 unit tests, eight selected Playwright tests and supporting gates PASS; full typecheck FAIL; accessibility, multi-device load/performance, comprehensive workflow tests NOT COMPLETE |
| Release/rollback and operational sign-off | Checkpoints exist; comprehensive data backup/restore, authenticated smoke evidence, approval register and signed closure NOT COMPLETE |

## Next release gates, in order
1. Triage 491 typecheck diagnostics and remediate without sporting regressions.
2. Implement / document actual Directory campaign, segmentation/consent and explicit identity-link contracts, or formally rescope the master specification through owner approval.
3. Implement complete Directory export / dependency inventory and prove extraction/restore in sandbox.
4. Run authenticated Brian/Conall positive tests, other admin/owner/player/anonymous negative tests, persisted enquiry notes and consent isolation; use authorised test sessions, no customer sends.
5. Verify safe email transport, marketing and analytics connections using test recipients / sandbox credentials, with failures recorded accurately.
6. Run full browser UX, mobile/accessibility/performance and data reconciliation against authoritative source records; review and sign acceptance evidence.
7. Only then request specific production deployment/publication approval as required; no automatic production changes.

Result: PHASE 1 NOT SIGNED OFF. Core Directory CRM/UI functional baseline is substantially implemented, but product-scope and acceptance gaps are real.
