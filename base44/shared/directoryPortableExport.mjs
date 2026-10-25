/** Portable Directory archive contract. Pure JS, no network or database dependencies. */
export const DIRECTORY_EXPORT_FORMAT = 'rallyhub.directory.portable.v1';
export const DIRECTORY_DEPENDENCIES = Object.freeze([
  {name:'Base44 authentication',replacement:'external identity provider adapter',state:'replace_on_extraction'},
  {name:'Base44 entity storage',replacement:'standalone Directory persistence adapter',state:'replace_on_extraction'},
  {name:'Email transport',replacement:'verified mail transport and templates',state:'reconnect'},
  {name:'GA4 / Search Console',replacement:'optional read-only analytics adapter',state:'reconnect'},
  {name:'Spond',replacement:'optional provider connector',state:'reconnect'},
]);
const unsafeField=(key)=>{
  const words=String(key).replace(/([a-z0-9])([A-Z])/g,'$1_$2').replace(/[-\s]+/g,'_').toLowerCase().split('_').filter(Boolean);
  return words.some(word=>['token','secret','password','credential','authorization','authkey'].includes(word)) ||
    ['api_key','private_key','access_key','client_secret','refresh_token','unsubscribe_token'].some(term=>words.join('_').includes(term));
};
export function redactDirectoryCredentials(value) {
  if(Array.isArray(value))return value.map(redactDirectoryCredentials);
  if(value && typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([key])=>!unsafeField(key)).map(([key,entry])=>[key,redactDirectoryCredentials(entry)]));
  return value;
}
export function packageDirectoryArchive(rowsByEntity,generatedAt=new Date().toISOString()) {
  const entities=Object.fromEntries(Object.entries(rowsByEntity).map(([name,rows])=>{
    if(!/^Directory[A-Z][A-Za-z0-9]*$/.test(name)||!Array.isArray(rows))throw new Error('Invalid Directory entity archive payload');
    return [name,redactDirectoryCredentials(rows)];
  }));
  const counts=Object.fromEntries(Object.entries(entities).map(([key,rows])=>[key,rows.length]));
  return {manifest:{format:DIRECTORY_EXPORT_FORMAT,generatedAt,domain:'Directory',counts,entityNames:Object.keys(entities).sort(),dependencies:DIRECTORY_DEPENDENCIES,credentialPolicy:'Authentication and unsubscribe credentials must be reissued after restoration; they are never exported.',consentPolicy:'Directory and tenant status, preferences and permissions remain independently owned.',relationKeys:[['DirectoryEnquiryFollowup','enquiry_id','DirectoryContactEnquiry'],['DirectoryListingAccess','listing_slug','DirectoryListingRecord'],['DirectoryIdentityLink','directory_person_id','DirectoryPlayerSubscriber / DirectoryListingAccess']]},entities};
}
export function inspectDirectoryArchive(archive) {
  const issues=[];
  if(archive?.manifest?.format!==DIRECTORY_EXPORT_FORMAT)issues.push('Invalid or unsupported archive format');
  if(archive?.manifest?.domain!=='Directory')issues.push('Non-Directory archive not permitted');
  const entities=archive?.entities||{};
  for(const [entity,rows] of Object.entries(entities)){
    if(!/^Directory[A-Z][A-Za-z0-9]*$/.test(entity)||!Array.isArray(rows)){issues.push(`Invalid entity ${entity}`);continue;}
    if(archive?.manifest?.counts?.[entity]!==rows.length)issues.push(`Record count mismatch: ${entity}`);
    for(const row of rows){
      if(!row?.id)issues.push(`Missing portable ID: ${entity}`);
      for(const key of Object.keys(row||{}))if(unsafeField(key))issues.push(`Unsafe credential field: ${entity}.${key}`);
    }
  }
  const campaigns=new Set((entities.DirectoryCampaign||[]).map(row=>String(row.id)));
  const subscriberIds=new Set((entities.DirectoryPlayerSubscriber||[]).map(row=>String(row.id)));
  for(const attempt of entities.DirectoryDeliveryAttempt||[]){
    if(!campaigns.has(String(attempt.campaign_id)))issues.push(`Orphaned delivery campaign: ${attempt.id}`);
    if(!subscriberIds.has(String(attempt.subscriber_id)))issues.push(`Orphaned delivery subscriber: ${attempt.id}`);
    if(attempt.status==='delivered'&&!attempt.provider_message_id)issues.push(`Unverified delivered state: ${attempt.id}`);
  }
  const enqs=new Set((entities.DirectoryContactEnquiry||[]).map(row=>String(row.id)));
  for(const row of entities.DirectoryEnquiryFollowup||[])if(row.enquiry_id&&!enqs.has(String(row.enquiry_id)))issues.push(`Orphaned follow-up: ${row.id}`);
  const subscribers=new Set((entities.DirectoryPlayerSubscriber||[]).map(row=>String(row.id)));
  const access=new Set((entities.DirectoryListingAccess||[]).map(row=>String(row.id)));
  for(const link of entities.DirectoryIdentityLink||[]){
    const ids=link.directory_person_kind==='subscriber'?subscribers:access;
    if(!ids.has(String(link.directory_person_id)))issues.push(`Unresolved Directory-side identity link: ${link.id}`);
    if(link.status==='active')issues.push(`Unverified activated cross-domain link: ${link.id}`);
  }
  return {valid:issues.length===0,issues,totalRecords:Object.values(entities).reduce((n,rows)=>n+(Array.isArray(rows)?rows.length:0),0),entityCount:Object.keys(entities).length,mutated:false};
}
export function directoryRestoreDryRun(archive) {
  const inspection=inspectDirectoryArchive(archive);
  return {...inspection,restoreMode:'READ_ONLY_REHEARSAL',sourceFormat:archive?.manifest?.format||null,externalIdentityMappingRequired:true,tenantRecordsIncluded:false,productionWrites:0,stageOrder:['DirectoryListingRecord','DirectoryListingProfile','DirectoryPlayerSubscriber','DirectoryListingAccess','DirectoryClaim','DirectoryContactEnquiry','DirectoryEnquiryFollowup','DirectoryIdentityLink','DirectoryGovernanceAudit']};
}
