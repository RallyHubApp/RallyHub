// RallyHub Directory: authorised HTTPS-logo batch runner.
// Plans are offline and read-only. --run invokes existing directoryLogoIngest via
// Base44's authenticated CLI; never attaches/publishes a Directory logo.
// Only explicit operator-approved slugs are staged. Do not infer approval from a historical QA flag.
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
const ROOT=process.cwd();
const ledger=process.argv.find(x=>x.startsWith('--ledger='))?.split('=').slice(1).join('=') ||
  'docs/directory-branding/RALLYHUB_LOGO_BATCH_LEDGER_2026-10-13.json';
const run=process.argv.includes('--run');
const approvedArg=process.argv.find(x=>x.startsWith('--approved='))?.split('=').slice(1).join('=') || '';
const approved=new Set(approvedArg.split(',').map(x=>x.trim()).filter(Boolean));
const target=process.argv.find(x=>x.startsWith('--only='))?.split('=').slice(1).join('=') || '';
const source=JSON.parse(await readFile(path.resolve(ROOT,ledger),'utf8'));
const candidates=source.candidates||[];
if(!Array.isArray(candidates)||candidates.length===0)throw Error('Ledger contains no candidates');
if(run&&approved.size===0)throw Error('--run requires --approved=<exact slug list> (explicit approval)');
if(target&&!candidates.some(x=>x.slug===target))throw Error('Unknown --only slug');
const receiptsPath=path.resolve(ROOT,'docs/directory-branding/.staged-receipts.json');
let receipts={};
try{receipts=JSON.parse(await readFile(receiptsPath,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
const report=[];
for(const c of candidates){
 if(target && c.slug!==target)continue;
 const item={slug:c.slug,name:c.club,approved:approved.has(c.slug),status:'hold'};
 try{
  const local=await readFile(path.resolve(ROOT,c.repositoryAsset));
  const sha=createHash('sha256').update(local).digest('hex');
  if(!/^[a-f0-9]{64}$/i.test(c.sha256)||sha!==c.sha256.toLowerCase()||local.length!==c.bytes)throw Error('Local approval SHA-256/size mismatch');
  if(!/^https:\/\//i.test(c.sourceImage||''))throw Error('No approved HTTPS source');
  if(!c.priorQaApproved)throw Error('Not approved in historical QA');
  if(!approved.has(c.slug)){item.reason='Not in explicit approved slug selection';report.push(item);continue;}
  if(receipts[c.slug]?.sha256===sha&&receipts[c.slug]?.readbackVerified===true){
   item.status='already_verified';item.receipt=receipts[c.slug];report.push(item);continue;
  }
  const imageUrl=new URL(c.sourceImage);
  if(imageUrl.username||imageUrl.password||imageUrl.port||imageUrl.protocol!=='https:')throw Error('Unsafe HTTPS source');
  // No source bytes are streamed through the CLI or chat. The backend fetches
  // the approved URL and verifies it against the repository's original digest.
  item.status=run?'pending':'ready_for_authenticated_staging';
  item.approvalId='RHLOGO-'+source.date.replaceAll('-','')+'-'+String(c.number);
  if(run){
   const body={listingSlug:c.slug,sourceUrl:c.sourceImage,expectedSha256:sha,approvalId:item.approvalId};
   const snippet=`const response=await base44.functions.invoke('directoryLogoIngest', ${JSON.stringify(body)});\nconsole.log('RALLYHUB_RESULT:'+JSON.stringify(response?.data||response));`;
   const p=spawnSync('base44',['--app-id','6a01dc00702b7dd2a2978c28','exec'],{
    encoding:'utf8',input:snippet,timeout:90000,maxBuffer:1024*1024
   });
   const logs=(p.stdout||'')+'\n'+(p.stderr||'');
   const match=logs.match(/RALLYHUB_RESULT:(\{[^\n]*\})/);
   if(!match)throw Error('No structured receipt from authorised CLI; outcome indeterminate, check storage before retrying');
   const receipt=JSON.parse(match[1]);
   if(receipt.success!==true||receipt.status!=='staged'||receipt.listingSlug!==c.slug||
      receipt.sha256!==sha||receipt.readbackVerified!==true||!receipt.fileUrl)
     throw Error('Backend did not return an independently verified receipt: '+String(receipt.error||'unknown'));
   item.status='verified_staged';item.receipt={slug:c.slug,sha256:sha,fileUrl:receipt.fileUrl,
       approvalId:item.approvalId,readbackVerified:true,verifiedAt:new Date().toISOString()};
   receipts[c.slug]=item.receipt;
   await mkdir(path.dirname(receiptsPath),{recursive:true});
   await writeFile(receiptsPath,JSON.stringify(receipts,null,2)+'\n',{mode:0o600});
  }
 }catch(e){item.status=run&&item.status==='pending'?'indeterminate':'hold';item.reason=String(e.message||e);}
 report.push(item);
 // First live run is single-entry acceptance: do not continue if any failure.
 if(run&&item.status==='indeterminate')break;
}
console.log(JSON.stringify({mode:run?'authenticated-staging':'dry-run',ledger,processed:report.length,
 results:report.map(({receipt,...x})=>({...x,...receipt?{receipt}: {}}))},null,2));
if(run&&report.some(x=>x.status==='indeterminate'))process.exitCode=2;
