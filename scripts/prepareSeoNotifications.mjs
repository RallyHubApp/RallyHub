// Read-only by default. Creates a validated IndexNow submission preview from
// the generated public sitemap. Never submits without --submit and credentials.
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
const domain='rallyhub.ie';
const sitemap=fs.readFileSync('public/directory-sitemap.xml','utf8');
const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(x=>x[1].replace(/&amp;/g,'&'));
const unique=[...new Set(urls)];
const excluded=/(\/app(?:\/|$)|\/admin(?:\/|$)|\/login(?:\/|$)|\/register(?:\/|$)|\/forgot-password(?:\/|$)|\/reset-password(?:\/|$)|\/trial\/)/;
const valid=url=>{try{const u=new URL(url);return u.protocol==='https:'&&u.hostname===domain&&!u.search&&!u.hash&&!excluded.test(u.pathname)}catch{return false}};
if(!unique.length||unique.length!==urls.length||unique.some(u=>!valid(u)))throw new Error('Sitemap contains duplicate or invalid/nonpublic URLs');
const flags=process.argv.slice(2);const submit=flags.includes('--submit');
const positional=flags.filter(f=>f.startsWith('https://'));
const selected=positional.length?positional:unique;
if(selected.some(x=>!unique.includes(x)))throw new Error('Only public sitemap URLs may be submitted');
if(selected.length>10000)throw new Error('IndexNow allows max 10000 URLs per request');
const key=process.env.INDEXNOW_KEY;
const payload={host:domain,key:key||'[KEY_NOT_CONFIGURED]',urlList:selected};
if(!submit){console.log(JSON.stringify({mode:'DRY_RUN',sitemapTotal:urls.length,selectedCount:selected.length,prioritySample:selected.slice(0,10),keyConfigured:Boolean(key),message:'No submission performed. After key is hosted and verified, pass --submit with a verified INDEXNOW_KEY and a list of changed sitemap URLs.'},null,2));process.exit(0)}
if(!key||!/^[a-zA-Z0-9-]{8,128}$/.test(key))throw new Error('Set a valid INDEXNOW_KEY before submission');
const keyUrl=`https://${domain}/${key}.txt`;
const response=await fetch(keyUrl,{signal:AbortSignal.timeout(10000)});
if(!response.ok||(await response.text()).trim()!==key)throw new Error('IndexNow key file not reachable and verified at '+keyUrl);
const res=await fetch('https://api.indexnow.org/indexnow',{method:'POST',headers:{'Content-Type':'application/json; charset=utf-8'},body:JSON.stringify({...payload,key}),signal:AbortSignal.timeout(20000)});
console.log(JSON.stringify({status:res.status,submitted:selected.length,accepted:res.status===200||res.status===202}));
if(res.status!==200&&res.status!==202)process.exitCode=1;
