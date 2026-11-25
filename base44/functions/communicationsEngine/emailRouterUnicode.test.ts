import {gatewaySafeMessage} from './emailRouter.ts';
Deno.test('gateway supplementary Unicode is preserved as HTML entities and removed from plain headers',()=>{
 const result=gatewaySafeMessage({subject:"🎄 You're invited",textBody:'📅 Monday – €21\n🎅 Festive fun',htmlBody:'<p>📅 🕖 📍 🎅 €21</p><a href="https://rallyhub.ie/register">Register</a>'});
 if(result.subject!=="You're invited")throw Error(result.subject);
 if(result.textBody!=='Monday – €21\nFestive fun')throw Error(result.textBody);
 for(const c of ['📅','🕖','📍','🎅'])if(!result.htmlBody.includes('&#'+c.codePointAt(0)+';'))throw Error('Missing entity');
 if(!result.htmlBody.includes('https://rallyhub.ie/register')||!result.htmlBody.includes('€21'))throw Error('Content changed');
});
