import React, { useState } from 'react';
import ProtectedContactCard from './ProtectedContactCard';
const list = value => Array.isArray(value) ? value.join(' · ') : String(value || '');
const safeLink = value => { try { const u = new URL(value); return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : null; } catch { return null; } };
export function CoachPortrait({ coach, small = false }) {
 const [failed, setFailed] = useState(false);
 const url = safeLink(coach.photoUrl);
 return url && !failed ? <img src={url} onError={()=>setFailed(true)} alt={coach.name} className={small?'h-20 w-20 shrink-0 rounded-xl object-cover':'h-56 w-56 max-w-full rounded-2xl object-cover'} /> : <div role="img" aria-label="Photograph placeholder" className={small?'h-20 w-20 shrink-0 rounded-xl bg-muted flex items-center justify-center text-xs':'h-56 w-56 rounded-2xl bg-muted flex items-center justify-center'}>Photo pending</div>;
}
export default function CoachProfile({ coach, preview = false }) {
 return <article className="space-y-6" data-testid="coach-profile">
 {preview && <p className="rounded-xl bg-amber-400/15 p-3 font-bold text-amber-600">PREVIEW ONLY · NOT PUBLIC</p>}
 <div className="flex flex-col gap-6 sm:flex-row"><CoachPortrait key={coach.slug} coach={coach}/><div><p className="text-sm font-bold text-primary">Pickleball coach</p><h1 className="text-3xl font-black">{coach.name}</h1><p className="mt-2">{[coach.town,coach.county].filter(Boolean).join(', ')}</p><p className="mt-4 whitespace-pre-line leading-7">{coach.description || 'Biography requires reconciliation.'}</p></div></div>
 {[['Qualifications and accreditations',coach.qualifications],['Coaching experience',coach.coachingExperience],['Coaching services',coach.coachingServices],['Areas served',coach.areasServed]].map(([label,value])=><section key={label}><h2 className="font-bold">{label}</h2><p className="whitespace-pre-line text-muted-foreground">{list(value)||'Not yet supplied'}</p></section>)}
 <div className="flex flex-wrap gap-4">{['website','linkedin','facebook','instagram'].map(key=>safeLink(coach[key])&&<a className="text-primary underline" key={key} href={safeLink(coach[key])} target="_blank" rel="noreferrer">{key}</a>)}</div>
 {preview ? <section className="rounded-xl border p-5"><h2 className="font-bold">Contact Coach</h2><p className="mt-2 text-sm text-muted-foreground">Enquiries are captured privately by RallyHub. Forwarding depends on verified coach contact details.</p></section> : <ProtectedContactCard listingSlug={coach.slug} clubName={coach.name} county={coach.county} entityLabel="coach" />}
 </article>;
}
