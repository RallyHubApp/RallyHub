import { createClientFromRequest } from 'npm:@base44/sdk@0.8.57';
import { authorisedDirectorySuperAdmin } from '../../shared/directorySuperAdmin.ts';
import { rallyHubEmailShell } from '../../shared/rallyHubPlatformEmail.ts';
import { directoryAudience, directoryEmailHash, directoryEmailKey } from '../../shared/directoryAudience.mjs';

// Directory-only administration. No tenant entity writes, email sends or social API calls.
const VERSION = 'directory-phase1-v1';
const DIRECTORY_ENTITIES = Object.freeze([
  'DirectoryAnalyticsEvent','DirectoryCampaign','DirectoryCategory','DirectoryClaim',
  'DirectoryClaimInvitation','DirectoryContactAction','DirectoryContactEndpoint',
  'DirectoryContactEnquiry','DirectoryContactRollout','DirectoryEnquiryFollowup',
  'DirectoryGovernanceAudit','DirectoryIdentityLink','DirectoryListingAccess',
  'DirectoryListingAudit','DirectoryListingProfile','DirectoryListingRecord',
  'DirectoryListingRequest','DirectoryPlayerSubscriber','DirectorySettings',
  'DirectorySpondConnection','DirectorySpondEvent','DirectorySuppression',
]);
const text = (v:any,n=255) => String(v ?? '').trim().slice(0,n);
const result = (body:any, status=200) => Response.json(body,{status,headers:{'Cache-Control':'no-store, private, max-age=0','X-Content-Type-Options':'nosniff'}});
const escapeHtml = (value:any) => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'} as any)[char]);
const validEmail = (v:any) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(directoryEmailKey(v));
const validId = (v:any) => /^[A-Za-z0-9_-]{8,160}$/.test(text(v,160));
const validRef = (v:any) => /^[A-Za-z0-9_.:\/-]{6,240}$/.test(text(v,240));
const campaignView = (row:any) => ({id:row.id,name:row.name,purpose:row.purpose,channel:row.channel,status:row.status,subject:row.subject,bodyText:row.body_text,county:row.county||'',clubSlug:row.club_slug||'',topic:row.topic||'',utmCampaign:row.utm_campaign||'',approvedAt:row.approved_at||'',updatedAt:row.updated_at||''});

async function audit(base44:any, user:any, action:string, type:string, objectId:string, outcome:'attempted'|'succeeded'|'failed', meta:any={}) {
  return base44.asServiceRole.entities.DirectoryGovernanceAudit.create({
    action,object_type:type,object_id:text(objectId,150),actor_user_id:user.id,
    timestamp:new Date().toISOString(),outcome,metadata_json:JSON.stringify(meta).slice(0,4000),
  });
}
async function allDirectoryRows(base44:any, entityName:string, max=12000) {
  if (!DIRECTORY_ENTITIES.includes(entityName)) throw new Error('Entity outside Directory export boundary');
  const rows:any[]=[]; let cursor:string|null=null;
  for(let page=0;page<60;page++) {
    const options:any={limit:250};
    if(cursor)options.cursor=cursor;
    const response=await base44.asServiceRole.entities[entityName].list(options);
    // Recent SDK returns cursor pages; older SDK returns arrays.
    const items=Array.isArray(response)?response:(response?.items||[]);
    rows.push(...items);
    if(rows.length>max)throw new Error(`Directory export cap exceeded for ${entityName}`);
    if(Array.isArray(response)) {
      if(items.length>=250)throw new Error(`Directory export requires cursor pagination for ${entityName}`);
      return rows;
    }
    if(!response?.has_more)return rows;
    if(!response?.next_cursor || response.next_cursor===cursor)throw new Error(`Invalid Directory export cursor for ${entityName}`);
    cursor=response.next_cursor;
  }
  throw new Error(`Directory export page limit exceeded for ${entityName}`);
}
// Never put bearer tokens, passwords, email transport credentials, or unsubscribe links in a portable JSON export.
const unsafeField=(key:string)=>/(^|_)(token|secret|password|api_key|private_key|access_key|client_secret)(_|$)/i.test(key);
const scrub=(value:any):any=>Array.isArray(value)?value.map(scrub):value&&typeof value==='object'?
  Object.fromEntries(Object.entries(value).filter(([key])=>!unsafeField(key)).map(([key,item])=>[key,scrub(item)])):value;

