import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import webpush from 'npm:web-push@3.6.7';

const clean=(v:any,max=500)=>String(v??'').trim().slice(0,max);
const nowIso=()=>new Date().toISOString();

async function firstBy(base44:any, entity:string, query:any){
  const rows=await base44.asServiceRole.entities[entity].filter(query,'-updated_date',10);
  return rows?.[0]||null;
}

async function messagingConfig(base44:any,user:any){
  const tenantId=clean(user.active_tenant_id,180), clubId=clean(user.active_club_id,180);
  if(!tenantId||!clubId) throw new Error('No active RallyHub club context.');
  let config=await firstBy(base44,'MemberMessagingConfig',{tenant_id:tenantId,club_id:clubId});
  if(!config||config.enabled===false) throw new Error('Club messaging is not enabled.');
  if(!config.vapid_public_key||!config.vapid_private_key){
    const keys=webpush.generateVAPIDKeys();
    config=await base44.asServiceRole.entities.MemberMessagingConfig.update(config.id,{
      vapid_public_key:keys.publicKey,
      vapid_private_key:keys.privateKey,
      vapid_subject:config.vapid_subject||`mailto:${config.notification_email||user.email||'support@rallyhub.ie'}`,
    });
  }
  return {config,tenantId,clubId};
}

function isChair(user:any,config:any){
  return String(user?.id||'')===String(config?.chair_user_id||'');
}

async function memberIdentity(base44:any,user:any,tenantId:string,clubId:string){
  const person=await firstBy(base44,'Person',{linked_user_id:user.id});
  let player=await firstBy(base44,'Player',{user_id:user.id,tenant_id:tenantId,club_id:clubId});
  if(!player&&person?.id) player=await firstBy(base44,'Player',{person_id:person.id,tenant_id:tenantId,club_id:clubId});
  const name=clean(person?.preferred_name||person?.full_name||player?.full_name||user.full_name||user.email||'Member',160);
  return {person,player,name};
}

async function ensureMemberThread(base44:any,user:any,config:any,tenantId:string,clubId:string){
  let thread=await firstBy(base44,'MemberMessageThread',{tenant_id:tenantId,club_id:clubId,member_user_id:user.id,chair_user_id:config.chair_user_id});
  if(thread) return thread;
  const identity=await memberIdentity(base44,user,tenantId,clubId);
  thread=await base44.asServiceRole.entities.MemberMessageThread.create({
    tenant_id:tenantId,
    club_id:clubId,
    member_user_id:user.id,
    member_person_id:identity.person?.id||undefined,
    member_player_id:identity.player?.id||undefined,
    member_name:identity.name,
    chair_user_id:config.chair_user_id,
    status:'open',
    last_message_preview:'',
    unread_for_member:0,
    unread_for_chair:0,
  });
  return thread;
}

async function getThreadForAccess(base44:any,user:any,config:any,tenantId:string,clubId:string,threadId?:string){
  if(isChair(user,config)){
    if(!threadId) throw new Error('threadId required');
    const thread=await firstBy(base44,'MemberMessageThread',{id:threadId,tenant_id:tenantId,club_id:clubId,chair_user_id:config.chair_user_id});
    if(!thread) throw new Error('Conversation not found.');
    return thread;
  }
  return ensureMemberThread(base44,user,config,tenantId,clubId);
}

async function sendEmailNotice(base44:any,to:string,subject:string,body:string){
  if(!to) return;
  try{
    await base44.asServiceRole.integrations.Core.SendEmail({to,from_name:'RallyHub',subject,body});
  }catch(error){
    console.warn('member messaging email fallback failed',error?.message||error);
  }
}

async function sendPushToUser(base44:any,config:any,userId:string,payload:any){
  if(!userId||!config.vapid_public_key||!config.vapid_private_key) return {sent:0,failed:0};
  webpush.setVapidDetails(config.vapid_subject||'mailto:support@rallyhub.ie',config.vapid_public_key,config.vapid_private_key);
  const rows=await base44.asServiceRole.entities.PushSubscription.filter({user_id:userId,enabled:true},'-last_seen_at',50);
  let sent=0,failed=0;
  for(const row of rows||[]){
    try{
      await webpush.sendNotification({endpoint:row.endpoint,keys:{p256dh:row.p256dh,auth:row.auth}},JSON.stringify(payload));
      sent++;
      if(row.last_error) await base44.asServiceRole.entities.PushSubscription.update(row.id,{last_error:''});
    }catch(error){
      failed++;
      const status=Number(error?.statusCode||error?.status||0);
      const update:any={last_error:clean(error?.message||'Push failed',500)};
      if(status===404||status===410) update.enabled=false;
      try{await base44.asServiceRole.entities.PushSubscription.update(row.id,update);}catch{}
    }
  }
  return {sent,failed};
}

