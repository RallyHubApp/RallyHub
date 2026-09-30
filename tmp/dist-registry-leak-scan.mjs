import fs from 'fs';import path from 'path';
const srcs=['base44/functions/directoryContactAction/importedContactEndpoints.ts','base44/functions/directoryContactAction/staticContactOverrides.ts'];
const text=srcs.map(p=>fs.readFileSync(p,'utf8')).join('\n');
const vals=new Set();
for(const m of text.matchAll(/['"]([^'"\n]+@[^'"\n]+)['"]/g)) vals.add(m[1].toLowerCase());
for(const m of text.matchAll(/(?:phone|whatsapp_url):\s*['"]([^'"]+)['"]/g)){const d=m[1].replace(/\D/g,'');if(d.length>=8)vals.add(d)}
const files=[];const walk=d=>{for(const n of fs.readdirSync(d)){const p=path.join(d,n),s=fs.statSync(p);if(s.isDirectory())walk(p);else if(/\.(js|html|json|css)$/.test(n))files.push(p)}};walk('dist');
const leaks=[];for(const f of files){const c=fs.readFileSync(f,'utf8').toLowerCase(),digits=c.replace(/\D/g,'');for(const v of vals){if(v.includes('@')?c.includes(v):digits.includes(v))leaks.push({file:f,value:v})}}
console.log(JSON.stringify({needles:vals.size,files:files.length,leaks:leaks.slice(0,20),leakCount:leaks.length},null,2));
