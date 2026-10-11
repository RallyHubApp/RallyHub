# RallyHub ChatGPT Transport Integration Report

**Date:** 11 October 2026  
**App ID:** `6a01dc00702b7dd2a2978c28`  
**Scope:** One controlled Base44 Builder investigation for ChatGPT-to-RallyHub artwork transfer automation.  
**Deployment status:** Not deployed. No production records changed. No live artwork replaced. No new live backend upload performed.

## 1. Executive finding

The existing RallyHub receiver and repository-side sender/workflow are already sufficient for authenticated byte staging once original approved bytes are available to the trusted runner. The missing integration is still the upstream producer: this Builder environment does not expose a supported ChatGPT approval event, ChatGPT artifact API, or transferable original-byte file reference that can satisfy `artifactProvider.getBytes(approval.artifactId)`.

Because the ChatGPT-side original-byte interface could not be established from a documented or available supported mechanism, no new production code path was added and no upload was attempted. A webhook alone would not solve this because it would still lack authority to retrieve private ChatGPT artwork bytes.

**E2E status:** **BLOCKED / NOT PASSED**. A genuine pass still requires a ChatGPT-originated approved file to reach RallyHub staging automatically, with independent SHA-256 readback matching the original bytes.

## 2. Files and evidence inspected

### Required control documents
- `docs/RALLYHUB_UNIVERSAL_MEDIA_PIPELINE_CONTROL_2026-10-11.md`
- `docs/RALLYHUB_SOFTWARE_CONTROL_MASTER.md`
- `docs/RALLYHUB_MEDIA_AUTOMATION_FULL_EXECUTION_REPORT_2026-10-11.md`
- `docs/RALLYHUB_MEDIA_AUTOMATION_19_STEP_VERIFICATION_2026-10-11.md`
- `docs/RALLYHUB_MEDIA_AUTOMATION_DEVELOPMENT_CHECKPOINT_2026-10-11.md`

### Receiver and automation modules
- `base44/functions/universalAssetIntake/entry.ts`
- `scripts/media-automation/verified-sender.mjs`
- `scripts/media-automation/approval-workflow.mjs`
- `scripts/media-automation/receipt-store.mjs`
- `scripts/media-automation/mounted-artifact-provider.mjs`
- `scripts/media-automation/verified-sender.test.mjs`
- `scripts/media-automation/approval-workflow.test.mjs`
- `scripts/media-automation/mounted-artifact-provider.test.mjs`
- `scripts/media-automation/security-edge.test.mjs`
- `scripts/testUniversalAssetIntake.mjs`

### Existing uploader and media flows
- `src/pages/AdminPanel.jsx` RallyHub Asset Uploader
- `base44/functions/secureCreditAction/entry.ts`
- `src/pages/DirectoryListingEdit.jsx` directory logo handling
- `src/components/events/EventMediaEditor.jsx`
- `base44/functions/eventPosterDiscover/entry.ts`
- `base44/functions/eventPosterIngest/entry.ts`
- `e2e/admin-asset-uploader.spec.mjs`
- `base44/entities/SiteAsset.jsonc`

## 3. Existing RallyHub receiver findings

`universalAssetIntake` is the canonical receiver and was not duplicated or redesigned. It currently:

- accepts authenticated `multipart/form-data`, `dataBase64`, or approved HTTPS `sourceUrl` input;
- enforces a 12,000,000 byte limit;
- validates PNG, PDF, WEBP, JPEG and GIF signatures;
- computes SHA-256 server-side;
- requires service-token platform staging transfers to include an approved SHA-256;
- restricts the service key to platform scope only;
- separately checks tenant and directory access for authenticated non-service user transfers;
- stores through Base44 file storage;
- downloads the stored file and verifies SHA-256 before returning a staged receipt;
- returns a staged URL only and does not publish, assign, or replace any live asset.

Known receiver hardening still required before production unattended use:

- storage readback currently uses `redirect:'follow'` and verifies final HTTPS, while the sender already has stricter base44.app to media.base44.com redirect handling;
- receiver-side idempotency and reconciliation are not yet implemented;
- no hosted job database exists for approval ID, digest, source reference and status reconciliation;
- the function is a receiver, not an artifact producer, so it cannot pull private ChatGPT bytes by itself.

## 4. Existing sender and workflow findings

The repository automation already provides the right integration seam:

