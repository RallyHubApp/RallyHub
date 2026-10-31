import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../../base44/functions/membershipApplication/entry.ts',import.meta.url),'utf8');
test('membership application list fetches club-scoped payment records in one page',()=>{
 const start=source.indexOf("if(action==='admin_list')");
 const end=source.indexOf("if(action==='admin_create_invite')",start);
 const code=source.slice(start,end);
 assert.match(code,/PaymentRecord\.filter\(\{tenant_id:tenantId,club_id:clubId\},'-created_date',500\)/);
 assert.match(code,/paymentsById\.get\(String\(app\.payment_record_id\)\)/);
});
test('membership payment lookup handles missing references only when page is full',()=>{
 const start=source.indexOf("if(action==='admin_list')");
 const end=source.indexOf("if(action==='admin_create_invite')",start);
 const code=source.slice(start,end);
 assert.match(code,/else if\(\(paymentPage\|\|\[\]\)\.length===500\)missing\.push\(app\)/);
 assert.match(code,/for\(let offset=0;offset<missing\.length;offset\+=12\)/);
 assert.match(code,/id:app\.payment_record_id,tenant_id:tenantId,club_id:clubId/);
});
test('membership list does not request payment page when no linked records exist',()=>{
 const start=source.indexOf("if(action==='admin_list')");
 const end=source.indexOf("if(action==='admin_create_invite')",start);
 assert.match(source.slice(start,end),/if\(paidLookupApps\.length\)\{/);
});
