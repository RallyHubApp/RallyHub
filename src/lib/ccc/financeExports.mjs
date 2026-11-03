/** Export only complete, server-authorised finance evidence; keep source systems distinct. */
const quote=v=>'"'+String(v??'').replaceAll('"','""').replace(/^[=+@\-\t\r]/,v=>'\''+v)+'"';
export function financeEvidenceCsv(data){
 if(!data?.complete||!Array.isArray(data.centres)||!Array.isArray(data.issues)||!data.readOnly)throw Error('Complete authoritative finance evidence required for export');
 const rows=[['Centre','Venue IDs','Legacy income EUR','Legacy costs EUR','Provider ledger net EUR','Unresolved payments','Provider settlement verified']];
 for(const c of data.centres){if(!c.centreId)throw Error('Centre identifier missing');rows.push([c.centreId,(c.venueIds||[]).join(';'),Number(c.legacyIncomeAmount||0).toFixed(2),Number(c.legacyCostAmount||0).toFixed(2),Number(c.providerNetAmount||0).toFixed(2),c.unresolvedPayments||0,'NO'])}
 rows.push([],['Reconciliation exceptions'],...data.issues.map(i=>[i]));
 rows.push([],['Refund reconciliation cases',data.refundReconciliation?.caseCount??'not available'],['Unmatched refund records',data.refundReconciliation?.orphanRefundCount??'not available'],['Settlement status','NOT VERIFIED'],['Accounting note','Legacy/manual finance and payment ledger are separate evidence; do not sum without reconciliation']);
 return '\ufeff'+rows.map(row=>row.map(quote).join(',')).join('\r\n');
}
