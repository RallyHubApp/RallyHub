import {directoryEmailHash} from './directoryAudience.ts';
/** Generate a non-sending delivery plan. No provider calls, tenant records, or live mail. */
export async function directoryDeliveryPlan(campaign,audience,now=new Date()) {
 const issues=[];
 if(campaign?.status!=='approved')issues.push('Campaign content is not approved');
 if(campaign?.channel!=='email')issues.push('Unsupported campaign channel');
 if(!campaign?.subject?.trim()||!campaign?.body_text?.trim())issues.push('Subject and content required');
 if(campaign?.sender_email!=='rallyhubapp@gmail.com')issues.push('Unapproved sender');
 if(!audience?.eligible?.length)issues.push('No currently eligible consented recipients');
 if((audience?.eligible?.length||0)>250)issues.push('Audience exceeds controlled preparation batch of 250');
 const entries=[];
 if(!issues.length){for(const person of audience.eligible){
   if(!person.subscriberId||!person.email||!person.consentVersion){issues.push('Incomplete subscriber consent evidence');break;}
   entries.push({campaign_id:campaign.id,subscriber_id:person.subscriberId,recipient_hash:await directoryEmailHash(person.email),idempotency_key:await directoryEmailHash(`${campaign.id}:${person.subscriberId}`),status:'prepared',consent_version_snapshot:person.consentVersion,purpose_snapshot:campaign.purpose,created_at:now.toISOString(),attempt_count:0});
 }}
 return {eligibleCount:audience?.eligibleCount||0,preparedCount:issues.length?0:entries.length,issues,entries:issues.length?[]:entries,externalSendEnabled:false,providerAcceptanceConfirmed:false,deliveryConfirmed:false,requiresLiveConsentRecheck:true};
}
