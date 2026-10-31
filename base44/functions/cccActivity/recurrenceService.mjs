import {readScopedActivities} from './activityReader.mjs';
import {readScopedInventory} from './managementReaders.mjs';
import {reviewWeeklyRecurrence} from './recurrenceReview.mjs';
import {reviewDublinOccurrences} from './localTimeReview.mjs';
import {reviewLegacySessionOverlaps} from './legacySessionReview.mjs';
import {buildRecurrenceManifest} from './recurrenceManifest.mjs';
import {recurrenceDraftPayloads} from './recurrenceDrafts.mjs';
import {createRecurrenceDraftBatch} from './recurrenceBatch.mjs';
/** Isolated draft-only creation service; never opens registration or reserves courts. */
export async function createScopedRecurrenceDrafts(sdk,{source,tenantId,clubId,weeks,batchKey,userId,audit}){
 const entity=sdk.asServiceRole.entities.ClubActivity;
 if(!source||source.tenant_id!==tenantId||source.club_id!==clubId||source.status!=='draft'||source.linked_event_id||source.recurrence_batch_key)return {success:false,reason:'source_unavailable'};
 const venue=(await sdk.asServiceRole.entities.Venue.filter({id:source.venue_id,tenant_id:tenantId,club_id:clubId,status:'active'},'-created_date',1))?.[0];
 if(!venue)return {success:false,reason:'venue_unavailable'};
 if(source.court_id){
  const courts=await sdk.asServiceRole.entities.Court.filter({id:source.court_id,tenant_id:tenantId,club_id:clubId,venue_id:source.venue_id},'-created_date',1);
  if(!courts?.length||courts[0].status==='Maintenance')return {success:false,reason:'court_unavailable'};
 }
 const [schedule,legacy]=await Promise.all([
  readScopedActivities(entity,{tenantId,clubId}),
  readScopedInventory(sdk.asServiceRole.entities.GuestSessionLink,{tenant_id:tenantId,club_id:clubId},{pageSize:200,maxPages:20})
 ]);
 const ccc=reviewWeeklyRecurrence(source,schedule.activities,{weeks,complete:schedule.complete});
 const local=reviewDublinOccurrences(ccc.occurrences);
 const guest=reviewLegacySessionOverlaps(local.occurrences,legacy.rows,{tenantId,clubId,venueName:venue.name,complete:legacy.complete});
 const occurrences=local.occurrences.map((o,i)=>({...o,legacyOverlaps:guest.occurrences[i]?.legacyOverlaps||[],legacyUnmapped:guest.occurrences[i]?.legacyUnmapped||[]}));
 const manifest=buildRecurrenceManifest(source,occurrences,{tenantId,clubId,sourceRevision:source.revision,inventoryComplete:schedule.complete&&legacy.complete,ready:ccc.ready&&local.ready&&guest.ready});
 if(!manifest.valid)return {success:false,reason:'recurrence_blocked',issues:manifest.issues};
 const drafts=recurrenceDraftPayloads(source,manifest,{userId});
 return createRecurrenceDraftBatch(entity,{source,manifest,batchKey,userId,drafts,audit});
}