- `verified-sender.mjs` posts approved bytes to the existing receiver, blocks POST redirects, checks returned receipt fields, performs independent storage readback, follows only the approved Base44 storage redirect, and stores a receipt if a receipt store is supplied.
- `approval-workflow.mjs` requires an explicit approved platform artifact object with immutable approval ID, artifact ID, SHA-256, name and scope before calling `artifactProvider.getBytes(approval.artifactId)`.
- `receipt-store.mjs` provides a local filesystem development receipt store and single-host lock, but it is not a distributed production idempotency system.
- `mounted-artifact-provider.mjs` proves only that a file already mounted in an authorised runtime can be read safely. It does **not** prove Base44 Builder can see ChatGPT mounts or retrieve native ChatGPT image artifacts.

No code change was made to these modules in this attempt because the missing piece is not inside RallyHub's receiver or sender. The missing piece is a supported ChatGPT-side artifact byte handoff.

## 5. Manual uploader findings

### Admin Asset Uploader

The Admin Panel asset uploader is a manual, authenticated browser flow:

- validates PNG, JPG, WEBP or PDF up to 20 MB client-side;
- uploads via Base44's browser `Core.UploadFile` integration;
- upserts a `SiteAsset` record by admin-only RLS key;
- shows visible upload feedback and the stored URL;
- is covered by `e2e/admin-asset-uploader.spec.mjs` with mocked upload and entity calls.

This is useful for approved production artwork and PDF guides, but it is explicitly manual and stores a reusable `SiteAsset` record. It is not the requested ChatGPT approval-to-staging automation.

### secureCreditAction media upload path

`secureCreditAction` supports controlled user uploads for directory logos, profile avatars, event posters, club challenge logos and site assets. It enforces user permissions and per-action credit guards, then calls Base44 storage. This path is for authenticated app users and UI uploads, not ChatGPT-originated approved bytes.

## 6. Munster / directory media handling findings

The directory editor's logo upload flow in `DirectoryListingEdit.jsx` is a user-controlled directory media flow:

- the browser loads the chosen logo image;
- it renders the logo into an 800 x 800 white WebP canvas to standardise directory presentation;
- it invokes `secureCreditAction` with `purpose:'directory_logo'` and the `listingSlug`;
- directory access is checked server-side;
- the returned URL is saved only after the directory editor saves the listing.

This is reusable as a pattern for tenant/listing permission boundaries and clear manual save semantics. It is **not** reusable for original-byte ChatGPT artwork staging because it intentionally transforms the image through canvas and WebP conversion, which would break original-byte SHA-256 identity.

The event poster flow is closer to the desired original-byte principle for trusted public sources:

- `EventMediaEditor.jsx` can discover organiser event poster URLs and call `eventPosterIngest`;
- `eventPosterDiscover` allows only approved organiser domains;
- `eventPosterIngest` fetches the source, validates dimensions and SHA-256, uploads, then reads back storage bytes;
- it can verify without changing the event artwork when running live poster verification.

This confirms the preferred architecture for media integrity: approved source, byte retrieval, SHA-256, storage readback, staged result. It still does not provide ChatGPT private-artifact access.

## 7. ChatGPT artifact interface investigation

A supported native ChatGPT-to-RallyHub producer was **not found** in this controlled attempt.

Not proven or available here:

- no documented ChatGPT approval webhook that emits original image bytes to this app;
- no supported ChatGPT artifact API token or file-reference API exposed to this Builder session;
- no connector in the current app connector list for ChatGPT artifact retrieval;
- no authorised client action that can pass a private generated image's original bytes directly into `artifactProvider.getBytes`;
- no proof that Base44 can mount or read ChatGPT conversation files;
- no safe private URL to invent or fetch.

The existing `mountedArtifactProvider` remains intentionally limited: it can read `mounted:<path>` only when a trusted runtime has already mounted the original file. That does not establish a native ChatGPT approval-to-Base44 interface.

## 8. Architecture retained

The smallest safe architecture remains:

1. **Producer:** a real supported ChatGPT-side or external approval client produces an immutable approval record and original bytes or a documented transferable file reference.
2. **Trusted runner:** a hosted worker with secret injection, outbound HTTPS, durable queue and transactional receipt database receives only approved jobs.
3. **Artifact provider:** `artifactProvider.getBytes(approval.artifactId)` retrieves the exact approved original bytes from the supported producer.
4. **Digest binding:** the runner computes SHA-256 and checks it against the immutable approval digest before transfer.
5. **Sender:** `stageApprovedAsset` posts to `universalAssetIntake` with the service token and expected digest.
6. **Receiver:** `universalAssetIntake` validates signature, scope, size, SHA-256, stores bytes, and verifies storage readback.
7. **Independent readback:** sender downloads the staged file and verifies SHA-256 again.
8. **Durable receipt:** approval ID, artifact ID/source reference, digest, byte count, staged URL, status and verification timestamps are stored transactionally.

