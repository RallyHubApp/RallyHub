import { renderBasicBrandedEmail } from './communicationsBasicRenderer.ts';
// Shared Communications Centre renderer for membership paid confirmations.
// Draft templates are deliberately excluded from automatic sending.
const escape=(v:any)=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
export async function membershipPaidTemplate(base44:any,config:any,club:any,app:any,legacy:{subject:string,textBody:string,htmlBody:string}){
  const tenantId=app.tenant_id||config.tenant_id;
  const clubId=app.club_id||config.club_id;
  const templates=await base44.asServiceRole.entities.CommunicationTemplate.filter({tenant_id:tenantId,purpose:'membership_paid_welcome'},'-updated_date',30);
  const approved=(templates||[]).find((t:any)=>t.status==='approved'&&(!t.club_id||t.club_id===clubId));
  if(!approved)throw new Error(`Approved membership_paid_welcome template missing for tenant ${tenantId}; refusing to send legacy paid-confirmation email`);
  const first=String(app.full_name||'').trim().split(/\s+/)[0]||'Member';
  const amount=Number(app.membership_fee||0);
  const currency=app.currency||config.currency||'EUR';
  const fee=new Intl.NumberFormat('en-IE',{style:'currency',currency}).format(amount);
  const fields:Record<string,string>={
    FIRST_NAME:first,FULL_NAME:String(app.full_name||''),CLUB_NAME:String(club.name||''),
    MEMBERSHIP_SEASON:String(app.membership_season||''),MEMBERSHIP_REFERENCE:String(app.confirmation_code||''),
    MEMBERSHIP_FEE:fee,PAYMENT_DATE:String(app.paid_at||'').slice(0,10),
    PAYMENT_STATUS:'Paid',MEMBERSHIP_STATUS:'Confirmed',
    HALL_CONTRIBUTION:String(config.hall_contribution||config.spond_hall_contribution||'€5.50'),
    APPROVED_SIGNATURE:[config.signatory_name,config.signatory_title].filter(Boolean).join(' · ')||String(club.name||'Club team')
  };
  const merge=(s:string,html=false)=>String(s||'').replace(/{{\s*([A-Za-z_]+)\s*}}/g,(_m,k)=>html?escape(fields[k]??''):fields[k]??'');
  if(!approved.subject_template||!approved.plain_text_template||!approved.html_template)throw new Error('Approved membership welcome template incomplete; refusing legacy fallback');
  const subject=merge(approved.subject_template||'');
  const textBody=merge(approved.plain_text_template||'');
  const rawHtml=approved.html_template?merge(approved.html_template.replace(/<p[^>]*>\s*{{APPROVED_SIGNATURE}}\s*<\/p>/gi,''),true):escape(textBody).replace(/\n/g,'<br>');
  // The saved template is body content only. Presentation is always sourced
  // from the active Communications Centre brand kit, never from ad-hoc colours.
  const kits=await base44.asServiceRole.entities.CommunicationBrandKit.filter({tenant_id:tenantId},'-updated_date',50);
  const brand=(kits||[]).find((k:any)=>k.id===approved.brand_kit_id&&k.status==='active'&&(!k.club_id||k.club_id===clubId));
  if(!brand)throw new Error('Approved membership email brand kit is missing or inactive');
  const content=rawHtml.replace(/<p[^>]*>\s*<strong>[^<]*<\/strong>\s*<\/p>\s*$/i,'');
  const htmlBody=renderBasicBrandedEmail(content,brand,club,String(club.name||'Clare Pickleball'),'Membership welcome');
  return {subject,textBody,htmlBody};
}
