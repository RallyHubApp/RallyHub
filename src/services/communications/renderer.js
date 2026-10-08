const TOKEN=/{{\s*([\w.]+)\s*}}/g;

function get(obj,path){return path.split(".").reduce((v,k)=>v==null?undefined:v[k],obj)}
export function mergeTemplate(template,data={}){
  const missing=new Set();
  const output=String(template||"").replace(TOKEN,(_,key)=>{
    const v=get(data,key); if(v===undefined||v===null){missing.add(key);return ""} return String(v);
  });
  return {output,missing:[...missing]};
}
export function normaliseBrandKit(kit={}){
  return {
    name:kit.name||"RallyHub",
    logo:kit.channel_overrides?.email?.header_style==="rallyhub-light"?"https://rallyhub.ie/assets/rallyhub-logo-transparent.png":(kit.logos?.primary||""),
    primary:kit.colours?.primary||"#17324D",
    secondary:kit.colours?.secondary||"#FFFFFF",
    accent:kit.colours?.accent||"#2F855A",
    text:kit.colours?.text||"#17202A",
    muted:kit.colours?.muted_text||"#667085",
    font:kit.typography?.body_font||"Arial, Helvetica, sans-serif",
    headingFont:kit.typography?.heading_font||kit.typography?.body_font||"Arial, Helvetica, sans-serif",
    h1Size:Number(kit.typography?.h1_size_px||24),
    h1Weight:Number(kit.typography?.h1_weight||900),
    h2Size:Number(kit.typography?.h2_size_px||20),
    h2Weight:Number(kit.typography?.h2_weight||800),
    h3Size:Number(kit.typography?.h3_size_px||17),
    h3Weight:Number(kit.typography?.h3_weight||700),
    bodySize:Number(kit.typography?.body_size_px||16),
    bodyLineHeight:Number(kit.typography?.body_line_height||1.6),
    smallSize:Number(kit.typography?.small_size_px||13),
    maxWidth:Number(kit.layout?.email_max_width||640),
    footer:kit.compliance_footer?.html||"",
    footerText:kit.compliance_footer?.plain_text||"",
    poweredByHtml:kit.compliance_footer?.powered_by_html||"",
    poweredByPlain:kit.compliance_footer?.powered_by_plain||"",
    headerStyle:kit.channel_overrides?.email?.header_style||"",
    contact:kit.contact||null,
  };
}
export function renderEmail({brandKit,subjectTemplate,htmlTemplate,plainTextTemplate,data={}}){
  const brand=normaliseBrandKit(brandKit);
  const subject=mergeTemplate(subjectTemplate,data);
  const body=mergeTemplate(htmlTemplate,data);
  const text=mergeTemplate(plainTextTemplate,data);
  const missing=[...new Set([...subject.missing,...body.missing,...text.missing])];
  const isPlatformBasic=brand.headerStyle==="rallyhub-light";
  // Platform email must preserve the production-proven RallyHub shell.
  if(isPlatformBasic){
    const logo="https://media.base44.com/images/public/6a01dc00702b7dd2a2978c28/2041005ec_logo_fixed.png",navy="#07184c",green="#078e48";
    const signature=`<div style="margin-top:26px;padding-top:20px;border-top:1px solid #e2e8f0;"><p style="margin:0 0 7px;font-size:15px;line-height:1.5;color:#334155;">Yours in sport,</p><p style="margin:0;font-size:20px;font-weight:800;color:${navy};">Brian Moore</p><p style="margin:3px 0 0;font-size:13px;font-weight:700;color:${green};">Founder, RallyHub</p><p style="margin:8px 0 0;font-size:12px;line-height:1.8;color:#64748b;"><a href="tel:+353878100333" target="_blank" style="color:${navy};text-decoration:none;font-weight:700;">087 810 0333</a> · <a href="https://wa.me/353878100333" target="_blank" rel="noopener noreferrer" style="color:${green};text-decoration:none;font-weight:700;">WhatsApp</a><br><a href="mailto:rallyhubapp@gmail.com" target="_blank" style="color:${navy};text-decoration:none;">rallyhubapp@gmail.com</a> · <a href="https://rallyhub.ie/" target="_blank" rel="noopener noreferrer" style="color:${green};text-decoration:none;font-weight:700;">RallyHub.ie</a></p></div>`;
    const utility=`<div style="padding:14px 24px;border-top:1px solid #e7eeec;background:#ffffff;text-align:center;font-size:11px;line-height:1.7;color:#64748b;"><a href="https://rallyhub.ie/directory/help" target="_blank" rel="noopener noreferrer" style="color:${navy};font-weight:700;text-decoration:none;">Help Centre</a><span style="color:#cbd5e1;padding:0 7px;">·</span><a href="mailto:rallyhubapp@gmail.com" target="_blank" style="color:${navy};font-weight:700;text-decoration:none;">Contact</a><span style="color:#cbd5e1;padding:0 7px;">·</span><a href="https://rallyhub.ie/directory" target="_blank" rel="noopener noreferrer" style="color:${navy};font-weight:700;text-decoration:none;">Directory</a><span style="color:#cbd5e1;padding:0 7px;">·</span><a href="https://rallyhub.ie/" target="_blank" rel="noopener noreferrer" style="color:${green};font-weight:800;text-decoration:none;">RallyHub</a></div>`;
    const html=`<!doctype html><html><body style="margin:0;padding:0;background:#eef3f2;font-family:Arial,Helvetica,sans-serif;color:#172033;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef3f2;padding:24px 10px;"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:660px;background:#ffffff;border:1px solid #d8e3df;border-radius:20px;overflow:hidden;box-shadow:0 8px 28px rgba(7,24,76,.08);"><tr><td style="height:7px;background:${green};"></td></tr><tr><td style="padding:24px 24px 18px;background:#ffffff;"><table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;"><tr><td style="padding-right:12px;vertical-align:middle;"><a href="https://rallyhub.ie/" target="_blank" rel="noopener noreferrer" style="display:block;text-decoration:none;"><img src="${logo}" width="58" height="58" alt="RallyHub" style="display:block;width:58px;height:58px;object-fit:contain;border:0;"></a></td><td style="vertical-align:middle;text-align:left;"><div style="font-size:30px;line-height:1;font-weight:900;letter-spacing:-1.4px;color:${navy};">Rally<span style="color:${green};">Hub</span></div><div style="margin-top:7px;font-size:9px;line-height:1;font-weight:800;letter-spacing:2.3px;color:${navy};">PLAY <span style="color:${green};">•</span> CONNECT <span style="color:${green};">•</span> BELONG</div></td></tr></table></td></tr><tr><td style="padding:0 24px 28px;"><div style="height:1px;background:#e7eeec;margin:0 0 24px;"></div>${body.output}${signature}</td></tr><tr><td>${utility}</td></tr><tr><td style="padding:16px 24px;background:${navy};text-align:center;"><div style="font-size:11px;line-height:1.6;color:#dfe8ff;">RallyHub · <span style="color:#83d1a0;">Play • Connect • Belong</span></div><div style="margin-top:4px;font-size:10px;color:#aab8d6;"><a href="https://rallyhub.ie/" target="_blank" rel="noopener noreferrer" style="color:#aab8d6;text-decoration:none;">rallyhub.ie</a> · <a href="mailto:rallyhubapp@gmail.com" target="_blank" style="color:#aab8d6;text-decoration:none;">Email</a> · <a href="https://wa.me/353878100333" target="_blank" rel="noopener noreferrer" style="color:#83d1a0;text-decoration:none;">WhatsApp</a></div></td></tr></table></td></tr></table></body></html>`;
    return {subject:subject.output,html,plainText:[text.output,"Yours in sport,\nBrian Moore\nFounder, RallyHub\n087 810 0333 · rallyhubapp@gmail.com · RallyHub.ie"].filter(Boolean).join("\n\n"),missing};
  }
  const isTenantBasic=brand.headerStyle==="clare-light";
  const header=isTenantBasic?`<tr><td style="background:#ffffff;padding:22px 24px 14px;text-align:center">${brand.logo?`<img src="${brand.logo}" alt="Clare Pickleball" width="118" style="display:block;width:118px;max-width:100%;height:auto;margin:0 auto;border:0">`:""}</td></tr>`:`<tr><td style="background:${brand.primary};padding:20px;text-align:center">${brand.logo?`<img src="${brand.logo}" alt="${brand.name}" style="max-height:72px;max-width:220px">`:`<strong style="color:${brand.secondary};font-family:${brand.headingFont};font-size:${brand.h1Size}px;font-weight:${brand.h1Weight}">${brand.name}</strong>`}</td></tr>`;
  const tenantSignature=isTenantBasic&&brand.contact?`<tr><td style="padding:0 28px 20px"><div style="border-top:1px solid #dbe5f1;padding-top:18px;font-size:14px;line-height:1.6;color:${brand.text}">${brand.contact.signoff||"Yours in sport,"}<br><strong>${brand.contact.name||""}</strong><br>${brand.contact.role||""}${brand.contact.organisation?` · ${brand.contact.organisation}`:""}${brand.contact.phone_href?`<br><a href="${brand.contact.phone_href}" style="color:#0755a8;text-decoration:none">${brand.contact.phone_whatsapp||""}</a>`:""}${brand.contact.whatsapp_href?` · <a href="${brand.contact.whatsapp_href}" style="color:#078e48;text-decoration:none;font-weight:700">WhatsApp</a>`:""}${brand.contact.email_href?`<br><a href="${brand.contact.email_href}" style="color:#0755a8;text-decoration:none">${brand.contact.email||""}</a>`:""}${brand.contact.website?` · <a href="${brand.contact.website}" style="color:#0755a8;text-decoration:none">ClarePickleball.ie</a>`:""}</div></td></tr>`:"";
  const tenantPoweredFooter=brand.headerStyle!=="rallyhub-light"&&brand.poweredByHtml?`<tr><td style="padding:16px 20px;background:#f7f9fc;border-top:1px solid #e4e9f1">${brand.poweredByHtml}</td></tr>`:"";
  const shellStyle=isTenantBasic?`max-width:${brand.maxWidth}px;background:#fff;border:2px solid #0755a8;border-radius:14px;overflow:hidden`:`max-width:${brand.maxWidth}px;background:#fff`;
  const brandAccent=isTenantBasic?`<tr><td style="height:5px;background:#0755a8;border-bottom:3px solid #f2cf33;font-size:0;line-height:0">&nbsp;</td></tr>`:"";
  const html=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><style>@media only screen and (max-width:680px){.rh-outer{padding:10px!important}.rh-shell{width:100%!important;max-width:100%!important}.rh-body{padding:20px 18px 22px!important}.rh-footer{padding-left:18px!important;padding-right:18px!important}.rh-header{padding:18px 16px 14px!important}img{max-width:100%!important;height:auto!important}table{max-width:100%!important}}</style></head><body style="margin:0;padding:0;background:#f5f6f8;font-family:${brand.font};font-size:${brand.bodySize}px;line-height:${brand.bodyLineHeight};color:${brand.text};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse"><tr><td class="rh-outer" align="center" style="padding:24px 12px"><table class="rh-shell" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;${shellStyle}">${brandAccent}${header}<tr><td class="rh-body" style="padding:24px 28px 28px;font-size:${brand.bodySize}px;line-height:${brand.bodyLineHeight};word-break:break-word">${body.output}</td></tr>${tenantSignature}${brand.footer?`<tr><td class="rh-footer" style="padding:0 28px 22px;color:${brand.muted};font-size:${brand.smallSize}px;word-break:break-word">${brand.footer}</td></tr>`:""}${tenantPoweredFooter}</table></td></tr></table></body></html>`;
  const plain=[text.output,brand.footerText,brand.headerStyle!=="rallyhub-light"?brand.poweredByPlain:""].filter(Boolean).join("\n\n");
  return {subject:subject.output,html,plainText:plain,missing};
}
export function paritySignals({html,plainText}){
  const extract=(s)=>new Set((String(s||"").match(/(?:https?:\/\/[^\s<"]+|\b\d{1,2}:\d{2}\b|€\s?\d+(?:\.\d{1,2})?)/g)||[]).map(x=>x.replace(/[),.;]+$/,"")));
  const visibleHtml=String(html||"").replace(/<[^>]+>/g," ");
  const h=extract(visibleHtml),p=extract(plainText);
  return {htmlOnly:[...h].filter(x=>!p.has(x)),plainOnly:[...p].filter(x=>!h.has(x)),ok:[...h].every(x=>p.has(x))&&[...p].every(x=>h.has(x))};
}
