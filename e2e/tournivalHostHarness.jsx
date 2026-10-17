import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import TournivalView from '../src/components/tournival/TournivalView.jsx';
import {base44} from '../src/api/base44Client.js';
import '../src/index.css';

const players=Array.from({length:16},(_,i)=>({
 id:'player'+(i+1),full_name:'Simulated Player '+(i+1),skill_rating:Math.max(1,5-i*0.1),status:'Active'
}));
const ids=players.map(p=>p.id);
let updateParent;
let currentState=null;
base44.functions.invoke=async(name,payload)=>{
 if(name==='legacyTournamentManager'&&payload.action==='update_tournival'){
  if((currentState?.revision||0)!==payload.expectedRevision){
   return {data:{error:'Stale version, refresh state'}};
  }
  const next=JSON.parse(payload.tournival_state);
  next.revision=(currentState?.revision||0)+1;
  currentState=next;
  updateParent(prev=>({...prev,tournival_state:JSON.stringify(next),status:payload.status}));
  return {data:{success:true,revision:next.revision}};
 }
 if(name==='legacyTournamentManager'&&payload.action==='create_tournival_registration_link'){
  return {data:{success:true,path:'/tournival/register/trn_test'}};
 }
 if(name==='legacyTournamentManager'&&payload.action==='tournival_registrations'){
  return {data:{success:true,registrations:[]}};
 }
 if(name==='duprIntegration'){
  return {data:{success:true,mode:'dry_run_only',eligibleCount:0,excludedCount:0,reasons:{}}};
 }
 if(name==='announcementSettings'){
  return {data:{byKey:{}}};
 }
 throw Error('Unexpected backend call: '+name+' / '+payload?.action);
};
function App(){
 const [tournament,setTournament]=useState({id:'tournival-test',format:'Tournival',name:'Tournival Full Host Journey',
    status:'Draft',kotc_num_courts:4,player_ids:ids,event_fee_amount:0,host_club_id:'sandbox'});
 updateParent=setTournament;
 return <main style={{maxWidth:1050,margin:'auto',padding:10}}>
  <h1>Full Tournival host journey — simulated backend</h1>
  <TournivalView tournament={tournament} players={players} allPlayers={players}
    isAdmin={true} queryClient={{invalidateQueries:()=>{}}}/>
  <pre data-testid="server-revision" style={{display:'none'}}>{currentState?.revision||0}</pre>
  <pre data-testid="server-status" style={{display:'none'}}>{currentState?.status||'Draft'}</pre>
 </main>;
}
createRoot(document.getElementById('root')).render(<MemoryRouter><App/></MemoryRouter>);
