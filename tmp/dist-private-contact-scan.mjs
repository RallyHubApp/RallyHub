import fs from 'fs';
import path from 'path';
import { directoryClubs } from '../src/data/directorySeed.js';
import { importedContactEndpointFor } from '../base44/functions/directoryContactAction/importedContactEndpoints.ts';
const needles=[];
for(const c of directoryClubs){const e=importedContactEndpointFor(c.slug);if(!e)continue;const digits=String(e.phone||'').replace(/\D/g,'');if(digits.length>=7)needles.push({slug:c.slug,type:'phone',value:digits});const email=String(e.email||'').trim().toLowerCase();if(email)needles.push({slug:c.slug,type:'email',value:email});}
const files=[];const walk=d=>{for(const n of fs.readdirSync(d)){const p=path.join(d,n);const s=fs.statSync(p);if(s.isDirectory())walk(p);else if(/\.(js|html|json|css)$/.test(n))files.push(p);}};walk('dist');
const text=files.map(f=>fs.readFileSync(f,'utf8')).join('\n').toLowerCase();const digitsText=text.replace(/\D/g,'');
const leaks=needles.filter(n=>n.type==='email'?text.includes(n.value):digitsText.includes(n.value));
console.log(JSON.stringify({needles:needles.length,files:files.length,leaks},null,2));
