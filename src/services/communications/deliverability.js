export function preflight({campaign,message,audience,domain={},metrics={},now=new Date()}){
 const issues=[],warnings=[];if(!campaign?.purpose)issues.push("purpose_missing");if(!audience?.eligible_count)issues.push("no_eligible_recipients");
 if(message?.channel==="email"&&(!message.html_body||!message.plain_text_body))issues.push("dual_email_required");
 if(campaign?.kind==="campaign"&&!campaign?.audience_definition?.provenance)issues.push("list_provenance_required");
 if(message?.channel==="email"&&domain.dmarc===false)warnings.push("dmarc_unhealthy");if(message?.channel==="email"&&domain.dkim===false)warnings.push("dkim_unhealthy");
 if(Number(metrics.hard_bounce_rate||0)>=0.05)issues.push("hard_bounce_circuit_breaker");if(Number(metrics.complaint_rate||0)>=0.003)issues.push("complaint_circuit_breaker");
 const volume=Number(audience?.eligible_count||0);if(volume>500)warnings.push("staged_send_recommended");const risk=issues.length?"red":warnings.length?"amber":"green";
 return{risk,allowed:!issues.length,issues,warnings,checked_at:now.toISOString(),recommended_batch_size:volume>1000?100:volume>250?50:Math.max(volume,1)};
}
export function communicationPressure({last7Days=0,last24Hours=0}){if(last24Hours>=4||last7Days>=10)return"over_contacted";if(last24Hours>=2||last7Days>=6)return"high";if(last7Days>=3)return"normal";return"low"}
export function safetyWindow({queuedAt,seconds=30,now=new Date()}){const release=new Date(new Date(queuedAt).getTime()+seconds*1000);return{releasable:now>=release,release_at:release.toISOString()}}
