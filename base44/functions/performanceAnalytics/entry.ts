import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const VERSION='performance-2026-09-27-v1';
const DAY=86400000;
const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,n));
const clean=(v:any)=>String(v??'').trim();
const dateMs=(v:any)=>{const n=Date.parse(String(v||''));return Number.isFinite(n)?n:0;};
const fmtGroup=(v:any)=>{const s=String(v||'Tournament');if(s==='King of the Court')return 'KOTC';if(s==='Club Challenge'||/interclub/i.test(s))return 'Interclub';if(s==='Tournival')return 'Tournival';return 'Tournament';};
const logistic=(a:number,b:number)=>1/(1+Math.pow(10,(b-a)/400));
const kFor=(matches:number)=>matches<10?32:matches<30?24:16;
const round1=(n:number)=>Math.round(n*10)/10;

function seasonBounds(now=new Date()){
  const y=now.getFullYear(),m=now.getMonth();
  const startYear=m>=8?y:y-1;
  return {label:`${startYear}–${String(startYear+1).slice(-2)}`,start:`${startYear}-09-01T00:00:00.000Z`,end:`${startYear+1}-09-01T00:00:00.000Z`};
}

type CMatch={id:string,event_id:string,event_name:string,format:string,date:string,round:any,court:any,teamA:string[],teamB:string[],scoreA:number,scoreB:number,winner:'A'|'B'|'draw'};

function eligiblePlayer(p:any){
  const status=String(p.status||'Active').toLowerCase();
  const rel=String(p.relationship_type||'member').toLowerCase();
  const relStatus=String(p.relationship_status||'active').toLowerCase();
  return status==='active'&&relStatus!=='archived'&&['member',''].includes(rel);
}

function emptyStat(player:any){return {
  player_id:String(player.id),full_name:player.full_name||'Player',events:new Set<string>(),matches_played:0,wins:0,draws:0,losses:0,
  points_for:0,points_against:0,leaderboard_points:0,formats:{} as any,results:[] as any[],firsts:0,seconds:0,thirds:0
};}
function addStat(row:any,m:CMatch,side:'A'|'B'){
  const pf=side==='A'?m.scoreA:m.scoreB,pa=side==='A'?m.scoreB:m.scoreA;
  const result=m.winner==='draw'?'draw':m.winner===side?'win':'loss';
  row.events.add(m.event_id);row.matches_played++;row.points_for+=pf;row.points_against+=pa;
  if(result==='win'){row.wins++;row.leaderboard_points+=2;}else if(result==='draw'){row.draws++;row.leaderboard_points+=1;}else row.losses++;
  const f=row.formats[m.format]||(row.formats[m.format]={matches_played:0,wins:0,draws:0,losses:0,points_for:0,points_against:0,leaderboard_points:0,events:new Set<string>()});
  f.matches_played++;f.points_for+=pf;f.points_against+=pa;f.events.add(m.event_id);if(result==='win'){f.wins++;f.leaderboard_points+=2;}else if(result==='draw'){f.draws++;f.leaderboard_points++;}else f.losses++;
  row.results.push({id:m.id,event_id:m.event_id,event_name:m.event_name,format:m.format,date:m.date,round:m.round,court:m.court,result,score_for:pf,score_against:pa,partner_ids:(side==='A'?m.teamA:m.teamB).filter((x:string)=>x!==row.player_id),opponent_ids:side==='A'?m.teamB:m.teamA});
}
function finalize(row:any){
  const diff=row.points_for-row.points_against;
  const formats:any={};for(const [k,v] of Object.entries(row.formats) as any){formats[k]={...v,events_played:v.events.size,score_difference:v.points_for-v.points_against,win_rate:v.matches_played?v.wins/v.matches_played:0};delete formats[k].events;}
  return {...row,events_played:row.events.size,score_difference:diff,avg_points_for:row.matches_played?row.points_for/row.matches_played:0,avg_points_against:row.matches_played?row.points_against/row.matches_played:0,avg_difference:row.matches_played?diff/row.matches_played:0,win_rate:row.matches_played?row.wins/row.matches_played:0,formats};
}
function rowsFrom(matches:CMatch[],players:any[]){
  const byId=new Map(players.map((p:any)=>[String(p.id),p]));const stats:any={};
  const ensure=(pid:string)=>{if(!stats[pid]&&byId.has(pid))stats[pid]=emptyStat(byId.get(pid));return stats[pid]||null;};
  for(const m of matches){for(const pid of m.teamA){const r=ensure(pid);if(r)addStat(r,m,'A');}for(const pid of m.teamB){const r=ensure(pid);if(r)addStat(r,m,'B');}}
  return Object.values(stats).map(finalize).filter((r:any)=>r.matches_played>0).sort((a:any,b:any)=>b.leaderboard_points-a.leaderboard_points||b.wins-a.wins||b.score_difference-a.score_difference||b.points_for-a.points_for||String(a.full_name).localeCompare(String(b.full_name))).map((r:any,i:number)=>{const out={...r,rank:i+1};delete out.events;return out;});
}

