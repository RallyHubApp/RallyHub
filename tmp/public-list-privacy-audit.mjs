const url='https://rallyhub.ie/api/apps/6a01dc00702b7dd2a2978c28/functions/directoryListingProfile';
const res=await fetch(url,{method:'POST',headers:{'content-type':'application/json','accept':'application/json','x-app-id':'6a01dc00702b7dd2a2978c28','base44-functions-version':'prod','x-base44-anonymous-id':'privacy-audit','x-origin-url':'https://rallyhub.ie/directory'},body:JSON.stringify({action:'public_list'})});
const data=await res.json();
const listings=data?.listings||{};
const failures=[]; const held=[];
for(const [slug,state] of Object.entries(listings)){
 const serial=JSON.stringify(state).toLowerCase();
 const protectedMode=state?.contactProtection==='protected-v1';
 const directLeak=/"(?:phone|phonehref|telephone|mobile|mobilenumber|email|emailaddress|whatsapp|whatsappurl|whatsapp_url|contactphone|contact_phone|contactemail|contact_email|publiccontactemail|public_contact_email)"\s*:/.test(serial) || serial.includes('tel:') || /wa\.me\/[0-9]/.test(serial);
 if(slug==='eyva-s-invitational-series') { held.push({slug,protectedMode,directLeak}); continue; }
 if(!protectedMode || directLeak) failures.push({slug,protectedMode,directLeak});
}
console.log(JSON.stringify({status:res.status,count:Object.keys(listings).length,failures,held},null,2));
