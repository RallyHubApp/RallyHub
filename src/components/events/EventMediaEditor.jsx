import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, FileImage, Loader2, RotateCcw, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function EventMediaEditor({ value = '', position = null, cardPosition = null, onChange, listingSlug = '', eventName = '' }) {
  const inputRef = useRef(null);
  const cardCropRef = useRef(null);
  const cardDragRef = useRef(null);
  const [preview, setPreview] = useState(value);
  const [draggingCard, setDraggingCard] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [posterSourceUrl,setPosterSourceUrl]=useState('');
  const [eventPageUrl,setEventPageUrl]=useState('');
  const [verification,setVerification]=useState(null);
  const [x, setX] = useState(Number(position?.x ?? 50));
  const [y, setY] = useState(Number(position?.y ?? 50));
  const [zoom, setZoom] = useState(Number(position?.zoom ?? 1));
  const [cardX, setCardX] = useState(Number(cardPosition?.x ?? 50));
  const [cardY, setCardY] = useState(Number(cardPosition?.y ?? 50));
  const [cardZoom, setCardZoom] = useState(Number(cardPosition?.zoom ?? 1));

  useEffect(()=>setPreview(value),[value]);
  useEffect(()=>{setX(Number(position?.x??50));setY(Number(position?.y??50));setZoom(Number(position?.zoom??1))},[position?.x,position?.y,position?.zoom]);
  useEffect(()=>{setCardX(Number(cardPosition?.x??50));setCardY(Number(cardPosition?.y??50));setCardZoom(Number(cardPosition?.zoom??1))},[cardPosition?.x,cardPosition?.y,cardPosition?.zoom]);

  const emit = (url=preview, nx=x, ny=y, nz=zoom, ncx=cardX, ncy=cardY, ncz=cardZoom) => onChange?.({ url, x:nx, y:ny, zoom:nz, cardX:ncx, cardY:ncy, cardZoom:ncz });
  const handleFile = async file => {
    if (!file) return;
    const okImage = ['image/jpeg','image/png','image/webp'].includes(file.type);
    const okPdf = file.type === 'application/pdf';
    if (!okImage && !okPdf) return toast.error('Use JPG, PNG, WEBP or PDF');
    if (file.size > 20 * 1024 * 1024) return toast.error('File must be 20 MB or smaller');
    setUploading(true);
    try {
      const local = okImage ? URL.createObjectURL(file) : '';
      if (local) setPreview(local);
      const r = await base44.functions.invoke('secureCreditAction',{action:'upload_image',purpose:'event_poster',file,listingSlug,convert_pdf_preview:okPdf});
      if (r.data?.error) throw new Error(r.data.error);
      const url = r.data?.preview_url || r.data?.file_url;
      if (!url) throw new Error('Upload did not return a poster preview');
      setPreview(url); setX(50); setY(50); setZoom(1); setCardX(50); setCardY(50); setCardZoom(1);
      onChange?.({url,x:50,y:50,zoom:1,cardX:50,cardY:50,cardZoom:1,originalUrl:r.data?.file_url||url,sourceType:okPdf?'pdf':'image'});
      toast.success('Poster uploaded — now check the event-card crop');
    } catch(e) { setPreview(value); toast.error(e.message || 'Poster upload failed'); }
    finally { setUploading(false); }
  };
  const verifyFromEventPage=async()=>{
    if(!eventPageUrl.trim()||!eventName.trim())return toast.error('Enter an event name and webpage URL');
    setUploading(true);setVerification(null);
    try{
      const discovered=(await base44.functions.invoke('eventPosterDiscover',{eventUrl:eventPageUrl.trim(),eventName:eventName.trim(),listingSlug})).data||{};
      if(!discovered.selected?.imageUrl)throw new Error(discovered.error||'No matching poster found');
      setPosterSourceUrl(discovered.selected.imageUrl);
      if(discovered.reviewRequired){setVerification({passed:false,message:'Poster match needs review; nothing imported.'});return toast.warning('Poster match needs review before import');}
      const imported=(await base44.functions.invoke('eventPosterIngest',{sourceUrl:discovered.selected.imageUrl,listingSlug})).data||{};
      if(!imported.success||!imported.sha256||!imported.originalUrl)throw new Error(imported.error||'Storage verification failed');
      setVerification({passed:true,message:`Storage verified: ${imported.width} × ${imported.height}, SHA-256 ${imported.sha256}`});
      // Do not modify the event or publish artwork during a verification test.
      toast.success('Live poster discovery and storage read-back verified. Existing event artwork unchanged.');
    }catch(e){setVerification({passed:false,message:e?.message||'Verification failed'});toast.error(e?.message||'Live poster verification failed')}
    finally{setUploading(false)}
  };
  const discoverPoster=async()=>{
    if(!eventPageUrl.trim()||!eventName.trim())return toast.error('Enter an event name and webpage URL');
    setUploading(true);
    try{
      const response=await base44.functions.invoke('eventPosterDiscover',{eventUrl:eventPageUrl.trim(),eventName:eventName.trim(),listingSlug});
      const result=response.data||{};
      if(!result.selected?.imageUrl)throw new Error(result.error||'No matching poster found');
      setPosterSourceUrl(result.selected.imageUrl);
      if(result.reviewRequired)toast.warning('Possible poster found. Review before importing.');
      else toast.success('Matching original poster found. Select Import original automatically to verify and save it.');
    }catch(e){toast.error(e?.message||'Poster discovery failed')}finally{setUploading(false)}
  };
  const importSource=async()=>{
    if(!posterSourceUrl.trim())return;
    setUploading(true);
    try{
      const response=await base44.functions.invoke('eventPosterIngest',{sourceUrl:posterSourceUrl.trim(),listingSlug});
      const result=response.data||{};
      if(!result.success)throw new Error(result.error||'Poster needs manual review');
      setPreview(result.originalUrl);setX(50);setY(50);setZoom(1);setCardX(50);setCardY(50);setCardZoom(1);
      onChange?.({url:result.originalUrl,x:50,y:50,zoom:1,cardX:50,cardY:50,cardZoom:1,originalUrl:result.originalUrl,sourceType:'verified-source'});
      toast.success(`Original poster verified (${result.width} × ${result.height})`);
    }catch(e){toast.error(e?.message||'Automatic poster import failed')}finally{setUploading(false)}
  };
  const reset=()=>{setX(50);setY(50);setZoom(1);setCardX(50);setCardY(50);setCardZoom(1);emit(preview,50,50,1,50,50,1)};
  const remove=()=>{setPreview('');setX(50);setY(50);setZoom(1);setCardX(50);setCardY(50);setCardZoom(1);onChange?.({url:'',x:50,y:50,zoom:1,cardX:50,cardY:50,cardZoom:1,originalUrl:'',sourceType:''})};
  const clamp=value=>Math.max(0,Math.min(100,value));
  const startCardDrag=e=>{
    if(!preview)return;
    const rect=cardCropRef.current?.getBoundingClientRect();
    if(!rect?.width||!rect?.height)return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    cardDragRef.current={pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,cardX,cardY,width:rect.width,height:rect.height};
    setDraggingCard(true);
  };
  const moveCardDrag=e=>{
    const drag=cardDragRef.current;
    if(!drag||drag.pointerId!==e.pointerId)return;
    e.preventDefault();
    const nextX=clamp(drag.cardX-((e.clientX-drag.startX)/drag.width)*100);
    const nextY=clamp(drag.cardY-((e.clientY-drag.startY)/drag.height)*100);
    setCardX(nextX);setCardY(nextY);
    onChange?.({url:preview,x,y,zoom,cardX:nextX,cardY:nextY,cardZoom});
  };
  const endCardDrag=e=>{
    const drag=cardDragRef.current;
    if(!drag||drag.pointerId!==e.pointerId)return;
    cardDragRef.current=null;
    setDraggingCard(false);
    try{e.currentTarget.releasePointerCapture?.(e.pointerId)}catch{}
  };

  return <div className="rounded-xl border p-4 space-y-5">
    <div><p className="text-sm font-bold">Event poster / artwork</p><p className="mt-1 text-xs text-muted-foreground">Upload once. RallyHub keeps the full poster and lets you make a separate wide crop for public event cards. JPG, PNG, WEBP or PDF · up to 20 MB.</p></div>
    <div id="event-poster-verification" className="scroll-mt-24 rounded-lg border border-primary/30 p-3 space-y-2"><p className="text-sm font-bold">Verify poster from event webpage</p><p className="text-xs text-muted-foreground">Enter the event name in Step 1, then paste the organiser's event webpage below. Select Run live poster verification to test discovery and storage without changing the event.</p>
    <div className="flex flex-col gap-2 sm:flex-row"><input id="event-poster-webpage-url" aria-label="Event webpage URL" type="url" value={eventPageUrl} onChange={e=>setEventPageUrl(e.target.value)} placeholder="Paste event webpage URL to find its poster" className="min-w-0 flex-1 rounded-md border px-3 py-2 text-sm"/><button type="button" disabled={uploading||!eventPageUrl.trim()||!eventName.trim()} onClick={discoverPoster} className="rounded-md border px-4 py-2 text-sm font-semibold disabled:opacity-50">Find event poster</button></div>
    <div className="flex flex-wrap items-center gap-3"><button type="button" disabled={uploading||!eventPageUrl.trim()||!eventName.trim()} onClick={verifyFromEventPage} className="rounded-md border border-primary px-4 py-2 text-sm font-semibold disabled:opacity-50">Run live poster verification</button><span className="text-xs text-muted-foreground">Checks discovery, real upload and SHA-256 read-back without changing the event.</span></div>
    </div>
    {verification&&<p role="status" className={`break-all text-xs ${verification.passed?'text-green-700':'text-red-700'}`}>{verification.passed?'PASS: ':'NOT VERIFIED: '}{verification.message}</p>}
    <div className="flex flex-col gap-2 sm:flex-row"><input aria-label="Original poster URL" type="url" value={posterSourceUrl} onChange={e=>setPosterSourceUrl(e.target.value)} placeholder="Paste an original poster image URL" className="min-w-0 flex-1 rounded-md border px-3 py-2 text-sm"/><button type="button" disabled={uploading||!posterSourceUrl.trim()} onClick={importSource} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">Import original automatically</button></div><p className="text-xs text-muted-foreground">Approved source domains only. RallyHub checks dimensions and verifies stored image bytes. Unverified images require manual review.</p>
    <div className="grid gap-5 lg:grid-cols-[minmax(0,.75fr)_minmax(0,1.25fr)]">
      <div><div className="mb-2 flex items-center justify-between"><p className="text-xs font-bold">Full artwork</p><span className="text-[10px] text-muted-foreground">Event detail page</span></div><div className="relative mx-auto flex min-h-[260px] w-full max-w-[420px] items-center justify-center overflow-hidden rounded-xl border bg-secondary/30">
        {preview ? <img src={preview} alt="Event poster preview" className="block max-h-[480px] w-full object-contain" style={{objectPosition:`${x}% ${y}%`,transform:`scale(${zoom})`,transformOrigin:`${x}% ${y}%`}}/> : <div className="flex min-h-[360px] w-full flex-col items-center justify-center text-muted-foreground"><FileImage className="h-8 w-8"/><span className="mt-2 text-xs">Poster / artwork preview</span></div>}
        {uploading&&<div className="absolute inset-0 flex items-center justify-center bg-black/45 text-white"><Loader2 className="mr-2 h-5 w-5 animate-spin"/>Uploading…</div>}
      </div><p className="mt-2 text-[11px] leading-5 text-muted-foreground">The full artwork keeps its natural portrait or landscape shape. The wide card crop is controlled separately.</p></div>
      <div><div className="mb-2 flex items-center justify-between"><p className="text-xs font-bold">Event-card crop</p><span className="text-[10px] text-muted-foreground">Public Events / member cards</span></div><div ref={cardCropRef} data-testid="event-card-crop" className={`aspect-[16/7] w-full overflow-hidden rounded-xl border bg-secondary/30 relative select-none ${preview?(draggingCard?'cursor-grabbing':'cursor-grab'):''}`} style={{touchAction:'none'}} onPointerDown={startCardDrag} onPointerMove={moveCardDrag} onPointerUp={endCardDrag} onPointerCancel={endCardDrag}>
        {preview ? <img src={preview} alt="Event card crop preview" draggable={false} className="pointer-events-none h-full w-full object-cover" style={{objectPosition:`${cardX}% ${cardY}%`,transform:`scale(${cardZoom})`,transformOrigin:`${cardX}% ${cardY}%`}}/> : <div className="flex h-full flex-col items-center justify-center text-muted-foreground"><FileImage className="h-8 w-8"/><span className="mt-2 text-xs">Wide card preview</span></div>}
        {preview&&<div className="pointer-events-none absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-[10px] font-bold text-white">Drag the poster to choose the part shown on cards</div>}
      </div>{preview&&<p className="mt-2 text-[11px] leading-5 text-muted-foreground"><strong>Drag directly on the crop</strong> to choose the part of the poster players see first, then use Zoom for fine adjustment. The original poster remains untouched.</p>}</div>
    </div>
    <div className="flex flex-wrap gap-2"><button type="button" disabled={uploading} onClick={()=>inputRef.current?.click()} className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-bold"><Upload className="h-4 w-4"/>{preview?'Replace poster':'Upload poster'}</button>{preview&&<><button type="button" onClick={reset} className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-bold"><RotateCcw className="h-4 w-4"/>Reset crops</button><button type="button" onClick={remove} className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-bold"><Trash2 className="h-4 w-4"/>Remove</button><span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 className="h-4 w-4"/>Uploaded</span></>}</div>
    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf" className="hidden" onChange={e=>{handleFile(e.target.files?.[0]);e.target.value=''}}/>
    {preview&&<div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-xl bg-secondary/30 p-3"><p className="mb-2 text-[11px] font-black uppercase tracking-wide text-muted-foreground">Full poster positioning</p><div className="grid gap-3 sm:grid-cols-3"><label className="text-[11px] font-semibold">Left / right<input className="block w-full" type="range" min="0" max="100" value={x} onChange={e=>{const n=Number(e.target.value);setX(n);emit(preview,n,y,zoom,cardX,cardY,cardZoom)}}/></label><label className="text-[11px] font-semibold">Up / down<input className="block w-full" type="range" min="0" max="100" value={y} onChange={e=>{const n=Number(e.target.value);setY(n);emit(preview,x,n,zoom,cardX,cardY,cardZoom)}}/></label><label className="text-[11px] font-semibold">Zoom<input className="block w-full" type="range" min="1" max="2.5" step="0.05" value={zoom} onChange={e=>{const n=Number(e.target.value);setZoom(n);emit(preview,x,y,n,cardX,cardY,cardZoom)}}/></label></div></div>
      <div className="rounded-xl bg-primary/5 p-3"><p className="mb-2 text-[11px] font-black uppercase tracking-wide text-primary">Event-card crop</p><div className="grid gap-3 sm:grid-cols-3"><label className="text-[11px] font-semibold">Left / right<input className="block w-full" type="range" min="0" max="100" value={cardX} onChange={e=>{const n=Number(e.target.value);setCardX(n);emit(preview,x,y,zoom,n,cardY,cardZoom)}}/></label><label className="text-[11px] font-semibold">Up / down<input className="block w-full" type="range" min="0" max="100" value={cardY} onChange={e=>{const n=Number(e.target.value);setCardY(n);emit(preview,x,y,zoom,cardX,n,cardZoom)}}/></label><label className="text-[11px] font-semibold">Zoom<input className="block w-full" type="range" min="1" max="3" step="0.05" value={cardZoom} onChange={e=>{const n=Number(e.target.value);setCardZoom(n);emit(preview,x,y,zoom,cardX,cardY,n)}}/></label></div></div>
    </div>}
  </div>;
}
