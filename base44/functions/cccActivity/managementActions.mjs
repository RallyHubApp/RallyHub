/** Strict validation for explicit, admin-confirmed host venue mapping. */
export function validateHostVenueMapping(config,venue,{tenantId,clubId,expectedVenueId}={}){
 if(!config||!venue)return 'Host configuration or venue not found';
 if(config.tenant_id!==tenantId||config.club_id!==clubId||venue.tenant_id!==tenantId||venue.club_id!==clubId)return 'Venue and configuration must belong to the selected club';
 if(venue.status!=='active')return 'Venue is not active';
 if(config.active!==true)return 'Host configuration is inactive';
 if(config.venue_id&&config.venue_id!==expectedVenueId)return 'Host configuration already maps to another venue';
 if(venue.id!==expectedVenueId)return 'Venue selection changed';
 if(!Array.isArray(config.host_emails)||config.host_emails.length===0)return 'No delegated hosts configured';
 return null;
}
export function validatePersonAccessLink(access,person,{tenantId,clubId,expectedPersonId}={}){
 if(!access||!person)return 'Access record or person not found';
 if(access.tenant_id!==tenantId||access.club_id!==clubId||person.tenant_id!==tenantId)return 'Person and access must belong to the selected tenant and club';
 if(access.status!=='active')return 'Only active access can be linked';
 if(access.person_id&&access.person_id!==expectedPersonId)return 'Access is already linked to another person';
 if(person.id!==expectedPersonId)return 'Person selection changed';
 return null;
}
