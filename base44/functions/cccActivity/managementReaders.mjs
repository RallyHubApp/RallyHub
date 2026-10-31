/** Read-only, strictly scoped administrative inventory. No contact details or message bodies leave the service. */
export async function readScopedInventory(entity,query,{pageSize=200,maxPages=20}={}){
 if(!query?.tenant_id)throw Error('Tenant scope required');
 const rows=[],seen=new Set();let cursor,complete=false,pages=0;
 while(pages<maxPages){
  const opts={sort:'-created_date',limit:pageSize};if(cursor)opts.cursor=cursor;
  const page=await entity.filter(query,opts);
  if(!page||!Array.isArray(page.items))throw Error('Inventory pagination unavailable');
  for(const row of page.items){if(!row?.id)throw Error('Inventory row ID missing');if(!seen.has(row.id)){seen.add(row.id);rows.push(row)}}
  pages++;
  if(page.has_more!==true){complete=true;break}
  if(!page.next_cursor||page.next_cursor===cursor)throw Error('Inventory cursor stalled');
  cursor=page.next_cursor;
 }
 return {rows,complete};
}
const countBy=(rows,key)=>rows.reduce((counts,row)=>{const status=String(row[key]||'unspecified');counts[status]=(counts[status]||0)+1;return counts},{});
export function summarisePeopleInventory(access,applications){
 const accessRows=access.rows||[],applicationRows=applications.rows||[];
 return {access:{total:accessRows.length,statuses:countBy(accessRows,'status'),relationships:countBy(accessRows,'relationship_type'),linkedPeople:accessRows.filter(x=>!!x.person_id).length,unlinkedPeople:accessRows.filter(x=>!x.person_id).length,unlinkedReview:accessRows.filter(x=>x.status==='active'&&!x.person_id).slice(0,25).map(x=>({accessId:x.id,userId:x.user_id||'',status:x.status}))},applications:{total:applicationRows.length,statuses:countBy(applicationRows,'status'),linkedPeople:applicationRows.filter(x=>!!x.person_id).length,unlinkedPeople:applicationRows.filter(x=>!x.person_id).length},complete:access.complete&&applications.complete,identityLinksAreExplicit:true,includesPersonalDetails:false};
}
export function summariseManagementInventory(templates,hostConfigs){
 const safeTemplates=(templates.rows||[]).filter(t=>t.owner_scope==='tenant').map(t=>({id:t.id,name:String(t.name||'Unnamed template').slice(0,120),purpose:String(t.purpose||'').slice(0,80),status:t.status,version:String(t.version||'').slice(0,40),brandKitAssigned:!!t.brand_kit_id,approved:!!t.approved_at&&!!t.approved_by_user_id&&t.status==='approved'}));
 const hosts=(hostConfigs.rows||[]).map(c=>({id:c.id,venueId:c.venue_id||'',venueKey:String(c.venue_key||'').slice(0,100),active:c.active===true,configuredHosts:Array.isArray(c.host_emails)?c.host_emails.length:0,usesLegacyVenueKey:!c.venue_id}));
 return {templates:safeTemplates,hosts,templateCounts:countBy(safeTemplates,'status'),complete:templates.complete&&hostConfigs.complete,includesContactDetails:false,sendingEnabled:false};
}
