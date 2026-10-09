import fs from 'node:fs';import ts from 'typescript';import vm from 'node:vm';import assert from 'node:assert/strict';
const src=fs.readFileSync('base44/functions/eventPosterDiscover/entry.ts','utf8').replace(/^import .*\n/,'');const js=ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
let handler,role='admin',html=fs.readFileSync('/tmp/pbi-events.html','utf8');const page='https://pickleballireland.ie/events/';
const context={createClientFromRequest:()=>({auth:{me:async()=>({role})}}),Deno:{serve:fn=>handler=fn},fetch:async()=>new Response(html,{status:200,headers:{'content-type':'text/html'}}),Response,Request,URL,AbortSignal,console};vm.runInNewContext(js,context);
const run=async(eventName='Munster Open 2027',eventUrl=page)=>{const res=await handler(new Request('https://test.local',{method:'POST',body:JSON.stringify({eventName,eventUrl})}));return {status:res.status,body:await res.json()}};
let r=await run();assert.equal(r.status,200);assert.equal(r.body.selected?.imageUrl,'https://pickleballireland.ie/wp-content/uploads/2026/10/Sqaure.webp');assert.equal(r.body.selected?.origin,'event-jsonld');assert.equal(r.body.reviewRequired,false);console.log('PASS real Pickleball Ireland events HTML identifies Munster Open poster');
r=await run('Another Completely Different Event');assert.equal(r.body.selected,null);assert.equal(r.body.reviewRequired,true);console.log('PASS unrelated event does not select Munster poster');
r=await run('Munster Open 2027','https://example.org/events/');assert.equal(r.status,400);console.log('PASS disallowed source domain rejected');
role='user';r=await run();assert.equal(r.status,403);console.log('PASS non-admin rejected');