async function context(base44:any,user:any){
  let tenantId=clean(user.active_tenant_id),clubId=clean(user.active_club_id),player:any=null;
  if(tenantId&&clubId){const rows=await base44.asServiceRole.entities.Player.filter({tenant_id:tenantId,club_id:clubId,user_id:user.id},'-updated_date',10);player=rows?.[0]||null;}
  if(!player&&user.email){const rows=await base44.asServiceRole.entities.Player.filter({linked_user_email:String(user.email).toLowerCase()},'-updated_date',10);player=rows?.[0]||null;}
  if(!player&&user.email){const rows=await base44.asServiceRole.entities.Player.filter({email:String(user.email).toLowerCase()},'-updated_date',10);player=rows?.[0]||null;}
  tenantId=tenantId||clean(player?.tenant_id);clubId=clubId||clean(player?.club_id);
  if(!tenantId||!clubId)throw Object.assign(new Error('No active RallyHub club context.'),{status:400});
  return {tenantId,clubId,player};
}

async function canonical(base44:any,tenantId:string,clubId:string){
  const [playersAll,tournaments,kotcSessions,challengeEvents,tpRows]=await Promise.all([
    base44.asServiceRole.entities.Player.filter({tenant_id:tenantId,club_id:clubId},'full_name',500),
    base44.asServiceRole.entities.Tournament.filter({tenant_id:tenantId},'-created_date',500),
    base44.asServiceRole.entities.KotcSession.filter({tenant_id:tenantId,club_id:clubId},'-created_date',300),
    base44.asServiceRole.entities.ClubChallengeEvent.filter({tenant_id:tenantId},'-created_date',300),
    base44.asServiceRole.entities.TournamentParticipant.filter({tenant_id:tenantId},'-created_date',500),
  ]);
  const players=(playersAll||[]).filter(eligiblePlayer);const memberIds=new Set(players.map((p:any)=>String(p.id)));
  const tById=new Map((tournaments||[]).map((t:any)=>[String(t.id),t]));const out:CMatch[]=[];const kotcByPlayer=new Map<string,any>();

  const eligibleKotc=(kotcSessions||[]).filter((s:any)=>['completed','finalised'].includes(String(s.status))&&!s.demo_mode&&!s.exclude_from_aggregates&&tById.get(String(s.tournament_id))?.counts_toward_leaderboard!==false);
  for(const s of eligibleKotc){
    const [parts,matches]=await Promise.all([
      base44.asServiceRole.entities.KotcSessionParticipant.filter({session_id:s.id},'display_name',200),
      base44.asServiceRole.entities.KotcMatch.filter({session_id:s.id,status:'completed'},'round_number',500)
    ]);
    const pmap=new Map((parts||[]).map((p:any)=>[String(p.id),String(p.player_id||'')]));
    for(const part of parts||[]){const pid=String(part.player_id||'');if(!memberIds.has(pid))continue;const partId=String(part.id);const played=(matches||[]).filter((m:any)=>m.status==='completed'&&[...(m.team_a_participant_ids||[]),...(m.team_b_participant_ids||[])].map(String).includes(partId)).sort((a:any,b:any)=>Number(a.round_number)-Number(b.round_number));if(!played.length)continue;const courts=played.map((m:any)=>Number(m.ladder_court_rank||0)).filter((n:number)=>n>0);let up=0,down=0,stay=0;for(let i=1;i<courts.length;i++){if(courts[i]<courts[i-1])up++;else if(courts[i]>courts[i-1])down++;else stay++;}const finalRank=Number(part.final_rank||0)||null;const podium=part.podium_group&&part.podium_group!=='none'?part.podium_group:(finalRank===1?'gold':finalRank===2?'silver':finalRank===3?'bronze':'none');const sessionDate=s.actual_session_end||s.scheduled_start||s.created_date||'';const aggregate=kotcByPlayer.get(pid)||{sessions:[]};aggregate.sessions.push({session_id:String(s.id),name:s.name||'King of the Court',date:sessionDate,rounds_played:played.length,starting_court:courts[0]||null,finishing_court:courts.at(-1)||null,moves_up:up,moves_down:down,stayed:stay,court1_rounds:courts.filter((c:number)=>c===1).length,final_rank:finalRank,podium_group:podium});kotcByPlayer.set(pid,aggregate);}
    for(const m of matches||[]){if(!['A','B'].includes(String(m.winner_side||'')))continue;const A=(m.team_a_participant_ids||[]).map((x:any)=>pmap.get(String(x))||'').filter((x:string)=>memberIds.has(x));const B=(m.team_b_participant_ids||[]).map((x:any)=>pmap.get(String(x))||'').filter((x:string)=>memberIds.has(x));if(!A.length&&!B.length)continue;out.push({id:`kotc:${m.id}`,event_id:String(s.id),event_name:s.name||'King of the Court',format:'KOTC',date:m.completed_at||s.actual_session_end||s.scheduled_start||s.created_date||'',round:m.round_number??null,court:m.ladder_court_rank??null,teamA:A,teamB:B,scoreA:Number(m.team_a_score||0),scoreB:Number(m.team_b_score||0),winner:m.winner_side});}
  }

  const eligibleChallenges=(challengeEvents||[]).filter((e:any)=>e.status==='completed'&&tById.get(String(e.tournament_id))?.counts_toward_leaderboard===true);
  for(const e of eligibleChallenges){
    const [parts,matches]=await Promise.all([
      base44.asServiceRole.entities.ClubChallengeParticipant.filter({challenge_event_id:e.id},'display_name',200),
      base44.asServiceRole.entities.ClubChallengeMatch.filter({challenge_event_id:e.id},'round_number',500)
    ]);
    const pmap=new Map((parts||[]).map((p:any)=>[String(p.id),String(p.source_player_id||'')]));const t:any=tById.get(String(e.tournament_id));
    for(const m of matches||[]){if(!['completed','draw','retired','forfeit'].includes(String(m.status||''))||m.is_showcase)continue;const A=(m.club_a_participant_ids||[]).map((x:any)=>pmap.get(String(x))||'').filter((x:string)=>memberIds.has(x));const B=(m.club_b_participant_ids||[]).map((x:any)=>pmap.get(String(x))||'').filter((x:string)=>memberIds.has(x));if(!A.length&&!B.length)continue;const winner=m.winner==='club_a'?'A':m.winner==='club_b'?'B':'draw';out.push({id:`interclub:${m.id}`,event_id:String(e.id),event_name:t?.name||`${e.club_a_name||'Club A'} vs ${e.club_b_name||'Club B'}`,format:'Interclub',date:m.scored_at||e.finalised_at||t?.start_date||e.created_date||'',round:m.round_number??null,court:m.court_number??null,teamA:A,teamB:B,scoreA:Number(m.score_a||0),scoreB:Number(m.score_b||0),winner});}
  }

  for(const t of tournaments||[]){
    if(t.status!=='Completed'||t.counts_toward_leaderboard!==true)continue;
    if(t.format==='Tournival'&&t.kotc_state){let st:any=null;try{st=typeof t.kotc_state==='string'?JSON.parse(t.kotc_state):t.kotc_state;}catch{}if(st)for(const r of st.rounds||[]){const rr=st.results?.[r.roundNumber]||{};for(const c of r.courts||[]){const z=rr?.[c.courtNumber];if(!z||!['A','B'].includes(z.winner))continue;const A=(c.teamA||[]).map(String).filter((x:string)=>memberIds.has(x)),B=(c.teamB||[]).map(String).filter((x:string)=>memberIds.has(x));if(!A.length&&!B.length)continue;out.push({id:`tournival:${t.id}:${r.roundNumber}:${c.courtNumber}`,event_id:String(t.id),event_name:t.name||'Tournival',format:'Tournival',date:t.end_date||t.start_date||t.created_date||'',round:r.roundNumber??null,court:c.courtNumber??null,teamA:A,teamB:B,scoreA:Number(z.scoreA||0),scoreB:Number(z.scoreB||0),winner:z.winner});}}}
  }

  const standardIds=new Set((tournaments||[]).filter((t:any)=>t.status==='Completed'&&t.counts_toward_leaderboard===true&&!['King of the Court','Tournival','Club Challenge'].includes(String(t.format||''))).map((t:any)=>String(t.id)));
  if(standardIds.size){const matches=await base44.asServiceRole.entities.Match.filter({tenant_id:tenantId,status:'Completed'},'-created_date',500);const tpById=new Map((tpRows||[]).map((p:any)=>[String(p.id),String(p.source_player_id||'')]));for(const m of matches||[]){if(!standardIds.has(String(m.tournament_id)))continue;const t:any=tById.get(String(m.tournament_id));const rawA=m.team1_participant_ids?.length?m.team1_participant_ids.map((x:any)=>tpById.get(String(x))||''):(m.team1_player_ids||[]).map(String);const rawB=m.team2_participant_ids?.length?m.team2_participant_ids.map((x:any)=>tpById.get(String(x))||''):(m.team2_player_ids||[]).map(String);const A=rawA.filter((x:string)=>memberIds.has(x)),B=rawB.filter((x:string)=>memberIds.has(x));if(!A.length&&!B.length)continue;const scoreA=(m.scores||[]).reduce((n:number,g:any)=>n+Number(g.team1||0),0),scoreB=(m.scores||[]).reduce((n:number,g:any)=>n+Number(g.team2||0),0);out.push({id:`match:${m.id}`,event_id:String(m.tournament_id),event_name:t?.name||'Tournament',format:'Tournament',date:m.completed_at||m.created_date||t?.start_date||'',round:m.round??null,court:m.court??null,teamA:A,teamB:B,scoreA,scoreB,winner:m.winner_team==='team1'?'A':'B'});}}

  out.sort((a,b)=>dateMs(a.date)-dateMs(b.date)||a.id.localeCompare(b.id));return {players,matches:out,kotcByPlayer};
}

