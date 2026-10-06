import assert from "node:assert/strict";
import fs from "node:fs";
const entry=fs.readFileSync("base44/functions/communicationsEngine/entry.ts","utf8");
const router=fs.readFileSync("base44/functions/communicationsEngine/emailRouter.ts","utf8");
assert.match(entry,/user\.role!=='admin'/);
assert.match(entry,/idempotencyKey required/);
assert.match(entry,/CommunicationDeliveryAttempt/);
assert.match(entry,/Valid test recipient, subject, HTML and plain text/);
assert.match(router,/EmailTransportConfig/);
assert.match(router,/gmail_connector/);
assert.match(router,/google_apps_script/);
assert.match(router,/base44_core/);
const protectedFiles=["base44/functions/guestSessionBooking/entry.ts","base44/functions/kotcResultsShare/entry.ts","base44/functions/interclubResultsEmail/entry.ts"];
for(const p of protectedFiles){const s=fs.readFileSync(p,"utf8");assert.ok(!s.includes("communicationsEngine"),`${p} wired before adapter gate`);}
console.log("PASS communicationsDeliveryGate: shared transport facade isolated + admin-only + idempotent test send + no protected caller wired");
