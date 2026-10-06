import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import webpush from 'npm:web-push@3.6.7';

const clean=(v:any,max=2000)=>String(v??'').trim().slice(0,max);
const nowIso=()=>new Date().toISOString();

async function first(base44:any,entity:string,filter:any,sort='-updated_date'){
  const rows=await base44.asServiceRole.entities[entity].filter(filter,sort,20);
  return rows?.[0]||null;
}

function canManage(user:any){
  return user?.role==='admin'||user?.active_club_role==='club_admin';
}

async function context(base44:any,user:any){
  const tenantId=clean(user?.active_tenant_id,180),clubId=clean(user?.active_club_id,180);
  if(!tenantId||!clubId) throw new Error('No active RallyHub club context.');
  const club=await first(base44,'Club',{id:clubId});
  return {tenantId,clubId,club};
}

async function activeMemberAudience(base44:any,tenantId:string,clubId:string){
  const [relationships,people]=await Promise.all([
    base44.asServiceRole.entities.ClubRelationship.filter({tenant_id:tenantId,club_id:clubId,relationship_type:'member'},'person_id',500),
    base44.asServiceRole.entities.Person.filter({tenant_id:tenantId},'full_name',500),
  ]);
  const peopleById=new Map((people||[]).map((p:any)=>[String(p.id),p]));
  const active=(relationships||[]).filter((r:any)=>String(r.status||'').toLowerCase()==='active');
  const userIds:string[]=[];
  for(const rel of active){
    const person:any=peopleById.get(String(rel.person_id||''));
    const uid=clean(person?.linked_user_id,180);
    if(uid&&!userIds.includes(uid)) userIds.push(uid);
  }
  return {eligibleMemberCount:active.length,userIds,unlinkedCount:Math.max(0,active.length-userIds.length)};
}

async function pushConfig(base44:any,tenantId:string,clubId:string){
  const cfg=await first(base44,'MemberMessagingConfig',{tenant_id:tenantId,club_id:clubId});
  if(!cfg?.vapid_public_key||!cfg?.vapid_private_key) return null;
  return cfg;
}

async function pushToUsers(base44:any,cfg:any,tenantId:string,clubId:string,userIds:string[],payload:any){
  if(!cfg||!userIds.length) return {subscriptionCount:0,sent:0,failed:0};
  webpush.setVapidDetails(cfg.vapid_subject||'mailto:support@rallyhub.ie',cfg.vapid_public_key,cfg.vapid_private_key);
  const subscriptions=await base44.asServiceRole.entities.PushSubscription.filter({tenant_id:tenantId,club_id:clubId,enabled:true},'-last_seen_at',500);
  const targets=(subscriptions||[]).filter((row:any)=>userIds.includes(String(row.user_id||'')));
  let sent=0,failed=0;
  const concurrency=10;
  for(let i=0;i<targets.length;i+=concurrency){
    const batch=targets.slice(i,i+concurrency);
    await Promise.all(batch.map(async(row:any)=>{
      try{
        await webpush.sendNotification({endpoint:row.endpoint,keys:{p256dh:row.p256dh,auth:row.auth}},JSON.stringify(payload));
        sent++;
        if(row.last_error) await base44.asServiceRole.entities.PushSubscription.update(row.id,{last_error:''});
      }catch(error){
        failed++;
        const status=Number((error as any)?.statusCode||(error as any)?.status||0);
        const update:any={last_error:clean((error as any)?.message||'Push failed',500)};
        if(status===404||status===410) update.enabled=false;
        try{await base44.asServiceRole.entities.PushSubscription.update(row.id,update);}catch{}
      }
    }));
  }
  return {subscriptionCount:targets.length,sent,failed};
}

function safeBroadcast(row:any){
  return {
    id:row.id,
    title:row.title||'',
    message:row.message||'',
    linkUrl:row.link_url||'',
    audienceType:row.audience_type||'all_active',
    audienceLabel:row.audience_label||'',
    eligibleMemberCount:Number(row.eligible_member_count||0),
    linkedTargetCount:Number(row.linked_target_count||row.target_count||0),
    unlinkedCount:Number(row.unlinked_count||0),
    pushSubscriptionCount:Number(row.push_subscription_count||0),
    pushSent:Number(row.push_sent||0),
    pushFailed:Number(row.push_failed||0),
    whatsappGroupKey:row.whatsapp_group_key||'',
    whatsappGroupName:row.whatsapp_group_name||'',
    whatsappStatus:row.whatsapp_status||'not_requested',
    whatsappPostedAt:row.whatsapp_posted_at||null,
    createdByName:row.created_by_name||'',
    publishedAt:row.published_at||row.created_date||null,
    status:row.status||'published',
  };
}

