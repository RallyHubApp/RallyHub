/** Admin-only local CSV exports of already-loaded scoped registration data. No server writes. */
const BOM='\uFEFF';
const safe=value=>{
 const text=String(value??'').replace(/\r\n?/g,'\n');
 // Spreadsheet applications may interpret formula-looking values as executable cells.
 const escaped=/^[\s\u0000-\u001f]*[=+@\-]/.test(text)?"'"+text:text;
 return '"'+escaped.replaceAll('"','""')+'"';
};
const makeCsv=(headers,rows)=>BOM+[headers,...rows].map(row=>row.map(safe).join(',')).join('\r\n')+'\r\n';
const registrationColumns=['Registration ID','Name','Email','Mobile','Booking status','Payment status','Amount EUR','Refunded EUR','Attendance','Attendance revision','Created at'];
export function registrationRosterCsv(rows=[]){return makeCsv(registrationColumns,rows.map(r=>[r.id,r.name,r.email,r.mobile,r.status,r.paymentStatus,r.amount,r.refundedAmount,r.attendance,r.attendanceRevision,r.createdAt]));}
export function attendanceAuditCsv(rows=[]){return makeCsv(['Registration ID','Name','Email','Mobile','Booking status','Attendance outcome','Revision','Requires attendance review'],rows.filter(r=>['confirmed','cash_confirmed'].includes(r.status)).map(r=>[r.id,r.name,r.email,r.mobile,r.status,r.attendance||'not_marked',r.attendanceRevision,(r.attendance||'not_marked')==='not_marked'?'yes':'no']));}
export function exportReadiness(rows=[],{hasMore=false,initialPaymentReadComplete=false,extraReview=false}={}){
 const ids=new Set(),duplicateIds=[];
 for(const r of rows){if(!r?.id)continue;if(ids.has(r.id))duplicateIds.push(r.id);ids.add(r.id)}
 const warnings=[];
 if(hasMore)warnings.push('More registration pages remain; exports cover loaded records only');
 if(!initialPaymentReadComplete||extraReview)warnings.push('Payment data incomplete or discrepancies flagged; not a SumUp settlement report');
 if(duplicateIds.length)warnings.push('Duplicate registration IDs detected; investigate before relying on totals');
 return {loaded:rows.length,duplicateIds,warnings,complete:!hasMore&&!duplicateIds.length,settlementVerified:false};
}
export function safeExportFilename(eventId,kind){const clean=String(eventId||'event').replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,60)||'event';return `rallyhub-${clean}-${kind}.csv`}
