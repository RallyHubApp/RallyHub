import assert from "node:assert/strict";
import fs from "node:fs";

const shell=fs.readFileSync("public/email-templates/clare-pickleball-enriched/master-shell.html","utf8");
const manifest=JSON.parse(fs.readFileSync("public/email-templates/clare-pickleball-enriched/asset-manifest.json","utf8"));
const kotc=fs.readFileSync("base44/functions/kotcResultsShare/entry.ts","utf8");
const standard=fs.readFileSync("docs/email/CLARE_PICKLEBALL_ENRICHED_EMAIL_STANDARD.md","utf8");

for (const token of ["{{HEADER_TITLE}}","{{HEADER_SUBTITLE}}","{{BODY_HTML}}","{{CLARE_CLICKABLE_FOOTER_HTML}}"]) assert.ok(shell.includes(token),`Missing shell token ${token}`);
assert.ok(!/KING OF THE COURT|CLARE v GALWAY|Interclub Results/i.test(shell),"Tenant shell must not hard-code a communication purpose");
for (const key of ["clare-logo","header-right-art","footer-top","contact-phone","contact-email","contact-web","social-facebook","social-instagram","social-rallyhub","cta-results","cta-trophy","cta-document"]) assert.ok(manifest.assets[key],`Missing asset mapping ${key}`);
assert.match(kotc,/enrichedBrandedEmailBodies\([^\n]+headerTitle:string,headerSubtitle:string/);
assert.match(kotc,/escapeHtml\(headerTitle\|\|clubName\)/);
assert.match(kotc,/KOTC_BASIC_HEADER_TITLE,KOTC_BASIC_HEADER_SUBTITLE/);
assert.match(kotc,/function clareUtilityLinks\(/);
assert.match(kotc,/View My Results/);
assert.match(kotc,/width:450/);assert.match(kotc,/Open KOTC Player Summary/);assert.match(kotc,/Open the Shared KOTC Results/);assert.match(kotc,/Player Link Infographic/);
assert.match(kotc,/border-bottom:2px solid #f2cf33/);
assert.match(standard,/tenant-wide shell, not a KOTC template/i);
console.log("PASS clareEnrichedEmailShellGate: tenant shell dynamic, portable source present, manifest present, KOTC consumes dynamic header inputs");
