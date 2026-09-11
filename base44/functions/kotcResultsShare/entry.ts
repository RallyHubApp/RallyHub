import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const RUNTIME_VERSION='kotc-results-2026-09-10-r8';
function token(){const b=new Uint8Array(32);crypto.getRandomValues(b);return Array.from(b).map(x=>x.toString(16).padStart(2,'0')).join('');}
function nowIso(){return new Date().toISOString();}
function firstName(value:any){const raw=String(value||'Player').trim();if(raw.startsWith('[')&&raw.endsWith(']'))return raw;const clean=raw.replace(/,/g,' ').trim();return clean.split(/\s+/)[0]||'Player';}
function hostName(user:any){return String(user?.full_name||user?.name||String(user?.email||'').split('@')[0]||'Session Host').trim();}
function emailTemplate(session:any,recipientName:string,host:string,link:string){return {subject:`${session.name} — your results`,body:`Hi ${firstName(recipientName)},\n\nHere are the results from ${session.name}.\n\nView your results: ${link}\n\nThanks for playing. Looking forward to seeing you on court again soon.\n\nRegards,\n${host}\nSession Host\nRallyHub`};}
const APP_BASE_URL='https://rallyhub.ie';
function validAccess(a:any,tenantId:string,sessionId:string){if(!a||a.status!=='active'||String(a.tenant_id)!==String(tenantId)||String(a.session_id)!==String(sessionId)||a.role!=='session_host')return false;const now=Date.now();if(a.starts_at&&Date.parse(a.starts_at)>now)return false;if(a.ends_at&&Date.parse(a.ends_at)<now)return false;return true;}
function sleep(ms:number){return new Promise(resolve=>setTimeout(resolve,ms));}
function isRateLimit(error:any){return /rate limit|too many requests|\b429\b/i.test(String(error?.message||error||''));}
async function retry<T>(label:string,fn:()=>Promise<T>,attempts=4){let last:any;for(let i=0;i<attempts;i++){try{return await fn();}catch(error){last=error;if(!isRateLimit(error)||i===attempts-1)throw error;await sleep(Math.min(1200,180*Math.pow(2,i))+Math.floor(Math.random()*80));}}throw last;}
function standings(matches:any[],participants:any[]){const s:any=Object.fromEntries((participants||[]).map(p=>[p.id,{id:p.id,player_id:p.player_id,name:p.display_name,wins:0,losses:0,points_for:0,points_against:0,rounds_played:0,court1_rounds:0}]));for(const m of (matches||[]).filter(x=>x.status==='completed')){const a=m.team_a_participant_ids||[],b=m.team_b_participant_ids||[];for(const id of [...a,...b])if(s[id]){s[id].rounds_played++;if(Number(m.ladder_court_rank)===1)s[id].court1_rounds++;}for(const id of a)if(s[id]){s[id].points_for+=Number(m.team_a_score||0);s[id].points_against+=Number(m.team_b_score||0);m.winner_side==='A'?s[id].wins++:s[id].losses++;}for(const id of b)if(s[id]){s[id].points_for+=Number(m.team_b_score||0);s[id].points_against+=Number(m.team_a_score||0);m.winner_side==='B'?s[id].wins++:s[id].losses++;}}return Object.values(s).sort((x:any,y:any)=>y.wins-x.wins||((y.points_for-y.points_against)-(x.points_for-x.points_against))||y.court1_rounds-x.court1_rounds||x.name.localeCompare(y.name)).map((x:any,i)=>({...x,rank:i+1,differential:x.points_for-x.points_against}));}

