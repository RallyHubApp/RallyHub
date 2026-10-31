/** Re-evaluate current directory guest policy at approval, not only at application. */
export function assessGuestApprovalPolicy({experienceLevel,session,venue,beginnerSessionKeys=[]}:any){
 const issues:string[]=[];
 const level=String(experienceLevel||'').trim().toLowerCase();
 if(!['beginner','experienced'].includes(level))issues.push('experience_invalid');
 if(!session?.id||!session?.venueId||!venue?.id||String(session.venueId)!==String(venue.id))issues.push('session_venue_mismatch');
 if(session?.guestEligible===false)issues.push('session_guest_disabled');
 const isDoora=/doora\s*[-–]?\s*barefield|st\.?\s*joseph'?s/i.test(String(venue?.name||''))||
  String(venue?.id||'')==='doora-barefield'||/\bdb-(?:mon|thu)-/i.test(String(session?.id||''));
 const beginnerAllowed=!isDoora&&(beginnerSessionKeys.length>0?
  beginnerSessionKeys.map(String).includes(String(session?.id)):session?.beginnerGuestEligible===true);
 if(level==='beginner'&&!beginnerAllowed)issues.push('beginner_session_restricted');
 return {allowed:issues.length===0,issues,requiresHostApproval:true};
}