function ratingModel(matches:CMatch[],players:any[]){
  const rating=new Map(players.map((p:any)=>[String(p.id),1500]));const count=new Map(players.map((p:any)=>[String(p.id),0]));const history=new Map(players.map((p:any)=>[String(p.id),[] as any[]]));const residuals=new Map(players.map((p:any)=>[String(p.id),[] as any[]]));const enriched:any[]=[];
  for(const m of matches){const ar=m.teamA.length?m.teamA.reduce((s,p)=>s+(rating.get(p)||1500),0)/m.teamA.length:1500,br=m.teamB.length?m.teamB.reduce((s,p)=>s+(rating.get(p)||1500),0)/m.teamB.length:1500;const expectedA=logistic(ar,br);const actualA=m.winner==='draw'?0.5:m.winner==='A'?1:0;const margin=Math.abs(m.scoreA-m.scoreB);const denom=Math.max(1,m.scoreA,m.scoreB);const marginFactor=1+0.5*Math.min(1,margin/denom);enriched.push({...m,expectedA,actualA});
    for(const pid of m.teamA){const old=rating.get(pid)||1500,c=count.get(pid)||0,delta=kFor(c)*(actualA-expectedA)*marginFactor;rating.set(pid,old+delta);count.set(pid,c+1);history.get(pid)?.push({date:m.date,rating:old+delta,delta,event_name:m.event_name,format:m.format});residuals.get(pid)?.push({date:m.date,residual:actualA-expectedA});}
    for(const pid of m.teamB){const old=rating.get(pid)||1500,c=count.get(pid)||0,delta=kFor(c)*((1-actualA)-(1-expectedA))*marginFactor;rating.set(pid,old+delta);count.set(pid,c+1);history.get(pid)?.push({date:m.date,rating:old+delta,delta,event_name:m.event_name,format:m.format});residuals.get(pid)?.push({date:m.date,residual:(1-actualA)-(1-expectedA)});}
  }
  return {rating,count,history,residuals,enriched};
}

