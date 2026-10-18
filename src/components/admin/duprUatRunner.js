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
