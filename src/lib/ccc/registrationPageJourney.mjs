/** Maintain complete loaded registration pages after a mutation, without implying provider settlement. */
export function mergeRegistrationPages(current=[],incoming=[]){
 const byId=new Map();for(const row of [...current,...incoming])if(row?.id)byId.set(String(row.id),row);return [...byId.values()];
}
export function updateRegistrationAttendance(rows=[],{id,attendance,revision}={}){
 if(!id||!['attended','no_show','excused','not_marked'].includes(attendance)||!Number.isSafeInteger(revision)||revision<0)return rows;
 return rows.map(row=>row.id===id?{...row,attendance,attendanceRevision:revision}:row);
}
export function registrationPageDecision({scope,requestScope,cursor,nextCursor,seenCursors=[]}={}){
 if(scope!==requestScope)return {allowed:false,reason:'scope_changed'};
 if(!cursor)return {allowed:false,reason:'cursor_missing'};
 if(nextCursor&&(nextCursor===cursor||seenCursors.includes(nextCursor)))return {allowed:false,reason:'cursor_cycle'};
 return {allowed:true,reason:null};
}
