import {directoryClubs} from '../src/data/directorySeed.js';
import {importedContactEndpointFor} from '../base44/functions/directoryContactAction/importedContactEndpoints.ts';
import {staticContactOverrideFor,STATIC_LEGACY_HOLD_SLUGS} from '../base44/functions/directoryContactAction/staticContactOverrides.ts';
const APP='6a01dc00702b7dd2a2978c28';
const r=await fetch(`https://rallyhub.ie/api/apps/${APP}/functions/directoryListingProfile`,{method:'POST',headers:{'content-type':'application/json','x-app-id':APP,'base44-functions-version':'prod','x-base44-anonymous-id':'registry-check','x-origin-url':'https://rallyhub.ie/directory'},body:JSON.stringify({action:'public_list'})});
const j=await r.json();
const slugs=[...new Set([...directoryClubs.map(x=>x.slug),...Object.keys(j.listings||{})])].filter(Boolean).sort();
const missing=slugs.filter(s=>!STATIC_LEGACY_HOLD_SLUGS.has(s)&&!staticContactOverrideFor(s)&&!importedContactEndpointFor(s));
console.log(JSON.stringify({status:r.status,count:slugs.length,holds:slugs.filter(s=>STATIC_LEGACY_HOLD_SLUGS.has(s)),protectedExpected:slugs.length-slugs.filter(s=>STATIC_LEGACY_HOLD_SLUGS.has(s)).length,missing},null,2));
