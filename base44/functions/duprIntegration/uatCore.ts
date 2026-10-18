/** DUPR UAT transport and security primitives. Only this central service calls DUPR. */
export const UAT_PARTNER='https://uat.mydupr.com/api';
export const UAT_PUBLIC='https://api.uat.dupr.gg';
export const UAT_LOGIN='https://uat.dupr.gg';
export const UAT_TEST_CLUB='6459394157';
const encoder=new TextEncoder();
export function classifyDuprResponse(status:number,body:any){
 return status>=200&&status<300&&body?.status!=='FAILURE';
}
export async function duprRequest(url:string,opts:{method?:string;token?:string;refreshToken?:string;body?:unknown;fetcher?:typeof fetch}={}){
 const dest=new URL(url);
 if(dest.protocol!=='https:'||![new URL(UAT_PARTNER).host,new URL(UAT_PUBLIC).host].includes(dest.host))
  throw Error('DUPR UAT destination rejected');
 const headers:Record<string,string>={Accept:'application/json'};
 if(opts.token)headers.Authorization='Bearer '+opts.token;
 if(opts.refreshToken)headers['x-refresh-token']=opts.refreshToken;
 if(opts.body!==undefined)headers['Content-Type']='application/json';
 const response=await (opts.fetcher||fetch)(dest.toString(),{
   method:opts.method||'GET',headers,
   ...(opts.body!==undefined?{body:JSON.stringify(opts.body)}:{}),
   signal:AbortSignal.timeout(10000)
 });
 const data=await response.json().catch(()=>({status:'FAILURE',message:'Invalid provider response'}));
 if(!classifyDuprResponse(response.status,data)){
   const error=new Error('DUPR UAT rejected request');
   (error as any).status=response.status;
   (error as any).requestId=response.headers.get('x-request-id');
   throw error;
 }
 return data;
}
export function basicDuprIdentity(body:any){
 const record=body?.results?.[0];
 const id=record?.duprId;
 if(body?.status!=='SUCCESS'||typeof id!=='string'||!/^\w{6,12}$/.test(id))
  throw Error('DUPR identity verification failed');
 return {duprId:id,displayName:String(record?.fullName||'').slice(0,100)};
}
export function validSsoOrigin(origin:string){return origin===UAT_LOGIN;}
export function entitled(value:any,tier:'basic'|'premium'|'verified'='basic'){
 const list=value?.entitlements?.tournaments;
 return Array.isArray(list)&&list.includes('BASIC_L1')
   &&(tier==='basic'||list.includes(tier==='premium'?'PREMIUM_L1':'VERIFIED_L1'));
}
export function canManageUatClub(memberships:any,clubId:string=UAT_TEST_CLUB){
 const rows=Array.isArray(memberships)?memberships:memberships?.result||memberships?.results||[];
 return Array.isArray(rows)&&rows.some((m:any)=>String(m.clubId)===clubId&&['DIRECTOR','ORGANIZER'].includes(m.role));
}
export function validateMatch(match:any,allowedClub:boolean){
 const bad=(reason:string)=>({ok:false,reason});
 if(!match||typeof match!=='object')return bad('invalid_match');
 if(!['PARTNER','CLUB'].includes(match.matchSource))return bad('source_invalid');
 if(match.matchSource==='CLUB'&&(String(match.clubId)!==UAT_TEST_CLUB||!allowedClub))return bad('club_permission');
 if(match.matchSource==='PARTNER'&&match.clubId!=null)return bad('partner_has_club_id');
 if(!match.identifier||typeof match.identifier!=='string')return bad('identifier_missing');
 if(!['SINGLES','DOUBLES'].includes(match.format))return bad('format_invalid');
 if(!['SIDEOUT','RALLY'].includes(match.matchType))return bad('scoring_invalid');
 const date=String(match.matchDate||'');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date)return bad('date_invalid');
 const n=match.format==='SINGLES'?1:2,ids:string[]=[];
 for(const team of [match.teamA,match.teamB]){
  if(!team)return bad('team_missing');
  for(let i=1;i<=n;i++){const id=team['player'+i];if(typeof id!=='string'||!id.trim())return bad('player_missing');ids.push(id.trim());}
  if(n===1&&team.player2)return bad('singles_extra_player');
 }
 if(new Set(ids).size!==ids.length)return bad('duplicate_player');
 let games=0,stopped=false;
 for(let g=1;g<=5;g++){
  const a=match.teamA['game'+g],b=match.teamB['game'+g];
  if(a==null&&b==null){stopped=true;continue;}
  if(stopped||!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a===b)return bad('invalid_or_tied_game');
  games++;
 }
 if(!games)return bad('score_missing');
 return {ok:true,reason:'eligible'};
}
async function aesKey(secret:string){
 if(secret.length<16)throw Error('DUPR token protection not configured');
 const raw=await crypto.subtle.digest('SHA-256',encoder.encode('rallyhub-dupr-uat-tokens-v1:'+secret));
 return crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt','decrypt']);
}
function b64(bytes:Uint8Array){return btoa(String.fromCharCode(...bytes));}
function fromB64(text:string){return Uint8Array.from(atob(text),c=>c.charCodeAt(0));}
export async function sealTokens(value:{accessToken:string;refreshToken:string},secret:string){
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const ciphertext=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},await aesKey(secret),encoder.encode(JSON.stringify(value))));
 return b64(iv)+'.'+b64(ciphertext);
}
export async function unsealTokens(value:string,secret:string):Promise<{accessToken:string;refreshToken:string}>{
 const [a,b]=value.split('.');
 if(!a||!b)throw Error('Invalid encrypted DUPR connection');
 const obj=JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:fromB64(a)},await aesKey(secret),fromB64(b))));
 if(typeof obj.accessToken!=='string'||typeof obj.refreshToken!=='string')throw Error('Invalid DUPR token pair');
 return obj;
}
