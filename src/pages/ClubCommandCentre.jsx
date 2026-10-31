import React from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {useAuth} from '@/lib/AuthContext';
import ClubActivityPlanner from '@/components/ccc/ClubActivityPlanner';
import ClubOperationsBoard from '@/components/ccc/ClubOperationsBoard';
import ClubHostWorkspace from '@/components/ccc/ClubHostWorkspace';

const sections=[
 {id:'people',name:'People',description:'Membership, guests, players and club access',links:[['Membership applications','/app/membership'],['Guest booking approvals','/app/guest-bookings'],['Players','/app/players'],['Waiting list','/app/waiting-list']]},
 {id:'activities',name:'Activities',description:'Plan and manage club sessions, clinics and events',links:[['Existing events','/app/events'],['Tournaments','/app/tournaments'],['Session bookings','/app/guest-bookings']]},
 {id:'operations',name:'Operations',description:'Host check-in, activity health and finance review',links:[['Guest attendance','/app/guest-bookings'],['Finance summary','/app/finance'],['Club analytics','/app/analytics']]},
 {id:'management',name:'Management',description:'Approved communications, administration and controls',links:[['Communications Centre','/app/communications'],['Administration','/app/admin'],['Learning resources','/app/learn/manage']]}
];
/** Native CCC workspace. Links preserve the existing authoritative workflows. */
export default function ClubCommandCentre(){
 const {user}=useAuth();
 const [params,setParams]=useSearchParams();
 const active=sections.some(s=>s.id===params.get('section'))?params.get('section'):'activities';
 const admin=user?.role==='admin';
 const clubAdmin=user?.active_club_role==='club_admin';
 const permitted=admin||clubAdmin;
 const tenantId=user?.active_tenant_id,clubId=user?.active_club_id;
 if(!permitted)return <main className="mx-auto max-w-5xl p-5"><h1 className="text-2xl font-bold">Club Command Centre</h1><p role="alert" className="mt-3">Club administrator access required.</p><Link to="/app" className="text-primary underline">Return to dashboard</Link></main>;
 return <main className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6" aria-label="Club Command Centre">
  <header className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold">Club Command Centre</h1><p className="text-sm text-muted-foreground">People · Activities · Operations · Management</p></div><Link to="/app" className="rounded-lg border px-3 py-2 text-sm">Back to dashboard</Link></header>
  {!tenantId||!clubId?<p role="alert" className="rounded-lg border p-3 text-sm">Select an active club to use the Command Centre.</p>:<>
   <nav aria-label="Command Centre workspaces" className="grid grid-cols-2 gap-2 md:grid-cols-4">{sections.map(section=><button key={section.id} type="button" aria-current={active===section.id?'page':undefined} onClick={()=>setParams({section:section.id})} className={'rounded-xl border p-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary '+(active===section.id?'bg-primary text-primary-foreground':'bg-card hover:bg-muted')}><span className="block font-semibold">{section.name}</span><span className="mt-1 block text-xs opacity-80">{section.description}</span></button>)}</nav>
   <section aria-label={sections.find(x=>x.id===active)?.name+' workspace'} className="space-y-4">
    <div className="rounded-xl border bg-card p-4"><h2 className="text-lg font-semibold">{sections.find(x=>x.id===active)?.name}</h2><p className="mt-1 text-sm text-muted-foreground">{sections.find(x=>x.id===active)?.description}</p><div className="mt-3 flex flex-wrap gap-2">{sections.find(x=>x.id===active)?.links.filter(([name,path])=>admin||!['/app/admin','/app/communications'].includes(path)).map(([name,path])=><Link key={path} to={path} className="rounded-lg border px-3 py-2 text-sm text-primary hover:bg-muted">{name}</Link>)}</div></div>
    {active==='activities'&&admin&&<ClubActivityPlanner tenantId={tenantId} clubId={clubId}/>}
    {active==='activities'&&!admin&&<p className="text-sm text-muted-foreground">Activity planning requires an authorised administrator. Existing event and booking tools remain available above.</p>}
    {active==='operations'&&<><ClubHostWorkspace tenantId={tenantId} clubId={clubId}/>{admin&&<ClubOperationsBoard tenantId={tenantId} clubId={clubId}/>}</>}
    {active==='management'&&<p className="rounded-lg border p-3 text-sm text-muted-foreground">Communication sending and production configuration remain controlled by their existing authorised modules. This workspace does not bypass approvals.</p>}
    {active==='people'&&<p className="rounded-lg border p-3 text-sm text-muted-foreground">Membership and person records remain independent unless explicitly linked. Use the authoritative membership and guest booking workflows above; no automatic contact-based merges are performed.</p>}
   </section>
  </>}
 </main>;
}
