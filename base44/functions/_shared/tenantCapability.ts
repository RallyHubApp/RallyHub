import { activeGrantSources, expiredGraceSources } from '../tenantEntitlements/policy.js';

export async function tenantCapabilityDecision(base44:any,user:any,capabilityKey:string,opts:any={}){
  const tenantId=String(opts.tenantId||user?.active_tenant_id||'');
  const clubId=String(opts.clubId||user?.active_club_id||'')||null;
  const eventId=String(opts.eventId||'')||null;
  if(!user)return {allowed:false,reason:'unauthenticated'};
  if(user.role==='admin')return {allowed:true,reason:'platform_admin',tenantId,clubId};
  if(!tenantId||tenantId!==String(user.active_tenant_id||''))return {allowed:false,reason:'tenant_context_mismatch',tenantId,clubId};
  if(clubId&&clubId!==String(user.active_club_id||''))return {allowed:false,reason:'club_context_mismatch',tenantId,clubId};
  const policyRows=await base44.asServiceRole.entities.TenantAccessPolicy.filter({tenant_id:tenantId});
  const policy=policyRows?.[0]||null;
  const mode=policy?.enforcement_mode||'legacy_full_access';
  if(mode==='legacy_full_access')return {allowed:true,reason:'legacy_full_access',tenantId,clubId,policy};
  const capsRows=await base44.asServiceRole.entities.RallyHubCapability.list('sort_order',500);
  const caps=new Map((capsRows||[]).map((r:any)=>[String(r.key),r]));
  if(!caps.has(capabilityKey))return {allowed:false,reason:'unknown_capability',tenantId,clubId,policy};
  const entitlements=await base44.asServiceRole.entities.TenantEntitlement.filter({tenant_id:tenantId});
  const active=activeGrantSources(entitlements||[],capabilityKey,caps,{clubId,eventId});
  if(active.length)return {allowed:true,reason:'active_entitlement',tenantId,clubId,policy,matchedEntitlement:active[0]};
  if(opts.liveEventAlreadyStarted===true&&policy?.allow_live_event_grace!==false){
    const grace=expiredGraceSources(entitlements||[],capabilityKey,caps,{clubId,eventId});
    if(grace.length)return {allowed:true,reason:'live_event_grace',tenantId,clubId,policy,matchedEntitlement:grace[0],liveEventGrace:true};
  }
  return {allowed:false,reason:'capability_not_entitled',tenantId,clubId,policy};
}

export async function requireTenantCapability(base44:any,user:any,capabilityKey:string,opts:any={}){
  const decision=await tenantCapabilityDecision(base44,user,capabilityKey,opts);
  if(!decision.allowed){
    const error:any=new Error(`RallyHub access does not include ${capabilityKey}.`);
    error.status=403;
    error.capabilityDecision=decision;
    throw error;
  }
  return decision;
}
