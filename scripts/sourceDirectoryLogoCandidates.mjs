import fs from 'node:fs';
import path from 'node:path';

const input = JSON.parse(fs.readFileSync('docs/directory-branding/RALLYHUB_DIRECTORY_LOGO_AUDIT_2026-09-30.json', 'utf8'))
  .listings.filter(row => row.auditStatus === 'Missing · source lead');
const outDir = path.resolve('public/directory/logo-candidates/2026-09-30');
fs.mkdirSync(outDir, { recursive: true });
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/153 Safari/537.36';

const waitFetch = async (url, options = {}, timeoutMs = 15000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(url, { redirect: 'follow', ...options, signal: controller.signal, headers: { 'user-agent': UA, ...(options.headers || {}) } }); }
  finally { clearTimeout(timer); }
};
const abs = (url, base) => { try { return new URL(url, base).href; } catch { return ''; } };
const decode = (s='') => s.replace(/&amp;/g,'&').replace(/&#x2F;/g,'/').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
const tokensFor = name => String(name || '').toLowerCase().replace(/pickleball|club|assoc\.?|series/g,' ').replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(t => t.length > 2);
const extFrom = (type='', url='') => /svg/i.test(type)||/\.svg(?:\?|$)/i.test(url)?'svg':/png/i.test(type)||/\.png(?:\?|$)/i.test(url)?'png':/webp/i.test(type)||/\.webp(?:\?|$)/i.test(url)?'webp':/gif/i.test(type)||/\.gif(?:\?|$)/i.test(url)?'gif':'jpg';

async function saveImage(url, number, slug) {
  try {
    const response = await waitFetch(url, { headers: { accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8' } });
    if (!response.ok) return null;
    const type = response.headers.get('content-type') || '';
    if (!/image\//i.test(type)) return null;
    const body = Buffer.from(await response.arrayBuffer());
    if (body.length < 1500 || body.length > 5_000_000) return null;
    const ext = extFrom(type, response.url || url);
    const filename = `${String(number).padStart(2,'0')}-${slug}.${ext}`;
    fs.writeFileSync(path.join(outDir, filename), body);
    return { filename, bytes: body.length, contentType: type, finalImageUrl: response.url || url };
  } catch { return null; }
}

function websiteCandidates(html, base, clubName) {
  const tokens = tokensFor(clubName); const list = [];
  const push = (raw, kind, baseScore, context='') => {
    const url = decode(abs(raw, base)); if (!/^https?:/i.test(url)) return;
    const hay = `${url} ${context}`.toLowerCase(); let score = baseScore;
    if (/logo|crest|badge|brand/i.test(hay)) score += 25;
    score += tokens.filter(t => hay.includes(t)).length * 14;
    if (!list.some(x => x.url === url)) list.push({ url, kind, score, context });
  };
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0]; const src = (tag.match(/(?:src|data-src|data-lazy-src)=["']([^"']+)["']/i)||[])[1]; if (!src) continue;
    const alt = (tag.match(/alt=["']([^"']*)["']/i)||[])[1] || ''; const cls = (tag.match(/class=["']([^"']*)["']/i)||[])[1] || '';
    push(src, 'website-img', 15, `${alt} ${cls}`);
  }
  for (const m of html.matchAll(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image(?::src)?)["'][^>]+content=["']([^"']+)["']/gi)) push(m[1], 'website-meta', 18, 'og-image');
  return list.sort((a,b)=>b.score-a.score);
}

async function websiteCandidate(row, number) {
  if (!row.website) return null;
  try {
    const page = await waitFetch(row.website, { headers: { accept: 'text/html,application/xhtml+xml' } });
    if (!page.ok) return null;
    const html = await page.text(); const finalPage = page.url || row.website;
    const title = ((html.match(/<title[^>]*>([^<]+)<\/title>/i)||[])[1] || '').trim();
    const tokens=tokensFor(row.name); const pageMatch=tokens.filter(t => (`${title} ${finalPage}`).toLowerCase().includes(t)).length;
    for (const c of websiteCandidates(html, finalPage, row.name).slice(0, 15)) {
      const saved = await saveImage(c.url, number, row.slug); if (!saved) continue;
      const exactish = c.score >= 65 || (c.score >= 48 && pageMatch >= 1);
      const confidence = exactish ? (c.score >= 80 ? 'HIGH' : 'MEDIUM') : 'LOW';
      return { ...saved, method:'official-website', sourcePage:finalPage, sourceImage:c.url, sourceTitle:title, confidence, score:c.score, candidateKind:c.kind, decision:confidence==='HIGH'?'APPROVE':'HOLD' };
    }
  } catch {}
  return null;
}

function facebookIdentifier(url='') {
  try {
    const u = new URL(url); const id=u.searchParams.get('id'); if(id && /^\d+$/.test(id)) return id;
    const p=u.pathname.replace(/^\/+|\/+$/g,'');
    const parts=p.split('/');
    if (['people','p'].includes(parts[0]) && /\d+$/.test(parts.at(-1))) return parts.at(-1);
    if (parts[0]==='groups' && parts[1] && /^\d+$/.test(parts[1])) return parts[1];
    if (parts[0] && !['share','groups','watch','profile.php','login'].includes(parts[0])) return parts[0];
  } catch {}
  return '';
}
async function resolveFacebook(url='') {
  let identifier=facebookIdentifier(url), pageUrl=url, title='';
  if (identifier) return { identifier, pageUrl, title };
  try {
    const response=await waitFetch(url,{headers:{accept:'text/html,application/xhtml+xml'}}); const html=await response.text();
    const patterns=[/https:\/\/www\.facebook\.com\/(?:people|p)\/[^"'< ]+\/(\d+)\//i,/https:\/\/www\.facebook\.com\/([A-Za-z0-9._-]{3,})\/?/i];
    for(const re of patterns){const m=html.match(re); if(m){identifier=m[1]; pageUrl=m[0]; break;}}
    title=((html.match(/<title[^>]*>([^<]+)<\/title>/i)||[])[1]||'').trim();
  } catch {}
  return {identifier,pageUrl,title};
}
async function facebookCandidate(row, number) {
  if (!row.facebook) return null;
  const resolved=await resolveFacebook(row.facebook); if(!resolved.identifier) return null;
  const graph=`https://graph.facebook.com/${encodeURIComponent(resolved.identifier)}/picture?type=large&width=800&height=800`;
  const saved=await saveImage(graph, number, row.slug); if(!saved) return null;
  const tokens=tokensFor(row.name); const hay=`${resolved.pageUrl} ${resolved.title} ${row.facebook}`.toLowerCase(); const matches=tokens.filter(t=>hay.includes(t)).length;
  const confidence=matches>=1 || resolved.identifier===facebookIdentifier(row.facebook) ? 'MEDIUM' : 'LOW';
  return {...saved,method:'official-facebook-profile',sourcePage:resolved.pageUrl||row.facebook,sourceImage:graph,sourceTitle:resolved.title,confidence,score:matches*20+45,candidateKind:'facebook-profile-image',decision:confidence==='LOW'?'HOLD':'APPROVE'};
}

async function instagramCandidate(row, number) {
  if (!row.instagram) return null;
  try {
    const response=await waitFetch(row.instagram,{headers:{accept:'text/html,application/xhtml+xml'}}); if(!response.ok)return null; const html=await response.text();
    const image=(html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)||[])[1]; if(!image)return null;
    const saved=await saveImage(decode(image),number,row.slug); if(!saved)return null;
    return {...saved,method:'official-instagram-profile',sourcePage:response.url||row.instagram,sourceImage:decode(image),sourceTitle:'',confidence:'MEDIUM',score:55,candidateKind:'instagram-profile-image',decision:'APPROVE'};
  } catch {return null;}
}

const results=[];
let number=0;
for(const row of input){
  number++;
  let candidate=await websiteCandidate(row,number);
  // Website generic/low candidates do not block a stronger club social profile.
  if(!candidate || candidate.confidence==='LOW') candidate=(await facebookCandidate(row,number)) || (await instagramCandidate(row,number)) || candidate;
  results.push({number,name:row.name,slug:row.slug,county:row.county,website:row.website||'',facebook:row.facebook||'',instagram:row.instagram||'',status:candidate?'CANDIDATE':'NO_CANDIDATE',...(candidate||{confidence:'NONE',decision:'HOLD'})});
  console.log(`${String(number).padStart(2,'0')} ${row.name}: ${candidate ? `${candidate.confidence} ${candidate.method} ${candidate.decision}` : 'NO CANDIDATE'}`);
}
fs.writeFileSync('docs/directory-branding/RALLYHUB_LOGO_CANDIDATES_EASY_SOURCE_2026-09-30.json',JSON.stringify(results,null,2));
console.log(JSON.stringify({total:results.length,candidates:results.filter(r=>r.status==='CANDIDATE').length,approve:results.filter(r=>r.decision==='APPROVE').length,hold:results.filter(r=>r.decision==='HOLD').length,high:results.filter(r=>r.confidence==='HIGH').length,medium:results.filter(r=>r.confidence==='MEDIUM').length,low:results.filter(r=>r.confidence==='LOW').length,none:results.filter(r=>r.confidence==='NONE').length},null,2));
