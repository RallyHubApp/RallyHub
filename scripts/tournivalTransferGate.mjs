import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const s=fs.readFileSync('base44/functions/legacyTournamentManager/entry.ts','utf8');
const a=s.indexOf("    if (action === 'tournival_transfer_targets'"),b=s.indexOf("    if (action === 'tournival_manual_search'",a);
const code=ts.transpileModule('async function handler(action,body,tournament,base44,user,clean,audit,canManageTournament){'+s.slice(a,b)+'}',{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
const handler=new Function(code+';return handler')();
const fixture=(payment='paid')=>{
 const events=['mon','thu'].map(id=>({id,tenant_id:'t',host_club_id:'c',format:'Tournival',status:'Registration Open',max_players:2,tournival_reserved_count:id==='mon'?1:0,player_ids:id==='mon'?['p']:[]}));
 const rows=[{id:'r',tenant_id:'t',tournament_id:'mon',player_id:'p',email:'p@example.invalid',registration_status:'confirmed',payment_status:payment,payment_record_id:payment==='paid'?'pay':undefined}];
 const links=[{id:'l',tenant_id:'t',tournament_id:'mon',registration_id:'r',token_hash:'unchanged'}], audits=[],sessions=[];
 let failLink=false;
 const matches=(r,q)=>Object.entries(q).every(([k,v])=>v===null?r[k]==null:typeof v==='object'?('$lt'in v?r[k]<v.$lt:r[k]>v.$gt):r[k]===v);
 const entity=(list,isLink=false)=>({async filter(q){return list.filter(r=>matches(r,q)).map(r=>structuredClone(r))},async update(id,v){if(isLink&&failLink){failLink=false;throw Error('injected');}Object.assign(list.find(r=>r.id===id),v)},async updateMany(q,u){const found=list.filter(r=>matches(r,q));for(const r of found){Object.assign(r,u.$set||{});for(const [k,v] of Object.entries(u.$inc||{}))r[k]+=v;for(const [k,v] of Object.entries(u.$addToSet||{}))if(!r[k].includes(v))r[k].push(v);for(const [k,v] of Object.entries(u.$pull||{}))r[k]=r[k].filter(x=>x!==v);}return {updated:found.length}}});
 const e={Tournament:entity(events),TournivalRegistration:entity(rows),TournivalAccessToken:entity(links,true),TournivalSession:entity(sessions)};
 const call=(from='mon',to='thu',allowed=true)=>handler('tournival_transfer',{registrationId:'r',targetTournamentId:to},structuredClone(events.find(e=>e.id===from)),{asServiceRole:{entities:e}},{id:'admin'},(v,n)=>String(v??'').slice(0,n),async(...args)=>audits.push(args),async()=>allowed);
 return {events,rows,links,audits,sessions,call,inject:()=>failLink=true};
};
for(const payment of ['paid','not_required']){
 const f=fixture(payment);assert.equal((await f.call()).status,200);assert.deepEqual(f.events.map(e=>e.tournival_reserved_count),[0,1]);assert.deepEqual(f.events.map(e=>e.player_ids),[[],['p']]);assert.equal(f.rows[0].id,'r');assert.equal(f.rows[0].payment_status,payment);assert.equal(f.rows[0].payment_record_id,payment==='paid'?'pay':undefined);assert.equal(f.links[0].token_hash,'unchanged');assert.equal(f.links[0].tournament_id,'thu');assert.equal(f.rows[0].tournament_id,'thu');assert.equal(f.audits.length,2);assert.equal((await f.call('thu','mon')).status,200);assert.equal(f.links[0].tournament_id,'mon');
}
for(const scenario of ['full','duplicate','started','unauthorised','checkedin','fixtures','rollback']){
 const f=fixture();if(scenario==='full')f.events[1].tournival_reserved_count=2;if(scenario==='duplicate')f.rows.push({...f.rows[0],id:'r2',tournament_id:'thu'});if(scenario==='started')f.events[1].status='In Progress';if(scenario==='checkedin')f.rows[0].checked_in_at='now';if(scenario==='fixtures')f.sessions.push({tournament_id:'thu',tenant_id:'t'});if(scenario==='rollback')f.inject();
 assert.notEqual((await f.call('mon','thu',scenario!=='unauthorised')).status,200,scenario);assert.equal(f.rows[0].tournament_id,'mon');assert.equal(f.links[0].tournament_id,'mon');assert.equal(f.events[0].tournival_reserved_count,1);assert(f.events.every(e=>e.tournival_registration_lock==null));
}
const f=fixture();const results=await Promise.all([f.call(),f.call()]);assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
console.log('TRANSFER GATE PASS: paid, complimentary, reverse, link preservation, full, duplicate, started, permissions, check-in, fixtures, rollback, concurrent transfer');