async function safeUser(base44:any,userId:string){
  const rows=await base44.asServiceRole.entities.User.filter({id:userId});
  const row=rows?.[0];
  return row?{id:row.id,email:row.email||'',full_name:row.full_name||row.display_name||row.email||'Member'}:null;
}

async function serializeThread(base44:any,thread:any){
  const messages=await base44.asServiceRole.entities.MemberMessage.filter({thread_id:thread.id},'sent_at',500);
  return {
    id:thread.id,
    memberUserId:thread.member_user_id,
    memberName:thread.member_name||'Member',
    status:thread.status||'open',
    lastMessageAt:thread.last_message_at||null,
    lastMessagePreview:thread.last_message_preview||'',
    unreadForMember:Number(thread.unread_for_member||0),
    unreadForChair:Number(thread.unread_for_chair||0),
    messages:(messages||[]).map((m:any)=>({
      id:m.id,
      senderRole:m.sender_role,
      senderName:m.sender_name||'',
      body:m.body,
      sentAt:m.sent_at,
    })),
  };
}

Deno.serve(async(req)=>{
  try{
    const base44=createClientFromRequest(req);
    const user=await base44.auth.me();
    if(!user) return Response.json({error:'Authentication required'},{status:401});
    const body=await req.json().catch(()=>({}));
    const action=clean(body.action||'bootstrap',80);
    const {config,tenantId,clubId}=await messagingConfig(base44,user);
    const chair=isChair(user,config);
    const safeConfig={
      enabled:config.enabled!==false,
      chairName:config.chair_name||'Chairperson',
      chairTitle:config.chair_title||'Chairperson',
      vapidPublicKey:config.vapid_public_key||'',
      emailFallbackEnabled:config.email_fallback_enabled!==false,
    };

    if(action==='push_public_key') return Response.json({success:true,vapidPublicKey:config.vapid_public_key||''});

    if(action==='register_push'){
      const sub=body.subscription||{};
      const endpoint=clean(sub.endpoint,2000), p256dh=clean(sub.keys?.p256dh,1000), auth=clean(sub.keys?.auth,1000);
      if(!endpoint||!p256dh||!auth) return Response.json({error:'Invalid push subscription'},{status:400});
      const existing=await firstBy(base44,'PushSubscription',{user_id:user.id,endpoint});
      const data={tenant_id:tenantId,club_id:clubId,user_id:user.id,endpoint,p256dh,auth,user_agent:clean(body.userAgent,500),enabled:true,last_seen_at:nowIso(),last_error:''};
      if(existing) await base44.asServiceRole.entities.PushSubscription.update(existing.id,data);
      else await base44.asServiceRole.entities.PushSubscription.create(data);
      return Response.json({success:true});
    }

    if(action==='unregister_push'){
      const endpoint=clean(body.endpoint,2000);
      if(endpoint){
        const rows=await base44.asServiceRole.entities.PushSubscription.filter({user_id:user.id,endpoint},'-updated_date',20);
        for(const row of rows||[]) await base44.asServiceRole.entities.PushSubscription.update(row.id,{enabled:false,last_seen_at:nowIso()});
      }
      return Response.json({success:true});
    }

    if(action==='test_push'){
      const delivery=await sendPushToUser(base44,config,user.id,{title:'RallyHub notifications are on',body:'You’ll see a private alert here when a new RallyHub message arrives.',url:'/app/messages',tag:'rallyhub-push-test'});
      return Response.json({success:true,delivery});
    }

    if(action==='bootstrap'){
      if(chair){
        const threads=await base44.asServiceRole.entities.MemberMessageThread.filter({tenant_id:tenantId,club_id:clubId,chair_user_id:config.chair_user_id},'-last_message_at',500);
        const rows=(threads||[]).map((t:any)=>({id:t.id,memberName:t.member_name||'Member',lastMessageAt:t.last_message_at||null,lastMessagePreview:t.last_message_preview||'',unread:Number(t.unread_for_chair||0),status:t.status||'open'}));
        return Response.json({success:true,mode:'chair',config:safeConfig,threads:rows,unread:rows.reduce((n:number,t:any)=>n+t.unread,0)});
      }
      const thread=await ensureMemberThread(base44,user,config,tenantId,clubId);
      return Response.json({success:true,mode:'member',config:safeConfig,thread:await serializeThread(base44,thread),unread:Number(thread.unread_for_member||0)});
    }

    if(action==='open_thread'){
      const thread=await getThreadForAccess(base44,user,config,tenantId,clubId,clean(body.threadId,180));
      const updates:any={};
      if(chair) updates.unread_for_chair=0; else updates.unread_for_member=0;
      await base44.asServiceRole.entities.MemberMessageThread.update(thread.id,updates);
      const messages=await base44.asServiceRole.entities.MemberMessage.filter({thread_id:thread.id},'sent_at',500);
      const readAt=nowIso();
      for(const m of messages||[]){
        if(chair&&m.sender_role==='member'&&!m.read_by_chair_at) await base44.asServiceRole.entities.MemberMessage.update(m.id,{read_by_chair_at:readAt});
        if(!chair&&m.sender_role==='chairperson'&&!m.read_by_member_at) await base44.asServiceRole.entities.MemberMessage.update(m.id,{read_by_member_at:readAt});
      }
      const refreshed=await firstBy(base44,'MemberMessageThread',{id:thread.id});
      return Response.json({success:true,thread:await serializeThread(base44,refreshed)});
    }

    if(action==='send'){
      const text=clean(body.message,2000);
      if(!text) return Response.json({error:'Write a message first.'},{status:400});
      const thread=await getThreadForAccess(base44,user,config,tenantId,clubId,clean(body.threadId,180));
      if(thread.status==='closed') return Response.json({error:'This conversation is closed.'},{status:409});
      const identity=chair?{name:config.chair_name||user.full_name||'Chairperson'}:await memberIdentity(base44,user,tenantId,clubId);
      const sentAt=nowIso();
      await base44.asServiceRole.entities.MemberMessage.create({
        tenant_id:tenantId,club_id:clubId,thread_id:thread.id,sender_user_id:user.id,
        sender_role:chair?'chairperson':'member',sender_name:identity.name,body:text,sent_at:sentAt,
        ...(chair?{read_by_chair_at:sentAt}:{read_by_member_at:sentAt}),
      });
      const threadUpdate:any={last_message_at:sentAt,last_message_preview:text.slice(0,160)};
      if(chair){threadUpdate.unread_for_member=Number(thread.unread_for_member||0)+1;threadUpdate.unread_for_chair=0;}
      else{threadUpdate.unread_for_chair=Number(thread.unread_for_chair||0)+1;threadUpdate.unread_for_member=0;}
      await base44.asServiceRole.entities.MemberMessageThread.update(thread.id,threadUpdate);

      if(chair){
        const target=await safeUser(base44,thread.member_user_id);
        await sendPushToUser(base44,config,thread.member_user_id,{title:`RallyHub · Reply from ${config.chair_name||'Chairperson'}`,body:'Open RallyHub to read your message.',url:`/app/messages?thread=${thread.id}`,tag:`member-message-${thread.id}`});
        if(config.email_fallback_enabled!==false&&target?.email) await sendEmailNotice(base44,target.email,`RallyHub · Reply from ${config.chair_name||'Chairperson'}`,`You have a new private RallyHub message from ${config.chair_name||'the club'}.\n\nOpen RallyHub to read and reply: https://rallyhub.ie/app/messages\n\nYour contact details are not shared with other members.`);
      }else{
        await sendPushToUser(base44,config,config.chair_user_id,{title:`RallyHub · New message from ${identity.name}`,body:'Open RallyHub to read and reply.',url:`/app/messages?thread=${thread.id}`,tag:`member-message-${thread.id}`});
        if(config.email_fallback_enabled!==false&&config.notification_email) await sendEmailNotice(base44,config.notification_email,`RallyHub · New member message from ${identity.name}`,`A Clare Pickleball member has sent you a private RallyHub message.\n\nOpen RallyHub to read and reply: https://rallyhub.ie/app/messages?thread=${thread.id}\n\nThe message content is kept inside RallyHub.`);
      }
      const refreshed=await firstBy(base44,'MemberMessageThread',{id:thread.id});
      return Response.json({success:true,thread:await serializeThread(base44,refreshed)});
    }

    if(action==='unread_count'){
      if(chair){
        const threads=await base44.asServiceRole.entities.MemberMessageThread.filter({tenant_id:tenantId,club_id:clubId,chair_user_id:config.chair_user_id},'-last_message_at',500);
        return Response.json({success:true,count:(threads||[]).reduce((n:number,t:any)=>n+Number(t.unread_for_chair||0),0)});
      }
      const thread=await ensureMemberThread(base44,user,config,tenantId,clubId);
      return Response.json({success:true,count:Number(thread.unread_for_member||0)});
    }

    return Response.json({error:'Unknown action'},{status:400});
  }catch(error){
    console.error('memberMessaging error',error);
    return Response.json({error:error?.message||'Could not load messages.'},{status:500});
  }
});
