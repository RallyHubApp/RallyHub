// Server-only authoritative overrides for protected Directory contact routing.
// These values are never imported by frontend code.
export const STATIC_CONTACT_OVERRIDES:any = {
  'clare-pickleball': { listing_name_snapshot:'Clare Pickleball', contact_name:'Brian Moore', phone:'087 810 0333', email:'info@clarepickleball.ie', whatsapp_url:'https://wa.me/353878100333', allow_call:true, allow_whatsapp:true, allow_email:true },
  'oriel-pickleball-dundalk': { listing_name_snapshot:'Oriel Pickleball Dundalk', contact_name:'', phone:'', email:'orielpickleballdundalk@gmail.com', whatsapp_url:'', allow_call:false, allow_whatsapp:false, allow_email:true },
  'southside-pickleball-club': { listing_name_snapshot:'Southside Pickleball Club', contact_name:'', phone:'086 233 5075', email:'', whatsapp_url:'', allow_call:true, allow_whatsapp:false, allow_email:false },
  'carrickmacross-pickleball-club': { listing_name_snapshot:'Carrickmacross Pickleball Club', contact_name:'Amanda-Jane Gainford', phone:'', email:'carrickmacrosspickleballclub@gmail.com', whatsapp_url:'', allow_call:false, allow_whatsapp:false, allow_email:true },
  'bluestack-pickleball-club': { listing_name_snapshot:'Bluestack Pickleball Club', contact_name:'Michael McDaid', phone:'+353876776304', email:'mhmcdaid1@gmail.com', whatsapp_url:'https://wa.me/353876776304', allow_call:true, allow_whatsapp:true, allow_email:true },
  'killarney-pickleball-club': { listing_name_snapshot:'Killarney Pickleball Club', contact_name:'Michael Lyne', phone:'', email:'killarneypickleballclub@gmail.com', whatsapp_url:'', allow_call:false, allow_whatsapp:false, allow_email:true },
  'east-cavan-pickleball': { listing_name_snapshot:'East Cavan Pickleball Club', contact_name:'Mags Clarke', phone:'+353861932690', email:'eastcavanpickleball@gmail.com', whatsapp_url:'https://wa.me/353861932690', allow_call:true, allow_whatsapp:true, allow_email:true },
  'cobh-pickleball': { listing_name_snapshot:'Cobh Pickleball', contact_name:'Peter Hill', phone:'0857290448', email:'peter.hill.lfc@gmail.com', whatsapp_url:'', allow_call:true, allow_whatsapp:false, allow_email:true },
  'multyfarnham-pickleball-club': { listing_name_snapshot:'Multyfarnham Pickleball Club', contact_name:'', phone:'', email:'cassiemooney@hotmail.com', whatsapp_url:'', allow_call:false, allow_whatsapp:false, allow_email:true },
  'north-kildare-pickleball-club': { listing_name_snapshot:'North Kildare Pickleball Club', contact_name:'Vincent Maloney', phone:'087 698 6849', email:'northkildarepickleball@gmail.com', whatsapp_url:'https://wa.me/353876986849', allow_call:true, allow_whatsapp:true, allow_email:true },
  'pickleball-ireland': { listing_name_snapshot:'Pickleball Ireland', contact_name:'Pickleball Ireland', phone:'', email:'info@pickleballireland.ie', whatsapp_url:'', allow_call:false, allow_whatsapp:false, allow_email:true },
  'newbridge-pickleball-club': { listing_name_snapshot:'Newbridge Pickleball Club', contact_name:'treasurernewbridgepickleball', phone:'0831720297', email:'treasurernewbridgepickleball@gmail.com', whatsapp_url:'', allow_call:true, allow_whatsapp:false, allow_email:true },
  'galway-pickleball': { listing_name_snapshot:'Galway Pickleball', contact_name:'Teo Cuiche', phone:'085 162 8988', email:'galwaypickleball@gmail.com', whatsapp_url:'https://wa.me/353851628988', allow_call:true, allow_whatsapp:true, allow_email:true },
  'limerick-city-pickleball': { listing_name_snapshot:'Limerick City Pickleball', contact_name:'Mick Kelliher', phone:'087 240 0424', email:'mick.m.kelliher@gmail.com', whatsapp_url:'https://wa.me/353872400424', allow_call:true, allow_whatsapp:true, allow_email:true },
  'vamos-pickleball': { listing_name_snapshot:'VAMOS Pickleball', contact_name:'JP O Connell', phone:'0877717277', email:'johnpaulsport@gmail.com', whatsapp_url:'https://wa.me/353877717277', allow_call:true, allow_whatsapp:true, allow_email:true },
  'dalkey-pickkeball-club': { listing_name_snapshot:'Dalkey Pickleball Club', contact_name:'', phone:'', email:'', whatsapp_url:'', allow_call:false, allow_whatsapp:false, allow_email:false },
  'ballinamore-pickleball-club': { listing_name_snapshot:'Ballinamore Pickleball Club', contact_name:'maryccflanagan', phone:'+353876255402', email:'maryccflanagan@gmail.com', whatsapp_url:'', allow_call:true, allow_whatsapp:false, allow_email:true },
  'coillte-pickleball-club': { listing_name_snapshot:'Coillte Pickleball Club', contact_name:'Teresa Coleman', phone:'+353894841267', email:'teecoleman5858@gmail.com', whatsapp_url:'', allow_call:true, allow_whatsapp:false, allow_email:true },
  'newbridge-community-pickleball': { listing_name_snapshot:'NEWBRIDGE COMMUNITY PICKLEBALL', contact_name:'maria Mcquillan', phone:'0863596028', email:'mariamcq43@gmail.com', whatsapp_url:'', allow_call:true, allow_whatsapp:false, allow_email:true },
  'shankill-tennis-club': { listing_name_snapshot:'SHANKILL TENNIS CLUB', contact_name:'Liam Odonohoe', phone:'0862618931', email:'odonohoeliam@gmail.com', whatsapp_url:'', allow_call:true, allow_whatsapp:false, allow_email:true },
  'portmarnock-pickleball': { listing_name_snapshot:'Portmarnock Pickleball', contact_name:'racquetscoach', phone:'0870966682', email:'racquetscoach@gmail.com', whatsapp_url:'', allow_call:true, allow_whatsapp:false, allow_email:true }
};

export const PHONE_OPTOUT_SLUGS = new Set(['killarney-pickleball-club','carrickmacross-pickleball-club','multyfarnham-pickleball-club','stepaside-pickleball']);
export const NAME_OPTOUT_SLUGS = new Set(['west-cork-pickleball-club','southside-pickleball-club','multyfarnham-pickleball-club','stepaside-pickleball','kinvara-pickleball','galway-county-pickleball']);
export const STATIC_LEGACY_HOLD_SLUGS = new Set(['eyva-s-invitational-series']);

export function staticContactOverrideFor(listingSlug:string){
  const row=STATIC_CONTACT_OVERRIDES[String(listingSlug||'')];
  return row ? { ...row, listing_slug:String(listingSlug||''), status:'active' } : null;
}
