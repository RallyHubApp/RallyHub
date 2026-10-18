/** Independent DUPR UAT policy gates. No credentials or provider calls. */
export function validateSsoMessage(origin:string, payload:unknown){
 if(origin!=='https://uat.dupr.gg')return {ok:false,reason:'untrusted_origin'};
 if(!payload||typeof payload!=='object')return {ok:false,reason:'invalid_sso_payload'};
 const data=payload as Record<string,unknown>;
 if(typeof data.accessToken!=='string'||!data.accessToken.trim()
  ||typeof data.refreshToken!=='string'||!data.refreshToken.trim())
  return {ok:false,reason:'tokens_missing'};
 // The caller MUST verify the user token with DUPR before linking an identity.
 return {ok:true,reason:'requires_provider_identity_verification'};
}
export function allowedForTournament(entitlements:unknown,tier:'basic'|'premium'|'verified'='basic'){
 if(!entitlements||typeof entitlements!=='object')return false;
 const t=(entitlements as Record<string,unknown>).tournaments;
 return Array.isArray(t)&&t.includes('BASIC_L1')
  &&(tier==='basic'||t.includes(tier==='premium'?'PREMIUM_L1':'VERIFIED_L1'));
}
export function canAdministerDuprClub(memberships:unknown,clubId:string|number){
 return Array.isArray(memberships)&&memberships.some(m=>m
  &&String(m.clubId)===String(clubId)
  &&(m.role==='DIRECTOR'||m.role==='ORGANIZER'));
}
export function validateDuprMatch(value:unknown,memberships:unknown){
 const fail=(reason:string)=>({ok:false,reason});
 if(!value||typeof value!=='object')return fail('invalid_match');
 const m=value as Record<string,any>;
 if(m.matchSource!=='CLUB'&&m.matchSource!=='PARTNER')return fail('invalid_match_source');
 if(m.matchSource==='CLUB'&&(!m.clubId||!canAdministerDuprClub(memberships,m.clubId)))
  return fail('club_role_missing');
 if(m.matchSource==='PARTNER'&&m.clubId!=null)return fail('partner_must_omit_club_id');
 if(typeof m.identifier!=='string'||!m.identifier.trim())return fail('identifier_missing');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(m.matchDate||''))return fail('date_invalid');
 const date=new Date(m.matchDate+'T00:00:00.000Z');
 if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==m.matchDate)return fail('date_invalid');
 if(!['SINGLES','DOUBLES'].includes(m.format))return fail('invalid_format');
 if(!['SIDEOUT','RALLY'].includes(m.matchType))return fail('invalid_scoring_type');
 const n=m.format==='SINGLES'?1:2;
 const players:string[]=[];
 for(const t of [m.teamA,m.teamB]){
  if(!t||typeof t!=='object')return fail('team_missing');
  for(let k=1;k<=n;k++){
   const id=t['player'+k];
   if(typeof id!=='string'||!id.trim())return fail('player_missing');
   players.push(id.trim());
  }
  if(n===1&&t.player2!=null)return fail('invalid_singles_player');
  for(let i=1;i<=5;i++){
   const a=m.teamA?.['game'+i],b=m.teamB?.['game'+i];
   if((a==null)!==(b==null))return fail('incomplete_game');
   if(a!=null&&( !Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a===b))
    return fail('invalid_or_tied_game');
  }
 }
 if(new Set(players).size!==players.length)return fail('duplicate_player');
 if(m.teamA.game1==null||m.teamB.game1==null)return fail('score_missing');
 return {ok:true,reason:'eligible_for_provider_submission'};
}
