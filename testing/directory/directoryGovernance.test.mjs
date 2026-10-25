import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {directoryAudience,directoryEmailHash} from '../../base44/shared/directoryAudience.mjs';
const source=readFileSync('base44/functions/directoryGovernance/entry.ts','utf8');
const entityNames=readdirSync('base44/entities').filter(f=>f.startsWith('Directory')&&f.endsWith('.jsonc')).map(f=>f.slice(0,-6));

test('Directory audience excludes withdrawn, suppressed, expired, invalid, duplicate, and nonmatching records',async()=>{
 const current='2026-10-25T12:00:00Z';const age='2026-10-01T12:00:00Z';
 const make=(id,email,extra={})=>({id,email,status:'active',email_opt_in:true,consent_at:age,consent_version:'directory-v1',county:'Clare',club_slug:'clare-pickleball',topics:['tournaments_events'],...extra});
 const rows=[make('1','hello@example.test'),make('2','HELLO@example.test'),make('3','skip@example.test'),make('4','old@example.test',{consent_at:'2019-10-01T00:00:00Z'}),make('5','no@example.test',{email_opt_in:false}),make('6','withdrawn@example.test',{status:'unsubscribed'}),make('7','other@example.test',{county:'Galway'}),make('8','bad-address')];
 const suppressions=[{email_hash:await directoryEmailHash('SKIP@example.test'),channel:'email',status:'active'}];
 const r=await directoryAudience(rows,suppressions,{county:'Clare',topic:'tournaments_events'},new Date(current));
 assert.equal(r.eligibleCount,1);
 assert.equal(r.eligible[0].email,'hello@example.test');
 assert.equal(r.excluded.duplicate,1);assert.equal(r.excluded.suppressed,1);assert.equal(r.excluded.expiredConsent,1);assert.equal(r.excluded.noEmailOptIn,1);assert.equal(r.excluded.unsubscribed,1);assert.equal(r.excluded.outsideSegment,1);assert.equal(r.excluded.noEmail,1);
 assert.match(suppressions[0].email_hash,/^[0-9a-f]{64}$/);assert.notEqual(suppressions[0].email_hash,'skip@example.test');
});

test('Every Directory entity has denied direct CRUD RLS and is covered by the export inventory',()=>{
 const m=source.match(/const DIRECTORY_ENTITIES = Object\.freeze\(\[([\s\S]*?)\]\);/);assert.ok(m,'missing export entity inventory');
 const declared=[...m[1].matchAll(/'([^']+)'/g)].map(x=>x[1]);
 assert.deepEqual([...declared].sort(),[...entityNames].sort());
 for(const name of ['DirectoryCampaign','DirectorySuppression','DirectoryIdentityLink','DirectoryGovernanceAudit']){
   const schema=JSON.parse(readFileSync(`base44/entities/${name}.jsonc`,'utf8'));
   for(const op of ['create','read','update','delete']) assert.equal(schema.rls[op],false,`${name}.${op}`);
 }
});

test('Directory governance server enforces two named immutable IDs and forbids tenant mutations and sends',()=>{
 assert.match(source,/await base44\.auth\.me\(\)\.catch\(\(\)=>null\)/);
 assert.ok(source.indexOf('authorisedDirectorySuperAdmin(user)')<source.indexOf('const directory=base44.asServiceRole.entities'));
 assert.doesNotMatch(source,/asServiceRole\.entities\.(Club|Tenant|GuestBooking|Member|Membership)/);
 assert.doesNotMatch(source,/(\.sendEmail\(|EmailTransportConfig\.create|\bSendEmail\(|\.functions\.invoke\(.send)/);
 assert.match(source,/sendingEnabled:false/);
 assert.match(source,/status:'proposed'/);
 assert.match(source,/No automatic tenant access, identity merge, or consent inheritance/);
 assert.match(source,/allDirectoryRows\(base44,name\)/);
 assert.match(source,/has_more/);
 assert.match(source,/confirmExport!=='EXPORT DIRECTORY'/);
});
