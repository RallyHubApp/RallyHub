import assert from 'node:assert/strict';
// Offline caller-bucket simulation, not a Base44 live load test.
const limit=140,windowSeconds=60;
const simulate=({hosts=2,playersPerSession=10,hostRefreshSeconds=30,playerRefreshSeconds=30,entityReadsPerHostRefresh=8,entityReadsPerPlayerRefresh=4,roundsPerMinute=2,entityReadsPerRound=24,sharedCaller=false})=>{
 const buckets=new Map();const add=(caller,t,count)=>{const key=sharedCaller?'shared-service-token':caller;const a=buckets.get(key)||[];for(let j=0;j<count;j++)a.push(t);buckets.set(key,a);};
 for(let h=0;h<hosts;h++){
  for(let t=0;t<60;t+=hostRefreshSeconds)add(`host-${h}`,t,entityReadsPerHostRefresh);
  for(let r=0;r<roundsPerMinute;r++)add(`host-${h}`,Math.floor((r+0.5)*60/roundsPerMinute),entityReadsPerRound);
  for(let p=0;p<playersPerSession;p++)for(let t=0;t<60;t+=playerRefreshSeconds)add(`player-${h}-${p}`,t,entityReadsPerPlayerRefresh);
 }
 const peak=Math.max(...[...buckets.values()].map(a=>a.length));return{hosts,playersPerSession,sharedCaller,peakCallsPerCallerMinute:peak,overLimit:peak>limit,totalCalls:[...buckets.values()].reduce((n,a)=>n+a.length,0)};
};
const scenarios=[];for(const hosts of [1,2,3,4])for(const playersPerSession of [8,12,20])for(const hostRefreshSeconds of [5,15,30])for(const playerRefreshSeconds of [5,15,30])for(const sharedCaller of [false,true]){const x=simulate({hosts,playersPerSession,hostRefreshSeconds,playerRefreshSeconds,sharedCaller});scenarios.push({...x,hostRefreshSeconds,playerRefreshSeconds});}
assert.equal(scenarios.length,216);
const typical=simulate({hosts:2,playersPerSession:10});const shared=simulate({hosts:2,playersPerSession:10,sharedCaller:true});
console.log(JSON.stringify({scenarios:scenarios.length,typical,shared,exceedPerUser:scenarios.filter(x=>!x.sharedCaller&&x.overLimit).length,exceedShared:scenarios.filter(x=>x.sharedCaller&&x.overLimit).length,assumptions:'Synthetic entity_list caller buckets: 140/60s, 8 reads/host refresh, 4 reads/player refresh, 24 reads/round, 2 rounds/minute/session. Not measured Base44 traffic.'}));
