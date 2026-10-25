import {rallyHubEmailShell} from "../../../base44/shared/rallyHubPlatformEmail.ts";
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
    logo:kit.channel_overrides?.email?.header_style==="rallyhub-light"?"https://rallyhub.ie/assets/brand/master-review/C3-primary-with-strapline.png":(kit.logos?.primary||""),
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
    signatureBlock:kit.channel_overrides?.email?.signature_block||{},
    utilityFooter:kit.channel_overrides?.email?.utility_footer||{},
  };
}
/** @param {{brandKit:any,subjectTemplate:string,htmlTemplate:string,plainTextTemplate:string,data?:Record<string,any>}} args */
export function renderEmail({brandKit,subjectTemplate,htmlTemplate,plainTextTemplate,data={}}){
  const brand=normaliseBrandKit(brandKit);
  const subject=mergeTemplate(subjectTemplate,data);
  const body=mergeTemplate(htmlTemplate,data);
  const text=mergeTemplate(plainTextTemplate,data);
  const missing=[...new Set([...subject.missing,...body.missing,...text.missing])];
  const isPlatformBasic=brand.headerStyle==="rallyhub-light";
  // Platform email must preserve the production-proven RallyHub shell.
  if(isPlatformBasic){
    const utility=brand.utilityFooter||{};
    const links=utility.enabled_default===false?[]:Object.entries({help:utility.links?.help,contact:utility.links?.contact,directory:utility.links?.directory,website:utility.links?.website,facebook:utility.links?.facebook,instagram:utility.links?.instagram}).filter(([,enabled])=>enabled!==false).map(([key])=>key);
    const footerNote=String(data?.rallyhub_unit||data?.RALLYHUB_UNIT||'RallyHub Directory').trim();
    const html=rallyHubEmailShell({title:String(data?.email_title||''),content:body.output,footerNote,utilityLinks:links});
    return {subject:subject.output,html,plainText:[text.output,'Yours in sport,\nBrian Moore\nFounder, RallyHub\nPhone / WhatsApp: 087 810 0333\nrallyhubapp@gmail.com\nrallyhub.ie'].filter(Boolean).join('\n\n'),missing};
  }
  const isTenantBasic=brand.headerStyle==="clare-light";
  const header=isTenantBasic?`<tr><td style="background:#ffffff;padding:22px 24px 14px;text-align:center">${brand.logo?`<img src="${brand.logo}" alt="Clare Pickleball" width="118" style="display:block;width:118px;max-width:100%;height:auto;margin:0 auto;border:0">`:""}</td></tr>`:`<tr><td style="background:${brand.primary};padding:20px;text-align:center">${brand.logo?`<img src="${brand.logo}" alt="${brand.name}" style="max-height:72px;max-width:220px">`:`<strong style="color:${brand.secondary};font-family:${brand.headingFont};font-size:${brand.h1Size}px;font-weight:${brand.h1Weight}">${brand.name}</strong>`}</td></tr>`;
  const tenantSignature="";
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
