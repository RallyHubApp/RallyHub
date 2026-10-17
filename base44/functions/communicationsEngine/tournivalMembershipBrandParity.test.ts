import {strict as assert} from 'node:assert';
import {renderBasicBrandedEmail} from './communicationsBasicRenderer.ts';
import {renderApprovedTournivalTemplate} from './tournivalTemplates.ts';

const club={id:'club-test',name:'Clare Pickleball'};
const mark='https://rallyhub.ie/email-templates/clare-interclub/clare-logo-transparent.png';
const reverse='https://base44.app/api/apps/6a01dc00702b7dd2a2978c28/files/mp/public/6a01dc00702b7dd2a2978c28/85b0612d8_rallyhub-1fa08c810cc2f349fd52.png';
const powered='<div style="background:#053c56;text-align:center;padding:12px 12px 13px"><span style="color:white">Powered by</span><a href="https://rallyhub.ie/" target="_blank"><img src="'+reverse+'" alt="RallyHub" width="205" style="display:block;max-width:205px;width:100%;height:auto;border:0;margin:0 auto"></a></div>';
const kit={
 id:'brand',tenant_id:'tenant',status:'active',name:'Clare Pickleball Communications Brand',
 logos:{primary:mark},colours:{primary:'#0755a8',secondary:'#f2cf33'},
 compliance_footer:{powered_by_html:powered}
};
const template={id:'tpl',tenant_id:'tenant',status:'approved',brand_kit_id:'brand',
 purpose:'tournival_registration_received',name:'Registration',
 subject_template:'{{EVENT_NAME}} registration',
 html_template:'<p>Hello {{FIRST_NAME}}</p>',plain_text_template:'Hello {{FIRST_NAME}}'
};
Deno.test('Tournival and membership use the same Clare Pickleball logo and reverse linked RallyHub footer',()=>{
 const body='<p>Hello Brian</p>';
 const membership=renderBasicBrandedEmail(body,kit,club,club.name,'Membership welcome');
 const tournival=renderApprovedTournivalTemplate({
  template,brand:kit,club,channel:'email',fields:{FIRST_NAME:'Brian',EVENT_NAME:'UAT Tournament'}
 }).html||'';
 for(const html of [membership,tournival]){
  assert.ok(html.includes('src="'+mark+'"'),'Must preserve approved yellow Clare header logo');
  assert.ok(html.includes('src="'+reverse+'"'),'Must preserve approved reverse-colour footer logo');
  assert.ok(html.includes('<a href="https://rallyhub.ie/"'),'Footer logo must be clickable');
  assert.ok(html.includes('width="205"'),'Approved reverse-colour logo is 205px');
  assert.ok(html.includes('Powered by'),'Footer must carry Powered by text');
 }
 assert.equal(membership.match(/<img[^>]+alt="Clare Pickleball logo"[^>]+>/)?.[0],
  tournival.match(/<img[^>]+alt="Clare Pickleball logo"[^>]+>/)?.[0]);
 const footer=(html:string)=>html.slice(html.indexOf('background:#053c56'));
 assert.equal(footer(membership).split('</div></td></tr>')[0],
  footer(tournival).split('</div></td></tr>')[0]);
});
