import {createClientFromRequest} from 'npm:@base44/sdk@0.8.48';
import {activeHost,validateReport} from './policy.mjs';
import {readCccAccess} from './accessGate.mjs';
import {isConfiguredHost} from './hostPolicy.mjs';
import {qualificationState,kitState,approvedGuidance} from './readiness.mjs';
const fail=(error:string,status=400)=>Response.json({error},{status});
Deno.serve(async req=>{
 if(req.method!=='POST')return fail('POST required',405);
 try{
 const sdk=createClientFromRequest(req),user=await sdk.auth.me().catch(()=>null);
 const body=await req.json(),e=sdk.asServiceRole.entities;
 if(!user&&body.source!=='tournival')return fail('Authentication required',401);
 if(body.source==='tournival'){
 const token=typeof body.token==='string'?body.token:'';
 if(!/^th_[0-9a-f]{48}$/.test(token))return fail('Invalid host link',403);
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
 const hash=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
 const links=await e.TournivalAccessToken.filter({token_hash:hash,token_type:'host'},'-created_at',5);
 const link=links?.find(l=>!l.revoked_at&&(!l.expires_at||Date.parse(l.expires_at)>Date.now()));
 if(!link)return fail('Host link expired or revoked',403);
 const event=(await e.Tournament.filter({id:link.tournament_id,tenant_id:link.tenant_id}))?.[0];
 if(!event||String(event.format).toLowerCase()!=='tournival'||!event.host_club_id)return fail('Tournival unavailable',404);
 const sessions=await e.TournivalSession.filter({tournament_id:event.id,tenant_id:event.tenant_id},'-created_at',5);
 if(sessions?.length!==1||sessions[0].rehearsal)return fail('Live session unavailable',409);
 if(body.action==='validate'){const errors=validateReport(body);if(!event.venue_id)errors.push('Verified venue reference required');return Response.json({success:!errors.length,errors,submissionEnabled:false});}
 return fail('Action unavailable pending security acceptance',409);
 }
 if(body.action==='admin_summary'){
 const scope={tenant_id:user.active_tenant_id,club_id:user.active_club_id};
 if(!scope.tenant_id||!scope.club_id||!(await readCccAccess(sdk,user,scope.tenant_id,scope.club_id)).admin)return fail('Club administrator required',403);
 const names=['SafetyIncident','SafetyVenueProfile','SafetyFirstAider','SafetyKitItem','SafetyFollowUp','SafetyGuidance'];
 const rows=await Promise.all(names.map(name=>e[name].filter(scope,'-created_date',100)));
 return Response.json({success:true,counts:Object.fromEntries(names.map((name,i)=>[name,rows[i].length])),readiness:{qualificationReview:rows[2].filter(r=>qualificationState(r)!=='current').length,stockReview:rows[3].filter(r=>kitState(r)!=='ready').length,guidancePending:rows[5].filter(r=>!approvedGuidance(r)).length},possiblyTruncated:rows.some(r=>r.length===100)});
 }
 if(typeof body.sessionId!=='string')return fail('Session required');
 let session:any,allowed=false;
 if(body.source==='kotc'){
 session=(await e.KotcSession.filter({id:body.sessionId}))?.[0];
 if(session){const grants=await e.KotcSessionAccess.filter({tenant_id:session.tenant_id,club_id:session.club_id,session_id:session.id,user_id:user.id,status:'active'});allowed=grants.some(g=>activeHost(g));}
 }else if(body.source==='activity'){
 session=(await e.ClubActivity.filter({id:body.sessionId,tenant_id:user.active_tenant_id,club_id:user.active_club_id}))?.[0];
 if(session){const access=await readCccAccess(sdk,user,session.tenant_id,session.club_id);
 const venue=(await e.Venue.filter({id:session.venue_id,tenant_id:session.tenant_id,club_id:session.club_id,status:'active'}))?.[0];
 const configs=await e.MembershipVenueHostConfig.filter({tenant_id:session.tenant_id,club_id:session.club_id,active:true},'-updated_date',100);
 allowed=access.admin||(access.member&&user.approval_status==='approved'&&configs.length<100&&isConfiguredHost(configs,venue,user.email));}
 }else return fail('Unsupported session source');
 if(!session||!session.tenant_id||!session.club_id)return fail('Session unavailable',404);
 const scope={tenant_id:session.tenant_id,club_id:session.club_id};
 if(!allowed&&!(await readCccAccess(sdk,user,scope.tenant_id,scope.club_id)).admin)return fail('Host access required',403);
 if(body.action==='context'){
 const venue=session.venue_id?(await e.Venue.filter({...scope,id:session.venue_id}))?.[0]:null;
 const profile=venue?(await e.SafetyVenueProfile.filter({...scope,venue_id:venue.id}))?.[0]:null;
 return Response.json({success:true,venue:venue?{id:venue.id,name:venue.name,address:venue.address}:null,profile:profile?.verified_at?{eircode:profile.eircode,aed_location:profile.aed_location,ambulance_access:profile.ambulance_access,kit_location:profile.kit_location,verified_at:profile.verified_at}:null});
 }
 // Submission remains disabled until isolated persistence and concurrency are verified.
 if(body.action==='validate'){
 const errors=validateReport(body);
 if(!session.venue_id)errors.push('Verified venue reference required');
 return Response.json({success:errors.length===0,errors,submissionEnabled:false});
 }
 return fail('Action unavailable pending security acceptance',409);
 }catch{return fail('Safety service unavailable',500);}
});
