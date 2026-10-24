# Directory and Tenant Spond Separation — Owner Decision

**Decision:** Keep Directory organiser Spond integrations and tenant club Spond/finance/guest integrations independently governed. Reuse tested algorithmic logic when safe, but do not grant one domain administrative or consent rights over the other. Duplicate small adapters if it reduces coupling and security risk. This document is a development decision, not live deployment approval.

## Current source changes
- The tenant Finance Summary now reads selected Spond group IDs from `SpondSessionBinding` and tenant `ClubFinanceVenueRule` data, rather than directly reading `DirectorySpondConnection`.
- Saving Finance recurring-session assignments now updates tenant finance rules only; it no longer calls the Directory's `directory_save_connection` mutation.
- Guest/member session lookup now prefers the tenant's own `SpondSessionBinding` group ID. A **read-only legacy fallback** to Directory Spond connection remains for older tenants with no group binding; this fallback is temporary compatibility, not complete decoupling.
- Neither ordinary public event registration nor guest participation creates tenant membership. Guest-to-member conversion uses the separate approved membership and payment journey.

## Remaining separation work (not completed)
- Tenant Finance Spond preview/sync now calls a separate `tenantSpondFinance` backend, with authenticated tenant/club scoping, bound-group validation before external login, and preserved pure matching/payment algorithms. The old `directory_finance_preview` and `directory_finance_sync` handlers still exist in `spondIntegrationWorking` for compatibility; they must be retired only after the independent route is deployed and authenticated acceptance tests pass. No production API calls were run.
- Existing Spond identity and guest session code still uses a legacy Directory Spond connection fallback. Migrate historical club bindings and verify invitation results before removing the fallback.
- The Directory organiser's Spond connection retains its own listing-editor permissions. The generic-admin exception in `spondIntegrationWorking.directoryAccessAllowed` still needs tightening as part of the secure route split.
- Do not modify, disconnect, duplicate or migrate production Spond credentials, groups or finance records without independent operational tests and rollback.

## Acceptance gates
1. Directory Spond actions cannot view or change tenant finance records except through an expressly authorised bridge.
2. Tenant finance and guest-session actions cannot alter Directory Spond connection or listing-owner rights.
3. Existing bound club sessions, member invitation filtering, pricing and financial reconciliation continue to work.
4. Public guest/organiser participation does not create memberships or duplicate people.
5. Both workflows pass isolated-role tests and backend integration tests before any production release.

## Test evidence
`testing/directory/directoryFinanceIsolation.test.mjs` and `directoryGuestSpondBoundary.test.mjs` cover source boundaries, not live Spond API responses. Broader member/guest gate currently fails on the pre-existing experienced-guest previous-sports assertion; this must be investigated separately, not claimed as fixed.

## Regression update
The existing member/guest test gate failed because two source-string assertions were stale: experienced guests now reset previous-sport fields using a conditional object spread, and beginner venue guidance now includes Clarecastle and Shannon. The test assertions were updated to match inspected behaviour; no production guest form was changed. Afterward the member/guest booking gate passed. Tenant finance route source-contract checks and Directory tests passed; live Spond API/tenant-authenticated acceptance is still pending.
