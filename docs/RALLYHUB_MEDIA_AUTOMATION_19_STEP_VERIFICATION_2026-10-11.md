# RallyHub Universal Media Automation — 19-step engineering verification (2026-10-11)

**Scope:** Non-deployed repository development and isolated testing only. No Base44 AI Builder, production changes, new uploads or publication.

## Evidence
- Read current receiver and sender sources and existing control documents.
- `node --check` on three new runtime modules: passed.
- `node --test scripts/media-automation/*.test.mjs`: **34 tests passed, 0 failed**. Mocked network only; NOT a live transfer.
- 15 new edge/security tests in `security-edge.test.mjs` extend 19 previously passing tests.
- Existing receiver remains unchanged.

## Nineteen development verification steps

| # | Check | Result | Evidence / next action |
|---|---|---|---|
| 1 | Authoritative repository source located | PASS | `base44/functions/universalAssetIntake/entry.ts` read |
| 2 | Existing receiver authentication examined | REVIEWED | Service secret and user authentication paths found; real auth not exercised |
| 3 | Original legacy sender recovered | BLOCKED | `verified-sender.mjs` from Windows not found in repo; new replacement exists |
| 4 | Reusable sender implemented | PASS | `scripts/media-automation/verified-sender.mjs` |
| 5 | Original-byte digest binding | PASS ISOLATED | Approval digest validated before POST |
| 6 | Receiver receipt/readback verification | PASS ISOLATED | Mocked receipt plus independent GET |
| 7 | Restricted redirect and credential isolation | PASS ISOLATED | Manual GET redirect; no auth forwarded |
| 8 | Explicit approval-bound job | PASS ISOLATED | `approval-workflow.mjs` requires approved status and digest |
| 9 | Durable local receipt | PASS ISOLATED | `receipt-store.mjs` writes fsynced temp then rename |
| 10 | Duplicate handling and simultaneous lock | PARTIAL | Single shared filesystem only; stale lock and distributed workers unresolved |
| 11 | Source retrieval provider | INTERFACE READY | Injected `artifactProvider.getBytes`; no real ChatGPT adapter |
| 12 | Secure token provider | INTERFACE READY | Injected `tokenProvider.getToken`; no hosted secrets integration |
| 13 | ChatGPT native transport discovery | BLOCKED | No verified automatic approval event or original-byte handoff |
| 14 | Connected Drive fallback assessed | ASSESSED | Drive plugin exists; no verified automatic generated-artifact transfer |
| 15 | Dedicated worker/queue alternative | DESIGNED ONLY | Needs hosted environment, durable DB and authenticated producer |
| 16 | Expanded edge/security tests | PASS ISOLATED | 34/34 tests, includes 401, 429, size, redirects, source credentials |
| 17 | Recovery/operational hardening | PARTIAL | No retry, lease expiry, receiver-side idempotency or reconciliation |
| 18 | Real non-production end-to-end acceptance | NOT RUN | Needs explicit approval for real backend upload and proven artifact source |
| 19 | Documentation/recovery and release gates | PASS DOCUMENTED | This report plus checkpoint; no deployment performed |

## Important findings
1. **No native one-approval claim:** An explicit approval object can be processed, but ChatGPT has not been shown to emit that object to the worker with original bytes. A prompt cannot manufacture an integration.
2. **Receiver security review:** Existing receiver's storage GET uses `redirect:'follow'` and verifies only the final HTTPS scheme. Before production release, constrain each redirect host (base44.app -> media.base44.com) and reject additional redirects.
3. **Current sender gap:** No client-side magic-byte validation; existing receiver validates format. Sender accepts a Buffer of any content within size and hash limits. Add sender validation for defence in depth.
4. **Atomicity caveat:** File receipts are crash-durable on local disk, but locks can become stale; multi-worker exactly-once requires a transactional store plus receiver idempotency.
5. **Timeout caveat:** AbortSignal timeout is supplied but mocked tests cannot prove real network behaviour.
6. **Credential boundary:** No real credentials were inspected, printed or used in this test run.

## Exact executable remaining plan (in dependency order)
**A. Transport capability proof.** Obtain a disposable ChatGPT-generated asset with an actual transferable file reference. Test the connected Drive `upload_file` path with that runtime file reference, then verify Drive download returns byte-identical SHA-256. If the reference cannot be transferred, use an authorised custom integration that exposes a supported artifact file handle. Do not assume private ChatGPT artifacts have public URLs.

**B. Non-production runner.** Provision a secure integration worker with outbound HTTPS, a secret manager, isolated staging credentials, and transactional job/receipt storage. Implement `artifactProvider.getBytes` and `tokenProvider.getToken` against verified APIs. No user-managed Windows or manual uploads.

**C. Harden the receiver.** Prepare reviewed backend patch: allowlisted manual readback redirect, bounded streaming size, explicit timeout, request-level approval/idempotency key, and a reconciliation endpoint or status lookup. Require separate approval before modifying/deploying the live receiver.

**D. Resilience and full security.** Add sender magic-byte checks, 429/5xx bounded retry, lease-based job claims, stale lock recovery, cross-worker concurrency tests, lost-response reconciliation, malicious source URL/SSRF tests, tenant isolation, key rotation, and security logging redaction. Test with an isolated receiver simulator before deployment.

**E. Real acceptance gate.** Request one specific non-production staging upload approval (no publication). Use a newly approved image, calculate original SHA-256, run real ChatGPT-to-worker-to-receiver transfer, independently GET stored file, verify hash/bytes and receipt, then repeat to prove idempotency.

**F. Release gate.** After documented genuine PASS, separately request deployment/production approval. No automatic publication.

## Interpretation
19 steps **reviewed**, not 19 fully implemented or 19 production acceptance passes. Only isolated tests have passed. Stop making claims of completed automation until A-E are demonstrated.