function pairKey(a:string,b:string){return [a,b].sort().join('|');}
function relationships(enriched:any[],players:any[]){
  const names=new Map(players.map((p:any)=>[String(p.id),p.full_name||'Player']));const h2h=new Map<string,any>(),partners=new Map<string,any>();
  const rel=(map:Map<string,any>,a:string,b:string)=>{const key=pairKey(a,b);if(!map.has(key))map.set(key,{key,a:[a,b].sort()[0],b:[a,b].sort()[1],meetings:0,a_wins:0,b_wins:0,draws:0,a_pf:0,b_pf:0,residual_sum_a:0,last_date:'',sequence:[] as any[]});return map.get(key);};
  for(const m of enriched){for(const [team,opp,side] of [[m.teamA,m.teamB,'A'],[m.teamB,m.teamA,'B']] as any){for(let i=0;i<team.length;i++)for(let j=i+1;j<team.length;j++){const a=team[i],b=team[j],r=rel(partners,a,b),aIs=r.a===a;const actual=side==='A'?m.actualA:1-m.actualA,expected=side==='A'?m.expectedA:1-m.expectedA;r.meetings++;if(actual===0.5)r.draws++;else if((actual===1&&aIs)||(actual===0&&!aIs))r.a_wins++;else r.b_wins++;const pf=side==='A'?m.scoreA:m.scoreB,pa=side==='A'?m.scoreB:m.scoreA;if(aIs){r.a_pf+=pf;r.b_pf+=pa;r.residual_sum_a+=actual-expected;}else{r.a_pf+=pa;r.b_pf+=pf;r.residual_sum_a-=actual-expected;}r.last_date=m.date;r.sequence.push({date:m.date,winner:actual===0.5?'draw':actual===1?(aIs?'a':'b'):(aIs?'b':'a')});}
      for(const a of team)for(const b of opp){const r=rel(h2h,a,b),aIs=r.a===a;const actual=side==='A'?m.actualA:1-m.actualA,expected=side==='A'?m.expectedA:1-m.expectedA;r.meetings++;if(actual===0.5)r.draws++;else if((actual===1&&aIs)||(actual===0&&!aIs))r.a_wins++;else r.b_wins++;const pf=side==='A'?m.scoreA:m.scoreB,pa=side==='A'?m.scoreB:m.scoreA;if(aIs){r.a_pf+=pf;r.b_pf+=pa;r.residual_sum_a+=actual-expected;}else{r.a_pf+=pa;r.b_pf+=pf;r.residual_sum_a-=actual-expected;}r.last_date=m.date;r.sequence.push({date:m.date,winner:actual===0.5?'draw':actual===1?(aIs?'a':'b'):(aIs?'b':'a')});}}
  }
  const finish=(r:any)=>({...r,a_name:names.get(r.a)||'Player',b_name:names.get(r.b)||'Player',a_win_rate:r.meetings?r.a_wins/r.meetings:0,a_diff:r.a_pf-r.b_pf});return {h2h:[...h2h.values()].map(finish),partners:[...partners.values()].map(finish)};
}
function recentAdjustment(pid:string,residuals:Map<string,any[]>,now=Date.now()){
  const rows=residuals.get(pid)||[];let num=0,den=0;for(const r of rows){const age=Math.max(0,now-dateMs(r.date));const w=Math.pow(.5,age/(60*DAY));num+=Number(r.residual||0)*w;den+=w;}return den?clamp((num/den)*60,-30,30):0;
}
function relationFor(list:any[],a:string,b:string){const k=pairKey(a,b);return list.find((x:any)=>x.key===k)||null;}
function streakFor(row:any,pid:string){if(!row)return null;const side=row.a===pid?'a':'b';const seq=[...(row.sequence||[])].sort((x:any,y:any)=>dateMs(y.date)-dateMs(x.date));if(!seq.length)return null;const first=seq[0].winner;if(first==='draw')return {type:'draw',count:1};let n=0;for(const x of seq){if(x.winner===first)n++;else break;}return {type:first===side?'win':'loss',count:n};}

