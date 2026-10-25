import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import ts from 'typescript';
import {readFileSync} from 'node:fs';
import {packageDirectoryArchive,inspectDirectoryArchive} from '../../base44/shared/directoryPortableExport.mjs';
import {directoryAudience,directoryEmailHash,directoryEmailKey} from '../../base44/shared/directoryAudience.mjs';
import {directoryDeliveryPlan} from '../../base44/shared/directoryDelivery.mjs';

const SUPER_IDS=['6a0b5afd3f4b9681265a1398','6a01dc00702b7dd2a2978c29'];
const guards=user=>!!user&&user.role==='admin'&&SUPER_IDS.includes(user.id);
const src=readFileSync('base44/functions/directoryGovernance/entry.ts','utf8');
const js=ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace(/^import .*?;\s*$/gm,'');
function environment(user,fixtures={}) {
  const db=structuredClone(fixtures),writes=[],reads=[];
  let seq=0;
  const entities=new Proxy({}, {get:(_target,name)=>({
    async list(...args){reads.push([name,'list',...args]);let rows=db[name]||[];const opt=args[0];if(typeof opt==='object'&&opt!==null){const limit=opt.limit||100;const start=opt.cursor?Number(opt.cursor):0;return {items:rows.slice(start,start+limit),has_more:start+limit<rows.length,next_cursor:start+limit<rows.length?String(start+limit):null};}return rows.slice(0,args[1]||5000);},
    async filter(query){reads.push([name,'filter',query]);return (db[name]||[]).filter(row=>Object.entries(query).every(([key,value])=>row[key]===value));},
    async create(payload){writes.push([name,'create',payload]);const row={id:`mock-id-${++seq}`, ...payload};(db[name]??=[]).push(row);return row;},
    async update(id,payload){writes.push([name,'update',id,payload]);const row=(db[name]||[]).find(r=>r.id===id);if(!row)throw Error('Mock update missing');Object.assign(row,payload);return row;},
  })});
  const base44={auth:{me:async()=>user},asServiceRole:{entities}};
  let handler;
  const context={Deno:{serve(fn){handler=fn;}},createClientFromRequest:()=>base44,authorisedDirectorySuperAdmin:guards,directoryAudience,directoryEmailHash,directoryEmailKey,directoryDeliveryPlan,packageDirectoryArchive,inspectDirectoryArchive,rallyHubEmailShell:({title,content})=>`<html><title>${title}</title>${content}</html>`,Response,console,Date,JSON,Set,Map,Object,Array,String,Number,RegExp,crypto:globalThis.crypto};
  vm.runInNewContext(js,context,{filename:'directoryGovernance.ts'});
  return {async act(action,payload={}){const response=await handler(new Request('https://sandbox.invalid/',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...payload})}));return {status:response.status,body:await response.json()};},writes,reads,db};
}
const demoCampaign={id:'campaign123',name:'Clare event',purpose:'tournaments_events',channel:'email',status:'draft',subject:'Event tonight',body_text:'This is an example message for an event.'};
const person={id:'subscriber123',email:'test@example.test',first_name:'Test',email_opt_in:true,status:'active',consent_at:'2026-10-25T12:00:00Z',consent_version:'v1',topics:['tournaments_events'],county:'Clare'};

