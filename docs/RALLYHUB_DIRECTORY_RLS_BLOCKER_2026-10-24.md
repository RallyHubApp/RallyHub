# Directory Phase 1 — Direct Entity RLS Access Blocker

**Status: OPEN / SECURITY GATE BLOCKED.** Code checkpointing does not make current entity RLS safe.

Read-only schema inspection on 24 October 2026 found generic `user_condition.role = admin` in the row-level security policy of **all 17** `Directory*` schemas. These permissions are independent from the narrower `authorisedDirectorySuperAdmin` checks now implemented in Directory backend functions. A generic platform administrator with direct entity access may therefore bypass the intended two-account Directory domain governance.

**Do not mark security acceptance as passed or deploy the Directory Command Centre until resolved.**

A safe migration requires both actual immutable Base44 User IDs for Brian and Conal and verification that Base44's schema RLS supports filtering on those identities in `user_condition`. Denying direct client access in favour of service-role backend functions is an alternative only after checking every Directory client access, function dependency, and schema API permission. Do not substitute broad `admin` privileges, names, emails, or fabricated IDs. The backend's secret values are still unconfigured/unverified in this development package.

**Scope of next security package:** (1) verify Base44's supported immutable-ID RLS condition contract, (2) inventory direct client calls, (3) select least-privilege policy for each schema, (4) implement in code and test direct reads/writes as both approved and unapproved admin, owner, guest and anonymous actors, (5) validate `DirectoryListingAccess` row ownership and audit integrity, (6) only then authorise any production schema deployment.

No live records or schema deployments were changed during this audit.

## Release automation
- `npm run test:directory` runs focused Directory tests; a passing unit-test result does **not** imply security acceptance.
- `npm run gate:directory-security` is deliberately **failing** while generic-admin RLS remains and approved identity IDs are not independently verified. Release automation must require this gate and authenticated negative tests to pass.
- Base44 API security verification currently prompts for new device authentication and could not be completed from the existing sandbox session; no account IDs or backend secrets were changed.
