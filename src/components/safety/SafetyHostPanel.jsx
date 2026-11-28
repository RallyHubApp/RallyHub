import React,{useState} from 'react';
import {HeartPulse,ClipboardList,TriangleAlert,BriefcaseMedical} from 'lucide-react';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
const tools=[['aid','First Aid',HeartPulse],['incident','Report Incident',ClipboardList],['hazard','Report Hazard',TriangleAlert],['kit','First Aid Kit',BriefcaseMedical]];
const stages=['Incident details','People involved','Actions taken','Outcome','Witnesses and supplies','Review'];
const empty=()=>({description:'',people:[],actions:'',outcome:'',witnesses:'',supplies:''});
export default function SafetyHostPanel({venueLabel='',sessionLabel=''}){
 const [mode,setMode]=useState(''),[step,setStep]=useState(0),[draft,setDraft]=useState(empty),[hazard,setHazard]=useState('');
 const change=(key,value)=>setDraft(d=>({...d,[key]:value}));
 const field=(key,label)=><label className="block text-sm font-medium">{label}<textarea className="mt-1 w-full rounded border bg-background p-2" value={draft[key]} onChange={e=>change(key,e.target.value)} maxLength={4000}/></label>;
 return <section aria-label="Club safety" data-testid="safety-host-panel" className="rounded-lg border bg-card p-2 my-2">
 <div className="flex flex-wrap gap-1">{tools.map(([key,label,Icon])=><button type="button" key={key} onClick={()=>setMode(key)} className="flex flex-1 min-w-[72px] items-center justify-center gap-1 rounded border px-2 py-2 text-xs font-semibold"><Icon size={16} aria-hidden="true"/>{label}</button>)}</div>
 <Dialog open={!!mode} onOpenChange={open=>{if(!open)setMode('')}}><DialogContent className="max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>{tools.find(t=>t[0]===mode)?.[1]||'Club safety'}</DialogTitle><DialogDescription>Development preview — fictional information only. Reports are not saved or submitted.</DialogDescription></DialogHeader>
 <div className="space-y-3 text-sm"><p>{sessionLabel||'Session'} · {venueLabel||'Venue details not verified'}</p>
 <div className="rounded border p-2"><strong>Emergency: call 112 or 999</strong><div className="flex gap-3 mt-2"><a href="tel:112" className="underline">Call 112</a><a href="tel:999" className="underline">Call 999</a></div><p>Do not delay emergency assistance to complete a report.</p></div>
 {mode==='aid'&&<><p>Follow the emergency call handler and qualified first aider. Clinical guidance is pending review.</p><p>First aider, AED location, Eircode and ambulance access: not yet verified.</p></>}
 {mode==='kit'&&<p>Kit location, stock and replenishment records are not yet connected.</p>}
 {mode==='hazard'&&<label className="block">Describe the hazard and immediate action<textarea className="w-full rounded border bg-background p-2" value={hazard} onChange={e=>setHazard(e.target.value)} maxLength={4000}/><span>Preview only — no hazard has been submitted.</span></label>}
 {mode==='incident'&&<><h3 className="font-bold">{step+1} of 6 · {stages[step]}</h3>
 {step===0&&field('description','Factual description of incident')}
 {step===1&&<><button type="button" className="border rounded p-2" onClick={()=>change('people',[...draft.people,{name:'',type:'member'}])}>Add person</button>{draft.people.map((p,i)=><div key={i} className="flex flex-wrap gap-2"><input aria-label={'Person '+(i+1)} className="border rounded bg-background p-2" value={p.name} onChange={e=>change('people',draft.people.map((x,j)=>j===i?{...x,name:e.target.value}:x))}/><select aria-label="Person type" value={p.type} onChange={e=>change('people',draft.people.map((x,j)=>j===i?{...x,type:e.target.value}:x))}><option value="member">Member</option><option value="guest">Guest</option><option value="other">Other</option></select><button type="button" onClick={()=>change('people',draft.people.filter((_,j)=>j!==i))}>Remove</button></div>)}</>}
 {step===2&&field('actions','Actions actually taken')}{step===3&&field('outcome','Observed outcome and handover')}{step===4&&<>{field('witnesses','Witnesses')}{field('supplies','Supplies used')}</>}{step===5&&<><dl>{Object.entries(draft).map(([k,v])=><React.Fragment key={k}><dt className="font-bold capitalize">{k}</dt><dd className="whitespace-pre-wrap">{Array.isArray(v)?v.map(p=>p.name+' ('+p.type+')').join(', '):v||'Not recorded'}</dd></React.Fragment>)}</dl><p role="status">Submission disabled until secure backend integration is tested.</p></>}
 <div className="flex justify-between"><button type="button" disabled={step===0} onClick={()=>setStep(s=>s-1)} className="border rounded p-2 disabled:opacity-40">Back</button>{step<5&&<button type="button" onClick={()=>setStep(s=>s+1)} className="border rounded p-2">Next</button>}<button type="button" onClick={()=>{setDraft(empty());setStep(0);setMode('')}} className="border rounded p-2">Discard draft</button></div></>}
 </div></DialogContent></Dialog></section>;
}
