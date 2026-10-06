import { base44 } from '@/api/base44Client';

export const DIRECTORY_CATEGORY_FALLBACK = [
  { key:'club', label:'Club / place to play', pluralLabel:'Clubs & places to play', active:true, sortOrder:10, clubFirst:true, locationMode:'county', showPublicFilter:true, showListingForm:true, allowPlayerNotifications:true, commercialListing:false, entitlementMode:'free' },
  { key:'tournaments_events', label:'Tournament / event organiser', pluralLabel:'Tournaments & events', active:true, sortOrder:20, clubFirst:false, locationMode:'service_area', showPublicFilter:true, showListingForm:true, allowPlayerNotifications:true, commercialListing:false, entitlementMode:'free' },
  { key:'coaching', label:'Coach / coaching', pluralLabel:'Coaching', active:true, sortOrder:30, clubFirst:false, locationMode:'service_area', showPublicFilter:true, showListingForm:true, allowPlayerNotifications:true, commercialListing:false, entitlementMode:'free' },
  { key:'holidays', label:'Pickleball holiday', pluralLabel:'Pickleball holidays', active:true, sortOrder:40, clubFirst:false, locationMode:'service_area', showPublicFilter:true, showListingForm:true, allowPlayerNotifications:true, commercialListing:true, entitlementMode:'free' },
  { key:'equipment', label:'Equipment / supplier', pluralLabel:'Equipment & suppliers', active:true, sortOrder:50, clubFirst:false, locationMode:'none', showPublicFilter:true, showListingForm:true, allowPlayerNotifications:true, commercialListing:true, entitlementMode:'free' },
  { key:'other', label:'Other pickleball service', pluralLabel:'Other pickleball services', active:true, sortOrder:90, clubFirst:false, locationMode:'service_area', showPublicFilter:false, showListingForm:true, allowPlayerNotifications:false, commercialListing:true, entitlementMode:'free' },
];

export async function loadDirectoryCategories(){
  try{
    const res=await base44.functions.invoke('directoryCategory',{action:'public_list'});
    if(res.data?.error)throw new Error(res.data.error);
    const rows=Array.isArray(res.data?.categories)?res.data.categories:[];
    return rows.length?rows:DIRECTORY_CATEGORY_FALLBACK;
  }catch{
    return DIRECTORY_CATEGORY_FALLBACK;
  }
}

export const isClubCategory = category => category?.clubFirst === true || category?.locationMode === 'county' || category?.key === 'club';
