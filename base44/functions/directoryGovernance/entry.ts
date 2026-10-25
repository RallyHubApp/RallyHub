import { createClientFromRequest } from 'npm:@base44/sdk@0.8.57';
import { authorisedDirectorySuperAdmin } from './shared/directorySuperAdmin.ts';
import { rallyHubEmailShell } from './shared/rallyHubPlatformEmail.ts';
import { packageDirectoryArchive, inspectDirectoryArchive } from './shared/directoryPortableExport.ts';
import { directoryAudience, directoryEmailHash, directoryEmailKey } from './shared/directoryAudience.ts';
import { directoryDeliveryPlan } from './shared/directoryDelivery.ts';
import { sendWithConfiguredEmailTransport, requireConfiguredEmailTransport } from './shared/directoryCampaignEmailRouter.ts';

// Directory-only administration; sending requires explicit authorised per-campaign confirmation and fresh consent.
const VERSION = 'directory-phase1-v1';
const DIRECTORY_ENTITIES = Object.freeze([
  'DirectoryAnalyticsEvent','DirectoryCampaign','DirectoryCategory','DirectoryClaim',
  'DirectoryClaimInvitation','DirectoryContactAction','DirectoryContactEndpoint',
  'DirectoryContactEnquiry','DirectoryContactRollout','DirectoryDeliveryAttempt','DirectoryEnquiryFollowup',
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
    if(action==='admin_delivery_preflight'||action==='admin_prepare_delivery') {
      const campaignId=text(body.campaignId,140);
      if(!validId(campaignId))return result({error:'Valid Directory campaign required'},400);
      const records=await directory.DirectoryCampaign.filter({id:campaignId},'-created_at',1);
      const campaign=records?.[0];if(!campaign)return result({error:'Campaign not found'},404);
      const [people,suppressions]=await Promise.all([allDirectoryRows(base44,'DirectoryPlayerSubscriber'),allDirectoryRows(base44,'DirectorySuppression')]);
      const audience=await directoryAudience(people,suppressions,{county:campaign.county,clubSlug:campaign.club_slug,topic:campaign.topic,maxAgeMonths:24});
      const plan=await directoryDeliveryPlan(campaign,audience);
      const publicPlan={eligibleCount:plan.eligibleCount,preparedCount:plan.preparedCount,issues:plan.issues,externalSendEnabled:false,providerAcceptanceConfirmed:false,deliveryConfirmed:false,requiresLiveConsentRecheck:true};
      if(action==='admin_delivery_preflight')return result({success:true,preflight:publicPlan});
      if(plan.issues.length)return result({error:'Directory delivery preflight failed',preflight:publicPlan},409);
      if(body.confirmPrepare!=='PREPARE ONLY')return result({error:'Explicit preparation-only confirmation required'},400);
      await audit(base44,user,'delivery_prepare','campaign',campaignId,'attempted',{count:plan.entries.length});
      let newlyPrepared=0,alreadyPrepared=0;
      for(const entry of plan.entries){
        const prior=await directory.DirectoryDeliveryAttempt.filter({idempotency_key:entry.idempotency_key},'-created_at',1);
        if(prior?.[0]){alreadyPrepared++;continue;}
        await directory.DirectoryDeliveryAttempt.create({...entry,created_by_user_id:user.id,updated_at:entry.created_at});
        newlyPrepared++;
      }
      await audit(base44,user,'delivery_prepare','campaign',campaignId,'succeeded',{newlyPrepared,alreadyPrepared});
      return result({success:true,preflight:publicPlan,newlyPrepared,alreadyPrepared,message:'Prepared records only. No external delivery was triggered.'});
    }
    if(action==='admin_send_campaign') {
      const campaignId=text(body.campaignId,140);
      if(!validId(campaignId)||body.confirmSend!=='SEND APPROVED CAMPAIGN')return result({error:'Explicit approved-campaign send confirmation required'},400);
      const campaignRows=await directory.DirectoryCampaign.filter({id:campaignId},'-created_date',1);
      const campaign=campaignRows?.[0];if(!campaign)return result({error:'Campaign not found'},404);
      // No club/tenant audience is ever imported here. Consent and suppressions are refreshed on this request.
      const [people,suppressions]=await Promise.all([allDirectoryRows(base44,'DirectoryPlayerSubscriber'),allDirectoryRows(base44,'DirectorySuppression')]);
      const audience=await directoryAudience(people,suppressions,{county:campaign.county,clubSlug:campaign.club_slug,topic:campaign.topic,maxAgeMonths:24});
      const plan=await directoryDeliveryPlan(campaign,audience);
      if(plan.issues.length)return result({error:'Campaign cannot send',issues:plan.issues},409);
      if(plan.entries.length>14)return result({error:'Send batches are limited to 14 people; refine the audience and retry'},409);
      const transport=await requireConfiguredEmailTransport(base44,{scopeType:'platform',purpose:'directory'});
      if(transport.sender_email!=='rallyhubapp@gmail.com')return result({error:'Sender mismatch for RallyHub Directory'},409);
      await audit(base44,user,'campaign_send','campaign',campaignId,'attempted',{recipients:plan.entries.length});
      const summary={accepted:0,failed:0,skipped:0,results:[] as any[]};
      for(const item of plan.entries){
        const prior=await directory.DirectoryDeliveryAttempt.filter({idempotency_key:item.idempotency_key},'-created_at',1);
        const prepared=prior?.[0] && prior[0].status==='prepared' && Number(prior[0].attempt_count||0)===0 ? prior[0] : null;
        if(prior?.[0]&&!prepared){summary.skipped++;summary.results.push({subscriberId:item.subscriber_id,status:'already_attempted'});continue;}
        const person=audience.eligible.find((x:any)=>x.subscriberId===item.subscriber_id);
        // Recipient must still exist with live consent and a usable personal unsubscribe token.
        const source=people.find((x:any)=>x.id===item.subscriber_id);
        if(!person||!source?.unsubscribe_token||!/^dp_[a-f0-9]{32}$/i.test(source.unsubscribe_token)){
          summary.skipped++;summary.results.push({subscriberId:item.subscriber_id,status:'missing_preferences_link'});continue;
        }
        const latest=await directory.DirectoryPlayerSubscriber.filter({id:item.subscriber_id},'-updated_at',1);
        const refreshed=latest?.[0];
        const currentSuppression=await directory.DirectorySuppression.filter({email_hash:item.recipient_hash,channel:'email',status:'active'},'-created_at',5);
        if(!refreshed||refreshed.status!=='active'||refreshed.email_opt_in!==true||directoryEmailKey(refreshed.email)!==person.email||currentSuppression?.length){
          summary.skipped++;summary.results.push({subscriberId:item.subscriber_id,status:'no_current_consent'});continue;
        }
        // Record the attempt BEFORE reaching the external provider to avoid duplicate sends on sequential retries.
        const now=new Date().toISOString();
        const attempt=prepared ? await directory.DirectoryDeliveryAttempt.update(prepared.id,{attempt_count:1,updated_at:now}) : await directory.DirectoryDeliveryAttempt.create({...item,status:'prepared',created_by_user_id:user.id,attempt_count:1,updated_at:now});
        const preferencesUrl=`https://rallyhub.ie/directory/player-updates?token=${encodeURIComponent(source.unsubscribe_token)}`;
        const plainText=`${campaign.body_text}\n\nManage your RallyHub Directory email preferences: ${preferencesUrl}`;
        const html=rallyHubEmailShell({title:campaign.subject,content:`<div style=\"white-space:pre-line;line-height:1.6\">${escapeHtml(campaign.body_text)}</div><p style=\"font-size:13px\"><a href=\"${escapeHtml(preferencesUrl)}\">Update preferences or unsubscribe</a></p>`,footerNote:'RallyHub Directory'});
        try {
          const delivered=await sendWithConfiguredEmailTransport(base44,{scopeType:'platform',purpose:'directory'},{to:person.email,subject:campaign.subject,textBody:plainText,htmlBody:html,senderName:'RallyHub Directory'});
          const providerId=text(delivered?.payload?.id||delivered?.payload?.messageId||'',220);
          await directory.DirectoryDeliveryAttempt.update(attempt.id,{status:'provider_accepted',provider:delivered.provider||transport.provider,provider_message_id:providerId,updated_at:new Date().toISOString()});
          summary.accepted++;summary.results.push({subscriberId:item.subscriber_id,status:'provider_accepted'});
        }catch(error){
          await directory.DirectoryDeliveryAttempt.update(attempt.id,{status:'failed',failure_reason:text(error?.message||'Provider rejected request',450),updated_at:new Date().toISOString()});
          summary.failed++;summary.results.push({subscriberId:item.subscriber_id,status:'failed'});
        }
      }
      await audit(base44,user,'campaign_send','campaign',campaignId,'succeeded',{accepted:summary.accepted,failed:summary.failed,skipped:summary.skipped});
      return result({success:true,...summary,note:'Provider accepted means submitted to mail provider, not recipient inbox delivery. Already attempted recipients are not resent automatically.'});
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
      const entities:any={};const counts:any={};
      for(const name of DIRECTORY_ENTITIES){const rows=await allDirectoryRows(base44,name);counts[name]=rows.length;if(snapshot)entities[name]=rows;}
      const manifest={...packageDirectoryArchive(Object.fromEntries(DIRECTORY_ENTITIES.map(name=>[name,[]]))).manifest,version:VERSION,generatedAt:new Date().toISOString(),counts,entityNames:[...DIRECTORY_ENTITIES],completeAcrossEntityPages:true};
      if(!snapshot)return result({success:true,manifest,downloadRequiresExplicitConfirmation:true});
      await audit(base44,user,'directory_export','export',VERSION,'attempted',{recordCounts:counts});
      // Preserve the export attempt in the archive, without exposing credentials.
      entities.DirectoryGovernanceAudit=await allDirectoryRows(base44,'DirectoryGovernanceAudit');
      let archive=packageDirectoryArchive(entities,manifest.generatedAt);
      archive.manifest.version=VERSION;
      let inspection=inspectDirectoryArchive(archive);
      if(!inspection.valid)return result({error:'Directory relationship reconciliation failed',issues:inspection.issues.slice(0,30)},409);
      if(JSON.stringify(archive).length>6_000_000)return result({error:'Export exceeds response size cap; use approved streamed export route',manifest},413);
      await audit(base44,user,'directory_export_prepared','export',VERSION,'succeeded',{recordCounts:counts});
      entities.DirectoryGovernanceAudit=await allDirectoryRows(base44,'DirectoryGovernanceAudit');
      archive=packageDirectoryArchive(entities,manifest.generatedAt);
      archive.manifest.version=VERSION;
      inspection=inspectDirectoryArchive(archive);
      if(!inspection.valid)return result({error:'Export reconciliation changed during preparation',issues:inspection.issues.slice(0,30)},409);
      if(JSON.stringify(archive).length>6_000_000)return result({error:'Export exceeds response size cap; use approved streamed export route',manifest},413);
      return result({success:true,archive,inspection});
    }
    return result({error:'Unsupported Directory governance action'},400);
  }catch(error){console.error('directoryGovernance error',error);return result({error:'Directory governance operation unavailable. Check server audit logs.'},500);}
});
