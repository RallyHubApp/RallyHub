import {renderBasicBrandedEmail} from './communicationsBasicRenderer.ts';

export const TOURNIVAL_PURPOSES = new Set([
  'tournival_registration_received','tournival_payment_required',
  'tournival_payment_confirmed','tournival_waitlist_added',
  'tournival_waitlist_promoted','tournival_host_invite',
  'tournival_player_link','tournival_results','tournival_post_event_thanks',
  'tournival_refund_confirmed'
]);
const escape=(v:string)=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
export function renderApprovedTournivalTemplate({
  template,brand,club,channel,fields
}:{
  template:any;brand:any;club:any;channel:'email'|'whatsapp';fields:Record<string,string>
}){
  if(!TOURNIVAL_PURPOSES.has(String(template?.purpose)))throw Error('Unsupported Tournival purpose');
  if(template.status!=='approved')throw Error('Tournival template must be owner approved');
  if(brand?.status!=='active'||template.brand_kit_id!==brand.id)
    throw Error('Approved Tournival template requires its active tenant brand kit');
  if(template.tenant_id!==brand.tenant_id)throw Error('Tenant identity mismatch');
  if(channel!=='email'&&channel!=='whatsapp')throw Error('Invalid channel');
  const data:Record<string,string>={};
  for(const [key,value] of Object.entries(fields||{})){
    if(!/^[A-Z][A-Z0-9_]{0,59}$/.test(key)||typeof value!=='string'||value.length>2048)
      throw Error('Invalid message merge field');
    if(/(?:_URL|_LINK)$/.test(key)&&!/^https:\/\//i.test(value))
      throw Error('Only HTTPS action links are accepted');
    data[key]=value;
  }
  const required=new Set<string>();
  const interpolate=(input:string,html=false)=>String(input||'').replace(/{{\s*([A-Z][A-Z0-9_]*)\s*}}/g,(_m,key)=>{
    if(!Object.prototype.hasOwnProperty.call(data,key)){required.add(key);return '';}
    return html?escape(data[key]):data[key];
  });
  const subject=interpolate(template.subject_template||'');
  const emailHtml=interpolate(template.html_template||'',true);
  const plain=interpolate(template.plain_text_template||'');
  const whatsappTemplate=template.channel_templates?.whatsapp?.text_template;
  const whatsAppText=channel==='whatsapp'?interpolate(whatsappTemplate||''):'';
  if(required.size)throw Error('Missing approved template fields: '+[...required].join(', '));
  if(channel==='whatsapp'){
    if(!whatsappTemplate?.trim()||!whatsAppText.trim())
      throw Error('Approved WhatsApp text template missing; no fallback allowed');
    return {channel,purpose:template.purpose,text:whatsAppText,templateId:template.id,brandKitId:brand.id};
  }
  if(!subject.trim()||!plain.trim()||!emailHtml.trim())
    throw Error('Approved email template incomplete; no hard-coded fallback permitted');
  const header=template.channel_templates?.email?.header_title||template.name;
  const subtitle=template.channel_templates?.email?.header_subtitle||'';
  const html=renderBasicBrandedEmail(emailHtml,brand,club,club.name||brand.name||'',
    interpolate(header),interpolate(subtitle));
  return {channel,purpose:template.purpose,subject,text:plain,html,templateId:template.id,brandKitId:brand.id};
}

export async function resolveApprovedTournivalTemplate(base44:any,{
  tenantId,clubId,purpose,channel,fields
}:{
  tenantId:string;clubId:string;purpose:string;channel:'email'|'whatsapp';fields:Record<string,string>
}){
  if(!tenantId||!clubId||!TOURNIVAL_PURPOSES.has(purpose))
    throw Error('Tournival requires explicit tenant, club and approved purpose');
  const templates=await base44.asServiceRole.entities.CommunicationTemplate.filter({
    tenant_id:tenantId,purpose,status:'approved'
  },'-updated_date',40);
  const template=(templates||[]).find((t:any)=>t.owner_scope==='tenant'&&
    (!t.club_id||t.club_id===clubId));
  if(!template)throw Error('Approved Tournival Communications Centre template missing');
  const kits=await base44.asServiceRole.entities.CommunicationBrandKit.filter({
    tenant_id:tenantId,status:'active'
  },'-updated_date',40);
  const brand=(kits||[]).find((k:any)=>k.id===template.brand_kit_id&&
    k.owner_scope==='tenant'&&(!k.club_id||k.club_id===clubId));
  if(!brand)throw Error('Active Communications Centre tenant brand kit missing');
  const clubs=await base44.asServiceRole.entities.Club.filter({
    id:clubId,tenant_id:tenantId
  },'-updated_date',1);
  const club=clubs?.[0];
  if(!club)throw Error('Matching tenant club missing');
  return renderApprovedTournivalTemplate({template,brand,club,channel,fields});
}
