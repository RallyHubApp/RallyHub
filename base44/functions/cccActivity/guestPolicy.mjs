/** Advisory Clare guest venue access; booking backend remains authoritative. */
const aliases=new Map([
 ['ennis','ennis'],['doorabarefield','ennis'],['doora','ennis'],['stjosephsdoorabarefield','ennis'],['stjosephsdoorabarefieldgaaclub','ennis'],
 ['ennistymon','ennistymon'],['ennistymoncommunitycentre','ennistymon'],
 ['shannon','shannon'],['clarecastle','clarecastle'],['corofin','corofin'],['corofinclaregaasportshall','corofin']
]);
export const guestVenueKey=value=>String(value||'').trim().toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
export function guestVenueReview({venue,experience,sessionActive=true,tenantId,clubId}={}){
 const issues=[];
 if(!tenantId||!clubId||!venue||venue.tenant_id!==tenantId||venue.club_id!==clubId||venue.status!=='active')issues.push('venue_outside_active_club');
 if(!['beginner','experienced'].includes(experience))issues.push('experience_required');
 if(!sessionActive)issues.push('session_closed');
 const key=aliases.get(guestVenueKey(venue?.name));
 if(!key)issues.push('venue_policy_unmapped');
 if(experience==='beginner'&&key==='ennis')issues.push('beginner_ennis_restricted');
 return {eligible:issues.length===0,issues,venueId:venue?.id||null,venuePolicyKey:key||null,experience,approvalRequired:true,bookingCreated:false,paymentInitiated:false,mutationPerformed:false};
}
