import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient,QueryClientProvider } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AuthProvider } from '@/lib/AuthContext';
import TournamentDetail from '@/pages/TournamentDetail';
import '@/index.css';

const tournamentId='6aa2df782975f38410d2a90a';
window.history.replaceState({},'',`/app/tournaments/${tournamentId}`);
const playerIds=Array.from({length:16},(_,i)=>`player-${i+1}`);
const players=playerIds.map((id,i)=>({id,full_name:`Player ${i+1}`,status:'Active'}));
const participants=Array.from({length:17},(_,i)=>({id:`participant-${i+1}`,player_id:i<16?playerIds[i]:null,display_name:i<16?`Player ${i+1}`:'Guest Player',status:'present',rounds_played:7,fairness_benches:0,consecutive_rounds_played:0,consecutive_court1_rounds:0,court1_rounds:i<4?3:1}));
const rounds=[];const matches=[];
for(let r=1;r<=8;r++){
  const roundId=`round-${r}`;rounds.push({id:roundId,round_number:r,status:r<=7?'completed':'abandoned',proposal_revision:1,active_court_count:4,bench_count:1});
  for(let c=1;c<=4;c++){
    const base=((r-1)*4+c-1)*4; const ids=[0,1,2,3].map(k=>participants[(base+k)%16].id);
    matches.push({id:`m-${r}-${c}`,round_id:roundId,round_number:r,ladder_court_rank:c,team_a_participant_ids:ids.slice(0,2),team_b_participant_ids:ids.slice(2),status:r<=7?'completed':'not_played',team_a_score:r<=7?5+c:null,team_b_score:r<=7?3+c:null,winner_side:r<=7?'A':null,revision:1,correction_count:0});
  }
}
const tournament={id:tournamentId,name:'830 Session',format:'King of the Court',status:'Completed',player_ids:playerIds,tenant_id:'tenant-clare',host_club_id:'club-clare'};
const session={id:'session-830',tournament_id:tournamentId,tenant_id:'tenant-clare',club_id:'club-clare',name:'830 Session',status:'completed',current_round_number:8,current_round_id:'round-8',revision:16,play_minutes:8,scoring_mode:'timed',planned_rounds:30,actual_first_round_start:'2026-09-10T19:46:54.960Z',actual_session_end:'2026-09-10T21:04:35.397Z',exclude_from_aggregates:true};
const state={session,participants,rounds,slots:[],matches,fixedPairs:[],contactDirectory:{},currentUserId:'admin-user',currentAccessRole:'admin',isAdmin:true};
const admin={id:'admin-user',role:'admin',full_name:'Test Admin',email:'admin@example.com',active_tenant_id:'tenant-clare',active_club_id:'club-clare',approval_status:'approved'};

base44.auth.me=async()=>admin;
base44.functions.invoke=async(name,body)=>{
  if(name==='securityContext')return {data:{success:true,context:{tenant_id:'tenant-clare',club_id:'club-clare'}}};
  if(name==='getKotcV2State')return {data:state};
  if(name==='kotcResultsShare')return {data:{success:true,token:'share-token'}};
  if(name==='kotcCommand'&&body?.commandType==='correct_match')return {data:{success:true,match:{...matches.find(m=>m.id===body.matchId),team_a_score:body.teamAScore,team_b_score:body.teamBScore,revision:2,status:'completed'}}};
  return {data:{success:true}};
};
base44.entities.Tournament.filter=async()=>[tournament];
base44.entities.Player.list=async()=>players;
base44.entities.Match.filter=async()=>[];

const qc=new QueryClient({defaultOptions:{queries:{retry:false,refetchOnWindowFocus:false},mutations:{retry:false}}});
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><QueryClientProvider client={qc}><AuthProvider><BrowserRouter><TournamentDetail/></BrowserRouter></AuthProvider></QueryClientProvider></React.StrictMode>);
