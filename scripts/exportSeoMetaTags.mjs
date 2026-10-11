import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const dist = path.join(root, 'dist');
const out = path.join(root, 'reports', 'seo');
if (!fs.existsSync(dist)) throw new Error('Build first: npm run build');
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const filepath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(filepath);
    else if (entry.name === 'index.html') files.push(filepath);
  }
}
function attrFromTag(tag) {
  const a = {};
  for (const [,key,value] of tag.matchAll(/([\w:-]+)="([^"]*)"/g)) a[key]=value;
  return a;
}
const decode = text => String(text).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&#x27;/gi,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
function tag(html, kind, name) {
  for (const [element] of html.matchAll(/<meta\s+[^>]*>/gi)) {
    const a=attrFromTag(element);
    if (a[kind]===name) return decode(a.content||'');
  }
  return '';
}
const urlForFile = f => {
  const relative = path.relative(dist,f).split(path.sep).join('/');
  return relative === 'index.html' ? '/' : '/' + relative.replace(/\/index\.html$/, '');
};
walk(dist);
const rows = files.map(file => {
  const html = fs.readFileSync(file,'utf8');
  const route=urlForFile(file);
  const title=tag(html,'property','og:title');
  const description=tag(html,'property','og:description');
  const image=tag(html,'property','og:image');
  return {route,url:'https://rallyhub.ie'+(route==='/'?'':route),title,description,image,title_length:title.length,description_length:description.length,review:title.length>60?'REVIEW_TITLE_LENGTH':description.length>160?'REVIEW_DESCRIPTION_LENGTH':'READY'};
}).sort((a,b)=>a.route.localeCompare(b.route));
const missing=rows.filter(r=>!r.title||!r.description||!r.image);
const duplicate=rows.filter((r,i)=>rows.findIndex(other=>other.route===r.route)!==i);
if(missing.length||duplicate.length) throw new Error('Missing metadata: '+missing.length+'; duplicate routes: '+duplicate.length);
const quote = value => '"'+String(value??'').replace(/"/g,'""')+'"';
const cols=['route','url','title','description','image','title_length','description_length','review'];
const csv=[cols.map(quote).join(','),...rows.map(row=>cols.map(k=>quote(row[k])).join(','))].join('\n')+'\n';
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'rallyhub-seo-master.csv'),csv);
fs.writeFileSync(path.join(out,'rallyhub-seo-master.json'),JSON.stringify({source:'npm run build / dist prerendered metadata',generated_at:new Date().toISOString(),rows},null,2)+'\n');
const review=rows.filter(r=>r.review!=='READY');
console.log(JSON.stringify({generated:rows.length,ready:rows.length-review.length,review:review.length,review_routes:review.map(r=>r.route),csv:path.relative(root,path.join(out,'rallyhub-seo-master.csv')),json:path.relative(root,path.join(out,'rallyhub-seo-master.json')),note:'Export only; does NOT modify Base44 marketing SEO settings.'},null,2));