Deno.serve(async req=>{try{
 const base44=createClientFromRequest(req);const body=await req.json().catch(()=>({}));const action=String(body.action||'');
 if(action==='public_state'){
   const shareToken=String(body.token||'');if(!shareToken)return Response.json({error:'Token required',runtimeVersion:RUNTIME_VERSION},{status:400});
   const share=(await retry('share read',()=>base44.asServiceRole.entities.KotcSessionShare.filter({token:shareToken,status:'active'})))?.[0];if(!share)return Response.json({error:'Results link is invalid or revoked.',runtimeVersion:RUNTIME_VERSION},{status:404});if(share.expires_at&&Date.parse(share.expires_at)<Date.now())return Response.json({error:'Results link has expired.',runtimeVersion:RUNTIME_VERSION},{status:410});
   const session=(await retry('session read',()=>base44.asServiceRole.entities.KotcSession.filter({id:share.session_id})))?.[0];if(!session)return Response.json({error:'Session not found.',runtimeVersion:RUNTIME_VERSION},{status:404});
   const participants=await retry('participants read',()=>base44.asServiceRole.entities.KotcSessionParticipant.filter({session_id:session.id}));
   const matches=await retry('matches read',()=>base44.asServiceRole.entities.KotcMatch.filter({session_id:session.id}));
   const rounds=await retry('rounds read',()=>base44.asServiceRole.entities.KotcRound.filter({session_id:session.id}));
   const names=Object.fromEntries((participants||[]).map((p:any)=>[p.id,p.display_name]));
   const completedMatches=(matches||[]).filter((m:any)=>m.status==='completed');
   const publicMatches=completedMatches.sort((a:any,b:any)=>Number(a.round_number)-Number(b.round_number)||Number(a.ladder_court_rank)-Number(b.ladder_court_rank)).map((m:any)=>({round_number:m.round_number,court:m.ladder_court_rank,status:m.status,team_a:(m.team_a_participant_ids||[]).map((id:string)=>names[id]||'Player'),team_b:(m.team_b_participant_ids||[]).map((id:string)=>names[id]||'Player'),team_a_score:m.team_a_score,team_b_score:m.team_b_score,winner_side:m.winner_side,result_method:m.result_method}));
   const finished=['completed','finalised'].includes(session.status);
   const completedRounds=(rounds||[]).filter((r:any)=>r.status==='completed').sort((a:any,b:any)=>Number(a.round_number)-Number(b.round_number));
   // After finish, the public page must anchor to the last round actually played. A prepared
   // but unplayed next round is not the final round and must never replace the final results.
   const currentRound=finished?(completedRounds.at(-1)||null):((rounds||[]).filter((r:any)=>Number(r.round_number)===Number(session.current_round_number)&&!['superseded','abandoned'].includes(r.status)).sort((a:any,b:any)=>Number(b.proposal_revision||0)-Number(a.proposal_revision||0))[0]||null);
   const rawCurrentMatches=currentRound?(matches||[]).filter((m:any)=>String(m.round_id)===String(currentRound.id)&&(!finished||m.status==='completed')).sort((a:any,b:any)=>Number(a.ladder_court_rank)-Number(b.ladder_court_rank)):[];
   const currentMatches=rawCurrentMatches.map((m:any)=>({round_number:m.round_number,court:m.ladder_court_rank,status:m.status,team_a:(m.team_a_participant_ids||[]).map((id:string)=>names[id]||'Player'),team_b:(m.team_b_participant_ids||[]).map((id:string)=>names[id]||'Player'),team_a_score:m.team_a_score,team_b_score:m.team_b_score,winner_side:m.winner_side}));
   const assigned=new Set(rawCurrentMatches.flatMap((m:any)=>[...(m.team_a_participant_ids||[]),...(m.team_b_participant_ids||[])]));const bench=finished?[]:(participants||[]).filter((p:any)=>['registered','confirmed','present','leaving_early'].includes(p.status)&&!assigned.has(p.id)).map((p:any)=>p.display_name);
   let timer:any={};try{timer=session.timer_state_json?JSON.parse(session.timer_state_json):{};}catch{}if(timer.running&&timer.deadlineAt)timer.remainingSeconds=Math.max(0,Math.ceil((Date.parse(timer.deadlineAt)-Date.now())/1000));
   const table=standings(matches||[],participants||[]);
   // public_state is deliberately read-only. Do not write analytics on every spectator poll.
   return Response.json({session:{name:session.name,status:session.status,current_round_number:finished?currentRound?.round_number:session.current_round_number,scoring_mode:session.scoring_mode,actual_session_end:session.actual_session_end},completed_rounds:completedRounds.length,current_round:currentRound?{round_number:currentRound.round_number,status:currentRound.status}:null,current_matches:currentMatches,bench,timer,standings:table,matches:publicMatches,podium:finished?table.slice(0,3):[],finished,poll_after_ms:finished?0:12000,runtimeVersion:RUNTIME_VERSION});
 }
 const user=await base44.auth.me();if(!user)return Response.json({error:'Unauthorized',runtimeVersion:RUNTIME_VERSION},{status:401});
 if(action==='management_state'){
   const shareToken=String(body.token||'');if(!shareToken)return Response.json({error:'Token required',runtimeVersion:RUNTIME_VERSION},{status:400});
   const share=(await retry('management share read',()=>base44.asServiceRole.entities.KotcSessionShare.filter({token:shareToken,status:'active'})))?.[0];if(!share)return Response.json({error:'Results link is invalid or revoked.',runtimeVersion:RUNTIME_VERSION},{status:404});
   const session=(await retry('management session read',()=>base44.asServiceRole.entities.KotcSession.filter({id:share.session_id})))?.[0];if(!session)return Response.json({error:'Session not found.',runtimeVersion:RUNTIME_VERSION},{status:404});
   let allowed=user.role==='admin';let role=user.role==='admin'?'admin':null;
   if(!allowed){const grants=await retry('management access read',()=>base44.asServiceRole.entities.KotcSessionAccess.filter({session_id:session.id,user_id:user.id,status:'active'}));const valid=(grants||[]).filter((a:any)=>validAccess(a,session.tenant_id,session.id));allowed=valid.length>0;role=valid[0]?.role||null;}
   if(!allowed)return Response.json({error:'Host access required',runtimeVersion:RUNTIME_VERSION},{status:403});
   const participants=await retry('management participants',()=>base44.asServiceRole.entities.KotcSessionParticipant.filter({session_id:session.id}));
   const matches=await retry('management matches',()=>base44.asServiceRole.entities.KotcMatch.filter({session_id:session.id}));
   const names=Object.fromEntries((participants||[]).map((p:any)=>[p.id,p.display_name]));
   const editableMatches=(matches||[]).filter((m:any)=>m.status==='completed').sort((a:any,b:any)=>Number(a.round_number)-Number(b.round_number)||Number(a.ladder_court_rank)-Number(b.ladder_court_rank)).map((m:any)=>({id:m.id,round_id:m.round_id,round_number:m.round_number,court:m.ladder_court_rank,team_a_participant_ids:m.team_a_participant_ids||[],team_b_participant_ids:m.team_b_participant_ids||[],team_a:(m.team_a_participant_ids||[]).map((id:string)=>names[id]||'Player'),team_b:(m.team_b_participant_ids||[]).map((id:string)=>names[id]||'Player'),team_a_score:m.team_a_score,team_b_score:m.team_b_score,winner_side:m.winner_side,result_method:m.result_method,serving_side_at_horn:m.serving_side_at_horn,revision:m.revision||0}));
   return Response.json({canManage:true,role,sessionId:session.id,tournamentId:session.tournament_id,sessionName:session.name,matches:editableMatches,runtimeVersion:RUNTIME_VERSION});
 }
 let sessionId=String(body.sessionId||'');let session:any=null;
 if(action==='get_or_create_by_tournament'){
   const tournamentId=String(body.tournamentId||'');if(!tournamentId)return Response.json({error:'tournamentId required',runtimeVersion:RUNTIME_VERSION},{status:400});
   const sessions=(await retry('tournament results session read',()=>base44.asServiceRole.entities.KotcSession.filter({tournament_id:tournamentId})))||[];
   session=sessions.filter((s:any)=>!['cancelled'].includes(s.status)).sort((a:any,b:any)=>Date.parse(b.created_date||0)-Date.parse(a.created_date||0))[0]||null;
   if(!session)return Response.json({error:'No KOTC session found for this tournament.',runtimeVersion:RUNTIME_VERSION},{status:404});
   sessionId=String(session.id);
 }else{
   if(!sessionId)return Response.json({error:'sessionId required',runtimeVersion:RUNTIME_VERSION},{status:400});
   session=(await retry('host session read',()=>base44.asServiceRole.entities.KotcSession.filter({id:sessionId})))?.[0]||null;
 }
 if(!session)return Response.json({error:'Session not found',runtimeVersion:RUNTIME_VERSION},{status:404});
 let allowed=user.role==='admin';if(!allowed){const grants=await retry('host access read',()=>base44.asServiceRole.entities.KotcSessionAccess.filter({session_id:session.id,user_id:user.id,status:'active'}));allowed=(grants||[]).some((a:any)=>validAccess(a,session.tenant_id,session.id));}if(!allowed)return Response.json({error:'Primary session host access required',runtimeVersion:RUNTIME_VERSION},{status:403});
 let shares=await retry('existing share read',()=>base44.asServiceRole.entities.KotcSessionShare.filter({session_id:session.id,status:'active'}));let share=(shares||[]).sort((a:any,b:any)=>Date.parse(b.created_date||0)-Date.parse(a.created_date||0))[0]||null;
 if(action==='revoke'){if(share)await retry('revoke share',()=>base44.asServiceRole.entities.KotcSessionShare.update(share.id,{status:'revoked'}));return Response.json({success:true,runtimeVersion:RUNTIME_VERSION});}
 // Results links do not expire automatically. They remain available after Finish until explicitly revoked.
 if(!share){share=await retry('create share',()=>base44.asServiceRole.entities.KotcSessionShare.create({tenant_id:session.tenant_id,club_id:session.club_id,session_id:session.id,tournament_id:session.tournament_id,token:token(),status:'active',created_by_user_id:user.id}));}
 if(action==='get_or_create'||action==='get_or_create_by_tournament')return Response.json({success:true,token:share.token,shareId:share.id,livePath:`/kotc-live/${share.token}`,permanent:true,runtimeVersion:RUNTIME_VERSION});
 if(action==='email_preview'||action==='email_players'){
   if(session.demo_mode===true||session.exclude_from_aggregates===true)return Response.json({error:'Email Players is disabled for KOTC Test Sandbox / excluded sessions.',runtimeVersion:RUNTIME_VERSION},{status:403});
   const link=`${APP_BASE_URL}/kotc-live/${share.token}`;const resend=body.resend===true;const host=hostName(user);
   const participants=await retry('email participants',()=>base44.asServiceRole.entities.KotcSessionParticipant.filter({session_id:session.id}));const emailableParticipants=(participants||[]).filter((p:any)=>p.player_id&&p.participant_type!=='guest');const playerIds=[...new Set(emailableParticipants.map((p:any)=>p.player_id).filter(Boolean))];const players=playerIds.length?await retry('email players',()=>base44.asServiceRole.entities.Player.filter({id:{$in:playerIds}})):[];const byId=Object.fromEntries((players||[]).map((p:any)=>[p.id,p]));
   const recipientRows=emailableParticipants.map((p:any)=>({participant:p,player:byId[p.player_id],email:String(byId[p.player_id]?.email||'').trim().toLowerCase()}));const uniqueEmails=new Set<string>();const validRecipients=recipientRows.filter((r:any)=>r.email&&!uniqueEmails.has(r.email)&&(uniqueEmails.add(r.email),true));const guestOrUnlinked=Math.max(0,(participants||[]).length-emailableParticipants.length);const missingOrDuplicate=Math.max(0,recipientRows.length-validRecipients.length);const linkedAppUsers=validRecipients.filter((r:any)=>!!(r.player?.user_id||r.player?.linked_user_email)).length;const sample=emailTemplate(session,'[First name]',host,link);
   if(action==='email_preview')return Response.json({success:true,transport:'base44_builtin',transportReady:false,transportMessage:`Club-wide email is not connected yet. Base44 built-in email can only send to registered RallyHub app users (${linkedAppUsers} of ${validRecipients.length} recipients appear linked). Connect Gmail or another external provider before sending.`,fromName:`${host} via RallyHub`,hostName:host,subject:sample.subject,sampleBody:sample.body,recipientCount:validRecipients.length,guestOrUnlinked,missingOrDuplicate,link,runtimeVersion:RUNTIME_VERSION});
   // Never partially send a club-results email through Base44's registered-user-only service.
   // Partial delivery is worse than an explicit block because the host cannot know who received it.
   return Response.json({error:`Club-wide email is not connected. Base44 built-in email only supports registered RallyHub app users (${linkedAppUsers} of ${validRecipients.length} recipients appear linked). Connect Gmail or another external email provider before using Email Players.`,transportReady:false,recipientCount:validRecipients.length,linkedAppUsers,runtimeVersion:RUNTIME_VERSION},{status:409});
 }
 return Response.json({error:'Unknown action',runtimeVersion:RUNTIME_VERSION},{status:400});
}catch(error){return Response.json({error:(error as any)?.message||'Unexpected results-share error',runtimeVersion:RUNTIME_VERSION},{status:isRateLimit(error)?503:500});}});