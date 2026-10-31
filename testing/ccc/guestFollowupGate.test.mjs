import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../../base44/functions/guestSessionBooking/entry.ts',import.meta.url),'utf8');
test('guest follow-up send requires explicit approval and confirmed attendance',()=>{
 const start=source.indexOf("if(action==='followup_send')");
 const end=source.indexOf("if(action==='followup_history')",start);
 assert.ok(start>=0&&end>start);
 const block=source.slice(start,end);
 assert.match(block,/confirmSend!==true/);
 assert.match(block,/booking_status\)\|\|records\.find/);
 assert.match(block,/status!=='attended'/);
 assert.match(block,/Only confirmed attendees can receive a follow-up/);
 assert.match(block,/skipped_duplicate/);
 assert.match(block,/CommunicationSuppression/);
 assert.match(block,/tenantEmailBrandKit/);
});
test('preview remains disabled for sending and checks attendance',()=>{
 const start=source.indexOf("if(action==='attendance_save')");
 const block=source.slice(start,source.indexOf("if(['admin_templates'",start));
 assert.match(block,/status!=='attended'/);
 assert.match(block,/sendEnabled:false/);
});
