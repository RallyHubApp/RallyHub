import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { activeGrantSources, expandDependencies, expiredGraceSources, isWindowActive } from './policy.js';

const clean=(v:any,max=300)=>String(v??'').trim().slice(0,max);
const isoNow=()=>new Date().toISOString();
function uniq(xs:string[]){return [...new Set(xs.filter(Boolean))];}

async function capabilityMap(base44:any){
  const rows=await base44.asServiceRole.entities.RallyHubCapability.list('sort_order',500);
  return new Map((rows||[]).map((r:any)=>[r.key,r]));
}
async function getPolicy(base44:any,tenantId:string){
  const rows=await base44.asServiceRole.entities.TenantAccessPolicy.filter({tenant_id:tenantId});
  return (rows||[])[0]||null;
}
async function resolveForTenant(base44:any,user:any,tenantId:string,clubId:string|null=null,capsInput:Map<string,any>|null=null){
  const caps=capsInput||await capabilityMap(base44);
  const policy=await getPolicy(base44,tenantId);
  const mode=policy?.enforcement_mode||'legacy_full_access';
  if(user.role==='admin'||mode==='legacy_full_access'){
    const all=uniq([...caps.values()].filter((c:any)=>c.status!=='retired').map((c:any)=>c.key));
    return {tenant_id:tenantId,club_id:clubId,enforcement_mode:mode,all_allowed:true,allowed_capability_keys:all,entitlements:[],policy};
  }
  const rows=await base44.asServiceRole.entities.TenantEntitlement.filter({tenant_id:tenantId});
  const applicable=(rows||[]).filter((r:any)=>!r.club_id||r.club_id===clubId);
  const active=applicable.filter((r:any)=>isWindowActive(r));
  const explicit=active.map((r:any)=>r.capability_key);
  const expanded=expandDependencies(explicit,caps);
  return {tenant_id:tenantId,club_id:clubId,enforcement_mode:mode,all_allowed:false,allowed_capability_keys:expanded,entitlements:applicable,policy};
}
async function audit(base44:any,user:any,tenantId:string,action:string,entityType:string,entityId:string,after:any,reason=''){
  await base44.asServiceRole.entities.AuditLog.create({tenant_id:tenantId,user_id:user.id,action,entity_type:entityType,entity_id:entityId,after_state:JSON.stringify(after||{}),reason});
}

