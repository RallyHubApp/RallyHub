/** Aggregates only pages actually fetched; never calls partial results complete. */
const counted=new Set(['confirmed','cash_confirmed']);
export function summariseLoadedRegistrations(rows=[],pages=[],{hasMore=false,initialFinanceComplete=false,initialFinance=null,extraReview=false}={}){
 const unique=new Map();
 for(const row of rows)if(row?.id&&!unique.has(row.id))unique.set(row.id,row);
 const registrations=[...unique.values()];
 const count=status=>registrations.filter(r=>r.status===status).length;
 const pageTotals=[initialFinance,...pages.map(p=>p?.finance)].filter(Boolean);
 const financeComplete=!hasMore&&initialFinanceComplete&&!extraReview&&pages.every(p=>p?.finance&&p.finance.complete===true);
 const cents=value=>Math.round(Number(value||0)*100);
 const money=field=>pageTotals.reduce((total,p)=>total+cents(p[field]),0)/100;
 return {summary:{total:registrations.length,confirmed:registrations.filter(r=>counted.has(r.status)).length,pending:count('pending_approval'),waitlisted:count('waitlisted'),cancelled:count('cancelled'),paymentHolds:count('approved_payment_hold'),attended:registrations.filter(r=>r.attendance==='attended').length,noShows:registrations.filter(r=>r.attendance==='no_show').length,unmarked:registrations.filter(r=>counted.has(r.status)&&(!r.attendance||r.attendance==='not_marked')).length,netCollected:money('net')},finance:{gross:money('gross'),refunded:money('refunded'),pending:money('pending'),net:money('net'),matchedPaymentRecords:pageTotals.reduce((n,p)=>n+Number(p.matchedPaymentRecords||0),0),excludedPaymentRecords:pageTotals.reduce((n,p)=>n+Number(p.excludedPaymentRecords||0),0),anomalies:pageTotals.flatMap(p=>p.anomalies||[]),complete:financeComplete,requiresReview:!financeComplete||pageTotals.some(p=>p.requiresReview||p.anomalies?.length)},complete:!hasMore&&financeComplete,loaded:registrations.length};
}
