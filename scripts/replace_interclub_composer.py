
from pathlib import Path
p=Path("src/pages/CommunicationsCentre.jsx")
s=p.read_text()
start=s.index("function InterclubResultsComposer(")
end=s.index("function Composer(", start)
new='''function InterclubResultsComposer({selected,loadTemplate,events,eventId,setEventId,loadEvents,preview,content,setContent,previewEmail,testEmail,setTestEmail,sendTest,sendFinal,busy,error}){
 const set=(k,v)=>setContent(c=>({...c,[k]:v}));
 const PHOTO_URL="https://drive.google.com/drive/folders/1ynGB1ER2ipB2p_q0LB-c7DteAFxtVYXf?usp=sharing";
 const destinations=[
  ["{{PLAYER_ALERTS_URL}}","Personalised tournament alerts signup","Opens that player's prefilled RallyHub updates/signup page."],
  ["https://rallyhub.ie/directory","RallyHub Directory","Opens the public directory of clubs, venues and places to play."],
  ["https://rallyhub.ie/events","RallyHub Events","Opens upcoming RallyHub events."],
  ["https://rallyhub.ie/contact","Feedback / Contact","Opens the RallyHub feedback/contact page."],
  [PHOTO_URL,"Clare v Galway photo folder","Opens the shared Google Drive photo folder."]
 ];
 const known=v=>destinations.some(x=>x[0]===v);
 const destinationEditor=(urlKey,title)=>{
  const value=content[urlKey]||"";
  const selectedValue=known(value)?value:"__custom__";
  const meta=destinations.find(x=>x[0]===value);
  return <div className="space-y-1">
   <label className="text-xs font-bold">{title} destination</label>
   <select className="w-full border rounded-lg p-2 bg-white text-sm" value={selectedValue} onChange={e=>set(urlKey,e.target.value==="__custom__"?(known(value)?"":value):e.target.value)}>
    {destinations.map(([v,n])=><option key={v} value={v}>{n}</option>)}
    <option value="__custom__">Custom link…</option>
   </select>
   <p className="text-[10px] text-muted-foreground">{meta?.[2]||"Enter a full https:// address below."}</p>
   {selectedValue==="__custom__"&&<input className="w-full border rounded-lg p-2 text-xs" value={value} onChange={e=>set(urlKey,e.target.value)} placeholder="https://…"/>}
  </div>
 };
 return <div className="space-y-4">
  <div className="rounded-xl border bg-white p-5">
   <label className="block text-sm font-bold">Start from an approved template
    <select className="mt-2 w-full border rounded-lg p-2" value="interclub_results" onChange={e=>loadTemplate(e.target.value)}><option value="interclub_results">Interclub Results</option></select>
   </label>
   <div className="mt-3 text-sm rounded-lg bg-slate-50 p-3"><b>Using:</b> {selected?.name||"Interclub Results"} · approved-locked<div className="mt-1 text-emerald-800">Header, footer and visual layout are protected. The visible body wording and CTA destinations below are editable.</div></div>
  </div>
  <div className="rounded-xl border-2 border-blue-200 bg-blue-50/40 p-5 space-y-4">
   <div><h2 className="font-bold text-lg">Interclub Results</h2><p className="text-sm text-muted-foreground">Choose the completed fixture, edit what the recipient will actually read, preview the real HTML, test it, then send.</p></div>
   <div className="flex flex-col md:flex-row gap-2 md:items-end">
    <label className="flex-1 text-sm font-semibold">Completed fixture
     <select className="mt-1 w-full border rounded-lg p-2 bg-white" value={eventId} onChange={e=>setEventId(e.target.value)}><option value="">Choose fixture…</option>{events.map(e=><option key={e.id} value={e.id}>{e.club_a_name||"Team A"} v {e.club_b_name||"Team B"} · {e.status}</option>)}</select>
    </label>
    <button type="button" onClick={loadEvents} disabled={!!busy} className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold">{busy==="events"?"Loading…":"Refresh fixtures"}</button>
   </div>
   {error&&<div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

   <div className="rounded-xl border bg-white p-4 space-y-4">
    <div><h3 className="font-bold">Message introduction</h3><p className="text-xs text-muted-foreground mt-1">Use <b>{"{{FIRST_NAME}}"}</b> to keep the greeting personalised.</p></div>
    <label className="block text-sm font-semibold">Greeting<input className="mt-1 w-full border rounded-lg p-2" value={content.greeting||""} onChange={e=>set("greeting",e.target.value)}/></label>
    <label className="block text-sm font-semibold">Opening paragraph<textarea className="mt-1 w-full border rounded-lg p-2 min-h-24" value={content.intro1||""} onChange={e=>set("intro1",e.target.value)}/></label>
    <label className="block text-sm font-semibold">Results paragraph<textarea className="mt-1 w-full border rounded-lg p-2 min-h-20" value={content.intro2||""} onChange={e=>set("intro2",e.target.value)}/></label>
    <label className="block text-sm font-semibold">Results button label<input className="mt-1 w-full border rounded-lg p-2" value={content.resultsLabel||""} onChange={e=>set("resultsLabel",e.target.value)}/><span className="block mt-1 text-[10px] text-muted-foreground">Destination is always the recipient's private Interclub results page.</span></label>
   </div>

   <div className="rounded-xl border bg-white p-4 space-y-3">
    <h3 className="font-bold">Return fixture panel</h3>
    <label className="block text-sm font-semibold">Heading<input className="mt-1 w-full border rounded-lg p-2" value={content.returnHeading||""} onChange={e=>set("returnHeading",e.target.value)}/></label>
    <label className="block text-sm font-semibold">Text<textarea className="mt-1 w-full border rounded-lg p-2 min-h-24" value={content.returnText||""} onChange={e=>set("returnText",e.target.value)}/></label>
   </div>

   <div className="grid lg:grid-cols-2 gap-4">
    <div className="rounded-xl border bg-white p-4 space-y-3">
     <h3 className="font-bold">Photos panel</h3>
     <label className="block text-sm font-semibold">Heading<input className="mt-1 w-full border rounded-lg p-2" value={content.photosHeading||""} onChange={e=>set("photosHeading",e.target.value)}/></label>
     <label className="block text-sm font-semibold">Text<textarea className="mt-1 w-full border rounded-lg p-2 min-h-20" value={content.photosText||""} onChange={e=>set("photosText",e.target.value)}/></label>
     {destinationEditor("photosUrl","Photos")}
    </div>
    <div className="rounded-xl border bg-white p-4 space-y-3">
     <h3 className="font-bold">More pickleball panel</h3>
     <label className="block text-sm font-semibold">Heading<input className="mt-1 w-full border rounded-lg p-2" value={content.moreHeading||""} onChange={e=>set("moreHeading",e.target.value)}/></label>
     <label className="block text-sm font-semibold">Text<textarea className="mt-1 w-full border rounded-lg p-2 min-h-20" value={content.moreText||""} onChange={e=>set("moreText",e.target.value)}/></label>
     <div className="rounded-lg bg-slate-50 border p-3 space-y-2"><div className="text-xs font-black">Button 1</div><label className="block text-xs font-bold">Button label<input className="mt-1 w-full border rounded-lg p-2 bg-white text-sm" value={content.button1Label||""} onChange={e=>set("button1Label",e.target.value)}/></label>{destinationEditor("button1Url","Button 1")}</div>
     <div className="rounded-lg bg-slate-50 border p-3 space-y-2"><div className="text-xs font-black">Button 2</div><label className="block text-xs font-bold">Button label<input className="mt-1 w-full border rounded-lg p-2 bg-white text-sm" value={content.button2Label||""} onChange={e=>set("button2Label",e.target.value)}/></label>{destinationEditor("button2Url","Button 2")}</div>
     <div className="rounded-lg bg-slate-50 border p-3 space-y-2"><div className="text-xs font-black">Button 3</div><label className="block text-xs font-bold">Button label<input className="mt-1 w-full border rounded-lg p-2 bg-white text-sm" value={content.button3Label||""} onChange={e=>set("button3Label",e.target.value)}/></label>{destinationEditor("button3Url","Button 3")}</div>
    </div>
   </div>

   <div className="rounded-xl border bg-white p-4"><label className="block text-sm font-semibold">Closing paragraph<textarea className="mt-1 w-full border rounded-lg p-2 min-h-24" value={content.closingText||""} onChange={e=>set("closingText",e.target.value)}/></label></div>

   <div className="flex flex-wrap gap-2"><button type="button" onClick={()=>previewEmail()} disabled={!eventId||!!busy} className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold">{busy==="preview"?"Loading preview…":"Preview Interclub Results"}</button></div>
   {preview&&<div className="grid lg:grid-cols-[1fr_420px] gap-4">
    <div className="rounded-xl border bg-white p-4">
     <div className="grid md:grid-cols-3 gap-3 text-sm"><div className="rounded-lg bg-green-50 p-3"><b>{preview.recipientCount||0}</b><br/>email recipients ready</div><div className="rounded-lg bg-slate-50 p-3"><b>{preview.totalPlayers||0}</b><br/>participants in fixture</div><div className="rounded-lg bg-slate-50 p-3"><b>{preview.missing?.length||0}</b><br/>missing email</div></div>
     <div className="mt-4 grid md:grid-cols-[minmax(0,1fr)_auto_auto] gap-2 md:items-end"><label className="text-sm font-semibold">Test email address<input type="email" className="mt-1 w-full border rounded-lg p-2" value={testEmail} onChange={e=>setTestEmail(e.target.value)}/></label><button type="button" onClick={sendTest} disabled={!testEmail.trim()||!!busy} className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold">{busy==="test"?"Sending test…":"Send Test Email"}</button><button type="button" onClick={sendFinal} disabled={!!busy||!preview.recipientCount} className="rounded-lg bg-green-700 text-white px-4 py-2 text-sm font-semibold">{busy==="send"?"Sending to "+preview.recipientCount+"…":"Send to "+preview.recipientCount+" players"}</button></div>
     <p className="mt-2 text-[11px] text-muted-foreground">Preview sends nothing. Test sends one copy. Final Send asks for confirmation before delivery.</p>
    </div>
    <div className="rounded-xl border bg-slate-100 p-2"><iframe title="Interclub Results email preview" srcDoc={preview.previewHtml||""} className="w-full h-[760px] border-0 bg-white rounded" sandbox="allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"/></div>
   </div>}
  </div>
 </div>
}
'''
p.write_text(s[:start]+new+s[end:])
print("replaced InterclubResultsComposer")