function selfProfile(player:any,currentRows:any[],allRows:any[],model:any,rels:any,matches:CMatch[],season:any,kotcByPlayer:Map<string,any>){
  if(!player)return null;
  const pid=String(player.id),cur=currentRows.find((r:any)=>r.player_id===pid)||null,all=allRows.find((r:any)=>r.player_id===pid)||null;
  const now=Date.now(),weekStart=now-7*DAY,priorStart=now-14*DAY;
  const mine=matches.filter(m=>m.teamA.includes(pid)||m.teamB.includes(pid));
  const week=rowsFrom(mine.filter(m=>dateMs(m.date)>=weekStart),[player])[0]||null;
  const prior=rowsFrom(mine.filter(m=>dateMs(m.date)>=priorStart&&dateMs(m.date)<weekStart),[player])[0]||null;
  const previousMatches=matches.filter(m=>dateMs(m.date)<weekStart);
  const prevRows=rowsFrom(previousMatches.filter(m=>dateMs(m.date)>=dateMs(season.start)),model.players);
  const prevRank=prevRows.find((r:any)=>r.player_id===pid)?.rank??null;
  const rankChange=prevRank&&cur?.rank?prevRank-cur.rank:0;
  const topH2H=rels.h2h.filter((r:any)=>r.a===pid||r.b===pid).sort((a:any,b:any)=>b.meetings-a.meetings).slice(0,8).map((r:any)=>{const mineA=r.a===pid;return {opponent_id:mineA?r.b:r.a,opponent_name:mineA?r.b_name:r.a_name,meetings:r.meetings,wins:mineA?r.a_wins:r.b_wins,losses:mineA?r.b_wins:r.a_wins,draws:r.draws,points_for:mineA?r.a_pf:r.b_pf,points_against:mineA?r.b_pf:r.a_pf,win_rate:r.meetings?(mineA?r.a_wins:r.b_wins)/r.meetings:0,last_date:r.last_date,streak:streakFor(r,pid)};});
  const topPartners=rels.partners.filter((r:any)=>r.a===pid||r.b===pid).sort((a:any,b:any)=>b.meetings-a.meetings).slice(0,8).map((r:any)=>{const mineA=r.a===pid;return {partner_id:mineA?r.b:r.a,partner_name:mineA?r.b_name:r.a_name,meetings:r.meetings,wins:mineA?r.a_wins:r.b_wins,losses:mineA?r.b_wins:r.a_wins,draws:r.draws,points_for:mineA?r.a_pf:r.b_pf,points_against:mineA?r.b_pf:r.a_pf,win_rate:r.meetings?(mineA?r.a_wins:r.b_wins)/r.meetings:0,last_date:r.last_date};});
  const recent=[...(cur?.results||[])].sort((a:any,b:any)=>dateMs(b.date)-dateMs(a.date));
  const kotcSessions=[...(kotcByPlayer.get(pid)?.sessions||[])].sort((a:any,b:any)=>dateMs(b.date)-dateMs(a.date));
  const summariseKotc=(rows:any[])=>({sessions_played:rows.length,rounds_played:rows.reduce((n,r)=>n+Number(r.rounds_played||0),0),court1_rounds:rows.reduce((n,r)=>n+Number(r.court1_rounds||0),0),moves_up:rows.reduce((n,r)=>n+Number(r.moves_up||0),0),moves_down:rows.reduce((n,r)=>n+Number(r.moves_down||0),0),stayed:rows.reduce((n,r)=>n+Number(r.stayed||0),0),firsts:rows.filter(r=>r.podium_group==='gold').length,seconds:rows.filter(r=>r.podium_group==='silver').length,thirds:rows.filter(r=>r.podium_group==='bronze').length,recent_sessions:rows.slice(0,8)});
  const kotcSeason=kotcSessions.filter((r:any)=>dateMs(r.date)>=dateMs(season.start)&&dateMs(r.date)<dateMs(season.end));
  return {player_id:pid,full_name:player.full_name||'Player',season:cur,all_time:all,rallyhub_rating:Math.round(model.rating.get(pid)||1500),rating_history:(model.history.get(pid)||[]).slice(-30).map((x:any)=>({...x,rating:Math.round(x.rating),delta:round1(x.delta)})),recent_form:recent.slice(0,5).map((r:any)=>r.result),recent_matches:recent.slice(0,10),week:{matches:week?.matches_played||0,wins:week?.wins||0,losses:week?.losses||0,leaderboard_points:week?.leaderboard_points||0,score_difference:week?.score_difference||0,win_rate:week?.win_rate||0,previous_win_rate:prior?.win_rate||0,rank_change:rankChange},head_to_head:topH2H,partners:topPartners,kotc:{season:summariseKotc(kotcSeason),all_time:summariseKotc(kotcSessions)}};
}

