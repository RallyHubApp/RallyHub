// Stable, shareable category landing paths. Do not reuse profile slugs for these reserved routes.
export const DIRECTORY_CATEGORY_PATHS = Object.freeze([
  {slug:'clubs', key:'club', title:'Pickleball Clubs & Places to Play', description:'Find pickleball clubs, venues and regular playing sessions across Ireland.'},
  {slug:'events', key:'tournaments_events', title:'Pickleball Tournaments & Event Organisers', description:'Discover pickleball tournament and event organisers across Ireland, with links to upcoming events.'},
  {slug:'coaching', key:'coaching', title:'Pickleball Coaches & Coaching', description:'Find pickleball coaches, coaching services and training opportunities across Ireland.'},
  {slug:'equipment', key:'equipment', title:'Pickleball Equipment & Suppliers', description:'Discover pickleball equipment suppliers, shops and services across Ireland.'},
  {slug:'holidays', key:'holidays', title:'Pickleball Holidays & Experiences', description:'Explore pickleball holidays, camps, trips and experiences.'},
  {slug:'other', key:'other', title:'Other Pickleball Services', description:'Find other pickleball services and organisations on the RallyHub Directory.'},
]);
export const directoryCategoryBySlug = slug => DIRECTORY_CATEGORY_PATHS.find(item=>item.slug===slug)||null;
export const directoryCategoryPath = key => key==='all'?'/directory':`/directory/${DIRECTORY_CATEGORY_PATHS.find(item=>item.key===key)?.slug||'other'}`;
