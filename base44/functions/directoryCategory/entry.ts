import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

const DEFAULTS = [
  { key:'club', label:'Club / place to play', plural_label:'Clubs & places to play', description:'Clubs, playing groups and regular places to play pickleball.', active:true, sort_order:10, club_first:true, location_mode:'county', show_public_filter:true, show_listing_form:true, allow_player_notifications:true, commercial_listing:false, entitlement_mode:'free' },
  { key:'tournaments_events', label:'Tournament / event organiser', plural_label:'Tournaments & events', description:'Tournament and event organisers and opportunities.', active:true, sort_order:20, club_first:false, location_mode:'service_area', show_public_filter:true, show_listing_form:true, allow_player_notifications:true, commercial_listing:false, entitlement_mode:'free' },
  { key:'coaching', label:'Coach / coaching', plural_label:'Coaching', description:'Pickleball coaches and coaching providers.', active:true, sort_order:30, club_first:false, location_mode:'service_area', show_public_filter:true, show_listing_form:true, allow_player_notifications:true, commercial_listing:false, entitlement_mode:'free' },
  { key:'holidays', label:'Pickleball holiday', plural_label:'Pickleball holidays', description:'Pickleball holidays, camps and travel experiences.', active:true, sort_order:40, club_first:false, location_mode:'service_area', show_public_filter:true, show_listing_form:true, allow_player_notifications:true, commercial_listing:true, entitlement_mode:'free' },
  { key:'equipment', label:'Equipment / supplier', plural_label:'Equipment & suppliers', description:'Equipment retailers, suppliers and related services.', active:true, sort_order:50, club_first:false, location_mode:'none', show_public_filter:true, show_listing_form:true, allow_player_notifications:true, commercial_listing:true, entitlement_mode:'free' },
  { key:'other', label:'Other pickleball service', plural_label:'Other pickleball services', description:'Other relevant pickleball services, subject to RallyHub review.', active:true, sort_order:90, club_first:false, location_mode:'service_area', show_public_filter:false, show_listing_form:true, allow_player_notifications:false, commercial_listing:true, entitlement_mode:'free' },
];

const clean=(v:any,max=180)=>String(v??'').trim().replace(/\s+/g,' ').slice(0,max);
const keyify=(v:any)=>clean(v,80).toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');
const safe=(r:any)=>({
  id:r.id||null,key:r.key,label:r.label,pluralLabel:r.plural_label||r.label,description:r.description||'',
  active:r.active!==false,sortOrder:Number(r.sort_order||100),clubFirst:r.club_first===true,
  locationMode:r.location_mode||'none',showPublicFilter:r.show_public_filter!==false,
  showListingForm:r.show_listing_form!==false,allowPlayerNotifications:r.allow_player_notifications!==false,
  commercialListing:r.commercial_listing===true,entitlementMode:r.entitlement_mode||'free'
});

async function rowsOrDefaults(base44:any){
  const rows=await base44.asServiceRole.entities.DirectoryCategory.list('sort_order',200);
  if(rows?.length)return rows.map(safe).sort((a:any,b:any)=>a.sortOrder-b.sortOrder||a.label.localeCompare(b.label));
  return DEFAULTS.map(safe);
}

Deno.serve(async(req)=>{
  try{
    const base44=createClientFromRequest(req);
    const body=await req.json().catch(()=>({}));
    const action=clean(body.action||'public_list',60);

    if(action==='public_list'){
      const rows=await rowsOrDefaults(base44);
      return Response.json({success:true,categories:rows.filter((x:any)=>x.active)});
    }

    const user=await base44.auth.me();
    if(user?.role!=='admin')return Response.json({error:'Admin access required'},{status:403});

    if(action==='admin_list'){
      return Response.json({success:true,categories:await rowsOrDefaults(base44),usingDefaults:(await base44.asServiceRole.entities.DirectoryCategory.list('sort_order',1)).length===0});
    }

    if(action==='admin_seed_defaults'){
      const existing=await base44.asServiceRole.entities.DirectoryCategory.list('sort_order',200);
      if(existing?.length)return Response.json({success:true,categories:existing.map(safe)});
      const now=new Date().toISOString();
      for(const row of DEFAULTS) await base44.asServiceRole.entities.DirectoryCategory.create({...row,created_at:now,updated_at:now});
      return Response.json({success:true,categories:await rowsOrDefaults(base44)});
    }

    if(action==='admin_save'){
      const label=clean(body.label,120);
      const key=keyify(body.key||label);
      if(!label||!key)return Response.json({error:'Category name is required.'},{status:400});
      const locationMode=['county','service_area','none'].includes(body.locationMode)?body.locationMode:'none';
      const entitlementMode=['free','future_paid'].includes(body.entitlementMode)?body.entitlementMode:'free';
      const now=new Date().toISOString();
      const data={
        key,label,plural_label:clean(body.pluralLabel||label,140),description:clean(body.description,400),
        active:body.active!==false,sort_order:Number.isFinite(Number(body.sortOrder))?Number(body.sortOrder):100,
        club_first:body.clubFirst===true,location_mode:locationMode,show_public_filter:body.showPublicFilter!==false,
        show_listing_form:body.showListingForm!==false,allow_player_notifications:body.allowPlayerNotifications!==false,
        commercial_listing:body.commercialListing===true,entitlement_mode:entitlementMode,updated_at:now
      };
      const rows=await base44.asServiceRole.entities.DirectoryCategory.filter({key},'sort_order',10);
      let saved;
      if(rows?.[0]) saved=await base44.asServiceRole.entities.DirectoryCategory.update(rows[0].id,data);
      else saved=await base44.asServiceRole.entities.DirectoryCategory.create({...data,created_at:now});
      return Response.json({success:true,category:safe(saved),categories:await rowsOrDefaults(base44)});
    }

    if(action==='admin_toggle'){
      const key=keyify(body.key);
      const rows=await base44.asServiceRole.entities.DirectoryCategory.filter({key},'sort_order',10);
      if(!rows?.[0])return Response.json({error:'Category not found. Seed or save it first.'},{status:404});
      await base44.asServiceRole.entities.DirectoryCategory.update(rows[0].id,{active:body.active===true,updated_at:new Date().toISOString()});
      return Response.json({success:true,categories:await rowsOrDefaults(base44)});
    }

    return Response.json({error:'Invalid directory category action.'},{status:400});
  }catch(e){
    console.error('directoryCategory failed',e?.message||e);
    return Response.json({error:e?.message||'Unable to load directory categories.'},{status:500});
  }
});