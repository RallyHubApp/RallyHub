import {test,expect} from '@playwright/test';
const app='6a01dc00702b7dd2a2978c28';
const fixture={id:'event-munster',name:'Munster Open 2027',event_slug:'munster-open-2027',start_date:'2027-02-13',end_date:'2027-02-14',event_start_time:'08:00',event_end_time:'17:00',event_category:'tournament',event_public_visible:true,event_publish_status:'published',host:{name:'Pickleball Ireland'}};
test('guided subscription: explicit opt-in, confirmation and live calendar link',async({page})=>{
 const calls=[];
 await page.route('**/api/apps/**',async route=>{
  const req=route.request(),path=new URL(req.url()).pathname;
  if(path.includes('/functions/')){const name=path.split('/functions/')[1]?.split('/')[0];let body={};try{body=req.postDataJSON()}catch{}calls.push({name,body});
   const data=name==='publicEvents'?{success:true,event:fixture,events:[fixture]}:name==='eventSubscriptions'?{success:true,pending:true}:name==='securityContext'?{success:true,context:null}:{success:true};
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
  }
  if(path.includes('/entities/User/me'))return route.fulfill({status:401,contentType:'application/json',body:'{}'});
  return route.fulfill({status:200,contentType:'application/json',body:'[]'});
 });
 await page.goto('/events/munster-open-2027');
 await page.getByRole('button',{name:'Add to calendar'}).click();
 await expect(page.getByRole('link',{name:/Subscribe to the live RallyHub Events calendar/})).toHaveAttribute('href',/eventsCalendarFeed/);
 const subscribe=page.getByRole('button',{name:'Get event updates'});
 await expect(subscribe).toBeDisabled();
 await page.getByRole('textbox',{name:'Email for event updates'}).fill('test@example.com');
 await expect(subscribe).toBeDisabled();
 await page.getByRole('checkbox',{name:'Consent to event emails'}).check();
 await subscribe.click();
 await expect(page.getByRole('status')).toContainText('Check your email');
 expect(calls.find(c=>c.name==='eventSubscriptions')?.body).toMatchObject({action:'subscribe',email:'test@example.com',consent:true,eventId:'event-munster'});
});