test('deny anonymous, general admin, listing owner and tenant member before service role access',async()=>{
 for(const user of [null,{id:'otheradmin00000000000000',role:'admin'},{id:'owner-1',role:'user'},{id:'member-1',role:'member'}]){
   const e=environment(user,{DirectoryCampaign:[demoCampaign]});const res=await e.act('admin_overview');assert.equal(res.status,403);assert.equal(e.reads.length,0);assert.equal(e.writes.length,0);
 }
});
test('both verified Directory superadmins can access overview and all read-only queries have no writes',async()=>{
 for(const id of SUPER_IDS){const e=environment({id,role:'admin'},{DirectoryCampaign:[demoCampaign]});const res=await e.act('admin_overview');assert.equal(res.status,200,JSON.stringify(res.body));assert.equal(res.body.campaigns.length,1);assert.equal(e.writes.length,0);}
});
test('campaign draft save, preview, approval, no-send guarantee and invalid confirmation',async()=>{
 const e=environment({id:SUPER_IDS[0],role:'admin'},{DirectoryPlayerSubscriber:[person]});
 const saved=await e.act('admin_save_draft',{name:'Clare event',purpose:'tournaments_events',subject:'An Irish event',bodyText:'A suitably long campaign email message.'});assert.equal(saved.status,200,JSON.stringify(saved.body));assert.equal(saved.body.campaign.status,'draft');
 const id=saved.body.campaign.id;
 const preview=await e.act('admin_preview_campaign',{campaignId:id});assert.equal(preview.status,200,JSON.stringify(preview.body));assert.equal(preview.body.preview.eligibleCount,1);assert.equal(preview.body.preview.sendingEnabled,false);assert.match(preview.body.preview.html,/html/);
 const denied=await e.act('admin_approve_campaign',{campaignId:id});assert.equal(denied.status,400);
 const accepted=await e.act('admin_approve_campaign',{campaignId:id,confirmApproval:true});assert.equal(accepted.status,200);assert.equal(accepted.body.campaign.status,'approved');assert.ok(e.writes.every(([name])=>name==='DirectoryCampaign'||name==='DirectoryGovernanceAudit'));assert.equal(e.writes.filter(([name])=>name==='DirectoryCampaign').length,2);
});
test('suppression stores hash and excludes opted-in subscriber from campaign',async()=>{
 const e=environment({id:SUPER_IDS[1],role:'admin'},{DirectoryCampaign:[demoCampaign],DirectoryPlayerSubscriber:[person]});
 const suppressed=await e.act('admin_suppress_email',{email:'test@example.test',reason:'Explicit opt-out'});assert.equal(suppressed.status,200);assert.equal(e.db.DirectorySuppression[0].email_hash.length,64);assert.ok(!JSON.stringify(e.db.DirectorySuppression).includes('test@example.test'));
 const preview=await e.act('admin_preview_campaign',{campaignId:'campaign123'});assert.equal(preview.status,200);assert.equal(preview.body.preview.eligibleCount,0);assert.equal(preview.body.preview.excluded.suppressed,1);
});
test('link proposal requires separate evidence, never touches tenant record and can be revoked',async()=>{
 const e=environment({id:SUPER_IDS[0],role:'admin'},{DirectoryPlayerSubscriber:[person]});
 const bad=await e.act('admin_propose_identity_link',{directoryPersonKind:'subscriber',directoryPersonId:'subscriber123',tenantId:'tenant123',tenantPersonId:'tenantperson123',purpose:'Explicit requested link',sourceProvenance:'Verified human review'});assert.equal(bad.status,400);
 const valid={directoryPersonKind:'subscriber',directoryPersonId:'subscriber123',tenantId:'tenant123',tenantPersonId:'tenantperson123',purpose:'Explicit requested link',sourceProvenance:'Verified human review',directoryConsentReference:'directory-consent-1',tenantConsentReference:'tenant-consent-1'};
 const proposal=await e.act('admin_propose_identity_link',valid);assert.equal(proposal.status,200,JSON.stringify(proposal.body));assert.equal(proposal.body.status,'proposed');assert.ok(e.writes.every(([name])=>name==='DirectoryIdentityLink'||name==='DirectoryGovernanceAudit'));
 const revoke=await e.act('admin_revoke_identity_link',{linkId:proposal.body.linkId});assert.equal(revoke.status,200);assert.equal(e.db.DirectoryIdentityLink[0].status,'revoked');
});
test('export manifest/snapshot includes all Directory tables, paginates and excludes credentials',async()=>{
 const many=Array.from({length:260},(_,i)=>({id:`record_${i}`,email:`user${i}@example.test`,unsubscribe_token:'private'}));
 const e=environment({id:SUPER_IDS[0],role:'admin'},{DirectoryPlayerSubscriber:many});
 const manifest=await e.act('admin_export_manifest');assert.equal(manifest.status,200,JSON.stringify(manifest.body));assert.equal(manifest.body.manifest.counts.DirectoryPlayerSubscriber,260);
 const disallowed=await e.act('admin_export_snapshot');assert.equal(disallowed.status,400);
 const download=await e.act('admin_export_snapshot',{confirmExport:'EXPORT DIRECTORY'});assert.equal(download.status,200,JSON.stringify(download.body).slice(0,280));assert.equal(download.body.archive.entities.DirectoryPlayerSubscriber.length,260);assert.ok(!JSON.stringify(download.body.archive).includes('private'));assert.equal(download.body.inspection.valid,true);
 const cursors=e.reads.filter(([n,op])=>n==='DirectoryPlayerSubscriber'&&op==='list');assert.ok(cursors.length>=4,'cursor should progress on each export and manifest');
});

test('delivery preflight and repeated preparation are audited, idempotent sequentially and do not send',async()=>{
 const e=environment({id:SUPER_IDS[0],role:'admin'},{DirectoryCampaign:[{...demoCampaign,status:'approved',sender_email:'rallyhubapp@gmail.com'}],DirectoryPlayerSubscriber:[person]});
 const preflight=await e.act('admin_delivery_preflight',{campaignId:'campaign123'});
 assert.equal(preflight.status,200,JSON.stringify(preflight.body));assert.equal(preflight.body.preflight.preparedCount,1);assert.equal(preflight.body.preflight.externalSendEnabled,false);
 const denied=await e.act('admin_prepare_delivery',{campaignId:'campaign123'});assert.equal(denied.status,400);assert.equal(e.db.DirectoryDeliveryAttempt,undefined);
 const first=await e.act('admin_prepare_delivery',{campaignId:'campaign123',confirmPrepare:'PREPARE ONLY'});assert.equal(first.status,200,JSON.stringify(first.body));assert.equal(first.body.newlyPrepared,1);assert.equal(e.db.DirectoryDeliveryAttempt[0].status,'prepared');assert.equal(e.db.DirectoryDeliveryAttempt[0].attempt_count,0);
 const repeat=await e.act('admin_prepare_delivery',{campaignId:'campaign123',confirmPrepare:'PREPARE ONLY'});assert.equal(repeat.status,200);assert.equal(repeat.body.newlyPrepared,0);assert.equal(repeat.body.alreadyPrepared,1);
 assert.ok(e.writes.every(([name])=>name==='DirectoryDeliveryAttempt'||name==='DirectoryGovernanceAudit'));
});
