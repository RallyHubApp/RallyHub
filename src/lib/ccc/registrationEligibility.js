/** Experience-based guest access preflight. Never infers experience from age. */
export function guestSessionEligibility({experienceLevel,venueKey,restrictedBeginnerVenueKeys=[],sessionActive=true,sessionDate,nowDate}={}){
 const issues=[];
 if(!['beginner','experienced'].includes(experienceLevel))issues.push('experience_required');
 if(!venueKey)issues.push('venue_required');
 if(!sessionActive)issues.push('session_closed');
 if(sessionDate&&nowDate&&sessionDate<nowDate)issues.push('session_in_past');
 if(experienceLevel==='beginner'&&restrictedBeginnerVenueKeys.includes(venueKey))issues.push('beginner_venue_restricted');
 return {eligible:issues.length===0,issues};
}
