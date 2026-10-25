// Portable, first-party UTM parser. Never captures arbitrary query-string parameters.
const keys=['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
const safe=(value)=>String(value||'').replace(/[\x00-\x1f\x7f]/g,'').trim().slice(0,100);
export function parseDirectoryAttribution(search='',previous={}){
 const params=new URLSearchParams(String(search||'').replace(/^\?/,''));
 const incoming=Object.fromEntries(keys.map(key=>[key,safe(params.get(key))]).filter(([,value])=>value));
 if(!Object.keys(incoming).length)return Object.fromEntries(keys.map(key=>[key,safe(previous?.[key])]).filter(([,value])=>value));
 return incoming;
}
