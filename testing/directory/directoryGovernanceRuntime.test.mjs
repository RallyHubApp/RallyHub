import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import {directoryAudience,directoryEmailHash,directoryEmailKey} from '../../base44/shared/directoryAudience.mjs';
import {packageDirectoryArchive,inspectDirectoryArchive} from '../../base44/shared/directoryPortableExport.mjs';

const ADMIN_ID='6a0b5afd3f4b9681265a1398';
const CONALL_ID='6a01dc00702b7dd2a2978c29';
const serverCode=readFileSync('base44/functions/directoryGovernance/entry.ts','utf8');
const script=ts.transpileModule(serverCode.replace(/^import .*;\s*$/gm,''),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
const schemas=['DirectoryCampaign','DirectoryPlayerSubscriber','DirectorySuppression','DirectoryIdentityLink','DirectoryGovernanceAudit'];
function harness(identity=null){
 const database=Object.fromEntries(schemas.map(key=>[key,[]]));
 let sideEffectCount=0, protectedReadCount=0;
 const serial=Object.fromEntries(schemas.map(key=>[key,1]));
 const store=new Proxy({}, {get(_target,entity){
  const key=String(entity);if(!database[key])database[key]=[];
  const rows=database[key];return {
   list:async(first,limit)=>{protectedReadCount++;if(typeof first==='object')return {items:rows.slice(0,first.limit||100),has_more:false};return rows.slice(0,limit||500);},
   filter:async(filter)=>{protectedReadCount++;return rows.filter(row=>Object.entries(filter).every(([k,v])=>row[k]===v));},
   create:async(payload)=>{sideEffectCount++;const row={id:`fixture_${String(serial[key]||1).padStart(8,'0')}`,...payload};serial[key]=(serial[key]||1)+1;rows.push(row);return row;},
   update:async(id,payload)=>{sideEffectCount++;const row=rows.find(r=>r.id===id);if(!row)throw Error('Missing entity');Object.assign(row,payload);return row;},
  };
 }});
 const client={auth:{me:async()=>identity},asServiceRole:{entities:store}};
 const context={Response,Date,TextEncoder,crypto:webcrypto,console:{error:()=>{}},
   createClientFromRequest:()=>client,
   authorisedDirectorySuperAdmin:user=>!!user&&user.role==='admin'&&[ADMIN_ID,CONALL_ID].includes(user.id),
   directoryAudience,directoryEmailHash,directoryEmailKey,packageDirectoryArchive,inspectDirectoryArchive,
   rallyHubEmailShell:({title,content})=>`<h1>${title}</h1>${content}`,
   Deno:{serve(fn){context.handle=fn}}
 };
 vm.runInNewContext(script,context,{timeout:1200});
 return {rows:database,record:()=>({sideEffectCount,protectedReadCount}),async invoke(action,body={}){
   const response=await context.handle(new Request('https://fixture.example/directoryGovernance',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action,...body})}));
   return {status:response.status,data:await response.json()};
 }};
}
function subscriber(id,email,extra={}){return {id,email,email_opt_in:true,status:'active',consent_version:'directory-v1',consent_at:new Date().toISOString(),topics:['tournaments_events'],county:'Clare',...extra};}
test('anonymous, generic-admin, and club user are denied BEFORE protected reads',async()=>{
 for(const identity of [null,{id:'somebody_else',role:'admin'},{id:ADMIN_ID,role:'member'}]){
  const h=harness(identity);const r=await h.invoke('admin_overview');assert.equal(r.status,403);assert.equal(h.record().protectedReadCount,0);assert.equal(h.record().sideEffectCount,0);
 }
});
test('both verified super-admin IDs can access, but unknown action is rejected',async()=>{
 for(const id of [ADMIN_ID,CONALL_ID]){
  const h=harness({id,role:'admin'});assert.equal((await h.invoke('admin_overview')).status,200);assert.equal((await h.invoke('admin_unknown_action')).status,400);
 }
});
test('draft, preview, and approval never send and respect withdrawn/suppressed audiences',async()=>{
 const h=harness({id:ADMIN_ID,role:'admin'});
 h.rows.DirectoryPlayerSubscriber.push(subscriber('subscriber_00000001','yes@example.test'),subscriber('subscriber_00000002','withdrawn@example.test',{email_opt_in:false}),subscriber('subscriber_00000003','blocked@example.test'));
 h.rows.DirectorySuppression.push({id:'supp_00000001',email_hash:await directoryEmailHash('blocked@example.test'),channel:'email',status:'active'});
 const saved=await h.invoke('admin_save_draft',{name:'October Clare coaching',purpose:'tournaments_events',subject:'Coaching sessions this autumn',bodyText:'Here are the sessions taking place in Clare.',county:'Clare',topic:'tournaments_events'});
 assert.equal(saved.status,200,JSON.stringify(saved.data));
 const id=saved.data.campaign.id;
 const preview=await h.invoke('admin_preview_campaign',{campaignId:id});assert.equal(preview.status,200,JSON.stringify(preview.data));assert.equal(preview.data.preview.eligibleCount,1);
 assert.equal(preview.data.preview.sendingEnabled,false);assert.equal(preview.data.preview.excluded.suppressed,1);assert.equal(preview.data.preview.excluded.noEmailOptIn,1);
 assert.equal((await h.invoke('admin_approve_campaign',{campaignId:id})).status,400);
 const approved=await h.invoke('admin_approve_campaign',{campaignId:id,confirmApproval:true});assert.equal(approved.status,200);assert.equal(approved.data.campaign.status,'approved');
 assert.equal((await h.invoke('admin_save_draft',{campaignId:id,name:'Edited',purpose:'tournaments_events',subject:'A valid subject',bodyText:'A valid message description'})).status,409);
});
test('link proposals cannot be made without independent evidence, and never mutate tenants',async()=>{
 const h=harness({id:CONALL_ID,role:'admin'});h.rows.DirectoryPlayerSubscriber.push(subscriber('subscriber_00000001','example@example.test'));
 const base={directoryPersonKind:'subscriber',directoryPersonId:'subscriber_00000001',tenantId:'tenant_000001',tenantPersonId:'person_000001',purpose:'explicit cross-domain identity link',sourceProvenance:'signed form verified by both domain owners',directoryConsentReference:'directory-consent-ref-001',tenantConsentReference:'tenant-consent-ref-001'};
 assert.equal((await h.invoke('admin_propose_identity_link',{...base,tenantConsentReference:''})).status,400);
 const proposed=await h.invoke('admin_propose_identity_link',base);assert.equal(proposed.status,200,JSON.stringify(proposed.data));assert.equal(proposed.data.status,'proposed');
 assert.equal(h.rows.DirectoryIdentityLink.length,1);assert.equal(h.rows.DirectoryIdentityLink[0].status,'proposed');
 const revoked=await h.invoke('admin_revoke_identity_link',{linkId:proposed.data.linkId});assert.equal(revoked.status,200);assert.equal(revoked.data.status,'revoked');
});
test('export manifest and snapshot contain only Directory entities and redact credentials',async()=>{
 const h=harness({id:ADMIN_ID,role:'admin'});
 h.rows.DirectoryPlayerSubscriber.push(subscriber('subscriber_00000001','private@example.test',{unsubscribe_token:'secret_fixture_unsubscribe'}));
 const manifest=await h.invoke('admin_export_manifest');assert.equal(manifest.status,200,JSON.stringify(manifest.data));
 assert.equal(manifest.data.manifest.domain,'Directory');assert.ok(manifest.data.manifest.entityNames.includes('DirectoryPlayerSubscriber'));
 assert.equal((await h.invoke('admin_export_snapshot')).status,400);
 const snapshot=await h.invoke('admin_export_snapshot',{confirmExport:'EXPORT DIRECTORY'});
 assert.equal(snapshot.status,200,JSON.stringify(snapshot.data));
 assert.equal(snapshot.data.inspection.valid,true);
 assert.equal(snapshot.data.archive.entities.DirectoryPlayerSubscriber[0].unsubscribe_token,undefined);
 assert.equal(snapshot.data.archive.entities.DirectoryPlayerSubscriber[0].email,'private@example.test');
 assert.ok(Object.keys(snapshot.data.archive.entities).every(name=>name.startsWith('Directory')));
});
test('export rejects synthetic dangling follow-up instead of silently calling archive complete',async()=>{
 const h=harness({id:ADMIN_ID,role:'admin'});
 h.rows.DirectoryEnquiryFollowup=[{id:'followup_00001',enquiry_id:'nonexistent_enquiry',status:'open'}];
 const response=await h.invoke('admin_export_snapshot',{confirmExport:'EXPORT DIRECTORY'});
 assert.equal(response.status,409);assert.match(response.data.error,/relationship reconciliation/);
});
