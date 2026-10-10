import fs from 'node:fs';
import path from 'node:path';
import { RALLYHUB_SHARE } from '../src/lib/rallyhubShare.js';

const paths = {
  home:'/',
  directory:'/directory',
  directoryHelp:'/directory/help',
  directoryQuickStart:'/directory/quick-start',
  directoryStory:'/directory/story',
  directoryAdd:'/directory/add',
  about:'/about',
  contact:'/contact',
  events:'/events'
};
const attributes = tag => {
  const result={};
  for (const [,key,,value] of tag.matchAll(/([\w:-]+)\s*=\s*["'](.*?)\\2/g)) result[key]=value;
  return result;
};
const meta=(html,kind,key)=>{
  for(const match of html.matchAll(/<meta\s+[^>]+>/gi)) {
    const a=attributes(match[0]);
    if(a[kind]===key)return a.content;
  }
  return '';
};
const decode=v=>String(v).replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"');
const usingLive=process.argv.includes('--live');
let failed=0;
for (const [key,route] of Object.entries(paths)){
  let html;
  if (usingLive) {
    const response=await fetch('https://rallyhub.ie'+route,{headers:{'User-Agent':'facebookexternalhit/1.1'}});
    if(!response.ok)throw new Error(route+' HTTP '+response.status);
    html=await response.text();
  } else {
    const file=path.join('dist',...route.split('/').filter(Boolean),'index.html');
    html=fs.readFileSync(file,'utf8');
  }
  const expected=RALLYHUB_SHARE[key];
  const title=decode(meta(html,'property','og:title'));
  const description=decode(meta(html,'property','og:description'));
  const site=decode(meta(html,'property','og:site_name'));
  const logo=decode(meta(html,'property','og:image'));
  const pass=title===expected.title&&description===expected.description&&site==='RallyHub'&&logo.includes('/assets/brand/');
  if(!pass)failed++;
  console.log(JSON.stringify({route,pass,title,expectedTitle:expected.title,descriptionMatches:description===expected.description,site,logo}));
}
console.log('RALLYHUB_PREVIEW_CHECK',usingLive?'LIVE':'BUILD',Object.keys(paths).length-failed,'/',Object.keys(paths).length);
if(failed)process.exitCode=1;