Deno.serve(async(req)=>{try{
  const base44=createClientFromRequest(req);
  const user=await base44.auth.me();
  if(!user)return Response.json({error:'Authentication required'},{status:401});
  const body=await req.json().catch(()=>({}));
  const action=clean(body.action,80)||'resolve';
  const tenantId=clean(body.tenantId||user.active_tenant_id,180);
  const clubId=clean(body.clubId||user.active_club_id,180)||null;

  if(action==='resolve'||action==='check'){
    if(!tenantId)return Response.json({error:'No active tenant context'},{status:400});
    if(user.role!=='admin'&&tenantId!==user.active_tenant_id)return Response.json({error:'Tenant context mismatch'},{status:403});
    if(user.role!=='admin'&&clubId&&clubId!==user.active_club_id)return Response.json({error:'Club context mismatch'},{status:403});
    const caps=await capabilityMap(base44);
    const resolved=await resolveForTenant(base44,user,tenantId,clubId,caps);
    if(action==='resolve')return Response.json({success:true,...resolved,scope_note:'allowed_capability_keys is a navigation hint; check is authoritative for event-scoped access'});
    const capabilityKey=clean(body.capabilityKey,180);
    if(!capabilityKey)return Response.json({error:'capabilityKey required'},{status:400});
    if(!caps.has(capabilityKey))return Response.json({error:'Unknown RallyHub capability'},{status:400});
    const eventId=clean(body.eventId,180)||null;
    const activeSources=resolved.all_allowed?[]:activeGrantSources(resolved.entitlements,capabilityKey,caps,{clubId,eventId});
    let allowed=resolved.all_allowed||activeSources.length>0;
    let live_event_grace=false;
    let graceSources:any[]=[];
    if(!allowed&&body.liveEventAlreadyStarted===true&&resolved.policy?.allow_live_event_grace!==false){
      graceSources=expiredGraceSources(resolved.entitlements,capabilityKey,caps,{clubId,eventId});
      if(graceSources.length>0){allowed=true;live_event_grace=true;}
    }
    return Response.json({success:true,allowed,live_event_grace,capability_key:capabilityKey,enforcement_mode:resolved.enforcement_mode,matched_entitlement_ids:(live_event_grace?graceSources:activeSources).map((r:any)=>r.id)});
  }

  if(user.role!=='admin')return Response.json({error:'Super Admin access required'},{status:403});
  if(!tenantId)return Response.json({error:'tenantId required'},{status:400});

  if(action==='admin_list'){
    const [policy,entitlements]=await Promise.all([
      getPolicy(base44,tenantId),
      base44.asServiceRole.entities.TenantEntitlement.filter({tenant_id:tenantId}),
    ]);
    return Response.json({success:true,policy,entitlements:entitlements||[]});
  }

  if(action==='admin_set_policy'){
    const mode=['legacy_full_access','entitlements_required'].includes(body.enforcementMode)?body.enforcementMode:'legacy_full_access';
    const current=await getPolicy(base44,tenantId);
    const patch={
      tenant_id:tenantId,
      enforcement_mode:mode,
      trial_mode:body.trialMode===true,
      allow_live_event_grace:body.allowLiveEventGrace!==false,
      historical_public_results_after_expiry:body.historicalPublicResultsAfterExpiry!==false,
      support_preview_enabled:body.supportPreviewEnabled!==false,
      notes:clean(body.notes,2000),
    };
    const saved=current
      ? await base44.asServiceRole.entities.TenantAccessPolicy.update(current.id,patch)
      : await base44.asServiceRole.entities.TenantAccessPolicy.create(patch);
    await audit(base44,user,tenantId,'tenant_entitlement_policy_changed','TenantAccessPolicy',saved.id,saved,clean(body.reason,1000));
    return Response.json({success:true,policy:saved});
  }

  if(action==='admin_grant'){
    const capabilityKey=clean(body.capabilityKey,180);
    if(!capabilityKey)return Response.json({error:'capabilityKey required'},{status:400});
    const cap=(await base44.asServiceRole.entities.RallyHubCapability.filter({key:capabilityKey}))?.[0];
    if(!cap)return Response.json({error:'Unknown RallyHub capability'},{status:400});
    const type=['trial','paid','beta','pilot','one_event','manual','subscription'].includes(body.entitlementType)?body.entitlementType:'manual';
    const startsAt=body.startsAt?new Date(body.startsAt).toISOString():isoNow();
    const endsAt=body.endsAt?new Date(body.endsAt).toISOString():null;
    const status=body.status&&['scheduled','active','grace','suspended','expired','revoked'].includes(body.status)?body.status:'active';
    const row=await base44.asServiceRole.entities.TenantEntitlement.create({
      tenant_id:tenantId,
      club_id:clean(body.clubId,180)||null,
      capability_key:capabilityKey,
      entitlement_type:type,
      status,
      starts_at:startsAt,
      ends_at:endsAt,
      grace_ends_at:body.graceEndsAt?new Date(body.graceEndsAt).toISOString():null,
      one_event_id:clean(body.oneEventId,180)||null,
      limits_json:body.limits?JSON.stringify(body.limits):clean(body.limitsJson,5000)||null,
      source_plan_key:clean(body.sourcePlanKey,180)||null,
      source_subscription_id:clean(body.sourceSubscriptionId,180)||null,
      granted_by_user_id:user.id,
      grant_reason:clean(body.reason,2000),
      created_at:isoNow(),updated_at:isoNow(),
    });
    await audit(base44,user,tenantId,'tenant_entitlement_granted','TenantEntitlement',row.id,row,clean(body.reason,1000));
    return Response.json({success:true,entitlement:row});
  }

  if(action==='admin_update_entitlement'){
    const entitlementId=clean(body.entitlementId,180);
    if(!entitlementId)return Response.json({error:'entitlementId required'},{status:400});
    const row=await base44.asServiceRole.entities.TenantEntitlement.get(entitlementId);
    if(!row||row.tenant_id!==tenantId)return Response.json({error:'Entitlement not found for tenant'},{status:404});
    const patch:any={updated_at:isoNow()};
    if(body.status!==undefined&&['scheduled','active','grace','suspended','expired','revoked'].includes(body.status))patch.status=body.status;
    if(body.endsAt!==undefined)patch.ends_at=body.endsAt?new Date(body.endsAt).toISOString():null;
    if(body.graceEndsAt!==undefined)patch.grace_ends_at=body.graceEndsAt?new Date(body.graceEndsAt).toISOString():null;
    if(body.reason!==undefined)patch.suspended_reason=clean(body.reason,2000);
    const saved=await base44.asServiceRole.entities.TenantEntitlement.update(entitlementId,patch);
    await audit(base44,user,tenantId,'tenant_entitlement_updated','TenantEntitlement',saved.id,saved,clean(body.reason,1000));
    return Response.json({success:true,entitlement:saved});
  }

  return Response.json({error:'Unknown action'},{status:400});
}catch(error:any){
  console.error('tenantEntitlements error',error);
  return Response.json({error:error?.message||'Tenant entitlement operation failed'},{status:500});
}});
