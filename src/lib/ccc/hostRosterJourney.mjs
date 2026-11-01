/** Immutable host roster projection: preserve all loaded pages through check-in. */
export function mergeHostRosterPages(existing=[],incoming=[]){
 const byId=new Map();
 for(const row of [...existing,...incoming])if(row?.id)byId.set(String(row.id),row);
 return [...byId.values()];
}
export function applyHostCheckin(rows=[],{registrationId,attendance,revision}={}){
 if(!registrationId||!['attended','no_show','excused','not_marked'].includes(attendance)||!Number.isSafeInteger(revision)||revision<0)return rows;
 return rows.map(row=>row.id===registrationId?{...row,attendance,attendanceRevision:revision}:row);
}
export function summariseHostRoster(rows=[],{nextCursor=null,readError=false}={}){
 const confirmed=rows.filter(row=>['confirmed','cash_confirmed'].includes(row.bookingStatus));
 const counts={loaded:rows.length,eligible:confirmed.length,attended:0,noShow:0,excused:0,unmarked:0};
 for(const row of confirmed){if(row.attendance==='attended')counts.attended++;else if(row.attendance==='no_show')counts.noShow++;else if(row.attendance==='excused')counts.excused++;else counts.unmarked++}
 return {...counts,complete:!nextCursor&&!readError,needsReview:!!nextCursor||readError||counts.unmarked>0};
}
export function hostRosterPageDecision({scope,requestedScope,cursor,returnedCursor,seenCursors=[]}={}){
 if(scope!==requestedScope)return {accept:false,reason:'scope_changed'};
 if(!cursor)return {accept:false,reason:'cursor_missing'};
 if(returnedCursor&&[cursor,...seenCursors].includes(returnedCursor))return {accept:false,reason:'cursor_loop'};
 return {accept:true,reason:null};
}
