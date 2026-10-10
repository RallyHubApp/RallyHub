# RallyHub Universal Media Pipeline — Control Handover v1.0
**Date:** 11 October 2026  
**Status:** Proven manual-code transfer; ChatGPT-triggered automation NOT YET COMPLETE.  
**Control owner:** RallyHub. **No AI Builder. No deployment or live asset assignment.**  
**Canonical implementation:** `base44/functions/universalAssetIntake/entry.ts`. This handover is evidence and recovery documentation, not a second receiver.

## Executive resume — read first tomorrow
The user's original approved artwork was moved by code, **not manually copied by the user into a local folder**. Python, Drive and local tooling were explored as bridges between ChatGPT-produced assets and an authenticated HTTPS endpoint. The successful final test used a Node v24.21.0 sender on Windows and the existing Base44 backend receiver. Both original PNGs were staged, then independently downloaded and SHA-256 verified. **The only remaining transfer defect was the sender's disallowed 302 from base44.app to media.base44.com; the safe wrapper below proved the fix.** The wrapper has not yet been integrated into the original sender. The desired end-state is approval in ChatGPT -> automated file retrieval/transport -> authenticated intake -> readback receipt, with no manual Drive, local folder or PowerShell steps. Do not confuse a folder watcher/button with the target automation.

## Exact components and paths
- Base44 app ID: `6a01dc00702b7dd2a2978c28`
- API: `https://rallyhub.ie/api/apps/6a01dc00702b7dd2a2978c28/functions/universalAssetIntake`
- Receiver source: `base44/functions/universalAssetIntake/entry.ts` (read source here for authoritative complete receiver code; do not duplicate or replace it).
- Sender: `verified-sender.mjs` in `C:\Users\Admin\.codex\.chatgpt-projects\g-p-6a0caca77af88191b3f5e5a5fb6dee08\asset-intake-handoff\`.
- Sender environment variable: `RALLYHUB_ACCESS_TOKEN`; receiver secret name: `RALLYHUB_ASSET_TRANSFER_SECRET`. Never document the secret value. The secret was rotated before successful tests.
- Sender request: POST JSON `{scope:'platform',name,dataBase64,expectedSha256}` with Bearer token; only HTTPS approved endpoint.
- Receiver accepts multipart, Base64 JSON or allowlisted HTTPS source URL; supported signatures PNG/PDF/WEBP/JPEG/GIF; max 12,000,000 bytes; service token limited to platform staging and requires approved SHA256; no publish/assignment. For tenant/directory, separate authenticated role checks apply.
- Receiver uses `Core.UploadFile`, checks returned URL on base44.app, follows HTTPS readback and compares SHA256. The sender independently compares again.

## Source asset provenance
Drive folder RallyHub Assets: https://drive.google.com/drive/folders/1vn3bQbH3WWQp9yeSuXohjElDouDxPWZL
Drive folder RallyHub Brand Logos: https://drive.google.com/drive/folders/1czV5F2lwAIX-6GCMRoyNmxCWklXj8RPS
Primary Drive original: https://drive.google.com/file/d/1VvEDszdFGxLsOH2rpSK-X9zDIUlX0EbE/view
Reversed Drive original: https://drive.google.com/file/d/1GTOOgrz39BWI2zAbUAsnehUnvhftb-IP/view
These originals were transferred/placed through code-driven steps during the investigation. Drive should be optional automatic transport, not a required user action.

## Proven receipt — 2/2
1. `rallyhub-primary-transparent.png`: 481737 bytes; SHA256 `01e270433a8c031c8286cdb8926ef23114cd85330166243dcbd80c9226060be6`; POST HTTP 200; GET HTTP 200; `independentReadbackVerified:true`; https://base44.app/api/apps/6a01dc00702b7dd2a2978c28/files/mp/public/6a01dc00702b7dd2a2978c28/285791cc9_rallyhub-01e270433a8c031c8286.png
2. `rallyhub-reversed-transparent.png`: 1117817 bytes; SHA256 `1fa08c810cc2f349fd528907caf4710440e50985b19646c07f0301fce5ca2fd2`; POST HTTP 200; GET HTTP 200; `independentReadbackVerified:true`; https://base44.app/api/apps/6a01dc00702b7dd2a2978c28/files/mp/public/6a01dc00702b7dd2a2978c28/53404884f_rallyhub-1fa08c810cc2f349fd52.png
These are verified staged files, not live branding assignments.

## Actual test evidence and failure isolation
- `node --version` -> v24.21.0.
- Local original files had exact byte sizes and SHA256 above.
- Node environment credential availability -> true (secret never printed).
- `fetch('https://rallyhub.ie')` -> HTTP 200.
- GET intake endpoint -> HTTP 405 `POST required`.
- Authenticated empty POST -> HTTP 400 `Provide file, dataBase64 or approved sourceUrl`; confirms credential accepted and validation reached.
- First one-logo stage attempt -> `fetch failed`, cause `unexpected redirect`.
- Diagnostic fetch with `redirect:'manual'`: `REQUEST POST HTTP 200 HOST rallyhub.ie REDIRECT HOST none`; `REQUEST GET HTTP 302 HOST base44.app REDIRECT HOST media.base44.com`; `RESULT Storage readback HTTP 302`.
- Scoped safeFetch wrapper followed only HTTPS media.base44.com and rejected any other redirect; both assets returned successful 200/200 verified receipts.
- Repeated POST attempts may create duplicate staged objects; do not repeatedly re-upload simply to inspect receipts.
- Tests above are observed user console outputs, not a claim that an automated test suite or deployment was run.

## Original sender source — captured verbatim from working conversation, before redirect fix
```javascript
import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve, dirname} from 'node:path';

