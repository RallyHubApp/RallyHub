import React from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter,Routes,Route} from 'react-router-dom';
import {base44} from '../src/api/base44Client.js';
import PublicTournivalRegistration from '../src/pages/PublicTournivalRegistration.jsx';
import PublicTournivalPlayer from '../src/pages/PublicTournivalPlayer.jsx';
import PublicTournivalHall from '../src/pages/PublicTournivalHall.jsx';
import PublicTournivalHost from '../src/pages/PublicTournivalHost.jsx';
import {generateGroupFixtures} from '../src/lib/tournivalEngine.js';
import {indexTournivalMatches} from '../src/lib/tournivalScheduler.js';
import '../src/index.css';
const ids=Array.from({length:16},(_,i)=>'p'+i),names=Object.fromEntries(ids.map((id,i)=>[id,'Test Player '+(i+1)]));
const state={revision:4,currentRound:1,numCourts:4,numRounds:2,matchFormat:'timed_10',
 playerIds:ids,rounds:[{roundNumber:1,courts:[{courtNumber:1,teamA:['p0','p1'],teamB:['p2','p3']}]}],
 results:{1:{1:{scoreA:8,scoreB:5,winner:'A'}}},knockoutState:null};
const event={id:'test',name:'Tournival Sandbox Event',date:'2026-10-22',venue:'Simulation Hall',status:'In Progress',
 registered:12,capacity:16,waitlisted:2,fee:5,currency:'EUR'};
let hostState={...state,numCourts:4,numRounds:2,
 rounds:generateGroupFixtures(ids,4,2),matches:indexTournivalMatches(generateGroupFixtures(ids,4,2)),
 results:{},revision:1,status:'In Progress',paused:false};
const hostCall=(body)=>{
 if(body.action==='get')return {success:true,event,role:'delegated_host',
   permissions:{score:true,courts:true,finance:false,dupr:false},
   state:hostState,playerMap:names};
 if(body.action==='save'){
   if(body.expectedRevision!==hostState.revision)return {error:'Stale revision'};
   const next=JSON.parse(body.stateJson);
   hostState={...next,revision:hostState.revision+1};
   return {success:true,revision:hostState.revision};
 }
 return {error:'Forbidden'};
};
const responses={
 tournivalHostAccess:hostCall,
 tournivalRegistration:body=>body.action==='get'?{success:true,event}:{
 success:true,event,personalPath:'/tournival/player/trp_demo',
 registration:{id:'registration-demo',status:'pending_payment',paymentStatus:'pending',
 checkoutUrl:'https://example.com/sandbox-payment-only',amountDue:5}},
 tournivalPlayerPortal:()=>({success:true,event,player:{id:'p0',name:'Test Player 1',registrationStatus:'confirmed',
  paymentStatus:'paid',checkedIn:true},matches:[{id:'Q1',round:1,court:1,status:'completed',
  teamA:['p0','p1'],teamB:['p2','p3'],result:{scoreA:8,scoreB:5}}],
 knockout:[],revision:4}),
 tournivalPublicRead:body=>body.clientRevision===4?{success:true,unchanged:true,revision:4}:
 {success:true,event,state,playerMap:names,revision:4}
};
base44.functions.invoke=async(name,body)=>{
 if(!responses[name])throw Error('Unexpected backend call '+name);
 return {data:responses[name](body)};
};
const kind=new URLSearchParams(location.search).get('kind')||'register';
const initial=kind==='player'?'/tournival/player/trp_mock':kind==='hall'?'/tournival/live/test':kind==='host'?'/tournival/host/th_mock':'/tournival/register/trn_mock';
createRoot(document.getElementById('root')).render(<MemoryRouter initialEntries={[initial]}>
 <Routes>
  <Route path="/tournival/register/:token" element={<PublicTournivalRegistration/>}/>
  <Route path="/tournival/player/:token" element={<PublicTournivalPlayer/>}/>
  <Route path="/tournival/live/:id" element={<PublicTournivalHall/>}/>
  <Route path="/tournival/host/:token" element={<PublicTournivalHost/>}/>
 </Routes>
 </MemoryRouter>);