function forecast(idsA:string[],idsB:string[],players:any[],model:any,rels:any){
  const valid=new Set(players.map((p:any)=>String(p.id)));const A=[...new Set(idsA.map(String))].filter(x=>valid.has(x)),B=[...new Set(idsB.map(String))].filter(x=>valid.has(x));if(!A.length||!B.length||A.some(x=>B.includes(x)))throw Object.assign(new Error('Choose distinct RallyHub members for both teams.'),{status:400});const names=new Map(players.map((p:any)=>[String(p.id),p.full_name||'Player']));const avg=(ids:string[])=>ids.reduce((s,p)=>s+(model.rating.get(p)||1500),0)/ids.length;const baseA=avg(A),baseB=avg(B);const recentA=A.reduce((s,p)=>s+recentAdjustment(p,model.residuals),0)/A.length,recentB=B.reduce((s,p)=>s+recentAdjustment(p,model.residuals),0)/B.length;
  const partnerEffect=(ids:string[])=>{if(ids.length<2)return 0;const r=relationFor(rels.partners,ids[0],ids[1]);if(!r)return 0;const aIs=r.a===ids[0],res=(r.residual_sum_a/Math.max(1,r.meetings))*(aIs?1:-1);return clamp(res*80*(r.meetings/(r.meetings+5)),-40,40);};const pa=partnerEffect(A),pb=partnerEffect(B);
  let hsum=0,hn=0,hMeet=0;for(const a of A)for(const b of B){const r=relationFor(rels.h2h,a,b);if(!r)continue;const aWins=r.a===a?r.a_wins:r.b_wins;const rate=(aWins+0.5*r.draws)/Math.max(1,r.meetings);hsum+=(rate-.5)*60*(r.meetings/(r.meetings+8));hn++;hMeet+=r.meetings;}const hA=clamp(hn?hsum/hn:0,-30,30),hB=-hA;const adjustedA=baseA+recentA+pa+hA,adjustedB=baseB+recentB+pb+hB,pA=logistic(adjustedA,adjustedB);
  const playerEvidence=[...A,...B].reduce((s,p)=>s+Math.min(1,(model.count.get(p)||0)/30),0)/(A.length+B.length);const pairMeet=(relationFor(rels.partners,A[0],A[1])?.meetings||0)+(relationFor(rels.partners,B[0],B[1])?.meetings||0);const contextEvidence=Math.min(1,(pairMeet+hMeet)/20);const confidence=.8*playerEvidence+.2*contextEvidence;const confidenceLabel=confidence>=.75?'High':confidence>=.4?'Medium':'Low';const reasons:any[]=[];if(Math.abs(baseA-baseB)>=15)reasons.push({side:baseA>baseB?'A':'B',text:'Stronger overall RallyHub performance rating'});if(Math.abs(recentA-recentB)>=5)reasons.push({side:recentA>recentB?'A':'B',text:'Stronger recent form'});if(Math.abs(pa-pb)>=5)reasons.push({side:pa>pb?'A':'B',text:'Stronger recorded partnership chemistry'});if(Math.abs(hA)>=4)reasons.push({side:hA>0?'A':'B',text:'Favourable head-to-head history'});if(!reasons.length)reasons.push({side:'even',text:'The teams are closely matched on the data recorded so far'});
  return {teamA:{player_ids:A,names:A.map(x=>names.get(x)),base_rating:Math.round(baseA),adjusted_rating:Math.round(adjustedA),win_probability:pA},teamB:{player_ids:B,names:B.map(x=>names.get(x)),base_rating:Math.round(baseB),adjusted_rating:Math.round(adjustedB),win_probability:1-pA},confidence:{index:Math.round(confidence*100),label:confidenceLabel,player_evidence:Math.round(playerEvidence*100),context_evidence:Math.round(contextEvidence*100)},reasons,disclaimer:'This is a fun prediction based on the match data RallyHub has so far. Forecasts will become more accurate as more matches and player history are recorded.'};
}

