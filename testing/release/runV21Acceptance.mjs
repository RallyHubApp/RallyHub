import {spawnSync} from 'node:child_process';
import {readdirSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {classifyV21Tests,assessV21Release,V21_WORKSTREAMS} from './v21Matrix.mjs';
const root=resolve(import.meta.dirname,'../..');
const include=(dir)=>readdirSync(join(root,dir)).filter(x=>x.endsWith('.test.mjs')).map(x=>`${dir}/${x}`);
const files=[...include('testing/ccc'),...include('testing/directory'),...include('testing/events'),...include('testing/membership')];
const groups=classifyV21Tests(files);
const args=new Set(process.argv.slice(2));
const selected=args.has('--all')?groups:groups.filter(g=>args.has(`--${g.id}`));
if(!selected.length){console.error('Specify --all or one or more --identity --booking --events --sporting --directory_comms');process.exit(2)}
const results=[];
for(const group of selected){
 const run=spawnSync(process.execPath,['--test',...group.tests],{cwd:root,encoding:'utf8',maxBuffer:20*1024*1024,timeout:120000});
 const text=String(run.stdout||'')+'\n'+String(run.stderr||'');
 const count=(key)=>Number(text.match(new RegExp(`^ℹ ${key} (\\d+)$`,'m'))?.[1]||0);
 const passed=run.status===0&&count('tests')>0&&count('fail')===0;
 results.push({...group,passed,testCount:count('tests'),passedTests:count('pass'),failedTests:count('fail'),exitCode:run.status,error:passed?null:text.slice(-1500)});
 console.log(`${passed?'PASS':'FAIL'} ${group.name}: ${count('pass')}/${count('tests')} tests`);
}
const release=assessV21Release({testGroups:results});
const report={schema:'rallyhub-v21-release-acceptance-v1',generatedAt:new Date().toISOString(),branch:'development/sporting-format-preflight-20261031',coverage:results.map(({id,name,tests,testCount,passedTests,failedTests,passed,evidenceRequired})=>({id,name,files:tests.length,testCount,passedTests,failedTests,passed,evidenceRequired})),release,notice:'Local source tests only. Provider, tenant, concurrency and mobile runtime evidence must be independently recorded.'};
const output=resolve(root,'reports/v21-release-acceptance.json');mkdirSync(resolve(root,'reports'),{recursive:true});writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(`Release ready: ${release.ready}; report: ${output}`);
if(results.some(g=>!g.passed))process.exitCode=1;
