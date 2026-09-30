import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@base44/sdk';
import { directoryClubs } from '../src/data/directorySeed.js';

const APP_ID = '6a01dc00702b7dd2a2978c28';
const OUTPUT_DIR = path.resolve('docs/directory-branding');
const TODAY = '2026-09-30';
const base44 = createClient({ appId: APP_ID });

function esc(value = '') {
  return String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

async function checkLogoAsset(url) {
  if (!url) return { ok: false, sourceType: 'none', reason: 'missing' };
  if (url.startsWith('/')) {
    const filePath = path.resolve('public', url.replace(/^\//, ''));
    if (!fs.existsSync(filePath)) return { ok: false, sourceType: 'rallyhub-local', reason: 'missing-local-file' };
    return { ok: true, sourceType: 'rallyhub-local', bytes: fs.statSync(filePath).size };
  }
  const sourceType = /media\.base44\.com|base44\.app\/api\/apps\//.test(url) ? 'rallyhub-media' : 'external';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, { redirect: 'follow', signal: controller.signal, headers: { 'user-agent': 'RallyHubLogoAudit/1.0' } });
    if (!response.ok) return { ok: false, sourceType, reason: `http-${response.status}` };
    const body = await response.arrayBuffer();
    return { ok: true, sourceType, bytes: body.byteLength, contentType: response.headers.get('content-type') || '' };
  } catch (error) {
    return { ok: false, sourceType, reason: error?.name === 'AbortError' ? 'timeout' : String(error?.message || error) };
  } finally {
    clearTimeout(timer);
  }
}

const response = await base44.functions.invoke('directoryListingProfile', { action: 'public_list' });
const state = (response?.data ?? response)?.listings || {};

const staticClubs = directoryClubs.map(club => {
  const listingState = state[club.slug];
  const profile = listingState?.profile;
  if (!profile) return { ...club, verificationStatus: listingState?.verificationStatus || club.verificationStatus };
  return {
    ...club,
    ...profile,
    verificationStatus: listingState?.verificationStatus || club.verificationStatus,
    contact: { ...(club.contact || {}), ...(profile.contact || {}) },
    venues: Array.isArray(profile.venues) ? profile.venues : club.venues,
    sessions: Array.isArray(profile.sessions) ? profile.sessions : club.sessions,
  };
});

const staticSlugs = new Set(directoryClubs.map(club => club.slug));
const dynamicClubs = Object.entries(state)
  .filter(([slug, listingState]) => !staticSlugs.has(slug) && listingState?.base)
  .map(([slug, listingState]) => {
    const base = listingState.base || {};
    const profile = listingState.profile || {};
    return {
      ...base,
      ...profile,
      id: base.id || slug,
      slug,
      sport: base.sport || 'Pickleball',
      verificationStatus: listingState.verificationStatus || 'unclaimed',
      contact: { ...(base.contact || {}), ...(profile.contact || {}) },
      venues: Array.isArray(profile.venues) ? profile.venues : (base.venues || []),
      sessions: Array.isArray(profile.sessions) ? profile.sessions : (base.sessions || []),
    };
  });

const clubs = [...staticClubs, ...dynamicClubs]
  .filter(club => club.status !== 'archived')
  .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));

const rows = [];
for (const club of clubs) {
  const logoUrl = club.logoUrl || club.logo_url || '';
  const asset = await checkLogoAsset(logoUrl);
  const sourceLeads = [club.website && 'website', club.facebook && 'facebook', club.instagram && 'instagram'].filter(Boolean);
  let auditStatus = 'Missing · discovery required';
  let nextAction = 'Discover and verify official source';
  if (logoUrl && asset.ok) {
    auditStatus = asset.sourceType === 'external' ? 'Existing · external' : 'Existing · RallyHub-owned';
    nextAction = asset.sourceType === 'external' ? 'Copy approved logo into RallyHub-owned storage' : 'Retain; visual QA during rollout';
  } else if (logoUrl && !asset.ok) {
    auditStatus = 'Existing · broken/unreadable';
    nextAction = 'Repair or replace current logo asset';
  } else if (sourceLeads.length) {
    auditStatus = 'Missing · source lead';
    nextAction = 'Source and verify candidate from recorded official lead';
  }
  rows.push({
    slug: club.slug || '',
    name: club.name || '',
    county: club.county || '',
    verificationStatus: club.verificationStatus || 'unclaimed',
    logoUrl,
    auditStatus,
    sourceType: asset.sourceType,
    assetOk: asset.ok,
    bytes: asset.bytes || null,
    assetReason: asset.reason || null,
    sourceLeads,
    website: club.website || '',
    facebook: club.facebook || '',
    instagram: club.instagram || '',
    nextAction,
  });
}