Deno.serve(async (req)=>{try{
  const base44=createClientFromRequest(req);const user=await base44.auth.me();if(!user)return Response.json({error:'Authentication required'},{status:401});if(user.role!=='admin'&&user.approval_status!=='approved')return Response.json({error:'Approved RallyHub Club access required'},{status:403});const body=await req.json().catch(()=>({}));const action=String(body.action||'self');const ctx=await context(base44,user);const built=await canonical(base44,ctx.tenantId,ctx.clubId);const season=seasonBounds();const seasonMatches=built.matches.filter(m=>dateMs(m.date)>=dateMs(season.start)&&dateMs(m.date)<dateMs(season.end));const allRows=rowsFrom(built.matches,built.players),currentRows=rowsFrom(seasonMatches,built.players);const model=ratingModel(built.matches,built.players);(model as any).players=built.players;const rels=relationships(model.enriched,built.players);
  if(action==='club')return Response.json({success:true,version:VERSION,season,rows:currentRows,all_time_rows:allRows,player_count:built.players.length,match_count:built.matches.length,scoring:'2 points win · 1 genuine draw · 0 loss'});
  if(action==='forecast'){const result=forecast(body.teamAPlayerIds||[],body.teamBPlayerIds||[],built.players,model,rels);return Response.json({success:true,version:VERSION,season,players:built.players.map((p:any)=>({id:p.id,full_name:p.full_name,avatar_url:p.avatar_url||null})),forecast:result});}
  const targetId=String(body.playerId||ctx.player?.id||'');if(!targetId)return Response.json({success:true,version:VERSION,season,profile:null,players:built.players.map((p:any)=>({id:p.id,full_name:p.full_name,avatar_url:p.avatar_url||null}))});if(user.role!=='admin'&&targetId!==String(ctx.player?.id||''))return Response.json({error:'You can only view your own private performance profile.'},{status:403});const player=built.players.find((p:any)=>String(p.id)===targetId)||ctx.player;const profile=selfProfile(player,currentRows,allRows,model,rels,built.matches,season,built.kotcByPlayer);return Response.json({success:true,version:VERSION,season,profile,players:built.players.map((p:any)=>({id:p.id,full_name:p.full_name,avatar_url:p.avatar_url||null}))});
}catch(error){return Response.json({error:(error as any)?.message||'Performance analytics unavailable',version:VERSION},{status:(error as any)?.status||500});}});
