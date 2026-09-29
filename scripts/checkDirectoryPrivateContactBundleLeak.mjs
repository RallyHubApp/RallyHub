import fs from 'node:fs';

const privateSource = fs.readFileSync('base44/functions/directoryContactAction/importedContactEndpoints.ts','utf8');
const match = privateSource.match(/const IMPORTED_CONTACT_ENDPOINTS:any = (\{[\s\S]*?\});\n\nexport function/);
if (!match) throw new Error('Could not parse server-only imported contact map.');
const rows = JSON.parse(match[1]);
const files=[];
const walk=d=>{ for(const e of fs.readdirSync(d,{withFileTypes:true})){ const p=`${d}/${e.name}`; if(e.isDirectory()) walk(p); else if(/\.(js|html)$/.test(e.name)) files.push(p); } };
walk('dist');
const bundle = files.map(f=>fs.readFileSync(f,'utf8')).join('\n').toLowerCase();
const leaks=[];
for(const [slug,row] of Object.entries(rows)){
  const email=String(row.email||'').trim().toLowerCase();
  const phone=String(row.phone||'').replace(/\D/g,'');
  const wa=String(row.whatsapp_url||'').trim().toLowerCase();
  if(email && bundle.includes(email)) leaks.push({slug,type:'email'});
  if(wa && bundle.includes(wa)) leaks.push({slug,type:'whatsapp'});
  if(phone.length>=7){
    const variants=[phone, phone.startsWith('0')?`353${phone.slice(1)}`:''];
    for(const v of variants.filter(Boolean)) if(bundle.replace(/[^0-9]/g,'').includes(v)){ leaks.push({slug,type:'phone'}); break; }
  }
}
console.log(JSON.stringify({privateImportedListings:Object.keys(rows).length,leaks},null,2));
if(leaks.length) process.exit(2);
