import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, FileImage, Loader2, RotateCcw, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function EventMediaEditor({ value = '', position = null, cardPosition = null, onChange }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(value);
  const [uploading, setUploading] = useState(false);
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
      const r = await base44.functions.invoke('secureCreditAction',{action:'upload_image',purpose:'event_poster',file,convert_pdf_preview:okPdf});
      if (r.data?.error) throw new Error(r.data.error);
      const url = r.data?.preview_url || r.data?.file_url;
      if (!url) throw new Error('Upload did not return a poster preview');
      setPreview(url); setX(50); setY(50); setZoom(1); setCardX(50); setCardY(50); setCardZoom(1);
      onChange?.({url,x:50,y:50,zoom:1,cardX:50,cardY:50,cardZoom:1,originalUrl:r.data?.file_url||url,sourceType:okPdf?'pdf':'image'});
      toast.success('Poster uploaded — now check the event-card crop');
    } catch(e) { setPreview(value); toast.error(e.message || 'Poster upload failed'); }
    finally { setUploading(false); }
  };
  const reset=()=>{setX(50);setY(50);setZoom(1);setCardX(50);setCardY(50);setCardZoom(1);emit(preview,50,50,1,50,50,1)};
  const remove=()=>{setPreview('');setX(50);setY(50);setZoom(1);setCardX(50);setCardY(50);setCardZoom(1);onChange?.({url:'',x:50,y:50,zoom:1,cardX:50,cardY:50,cardZoom:1,originalUrl:'',sourceType:''})};

  return <div className="rounded-xl border p-4 space-y-5">
    <div><p className="text-sm font-bold">Event poster / artwork</p><p className="mt-1 text-xs text-muted-foreground">Upload once. RallyHub keeps the full poster and lets you make a separate wide crop for public event cards. JPG, PNG, WEBP or PDF · up to 20 MB.</p></div>
    <div className="grid gap-5 lg:grid-cols-[minmax(0,.75fr)_minmax(0,1.25fr)]">
      <div><div className="mb-2 flex items-center justify-between"><p className="text-xs font-bold">Full artwork</p><span className="text-[10px] text-muted-foreground">Event detail page</span></div><div className="relative mx-auto flex min-h-[260px] w-full max-w-[420px] items-center justify-center overflow-hidden rounded-xl border bg-secondary/30">
        {preview ? <img src={preview} alt="Event poster preview" className="block max-h-[480px] w-full object-contain" style={{objectPosition:`${x}% ${y}%`,transform:`scale(${zoom})`,transformOrigin:`${x}% ${y}%`}}/> : <div className="flex min-h-[360px] w-full flex-col items-center justify-center text-muted-foreground"><FileImage className="h-8 w-8"/><span className="mt-2 text-xs">Poster / artwork preview</span></div>}
        {uploading&&<div className="absolute inset-0 flex items-center justify-center bg-black/45 text-white"><Loader2 className="mr-2 h-5 w-5 animate-spin"/>Uploading…</div>}
      </div><p className="mt-2 text-[11px] leading-5 text-muted-foreground">The full artwork keeps its natural portrait or landscape shape. The wide card crop is controlled separately.</p></div>
      <div><div className="mb-2 flex items-center justify-between"><p className="text-xs font-bold">Event-card crop</p><span className="text-[10px] text-muted-foreground">Public Events / member cards</span></div><div className="aspect-[16/7] w-full overflow-hidden rounded-xl border bg-secondary/30 relative">
        {preview ? <img src={preview} alt="Event card crop preview" className="h-full w-full object-cover" style={{objectPosition:`${cardX}% ${cardY}%`,transform:`scale(${cardZoom})`,transformOrigin:`${cardX}% ${cardY}%`}}/> : <div className="flex h-full flex-col items-center justify-center text-muted-foreground"><FileImage className="h-8 w-8"/><span className="mt-2 text-xs">Wide card preview</span></div>}
        {preview&&<div className="absolute bottom-2 left-2 rounded-md bg-black/65 px-2 py-1 text-[10px] font-bold text-white">This is the snippet players see first</div>}
      </div>{preview&&<p className="mt-2 text-[11px] leading-5 text-muted-foreground">Move and zoom this crop independently. The original poster remains untouched.</p>}</div>
    </div>
    <div className="flex flex-wrap gap-2"><button type="button" disabled={uploading} onClick={()=>inputRef.current?.click()} className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-bold"><Upload className="h-4 w-4"/>{preview?'Replace poster':'Upload poster'}</button>{preview&&<><button type="button" onClick={reset} className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-bold"><RotateCcw className="h-4 w-4"/>Reset crops</button><button type="button" onClick={remove} className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-bold"><Trash2 className="h-4 w-4"/>Remove</button><span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 className="h-4 w-4"/>Uploaded</span></>}</div>
    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf" className="hidden" onChange={e=>{handleFile(e.target.files?.[0]);e.target.value=''}}/>
    {preview&&<div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-xl bg-secondary/30 p-3"><p className="mb-2 text-[11px] font-black uppercase tracking-wide text-muted-foreground">Full poster positioning</p><div className="grid gap-3 sm:grid-cols-3"><label className="text-[11px] font-semibold">Left / right<input className="block w-full" type="range" min="0" max="100" value={x} onChange={e=>{const n=Number(e.target.value);setX(n);emit(preview,n,y,zoom,cardX,cardY,cardZoom)}}/></label><label className="text-[11px] font-semibold">Up / down<input className="block w-full" type="range" min="0" max="100" value={y} onChange={e=>{const n=Number(e.target.value);setY(n);emit(preview,x,n,zoom,cardX,cardY,cardZoom)}}/></label><label className="text-[11px] font-semibold">Zoom<input className="block w-full" type="range" min="1" max="2.5" step="0.05" value={zoom} onChange={e=>{const n=Number(e.target.value);setZoom(n);emit(preview,x,y,n,cardX,cardY,cardZoom)}}/></label></div></div>
      <div className="rounded-xl bg-primary/5 p-3"><p className="mb-2 text-[11px] font-black uppercase tracking-wide text-primary">Event-card crop</p><div className="grid gap-3 sm:grid-cols-3"><label className="text-[11px] font-semibold">Left / right<input className="block w-full" type="range" min="0" max="100" value={cardX} onChange={e=>{const n=Number(e.target.value);setCardX(n);emit(preview,x,y,zoom,n,cardY,cardZoom)}}/></label><label className="text-[11px] font-semibold">Up / down<input className="block w-full" type="range" min="0" max="100" value={cardY} onChange={e=>{const n=Number(e.target.value);setCardY(n);emit(preview,x,y,zoom,cardX,n,cardZoom)}}/></label><label className="text-[11px] font-semibold">Zoom<input className="block w-full" type="range" min="1" max="3" step="0.05" value={cardZoom} onChange={e=>{const n=Number(e.target.value);setCardZoom(n);emit(preview,x,y,zoom,cardX,cardY,n)}}/></label></div></div>
    </div>}
  </div>;
}
