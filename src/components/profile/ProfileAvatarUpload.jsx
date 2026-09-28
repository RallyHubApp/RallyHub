import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Camera, Loader2, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileAvatarUpload({ currentUrl, initials, onUploaded, position = null, onPositionSaved }) {
  const [uploading, setUploading] = useState(false);
  const [savingPosition, setSavingPosition] = useState(false);
  const [preview, setPreview] = useState(currentUrl);
  const [adjusting, setAdjusting] = useState(false);
  const [positionX, setPositionX] = useState(Number(position?.positionX ?? 50));
  const [positionY, setPositionY] = useState(Number(position?.positionY ?? 50));
  const [zoom, setZoom] = useState(Number(position?.zoom ?? 1));
  const inputRef = useRef(null);

  useEffect(() => {
    setPreview(currentUrl);
  }, [currentUrl]);

  useEffect(() => {
    setPositionX(Number(position?.positionX ?? 50));
    setPositionY(Number(position?.positionY ?? 50));
    setZoom(Number(position?.zoom ?? 1));
  }, [position?.positionX, position?.positionY, position?.zoom]);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    setUploading(true);
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    try {
      const uploadRes = await base44.functions.invoke('secureCreditAction', { action: 'upload_image', purpose: 'profile_avatar', file });
      if (uploadRes.data?.error) throw new Error(uploadRes.data.error);
      const fileUrl = uploadRes.data?.file_url;
      if (!fileUrl) throw new Error('No file URL returned');
      setPreview(fileUrl);
      await onUploaded?.(fileUrl, { positionX, positionY, zoom });
    } catch (error) {
      setPreview(currentUrl);
      toast.error(error?.message || 'Could not upload avatar');
    }
    setUploading(false);
  };

  const savePosition = async () => {
    if (!onPositionSaved || savingPosition) return;
    setSavingPosition(true);
    try {
      await onPositionSaved({ positionX, positionY, zoom });
      setAdjusting(false);
    } catch (error) {
      toast.error(error?.message || 'Could not save photo position');
    } finally {
      setSavingPosition(false);
    }
  };

  const imageStyle = {
    objectPosition: `${positionX}% ${positionY}%`,
    transform: `scale(${zoom})`,
    transformOrigin: `${positionX}% ${positionY}%`,
  };

  return (
    <div className="shrink-0">
      <div className="relative group w-20 h-20">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center overflow-hidden">
          {(preview || currentUrl) ? (
            <img src={preview || currentUrl} alt="" className="w-full h-full object-cover transition-transform" style={imageStyle} />
          ) : (
            <span className="text-2xl font-bold text-primary">{initials}</span>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
          aria-label="Change profile photo"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>
        {(preview || currentUrl) && (
          <button
            type="button"
            onClick={() => setAdjusting(value => !value)}
            className="absolute -bottom-1 -left-1 w-7 h-7 rounded-full bg-secondary text-foreground border border-border flex items-center justify-center shadow-lg"
            aria-label="Adjust profile photo"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
      </div>

      {adjusting && (preview || currentUrl) && (
        <div className="mt-3 w-64 rounded-xl border border-border bg-background p-3 shadow-lg space-y-3">
          <div>
            <div className="flex justify-between text-[11px] text-muted-foreground"><span>Left / right</span><span>{Math.round(positionX)}%</span></div>
            <input type="range" min="0" max="100" step="1" value={positionX} onChange={e => setPositionX(Number(e.target.value))} className="w-full accent-current" />
          </div>
          <div>
            <div className="flex justify-between text-[11px] text-muted-foreground"><span>Up / down</span><span>{Math.round(positionY)}%</span></div>
            <input type="range" min="0" max="100" step="1" value={positionY} onChange={e => setPositionY(Number(e.target.value))} className="w-full accent-current" />
          </div>
          <div>
            <div className="flex justify-between text-[11px] text-muted-foreground"><span>Zoom</span><span>{zoom.toFixed(2)}×</span></div>
            <input type="range" min="1" max="2.5" step="0.05" value={zoom} onChange={e => setZoom(Number(e.target.value))} className="w-full accent-current" />
          </div>
          <div className="flex gap-2">
            <button type="button" className="h-8 px-3 rounded-lg border border-border text-xs font-semibold" onClick={() => { setPositionX(50); setPositionY(50); setZoom(1); }}>Reset</button>
            <button type="button" className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold" onClick={savePosition} disabled={savingPosition}>{savingPosition ? 'Saving…' : 'Save position'}</button>
          </div>
        </div>
      )}
    </div>
  );
}