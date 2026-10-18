export async function duprUatPreflight(call){
 const verified=await call('uat_match_preflight');
 if(!verified.ready||verified.accounts?.length!==4)throw Error('Complete four DUPR SSO links first');
 await call('uat_register_webhook');
 for(const a of verified.accounts){
  await call('uat_verify',{slot:a.slot});
  await call('uat_refresh',{slot:a.slot});
  await call('uat_subscribe_rating',{slot:a.slot});
 }
 return {verified,ratings:await call('uat_rating_events')};
}

export async function duprUatSyntheticMatch(call,accounts,clubId){
 if(!Array.isArray(accounts)||accounts.length!==4)throw Error('Four accounts required');
 const ids=accounts.map(a=>a.duprId);
 const identifier='RH-UAT-'+Date.now()+'-'+Math.floor(Math.random()*1e6);
 const match={identifier,matchSource:'CLUB',clubId:Number(clubId),event:'RallyHub DUPR UAT',
  bracket:'Synthetic',location:'Ennis, Ireland',matchDate:new Date().toISOString().slice(0,10),
  format:'DOUBLES',matchType:'SIDEOUT',
  teamA:{player1:ids[0],player2:ids[1],game1:11},
  teamB:{player1:ids[2],player2:ids[3],game1:7}};
 const flags={confirmUatTest:true};
 const created=await call('uat_submit_match',{match,...flags});
 if(!created.acknowledged)throw Error('DUPR match acknowledgement missing');
 let duplicateBlocked=false;
 try{await call('uat_submit_match',{match,...flags});}catch{duplicateBlocked=true;}
 if(!duplicateBlocked)throw Error('Duplicate DUPR identifier was accepted');
 const modified={...match,teamB:{...match.teamB,game1:9}};
 const updated=await call('uat_update_match',{match:modified,...flags});
 if(!updated.updated)throw Error('DUPR correction acknowledgement missing');
 const deleted=await call('uat_delete_match',{identifier,...flags});
 if(!deleted.deleted)throw Error('DUPR deletion acknowledgement missing');
 return {identifier,created,updated,deleted,duplicateBlocked};
}