function whatsappText(title:string,message:string,linkUrl:string,clubName:string){
  const bits=[`*${title}*`,message];
  if(linkUrl) bits.push(linkUrl);
  bits.push(`${clubName||'Clare Pickleball'} · via RallyHub`);
  return bits.filter(Boolean).join('\n\n');
}

Deno.serve(async(req)=>{
  try{
    const base44=createClientFromRequest(req);
    const user=await base44.auth.me();
    if(!user) return Response.json({error:'Authentication required'},{status:401});
    if(!canManage(user)) return Response.json({error:'Membership administrator access required'},{status:403});
    const body=await req.json().catch(()=>({}));
    const action=clean(body.action||'bootstrap',80);
    const {tenantId,clubId,club}=await context(base44,user);

    if(action==='bootstrap'){
      const [groups,broadcasts,audience]=await Promise.all([
        base44.asServiceRole.entities.ClubWhatsAppGroup.filter({tenant_id:tenantId,club_id:clubId,active:true},'sort_order',100),
        base44.asServiceRole.entities.ClubBroadcast.filter({tenant_id:tenantId,club_id:clubId},'-published_at',50),
        activeMemberAudience(base44,tenantId,clubId),
      ]);
      return Response.json({
        success:true,
        club:{id:clubId,name:club?.name||'Club'},
        groups:(groups||[]).map((g:any)=>({id:g.id,key:g.group_key,name:g.display_name,hint:g.audience_hint||'',isDefault:g.is_default===true})),
        broadcasts:(broadcasts||[]).map(safeBroadcast),
        audience:{eligibleMemberCount:audience.eligibleMemberCount,linkedTargetCount:audience.userIds.length,unlinkedCount:audience.unlinkedCount},
      });
    }

    if(action==='prepare_whatsapp'){
      const title=clean(body.title,220),message=clean(body.message,8000),linkUrl=clean(body.linkUrl,1200);
      if(!title||!message) return Response.json({error:'Title and message are required.'},{status:400});
      const groupRows=await base44.asServiceRole.entities.ClubWhatsAppGroup.filter({tenant_id:tenantId,club_id:clubId,active:true},'sort_order',100);
      const requestedGroup=clean(body.whatsappGroupKey,120);
      const group=(groupRows||[]).find((g:any)=>String(g.group_key)===requestedGroup)||(groupRows||[]).find((g:any)=>g.is_default===true)||(groupRows||[])[0]||null;
      return Response.json({success:true,whatsappText:whatsappText(title,message,linkUrl,club?.name||'Clare Pickleball'),whatsappGroupName:group?.display_name||'',whatsappGroupKey:group?.group_key||''});
    }

    if(action==='record_whatsapp_only'){
      const title=clean(body.title,220),message=clean(body.message,8000),linkUrl=clean(body.linkUrl,1200);
      if(!title||!message) return Response.json({error:'Title and message are required.'},{status:400});
      const groupRows=await base44.asServiceRole.entities.ClubWhatsAppGroup.filter({tenant_id:tenantId,club_id:clubId,active:true},'sort_order',100);
      const requestedGroup=clean(body.whatsappGroupKey,120);
      const group=(groupRows||[]).find((g:any)=>String(g.group_key)===requestedGroup)||(groupRows||[]).find((g:any)=>g.is_default===true)||(groupRows||[])[0]||null;
      const postedAt=nowIso();
      const broadcast=await base44.asServiceRole.entities.ClubBroadcast.create({
        tenant_id:tenantId,club_id:clubId,title,message,link_url:linkUrl||undefined,
        audience_type:'all_active',audience_label:group?.display_name||'WhatsApp',eligible_member_count:0,linked_target_count:0,unlinked_count:0,target_count:0,
        push_subscription_count:0,push_sent:0,push_failed:0,whatsapp_group_key:group?.group_key||'',whatsapp_group_name:group?.display_name||'',
        whatsapp_status:'posted',whatsapp_posted_at:postedAt,whatsapp_posted_by_user_id:user.id,
        created_by_user_id:user.id,created_by_name:user.full_name||user.display_name||user.email||'Admin',published_at:postedAt,status:'published'
      });
      return Response.json({success:true,broadcast:safeBroadcast(broadcast)});
    }

    if(action==='publish'){
      const title=clean(body.title,220),message=clean(body.message,8000),linkUrl=clean(body.linkUrl,1200);
      if(!title||!message) return Response.json({error:'Title and message are required.'},{status:400});
      const audienceType=body.audienceType==='selected'?'selected':'all_active';
      const activeAudience=await activeMemberAudience(base44,tenantId,clubId);
      const activeSet=new Set(activeAudience.userIds.map(String));
      let targetUserIds=[...activeAudience.userIds];
      if(audienceType==='selected'){
        const requested=Array.isArray(body.audienceUserIds)?body.audienceUserIds.map((id:any)=>clean(id,180)).filter(Boolean):[];
        targetUserIds=[...new Set(requested.filter((id:string)=>activeSet.has(id)))];
        if(!targetUserIds.length) return Response.json({error:'None of the selected records are linked active members yet.'},{status:409});
      }
      const groupRows=await base44.asServiceRole.entities.ClubWhatsAppGroup.filter({tenant_id:tenantId,club_id:clubId,active:true},'sort_order',100);
      const requestedGroup=clean(body.whatsappGroupKey,120);
      const group=(groupRows||[]).find((g:any)=>String(g.group_key)===requestedGroup)||(groupRows||[]).find((g:any)=>g.is_default===true)||(groupRows||[])[0]||null;
      const publishedAt=nowIso();
      const audienceLabel=audienceType==='selected'?`${targetUserIds.length} selected linked member${targetUserIds.length===1?'':'s'}`:'All active linked members';
      const post=await base44.asServiceRole.entities.ClubBulletinPost.create({
        tenant_id:tenantId,club_id:clubId,author_user_id:user.id,post_type:'announcement',title,body:message,
        link_url:linkUrl||undefined,audience_scope:'member',audience_ids:targetUserIds,comments_enabled:false,
        is_pinned:body.pinned===true,status:'published',published_at:publishedAt,
      });
      const cfg=await pushConfig(base44,tenantId,clubId);
      const push=body.sendPush===false?{subscriptionCount:0,sent:0,failed:0}:await pushToUsers(base44,cfg,tenantId,clubId,targetUserIds,{
        title:`${club?.name||'RallyHub'} · New update`,
        body:title,
        url:'/app',
        tag:`club-broadcast-${post.id}`,
      });
      const broadcast=await base44.asServiceRole.entities.ClubBroadcast.create({
        tenant_id:tenantId,club_id:clubId,bulletin_post_id:post.id,title,message,link_url:linkUrl||undefined,
        audience_type:audienceType,audience_user_ids:targetUserIds,audience_label:audienceLabel,
        eligible_member_count:audienceType==='all_active'?activeAudience.eligibleMemberCount:targetUserIds.length,
        linked_target_count:targetUserIds.length,
        unlinked_count:audienceType==='all_active'?activeAudience.unlinkedCount:0,
        target_count:targetUserIds.length,push_subscription_count:push.subscriptionCount,push_sent:push.sent,push_failed:push.failed,
        whatsapp_group_key:group?.group_key||'',whatsapp_group_name:group?.display_name||'',
        whatsapp_status:body.includeWhatsApp===false?'not_requested':'pending',
        created_by_user_id:user.id,created_by_name:user.full_name||user.display_name||user.email||'Admin',published_at:publishedAt,status:'published',
      });
      return Response.json({
        success:true,
        broadcast:safeBroadcast(broadcast),
        whatsappText:whatsappText(title,message,linkUrl,club?.name||'Clare Pickleball'),
        whatsappGroupName:group?.display_name||'',
      });
    }

    if(action==='mark_whatsapp_posted'){
      const id=clean(body.broadcastId,180);
      if(!id) return Response.json({error:'broadcastId required'},{status:400});
      const row=await first(base44,'ClubBroadcast',{id,tenant_id:tenantId,club_id:clubId});
      if(!row) return Response.json({error:'Broadcast not found'},{status:404});
      const updated=await base44.asServiceRole.entities.ClubBroadcast.update(row.id,{whatsapp_status:'posted',whatsapp_posted_at:nowIso(),whatsapp_posted_by_user_id:user.id});
      return Response.json({success:true,broadcast:safeBroadcast(updated)});
    }

    return Response.json({error:'Unknown action'},{status:400});
  }catch(error){
    console.error('clubBroadcast error',error);
    return Response.json({error:(error as any)?.message||'Could not process club broadcast.'},{status:500});
  }
});
