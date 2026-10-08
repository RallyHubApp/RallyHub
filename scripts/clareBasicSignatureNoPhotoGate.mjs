import fs from 'node:fs';
const src=fs.readFileSync('base44/functions/kotcResultsShare/entry.ts','utf8');
const must=(ok,msg)=>{if(!ok){console.error('FAIL clareBasicSignatureNoPhotoGate:',msg);process.exit(1)}};
must(!src.includes('basic-signature-photo'),'basic signature photo must be removed');
must(!src.includes('/assets/brian-moore-profile.png'),'basic signature must not load Brian portrait');
must(src.includes('width="4" bgcolor="${escapeHtml(secondary)}"'),'simple Clare yellow accent bar missing');
must(src.includes('background:#f8fafc;border:1px solid #dbe5f1;border-radius:12px'),'simple signature card styling missing');
console.log('PASS clareBasicSignatureNoPhotoGate: basic signature is text-only and compact');