const approvedEndpoint = 'https://rallyhub.ie/api/apps/6a01dc00702b7dd2a2978c28/functions/universalAssetIntake';
export const approvedAssets = [
  {file:'rallyhub-primary-transparent.png',sha256:'01e270433a8c031c8286cdb8926ef23114cd85330166243dcbd80c9226060be6'},
  {file:'rallyhub-reversed-transparent.png',sha256:'1fa08c810cc2f349fd528907caf4710440e50985b19646c07f0301fce5ca2fd2'},
];
export const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export async function stageAsset({bytes,name,expectedSha256,token,endpoint=approvedEndpoint,fetchImpl=fetch}) {
  if (endpoint !== approvedEndpoint) throw new Error('Unapproved intake endpoint');
  if (!token) throw new Error('Secure sender credential is unavailable');
  if (!Buffer.isBuffer(bytes) || bytes.subarray(0,8).toString('hex') !== '89504e470d0a1a0a') throw new Error('PNG required');
  if (hash(bytes) !== expectedSha256) throw new Error('Approval checksum mismatch');
  const response = await fetchImpl(endpoint, {
    method:'POST', redirect:'error', signal:AbortSignal.timeout(60000),
    headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
    body:JSON.stringify({scope:'platform',name,dataBase64:bytes.toString('base64'),expectedSha256}),
  });
  if (!response.ok) throw new Error(`Intake HTTP ${response.status}`);
  let receipt;
  try { receipt = await response.json(); } catch { throw new Error('Intake returned invalid JSON'); }
  if (receipt.success !== true || receipt.status !== 'staged' || receipt.readbackVerified !== true || receipt.sha256 !== expectedSha256 || typeof receipt.fileUrl !== 'string') throw new Error('Intake receipt failed verification');
  const storageUrl = new URL(receipt.fileUrl);
  if (storageUrl.protocol !== 'https:' || storageUrl.username || storageUrl.password) throw new Error('Unsafe storage URL');
  const readback = await fetchImpl(storageUrl.href,{redirect:'error',signal:AbortSignal.timeout(60000)});
  if (!readback.ok) throw new Error(`Storage readback HTTP ${readback.status}`);
  const stored = Buffer.from(await readback.arrayBuffer());
  const storedSha256 = hash(stored);
  if (storedSha256 !== expectedSha256) throw new Error('Storage readback checksum mismatch');
  return {name,bytes:bytes.length,sha256:expectedSha256,storedSha256,httpStatus:response.status,readbackHttpStatus:readback.status,status:'staged',fileUrl:storageUrl.href,independentReadbackVerified:true};
}
async function main() {
  const token = process.env.RALLYHUB_ACCESS_TOKEN;
  if (!token) throw new Error('Configure RALLYHUB_ACCESS_TOKEN through an authorised secure credential mechanism');
  const folder = dirname(fileURLToPath(import.meta.url));
  const receipts=[];
  for (const asset of approvedAssets) {
    const bytes=await readFile(resolve(folder,asset.file));
    receipts.push(await stageAsset({bytes,name:asset.file,expectedSha256:asset.sha256,token,endpoint:process.env.RALLYHUB_ASSET_INGEST_URL || approvedEndpoint}));
    await writeFile(resolve(folder,'storage-receipts.json'),JSON.stringify({verifiedAt:new Date().toISOString(),receipts},null,2));
    console.log(`VERIFIED ${asset.file} ${asset.sha256}`);
  }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(()=>{console.error('Upload stopped. Check credential availability, network access, and intake/readback validation. No unverified success is reported.');process.exitCode=1;});
```

## Tested redirect wrapper — exact successful logic
```javascript
const safeFetch = async (url, options = {}) => {
  const host = new URL(url).hostname;
  const isStorage = host === 'base44.app' || host === 'www.base44.app';
  if (!isStorage) return fetch(url, options);
  const response = await fetch(url, {...options, redirect:'manual'});
  if (response.status !== 302) return response;
  const location = response.headers.get('location');
  if (!location) throw Error('Missing redirect location');
  const target = new URL(location, url);
  if (target.protocol !== 'https:' || target.hostname !== 'media.base44.com')
    throw Error('Untrusted storage redirect');
  return fetch(target.href, {method:'GET', redirect:'error', signal:AbortSignal.timeout(60000)});
};
```
During verification, call `stageAsset({bytes,name,expectedSha256,token:process.env.RALLYHUB_ACCESS_TOKEN,fetchImpl:safeFetch})`. For permanent integration, preserve the POST's `redirect:'error'` rule; only the readback from base44.app may follow the observed 302 to HTTPS media.base44.com. Maintain independent SHA256 verification. This wrapper is tested, but **not yet written into verified-sender.mjs**.

## Receiver source recovery
Do not paste an outdated receiver copy into a new function. Retrieve `base44/functions/universalAssetIntake/entry.ts` through authorised backend read_file. Verified current source includes: constant-time-equivalent hashed token comparison, signature inspection, 12MB limit, allowlisted HTTPS source retrieval with manual redirects, scope/role checks, upload, internal SHA256 readback, and a staged receipt. Source code remains canonical in the app. Before new file types or source hosts, review SSRF, redirect, response size, permission and content handling.

## Minimal repeatable regression
1. Select one **new, explicitly approved test asset** and record original SHA256, size and scope; do not re-stage old assets unnecessarily.
2. Obtain credentials from approved secret store without printing/logging.
3. Confirm authenticated POST and receiver staged receipt.
4. Download returned storage URL through narrowly restricted HTTPS redirect handling.
5. Verify bytes and SHA256 match; save timestamped receipt (name, digest, bytes, status, URL).
6. Assert no live asset reference, tenant record or public page was changed.
7. Test negative cases separately: bad digest, missing auth, wrong scope, untrusted redirect, oversized file, unsupported signature, and duplicate handling. Do not claim these negative cases passed until run.

## Next automation implementation — prioritised
1. Patch the existing sender with the verified redirect logic; add unit tests for permitted 302 and blocked redirects, and store a named checkpoint after a passing gate.
2. Resolve direct ChatGPT approved-artifact bytes -> authorised transport credentials -> receiver. Investigate connector/runtime boundaries; do not assume ChatGPT can access the Windows process or that a Drive file view URL is a direct HTTPS byte URL.
3. Prefer direct authenticated binary/Base64 transfer; use Drive as automated fallback only when necessary.
4. Build a universal asset manifest: content hash, MIME/signature, byte length, approval reference, scope, origin, timestamp, receipt URL, duplicate status and error. Keep secrets out of records.
5. Add supported media formats deliberately, with size limits and tenant/role isolation; no unrestricted URL fetching.
6. End-to-end acceptance: user approves media once in ChatGPT; no local-folder action, manual PowerShell, manual Drive step or Base44 builder; receiver returns verified staged receipt. Publishing remains a separate explicit approval.
7. Recover and inventory Python/Drive scripts from earlier work before claiming their exact source is archived; their full code is not available in this handover evidence.

## Controls
- Do not invoke Base44 AI Builder; direct authorised backend or repository tools only.
- Do not deploy, publish, replace live media or mutate production records without explicit approval.
- Do not commit tokens, credentials or bearer headers.
- Preserve provenance and actual test results; avoid claiming automation already exists.
- See `docs/RALLYHUB_SOFTWARE_CONTROL_MASTER.md` and `docs/RALLYHUB_MASTER_TESTING_BLUEPRINT.md`.
