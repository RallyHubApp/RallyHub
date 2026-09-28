import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, FileImage, Loader2, RotateCcw, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function EventMediaEditor({ value = '', position = null, onChange }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [x, setX] = useState(Number(position?.x ?? 50));
  const [y, setY] = useState(Number(position?.y ?? 50));
  const [zoom, setZoom] = useState(Number(position?.zoom ?? 1));
  useEffect(()=>setPreview(value),[value]);

  const emit = (url=preview, nx=x, ny=y, nz=zoom) => onChange?.({ url, x:nx, y:ny, zoom:nz });
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
      setPreview(url); setX(50); setY(50); setZoom(1); onChange?.({url,x:50,y:50,zoom:1,originalUrl:r.data?.file_url||url,sourceType:okPdf?'pdf':'image'});
      toast.success('Poster uploaded');
    } catch(e) { setPreview(value); toast.error(e.message || 'Poster upload failed'); }
    finally { setUploading(false); }
  };
  const reset=()=>{setX(50);setY(50);setZoom(1);emit(preview,50,50,1)};
  const remove=()=>{setPreview('');setX(50);setY(50);setZoom(1);onChange?.({url:'',x:50,y:50,zoom:1,originalUrl:'',sourceType:''})};
  return <div className="rounded-xl border p-4 space-y-4">
    <div><p className="text-sm font-bold">Event poster / artwork</p><p className="mt-1 text-xs text-muted-foreground">JPG, PNG, WEBP or PDF · up to 20 MB. Portrait A-series artwork is shown in its natural poster shape.</p></div>
    <div className="mx-auto aspect-[1/1.4142] w-full max-w-[360px] overflow-hidden rounded-xl border bg-secondary/30 relative">
      {preview ? <img src={preview} alt="Event poster preview" className="h-full w-full object-cover" style={{objectPosition:`${x}% ${y}%`,transform:`scale(${zoom})`,transformOrigin:`${x}% ${y}%`}}/> : <div className="flex h-full flex-col items-center justify-center text-muted-foreground"><FileImage className="h-8 w-8"/><span className="mt-2 text-xs">Poster preview</span></div>}
      {uploading&&<div className="absolute inset-0 flex items-center justify-center bg-black/45 text-white"><Loader2 className="mr-2 h-5 w-5 animate-spin"/>Uploading…</div>}
    </div>
    <div className="flex flex-wrap gap-2"><button type="button" disabled={uploading} onClick={()=>inputRef.current?.click()} className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-bold"><Upload className="h-4 w-4"/>{preview?'Replace poster':'Upload poster'}</button>{preview&&<><button type="button" onClick={reset} className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-bold"><RotateCcw className="h-4 w-4"/>Reset</button><button type="button" onClick={remove} className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-bold"><Trash2 className="h-4 w-4"/>Remove</button><span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 className="h-4 w-4"/>Uploaded</span></>}</div>
    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf" className="hidden" onChange={e=>{handleFile(e.target.files?.[0]);e.target.value=''}}/>
    {preview&&<div className="grid gap-3 sm:grid-cols-3"><label className="text-[11px] font-semibold">Left / right<input className="block w-full" type="range" min="0" max="100" value={x} onChange={e=>{const n=Number(e.target.value);setX(n);emit(preview,n,y,zoom)}}/></label><label className="text-[11px] font-semibold">Up / down<input className="block w-full" type="range" min="0" max="100" value={y} onChange={e=>{const n=Number(e.target.value);setY(n);emit(preview,x,n,zoom)}}/></label><label className="text-[11px] font-semibold">Zoom<input className="block w-full" type="range" min="1" max="2.5" step="0.05" value={zoom} onChange={e=>{const n=Number(e.target.value);setZoom(n);emit(preview,x,y,n)}}/></label></div>}
  </div>;
}
