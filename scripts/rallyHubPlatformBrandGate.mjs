import fs from 'node:fs';
import {build} from 'esbuild';
import {pathToFileURL} from 'node:url';
const {outputFiles}=await build({entryPoints:['base44/shared/rallyHubPlatformEmail.ts'],bundle:true,platform:'node',format:'esm',write:false});
const uri='data:text/javascript;base64,'+Buffer.from(outputFiles[0].text).toString('base64');
const {rallyHubEmailShell,RALLYHUB_UTILITY_LINKS}=await import(uri);
const html=rallyHubEmailShell({title:'Welcome',content:'<p>Sample</p>',footerNote:'RallyHub Directory'});
const ev=rallyHubEmailShell({title:'Upcoming events',content:'<p>Sample</p>',footerNote:'RallyHub Events',utilityLinks:['website','facebook']});
const none=rallyHubEmailShell({title:'Update',content:'<p>Sample</p>',footerNote:'RallyHub App',utilityLinks:[]});
const checks={
 'C3 header logo':html.includes('/C3-primary-with-strapline.png'),
 'C2 footer logo':html.includes('/rallyhub-master-02-reversed.png'),
 'one line Founder, RallyHub':html.includes('>Founder, RallyHub</p>')&&!html.includes('>Founder</p>'),
 'platform contact label':html.includes('Phone / WhatsApp:')&&html.includes('tel:+353878100333'),
 'platform website':html.includes('>rallyhub.ie</a>'),
 'single footer descriptor':html.includes('>RallyHub Directory</div>'),
 'Events descriptor override':ev.includes('>RallyHub Events</div>')&&!ev.includes('>RallyHub Directory</div>'),
 'App descriptor override':none.includes('>RallyHub App</div>'),
 'selected links only':ev.includes('facebook.com/rallyhubapp/')&&!ev.includes('instagram.com/rallyhubapp/')&&!ev.includes('>Help Centre</a>'),
 'no utility links':!none.includes('>Facebook</a>')&&!none.includes('>Directory</a>'),
 'six selectable utility keys':RALLYHUB_UTILITY_LINKS.length===6,
 'responsive viewport':html.includes('name="viewport"')
};
const active=[...fs.readdirSync('base44/functions',{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>'base44/functions/'+x.name), 'base44/functions','src/services/communications'];
for(const dir of active){let files=[];try{files=fs.readdirSync(dir)}catch{continue}
 for(const file of files.filter(x=>/\.(tsx?|jsx?)$/.test(x))){const path=dir+'/'+file;const text=fs.readFileSync(path,'utf8');
  if(/https:\/\/rallyhub\.ie\/assets\/brand\/rallyhub-(signature-light|horizontal-light)\.png/.test(text))checks['No legacy email logo URL: '+path]=false;
 }
}
for(const [label,ok] of Object.entries(checks))console.log((ok?'PASS':'FAIL')+' '+label);
if(Object.values(checks).some(x=>!x))process.exit(1);
