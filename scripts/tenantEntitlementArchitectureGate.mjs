import fs from 'node:fs';

let checks=0;
const assert=(condition,message)=>{checks++;if(!condition)throw new Error(`Tenant entitlement architecture gate failed: ${message}`);};
const read=(p)=>fs.readFileSync(p,'utf8');
const json=(p)=>JSON.parse(read(p));

const requiredEntities=[
  'RallyHubCapability','TenantAccessPolicy','TenantEntitlement','RallyHubTrialApplication',
  'RallyHubLegalAgreement','RallyHubAgreementAcceptance','RallyHubCommercialPlan',
  'RallyHubPlanCapability','RallyHubSubscription'
];
for(const name of requiredEntities){
  const path=`base44/entities/${name}.jsonc`;
  assert(fs.existsSync(path),`${name} schema must exist`);
  const schema=json(path);
  assert(schema.name===name||schema.entity_name===name||schema?.schema?.name===name,`${name} schema must identify itself`);
}

const policy=read('base44/entities/TenantAccessPolicy.jsonc');
assert(policy.includes('legacy_full_access'),'existing tenants must have a legacy/full-access mode');
assert(policy.includes('entitlements_required'),'policy must support explicit entitlement enforcement');
assert(policy.includes('allow_live_event_grace'),'policy must preserve already-live event grace');

const entitlement=read('base44/entities/TenantEntitlement.jsonc');
for(const token of ['trial','paid','beta','pilot','one_event','subscription','starts_at','ends_at','capability_key']){
  assert(entitlement.includes(token),`TenantEntitlement must include ${token}`);
}

const capability=read('base44/entities/RallyHubCapability.jsonc');
assert(capability.includes('tournament_type'),'capability catalogue must distinguish tournament types');
assert(capability.includes('platform_function'),'capability catalogue must distinguish platform functions');
assert(capability.includes('integration'),'capability catalogue must support integrations');
assert(capability.includes('depends_on_keys'),'capability dependencies must be representable');

const legal=read('base44/entities/RallyHubAgreementAcceptance.jsonc');
for(const token of ['agreement_version','wording_hash','authority_confirmed','restricted_sharing_confirmed','ip_acknowledged','acceptance_evidence_json']){
  assert(legal.includes(token),`agreement acceptance must preserve ${token}`);
}

const service=read('base44/functions/tenantEntitlements/entry.ts');
const policyHelpers=read('base44/functions/tenantEntitlements/policy.js');
assert(service.includes("mode==='legacy_full_access'"),'resolver must preserve existing tenants by default');
assert(service.includes('expandDependencies'),'resolver must expand capability dependencies for navigation');
assert(service.includes('activeGrantSources'),'authoritative checks must use scope-preserving grant sources');
assert(service.includes('expiredGraceSources'),'live-event grace must use scope-preserving expired grant sources');
assert(service.includes("error:'Club context mismatch'"),'non-admin checks must reject another club context');
assert(service.includes("error:'Tenant context mismatch'"),'non-admin checks must reject another tenant context');
assert(service.includes('eventId'),'authoritative checks must accept event scope');
assert(service.includes('scope_note'),'resolve output must state that navigation expansion is not the security decision');
assert(service.includes('liveEventAlreadyStarted'),'resolver must support live-event expiry grace checks');
assert(service.includes("user.role!=='admin'"),'admin actions must remain protected');
assert(policyHelpers.includes("row.entitlement_type==='one_event'"),'policy helper must explicitly scope one-event entitlements');
assert(policyHelpers.includes("String(row.one_event_id||'')!==String(eventId)"),'one-event entitlements must require the matching event id');
assert(policyHelpers.includes('capabilityIncludes(row.capability_key,targetKey,caps)'),'dependency grants must retain source entitlement scope');
assert(policyHelpers.includes("['active','expired','grace'].includes"),'live-event expiry grace must exclude scheduled, suspended and revoked grants');

const interclubBranding=read('src/lib/interclubBranding.js');
assert(interclubBranding.includes("INTERCLUB_INTERNAL_FORMAT = 'Club Challenge'"),'Interclub internal format key must remain unchanged');
assert(interclubBranding.includes("INTERCLUB_MODULE_NAME = 'RallyHub Interclub'"),'RallyHub Interclub product naming must remain unchanged');

console.log(`TENANT ENTITLEMENT ARCHITECTURE GATE PASS — ${checks} checks`);
console.log('Guardrail: additive entitlement/trial layer present; existing tenant mode remains legacy_full_access.');
