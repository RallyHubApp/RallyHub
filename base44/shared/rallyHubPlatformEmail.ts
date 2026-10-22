// Canonical RallyHub platform branding for backend email workflows.
import {emailSignatureBlockHtml,emailUtilityMenuHtml} from './rallyHubEmailBrandBlocks.ts';
const RALLYHUB_EMAIL_LOGO='https://rallyhub.ie/assets/brand/master-review/C3-primary-with-strapline.png';
const RALLYHUB_EMAIL_REVERSED_LOGO='https://rallyhub.ie/assets/brand/master-review/rallyhub-master-02-reversed.png';
const RALLYHUB_NAVY='#07184c';
const RALLYHUB_GREEN='#078e48';
const escapeHtml=(v:any)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'} as any)[c]);

function rallyHubEmailSignatureHtml() {
  return emailSignatureBlockHtml({
    contact:{signoff:'Yours in sport,',name:'Brian Moore',role:'Founder',organisation:'RallyHub',phone_whatsapp:'087 810 0333',phone_href:'tel:+353878100333',whatsapp_href:'https://wa.me/353878100333',email:'rallyhubapp@gmail.com',email_href:'mailto:rallyhubapp@gmail.com',website:'https://rallyhub.ie/',website_label:'rallyhub.ie'},
    primary:RALLYHUB_NAVY,
    secondary:RALLYHUB_GREEN,
    presentation:'platform-card',
  });
}

export const RALLYHUB_UTILITY_LINKS = [
  {key:'help',label:'Help Centre',url:'https://rallyhub.ie/directory/help'},
  {key:'contact',label:'Contact',url:'mailto:rallyhubapp@gmail.com'},
  {key:'directory',label:'Directory',url:'https://rallyhub.ie/directory'},
  {key:'website',label:'RallyHub',url:'https://rallyhub.ie/',accent:true},
  {key:'facebook',label:'Facebook',url:'https://www.facebook.com/rallyhubapp/'},
  {key:'instagram',label:'Instagram',url:'https://www.instagram.com/rallyhubapp/'},
];
function rallyHubEmailUtilityMenuHtml(selectedKeys:string[]|null=null) {
  const links=selectedKeys===null?RALLYHUB_UTILITY_LINKS:RALLYHUB_UTILITY_LINKS.filter(x=>selectedKeys.includes(x.key));
  return emailUtilityMenuHtml({
    primary:RALLYHUB_NAVY,
    secondary:RALLYHUB_GREEN,
    links,
    wrapLinks:true,
  });
}

export function rallyHubEmailShell({ title = '', preheader = '', content = '', actionUrl = '', actionLabel = '', footerNote = 'RallyHub Directory', utilityLinks = null }:any) {
  const button = actionUrl && actionLabel ? `
    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px auto 24px;"><tr>
      <td bgcolor="${RALLYHUB_GREEN}" style="border-radius:12px;">
        <a href="${escapeHtml(actionUrl)}" style="display:inline-block;padding:14px 24px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:800;letter-spacing:.01em;">${escapeHtml(actionLabel)}</a>
      </td>
    </tr></table>` : '';
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>@media only screen and (max-width:680px){.rh-email-shell{width:100%!important;max-width:100%!important;table-layout:fixed!important}.rh-email-body{padding-left:18px!important;padding-right:18px!important}body{overflow-wrap:anywhere}}</style></head><body style="margin:0;padding:0;background:#eef3f2;font-family:Arial,Helvetica,sans-serif;color:#172033;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader || title)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;table-layout:fixed;background:#eef3f2;padding:24px 10px;"><tr><td align="center">
      <table class="rh-email-shell" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:660px;background:#ffffff;border:1px solid #d8e3df;border-radius:20px;overflow:hidden;box-shadow:0 8px 28px rgba(7,24,76,.08);">
        <tr><td style="height:7px;background:${RALLYHUB_GREEN};"></td></tr>
        <tr><td style="padding:24px 24px 18px;background:#ffffff;">
          <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;"><tr><td style="vertical-align:middle;text-align:center;"><img src="${RALLYHUB_EMAIL_LOGO}" width="232" alt="RallyHub Play Connect Belong" style="display:block;width:232px;max-width:100%;height:auto;margin:0 auto;border:0;"></td></tr></table>
        </td></tr>
        <tr><td class="rh-email-body" style="padding:0 24px 28px;">
          <div style="height:1px;background:#e7eeec;margin:0 0 24px;"></div>
          ${title ? `<h1 style="margin:0 0 20px;font-size:24px;line-height:1.25;color:${RALLYHUB_NAVY};font-weight:850;">${escapeHtml(title)}</h1>` : ''}
          ${content}
          ${button}
          ${rallyHubEmailSignatureHtml()}
        </td></tr>
        <tr><td>${rallyHubEmailUtilityMenuHtml(utilityLinks)}</td></tr>
        <tr><td style="padding:16px 24px;background:${RALLYHUB_NAVY};text-align:center;">
          <a href="https://rallyhub.ie/" style="display:inline-block;text-decoration:none;margin:0 auto;"><img src="${RALLYHUB_EMAIL_REVERSED_LOGO}" alt="RallyHub" width="200" style="display:block;width:200px;max-width:100%;height:auto;border:0;"></a>
          <div style="width:200px;max-width:100%;margin:-9px auto 0;font-size:18px;line-height:1.2;letter-spacing:.25px;font-family:Arial,Helvetica,sans-serif;font-weight:900;color:#ffffff;text-align:center;white-space:nowrap;">${escapeHtml(footerNote)}</div>
        </td></tr>
      </table>
    </td></tr></table>
  </body></html>`;
}

