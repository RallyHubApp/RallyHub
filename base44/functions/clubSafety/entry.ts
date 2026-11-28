import {createClientFromRequest} from 'npm:@base44/sdk@0.8.48';
import {activeHost,validateReport} from './policy.mjs';
const fail=(error:string,status=400)=>Response.json({error},{status});
Deno.serve(async req=>{
 if(req.method!=='POST')return fail('POST required',405);
 try{
 const sdk=createClientFromRequest(req),user=await sdk.auth.me().catch(()=>null);
 if(!user)return fail('Authentication required',401);
 const body=await req.json(),e=sdk.asServiceRole.entities;
 // Initial adapter: KOTC only. Other sources fail closed pending their own access integration.
 if(body.source!=='kotc'||typeof body.sessionId!=='string')return fail('Unsupported session source',400);
 const session=(await e.KotcSession.filter({id:body.sessionId}))?.[0];
 if(!session||!session.tenant_id||!session.club_id)return fail('Session unavailable',404);
 const scope={tenant_id:session.tenant_id,club_id:session.club_id};
 const grants=await e.KotcSessionAccess.filter({...scope,session_id:session.id,user_id:user.id,status:'active'});
 if(user.role!=='admin'&&!grants.some(g=>activeHost(g)))return fail('Host access required',403);
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
