# Directory Phase 1 — Security Migration Verification

**Status (24 October 2026): SOURCE AND BASE44 SCHEMA READBACK PASS; AUTHENTICATED ENFORCEMENT / RELEASE ACCEPTANCE PENDING.**

## Verified implementation
- Two independently verified immutable Base44 admin identities constitute the Directory super-admin backend allowlist. General platform-admin status alone does not grant Directory access.
- The original 17 `Directory*` entity schemas deny direct SDK create/update/delete; all deny direct read except `DirectoryListingAccess`, which allows read only where `data.user_id == {{user.id}}`.
- Read-only Base44 `list_entity_schemas` previously returned these exact RLS policies across the original 17 entities, with no nonconforming schemas. This confirms schema readback, **not** session-level enforcement or deployment/publish status.
- Backend service-role functions check their own Directory ownership or super-admin permissions; the Directory UI uses a server-side capability probe. Directory artwork staging also uses the restricted Directory super-admin guard or a separately verified staging service token.
- `npm run gate:directory-security` now passes as a **source-level prerequisite**; `npm run test:directory` passes. Neither substitutes for signed-in negative-role acceptance.

## Known outstanding acceptance checks
1. Exercise direct entity reads and writes with authenticated Brian, Conall, the third generic platform-admin account, a listing owner, another ordinary user and anonymous session. Verify that broad admin reads are denied while the owner sees only their own access row.
2. Verify that Directory protected backend admin calls succeed for both approved accounts and reject the generic admin, and that listing owner edits stay confined to their verified listing.
3. Verify Directory contact forwarding with a mocked mail transport (no external sends), registration/no-membership creation and separated tenant Spond finance flows with test records.
4. Confirm frontend publication and any function deployment independently. A source checkpoint and schema readback are not verification of either.
5. Perform end-to-end browser checks and Directory portability/extraction rehearsal before final Phase 1 sign-off.

## Supporting contracts
- `base44/shared/directorySuperAdmin.ts`: immutable two-account check.
- `base44/shared/directoryRlsPolicy.ts` and `directoryRlsMigration.ts`: service-only access policy and pure migration plan.
- `testing/directory/directoryRlsAudit.test.mjs`: entity policy audit.
- `testing/directory/directorySecurityAcceptance.mjs`: source release gate.

**Production records, emails, external Spond access and frontend publication were not modified by this verification task.**

## 25 October 2026 — Directory enquiry inbox extension (sandbox only)
- New local `DirectoryEnquiryFollowup` schema is the 18th Directory entity; its direct CRUD RLS denies all actors. It has **not** been pushed to Base44; do not claim platform schema readback for it.
- `directoryContactAction` adds two Directory-superadmin-only service routes: `admin_inbox` and `admin_set_followup`. This backend has **not** been deployed for this change.
- `AdminPanel` People & CRM now displays enquiry content, delivery transport status, contact-action logs, and editable follow-up status/internal notes. Updated frontend is **not published**.
- Source-level tests and build are prerequisites only; logged-in Brian/Conall and negative-role testing, entity push/readback, browser smoke, extraction rehearsal and go-live acceptance remain pending.