const summary = {
  total: rows.length,
  existing: rows.filter(row => row.logoUrl).length,
  existingHealthy: rows.filter(row => row.logoUrl && row.assetOk).length,
  missing: rows.filter(row => !row.logoUrl).length,
  rallyhubOwned: rows.filter(row => row.assetOk && ['rallyhub-local', 'rallyhub-media'].includes(row.sourceType)).length,
  externalExisting: rows.filter(row => row.assetOk && row.sourceType === 'external').length,
  missingWithSourceLead: rows.filter(row => !row.logoUrl && row.sourceLeads.length).length,
  missingNoSourceLead: rows.filter(row => !row.logoUrl && !row.sourceLeads.length).length,
  brokenExisting: rows.filter(row => row.logoUrl && !row.assetOk).length,
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
const jsonPath = path.join(OUTPUT_DIR, `RALLYHUB_DIRECTORY_LOGO_AUDIT_${TODAY}.json`);
const mdPath = path.join(OUTPUT_DIR, `RALLYHUB_DIRECTORY_LOGO_AUDIT_${TODAY}.md`);
fs.writeFileSync(jsonPath, JSON.stringify({ generatedAt: TODAY, scope: 'read-only public Directory logo audit', summary, listings: rows }, null, 2));

let md = `# RallyHub Directory Logo Audit — 30 September 2026\n\n`;
md += `**Scope:** Read-only Step 1 audit of the full public Directory population. No logos or listing records were changed.\n\n`;
md += `## Summary\n\n`;
md += `- Public Directory listings audited: **${summary.total}**\n`;
md += `- Existing logos: **${summary.existing}**\n`;
md += `- Existing logo assets resolving successfully: **${summary.existingHealthy}/${summary.existing}**\n`;
md += `- Missing logos: **${summary.missing}**\n`;
md += `- Existing logos already RallyHub-owned/local: **${summary.rallyhubOwned}**\n`;
md += `- Existing externally served logos: **${summary.externalExisting}**\n`;
md += `- Missing logos with an existing official web/social lead recorded: **${summary.missingWithSourceLead}**\n`;
md += `- Missing logos requiring fresh discovery: **${summary.missingNoSourceLead}**\n`;
md += `- Broken existing logo assets: **${summary.brokenExisting}**\n\n`;
md += `The externally served existing logo should be copied into RallyHub-owned storage during migration rather than hot-linked permanently.\n\n`;
md += `## Full audit\n\n| Club | County | Directory status | Logo audit status | Existing source / sourcing lead | Next action |\n|---|---|---|---|---|---|\n`;
for (const row of rows) {
  const lead = row.logoUrl ? (row.sourceType === 'external' ? row.logoUrl : row.sourceType) : (row.sourceLeads.length ? row.sourceLeads.join(', ') : '—');
  md += `| ${esc(row.name)} | ${esc(row.county)} | ${esc(row.verificationStatus)} | ${esc(row.auditStatus)} | ${esc(lead)} | ${esc(row.nextAction)} |\n`;
}
md += `\n## Step 2 queue\n\n`;
md += `1. Process the **${summary.missingWithSourceLead} source-lead clubs first** because their official web/social references are already recorded.\n`;
md += `2. Then research the **${summary.missingNoSourceLead} discovery-required clubs** using official club websites/social profiles and existing RallyHub social-monitor findings.\n`;
md += `3. Do not overwrite the **${summary.existing} existing logos** unless the candidate is clearly superior or the current asset fails visual QA.\n`;
md += `4. Every candidate must carry source URL/type and confidence before approval/import.\n`;
md += `5. Approved files are copied into RallyHub-owned storage; no permanent Facebook/Instagram hot-links.\n`;
fs.writeFileSync(mdPath, md);

console.log(JSON.stringify({ summary, mdPath, jsonPath }, null, 2));
