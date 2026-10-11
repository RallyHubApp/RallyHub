# RallyHub media automation — full development execution record (2026-10-11)

## Authority and scope
No Base44 AI Builder. No live receiver upload, production record changes, deployment, publication or live asset assignment. Existing receiver unchanged. Development files committed and checkpointed only.

## Source inspection
Inspected `base44/functions/universalAssetIntake/entry.ts` (80 lines), existing sender and development checkpoint. The receiver accepts authenticated platform-only machine transfers with a matching SHA-256, stores bytes and performs a server-side readback. Existing test `scripts/testUniversalAssetIntake.mjs` is not a full network acceptance test.

## Implemented
- `scripts/media-automation/verified-sender.mjs`: direct sender, restricted HTTPS storage readback, checksums, receipt validation.
- `scripts/media-automation/verified-sender.test.mjs`: 12 isolated tests.
- `scripts/media-automation/receipt-store.mjs`: filesystem durable receipt, atomic file replacement and exclusive approval lock.
- `scripts/media-automation/approval-workflow.mjs`: approval-bound orchestration with injected artifact, token and receipt providers.
- `scripts/media-automation/approval-workflow.test.mjs`: 7 isolated tests.
- Run: `node --test scripts/media-automation/*.test.mjs`.
- Actual result: **19 passed, 0 failed**, with mocked network and temporary filesystem. This is NOT a live end-to-end test.

## ChatGPT transport investigation
The current conversation can inspect and modify authorised Base44 source, and has a connected Google Drive integration. Google Drive offers a file-reference upload action; this does **not** prove that an ImageGen/ChatGPT artwork approval exposes an automatic transferable original-byte reference. No supported native approval-event subscription, secret-bearing bridge or automatic original-byte retrieval was demonstrated. The Node modules deliberately require injected `artifactProvider.getBytes(artifactId)` and `tokenProvider.getToken()` rather than guessing undocumented APIs.

### Candidate paths
1. **Preferred:** ChatGPT runtime connector returns a transferable original artifact file reference, and a trusted integration forwards original bytes to a credential-protected sender; prove with a newly approved synthetic artifact.
2. **Fallback:** Connected Google Drive receives a runtime-supported file reference, then a dedicated worker obtains the file using scoped OAuth and stages through the sender; prove byte identity and automatic approval binding. Existing `drive_upload.py` is a separate historic script, not the finished automation.
3. **Alternative:** A dedicated webhook/queue and object store can accept a signed approval-bound transfer from a supported ChatGPT client or service. This requires a real producer; a webhook alone cannot pull arbitrary private ChatGPT artwork.

Do not assert any candidate is implemented without a supported connector and real transfer evidence.

## Security findings and remaining engineering
- **Important:** filesystem receipt locks protect a single shared filesystem, not a multi-host distributed service. Stale locks after crashes need recovery policy; use a transactional database with unique (approvalId,digest) key and leases before distributed use.
- A lost response after the server uploaded but before the client saved its receipt can lead to duplicate uploads. Durable *receiver-side* idempotency or a reconciliation API is needed to guarantee exactly-once staging.
- Existing receiver readback follows redirects automatically and only checks final HTTPS, not each redirect host. Harden in a reviewed patch before deployment.
- The current sender does not independently inspect file signatures (receiver does), enforce image decompression limits, or retry transient failures.
- Source-host allowlisting, SSRF tests, credential rotation, request size and timeout tests, tenant isolation tests and actual credential authentication tests require expansion.
- Sender `scope` is intentionally platform-only; tenant/directory workflows need separate authorisation and must not reuse a platform service token.
- Local receipt store is a development implementation; no permanent hosted service or secret manager is provisioned.

## Exact acceptance path
1. Identify a **documented supported** runtime action that exposes original bytes of a user-approved ChatGPT image, or a file reference that a connected uploader can actually consume. Verify with a disposable artifact. If none exists, choose an external authorised approval client and acknowledge that native one-click ChatGPT approval is unavailable.
2. Provision an isolated integration runner with secure secret injection, network access to the existing intake endpoint, durable job queue and receipt database. Keep it out of production until release approval.
3. Bind approval ID, immutable artifact ID, SHA-256, name, scope and expiry in an authenticated job record. Verify user identity and explicit approval event.
4. Implement transactional unique-key idempotency and crash recovery; use server-side reconciliation to handle ambiguous POST outcomes.
5. Add runtime adapter for original-byte retrieval, validate signature and size, invoke `processApprovedArtifact` through the trusted runner and verify readback.
6. Run comprehensive unit/security/regression tests, including redirects, SSRF, credentials, tenant scope, concurrency, failure injection and stale-lock recovery.
7. Obtain **specific approval for one new non-production backend staging upload**, with no publication. Execute actual ChatGPT-approved artifact → transport → receiver → storage readback and record hashes, timestamps, receipt and exact steps.
8. Only after a verified E2E PASS, request separate authorisation for production deployment and monitoring.

## Test status
- Isolated sender and workflow tests: **PASS 19/19**.
- ChatGPT artifact retrieval: **BLOCKED / NOT VERIFIED**.
- Connected Drive artifact relay: **NOT RUN**.
- Distributed idempotency: **NOT IMPLEMENTED**.
- Real backend E2E: **NOT RUN**, no upload authorised.
- Security full suite: **PARTIAL**.
- Operational deployment: **NOT RUN**, prohibited without authorisation.

## Release gates
No live upload, publish, deployment, or modification of production records until separately authorised. Never substitute a mocked PASS for a real integration PASS.
