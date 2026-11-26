import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source=fs.readFileSync('base44/functions/membershipRecord/entry.ts','utf8');
const block=source.slice(source.indexOf("    if(action==='admin_connect_account'){"),source.indexOf("    if(action==='admin_dashboard_counts')"));
const helpers=source.slice(source.indexOf('const clean='),source.indexOf('function parseJson'));
const js=ts.transpileModule(helpers+'\nasync function run(base44,user,body,tenantId,clubId,first){'+block+'}\nreturn run;', {compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
const run=new Function('action',js)('admin_connect_account');
function fixture({missing=false,conflict=false,unpaid=false,failRead=0,failWrite=0}={}){
 const db={User:[{id:'u',email:'a@example.test',full_name:'Alice'}],Person:[{id:'p',tenant_id:'t',primary_email:'a@example.test',full_name:'Alice'}],ClubMembership:[{id:'m',tenant_id:'t',club_id:'c',person_id:'p',relationship_type:'member',membership_status:unpaid?'pending_payment':'paid_active',payment_status:'paid'}],Player:missing?[]:[{id:'pl',tenant_id:'t',club_id:'c',person_id:'p',email:'a@example.test',...(conflict?{user_id:'other'}:{})}],ClubUserAccess:[],AuditLog:[]};
 let reads=0,writes=0;const entities={};
 for(const [name,rows] of Object.entries(db)) entities[name]={
 filter:async q=>{if(++reads===failRead)throw Error('429');return rows.filter(r=>Object.entries(q).every(([k,v])=>r[k]===v));},
 create:async data=>{if(++writes===failWrite)throw Error('write failed');const row={id:name+'-'+rows.length,...data};rows.push(row);return row;},
 update:async(id,data)=>{if(++writes===failWrite)throw Error('write failed');Object.assign(rows.find(r=>r.id===id),data);}
 };
 const base44={asServiceRole:{entities}};
 const invoke=()=>run(base44,{id:'admin',role:'admin'},{userId:'u',personId:'p'},'t','c',async(b,e,q)=>(await entities[e].filter(q))[0]||null);
 return {db,invoke,counts:()=>({reads,writes})};
}
test('normal and missing player approvals; repeated approval does not duplicate',async()=>{for(const missing of [false,true]){const f=fixture({missing});assert.equal((await f.invoke()).status,200);assert.ok(f.counts().reads<=8);assert.equal((await f.invoke()).status,200);assert.equal(f.db.Player.length,1);assert.equal(f.db.ClubUserAccess.length,1);assert.equal(f.db.User[0].approval_status,'approved');}});
test('conflicting identity and unpaid membership cause zero writes',async()=>{for(const opts of [{conflict:true},{unpaid:true}]){const f=fixture(opts);assert.equal((await f.invoke()).status,409);assert.equal(f.counts().writes,0);}});
test('rate limit at every preflight read causes zero writes',async()=>{for(const missing of [false,true])for(let i=1;i<=(missing?8:7);i++){const f=fixture({missing,failRead:i});await assert.rejects(f.invoke(),/429/);assert.equal(f.counts().writes,0);}});
test('interrupted writes recover on retry without duplicate player or access',async()=>{for(let i=1;i<=5;i++){const f=fixture({missing:true,failWrite:i});await assert.rejects(f.invoke(),/write failed/);assert.equal((await f.invoke()).status,200);assert.equal(f.db.Player.length,1);assert.equal(f.db.ClubUserAccess.length,1);assert.equal(f.db.User[0].approval_status,'approved');}});
