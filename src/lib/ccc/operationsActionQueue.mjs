/** Actionable, read-only queue from the existing scoped operations summary. */
const policies={
 recurrence_batch_needs_recovery:{priority:1,owner:'Club admin',next:'Review recurring draft recovery before any new creation'},
 recurrence_batch_creation_unverified:{priority:1,owner:'Club admin',next:'Verify the incomplete recurring draft batch'},
 invalid_schedule:{priority:1,owner:'Event organiser',next:'Correct the activity start and end times'},
 event_link_not_verified:{priority:1,owner:'Club admin',next:'Recheck the event link before opening registrations'},
 recurrence_expected_count_invalid:{priority:2,owner:'Club admin',next:'Review expected recurrence count'},
 missing_event_link:{priority:2,owner:'Event organiser',next:'Link and verify an existing club event'},
 past_activity_not_closed:{priority:2,owner:'Event organiser',next:'Review attendance, finances and activity lifecycle'},
 unknown_activity_status:{priority:1,owner:'Club admin',next:'Investigate unrecognised activity state'}
};
export function buildOperationsActionQueue(alerts=[],{complete=false}={}){
 const rows=[],seen=new Set();
 for(const alert of alerts){if(!alert?.activityId||!alert?.code)continue;const key=alert.activityId+'|'+alert.code;if(seen.has(key))continue;seen.add(key);const policy=policies[alert.code]||{priority:2,owner:'Club admin',next:'Investigate this unrecognised issue'};rows.push({key,activityId:String(alert.activityId),activityTitle:String(alert.activityTitle||'Untitled activity'),code:alert.code,...policy})}
 rows.sort((a,b)=>a.priority-b.priority||a.activityTitle.localeCompare(b.activityTitle)||a.code.localeCompare(b.code));
 return {rows,total:rows.length,urgent:rows.filter(r=>r.priority===1).length,complete,mayBePartial:!complete,reviewOnly:true};
}
