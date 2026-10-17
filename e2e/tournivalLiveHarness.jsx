import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import {generateGroupFixtures} from '../src/lib/tournivalEngine.js';
import {indexTournivalMatches} from '../src/lib/tournivalScheduler.js';
import TournivalLiveScoring from '../src/components/tournival/TournivalLiveScoring.jsx';
import TournivalPrintPack from '../src/components/tournival/TournivalPrintPack.jsx';
import TournivalHall from '../src/components/tournival/TournivalHall.jsx';
import '../src/index.css';
const ids=Array.from({length:16},(_,i)=>'p'+i);
const playerMap=Object.fromEntries(ids.map((id,i)=>[id,'Simulated Player '+(i+1)]));
const rounds=generateGroupFixtures(ids,4,2);
function App(){
 const [state,setState]=useState({playerIds:ids,rounds,matches:indexTournivalMatches(rounds),results:{},numCourts:4,numRounds:2,matchFormat:'timed_10',currentRound:1,revision:0});
 const save=async next=>setState(old=>({...next,revision:old.revision+1}));
 return <main className="mx-auto max-w-4xl p-4">
  <h1>Tournival integrated scoring journey harness</h1>
  <TournivalLiveScoring state={state} playerMap={playerMap} onSaveState={save} isAdmin={true}/>
  <TournivalHall state={state} tournament={{name:'Harness'}} playerMap={playerMap}/>
  <TournivalPrintPack state={state} tournament={{name:'Harness'}} playerMap={playerMap} currentRevision={state.revision}/>
 </main>;
}
createRoot(document.getElementById('root')).render(<App/>);
