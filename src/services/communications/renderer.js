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
    logo:kit.logos?.primary||"",
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
  };
}
export function renderEmail({brandKit,subjectTemplate,htmlTemplate,plainTextTemplate,data={}}){
  const brand=normaliseBrandKit(brandKit);
  const subject=mergeTemplate(subjectTemplate,data);
  const body=mergeTemplate(htmlTemplate,data);
  const text=mergeTemplate(plainTextTemplate,data);
  const missing=[...new Set([...subject.missing,...body.missing,...text.missing])];
  const html=`<!doctype html><html><body style="margin:0;background:#f5f6f8;font-family:${brand.font};font-size:${brand.bodySize}px;line-height:${brand.bodyLineHeight};color:${brand.text}"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:${brand.maxWidth}px;background:#fff"><tr><td style="background:${brand.primary};padding:20px;text-align:center">${brand.logo?`<img src="${brand.logo}" alt="${brand.name}" style="max-height:72px;max-width:220px">`:`<strong style="color:${brand.secondary};font-family:${brand.headingFont};font-size:${brand.h1Size}px;font-weight:${brand.h1Weight}">${brand.name}</strong>`}</td></tr><tr><td style="padding:28px;font-size:${brand.bodySize}px;line-height:${brand.bodyLineHeight}">${body.output}</td></tr>${brand.footer?`<tr><td style="padding:20px;color:${brand.muted};font-size:${brand.smallSize}px">${brand.footer}</td></tr>`:""}</table></td></tr></table></body></html>`;
  const plain=[text.output,brand.footerText].filter(Boolean).join("\n\n");
  return {subject:subject.output,html,plainText:plain,missing};
}
export function paritySignals({html,plainText}){
  const extract=(s)=>new Set((String(s||"").match(/(?:https?:\/\/[^\s<"]+|\b\d{1,2}:\d{2}\b|€\s?\d+(?:\.\d{1,2})?)/g)||[]).map(x=>x.replace(/[),.;]+$/,"")));
  const visibleHtml=String(html||"").replace(/<[^>]+>/g," ");
  const h=extract(visibleHtml),p=extract(plainText);
  return {htmlOnly:[...h].filter(x=>!p.has(x)),plainOnly:[...p].filter(x=>!h.has(x)),ok:[...h].every(x=>p.has(x))&&[...p].every(x=>h.has(x))};
}
