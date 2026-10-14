import { createClientFromRequest } from 'npm:@base44/sdk@0.8.51';

// Directory artwork staging only. Never changes DirectoryListingProfile or publishes a logo.
const MAX_BYTES = 12_000_000;
const SOURCE_HOSTS = new Set([
  'static.wixstatic.com', 'www.ezpickleball.ie', 'ezpickleball.ie',
  'lisburnpickleball.club', 'www.lisburnpickleball.club',
  'www.duhallowpickleball.com', 'duhallowpickleball.com',
  'www.deryckpayne.eu', 'deryckpayne.eu', 'primary.jwwb.nl',
  'base44.app', 'www.base44.app'
]);
// Reuse the universal asset intake's staging-only service secret, never a directory publish credential.
async function validTransferKey(req: Request) {
  const configured = Deno.env.get('RALLYHUB_ASSET_TRANSFER_SECRET') || '';
  const header = req.headers.get('authorization') || '';
  const candidate = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (configured.length < 32 || candidate.length !== configured.length) return false;
  const encoder = new TextEncoder();
  const [a,b] = await Promise.all([
    crypto.subtle.digest('SHA-256',encoder.encode(candidate)),
    crypto.subtle.digest('SHA-256',encoder.encode(configured))
  ]);
  const aa = new Uint8Array(a), bb = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < aa.length; i++) diff |= aa[i] ^ bb[i];
  return diff === 0;
}
const HASH = async bytes => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)))
  .map(n => n.toString(16).padStart(2, '0')).join('');
function sourceUrl(value) {
  const u = new URL(String(value || ''));
  if (u.protocol !== 'https:' || !SOURCE_HOSTS.has(u.hostname.toLowerCase()) || u.username || u.password || u.port || u.hash)
    throw Error('Source URL must be from an approved HTTPS artwork host');
  return u;
}
function identify(b) {
  if (b.length >= 26 && b[0] === 137 && b[1] === 80 && b[2] === 78 && b[3] === 71 &&
      b[4] === 13 && b[5] === 10 && b[6] === 26 && b[7] === 10)
    return {format:'png',mime:'image/png',width:new DataView(b.buffer,b.byteOffset,b.byteLength).getUint32(16),height:new DataView(b.buffer,b.byteOffset,b.byteLength).getUint32(20)};
  if (b.length >= 12 && String.fromCharCode(...b.slice(0,4)) === 'RIFF' &&
      String.fromCharCode(...b.slice(8,12)) === 'WEBP') return {format:'webp',mime:'image/webp'};
  if (b.length >= 3 && b[0] === 255 && b[1] === 216 && b[2] === 255) return {format:'jpeg',mime:'image/jpeg'};
  throw Error('Artwork must be a valid PNG, JPEG or WebP image');
}
async function readBack(url, digest) {
  const src = new URL(url);
  if (src.protocol !== 'https:' || !['base44.app','www.base44.app'].includes(src.hostname))
    throw Error('Storage URL not approved');
  let res = await fetch(src.toString(), {redirect:'manual',signal:AbortSignal.timeout(15000)});
  if ([301,302,303,307,308].includes(res.status)) {
    const location = res.headers.get('location');
    if (!location) throw Error('Storage redirect without location');
    const next = new URL(location,src);
    if (next.protocol !== 'https:' || next.hostname !== 'media.base44.com')
      throw Error('Storage redirected to untrusted host');
    res = await fetch(next.toString(), {redirect:'error',signal:AbortSignal.timeout(15000)});
  }
  if (!res.ok) throw Error('Storage readback failed');
  const data = new Uint8Array(await res.arrayBuffer());
  if (data.length > MAX_BYTES || await HASH(data) !== digest) throw Error('Stored artwork checksum mismatch');
  return true;
}
Deno.serve(async req => {
  try {
    if (req.method !== 'POST') return Response.json({error:'POST required'}, {status:405});
    const b = createClientFromRequest(req);
    const serviceAuthenticated = await validTransferKey(req);
    const user = serviceAuthenticated ? null : await b.auth.me().catch(() => null);
    if (!serviceAuthenticated && !user) return Response.json({success:false,error:'Authentication required'}, {status:401});
    const body = await req.json();
    const slug = String(body?.listingSlug || '').trim();
    const expected = String(body?.expectedSha256 || '').trim().toLowerCase();
    const approvalId = String(body?.approvalId || '').trim();
    if (!/^[a-z0-9][a-z0-9-]{1,179}$/.test(slug) ||
        !/^[a-f0-9]{64}$/.test(expected) || !/^[a-zA-Z0-9:_-]{6,160}$/.test(approvalId))
      return Response.json({error:'Valid listing slug, approval reference and expected SHA-256 required'}, {status:400});
    // A valid service credential may stage approved checksummed artwork only.
    // Directory owners and other users still require their existing listing access.
    if (!serviceAuthenticated && user.role !== 'admin') {
      const rows = await b.asServiceRole.entities.DirectoryListingAccess.filter({listing_slug:slug,user_id:user.id,status:'active'},'-granted_at',5);
      if (!rows?.length) return Response.json({error:'Directory editor permission required'}, {status:403});
    }
    const profiles = await b.asServiceRole.entities.DirectoryListingProfile.filter({listing_slug:slug,status:'active'},'-updated_at',1);
    const records = await b.asServiceRole.entities.DirectoryListingRecord.filter({slug,status:'active'},'-published_at',1);
    if (!profiles?.length && !records?.length) return Response.json({error:'Directory listing not found'}, {status:404});
    const url = sourceUrl(body?.sourceUrl);
    const response = await fetch(url.toString(), {redirect:'error',signal:AbortSignal.timeout(15000),headers:{'accept':'image/png,image/jpeg,image/webp'}});
    if (!response.ok) return Response.json({error:'Approved image source unavailable'}, {status:422});
    const len = Number(response.headers.get('content-length') || 0);
    if (len > MAX_BYTES) return Response.json({error:'Image exceeds 12 MB'}, {status:413});
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (!bytes.length || bytes.length > MAX_BYTES) return Response.json({error:'Invalid image size'}, {status:413});
    const type = identify(bytes);
    if (type.width && (type.width < 1 || type.height < 1 || type.width > 20000 || type.height > 20000))
      throw Error('Invalid image dimensions');
    const digest = await HASH(bytes);
    if (digest !== expected) return Response.json({error:'Approval checksum mismatch; nothing uploaded',computedSha256:digest}, {status:422});
    const file = new File([bytes], 'directory-logo-' + slug + '-' + digest.slice(0,16) + '.' + type.format, {type:type.mime});
    const uploaded = await b.asServiceRole.integrations.Core.UploadFile({file});
    if (!uploaded?.file_url) throw Error('Storage did not return URL');
    await readBack(uploaded.file_url,digest);
    // This operation only stages a verified file. An explicitly authorised profile save is required to use it.
    return Response.json({success:true,status:'staged',listingSlug:slug,approvalId,sourceUrl:url.toString(),
      fileUrl:uploaded.file_url,sha256:digest,bytes:bytes.length,format:type.format,
      readbackVerified:true,authMethod:serviceAuthenticated?'service-staging':'directory-session',requiresApproval:true,published:false});
  } catch (e) {
    console.error('directoryLogoIngest staging failed',String(e?.message || e));
    return Response.json({success:false,error:String(e?.message || 'Logo staging failed')},{status:422});
  }
});
