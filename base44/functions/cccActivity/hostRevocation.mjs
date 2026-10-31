/** Revocation is a separate, explicit administrative workflow. */
export function reviewHostRevocation(config,{tenantId,clubId}={}){
 if(!config)return {allowed:false,error:'Host configuration not found'};
 if(config.tenant_id!==tenantId||config.club_id!==clubId)return {allowed:false,error:'Host configuration outside selected club'};
 if(config.active!==true)return {allowed:false,error:'Host configuration already inactive'};
 if(!Array.isArray(config.host_emails)||config.host_emails.length===0)return {allowed:false,error:'No delegated hosts on this configuration'};
 return {allowed:true,configId:config.id,venueId:config.venue_id||null,venueKey:config.venue_key||'',affectedHostCount:config.host_emails.length};
}
