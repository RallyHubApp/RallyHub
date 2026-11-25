import React,{useEffect,useMemo,useState} from 'react';
import {base44} from '@/api/base44Client';

const PURPOSE='club_membership_campaign';
const unique=rows=>[...new Map(rows.map(r=>[String(r.email||'').toLowerCase(),r]).filter(([email])=>email)).values()];
export default function MembershipCampaignComposer({template,brandKit,user}){
 const tenantId=user?.active_tenant_id,clubId=user?.active_club_id;
 const [audienceDirty,setAudienceDirty]=useState(false);
 const [roster,setRoster]=useState([]),[audiences,setAudiences]=useState([]),[selected,setSelected]=useState([]),[query,setQuery]=useState(''),[sort,setSort]=useState('name'),[audienceName,setAudienceName]=useState('Christmas Tournival 2026'),[audienceId,setAudienceId]=useState(''),[campaign,setCampaign]=useState(null),[preview,setPreview]=useState(''),[testTo,setTestTo]=useState(user?.email||''),[busy,setBusy]=useState(''),[notice,setNotice]=useState(''),[error,setError]=useState(''),[tracking,setTracking]=useState([]);
 const payload=(action,extra={})=>({action,ownerScope:'tenant',tenantId,clubId,purpose:PURPOSE,...extra});
 const invoke=async(action,extra={})=>{const r=await base44.functions.invoke('communicationsEngine',payload(action,extra));if(r.data?.error)throw Error(r.data.error);return r.data};
 const refresh=async()=>{setBusy('load');setError('');try{
   const [data,saved]=await Promise.all([invoke('member_campaign_roster'),base44.entities.ClubCampaignAudience.filter({tenant_id:tenantId,club_id:clubId,activity_id:'general_campaign'},'-updated_date',100)]);
   setRoster(unique(data.roster||[]));setAudiences(saved||[]);
 }catch(e){setError(e.message)}finally{setBusy('')}};
 useEffect(()=>{if(tenantId&&clubId)refresh()},[tenantId,clubId]);
 const visible=useMemo(()=>roster.filter(r=>(r.name+' '+r.email).toLowerCase().includes(query.toLowerCase())).sort((a,b)=>String(a[sort]||'').localeCompare(String(b[sort]||''),'en-IE')),[roster,query,sort]);
 const toggle=id=>{setSelected(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);setCampaign(null);setPreview('');setAudienceDirty(true)};
 const saveAudience=async()=>{if(!audienceName.trim()||!selected.length)return setError('Name the audience and select at least one member');setBusy('save');setError('');try{
   const data={tenant_id:tenantId,club_id:clubId,activity_id:'general_campaign',name:audienceName.trim(),recipient_ids_json:JSON.stringify(selected),recipient_count:selected.length,filters_json:JSON.stringify({source:'club_membership',membership_status:'paid_active'}),created_by_user_id:user.id,status:'saved'};
   let id=audienceId;
   if(id)await base44.entities.ClubCampaignAudience.update(id,data);
   else {const row=await base44.entities.ClubCampaignAudience.create(data);id=row.id}
   setAudienceId(id);setAudienceDirty(false);await refresh();setNotice('Audience saved. No emails sent.');
 }catch(e){setError(e.message)}finally{setBusy('')}};
 const openAudience=id=>{const a=audiences.find(x=>x.id===id);if(!a)return;const ids=JSON.parse(a.recipient_ids_json||'[]');setSelected(ids.filter(x=>roster.some(r=>r.id===x)));setAudienceId(id);setAudienceName(a.name);setCampaign(null);setPreview('');setAudienceDirty(false);setNotice('Saved audience reopened. Save after making changes.')};
 const saveCampaign=async()=>{if(!audienceId||!selected.length||audienceDirty)return setError('Save the current audience selection first');setBusy('campaign');setError('');try{
   const refs=roster.filter(r=>selected.includes(r.id)).map(r=>({source:'club_membership',id:r.id,email:r.email}));
   const data={tenant_id:tenantId,club_id:clubId,owner_scope:'tenant',source_module:'Membership',kind:'campaign',purpose:PURPOSE,name:audienceName,status:'draft',created_by_user_id:user.id,brand_kit_id:brandKit?.id,audience_definition:{source:'club_membership',audience_id:audienceId},audience_snapshot:{recipient_refs:refs},recipient_count:refs.length,metadata:{template_id:template.id}};
   let row;
   if(campaign?.id){await base44.entities.CommunicationCampaign.update(campaign.id,{...data,approved_at:null,approved_by_user_id:null});row={...data,id:campaign.id}}
   else row=await base44.entities.CommunicationCampaign.create(data);
   setCampaign(row);setPreview('');setNotice('Campaign saved as draft; preview and approve before sending.');
 }catch(e){setError(e.message)}finally{setBusy('')}};
 const showPreview=async()=>{if(!campaign?.id)return setError('Save campaign first');setBusy('preview');setError('');try{const r=await invoke('member_campaign_preview',{campaignId:campaign.id,templateId:template.id});setPreview(r.html);setNotice('Complete branded HTML preview ready.')}catch(e){setError(e.message)}finally{setBusy('')}};
 const test=async()=>{if(!preview||!roster.some(r=>selected.includes(r.id)))return setError('Preview a selected recipient first');if(!window.confirm('Send one test email to '+testTo+'?'))return;setBusy('test');setError('');try{const r=await invoke('member_campaign_test',{campaignId:campaign.id,templateId:template.id,previewRecipientId:selected[0],to:testTo,testNonce:crypto.randomUUID()});setNotice(JSON.stringify(r.results));}catch(e){setError(e.message)}finally{setBusy('')}};
 const approve=async()=>{if(!preview||!campaign?.id)return setError('Save and preview the campaign first');if(!window.confirm('Approve this campaign for '+selected.length+' selected members? This does not send emails.'))return;setBusy('approve');try{const approved_at=new Date().toISOString();await base44.entities.CommunicationCampaign.update(campaign.id,{approved_at,approved_by_user_id:user.id});setCampaign(c=>({...c,approved_at,approved_by_user_id:user.id}));setNotice('Approved. No emails sent.')}catch(e){setError(e.message)}finally{setBusy('')}};
 const refreshTracking=async()=>{if(!campaign?.id)return;try{const rows=await base44.entities.CommunicationDeliveryAttempt.filter({tenant_id:tenantId,campaign_id:campaign.id},'-created_date',200);if(rows.length===200)throw Error('Delivery ledger limit reached; cannot safely send');setTracking(rows);setNotice('Delivery ledger refreshed.')}catch(e){setError(e.message);throw e}};
 const send=async()=>{if(!campaign?.approved_at||!preview)return setError('Approve and preview first');if(!window.confirm('SEND the Christmas Tournival invitation to '+selected.length+' selected members?'))return;setBusy('send');setError('');let sent=0;try{
   await refreshTracking();
   const ids=roster.filter(r=>selected.includes(r.id)).map(r=>r.id);
   for(let i=0;i<ids.length;i+=5){const r=await invoke('member_campaign_send',{campaignId:campaign.id,templateId:template.id,recipientIds:ids.slice(i,i+5),confirmSend:true});sent+=(r.results||[]).filter(x=>x.status==='sent').length;setNotice(sent+' emails sent; '+Math.min(i+5,ids.length)+' recipients checked.');if(r.results?.some(x=>x.status==='needs_reconciliation'))throw Error('Uncertain provider result. Sending stopped.')}
   await refreshTracking();
 }catch(e){setError('Sending stopped after '+sent+' confirmed emails: '+e.message)}finally{setBusy('')}};
 return <section className="rounded-xl border bg-white p-5 space-y-4">
  <h2 className="text-lg font-bold">{template.name}</h2><p className="text-sm">Approved wording and registration links are preserved. Select Club Membership recipients; no event or waiting list is required.</p>
  <div className="flex flex-wrap gap-2"><input aria-label="Search members" placeholder="Search name or email" className="border rounded p-2 flex-1" value={query} onChange={e=>setQuery(e.target.value)}/><select aria-label="Sort members" className="border rounded p-2" value={sort} onChange={e=>setSort(e.target.value)}><option value="name">Name</option><option value="email">Email</option></select><button className="border rounded px-3" onClick={refresh}>Refresh members</button></div>
  <div className="flex flex-wrap gap-2 items-center"><button className="border rounded px-3 py-2" onClick={()=>{setSelected([...new Set([...selected,...visible.map(r=>r.id)])]);setCampaign(null);setPreview('');setAudienceDirty(true)}}>Select All (shown)</button><button className="border rounded px-3 py-2" onClick={()=>{setSelected([]);setCampaign(null);setPreview('');setAudienceDirty(true)}}>Deselect All</button><strong>{selected.length} selected / {roster.length} eligible members</strong></div>
  <div className="max-h-72 overflow-auto border rounded"><table className="w-full text-sm"><thead><tr><th className="p-2 text-left">Select</th><th className="p-2 text-left">Member</th><th className="p-2 text-left">Email</th></tr></thead><tbody>{visible.map(r=><tr key={r.id} className="border-t"><td className="p-2"><input type="checkbox" aria-label={'Select '+r.name} checked={selected.includes(r.id)} onChange={()=>toggle(r.id)}/></td><td className="p-2">{r.name}</td><td className="p-2">{r.email}</td></tr>)}</tbody></table></div>
  <div className="flex flex-wrap gap-2"><input aria-label="Audience name" className="border rounded p-2 flex-1" value={audienceName} onChange={e=>{setAudienceName(e.target.value);setAudienceDirty(true);setCampaign(null);setPreview('')}}/><button className="border rounded px-3" disabled={!!busy} onClick={saveAudience}>Save audience</button><select aria-label="Reopen saved audience" className="border rounded p-2" value={audienceId} onChange={e=>openAudience(e.target.value)}><option value="">Open saved audience…</option>{audiences.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
  <div className="flex flex-wrap gap-2"><button className="border rounded px-3 py-2" disabled={!!busy} onClick={saveCampaign}>Save campaign</button><button className="border rounded px-3 py-2" disabled={!!busy||!campaign} onClick={showPreview}>Full HTML preview</button><input className="border rounded p-2" aria-label="Test email address" value={testTo} onChange={e=>setTestTo(e.target.value)}/><button className="border rounded px-3" disabled={!!busy||!preview} onClick={test}>Send test</button><button className="border rounded px-3" disabled={!!busy||!preview} onClick={approve}>Approve campaign</button><button className="border rounded px-3" disabled={!!busy||!campaign?.approved_at} onClick={refreshTracking}>Track delivery</button><button className="rounded bg-blue-800 text-white px-3" disabled={!!busy||!campaign?.approved_at} onClick={send}>Send selected campaign</button></div>
  {busy&&<p role="status">Working: {busy}…</p>}{error&&<p role="alert" className="text-red-700">{error}</p>}{notice&&<p role="status">{notice}</p>}
  {preview&&<iframe title="Complete branded email preview" sandbox="" srcDoc={preview} className="w-full border rounded" style={{height:720}}/>}
  {tracking.length>0&&<p className="text-sm">Delivery attempts: {tracking.length} · Sent: {tracking.filter(x=>x.status==='sent').length} · Pending/uncertain: {tracking.filter(x=>x.status==='sending').length}</p>}
 </section>;
}
