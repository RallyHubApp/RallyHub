import React from 'react';
import { Link } from 'react-router-dom';

/** Club Command Centre v2.1 overview. Uses existing authoritative count queries.
 * No new data access, permissions, booking decisions or payment side effects.
 */
export default function ClubCommandOverview({membershipApprovals=0,membershipPayments=0,guestApprovals=0,directoryApprovals=0,isPlatformAdmin=false}){
 const items=[
  {label:'Membership approvals',count:membershipApprovals,to:'/app/membership#membership-applications'},
  {label:'Membership follow-ups',count:membershipPayments,to:'/app/membership#membership-applications'},
  {label:'Guest booking approvals',count:guestApprovals,to:'/app/guest-bookings'},
  ...(isPlatformAdmin?[{label:'Directory approvals',count:directoryApprovals,to:'/app/admin?tab=directory&focus=pending-actions'}]:[])
 ];
 const total=items.reduce((sum,item)=>sum+Math.max(0,Number(item.count)||0),0);
 const sections=[
  {name:'People',description:'Membership, guests and approvals',links:[['Open People workspace','/app/club-command-centre?section=people'],['Membership','/app/membership'],['Guest bookings','/app/guest-bookings']]},
  {name:'Activities',description:'Events and club sessions',links:[['Open Activities workspace','/app/club-command-centre?section=activities'],['Events','/app/events'],['Guest sessions','/app/guest-bookings']]},
  {name:'Operations',description:'Attendance, venues and finance',links:[['Open Operations workspace','/app/club-command-centre?section=operations'],['Bookings and attendance','/app/guest-bookings'],['Finance','/app/finance']]},
  {name:'Management',description:'Communications and administration',links:[['Open Management workspace','/app/club-command-centre?section=management'],['Communications Centre','/app/communications'],['Administration','/app/admin']]}
 ];
 return <section aria-label="Club Command Centre action summary" className="rounded-2xl border bg-card p-4 sm:p-5">
  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
   <div><h2 className="text-lg font-bold">Club Command Centre</h2><p className="text-sm text-muted-foreground">Overview · People · Activities · Operations · Management</p><Link to="/app/club-command-centre" className="mt-1 inline-block text-sm font-semibold text-primary hover:underline">Open full Command Centre</Link></div>
   <span className="rounded-full border px-3 py-1 text-sm font-semibold" aria-label={`${total} items need attention`}>{total} actions</span>
  </div>
  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
   {items.map(item=><Link key={item.label} to={item.to} className="rounded-xl border p-3 hover:bg-muted/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
    <span className="block text-sm text-muted-foreground">{item.label}</span><span className="mt-1 block text-2xl font-bold tabular-nums">{Math.max(0,Number(item.count)||0)}</span>
   </Link>)}
  </div>
  <nav aria-label="Club Command Centre sections" className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
   {sections.map(section=><div key={section.name} className="rounded-xl border p-3">
    <h3 className="text-sm font-semibold">{section.name}</h3><p className="mt-1 text-xs text-muted-foreground">{section.description}</p>
    <div className="mt-3 flex flex-col gap-2">{section.links.map(([label,to])=><Link key={to} to={to} className="text-sm font-medium text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">{label}</Link>)}</div>
   </div>)}
  </nav>
  <p className="mt-3 text-xs text-muted-foreground">Counts come from existing club workflows. Links open the current authoritative modules; the unified Command Centre is still being integrated.</p>
 </section>;
}