No step publishes or replaces live artwork.

## 9. Security, idempotency and isolation status

Preserved in the existing design:

- immutable approval ID and digest binding in `approval-workflow.mjs`;
- service-token platform staging only;
- no tenant/directory staging through the platform service key;
- 12,000,000 byte receiver limit;
- signature inspection in the receiver;
- independent readback in receiver and sender;
- restricted sender-side Base44 storage redirect handling;
- local receipt lookup to avoid repeating a completed approval transfer in single-host development use.

Not production-complete:

- no real ChatGPT producer;
- no hosted runner;
- no distributed receipt database;
- no receiver-side idempotency key or status lookup;
- no lost-response reconciliation;
- no retry policy implemented in the sender;
- no live credential authentication test run in this attempt;
- no tenant-bound ChatGPT media flow implemented.

## 10. Actual tests in this attempt

### Performed

- Source inspection of required control documents, receiver, sender, workflow, receipt store, mounted provider, tests, manual uploader, directory media handling and event poster ingestion.
- Syntax-only checks passed for:
  - `scripts/media-automation/verified-sender.mjs`
  - `scripts/media-automation/approval-workflow.mjs`
  - `scripts/media-automation/receipt-store.mjs`
  - `scripts/media-automation/mounted-artifact-provider.mjs`
  - `scripts/media-automation/verified-sender.test.mjs`
  - `scripts/media-automation/approval-workflow.test.mjs`
  - `scripts/media-automation/mounted-artifact-provider.test.mjs`
  - `scripts/media-automation/security-edge.test.mjs`
  - `scripts/testUniversalAssetIntake.mjs`

### Attempted but not completed in this environment

- `node --test scripts/media-automation/*.test.mjs`
- `node scripts/testUniversalAssetIntake.mjs`

The platform blocked direct JavaScript execution from the available shell in this Builder environment and directed JavaScript execution to a sandbox that cannot import these local ESM files. Therefore the historical 34/34 isolated test pass remains prior evidence, but those tests were **not rerun** in this attempt.

### Not performed

- No live backend upload.
- No re-upload of the historical logo files.
- No production record mutation.
- No Drive relay test.
- No ChatGPT-originated live artifact transfer.
- No deployment or publication.

## 11. E2E acceptance status

| Gate | Status | Notes |
|---|---|---|
| Existing receiver accepts verified bytes | Previously proven | Historical two-logo proof remains valid; not repeated. |
| Repository sender validates receipt/readback | Previously isolated-pass | Syntax checked now; historical 34/34 tests not rerun here. |
| ChatGPT approved artifact bytes available to runner | **Blocked** | No supported interface found in this Builder attempt. |
| Automatic ChatGPT-to-RallyHub staging | **Not passed** | Missing upstream byte producer. |
| Independent SHA-256 readback | Architecture present | Requires real producer and approved test upload to prove end-to-end. |
| Live artwork replacement | Not authorised | Correctly not performed. |

## 12. Remaining approvals and exact next action

### Required next approval

Approve one of the following, in order of preference:

1. **Provide a documented supported ChatGPT artifact/file-reference interface** that exposes original approved image bytes to an authorised runner. Then wire that exact interface into `artifactProvider.getBytes` and run a disposable non-production E2E test.
2. **Approve a minimal trusted external worker/prototype** with secure secret injection, durable job storage and a real supported producer that can receive the original file bytes from ChatGPT or a documented client action.
3. **Approve a Drive fallback proof only if direct artifact handoff is unavailable**, using a real automatic producer-to-Drive file reference, not a manual download or user-managed local folder.

### Exact next action

Obtain a disposable newly generated ChatGPT image and a **documented transferable original-byte handle** from the ChatGPT side. If that handle exists, implement only the corresponding `artifactProvider.getBytes` adapter and run one authorised non-production staging upload. If no handle exists, stop and select the external worker or Drive fallback architecture explicitly.

## 13. Files changed in this attempt

- Added `docs/RALLYHUB_CHATGPT_TRANSPORT_INTEGRATION_REPORT.md`.
- Updated `docs/RALLYHUB_SOFTWARE_CONTROL_MASTER.md` to reference this blocker report.
- Updated `docs/RALLYHUB_MEDIA_AUTOMATION_DEVELOPMENT_CHECKPOINT_2026-10-11.md` with this controlled attempt checkpoint.

No application code, backend receiver code, sender code, entity schema, production data, or live artwork was changed.