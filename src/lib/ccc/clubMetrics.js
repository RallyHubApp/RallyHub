/** Derived club metrics; counts are scoped and unknown payment amounts are excluded. */
export function clubMetrics({tenantId,clubId,registrations=[],attendance=[],payments=[]}={}){
 const empty={registrations:0,attended:0,noShows:0,paidTransactions:0,paidAmount:0,unverifiedAmount:0};
 if(!tenantId||!clubId)return empty;
 const scoped=rows=>(Array.isArray(rows)?rows:[]).filter(r=>r?.tenant_id===tenantId&&r?.club_id===clubId);
 const bookings=scoped(registrations).filter(r=>r?.id);
 const ids=new Set(bookings.map(r=>r.id));
 const latest=new Map();
 for(const a of scoped(attendance)){if(!ids.has(a.booking_id))continue;const old=latest.get(a.booking_id);if(!old||(a.marked_at||'')>(old.marked_at||''))latest.set(a.booking_id,a);}
 const transactions=new Set();let paidTransactions=0,paidAmount=0,unverifiedAmount=0;
 for(const p of scoped(payments)){
  if(p.payment_status!=='paid'||!p.id)continue;
  const key=p.provider_transaction_id?(p.provider||'unknown')+':'+p.provider_transaction_id:'record:'+p.id;
  if(transactions.has(key))continue;transactions.add(key);paidTransactions++;
  if(Number.isFinite(p.amount)&&p.amount>=0)paidAmount+=p.amount;else unverifiedAmount++;
 }
 return {registrations:bookings.length,attended:[...latest.values()].filter(a=>a.status==='attended').length,noShows:[...latest.values()].filter(a=>a.status==='no_show').length,paidTransactions,paidAmount,unverifiedAmount};
}