Deno.serve(async(req) => {
  try {
    const base44=createClientFromRequest(req);
    const user=await base44.auth.me().catch(()=>null);
    if(!authorisedDirectorySuperAdmin(user))return result({error:'Directory super-admin access required'},403);
    if(req.method!=='POST')return result({error:'POST required'},405);
    const body=await req.json().catch(()=>({}));
    const action=text(body.action,70);
    const directory=base44.asServiceRole.entities;
    if(action==='admin_overview') {
      const [campaigns,links,suppressions]=await Promise.all([
        directory.DirectoryCampaign.list('-updated_at',250),
        directory.DirectoryIdentityLink.list('-proposed_at',250),
        directory.DirectorySuppression.list('-created_at',500),
      ]);
      return result({success:true,campaigns:(campaigns||[]).map(campaignView),links:(links||[]).map((r:any)=>({id:r.id,directoryPersonKind:r.directory_person_kind,directoryPersonId:r.directory_person_id,tenantId:r.tenant_id,tenantPersonId:r.tenant_person_id,purpose:r.purpose,status:r.status,proposedAt:r.proposed_at})),suppressionCounts:{active:(suppressions||[]).filter((r:any)=>r.status==='active').length,total:(suppressions||[]).length},limits:{campaigns:250,links:250,suppressions:500},note:'Overview is page-limited; export uses cursor pagination.'});
    }
    if(action==='admin_save_draft') {
      const id=text(body.campaignId,140),name=text(body.name,150),purpose=text(body.purpose,48),subject=text(body.subject,220),bodyText=text(body.bodyText,12000);
      if(name.length<3||subject.length<5||bodyText.length<15)return result({error:'Name, subject and message body are required'},400);
      if(!['tournaments_events','coaching','club_updates'].includes(purpose))return result({error:'Invalid Directory campaign purpose'},400);
      const county=text(body.county,100),clubSlug=text(body.clubSlug,150),topic=text(body.topic,60),now=new Date().toISOString();
      const payload={name,purpose,channel:'email',status:'draft',subject,body_text:bodyText,county,club_slug:clubSlug,topic,utm_campaign:text(body.utmCampaign||name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),100),consent_source:'DirectoryPlayerSubscriber',sender_email:'rallyhubapp@gmail.com',updated_at:now};
      let existing:any=null;
      if(id){const rows=await directory.DirectoryCampaign.filter({id},'-created_date',1);existing=rows?.[0];if(!existing)return result({error:'Campaign not found'},404);if(existing.status!=='draft')return result({error:'Only draft campaigns can be edited'},409);}
      await audit(base44,user,'campaign_save','campaign',id||'new','attempted',{name,purpose});
      const saved=existing?await directory.DirectoryCampaign.update(existing.id,payload):await directory.DirectoryCampaign.create({...payload,created_by_user_id:user.id,created_at:now});
      await audit(base44,user,'campaign_save','campaign',saved.id,'succeeded',{name,purpose});
      return result({success:true,campaign:campaignView(saved)});
    }
    if(action==='admin_preview_campaign'||action==='admin_approve_campaign') {
      const id=text(body.campaignId,140);if(!validId(id))return result({error:'Valid campaign ID required'},400);
      const rows=await directory.DirectoryCampaign.filter({id},'-created_date',1);const campaign=rows?.[0];if(!campaign)return result({error:'Campaign not found'},404);
      const [people,suppressions]=await Promise.all([allDirectoryRows(base44,'DirectoryPlayerSubscriber'),allDirectoryRows(base44,'DirectorySuppression')]);
      const seg=await directoryAudience(people,suppressions,{county:campaign.county,clubSlug:campaign.club_slug,topic:campaign.topic,maxAgeMonths:24});
      const brandedPreview=rallyHubEmailShell({title:campaign.subject,content:`<div style="white-space:pre-line;line-height:1.6">${escapeHtml(campaign.body_text || '')}</div>`,footerNote:'RallyHub Directory'});
      const preview={eligibleCount:seg.eligibleCount,excluded:seg.excluded,policy:seg.policy,consentSource:'DirectoryPlayerSubscriber',sender:'rallyhubapp@gmail.com',sendingEnabled:false,html:brandedPreview,plainText:campaign.body_text||''};
      if(action==='admin_preview_campaign')return result({success:true,preview,campaign:campaignView(campaign)});
      if(campaign.status!=='draft')return result({error:'Only drafts can be approved'},409);
      if(!body.confirmApproval)return result({error:'Explicit template approval required'},400);
      await audit(base44,user,'campaign_approve','campaign',campaign.id,'attempted',{eligibleCount:seg.eligibleCount});
      const saved=await directory.DirectoryCampaign.update(campaign.id,{status:'approved',approved_by_user_id:user.id,approved_at:new Date().toISOString()});
      await audit(base44,user,'campaign_approve','campaign',campaign.id,'succeeded',{eligibleCount:seg.eligibleCount});
      return result({success:true,campaign:campaignView(saved),preview,message:'Draft approved for content only. Sending remains disabled.'});
    }
    if(action==='admin_suppress_email') {
      if(!validEmail(body.email))return result({error:'Valid email required'},400);
      const hash=await directoryEmailHash(body.email);
      const prior=await directory.DirectorySuppression.filter({email_hash:hash,channel:'email',status:'active'},'-created_at',1);
      if(prior?.[0])return result({success:true,alreadySuppressed:true});
      const reason=text(body.reason,110);if(reason.length<3)return result({error:'Reason required'},400);
      await audit(base44,user,'suppress_email','suppression',hash.slice(0,16),'attempted',{reason});
      const row=await directory.DirectorySuppression.create({email_hash:hash,channel:'email',status:'active',reason,source:'directory_admin',created_by_user_id:user.id,created_at:new Date().toISOString()});
      await audit(base44,user,'suppress_email','suppression',row.id,'succeeded',{reason});
      return result({success:true,suppressionId:row.id});
    }
    if(action==='admin_propose_identity_link') {
      const kind=text(body.directoryPersonKind,40),personId=text(body.directoryPersonId,160),tenantId=text(body.tenantId,160),tenantPersonId=text(body.tenantPersonId,160);
      const purpose=text(body.purpose,240),provenance=text(body.sourceProvenance,300),directoryConsent=text(body.directoryConsentReference,240),tenantConsent=text(body.tenantConsentReference,240);
      if(!['subscriber','listing_access'].includes(kind)||![personId,tenantId,tenantPersonId].every(validId)||purpose.length<8||provenance.length<8)return result({error:'Valid domain identities, purpose and provenance required'},400);
      if(![directoryConsent,tenantConsent].every(validRef))return result({error:'Both independent consent evidence references required'},400);
      const source=kind==='subscriber'?'DirectoryPlayerSubscriber':'DirectoryListingAccess';
      const found=await directory[source].filter({id:personId},'-created_date',1);
      if(!found?.[0])return result({error:'Directory person reference not found'},404);
      await audit(base44,user,'identity_propose','identity_link','new','attempted',{kind,purpose});
      const link=await directory.DirectoryIdentityLink.create({directory_person_kind:kind,directory_person_id:personId,tenant_id:tenantId,tenant_person_id:tenantPersonId,purpose,directory_consent_reference:directoryConsent,tenant_consent_reference:tenantConsent,source_provenance:provenance,status:'proposed',proposed_by_user_id:user.id,proposed_at:new Date().toISOString()});
      await audit(base44,user,'identity_propose','identity_link',link.id,'succeeded',{kind,purpose});
      return result({success:true,linkId:link.id,status:'proposed',note:'No automatic tenant access, identity merge, or consent inheritance. Activation requires an independently verified tenant-side contract.'});
    }
    if(action==='admin_revoke_identity_link') {
      const id=text(body.linkId,160);if(!validId(id))return result({error:'Valid link ID required'},400);
      const rows=await directory.DirectoryIdentityLink.filter({id},'-proposed_at',1);const link=rows?.[0];if(!link)return result({error:'Link not found'},404);
      if(link.status==='revoked')return result({success:true,alreadyRevoked:true});
      await audit(base44,user,'identity_revoke','identity_link',id,'attempted',{});
      await directory.DirectoryIdentityLink.update(id,{status:'revoked',revoked_by_user_id:user.id,revoked_at:new Date().toISOString()});
      await audit(base44,user,'identity_revoke','identity_link',id,'succeeded',{});
      return result({success:true,linkId:id,status:'revoked'});
    }
    if(action==='admin_export_manifest'||action==='admin_export_snapshot') {
      const snapshot=action==='admin_export_snapshot';
      if(snapshot && body.confirmExport!=='EXPORT DIRECTORY')return result({error:'Explicit export confirmation required'},400);
      const entities:any={};const counts:any={};const excludedFields=['token','secret','password','api_key','private_key','access_key','client_secret'];
      for(const name of DIRECTORY_ENTITIES){const rows=await allDirectoryRows(base44,name);counts[name]=rows.length;if(snapshot)entities[name]=rows.map(scrub);}
      const manifest={version:VERSION,generatedAt:new Date().toISOString(),domain:'Directory',counts,entityNames:[...DIRECTORY_ENTITIES],relationships:[['DirectoryListingRecord','DirectoryListingAccess','listing_slug'],['DirectoryContactEnquiry','DirectoryEnquiryFollowup','enquiry_id'],['DirectoryPlayerSubscriber','DirectoryIdentityLink','directory_person_id']],adapters:['Base44 authentication','Base44 entity storage','Platform email transport','Site analytics/GA4 optional','Spond optional'],redactedCredentialFields:excludedFields,identityPolicy:'No automatic cross-domain profile, role or consent sync',completeAcrossEntityPages:true};
      if(!snapshot)return result({success:true,manifest,downloadRequiresExplicitConfirmation:true});
      await audit(base44,user,'directory_export','export',VERSION,'attempted',{recordCounts:counts});
      // Include the audit of this export attempt; never claim proof of restore.
      entities.DirectoryGovernanceAudit=await allDirectoryRows(base44,'DirectoryGovernanceAudit');
      entities.DirectoryGovernanceAudit=entities.DirectoryGovernanceAudit.map(scrub);
      const archive={manifest,entities};
      if(JSON.stringify(archive).length>6_000_000)return result({error:'Export exceeds response size cap; use approved streamed export route',manifest},413);
      await audit(base44,user,'directory_export','export',VERSION,'succeeded',{recordCounts:counts});
      return result({success:true,archive});
    }
    return result({error:'Unsupported Directory governance action'},400);
  }catch(error){console.error('directoryGovernance error',error);return result({error:'Directory governance operation unavailable. Check server audit logs.'},500);}
});
